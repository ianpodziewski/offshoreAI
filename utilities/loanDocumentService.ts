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
  // Group by docType
  const docTypeGroups: Record<string, LoanDocument[]> = {};
  
  documents.forEach(doc => {
    if (!docTypeGroups[doc.docType]) {
      docTypeGroups[doc.docType] = [];
    }
    docTypeGroups[doc.docType].push(doc);
  });
  
  // For each group, keep only the latest document by dateUploaded
  const result: LoanDocument[] = [];
  
  Object.values(docTypeGroups).forEach(docsOfType => {
    if (docsOfType.length === 1) {
      // Only one document of this type, keep it
      result.push(docsOfType[0]);
    } else {
      // Multiple documents, sort by dateUploaded descending and keep the first one
      const sortedDocs = [...docsOfType].sort((a, b) => {
        const dateA = new Date(a.dateUploaded).getTime();
        const dateB = new Date(b.dateUploaded).getTime();
        return dateB - dateA; // Descending order
      });
      
      result.push(sortedDocs[0]);
    }
  });
  
  return result;
};

// Document service for managing loan documents
export const loanDocumentService = {
  // Get all documents
  getAllDocuments: (): LoanDocument[] => {
    try {
      const docsJson = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
      return docsJson ? JSON.parse(docsJson) : [];
    } catch (error) {
      console.error('Error getting all documents:', error);
      return [];
    }
  },
  
  // Get documents for a specific loan
  getDocumentsForLoan: (loanId: string): LoanDocument[] => {
    try {
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
  getDocumentById: (docId: string): LoanDocument | null => {
    const allDocs = loanDocumentService.getAllDocuments();
    return allDocs.find(doc => doc.id === docId) || null;
  },
  
  // Add a document
  addDocument: (document: LoanDocument): LoanDocument => {
    const allDocs = loanDocumentService.getAllDocuments();
    
    // Determine if this is an uploaded document (vs. generated)
    const isUserUpload = document.filename.startsWith('UPLOAD_') || 
                        (!document.filename.startsWith('SAMPLE_') && document.status !== 'required');
    
    // Filter existing documents
    let filteredDocs = allDocs;
    
    if (isUserUpload) {
      // For user uploads and generated docs with UPLOAD_ prefix: 
      // 1. Remove any documents with the same docType AND filename
      // 2. Keep other documents with the same docType but different filename
      filteredDocs = allDocs.filter(doc => 
        !(doc.loanId === document.loanId && 
          doc.docType === document.docType && 
          doc.filename === document.filename)
      );
      
      console.log(`For user upload: Filtered to ${filteredDocs.length} documents`);
    } else {
      // For other generated docs: behave as before
      filteredDocs = allDocs.filter(doc => 
        !(doc.loanId === document.loanId && doc.docType === document.docType)
      );
      
      console.log(`For generated doc: Removed ${allDocs.length - filteredDocs.length} existing documents with docType ${document.docType}`);
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
        
        const status = statuses[statusIndex];
        
        // Generate a filename - Add UPLOAD_ prefix to make it persist like uploaded files
        const filename = `UPLOAD_GENERATED_${docType.docType.replace(/_/g, '-')}${fileType}`;
        
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
        
        // Save to localStorage
        const allExistingDocs = loanDocumentService.getAllDocuments();
        allExistingDocs.push(fakeDocument);
        localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allExistingDocs));
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

  // Deduplicate documents for a specific loan
  deduplicateLoanDocuments: (loanId: string): LoanDocument[] => {
    try {
      console.log(`Deduplicating documents for loan ${loanId}`);
      
      // Get all documents
      const allDocs = loanDocumentService.getAllDocuments();
      
      // Split into current loan docs and other loan docs
      const loanDocs = allDocs.filter(doc => doc.loanId === loanId);
      const otherDocs = allDocs.filter(doc => doc.loanId !== loanId);
      
      // Group loan documents by docType
      const docTypeGroups: Record<string, LoanDocument[]> = {};
      
      loanDocs.forEach(doc => {
        if (!docTypeGroups[doc.docType]) {
          docTypeGroups[doc.docType] = [];
        }
        docTypeGroups[doc.docType].push(doc);
      });
      
      // For each group, prioritize keeping user-uploaded documents and those with UPLOAD_ prefix
      const dedupedLoanDocs: LoanDocument[] = [];
      
      Object.values(docTypeGroups).forEach(docsOfType => {
        if (docsOfType.length === 1) {
          // Only one document of this type, keep it
          dedupedLoanDocs.push(docsOfType[0]);
        } else {
          // Multiple documents of this type
          // First, check if we have any non-sample documents (user uploaded or generated with UPLOAD_ prefix)
          const userDocs = docsOfType.filter(doc => 
            doc.status !== 'required' && 
            (doc.filename.startsWith('UPLOAD_') || !doc.filename.startsWith('SAMPLE_'))
          );
          
          if (userDocs.length > 0) {
            // Sort user uploaded docs by date (newest first) and keep the most recent
            userDocs.sort((a, b) => new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime());
            dedupedLoanDocs.push(userDocs[0]);
          } else {
            // No user docs, sort the sample/required docs by date and keep the most recent
            const sortedDocs = [...docsOfType].sort((a, b) => 
              new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime()
            );
            dedupedLoanDocs.push(sortedDocs[0]);
          }
        }
      });
      
      // Combine and save back to storage
      const allUpdatedDocs = [...otherDocs, ...dedupedLoanDocs];
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allUpdatedDocs));
      
      console.log(`Deduplication complete. Removed ${loanDocs.length - dedupedLoanDocs.length} duplicate documents.`);
      return dedupedLoanDocs;
    } catch (error) {
      console.error('Error deduplicating loan documents:', error);
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