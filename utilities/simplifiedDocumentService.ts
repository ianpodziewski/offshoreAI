// utilities/simplifiedDocumentService.ts
import { v4 as uuidv4 } from 'uuid';
import { clientDocumentService } from '@/services/clientDocumentService';
import { STORAGE_CONFIG } from '@/configuration/storageConfig';

export interface SimpleDocument {
  id: string;
  loanId: string;
  filename: string;
  fileType?: string;
  fileSize?: number;
  dateUploaded: string;
  category: 'loan' | 'legal' | 'financial' | 'misc' | 'chat' | 'borrower' | 'property' | 'project' | 'compliance' | 'servicing' | 'exit' | 'insurance';
  docType: string;
  status: 'pending' | 'approved' | 'rejected';
  content: string; // Base64 encoded content or HTML for generated documents
  notes?: string;
  assignedTo?: string;
  section?: string;
  subsection?: string;
}

// Constants for storage keys
const STORAGE_KEY = 'simple_documents';
const DB_NAME = 'offshoreAI_DocumentDB';
const CONTENT_STORE = 'documentContents';
const DB_VERSION = 1;

// IndexedDB setup and helper functions
let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  
  dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      console.error('This browser doesn\'t support IndexedDB');
      reject(new Error('IndexedDB not supported'));
      return;
    }
    
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error opening IndexedDB', event);
      reject(new Error('Error opening IndexedDB'));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // Create object store for document contents
      if (!db.objectStoreNames.contains(CONTENT_STORE)) {
        db.createObjectStore(CONTENT_STORE, { keyPath: 'id' });
        console.log('Created document content store');
      }
    };
  });
  
  return dbPromise;
};

