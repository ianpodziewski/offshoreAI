// @ts-nocheck /* This disables TypeScript type checking for this file due to complex template literals */
import { v4 as uuidv4 } from 'uuid';
import { 
  LoanDocument, 
  DocumentStatus, 
  DocumentCategory,
  createDocument,
  getRequiredDocuments,
  getAllDocumentTypes,
  DOCUMENT_STRUCTURE
} from './loanDocumentStructure';
import { loanDatabase } from './loanDatabase';
import { LoanData } from './loanGenerator';
import { getDocumentTemplate } from './templates/documentTemplateStrings';
import { simpleDocumentService } from './simplifiedDocumentService';
import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { serverRedisUtil } from '@/lib/redis-server';
import storageService from '@/services/storageService';
import { STORAGE_CONFIG, isRedisConfigured } from '@/configuration/storageConfig';

// Constants for storage keys
const LOAN_DOCUMENTS_STORAGE_KEY = 'loan_documents';

// Document statuses for fake documents (excluding 'required' since we want to show uploaded docs)
const FAKE_DOCUMENT_STATUSES: DocumentStatus[] = ['pending', 'approved', 'received', 'reviewed'];

// Document file types - Changed to only use HTML to avoid creating PDFs
const FILE_TYPES = ['.html'];

// Maximum characters that can be safely sent to the embeddings API
const MAX_EMBEDDING_CHARS = 8000;

// Prefix for loan document embeddings to group them separately
const LOAN_DOCUMENTS_PREFIX = 'loan-docs';

// Chunk size (characters) for splitting large documents
const CHUNK_SIZE = 3500;
const CHUNK_OVERLAP = 500;

// Function to generate a random file size between 100KB and 10MB
const getRandomFileSize = (): number => {
  return Math.floor(Math.random() * 9900000) + 100000; // 100KB to 10MB
};

// Function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Generate fake document content
const generateDocumentContent = (docType: string, loan: LoanData): string => {
  // First check if the loan object is valid
  if (!loan) {
    console.error(`Cannot generate document content: loan data is undefined`);
    return `<html><body><h1>Error: Missing Loan Data</h1><p>The loan data required to generate this document is unavailable.</p></body></html>`;
  }

  // Ensure borrowerName is set to prevent errors in templates
  const safeLoan = {
    ...loan,
    borrowerName: loan.borrowerName || 'Borrower Name Not Available',
    propertyAddress: loan.propertyAddress || 'Property Address Not Available',
    loanAmount: loan.loanAmount || 0,
    loanTerm: loan.loanTerm || 0,
    interestRate: loan.interestRate || 0,
    loanType: loan.loanType || 'unknown'
  };

  try {
    // Call getDocumentTemplate with both required parameters
    const template = getDocumentTemplate(docType, safeLoan);
    if (!template) return '';
    
    // The template already has the loan data injected, so we can return it directly
    return template;
  } catch (error) {
    console.error(`Error generating document content for ${docType}:`, error);
    return `<html><body><h1>Error Generating Document</h1><p>There was an error generating the ${docType} document.</p></body></html>`;
  }
};

// Helper function to check if localStorage is almost full
// Returns true if we have less than 10% space remaining
const isLocalStorageFull = (): boolean => {
  try {
    const maxSize = 5 * 1024 * 1024; // Estimate: 5MB max for most browsers
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      totalSize += (key?.length || 0) + (value?.length || 0);
    }
    
    const percentUsed = (totalSize / maxSize) * 100;
    return percentUsed > 90; // More than 90% used
  } catch (error) {
    console.error('Error checking localStorage capacity:', error);
    return true; // Assume full to be safe
  }
};

// Batch size for generating fake documents
const BATCH_SIZE = 5;

// Helper function to deduplicate documents by docType
const deduplicateDocuments = (documents: LoanDocument[]): LoanDocument[] => {
  // Group documents by loanId and docType
  const docGroups: Record<string, LoanDocument[]> = {};
  
  // Group documents 
  documents.forEach(doc => {
    const key = `${doc.loanId}_${doc.docType}`;
    if (!docGroups[key]) {
      docGroups[key] = [];
    }
    docGroups[key].push(doc);
  });
  
  // For each group, keep only the most recent document
  const dedupedDocs: LoanDocument[] = [];
  
  Object.values(docGroups).forEach(group => {
    if (group.length > 1) {
      // Sort by dateUploaded (newest first)
      group.sort((a, b) => new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime());
      // Keep only the newest document
      dedupedDocs.push(group[0]);
      console.log(`Deduplicated document type ${group[0].docType} - kept 1 of ${group.length} documents`);
    } else {
      // Only one document, just add it
      dedupedDocs.push(group[0]);
    }
  });
  
  return dedupedDocs;
};

