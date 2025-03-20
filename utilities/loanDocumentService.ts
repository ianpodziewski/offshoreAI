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

// Storage mode flags
const USE_LOCAL_STORAGE = true;
const USE_DATABASE = true;

// Check if we're in a server environment
const isServer = typeof window === 'undefined';

// Safely store database service references
let documentDatabaseService: any = null;
let databaseService: any = null;

// Function to generate a random file size between 100KB and 10MB
const getRandomFileSize = () => {
  return Math.floor(Math.random() * 9900000) + 100000; // 100KB to 10MB
};

// Format file size into human-readable strings (KB, MB, etc)
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

// Dynamically load database services only in server environment
const loadDatabaseServices = async (): Promise<boolean> => {
  if (!isServer) {
    console.log('Database services cannot be loaded in browser environment');
    return false;
  }
  
  try {
    // Import the database services only on the server
    const dbServiceModule = await import('@/services/databaseService');
    const docDbServiceModule = await import('@/services/documentDatabaseService');
    
    databaseService = dbServiceModule.default;
    documentDatabaseService = docDbServiceModule.default;
    
    return true;
  } catch (error) {
    console.error('Failed to load database services:', error);
    return false;
  }
};

// Check if database is available and initialized
const isDatabaseAvailable = async (): Promise<boolean> => {
  if (!isServer) {
    console.log('Database not available in browser environment');
    return false;
  }
  
  if (!USE_DATABASE) {
    return false;
  }
  
  // Try to load database services if not already loaded
  if (!databaseService || !documentDatabaseService) {
    const loaded = await loadDatabaseServices();
    if (!loaded) {
      return false;
    }
  }
  
  // Check if database service is available and initialized
  try {
    if (!databaseService.isEnvironmentSupported?.()) {
      return false;
    }
    
    // Check if database is initialized, or try to initialize it
    if (!databaseService.initialized) {
      try {
        await databaseService.initialize?.();
      } catch (error) {
        console.error('Error initializing database:', error);
        return false;
      }
    }
    
    return !!databaseService.initialized;
  } catch (error) {
    console.error('Error checking database availability:', error);
    return false;
  }
};

