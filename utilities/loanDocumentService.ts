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
import storageService from '@/services/storageService';
import { STORAGE_CONFIG } from '@/configuration/storageConfig';
import { documentDatabaseService } from '@/services/documentDatabaseService';
import { databaseService } from '@/services/databaseService';

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

// Storage mode flags
const USE_LOCAL_STORAGE = true;
const USE_DATABASE = true;

// Function to generate a random file size between 100KB and 10MB
const getRandomFileSize = (): number => {
  return Math.floor(Math.random() * 9900000) + 100000; // 100KB to 10MB
};

// Format file size into human-readable strings (KB, MB, etc)
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
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

// Check if localStorage is getting full
const isLocalStorageFull = (): boolean => {
  try {
    const totalSize = localStorage.length > 0 
      ? Object.keys(localStorage).map(key => key.length + (localStorage[key] || '').length).reduce((a, b) => a + b, 0)
      : 0;
    const maxSize = 5 * 1024 * 1024; // 5MB is a conservative estimate for localStorage
    const usedPercentage = (totalSize / maxSize) * 100;
    console.log(`LocalStorage usage: ${usedPercentage.toFixed(2)}% (${formatFileSize(totalSize)} of ~${formatFileSize(maxSize)})`);
    return usedPercentage > 80; // Warning at 80% usage
  } catch (e) {
    console.error('Error checking localStorage size:', e);
    return false;
  }
};

// Batch size for generating fake documents
const BATCH_SIZE = 5;

// Helper function that no longer deduplicates documents - just returns them
const deduplicateDocuments = (documents: LoanDocument[]): LoanDocument[] => {
  // Return documents without deduplication
  return documents;
};