// Check if Redis is available for server-side operations
const isRedisAvailable = () => {
  // Check if we're in a server-side context
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser) {
    // In browser context, we can't directly check Redis
    // So we'll check if the Redis API endpoint is available
    console.log("Browser environment detected, can't directly check Redis");
    
    // Make a request to check Redis status
    // This is async but we'll handle this separately
    fetch('/api/redis-status')
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Redis status check failed');
      })
      .then(data => {
        console.log('Redis status check:', data);
        // This is just for logging - the actual call will still use the API
      })
      .catch(err => {
        console.warn('Error checking Redis status:', err);
      });
      
    // In the browser, we'll use the API endpoint for Redis operations
    return true; // Return true to allow the API call
  }
  
  // Server-side check
  return isRedisConfigured();
};

// Helper function to save a document to Redis
const saveDocumentToRedis = async (document: LoanDocument): Promise<boolean> => {
  try {
    if (!isRedisAvailable()) {
      console.log('Redis not available for document storage');
      return false;
    }
    
    console.log(`Attempting to save document ${document.id} to Redis for loan ${document.loanId}`);
    
    // Convert document to SimpleDocument format
    const simpleDoc = {
      id: document.id,
      loanId: document.loanId,
      filename: document.filename,
      fileType: document.fileType || 'text/html',
      fileSize: document.fileSize || 0,
      dateUploaded: document.dateUploaded,
      category: document.category,
      section: document.section,
      subsection: document.subsection,
      docType: document.docType,
      content: document.content || '',
      status: document.status,
      version: document.version || 1,
      notes: document.notes || ''
    };
    
    // Save to Redis directly using serverRedisUtil when in server environment
    if (typeof window === 'undefined') {
      // Server-side Redis saving
      try {
        // 1. Store the document
        await serverRedisUtil.set(`doc:${document.id}`, JSON.stringify(simpleDoc));
        
        // 2. Add the document ID to the loan's document set
        await serverRedisUtil.sadd(`docs_by_loan:${document.loanId}`, document.id);
        
        // 3. Add to the global document list
        await serverRedisUtil.sadd('document_list', document.id);
        
        console.log(`Successfully saved document to Redis: ${document.id} for loan ${document.loanId}`);
        return true;
      } catch (serverRedisError) {
        console.error('Error using serverRedisUtil to save document:', serverRedisError);
        return false;
      }
    } else {
      // Client-side Redis saving via storageService
      try {
        await storageService.saveDocument(simpleDoc);
        console.log(`Successfully saved document to Redis via storageService: ${document.id} for loan ${document.loanId}`);
        
        // Call the API to ensure the document is indexed for the chatbot
        try {
          await fetch('/api/loan-documents/index-docs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ loanId: document.loanId }),
          });
        } catch (apiError) {
          console.warn('Non-critical error calling indexing API:', apiError);
        }
        
        return true;
      } catch (storageError) {
        console.error('Error saving document via storageService:', storageError);
        return false;
      }
    }
  } catch (error) {
    console.error('Error saving document to Redis:', error);
    return false;
  }
};