// Store document content in IndexedDB
const storeContentInIndexedDB = async (id: string, content: string): Promise<void> => {
  try {
    const db = await getDB();
    const transaction = db.transaction([CONTENT_STORE], 'readwrite');
    const store = transaction.objectStore(CONTENT_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.put({ id, content });
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Error storing content in IndexedDB', event);
        reject(new Error('Failed to store content in IndexedDB'));
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
    throw error;
  }
};

// Get document content from IndexedDB
const getContentFromIndexedDB = async (id: string): Promise<string | null> => {
  try {
    const db = await getDB();
    const transaction = db.transaction([CONTENT_STORE], 'readonly');
    const store = transaction.objectStore(CONTENT_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.content);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = (event) => {
        console.error('Error retrieving content from IndexedDB', event);
        reject(new Error('Failed to retrieve content from IndexedDB'));
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
    return null;
  }
};

// Delete document content from IndexedDB
const deleteContentFromIndexedDB = async (id: string): Promise<void> => {
  try {
    const db = await getDB();
    const transaction = db.transaction([CONTENT_STORE], 'readwrite');
    const store = transaction.objectStore(CONTENT_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Error deleting content from IndexedDB', event);
        reject(new Error('Failed to delete content from IndexedDB'));
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
  }
};

// Clear all contents from IndexedDB
const clearAllContentsFromIndexedDB = async (): Promise<void> => {
  try {
    const db = await getDB();
    const transaction = db.transaction([CONTENT_STORE], 'readwrite');
    const store = transaction.objectStore(CONTENT_STORE);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      
      request.onsuccess = () => {
        console.log('All document contents cleared from IndexedDB');
        resolve();
      };
      
      request.onerror = (event) => {
        console.error('Error clearing contents from IndexedDB', event);
        reject(new Error('Failed to clear contents from IndexedDB'));
      };
    });
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
  }
};

// Old compressContent utility function - now we store full content in IndexedDB
// and just keep a placeholder in localStorage
const compressContent = (content: string): string => {
  // Just store a placeholder in localStorage now that we use IndexedDB
  return '[Content stored in IndexedDB]';
};

// Helper function for document type classification
function classifyDocument(filename: string): { 
  docType: string; 
  category: 'loan' | 'legal' | 'financial' | 'misc' | 'chat' | 'borrower' | 'property' | 'project' | 'compliance' | 'servicing' | 'exit' | 'insurance';
  section?: string;
  subsection?: string;
} {
  const lowerName = filename.toLowerCase();
  
  // Check if it's a chat document first
  if (lowerName.includes('hud') || lowerName.includes('example')) {
    return { docType: 'chat_document', category: 'chat' };
  }
  
  // Borrower Profile
  if (lowerName.includes('application') || lowerName.includes('form')) {
    return { 
      docType: 'application_form', 
      category: 'borrower',
      section: 'borrower_profile',
      subsection: 'borrower_information'
    };
  }
  
  if (lowerName.includes('id') || lowerName.includes('license') || lowerName.includes('passport')) {
    return { 
      docType: 'government_id', 
      category: 'borrower',
      section: 'borrower_profile',
      subsection: 'borrower_information'
    };
  }
  
  if (lowerName.includes('tax') && lowerName.includes('return')) {
    return { 
      docType: 'tax_returns', 
      category: 'financial',
      section: 'borrower_profile',
      subsection: 'financial_documentation'
    };
  }
  
  if (lowerName.includes('bank') && lowerName.includes('statement')) {
    return { 
      docType: 'bank_statements', 
      category: 'financial',
      section: 'borrower_profile',
      subsection: 'financial_documentation'
    };
  }
  
  // Property File
  if (lowerName.includes('appraisal')) {
    return { 
      docType: 'appraisal_report', 
      category: 'property',
      section: 'property_file',
      subsection: 'valuation'
    };
  }
  
  if (lowerName.includes('inspection')) {
    return { 
      docType: 'inspection_report', 
      category: 'property',
      section: 'property_file',
      subsection: 'property_condition'
    };
  }
  
  if (lowerName.includes('purchase') && lowerName.includes('contract')) {
    return { 
      docType: 'purchase_contract', 
      category: 'property',
      section: 'property_file',
      subsection: 'property_information'
    };
  }
  
  // Loan Documents
  if (lowerName.includes('note') || lowerName.includes('promissory')) {
    return { 
      docType: 'promissory_note', 
      category: 'loan',
      section: 'loan_documents',
      subsection: 'loan_agreement'
    };
  }
  
  if (lowerName.includes('deed') || lowerName.includes('trust') || lowerName.includes('mortgage')) {
    return { 
      docType: 'deed_of_trust', 
      category: 'legal',
      section: 'loan_documents',
      subsection: 'loan_agreement'
    };
  }
  
  if (lowerName.includes('disclosure') || lowerName.includes('closing')) {
    return { 
      docType: 'closing_disclosure', 
      category: 'loan',
      section: 'loan_documents',
      subsection: 'closing_documents'
    };
  }
  
  if (lowerName.includes('insurance')) {
    return { 
      docType: 'insurance_certificates', 
      category: 'loan',
      section: 'loan_documents',
      subsection: 'closing_documents'
    };
  }
  
  // Project Documentation
  if (lowerName.includes('budget') || lowerName.includes('renovation') || lowerName.includes('construction')) {
    return { 
      docType: 'renovation_budget', 
      category: 'project',
      section: 'project_documentation',
      subsection: 'fix_and_flip'
    };
  }
  
  if (lowerName.includes('lease') || lowerName.includes('rental')) {
    return { 
      docType: 'lease_agreements', 
      category: 'project',
      section: 'project_documentation',
      subsection: 'rental_commercial'
    };
  }
  
  // Default fallback
  return { 
    docType: 'misc_document', 
    category: 'misc' 
  };
}

// Helper function to read file as base64
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    
    reader.onerror = () => reject(reader.error);
    
    // Use readAsDataURL instead of readAsArrayBuffer for PDFs
    reader.readAsDataURL(file);
  });
}

