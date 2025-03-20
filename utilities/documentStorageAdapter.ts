import { LoanDocument, DocumentStatus, DocumentCategory } from './loanDocumentStructure';

// Storage keys
const DOCUMENT_STORAGE_KEY = 'loan_documents';

/**
 * Document Storage Interface
 * Provides a clean abstraction for document storage operations
 */
export interface IDocumentStorage {
  getAllDocuments(): Promise<LoanDocument[]>;
  getDocumentsForLoan(loanId: string): Promise<LoanDocument[]>;
  saveDocument(document: LoanDocument): Promise<LoanDocument>;
  saveDocuments(documents: LoanDocument[]): Promise<LoanDocument[]>;
  updateDocument(document: Partial<LoanDocument> & { id: string }): Promise<boolean>;
  deleteDocument(documentId: string): Promise<boolean>;
  clearAllDocuments(): Promise<void>;
}

/**
 * LocalStorage Document Storage Implementation
 * Handles document persistence in localStorage with proper error handling and validation
 */
export class LocalStorageDocumentStorage implements IDocumentStorage {
  /**
   * Get all documents from storage
   */
  async getAllDocuments(): Promise<LoanDocument[]> {
    try {
      const storedData = localStorage.getItem(DOCUMENT_STORAGE_KEY);
      if (!storedData) return [];
      
      const parsedData = JSON.parse(storedData);
      if (!Array.isArray(parsedData)) {
        console.error('Invalid document data in localStorage: expected array');
        // Reset storage with empty array to prevent future errors
        localStorage.setItem(DOCUMENT_STORAGE_KEY, '[]');
        return [];
      }

      // Validate documents and filter out invalid ones
      const validDocuments = parsedData.filter(doc => this.isValidDocument(doc));
      
      // Update storage if any invalid documents were filtered out
      if (validDocuments.length < parsedData.length) {
        console.warn(`Filtered out ${parsedData.length - validDocuments.length} invalid documents`);
        localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(validDocuments));
      }
      
      return validDocuments;
    } catch (error) {
      console.error('Error retrieving documents from localStorage:', error);
      return [];
    }
  }

  /**
   * Get documents for a specific loan
   */
  async getDocumentsForLoan(loanId: string): Promise<LoanDocument[]> {
    if (!loanId) {
      console.error('Cannot get documents: missing loanId');
      return [];
    }

    try {
      const allDocuments = await this.getAllDocuments();
      return allDocuments.filter(doc => doc.loanId === loanId);
    } catch (error) {
      console.error(`Error getting documents for loan ${loanId}:`, error);
      return [];
    }
  }

  /**
   * Save a document to storage
   */
  async saveDocument(document: LoanDocument): Promise<LoanDocument> {
    if (!this.isValidDocument(document)) {
      console.error('Invalid document cannot be saved:', document);
      throw new Error('Invalid document structure');
    }

    try {
      const allDocuments = await this.getAllDocuments();
      
      // Check if document already exists
      const existingIndex = allDocuments.findIndex(doc => doc.id === document.id);
      
      if (existingIndex >= 0) {
        // Update existing document
        allDocuments[existingIndex] = document;
      } else {
        // Add new document
        allDocuments.push(document);
      }
      
      // Save to localStorage
      localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(allDocuments));
      return document;
    } catch (error) {
      console.error('Error saving document to localStorage:', error);
      throw error;
    }
  }

  /**
   * Save multiple documents at once
   */
  async saveDocuments(documents: LoanDocument[]): Promise<LoanDocument[]> {
    // Validate all documents
    const validDocuments = documents.filter(doc => this.isValidDocument(doc));
    
    if (validDocuments.length < documents.length) {
      console.warn(`Skipping ${documents.length - validDocuments.length} invalid documents`);
    }
    
    if (validDocuments.length === 0) {
      return [];
    }

    try {
      const allDocuments = await this.getAllDocuments();
      
      // Process each document, either updating existing ones or adding new ones
      for (const document of validDocuments) {
        const existingIndex = allDocuments.findIndex(doc => doc.id === document.id);
        
        if (existingIndex >= 0) {
          // Update existing document
          allDocuments[existingIndex] = document;
        } else {
          // Add new document
          allDocuments.push(document);
        }
      }
      
      // Save to localStorage
      localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(allDocuments));
      return validDocuments;
    } catch (error) {
      console.error('Error saving documents to localStorage:', error);
      throw error;
    }
  }

  /**
   * Update an existing document
   */
  async updateDocument(document: Partial<LoanDocument> & { id: string }): Promise<boolean> {
    if (!document.id) {
      console.error('Cannot update document without ID');
      return false;
    }

    try {
      const allDocuments = await this.getAllDocuments();
      const docIndex = allDocuments.findIndex(doc => doc.id === document.id);
      
      if (docIndex < 0) {
        console.warn(`Document with ID ${document.id} not found for update`);
        return false;
      }
      
      // Update document with new properties
      allDocuments[docIndex] = {
        ...allDocuments[docIndex],
        ...document
      };
      
      // Save to localStorage
      localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(allDocuments));
      return true;
    } catch (error) {
      console.error(`Error updating document ${document.id}:`, error);
      return false;
    }
  }

  /**
   * Delete a document by ID
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    if (!documentId) {
      console.error('Cannot delete document without ID');
      return false;
    }

    try {
      const allDocuments = await this.getAllDocuments();
      const initialCount = allDocuments.length;
      
      // Filter out the document to delete
      const filteredDocuments = allDocuments.filter(doc => doc.id !== documentId);
      
      if (filteredDocuments.length === initialCount) {
        console.warn(`Document with ID ${documentId} not found for deletion`);
        return false;
      }
      
      // Save to localStorage
      localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(filteredDocuments));
      return true;
    } catch (error) {
      console.error(`Error deleting document ${documentId}:`, error);
      return false;
    }
  }

  /**
   * Clear all documents from storage
   */
  async clearAllDocuments(): Promise<void> {
    try {
      localStorage.setItem(DOCUMENT_STORAGE_KEY, '[]');
    } catch (error) {
      console.error('Error clearing documents from localStorage:', error);
      throw error;
    }
  }

  /**
   * Validate document structure
   */
  private isValidDocument(doc: any): doc is LoanDocument {
    return (
      doc &&
      typeof doc === 'object' &&
      typeof doc.id === 'string' &&
      typeof doc.loanId === 'string' &&
      typeof doc.filename === 'string' &&
      typeof doc.docType === 'string' &&
      typeof doc.category === 'string' &&
      // Check that category is a valid DocumentCategory
      ['borrower', 'property', 'closing', 'servicing', 'misc'].includes(doc.category) &&
      typeof doc.section === 'string' &&
      // Check that status is a valid DocumentStatus or default to 'required'
      (!doc.status || ['required', 'pending', 'approved', 'rejected', 'received', 'reviewed'].includes(doc.status))
    );
  }
}

// Create and export a singleton instance
export const documentStorage = new LocalStorageDocumentStorage(); 