// Document service for managing loan documents
export const loanDocumentService = {
  // Get all documents
  getAllDocuments: (): LoanDocument[] => {
    const docsJson = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
    const documents = docsJson ? JSON.parse(docsJson) : [];
    
    // Deduplicate documents to prevent duplicate display issues
    const dedupedDocs = deduplicateDocuments(documents);
    
    // If we actually removed duplicates, save the deduplicated list back to storage
    if (dedupedDocs.length < documents.length) {
      console.log(`Removed ${documents.length - dedupedDocs.length} duplicate documents during getAllDocuments`);
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(dedupedDocs));
    }
    
    return dedupedDocs;
  },
  
  // Get documents for a specific loan
  getDocumentsForLoan: (loanId: string): LoanDocument[] => {
    const allDocs = loanDocumentService.getAllDocuments();
    return allDocs.filter(doc => doc.loanId === loanId);
  },
  
  // Get documents for a specific loan by category
  getDocumentsByCategory: (loanId: string, category: DocumentCategory): LoanDocument[] => {
    const loanDocs = loanDocumentService.getDocumentsForLoan(loanId);
    return loanDocs.filter(doc => doc.category === category);
  },
  
  // Get documents for a specific loan by section
  getDocumentsBySection: (loanId: string, section: string): LoanDocument[] => {
    const loanDocs = loanDocumentService.getDocumentsForLoan(loanId);
    return loanDocs.filter(doc => doc.section === section);
  },
  
  // Get document by ID
  getDocumentById: (docId: string): LoanDocument | null => {
    const allDocs = loanDocumentService.getAllDocuments();
    return allDocs.find(doc => doc.id === docId) || null;
  },
  
  // Add a document
  addDocument: (document: LoanDocument): LoanDocument => {
    const allDocs = loanDocumentService.getAllDocuments();
    
    // Remove any existing documents with the same loanId and docType
    const filteredDocs = allDocs.filter(doc => !(doc.loanId === document.loanId && doc.docType === document.docType));
    
    // If we filtered out documents, log it
    if (filteredDocs.length < allDocs.length) {
      console.log(`Removed ${allDocs.length - filteredDocs.length} existing documents with docType ${document.docType} before adding new one`);
    }
    
    // Add the new document
    filteredDocs.push(document);
    localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(filteredDocs));
    
    // Also try to save the document to Redis for the chatbot to use
    saveDocumentToRedis(document).catch(err => {
      console.error('Failed to save document to Redis:', err);
    });
    
    return document;
  },
  
  // Update a document
  updateDocument: async (documentId: string, updates: Partial<LoanDocument>): Promise<LoanDocument | null> => {
    const allDocs = loanDocumentService.getAllDocuments();
    const docIndex = allDocs.findIndex(doc => doc.id === documentId);
    
    if (docIndex === -1) return null;
    
    allDocs[docIndex] = { ...allDocs[docIndex], ...updates };
    localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocs));
    
    return allDocs[docIndex];
  },
  
  // Delete a document
  deleteDocument: (documentId: string): boolean => {
    const allDocs = loanDocumentService.getAllDocuments();
    const filteredDocs = allDocs.filter(doc => doc.id !== documentId);
    
    if (filteredDocs.length === allDocs.length) return false;
    
    localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(filteredDocs));
    return true;
  },
  
  // Update document status
  updateDocumentStatus: async (docId: string, status: DocumentStatus): Promise<LoanDocument | null> => {
    return loanDocumentService.updateDocument(docId, { status });
  },
  
  // Get missing required documents for a loan
  getMissingRequiredDocuments: (loanId: string, loanType: string): LoanDocument[] => {
    try {
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Get existing documents for this loan
      const existingDocs = loanDocumentService.getDocumentsForLoan(loanId);
      
      // Get existing document types
      const existingDocTypes = existingDocs.map(doc => doc.docType);
      
      // Filter out document types that already exist
      const missingDocTypes = requiredDocTypes.filter(doc => !existingDocTypes.includes(doc.docType));
      
      // Create placeholder documents for each missing type
      return missingDocTypes.map(docType => ({
        id: uuidv4(),
        loanId,
        filename: `SAMPLE_${docType.label}.html`,
        dateUploaded: new Date().toISOString(),
        category: docType.category,
        section: docType.section,
        subsection: docType.subsection,
        docType: docType.docType,
        status: 'required' as DocumentStatus,
        isRequired: true,
        version: 1
      }));
    } catch (error) {
      console.error('Error getting missing required documents:', error);
      return [];
    }
  },
  
  // Initialize documents for a new loan
  initializeDocumentsForLoan: (loanId: string, loanType: string): LoanDocument[] => {
    try {
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Create placeholder documents for each required type
      const placeholderDocs = requiredDocTypes.map(docType => ({
        id: uuidv4(),
        loanId,
        filename: `SAMPLE_${docType.label}.html`,
        dateUploaded: new Date().toISOString(),
        category: docType.category,
        section: docType.section,
        subsection: docType.subsection,
        docType: docType.docType,
        status: 'required' as DocumentStatus,
        isRequired: true,
        version: 1
      }));
      
      // Get existing documents from storage
      const existingDocs = loanDocumentService.getAllDocuments();
      
      // Filter out any documents that already exist for this loan
      const uniqueDocs = placeholderDocs.filter(newDoc => 
        !existingDocs.some(existingDoc => 
          existingDoc.loanId === loanId && 
          existingDoc.docType === newDoc.docType
        )
      );
      
      // Save the combined documents
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify([...existingDocs, ...uniqueDocs]));
      
      return uniqueDocs;
    } catch (error) {
      console.error('Error initializing documents for loan:', error);
      return [];
    }
  },
  
  // Get document completion status for a loan
  getDocumentCompletionStatus: (loanId: string, loanType: string): {
    total: number;
    completed: number;
    percentage: number;
    byCategory: Record<DocumentCategory, { total: number; completed: number; percentage: number }>;
  } => {
    try {
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Get existing documents for this loan
      const existingDocs = loanDocumentService.getDocumentsForLoan(loanId);
      
      // Count total required document types (sockets)
      const total = requiredDocTypes.length;
      
      // Get unique docTypes that have at least one document (status not 'required')
      // This counts each document socket only once, regardless of how many documents it contains
      const uniqueCompletedDocTypes = new Set(
        existingDocs
          .filter(doc => doc.status !== 'required')
          .map(doc => doc.docType)
      );
      
      // Count completed document sockets (those with at least one document)
      const completed = [...uniqueCompletedDocTypes].filter(docType => 
        requiredDocTypes.some(rt => rt.docType === docType)
      ).length;
      
      // Calculate completion percentage
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Calculate completion by category
      const byCategory: Record<DocumentCategory, { total: number; completed: number; percentage: number }> = {} as any;
      
      // Initialize categories
      const categories: DocumentCategory[] = ['borrower', 'property', 'closing', 'servicing', 'misc'];
      categories.forEach(category => {
        const categoryRequiredDocs = requiredDocTypes.filter(doc => doc.category === category);
        const categoryTotal = categoryRequiredDocs.length;
        
        // Get unique docTypes in this category that have at least one document
        const categoryCompletedDocTypes = new Set(
          existingDocs
            .filter(doc => doc.category === category && doc.status !== 'required')
            .map(doc => doc.docType)
        );
        
        // Count document sockets that have at least one document
        const categoryCompleted = [...categoryCompletedDocTypes].filter(docType => 
          categoryRequiredDocs.some(rt => rt.docType === docType)
        ).length;
        
        const categoryPercentage = categoryTotal > 0 ? Math.round((categoryCompleted / categoryTotal) * 100) : 0;
        
        byCategory[category] = {
          total: categoryTotal,
          completed: categoryCompleted,
          percentage: categoryPercentage
        };
      });
      
      return {
        total,
        completed,
        percentage,
        byCategory
      };
    } catch (error) {
      console.error('Error getting document completion status:', error);
      return {
        total: 0,
        completed: 0,
        percentage: 0,
        byCategory: {
          borrower: { total: 0, completed: 0, percentage: 0 },
          property: { total: 0, completed: 0, percentage: 0 },
          closing: { total: 0, completed: 0, percentage: 0 },
          servicing: { total: 0, completed: 0, percentage: 0 },
          misc: { total: 0, completed: 0, percentage: 0 }
        }
      };
    }
  },
  
  // Generate fake documents for a loan
  generateFakeDocuments: async (loanId: string, loanType: string): Promise<LoanDocument[]> => {
    try {
      console.log(`Generating fake documents for loan ${loanId} (type: ${loanType})`);
      
      // Check if localStorage is getting full - if so, use simpleDocumentService instead
      if (isLocalStorageFull()) {
        console.log('localStorage is close to full, using simpleDocumentService instead');
        return await loanDocumentService.generateFakeDocumentsUsingSimpleService(loanId, loanType);
      }
      
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Get existing documents for this loan
      const existingDocs = loanDocumentService.getDocumentsForLoan(loanId);
      
      // Create fake documents for each required type
      const fakeDocuments: LoanDocument[] = [];
      
      // Fetch loan data
      const loanData = loanDatabase.getLoanById(loanId);
      if (!loanData) {
        console.error(`Loan data not found for loanId: ${loanId}`);
        return [];
      }
      
      // Generate a random date within the last 30 days
      const getRandomDate = (): string => {
        const now = new Date();
        const daysAgo = Math.floor(Math.random() * 30);
        const randomDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        return randomDate.toISOString();
      };
      
      // Generate a random status with bias towards 'approved' and 'received'
      const getRandomStatus = (): DocumentStatus => {
        const rand = Math.random();
        if (rand < 0.4) return 'approved';
        if (rand < 0.7) return 'received';
        if (rand < 0.85) return 'reviewed';
        return 'pending';
      };
      
      // Generate a random file type
      const getRandomFileType = (): string => {
        return FILE_TYPES[Math.floor(Math.random() * FILE_TYPES.length)];
      };
      
      // Generate fake documents in batches to avoid memory issues
      console.log(`Need to generate ${requiredDocTypes.length} document types`);
      
      // First collect all existing document IDs to delete them properly
      const existingDocIds = existingDocs.map(doc => doc.id);
      console.log(`Found ${existingDocIds.length} existing documents to remove before generating new ones`);

      // Delete existing documents before generating new ones to prevent duplicates
      for (const docId of existingDocIds) {
        loanDocumentService.deleteDocument(docId);
      }
      
      // Generate new documents after deleting existing ones
      console.log(`Deleted existing documents, now generating ${requiredDocTypes.length} new documents`);
      
      // Process in small batches
      for (let i = 0; i < requiredDocTypes.length; i += BATCH_SIZE) {
        const batch = requiredDocTypes.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${i/BATCH_SIZE + 1} (${batch.length} docs)`);
        
        // Process each doc type in this batch
        for (const docType of batch) {
          // Generate random document attributes
          const fileType = getRandomFileType();
          const fileSize = getRandomFileSize();
          const uploadDate = getRandomDate();
          const status = getRandomStatus();
          
          // Generate a filename
          const filename = `${docType.docType.replace(/_/g, '-')}${fileType}`;
          
          // Generate document content based on the document type
          const content = generateDocumentContent(docType.docType, loanData);
          
          // Create the fake document
          const fakeDocument: LoanDocument = {
            id: uuidv4(),
            loanId,
            filename,
            fileType,
            fileSize,
            dateUploaded: uploadDate,
            category: docType.category,
            section: docType.section,
            subsection: docType.subsection,
            docType: docType.docType,
            status,
            isRequired: true,
            version: 1,
            content, // Add the generated content
            notes: `This is a sample document for ${loanData.borrowerName} with loan amount ${loanData.loanAmount} for the property at ${loanData.propertyAddress}. Status: ${status === 'approved' ? 'Document verified and approved.' : 
                   status === 'rejected' ? 'Document rejected. Please resubmit.' : 
                   status === 'reviewed' ? 'Document reviewed, pending approval.' : 
                   'Document uploaded, awaiting review.'}`
          };
          
          // Add expiration date for certain document types
          if (['insurance_policy', 'appraisal_report', 'credit_report', 'background_check'].includes(docType.docType)) {
            const expirationDate = new Date();
            expirationDate.setFullYear(expirationDate.getFullYear() + 1);
            fakeDocument.expirationDate = expirationDate.toISOString();
          }
          
          // Add to the list of fake documents
          fakeDocuments.push(fakeDocument);
          
          // Save to localStorage
          const allExistingDocs = loanDocumentService.getAllDocuments();
          allExistingDocs.push(fakeDocument);
          localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allExistingDocs));
          
          // Save to Redis for the chatbot
          await saveDocumentToRedis(fakeDocument);
          
          // Index document content for searching
          await loanDocumentService.indexDocumentContent(fakeDocument);
        }
      }
      
      console.log(`Generated and stored ${fakeDocuments.length} fake documents for loan ${loanId}`);
      
      return fakeDocuments;
    } catch (error) {
      console.error(`Error generating fake documents for loan ${loanId}:`, error);
      return [];
    }
  },
  
  // Generate fake documents using simpleDocumentService (which uses IndexedDB for content)
  generateFakeDocumentsUsingSimpleService: async (loanId: string, loanType: string, existingFakeDocs: LoanDocument[] = []): Promise<LoanDocument[]> => {
    try {
      console.log('Generating fake documents using simpleDocumentService with IndexedDB');
      
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Get existing documents for this loan (from simpleDocumentService)
      const existingSimpleDocs = simpleDocumentService.getDocumentsForLoan(loanId);
      
      // Clear existing documents to ensure fresh generation
      console.log(`Clearing ${existingSimpleDocs.length} existing documents before generating new ones`);
      for (const doc of existingSimpleDocs) {
        await simpleDocumentService.deleteDocument(doc.id);
      }
      
      // Fetch loan data
      const loanData = loanDatabase.getLoanById(loanId);
      if (!loanData) {
        console.error(`Loan data not found for loanId: ${loanId}`);
        return existingFakeDocs;
      }
      
      // Track the documents we create
      const generatedDocs: LoanDocument[] = [...existingFakeDocs];
      
      // Process in small batches
      for (let i = 0; i < requiredDocTypes.length; i += BATCH_SIZE) {
        const batch = requiredDocTypes.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${i/BATCH_SIZE + 1} (${batch.length} docs) with simpleDocumentService`);
        
        // Process each doc type in this batch
        for (const docType of batch) {
          // Generate random document attributes
          const fileType = '.html'; // Use HTML for all docs in simpleDocumentService
          const uploadDate = new Date().toISOString();
          const status = 'pending';
          
          // Generate a filename
          const filename = `${docType.docType.replace(/_/g, '-')}${fileType}`;
          
          // Generate document content based on the document type
          const content = generateDocumentContent(docType.docType, loanData);
          
          // Create a unique ID with timestamp to ensure uniqueness
          const docId = uuidv4();
          
          // Create the document in simpleDocumentService
          try {
            const simpleDoc = await simpleDocumentService.addDocumentDirectly({
              id: docId,
              loanId,
              filename,
              fileType: 'text/html',
              dateUploaded: uploadDate,
              category: docType.category as any,
              docType: docType.docType,
              status: status as any,
              content,
              section: docType.section,
              subsection: docType.subsection
            });
            
            console.log(`Added document to simpleDocumentService: ${filename} (ID: ${docId})`);
            
            // Add to our tracking array
            generatedDocs.push({
              id: docId,
              loanId,
              filename,
              fileType: 'text/html',
              dateUploaded: uploadDate,
              category: docType.category,
              section: docType.section,
              subsection: docType.subsection,
              docType: docType.docType,
              status,
              isRequired: true,
              version: 1,
              content
            });
          } catch (error) {
            console.error(`Error adding document to simpleDocumentService: ${filename}`, error);
          }
        }
      }
      
      return generatedDocs;
    } catch (error) {
      console.error('Error generating fake documents using simpleDocumentService:', error);
      return existingFakeDocs;
    }
  },
  
  // Generate fake documents for all loans
  generateFakeDocumentsForAllLoans: async (): Promise<number> => {
    try {
      // Get all loans from the database
      const loans = loanDatabase.getLoans();
      let totalDocumentsGenerated = 0;
      
      // Generate fake documents for each loan
      for (const loan of loans) {
        const fakeDocuments = await loanDocumentService.generateFakeDocuments(loan.id, loan.loanType);
        totalDocumentsGenerated += fakeDocuments.length;
      }
      
      return totalDocumentsGenerated;
    } catch (error) {
      console.error('Error generating fake documents for all loans:', error);
      return 0;
    }
  },
  
  // Clear all documents (for testing and reset)
  clearAllDocuments: (): void => {
    localStorage.removeItem(LOAN_DOCUMENTS_STORAGE_KEY);
  },

  // Deduplicate documents for a specific loan
  deduplicateLoanDocuments: (loanId: string): LoanDocument[] => {
    try {
      console.log(`Deduplicating documents for loan ${loanId}`);
      
      // Get all documents
      const allDocs = loanDocumentService.getAllDocuments();
      
      // Split into current loan docs and other loan docs
      const loanDocs = allDocs.filter(doc => doc.loanId === loanId);
      const otherDocs = allDocs.filter(doc => doc.loanId !== loanId);
      
      // Deduplicate the loan documents
      const dedupedLoanDocs = deduplicateDocuments(loanDocs);
      
      // Combine and save back to storage
      const allUpdatedDocs = [...otherDocs, ...dedupedLoanDocs];
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allUpdatedDocs));
      
      console.log(`Deduplication complete. Removed ${loanDocs.length - dedupedLoanDocs.length} duplicate documents.`);
      return dedupedLoanDocs;
    } catch (error) {
      console.error('Error deduplicating loan documents:', error);
      return [];
    }
  },
  
  // Index document content for searching
  indexDocumentContent: async (document: LoanDocument): Promise<boolean> => {
    try {
      // Only proceed if the document has content
      if (!document.content) {
        console.log(`Document ${document.id} has no content to index`);
        return false;
      }
      
      // Convert to SimpleDocument format
      const simpleDoc = {
        id: document.id,
        loanId: document.loanId,
        filename: document.filename,
        fileType: document.fileType || 'text/html',
        fileSize: document.fileSize || 0,
        dateUploaded: document.dateUploaded,
        category: document.category,
        section: document.section,
        subsection: document.subsection,
        docType: document.docType,
        content: document.content,
        status: document.status,
        version: document.version || 1,
        notes: document.notes || ''
      };
      
      // Check if running in browser or server
      const isServerSide = typeof window === 'undefined';
      
      if (isServerSide) {
        // If server-side, we can index directly using the indexDocumentsForLoan function
        try {
          const result = await indexDocumentsForLoan(document.loanId, [simpleDoc]);
          return result.indexedCount > 0;
        } catch (error) {
          console.warn(`Server-side indexing failed, but document was still saved: ${error}`);
          return true; // Return true since document was saved, even if indexing failed
        }
      } else {
        // If client-side, we'll make an API call to trigger the indexing
        try {
          // Use fetch to call the indexing API
          const response = await fetch('/api/loan-documents/index-docs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ loanId: document.loanId }),
          });
          
          if (response.ok) {
            console.log('Document indexing result:', await response.json());
            return true;
          } else if (response.status === 404) {
            // API not found - this is likely due to the API route not being registered
            // We can continue without indexing and still consider the save successful
            console.warn('Document indexing API not found (404) - document saved but not indexed');
            return true;
          } else {
            console.warn(`Document indexing API responded with status ${response.status} - document saved but not indexed`);
            return true; // Still return true as the document was saved
          }
        } catch (apiError) {
          // Network error or other fetch issue
          console.warn('Error calling indexing API, but document was still saved:', apiError);
          return true; // Still return true as the document was saved
        }
      }
    } catch (error) {
      console.error(`Error indexing document ${document.id}:`, error);
      return false;
    }
  }
}; 