// Initialize the database if needed
const initializeDatabase = async (): Promise<void> => {
  if (USE_DATABASE) {
    try {
      await databaseService.initialize();
      console.log('Database initialized for document storage');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
};

// Export the loan document service
export const loanDocumentService = {
  // Get all documents
  getAllDocuments: (): LoanDocument[] => {
    try {
      // Always check localStorage first
      const docsFromStorage = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
      return docsFromStorage ? JSON.parse(docsFromStorage) : [];
    } catch (error) {
      console.error('Error getting all documents:', error);
      return [];
    }
  },
  
  // Get documents for a specific loan
  getDocumentsForLoan: (loanId: string, includeContent = false): LoanDocument[] => {
    try {
      // Check if the database is initialized and should be used
      if (USE_DATABASE && databaseService['initialized']) {
        try {
          // Attempt to get documents from database
          console.log(`Getting documents for loan ${loanId} from database`);
          const docs = documentDatabaseService.getDocumentsForLoan(loanId, includeContent);
          
          // If we have results from the database, return them
          if (docs && docs.length > 0) {
            console.log(`Found ${docs.length} documents in database for loan ${loanId}`);
            return docs;
          }
        } catch (dbError) {
          console.error(`Error getting documents from database for loan ${loanId}:`, dbError);
          // Fall through to localStorage if database retrieval fails
        }
      }
      
      // Fallback to localStorage
      console.log(`Getting documents for loan ${loanId} from localStorage`);
      const allDocs = loanDocumentService.getAllDocuments();
      return allDocs.filter(doc => doc.loanId === loanId);
    } catch (error) {
      console.error(`Error getting documents for loan ${loanId}:`, error);
      return [];
    }
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
  getDocumentById: (docId: string, includeContent = false): LoanDocument | null => {
    try {
      // Check if the database is initialized and should be used
      if (USE_DATABASE && databaseService['initialized']) {
        try {
          // Attempt to get document from database
          console.log(`Getting document with ID ${docId} from database`);
          const doc = documentDatabaseService.getDocumentById(docId, includeContent);
          
          // If we found the document in the database, return it
          if (doc) {
            console.log(`Found document ${docId} in database`);
            return doc;
          }
        } catch (dbError) {
          console.error(`Error getting document ${docId} from database:`, dbError);
          // Fall through to localStorage if database retrieval fails
        }
      }
      
      // Fallback to localStorage
      console.log(`Getting document with ID ${docId} from localStorage`);
      const allDocs = loanDocumentService.getAllDocuments();
      return allDocs.find(doc => doc.id === docId) || null;
    } catch (error) {
      console.error(`Error getting document with ID ${docId}:`, error);
      return null;
    }
  },
  
  // Add a document
  addDocument: (document: LoanDocument): LoanDocument => {
    const allDocs = loanDocumentService.getAllDocuments();
    
    // Determine if this is an uploaded document or a persistent generated document
    // Modified logic to handle both UPLOAD_ prefixes and SAMPLE_ with PERSISTENT marker
    const isPersistentDoc = document.filename.startsWith('UPLOAD_') || 
                           (document.filename.startsWith('SAMPLE_PERSISTENT_')) ||
                           (!document.filename.startsWith('SAMPLE_') && document.status !== 'required');
    
    // Filter existing documents
    let filteredDocs = allDocs;
    
    if (isPersistentDoc) {
      // For user uploads and persistent generated docs: 
      // 1. Remove any documents with the same docType AND filename
      // 2. Keep other documents with the same docType but different filename
      filteredDocs = allDocs.filter(doc => 
        !(doc.loanId === document.loanId && 
          doc.docType === document.docType && 
          doc.filename === document.filename)
      );
      
      console.log(`For persistent document: Filtered to ${filteredDocs.length} documents`);
    } else {
      // For temporary generated docs: replace any with the same docType
      filteredDocs = allDocs.filter(doc => 
        !(doc.loanId === document.loanId && doc.docType === document.docType)
      );
      
      console.log(`For temporary doc: Removed ${allDocs.length - filteredDocs.length} existing documents with docType ${document.docType}`);
    }
    
    // Add the new document
    filteredDocs.push(document);
    
    // Save to localStorage
    try {
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(filteredDocs));
      console.log(`Successfully saved document ${document.filename} to localStorage`);
    } catch (error) {
      console.error('Error saving document to localStorage:', error);
    }
    
    return document;
  },
  
  // Update a document
  updateDocument: async (documentId: string, updates: Partial<LoanDocument>): Promise<LoanDocument | null> => {
    try {
      // Try to update in database if it's enabled and initialized
      let updatedDbDoc = null;
      if (USE_DATABASE && databaseService['initialized']) {
        try {
          console.log(`Attempting to update document ${documentId} in database`, updates);
          updatedDbDoc = await documentDatabaseService.updateDocument(documentId, updates);
          if (updatedDbDoc) {
            console.log(`Successfully updated document ${documentId} in database`);
            // If we updated successfully in the database, return that document
            return updatedDbDoc;
          } else {
            console.warn(`Failed to update document ${documentId} in database`);
          }
        } catch (dbError) {
          console.error(`Error updating document ${documentId} in database:`, dbError);
          // Continue to localStorage update if database update fails
        }
      }
      
      // Always update in localStorage as well
      const allDocs = loanDocumentService.getAllDocuments();
      const docIndex = allDocs.findIndex(doc => doc.id === documentId);
      
      if (docIndex === -1) {
        console.warn(`Document with ID ${documentId} not found in localStorage, cannot update`);
        return updatedDbDoc; // Return db doc if we found it there
      }
      
      allDocs[docIndex] = { ...allDocs[docIndex], ...updates };
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocs));
      console.log(`Successfully updated document ${documentId} in localStorage`);
      
      return allDocs[docIndex];
    } catch (error) {
      console.error(`Error updating document ${documentId}:`, error);
      return null;
    }
  },
  
  // Delete a document
  deleteDocument: (documentId: string): boolean => {
    try {
      console.log(`Attempting to delete document: ${documentId}`);
      
      // Try to delete from database if it's enabled and initialized
      let dbDeleteSuccess = false;
      if (USE_DATABASE && databaseService['initialized']) {
        try {
          console.log(`Attempting to delete document ${documentId} from database`);
          dbDeleteSuccess = documentDatabaseService.deleteDocument(documentId);
          if (dbDeleteSuccess) {
            console.log(`Successfully deleted document ${documentId} from database`);
          } else {
            console.warn(`Failed to delete document ${documentId} from database`);
          }
        } catch (dbError) {
          console.error(`Error deleting document ${documentId} from database:`, dbError);
          // Continue to localStorage deletion if database deletion fails
        }
      }
      
      // Always delete from localStorage as well
      const allDocs = loanDocumentService.getAllDocuments();
      const docToDelete = allDocs.find(doc => doc.id === documentId);
      
      if (!docToDelete) {
        console.warn(`Document with ID ${documentId} not found in localStorage, nothing to delete`);
        // If we successfully deleted from the database, consider the operation successful
        return dbDeleteSuccess;
      }
      
      const filteredDocs = allDocs.filter(doc => doc.id !== documentId);
      
      // If no documents were filtered out, return false
      if (filteredDocs.length === allDocs.length) {
        console.warn(`Document with ID ${documentId} not found in localStorage array of length ${allDocs.length}`);
        // If we successfully deleted from the database, consider the operation successful
        return dbDeleteSuccess;
      }
      
      // Save the filtered documents back to localStorage
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(filteredDocs));
      console.log(`Successfully deleted document ${documentId} from localStorage`);
      
      // The delete is successful if either database or localStorage deletion worked
      return true;
    } catch (error) {
      console.error(`Error deleting document ${documentId}:`, error);
      return false;
    }
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
      console.log(`Initializing documents for loan ${loanId} with type ${loanType}`);
      
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Get existing documents from storage
      const existingDocs = loanDocumentService.getAllDocuments();
      const existingLoanDocs = existingDocs.filter(doc => doc.loanId === loanId);
      
      // Create placeholder documents only for docTypes that don't have any persistent documents
      const placeholderDocs: LoanDocument[] = [];
      
      for (const docType of requiredDocTypes) {
        // Check if there's already a persistent document for this docType
        const hasExistingDocument = existingLoanDocs.some(doc => 
          doc.docType === docType.docType && 
          (
            doc.status !== 'required' || 
            doc.filename.startsWith('UPLOAD_') || 
            doc.filename.startsWith('SAMPLE_PERSISTENT_') ||
            doc.filename.startsWith('SAMPLE_')
          )
        );
        
        // If no existing document, create a placeholder
        if (!hasExistingDocument) {
          placeholderDocs.push({
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
          });
        }
      }
      
      // Filter out any exact duplicates that already exist
      const nonDuplicateDocs = placeholderDocs.filter(newDoc => 
        !existingDocs.some(existingDoc => 
          existingDoc.loanId === loanId && 
          existingDoc.docType === newDoc.docType &&
          existingDoc.status === newDoc.status
        )
      );
      
      console.log(`Created ${nonDuplicateDocs.length} new placeholder documents out of ${requiredDocTypes.length} required document types`);
      
      // Save the combined documents
      if (nonDuplicateDocs.length > 0) {
        localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify([...existingDocs, ...nonDuplicateDocs]));
      }
      
      return nonDuplicateDocs;
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
      console.log(`Generating fake documents for loan ${loanId} of type ${loanType}`);
      
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Fetch loan data
      const loanData = loanDatabase.getLoanById(loanId);
      if (!loanData) {
        console.error(`Loan data not found for loanId: ${loanId}`);
        return [];
      }
      
      // Create an array to store the fake documents
      const fakeDocuments: LoanDocument[] = [];
      
      // Process each document type
      for (const docType of requiredDocTypes) {
        // Always use HTML file type for consistent handling
        const fileType = '.html';
        const fileSize = Math.floor(Math.random() * 1000000) + 100000; // Random size between 100KB and 1.1MB
        const uploadDate = new Date().toISOString();
        
        // Generate random status with higher probability for 'pending'
        const statuses: DocumentStatus[] = ['pending', 'approved', 'rejected', 'reviewed'];
        const statusWeights = [0.7, 0.1, 0.1, 0.1]; // Higher probability for 'pending'
        const randomValue = Math.random();
        let statusIndex = 0;
        let cumulativeWeight = 0;
        
        for (let i = 0; i < statusWeights.length; i++) {
          cumulativeWeight += statusWeights[i];
          if (randomValue <= cumulativeWeight) {
            statusIndex = i;
            break;
          }
        }
        
        // Ensure we never have 'required' status for generated documents
        // Force to 'pending' to ensure it's treated as persistent
        const status: DocumentStatus = 'pending';
        
        // Generate a filename - Using SAMPLE_ prefix as requested
        const filename = `SAMPLE_${docType.docType.replace(/_/g, '-')}${fileType}`;
        
        // Generate document content based on the document type
        const content = generateDocumentContent(docType.docType, loanData);
        
        // Create a unique ID with timestamp to ensure uniqueness
        const docId = uuidv4();
        
        // Create the fake document
        const fakeDocument: LoanDocument = {
          id: docId,
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
        
        // Save to localStorage if enabled
        if (USE_LOCAL_STORAGE) {
          const allExistingDocs = loanDocumentService.getAllDocuments();
          allExistingDocs.push(fakeDocument);
          localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allExistingDocs));
        }
      }
      
      // Save to database if enabled
      if (USE_DATABASE) {
        try {
          // Initialize database if not already initialized
          await initializeDatabase();
          
          // Store documents in database
          const insertedCount = documentDatabaseService.bulkInsertDocuments(fakeDocuments);
          console.log(`Saved ${insertedCount} documents to SQLite database`);
        } catch (dbError) {
          console.error('Error saving documents to database:', dbError);
        }
      }
      
      console.log(`Generated and stored ${fakeDocuments.length} fake documents for loan ${loanId}`);
      
      return fakeDocuments;
    } catch (error) {
      console.error(`Error generating fake documents for loan ${loanId}:`, error);
      return [];
    }
  },
  
  // Generate fake documents using simpleDocumentService
  generateFakeDocumentsUsingSimpleService: async (loanId: string, loanType: string, existingFakeDocs: LoanDocument[] = []): Promise<LoanDocument[]> => {
    try {
      console.log('Generating fake documents using simpleDocumentService');
      
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Get existing documents for this loan (from simpleDocumentService)
      const existingSimpleDocs = simpleDocumentService.getDocumentsForLoan(loanId);
      
      console.log(`Found ${existingSimpleDocs.length} existing documents`);
      
      // Implementation to be added
      return existingFakeDocs;
    } catch (error) {
      console.error('Error generating documents:', error);
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

  // Get documents for a specific loan - no longer deduplicates
  deduplicateLoanDocuments: (loanId: string): LoanDocument[] => {
    try {
      console.log(`Getting documents for loan ${loanId} (deduplication removed)`);
      
      // Get all documents from localStorage
      const storedDocs = localStorage.getItem('loan_documents') || '[]';
      const allDocuments: LoanDocument[] = JSON.parse(storedDocs);
      
      // Filter for the specific loan
      const loanDocuments = allDocuments.filter(doc => doc.loanId === loanId);
      
      // Return without deduplication
      return loanDocuments;
    } catch (error) {
      console.error('Error getting loan documents:', error);
      return [];
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