import { SimpleDocument } from '@/utilities/simplifiedDocumentService';
import { STORAGE_KEYS } from '@/configuration/storageConfig';

// Helper functions for localStorage
const getDocumentsFromLocalStorage = (): SimpleDocument[] => {
  try {
    const docsJson = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    const docs = docsJson ? JSON.parse(docsJson) : [];
    
    if (!Array.isArray(docs)) {
      console.warn("Invalid document data structure detected in localStorage");
      return [];
    }
    
    return docs;
  } catch (error) {
    console.error('Error getting documents from localStorage:', error);
    return [];
  }
};

const saveDocumentsToLocalStorage = (documents: SimpleDocument[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  } catch (error) {
    console.error('Error saving documents to localStorage:', error);
  }
};

/**
 * Client-side service for document operations
 * This provides both async methods that fetch from the API and sync methods
 * that use localStorage for compatibility with existing code
 */
export const clientDocumentService = {
  /**
   * Get all documents - ASYNC (fetches from API)
   */
  getAllDocuments: async (limit = 1000, cursor = 0): Promise<{documents: SimpleDocument[], nextCursor: number | null}> => {
    try {
      const response = await fetch(`/api/documents?limit=${limit}&cursor=${cursor}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      
      // Also update localStorage for synchronous access
      if (result.documents) {
        saveDocumentsToLocalStorage(result.documents);
      }
      
      return result;
    } catch (error) {
      console.error('Error fetching documents:', error);
      return { documents: getDocumentsFromLocalStorage(), nextCursor: null };
    }
  },
  
  /**
   * Get all documents - SYNC (uses localStorage for compatibility)
   */
  getAllDocumentsSync: (): SimpleDocument[] => {
    return getDocumentsFromLocalStorage();
  },
  
  /**
   * Get documents for a specific loan - ASYNC (fetches from API)
   */
  getDocumentsForLoan: async (loanId: string): Promise<SimpleDocument[]> => {
    try {
      const response = await fetch(`/api/documents?loanId=${loanId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.documents || [];
    } catch (error) {
      console.error(`Error fetching documents for loan ${loanId}:`, error);
      // Fallback to localStorage
      const allDocs = getDocumentsFromLocalStorage();
      return allDocs.filter(doc => doc.loanId === loanId);
    }
  },
  
  /**
   * Get documents for a specific loan - SYNC (uses localStorage for compatibility)
   */
  getDocumentsForLoanSync: (loanId: string): SimpleDocument[] => {
    const allDocs = getDocumentsFromLocalStorage();
    return allDocs.filter(doc => doc.loanId === loanId);
  },
  
  /**
   * Save a document - ASYNC (sends to API)
   */
  saveDocument: async (document: SimpleDocument): Promise<SimpleDocument | null> => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(document),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Also update localStorage
      const allDocs = getDocumentsFromLocalStorage();
      const existingIndex = allDocs.findIndex(doc => doc.id === document.id);
      
      if (existingIndex >= 0) {
        allDocs[existingIndex] = document;
      } else {
        allDocs.push(document);
      }
      
      saveDocumentsToLocalStorage(allDocs);
      
      return data.document;
    } catch (error) {
      console.error('Error saving document:', error);
      
      // Fallback: Save to localStorage only
      const allDocs = getDocumentsFromLocalStorage();
      const existingIndex = allDocs.findIndex(doc => doc.id === document.id);
      
      if (existingIndex >= 0) {
        allDocs[existingIndex] = document;
      } else {
        allDocs.push(document);
      }
      
      saveDocumentsToLocalStorage(allDocs);
      
      return document;
    }
  },
  
  /**
   * Save a document - SYNC (uses localStorage for compatibility)
   */
  saveDocumentSync: (document: SimpleDocument): SimpleDocument => {
    const allDocs = getDocumentsFromLocalStorage();
    const existingIndex = allDocs.findIndex(doc => doc.id === document.id);
    
    if (existingIndex >= 0) {
      allDocs[existingIndex] = document;
    } else {
      allDocs.push(document);
    }
    
    saveDocumentsToLocalStorage(allDocs);
    return document;
  },
  
  /**
   * Delete a document by ID - ASYNC (sends to API)
   */
  deleteDocument: async (docId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/documents?id=${docId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Also update localStorage
      const allDocs = getDocumentsFromLocalStorage();
      const filteredDocs = allDocs.filter(doc => doc.id !== docId);
      saveDocumentsToLocalStorage(filteredDocs);
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error(`Error deleting document ${docId}:`, error);
      
      // Fallback: Delete from localStorage only
      const allDocs = getDocumentsFromLocalStorage();
      const filteredDocs = allDocs.filter(doc => doc.id !== docId);
      saveDocumentsToLocalStorage(filteredDocs);
      
      return allDocs.length !== filteredDocs.length;
    }
  },
  
  /**
   * Delete a document by ID - SYNC (uses localStorage for compatibility)
   */
  deleteDocumentSync: (docId: string): boolean => {
    const allDocs = getDocumentsFromLocalStorage();
    const filteredDocs = allDocs.filter(doc => doc.id !== docId);
    
    if (filteredDocs.length === allDocs.length) {
      return false;
    }
    
    saveDocumentsToLocalStorage(filteredDocs);
    return true;
  },
  
  /**
   * Get a document by ID - ASYNC (fetches from API)
   */
  getDocument: async (docId: string): Promise<SimpleDocument | null> => {
    try {
      const response = await fetch(`/api/document/${docId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.document;
    } catch (error) {
      console.error(`Error fetching document ${docId}:`, error);
      
      // Fallback to localStorage
      const allDocs = getDocumentsFromLocalStorage();
      return allDocs.find(doc => doc.id === docId) || null;
    }
  },
  
  /**
   * Get a document by ID - SYNC (uses localStorage for compatibility)
   */
  getDocumentSync: (docId: string): SimpleDocument | null => {
    const allDocs = getDocumentsFromLocalStorage();
    return allDocs.find(doc => doc.id === docId) || null;
  }
}; 