// Run deduplication on all loans when this module loads
if (typeof window !== 'undefined') {
  // Set a timeout to allow the app to load first
  setTimeout(() => {
    try {
      // Get unique loan IDs from documents
      const allDocs = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
      if (allDocs) {
        const documents = JSON.parse(allDocs);
        const loanIds = new Set(documents.map((doc: LoanDocument) => doc.loanId));
        
        console.log(`Running initial deduplication for ${loanIds.size} loans...`);
        
        // Deduplicate each loan's documents
        loanIds.forEach((loanId: string) => {
          loanDocumentService.deduplicateLoanDocuments(loanId);
        });
      }
    } catch (error) {
      console.error('Error during initial document deduplication:', error);
    }
  }, 2000);
} 

/**
 * Extracts plain text from HTML content
 */
function extractTextFromHtml(htmlContent: string): string {
  try {
    // Simple HTML tag removal - for more complex HTML, consider using a proper HTML parser
    let text = htmlContent
      .replace(/<style.*?<\/style>/gs, '') // Remove style tags and content
      .replace(/<script.*?<\/script>/gs, '') // Remove script tags and content
      .replace(/<[^>]*>/g, ' ') // Replace HTML tags with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
      
    // Decode HTML entities
    text = text.replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
      
    return text;
  } catch (error) {
    console.error('Error extracting text from HTML:', error);
    return htmlContent; // Return original content if extraction fails
  }
}

