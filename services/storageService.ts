import { SimpleDocument } from '@/utilities/simplifiedDocumentService';
import { STORAGE_KEYS } from '@/configuration/storageConfig';

// Check if we're in a browser environment and can use localStorage
const isBrowser = typeof window !== 'undefined';

// Log the storage mode
console.log(`Storage Mode: localStorage`);

/**
 * A simplified storage service using localStorage
 * This replaces the previous Redis implementation with a simpler localStorage approach
 */
export const storageService = {
  /**
   * Save a document to storage
   */
  saveDocument: async (document: SimpleDocument): Promise<SimpleDocument> => {
    try {
      if (!isBrowser) {
        console.warn('Cannot use localStorage in server environment');
        return document;
      }
      
      // Get all existing documents
      const allDocs = storageService.getAllDocumentsSync();
      
      // Find and remove existing document with same ID if exists
      const filteredDocs = allDocs.filter(doc => doc.id !== document.id);
      
      // Add the new document
      filteredDocs.push(document);
      
      // Save all documents
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filteredDocs));
      
      console.log(`Successfully saved document (localStorage): ${document.id} for loan: ${document.loanId}`);
      return document;
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  },
  
  /**
   * Get a document by ID
   */
  getDocument: async (docId: string): Promise<SimpleDocument | null> => {
    try {
      if (!isBrowser) {
        console.warn('Cannot use localStorage in server environment');
        return null;
      }
      
      const allDocs = storageService.getAllDocumentsSync();
      return allDocs.find(doc => doc.id === docId) || null;
    } catch (error) {
      console.error(`Error retrieving document ${docId}:`, error);
      return null;
    }
  },
  
  /**
   * Delete a document by ID
   */
  deleteDocument: async (docId: string): Promise<boolean> => {
    try {
      if (!isBrowser) {
        console.warn('Cannot use localStorage in server environment');
        return false;
      }
      
      const allDocs = storageService.getAllDocumentsSync();
      const filteredDocs = allDocs.filter(doc => doc.id !== docId);
      
      if (filteredDocs.length === allDocs.length) {
        // No document was removed
        return false;
      }
      
      // Save the filtered documents
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filteredDocs));
      console.log(`Successfully deleted document: ${docId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting document ${docId}:`, error);
      return false;
    }
  },
  
  /**
   * Get all documents (with pagination option)
   */
  getAllDocuments: async (offset = 0, limit = 1000): Promise<{documents: SimpleDocument[], nextCursor: number | null}> => {
    try {
      if (!isBrowser) {
        console.warn('Cannot use localStorage in server environment');
        return { documents: [], nextCursor: null };
      }
      
      const allDocs = storageService.getAllDocumentsSync();
      
      const total = allDocs.length;
      const slicedDocs = allDocs.slice(offset, offset + limit);
      const nextCursor = offset + limit < total ? offset + limit : null;
      
      return { documents: slicedDocs, nextCursor };
    } catch (error) {
      console.error('Error retrieving all documents:', error);
      return { documents: [], nextCursor: null };
    }
  },
  
  /**
   * Synchronous helper to get all documents (internal use only)
   */
  getAllDocumentsSync: (): SimpleDocument[] => {
    if (!isBrowser) return [];
    
    try {
      const docsJson = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      const docs = docsJson ? JSON.parse(docsJson) : [];
      
      if (!Array.isArray(docs)) {
        console.warn("Invalid document data structure detected");
        return [];
      }
      
      return docs;
    } catch (error) {
      console.error('Error getting documents from localStorage:', error);
      return [];
    }
  },
  
  /**
   * Get documents for a specific loan
   */
  getDocumentsForLoan: async (loanId: string): Promise<SimpleDocument[]> => {
    try {
      console.log(`Getting documents for loan ID: ${loanId}`);
      
      if (!isBrowser) {
        console.warn('Cannot use localStorage in server environment');
        return [];
      }
      
      const allDocs = storageService.getAllDocumentsSync();
      const loanDocs = allDocs.filter(doc => doc.loanId === loanId);
      
      console.log(`Found ${loanDocs.length} documents for loan ${loanId}`);
      
      return loanDocs;
    } catch (error) {
      console.error(`Error getting loan documents for ${loanId}:`, error);
      return [];
    }
  },
  
  /**
   * Update a document
   */
  updateDocument: async (document: SimpleDocument): Promise<SimpleDocument | null> => {
    try {
      if (!isBrowser) {
        console.warn('Cannot use localStorage in server environment');
        return null;
      }
      
      const allDocs = storageService.getAllDocumentsSync();
      const docIndex = allDocs.findIndex(doc => doc.id === document.id);
      
      if (docIndex === -1) {
        console.error(`Document ${document.id} not found for update`);
        return null;
      }
      
      // Update the document
      allDocs[docIndex] = document;
      
      // Save all documents
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(allDocs));
      
      console.log(`Successfully updated document: ${document.id}`);
      return document;
    } catch (error) {
      console.error(`Error updating document ${document.id}:`, error);
      return null;
    }
  },
  
  /**
   * Clear all documents (dangerous, use with caution)
   */
  clearAllDocuments: async (): Promise<boolean> => {
    try {
      if (!isBrowser) {
        console.warn('Cannot use localStorage in server environment');
        return false;
      }
      
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, '[]');
      console.log('Successfully cleared all documents');
      return true;
    } catch (error) {
      console.error('Error clearing all documents:', error);
      return false;
    }
  },
  
  /**
   * Fix document associations by transferring documents to a new loan ID
   */
  fixDocumentAssociations: async (loanId: string, targetLoanId: string = loanId): Promise<SimpleDocument[]> => {
    try {
      if (!isBrowser) {
        console.warn('Cannot use localStorage in server environment');
        return [];
      }
      
      const allDocs = storageService.getAllDocumentsSync();
      
      // Find documents with missing or incorrect loanId
      const unassociatedDocs = allDocs.filter(doc => 
        // Documents with no loanId
        !doc.loanId || 
        // Documents with empty string loanId 
        doc.loanId === '' ||
        // Documents with 'undefined' as string
        doc.loanId === 'undefined'
      );
      
      console.log(`Found ${unassociatedDocs.length} documents to fix`);
      
      if (unassociatedDocs.length === 0) {
        return [];
      }
      
      // Update the documents
      const updatedDocs = [...allDocs];
      
      unassociatedDocs.forEach(doc => {
        const index = updatedDocs.findIndex(d => d.id === doc.id);
        if (index !== -1) {
          updatedDocs[index] = {
            ...updatedDocs[index],
            loanId: targetLoanId
          };
        }
      });
      
      // Save the updated documents
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updatedDocs));
      
      console.log(`Successfully fixed ${unassociatedDocs.length} document associations`);
      return unassociatedDocs.map(doc => ({ ...doc, loanId: targetLoanId }));
    } catch (error) {
      console.error(`Error fixing document associations for ${loanId}:`, error);
      return [];
    }
  },
  
  /**
   * Get documents for a loan without deduplication
   * @param loanId Loan ID
   */
  deduplicateLoanDocuments: async (loanId: string): Promise<SimpleDocument[]> => {
    try {
      return storageService.getDocumentsForLoan(loanId);
    } catch (error) {
      console.error('Error getting loan documents:', error);
      return [];
    }
  },
  
  // Get documents that don't have a loan ID
  async getUnassociatedDocuments(): Promise<SimpleDocument[]> {
    if (!isBrowser) {
      console.warn('Cannot use localStorage in server environment');
      return [];
    }
    
    const allDocs = storageService.getAllDocumentsSync();
    
    return allDocs.filter(doc => 
      !doc.loanId || 
      doc.loanId === 'undefined' || 
      doc.loanId === 'null'
    );
  },
  
  // Fix unassociated documents (documents without a loanId)
  async fixUnassociatedDocuments(loanId: string): Promise<SimpleDocument[]> {
    console.log(`Fixing unassociated documents for loan ${loanId}`);
    
    if (!isBrowser) {
      console.warn('Cannot use localStorage in server environment');
      return [];
    }
    
    const allDocs = storageService.getAllDocumentsSync();
    
    // Find documents without loanId
    const docsToFix = allDocs.filter(doc => 
      !doc.loanId || 
      doc.loanId === 'undefined' || 
      doc.loanId === 'null'
    );
    
    if (docsToFix.length === 0) {
      console.log('No unassociated documents found to fix');
      return [];
    }
    
    // Update all documents' loanId
    const updatedDocs = [...allDocs];
    const fixedDocs: SimpleDocument[] = [];
    
    docsToFix.forEach(doc => {
      const index = updatedDocs.findIndex(d => d.id === doc.id);
      if (index !== -1) {
        updatedDocs[index] = {
          ...updatedDocs[index],
          loanId
        };
        fixedDocs.push({...doc, loanId});
      }
    });
    
    // Save updated documents
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updatedDocs));
    
    console.log(`Fixed ${fixedDocs.length} unassociated documents`);
    return fixedDocs;
  }
};

export default storageService; 