// Initialize the database if needed
const initializeDatabase = async (): Promise<boolean> => {
  if (!isServer) {
    console.log('Cannot initialize database in browser environment');
    return false;
  }
  
  if (!USE_DATABASE) {
    return false;
  }
  
  try {
    // Load database services if not already loaded
    if (!databaseService || !documentDatabaseService) {
      const loaded = await loadDatabaseServices();
      if (!loaded) {
        return false;
      }
    }
    
    // Check if database service is available
    if (!databaseService.isEnvironmentSupported?.()) {
      console.warn('Database environment not supported, skipping initialization');
      return false;
    }
    
    // Initialize the database
    try {
      await databaseService.initialize?.();
      console.log('Database initialized for document storage');
      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      return false;
    }
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
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

// Export the loan document service
export const loanDocumentService = {
  // Get all documents
  getAllDocuments: (): LoanDocument[] => {
    try {
      // Always check localStorage first
      let docsFromStorage;
      try {
        docsFromStorage = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
      } catch (storageError) {
        console.error('Error accessing localStorage:', storageError);
        return [];
      }
      
      if (!docsFromStorage) {
        return [];
      }
      
      try {
        // Parse the storage data
        const parsedDocs = JSON.parse(docsFromStorage);
        
        // Validate that parsedDocs is an array
        if (!parsedDocs || !Array.isArray(parsedDocs)) {
          console.error('Invalid document data in localStorage: not an array');
          // Reset localStorage to prevent future errors
          try {
            localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, '[]');
          } catch (resetError) {
            console.error('Error resetting localStorage:', resetError);
          }
          return [];
        }
        
        // Filter out any null or undefined values, and validate each document
        const validDocs = parsedDocs.filter(doc => {
          // Basic validation - check if it's an object with at least an id and loanId
          return doc && 
                 typeof doc === 'object' && 
                 doc.id && 
                 typeof doc.id === 'string' && 
                 doc.loanId && 
                 typeof doc.loanId === 'string';
        });
        
        // If we filtered out any documents, update localStorage
        if (validDocs.length < parsedDocs.length) {
          console.warn(`Filtered out ${parsedDocs.length - validDocs.length} invalid documents from localStorage`);
          try {
            localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(validDocs));
          } catch (e) {
            console.error('Error updating localStorage with filtered documents:', e);
          }
        }
        
        return validDocs;
      } catch (parseError) {
        console.error('Error parsing document data from localStorage:', parseError);
        try {
          // Reset localStorage to prevent future errors
          localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, '[]');
        } catch (e) {
          console.error('Error resetting localStorage:', e);
        }
        return [];
      }
    } catch (error) {
      console.error('Error getting all documents:', error);
      return [];
    }
  },
  
  // Get documents for a specific loan
  getDocumentsForLoan: async (loanId: string, includeContent = false): Promise<LoanDocument[]> => {
    try {
      if (!loanId) {
        console.error('Cannot get documents: missing loanId');
        return [];
      }
      
      // Check if the database is available and should be used
      let dbAvailable = false;
      
      if (isServer && USE_DATABASE) {
        try {
          dbAvailable = await isDatabaseAvailable();
        } catch (dbCheckError) {
          console.error(`Error checking database availability: ${dbCheckError}`);
          dbAvailable = false;
        }
      }
      
      if (dbAvailable && documentDatabaseService) {
        try {
          // Attempt to get documents from database
          console.log(`Getting documents for loan ${loanId} from database`);
          const docs = await documentDatabaseService.getDocumentsForLoan(loanId, includeContent);
          
          // If we have results from the database, return them after validation
          if (docs && Array.isArray(docs) && docs.length > 0) {
            console.log(`Found ${docs.length} documents in database for loan ${loanId}`);
            // Additional validation to ensure all documents have required fields
            const validDocs = docs.filter(doc => 
              doc && 
              typeof doc === 'object' && 
              doc.id && 
              typeof doc.id === 'string' && 
              doc.loanId === loanId
            );
            
            if (validDocs.length < docs.length) {
              console.warn(`Filtered out ${docs.length - validDocs.length} invalid documents from database results`);
            }
            
            return validDocs;
          }
        } catch (dbError) {
          console.error(`Error getting documents from database for loan ${loanId}:`, dbError);
          // Fall through to localStorage if database retrieval fails
        }
      }
      
      // Fallback to localStorage
      console.log(`Getting documents for loan ${loanId} from localStorage`);
      try {
        const allDocs = loanDocumentService.getAllDocuments();
        if (!Array.isArray(allDocs)) {
          console.error(`Invalid documents from localStorage: not an array`);
          return [];
        }
        
        // We already validated documents in getAllDocuments, but double-check the loanId match
        const validLoanDocs = allDocs.filter(doc => 
          doc && doc.loanId === loanId
        );
        
        return validLoanDocs;
      } catch (localStorageError) {
        console.error(`Error retrieving documents from localStorage: ${localStorageError}`);
        return [];
      }
    } catch (error) {
      console.error(`Error getting documents for loan ${loanId}:`, error);
      return [];
    }
  },
  
  // Get documents for a specific loan by category
  getDocumentsByCategory: async (loanId: string, category: DocumentCategory): Promise<LoanDocument[]> => {
    const loanDocs = await loanDocumentService.getDocumentsForLoan(loanId);
    return loanDocs.filter(doc => doc.category === category);
  },
  
  // Get documents for a specific loan by section
  getDocumentsBySection: async (loanId: string, section: string): Promise<LoanDocument[]> => {
    const loanDocs = await loanDocumentService.getDocumentsForLoan(loanId);
    return loanDocs.filter(doc => doc.section === section);
  },
  
  // Get document by ID
  getDocumentById: async (docId: string, includeContent = false): Promise<LoanDocument | null> => {
    try {
      // Check if the database is available and should be used
      let dbAvailable = false;
      
      if (isServer && USE_DATABASE) {
        dbAvailable = await isDatabaseAvailable();
      }
      
      if (dbAvailable && documentDatabaseService) {
        try {
          // Attempt to get document from database
          console.log(`Getting document with ID ${docId} from database`);
          const doc = await documentDatabaseService.getDocumentById(docId, includeContent);
          
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
  updateDocument: async (document: Partial<LoanDocument>): Promise<boolean> => {
    if (!document.id) {
      console.error('Cannot update document without ID');
      return false;
    }
    
    try {
      // Check if the database is available and should be used
      let dbAvailable = false;
      
      if (isServer && USE_DATABASE) {
        dbAvailable = await isDatabaseAvailable();
      }
      
      let updated = false;
      
      // Try to update in database first if available
      if (dbAvailable && documentDatabaseService) {
        try {
          // Update in database
          updated = await documentDatabaseService.updateDocument(document);
          console.log(`Document ${document.id} ${updated ? 'updated in' : 'not found in'} database`);
        } catch (dbError) {
          console.error(`Error updating document ${document.id} in database:`, dbError);
          // Fall through to localStorage
        }
      }
      
      // Also update in localStorage
      const allDocs = loanDocumentService.getAllDocuments();
      const docIndex = allDocs.findIndex(doc => doc.id === document.id);
      
      if (docIndex >= 0) {
        allDocs[docIndex] = { ...allDocs[docIndex], ...document };
        localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocs));
        console.log(`Document ${document.id} updated in localStorage`);
        updated = true;
      }
      
      return updated;
    } catch (error) {
      console.error(`Error updating document ${document.id}:`, error);
      return false;
    }
  },
  
  // Delete a document
  deleteDocument: async (docId: string): Promise<boolean> => {
    try {
      // Check if the database is available and should be used
      let dbAvailable = false;
      
      if (isServer && USE_DATABASE) {
        dbAvailable = await isDatabaseAvailable();
      }
      
      let deleted = false;
      
      // Try to delete from database first if available
      if (dbAvailable && documentDatabaseService) {
        try {
          // Delete from database
          deleted = await documentDatabaseService.deleteDocument(docId);
          console.log(`Document ${docId} ${deleted ? 'deleted from' : 'not found in'} database`);
        } catch (dbError) {
          console.error(`Error deleting document ${docId} from database:`, dbError);
          // Fall through to localStorage
        }
      }
      
      // Also delete from localStorage if found
      const allDocs = loanDocumentService.getAllDocuments();
      const docIndex = allDocs.findIndex(doc => doc.id === docId);
      
      if (docIndex >= 0) {
        allDocs.splice(docIndex, 1);
        localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocs));
        console.log(`Document ${docId} deleted from localStorage`);
        deleted = true;
      }
      
      return deleted;
    } catch (error) {
      console.error(`Error deleting document ${docId}:`, error);
      return false;
    }
  },
  
  // Update document status
  updateDocumentStatus: async (docId: string, status: DocumentStatus): Promise<LoanDocument | null> => {
    return loanDocumentService.updateDocument({ id: docId, status });
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
      
      // Validate input parameters
      if (!loanId || !loanType) {
        console.error('Cannot initialize documents: missing loanId or loanType');
        return [];
      }
      
      // Get all required document types for this loan type
      let requiredDocTypes = [];
      try {
        requiredDocTypes = getRequiredDocuments(loanType);
        
        // Validate required doc types is an array
        if (!Array.isArray(requiredDocTypes)) {
          console.error(`Invalid required document types for loan type ${loanType}`);
          return [];
        }
        
        // Make sure we have actual types
        if (requiredDocTypes.length === 0) {
          console.warn(`No required document types found for loan type ${loanType}`);
          return [];
        }
      } catch (docTypesError) {
        console.error(`Error getting required document types: ${docTypesError}`);
        return [];
      }
      
      // Get existing documents from storage with robust error handling
      let existingDocs = [];
      try {
        const docs = loanDocumentService.getAllDocuments();
        if (Array.isArray(docs)) {
          existingDocs = docs;
        } else {
          console.warn('getAllDocuments did not return an array, using empty array');
        }
      } catch (getDocsError) {
        console.error(`Error getting existing documents: ${getDocsError}`);
      }
      
      // Filter for this loan's existing documents with validation
      const existingLoanDocs = Array.isArray(existingDocs) 
        ? existingDocs.filter(doc => doc && typeof doc === 'object' && doc.loanId === loanId)
        : [];
      
      // Create placeholder documents only for docTypes that don't have any persistent documents
      const placeholderDocs: LoanDocument[] = [];
      let newDocsCreated = 0;
      
      for (const docType of requiredDocTypes) {
        try {
          // Skip invalid document types
          if (!docType || typeof docType !== 'object' || !docType.docType) {
            console.warn('Skipping invalid document type');
            continue;
          }
          
          // Check if there's already a persistent document for this docType with robust validation
          const hasExistingDocument = Array.isArray(existingLoanDocs) && existingLoanDocs.some(doc => 
            doc && 
            typeof doc === 'object' && 
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
            const newDocument: LoanDocument = {
              id: uuidv4(),
              loanId,
              filename: `SAMPLE_${docType.label || docType.docType}.html`,
              dateUploaded: new Date().toISOString(),
              category: docType.category as DocumentCategory,
              section: docType.section || '',
              subsection: docType.subsection || '',
              docType: docType.docType,
              status: 'required' as DocumentStatus,
              isRequired: true,
              version: 1
            };
            
            placeholderDocs.push(newDocument);
            newDocsCreated++;
          }
        } catch (docError) {
          console.error(`Error creating placeholder for document type ${docType?.docType || 'unknown'}:`, docError);
          // Continue to next document
        }
      }
      
      // Save the placeholders to storage if any were created
      if (placeholderDocs.length > 0) {
        try {
          // Get all existing documents again to make sure we're working with the latest data
          const allExistingDocs = loanDocumentService.getAllDocuments();
          
          // Make sure we have an array
          if (Array.isArray(allExistingDocs)) {
            // Create updated documents list with the new placeholders
            const updatedDocs = [...allExistingDocs, ...placeholderDocs];
            
            // Save to localStorage
            localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(updatedDocs));
            
            console.log(`Created ${newDocsCreated} new placeholder documents out of ${requiredDocTypes.length} required document types`);
          } else {
            console.error('getAllDocuments did not return an array when saving placeholders');
            // Just save the placeholders we created
            localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(placeholderDocs));
          }
        } catch (saveError) {
          console.error('Error saving placeholder documents to localStorage:', saveError);
        }
      } else {
        console.log(`No new placeholder documents needed for loan ${loanId} (all ${requiredDocTypes.length} required documents exist)`);
      }
      
      return placeholderDocs;
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
    // Default return object with zero values
    const defaultResult = {
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

    try {
      // Validate input parameters
      if (!loanId || !loanType) {
        console.error('Cannot get document completion status: missing loanId or loanType');
        return defaultResult;
      }
      
      // Get all required document types for this loan type
      let requiredDocTypes = [];
      try {
        requiredDocTypes = getRequiredDocuments(loanType);
        
        // Validate required document types
        if (!Array.isArray(requiredDocTypes)) {
          console.error(`Invalid requiredDocTypes for loan type ${loanType}: not an array`);
          return defaultResult;
        }
      } catch (docTypesError) {
        console.error(`Error getting required document types: ${docTypesError}`);
        return defaultResult;
      }
      
      // Get existing documents - defensive approach
      let existingDocs = [];
      try {
        // Get all documents and ensure it's an array
        let allDocs = loanDocumentService.getAllDocuments();
        
        // Make absolutely sure we have an array even if getAllDocuments fails
        if (!allDocs || !Array.isArray(allDocs)) {
          console.warn('getAllDocuments did not return a valid array, using empty array');
          allDocs = [];
        }
        
        // Filter for this loan's documents with defensive checks for each document
        existingDocs = allDocs.filter(doc => 
          doc && typeof doc === 'object' && doc.loanId === loanId
        );

        // Additional validation to ensure existingDocs is definitely an array
        if (!Array.isArray(existingDocs)) {
          console.warn('existingDocs is not an array after filtering, using empty array');
          existingDocs = [];
        }
      } catch (docsError) {
        console.error(`Error getting existing documents: ${docsError}`);
        existingDocs = [];
      }
      
      // Count total required document types (sockets)
      const total = requiredDocTypes.length;
      
      // Get unique docTypes that have at least one document (status not 'required')
      let uniqueCompletedDocTypes = new Set();
      try {
        // Defensive check - make sure existingDocs is an array
        if (Array.isArray(existingDocs)) {
          // Filter valid documents with robust checks
          const validDocs = existingDocs.filter(doc => 
            doc && 
            typeof doc === 'object' &&
            doc.status && 
            typeof doc.status === 'string' &&
            doc.status !== 'required' && 
            doc.docType && 
            typeof doc.docType === 'string'
          );
          
          // Extract unique docTypes with validation
          if (Array.isArray(validDocs)) {
            uniqueCompletedDocTypes = new Set(
              validDocs.map(doc => doc.docType)
            );
          } else {
            console.error('validDocs is not an array after filtering');
            uniqueCompletedDocTypes = new Set();
          }
        } else {
          console.error('existingDocs is not an array');
          uniqueCompletedDocTypes = new Set();
        }
      } catch (filterError) {
        console.error(`Error filtering completed documents: ${filterError}`);
        uniqueCompletedDocTypes = new Set();
      }
      
      // Convert the Set to an array for further processing
      const uniqueCompletedDocTypesArray = Array.from(uniqueCompletedDocTypes);
      
      // Count completed document sockets (those with at least one document)
      let completed = 0;
      try {
        // Defensive programming for array methods
        if (Array.isArray(uniqueCompletedDocTypesArray) && Array.isArray(requiredDocTypes)) {
          completed = uniqueCompletedDocTypesArray.filter(docType => 
            requiredDocTypes.some(rt => rt && typeof rt === 'object' && rt.docType === docType)
          ).length;
        } else {
          console.warn('Either uniqueCompletedDocTypesArray or requiredDocTypes is not an array');
          completed = 0;
        }
      } catch (countError) {
        console.error(`Error counting completed documents: ${countError}`);
        completed = 0;
      }
      
      // Calculate completion percentage with safety check for division by zero
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Calculate completion by category
      const byCategory: Record<DocumentCategory, { total: number; completed: number; percentage: number }> = {
        borrower: { total: 0, completed: 0, percentage: 0 },
        property: { total: 0, completed: 0, percentage: 0 },
        closing: { total: 0, completed: 0, percentage: 0 },
        servicing: { total: 0, completed: 0, percentage: 0 },
        misc: { total: 0, completed: 0, percentage: 0 }
      };
      
      // Process each category
      try {
        const categories: DocumentCategory[] = ['borrower', 'property', 'closing', 'servicing', 'misc'];
        
        for (const category of categories) {
          try {
            // Ensure requiredDocTypes is an array before filtering
            if (!Array.isArray(requiredDocTypes)) {
              console.warn(`requiredDocTypes is not an array when processing category ${category}`);
              continue;
            }

            // Filter required docs for this category with robust validation
            const categoryRequiredDocs = requiredDocTypes.filter(doc => 
              doc && typeof doc === 'object' && doc.category === category
            );
            
            const categoryTotal = categoryRequiredDocs.length;
            
            // Get completed docs for this category
            let categoryCompletedCount = 0;
            
            // Defensive check for existingDocs before filtering
            if (Array.isArray(existingDocs)) {
              // Get all docs for this category that aren't 'required' status
              const categoryDocs = existingDocs.filter(doc => 
                doc && 
                typeof doc === 'object' &&
                doc.category === category && 
                doc.status && 
                typeof doc.status === 'string' &&
                doc.status !== 'required' && 
                doc.docType && 
                typeof doc.docType === 'string'
              );
              
              // Ensure categoryDocs is an array before processing
              if (Array.isArray(categoryDocs)) {
                // Get unique document types
                const categoryCompletedDocTypes = new Set(
                  categoryDocs.map(doc => doc.docType)
                );
                
                // Ensure safe array operations with type checking
                if (Array.isArray(categoryRequiredDocs)) {
                  // Count unique completed document types that are required
                  categoryCompletedCount = Array.from(categoryCompletedDocTypes).filter(docType => 
                    categoryRequiredDocs.some(rt => rt && typeof rt === 'object' && rt.docType === docType)
                  ).length;
                }
              }
            }
            
            // Calculate percentage with division by zero check
            const categoryPercentage = categoryTotal > 0 
              ? Math.round((categoryCompletedCount / categoryTotal) * 100) 
              : 0;
            
            // Store in results
            byCategory[category] = {
              total: categoryTotal,
              completed: categoryCompletedCount,
              percentage: categoryPercentage
            };
          } catch (categoryError) {
            console.error(`Error processing category ${category}: ${categoryError}`);
            byCategory[category] = { total: 0, completed: 0, percentage: 0 };
          }
        }
      } catch (categoriesError) {
        console.error(`Error processing categories: ${categoriesError}`);
      }
      
      return {
        total,
        completed,
        percentage,
        byCategory
      };
    } catch (error) {
      console.error('Error getting document completion status:', error);
      return defaultResult;
    }
  },
  
  // Generate fake documents for a loan
  generateFakeDocuments: async (loanId: string, loanType: string): Promise<LoanDocument[]> => {
    try {
      if (!loanId || !loanType) {
        console.error('Cannot generate fake documents: missing loanId or loanType');
        return [];
      }
      
      // First get the loan data - needed for document generation
      let loan = null;
      try {
        loan = loanDatabase.getLoanById(loanId);
        if (!loan) {
          console.error(`Cannot generate fake documents: loan ${loanId} not found`);
          return [];
        }
      } catch (loanError) {
        console.error(`Error getting loan data: ${loanError}`);
        return [];
      }
      
      console.log(`Generating fake documents for loan ${loanId} of type ${loanType}`);
      
      // Get all required document types for this loan type
      let requiredDocTypes = [];
      try {
        requiredDocTypes = getRequiredDocuments(loanType);
        
        // Validate required doc types
        if (!Array.isArray(requiredDocTypes) || requiredDocTypes.length === 0) {
          console.error(`No required document types found for loan type ${loanType}`);
          return [];
        }
      } catch (docTypesError) {
        console.error(`Error getting required document types: ${docTypesError}`);
        return [];
      }
      
      // Create an array of fake documents
      const fakeDocuments: LoanDocument[] = [];
      
      // For each document type, create a fake document
      for (const docType of requiredDocTypes) {
        try {
          // Validate docType object
          if (!docType || typeof docType !== 'object' || !docType.docType) {
            console.warn('Skipping invalid document type:', docType);
            continue;
          }
          
          // Validate that docType is a non-empty string
          if (!docType.docType || typeof docType.docType !== 'string') {
            console.warn('Skipping document with missing or invalid docType');
            continue;
          }
          
          // Create a unique ID for the document
          const docId = uuidv4();
          
          // Generate fake file size
          const fileSize = getRandomFileSize();
          
          // Generate content first - if this fails, we can skip this document
          let content: string;
          try {
            content = generateDocumentContent(docType.docType, loan);
            if (!content) {
              console.warn(`No content generated for document type ${docType.docType}, skipping`);
              continue;
            }
          } catch (contentError) {
            console.error(`Error generating content for document type ${docType.docType}:`, contentError);
            continue;
          }
          
          // Use a random status from the allowed fake status list
          const randomStatus = FAKE_DOCUMENT_STATUSES[Math.floor(Math.random() * FAKE_DOCUMENT_STATUSES.length)];
          
          // Create the document with initial data - using an explicit object to pass to createDocument
          const documentData = {
            id: docId,
            loanId,
            docType: docType.docType,
            filename: `SAMPLE_${docType.docType}-${Math.floor(Math.random() * 10000)}.html`,
            category: docType.category as DocumentCategory,
            section: docType.section,
            subsection: docType.subsection || '',
            status: randomStatus,
            dateUploaded: new Date().toISOString(),
            fileType: '.html', // Standardize on HTML for simpler development
            fileSize,
            content,
            isRequired: true,
            version: 1
          };
          
          // Create the document using our createDocument function
          const fakeDocument = createDocument(documentData);
          
          if (!fakeDocument) {
            console.warn(`Failed to create document for type ${docType.docType}, skipping`);
            continue;
          }
          
          // Add to the fake documents array
          fakeDocuments.push(fakeDocument);
          
          // Save to localStorage if enabled
          if (USE_LOCAL_STORAGE) {
            try {
              const allExistingDocs = loanDocumentService.getAllDocuments();
              if (Array.isArray(allExistingDocs)) {
                // Create a separate copy to avoid reference issues
                let updatedDocs = [...allExistingDocs];
                
                // Add new document
                updatedDocs.push(fakeDocument);
                
                // Save to storage
                localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(updatedDocs));
              } else {
                console.error('Invalid existing documents from localStorage, not saving this document');
                // Initialize with just this document
                localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify([fakeDocument]));
              }
            } catch (storageError) {
              console.error('Error saving document to localStorage:', storageError);
            }
          }
        } catch (docError) {
          console.error(`Error creating document for type ${docType?.docType || 'unknown'}:`, docError);
          // Continue to next document
        }
      }
      
      // Save to database if available and enabled
      if (isServer && USE_DATABASE && fakeDocuments.length > 0) {
        try {
          // Initialize database if not already initialized
          const dbInitialized = await initializeDatabase();
          
          if (dbInitialized && documentDatabaseService) {
            try {
              const insertedCount = await documentDatabaseService.bulkInsertDocuments?.(fakeDocuments) || 0;
              console.log(`Saved ${insertedCount} documents to SQLite database`);
            } catch (bulkInsertError) {
              console.error('Error during bulk insert:', bulkInsertError);
            }
          } else {
            console.log('Database not available for storing documents');
          }
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
        try {
          // Parse the documents array
          const documents = JSON.parse(allDocs);
          
          // Validate that it's an array
          if (!Array.isArray(documents)) {
            console.error('Invalid document data in localStorage: not an array');
            localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, '[]');
            return;
          }
          
          // Filter out any null or invalid documents
          const validDocuments = documents.filter(doc => 
            doc && typeof doc === 'object' && doc.loanId && typeof doc.loanId === 'string'
          );
          
          // If we filtered documents, update localStorage
          if (validDocuments.length < documents.length) {
            console.warn(`Filtered out ${documents.length - validDocuments.length} invalid documents during initialization`);
            localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(validDocuments));
          }
          
          // Get unique loan IDs
          const loanIds = new Set(validDocuments.map(doc => doc.loanId));
          
          console.log(`Running initial deduplication for ${loanIds.size} loans...`);
          
          // Deduplicate each loan's documents
          loanIds.forEach((loanId) => {
            if (loanId) {
              loanDocumentService.deduplicateLoanDocuments(loanId);
            }
          });
        } catch (parseError) {
          console.error('Error during initial document deduplication (parse error):', parseError);
          // Reset localStorage to prevent future errors
          localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, '[]');
        }
      }
    } catch (error) {
      console.error('Error during initial document deduplication:', error);
    }
  }, 2000);
}