/**
 * Splits text into chunks for processing
 */
function chunkText(text: string): string[] {
  const chunks: string[] = [];
  
  if (text.length <= CHUNK_SIZE) {
    chunks.push(text);
    return chunks;
  }
  
  let startIndex = 0;
  
  while (startIndex < text.length) {
    // Find a good breaking point near the chunk size
    let endIndex = Math.min(startIndex + CHUNK_SIZE, text.length);
    
    // If we're not at the end, try to find a natural break point
    if (endIndex < text.length) {
      // Look for paragraph, sentence, or word breaks
      const paragraphBreak = text.lastIndexOf('\n\n', endIndex);
      const sentenceBreak = text.lastIndexOf('. ', endIndex);
      const wordBreak = text.lastIndexOf(' ', endIndex);
      
      // Use the closest break that's not too far back
      if (paragraphBreak > startIndex && paragraphBreak > endIndex - 200) {
        endIndex = paragraphBreak + 2; // Include the paragraph break
      } else if (sentenceBreak > startIndex && sentenceBreak > endIndex - 100) {
        endIndex = sentenceBreak + 2; // Include the period and space
      } else if (wordBreak > startIndex) {
        endIndex = wordBreak + 1; // Include the space
      }
    }
    
    // Add this chunk
    chunks.push(text.substring(startIndex, endIndex).trim());
    
    // Move to next chunk with overlap
    startIndex = endIndex - CHUNK_OVERLAP;
    
    // Ensure we're making progress
    if (startIndex >= text.length || startIndex <= 0) {
      break;
    }
  }
  
  return chunks;
}