// Export the simplified document service that uses the client service
export const simpleDocumentService = {
  // Get all documents
  getAllDocuments: (): SimpleDocument[] => {
    return clientDocumentService.getAllDocumentsSync();
  },
  
  // Get documents for a specific loan
  getDocumentsForLoan: (loanId: string): SimpleDocument[] => {
    return clientDocumentService.getDocumentsForLoanSync(loanId);
  },
  
  // Get a document by ID
  getDocument: (docId: string): SimpleDocument | null => {
    return clientDocumentService.getDocumentSync(docId);
  },
  
  // Save a document
  saveDocument: (document: SimpleDocument): SimpleDocument => {
    return clientDocumentService.saveDocumentSync(document);
  },
  
  // Delete a document
  deleteDocument: (docId: string): boolean => {
    try {
      console.log(`Attempting to delete document: ${docId}`);
      // Also try to delete content from IndexedDB if available
      try {
        deleteContentFromIndexedDB(docId)
          .then(() => console.log(`Deleted document content from IndexedDB: ${docId}`))
          .catch(err => console.warn(`Could not delete content from IndexedDB: ${err}`));
      } catch (err) {
        console.warn(`Error attempting to delete from IndexedDB: ${err}`);
      }
      
      // Delete from client service
      return clientDocumentService.deleteDocumentSync(docId);
    } catch (error) {
      console.error(`Error deleting document ${docId}:`, error);
      return false;
    }
  },
  
  // Get chat documents
  getChatDocuments: (): SimpleDocument[] => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      return allDocs.filter(doc => doc.category === 'chat');
    } catch (error) {
      console.error('Error getting chat documents:', error);
      return [];
    }
  },
  
  // Get document by ID with full content
  getDocumentById: async (docId: string): Promise<SimpleDocument | null> => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      const doc = allDocs.find(doc => doc.id === docId);
      
      if (!doc) return null;
      
      // Try to get full content from IndexedDB
      try {
        const fullContent = await getContentFromIndexedDB(docId);
        if (fullContent) {
          return {
            ...doc,
            content: fullContent
          };
        }
      } catch (indexedDBError) {
        console.warn('Failed to retrieve content from IndexedDB, using stored content');
      }
      
      return doc;
    } catch (error) {
      console.error('Error getting document by ID:', error);
      return null;
    }
  },
  
  // Add a dedicated method for loan documents - no longer deduplicates, just returns documents
  deduplicateLoanDocuments: async (loanId: string): Promise<SimpleDocument[]> => {
    try {
      console.log(`Getting documents for loan ${loanId} (deduplication removed)`);
      
      // Get all documents
      const allDocs = simpleDocumentService.getAllDocuments();
      
      // Get documents for this loan
      const loanDocs = allDocs.filter(doc => doc.loanId === loanId);
      
      // Return all documents without deduplication
      return loanDocs;
    } catch (error) {
      console.error('Error getting loan documents:', error);
      return [];
    }
  },
  
  // Function to sync documents from server storage to localStorage
  syncDocumentsFromServer: async (loanId?: string): Promise<{
    success: boolean;
    message: string;
    syncedCount: number;
    errorCount: number;
  }> => {
    console.log(`Starting document sync from server for loan ${loanId || 'all'}...`);
    
    return {
      success: false,
      message: "Server storage functionality has been removed. Using localStorage only.",
      syncedCount: 0,
      errorCount: 0
    };
  },
  
  // Modified addDocumentDirectly to use localStorage only
  addDocumentDirectly: async (document: SimpleDocument): Promise<SimpleDocument> => {
    try {
      // Get existing documents from storage
      const existingDocs = simpleDocumentService.getAllDocuments();
      
      // Find ALL documents with the same docType for this loan
      const duplicates = existingDocs.filter(doc => 
        doc.loanId === document.loanId && 
        doc.docType === document.docType
      );
      
      // Create a unique ID for the document
      const docId = document.id || uuidv4();
      
      console.log(`${duplicates.length > 0 ? 'Replacing' : 'Creating new'} document for loanId=${document.loanId}, docType=${document.docType}, id=${docId}`);
      
      // Delete ALL duplicate documents first
      for (const dup of duplicates) {
        console.log(`Removing existing document ${dup.id} of type ${document.docType} before creating new one`);
        try {
          await deleteContentFromIndexedDB(dup.id);
        } catch (error) {
          console.warn(`Could not delete content from IndexedDB for document ${dup.id}:`, error);
        }
      }
      
      // Try to store full content in IndexedDB first
      let indexedDBSuccess = false;
      try {
        await storeContentInIndexedDB(docId, document.content);
        console.log(`✅ Stored document content in IndexedDB: ${docId}`);
        indexedDBSuccess = true;
      } catch (indexedDBError) {
        console.error('Failed to store content in IndexedDB, falling back to compressed content', indexedDBError);
        // We'll continue and store in localStorage, but we'll use the compressed content
      }
      
      // Create a storage-friendly version with placeholder content for localStorage
      const storageDoc = {
        ...document,
        id: docId, // Use the ID we just created
        content: indexedDBSuccess 
          ? `[Content stored in IndexedDB - ID: ${docId}]` 
          : compressContent(document.content)
      };
      
      // Remove all duplicates from the docs array
      const dedupedDocs = existingDocs.filter(doc => 
        !(doc.loanId === document.loanId && doc.docType === document.docType)
      );
      
      // Add the new document
      dedupedDocs.push(storageDoc);
      
      // Save back to storage with robust error handling
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupedDocs));
        console.log(`✅ Added document to localStorage: ${document.filename} (ID: ${docId})`);
      } catch (storageError) {
        console.error('❌ localStorage issue during add, implementing cleanup', storageError);
        
        try {
          // If localStorage is full, remove older documents to make space
          const trimmedDocs = dedupedDocs.slice(Math.max(Math.floor(dedupedDocs.length / 3), dedupedDocs.length - 20));
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...trimmedDocs, storageDoc]));
          console.log(`Trimmed documents to ${trimmedDocs.length + 1} and saved`);
        } catch (finalError) {
          console.error('Failed to save document even after trimming:', finalError);
          // As a last resort, just save this document
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([storageDoc]));
          } catch (lastError) {
            console.error('All attempts to save to localStorage failed:', lastError);
          }
        }
      }
      
      // Return the original document with full content but update the ID to match what we stored
      return {
        ...document,
        id: docId,
        content: document.content // Return original with full content
      };
    } catch (error) {
      console.error('Error adding document directly:', error);
      // Still return the document even if we couldn't save it
      return document;
    }
  },
  
  // Modified addDocument to use localStorage only
  addDocument: async (file: File, loanId: string, classification?: { 
    docType: string; 
    category: 'loan' | 'legal' | 'financial' | 'misc' | 'chat' | 'borrower' | 'property' | 'project' | 'compliance' | 'servicing' | 'exit' | 'insurance';
    section?: string;
    subsection?: string;
  }): Promise<SimpleDocument | null> => {
    try {
      // Read file as base64
      const content = await readFileAsBase64(file);
      
      // Ensure content is properly formatted as a data URL
      let formattedContent = content;
      if (!content.startsWith('data:application/pdf')) {
        // If FileReader didn't add the correct prefix, add it
        formattedContent = `data:application/pdf;base64,${content.replace(/^data:.*?;base64,/, '')}`;
      }
      
      // Special handling for chat-uploads, mark them with the chat category
      let docType = 'misc_document';
      let category: SimpleDocument['category'] = 'misc';
      let section: string | undefined = undefined;
      let subsection: string | undefined = undefined;
      
      if (loanId === 'chat-uploads') {
        docType = 'chat_document';
        category = 'chat';
      } else if (classification) {
        docType = classification.docType;
        category = classification.category;
        section = classification.section;
        subsection = classification.subsection;
      } else {
        // Auto-classify document if not provided
        const autoClassification = classifyDocument(file.name);
        docType = autoClassification.docType;
        category = autoClassification.category;
        section = autoClassification.section;
        subsection = autoClassification.subsection;
      }
      
      // Get all existing documents
      const allDocs = simpleDocumentService.getAllDocuments();
      
      // For chat uploads, we never filter out existing documents - we want to keep all chat documents
      // For other document types, find matching documents that might need to be replaced
      const existingDocs = loanId === 'chat-uploads' 
        ? [] // Empty array for chat uploads to keep all previous uploads
        : allDocs.filter(doc => 
            doc.loanId === loanId && 
            (doc.docType === docType || doc.filename === file.name)
          );
      
      // Create document ID
      const docId = uuidv4();
      
      // Delete all existing matching documents
      for (const existingDoc of existingDocs) {
        console.log(`Removing existing document ${existingDoc.id} (${existingDoc.filename}) before adding new one`);
        try {
          await deleteContentFromIndexedDB(existingDoc.id);
        } catch (error) {
          console.warn(`Could not delete content from IndexedDB for document ${existingDoc.id}:`, error);
        }
      }
      
      // Store full content in IndexedDB
      try {
        await storeContentInIndexedDB(docId, formattedContent);
        console.log(`✅ Stored document content in IndexedDB: ${docId}`);
      } catch (indexedDBError) {
        console.error('Failed to store content in IndexedDB, falling back to compressed content', indexedDBError);
      }
      
      // Create new document object
      const newDoc: SimpleDocument = {
        id: docId,
        loanId,
        filename: file.name,
        fileType: file.type || 'application/pdf',
        fileSize: file.size,
        dateUploaded: new Date().toISOString(),
        category,
        docType,
        status: 'pending',
        content: compressContent(formattedContent), // Store placeholder in localStorage
        section,
        subsection
      };
      
      // Remove all duplicate documents from array
      const dedupedDocs = allDocs.filter(doc => 
        !(doc.loanId === loanId && (doc.docType === docType || doc.filename === file.name))
      );
      
      // Add the new document
      dedupedDocs.push(newDoc);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dedupedDocs));
      
      console.log(`Document added successfully: ${newDoc.filename} (ID: ${newDoc.id}, Category: ${newDoc.category})`);
      
      return {
        ...newDoc,
        content: formattedContent
      };
    } catch (error) {
      console.error('Error adding document:', error);
      return null;
    }
  },
  
  // Clear all documents (for testing)
  clearAllDocuments: async (): Promise<void> => {
    localStorage.removeItem(STORAGE_KEY);
    
    // Also remove legacy document storage to prevent duplicates
    localStorage.removeItem('simulated_loan_documents');
    localStorage.removeItem('loan_documents');
    localStorage.removeItem('extracted_document_data');
    console.log('Cleared all document storage, including legacy storage');
    
    try {
      await clearAllContentsFromIndexedDB();
    } catch (error) {
      console.error('Error clearing IndexedDB contents:', error);
    }
  },
  
  // Update document status
  updateDocumentStatus: async (docId: string, status: 'pending' | 'approved' | 'rejected', notes?: string, assignedTo?: string): Promise<SimpleDocument | null> => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      const docIndex = allDocs.findIndex(doc => doc.id === docId);
      
      if (docIndex === -1) return null;
      
      allDocs[docIndex] = {
        ...allDocs[docIndex],
        status,
        notes: notes || allDocs[docIndex].notes,
        assignedTo: assignedTo || allDocs[docIndex].assignedTo
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
      
      return allDocs[docIndex];
    } catch (error) {
      console.error('Error updating document status:', error);
      return null;
    }
  },
  
  // Transfer documents from temporary loan ID to actual loan ID
  transferDocumentsToLoan: async (tempLoanId: string, actualLoanId: string): Promise<SimpleDocument[]> => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      const transferredDocs: SimpleDocument[] = [];
      
      // Find documents with the temp ID
      const docsToTransfer = allDocs.filter(doc => doc.loanId === tempLoanId);
      
      if (docsToTransfer.length === 0) {
        return [];
      }
      
      // Update the loan ID for each document
      docsToTransfer.forEach(doc => {
        const index = allDocs.findIndex(d => d.id === doc.id);
        if (index !== -1) {
          allDocs[index] = {
            ...allDocs[index],
            loanId: actualLoanId
          };
          transferredDocs.push(allDocs[index]);
        }
      });
      
      // Save the updated documents
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
      
      return transferredDocs;
    } catch (error) {
      console.error('Error transferring documents:', error);
      return [];
    }
  },
  
  // Get document statistics for a loan
  getDocumentStats: (loanId: string) => {
    try {
      const loanDocs = simpleDocumentService.getDocumentsForLoan(loanId);
      
      const stats = {
        total: loanDocs.length,
        approved: loanDocs.filter(doc => doc.status === 'approved').length,
        rejected: loanDocs.filter(doc => doc.status === 'rejected').length,
        pending: loanDocs.filter(doc => doc.status === 'pending').length,
        byCategory: {} as Record<string, number>,
        byType: {} as Record<string, number>
      };
      
      // Count by category
      loanDocs.forEach(doc => {
        stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
        stats.byType[doc.docType] = (stats.byType[doc.docType] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting document stats:', error);
      return {
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        byCategory: {},
        byType: {}
      };
    }
  },
  
  // Clear only chat documents
  clearChatDocuments: async (): Promise<void> => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      // Filter out documents with category 'chat'
      const nonChatDocs = allDocs.filter(doc => doc.category !== 'chat');
      
      // Save the filtered documents back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nonChatDocs));
      
      // Remove the content from IndexedDB for chat documents
      const chatDocs = allDocs.filter(doc => doc.category === 'chat');
      for (const doc of chatDocs) {
        try {
          await deleteContentFromIndexedDB(doc.id);
        } catch (error) {
          console.warn(`Could not delete content from IndexedDB for document ${doc.id}:`, error);
        }
      }
      
      console.log(`Cleared ${chatDocs.length} chat documents`);
    } catch (error) {
      console.error('Error clearing chat documents:', error);
    }
  },
  
  // Update a document directly
  updateDocument: async (document: SimpleDocument): Promise<void> => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      const index = allDocs.findIndex(d => d.id === document.id);
      
      if (index !== -1) {
        allDocs[index] = document;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  },
  
  // Sync loan documents with the chat
  syncLoanDocumentsWithChat: async (loanId: string): Promise<SimpleDocument[]> => {
    try {
      // Get all documents
      const allDocs = simpleDocumentService.getAllDocuments();
      
      // Find documents for this loan
      const loanDocs = allDocs.filter(doc => doc.loanId === loanId);
      
      // Ensure each loan document is properly tagged for the chat
      loanDocs.forEach(doc => {
        // Make sure the document has the correct loanId
        doc.loanId = loanId;
        
        // Update the document in storage
        const index = allDocs.findIndex(d => d.id === doc.id);
        if (index !== -1) {
          allDocs[index] = doc;
        }
      });
      
      // Save all updates at once
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
      
      return loanDocs;
    } catch (error) {
      console.error('Error syncing loan documents with chat:', error);
      return [];
    }
  },
  
  // Migration function
  migrateExistingDocuments: async (): Promise<boolean> => {
    try {
      // Check if migration has already been done
      const isMigrated = localStorage.getItem('documents_migrated') === 'true';
      if (isMigrated) {
        console.log('Documents have already been migrated, skipping migration.');
        return true;
      }
      
      console.log('Starting document migration...');
      // Get all storage items
      const allDocs = simpleDocumentService.getAllDocuments();
      
      if (allDocs.length === 0) {
        console.log('No documents found to migrate.');
        localStorage.setItem('documents_migrated', 'true');
        return true;
      }
      
      console.log(`Found ${allDocs.length} documents to process.`);
      
      // No deduplication, just keep all documents
      console.log(`Migration complete. Kept all ${allDocs.length} documents.`);
      
      // Save the migrated documents back to localStorage (metadata only)
      const metadataDocs = allDocs.map(doc => ({
        ...doc,
        content: doc.content.length > 1000 ? doc.content.substring(0, 1000) + '...' : doc.content
      }));
      
      // Store documents in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(metadataDocs));
      localStorage.setItem('documents_migrated', 'true');
      
      return true;
    } catch (error) {
      console.error('Error during document migration:', error);
      return false;
    }
  },

  // Initialize storage
  initializeStorage: async (): Promise<void> => {
    try {
      // Initialize IndexedDB
      await getDB();
      
      // Migrate existing documents if needed
      await simpleDocumentService.migrateExistingDocuments();
      
      console.log('Document storage initialized');
    } catch (error: unknown) {
      console.error('Error initializing document storage:', error);
    }
  },
};

// Try to migrate existing documents when the module is loaded
if (typeof window !== 'undefined') {
  // Check if migration has been done
  if (!localStorage.getItem('indexeddb_migration_done')) {
    // Set a timeout to allow the app to load first
    setTimeout(() => {
      simpleDocumentService.migrateExistingDocuments()
        .then(() => {
          localStorage.setItem('indexeddb_migration_done', 'true');
          console.log('Document migration completed and marked as done');
        })
        .catch((error: unknown) => {
          console.error('Error completing document migration:', error);
        });
    }, 3000);
  }
  
  // Initialize storage when the application loads
  simpleDocumentService.initializeStorage()
    .then(() => {
      console.log('Document storage initialized successfully');
    })
    .catch((error: unknown) => {
      console.error('Failed to initialize document storage:', error);
    });
}

// Update document methods that need both storage types
// ... existing methods with minor adjustments as needed