/**
 * Result of the indexing process
 */
export interface IndexingResult {
  indexedCount: number;
  totalCount: number;
  errors: any[];
}

/**
 * Indexes documents for a specific loan
 */
export async function indexDocumentsForLoan(loanId: string, documents: SimpleDocument[]): Promise<IndexingResult> {
  if (!documents || documents.length === 0) {
    return { indexedCount: 0, totalCount: 0, errors: [] };
  }
  
  // Initialize clients
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const pineconeEnvironment = process.env.PINECONE_ENVIRONMENT || 'us-east1-gcp';
  const pineconeIndexName = process.env.PINECONE_INDEX_NAME || 'offshoreai';
  
  if (!openaiApiKey || !pineconeApiKey) {
    throw new Error('OpenAI or Pinecone API keys are missing');
  }
  
  const openaiClient = new OpenAI({ 
    apiKey: openaiApiKey,
    timeout: 60000 // 60 second timeout
  });
  
  const pinecone = new Pinecone({ 
    apiKey: pineconeApiKey
  });
  
  const pineconeIndex = pinecone.Index(pineconeIndexName);
  
  // Results tracking
  let indexedCount = 0;
  const errors: any[] = [];
  
  // Process each document
  for (const document of documents) {
    try {
      console.log(`Processing document: ${document.filename}`);
      
      // Skip documents without content
      if (!document.content) {
        console.log(`Skipping document '${document.filename}' - no content`);
        continue;
      }
      
      // Extract text based on content type
      let textContent = "";
      
      if (document.fileType === 'text/html' || document.filename.endsWith('.html') || 
          (typeof document.content === 'string' && (document.content.trim().startsWith('<') || document.content.includes('<html')))) {
        // HTML content - extract text
        console.log(`Detected HTML content in ${document.filename}`);
        textContent = extractTextFromHtml(document.content);
      } else if (typeof document.content === 'string') {
        // Plain text or other content type
        textContent = document.content;
      } else {
        console.log(`Skipping document '${document.filename}' - unsupported content type`);
        continue;
      }
      
      // Skip if no meaningful text was extracted
      if (!textContent || textContent.length < 50) {
        console.log(`Skipping document '${document.filename}' - insufficient text content (${textContent.length} chars)`);
        continue;
      }
      
      // Split document into chunks
      const chunks = chunkText(textContent);
      console.log(`Document '${document.filename}' split into ${chunks.length} chunks`);
      
      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        try {
          // Generate embedding
          const embeddingResponse = await openaiClient.embeddings.create({
            model: "text-embedding-ada-002",
            input: chunk.substring(0, MAX_EMBEDDING_CHARS),
          });
          
          const embedding = embeddingResponse.data[0].embedding;
          
          // Create a unique ID for this chunk
          const chunkId = `${LOAN_DOCUMENTS_PREFIX}-${loanId}-doc-${document.id}-chunk-${i}`;
          
          // Index to Pinecone
          await pineconeIndex.upsert([{
            id: chunkId,
            values: embedding,
            metadata: {
              loanId: loanId,
              documentId: document.id,
              documentName: document.filename,
              documentType: document.docType || 'unknown',
              chunkIndex: i,
              totalChunks: chunks.length,
              text: chunk,
              source: 'loan-document',
              type: 'loan-document'
            }
          }]);
          
          console.log(`Indexed chunk ${i+1}/${chunks.length} of document '${document.filename}'`);
        } catch (chunkError: any) {
          console.error(`Error indexing chunk ${i+1}: ${chunkError.message}`);
          errors.push({
            filename: document.filename,
            id: document.id,
            chunkIndex: i,
            error: chunkError.message || 'Unknown chunk error'
          });
        }
      }
      
      indexedCount++;
    } catch (docError: any) {
      console.error(`Error processing document '${document.filename}':`, docError);
      errors.push({
        filename: document.filename,
        id: document.id,
        error: docError.message || 'Unknown document error'
      });
    }
  }
  
  console.log(`Indexing complete. Indexed ${indexedCount} out of ${documents.length} documents.`);
  
  return {
    indexedCount,
    totalCount: documents.length,
    errors
  };
} 