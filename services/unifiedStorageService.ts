import { SimpleDocument } from '@/utilities/simplifiedDocumentService';
import { getStorageService, StorageInterface } from './storageMiddleware';

/**
 * Unified Storage Service - provides consistent API regardless of environment.
 * This service adapts between server-side Redis storage and client-side localStorage.
 */
class UnifiedStorageService {
  private storageServicePromise: Promise<StorageInterface>;
  
  constructor() {
    // Initialize the storage service
    this.storageServicePromise = getStorageService();
  }
  
  /**
   * Save a document to storage
   */
  async saveDocument(document: SimpleDocument): Promise<SimpleDocument> {
    const storage = await this.storageServicePromise;
    const result = await storage.saveDocument(document);
    // Client side returns boolean, server side returns document
    return typeof result === 'boolean' ? document : result;
  }
  
  /**
   * Get a document by ID
   */
  async getDocument(docId: string): Promise<SimpleDocument | null> {
    const storage = await this.storageServicePromise;
    return storage.getDocument(docId);
  }
  
  /**
   * Delete a document by ID
   */
  async deleteDocument(docId: string): Promise<boolean> {
    const storage = await this.storageServicePromise;
    return storage.deleteDocument(docId);
  }
  
  /**
   * Get all documents for a specific loan
   */
  async getDocumentsForLoan(loanId: string): Promise<SimpleDocument[]> {
    const storage = await this.storageServicePromise;
    return storage.getDocumentsForLoan(loanId);
  }
  
  /**
   * Get all documents with pagination
   */
  async getAllDocuments(page = 0, pageSize = 50): Promise<{
    documents: SimpleDocument[];
    totalCount: number;
  }> {
    const storage = await this.storageServicePromise;
    const result = await storage.getAllDocuments(page, pageSize);
    
    // Normalize the response to ensure it has totalCount
    return {
      documents: result.documents,
      totalCount: result.totalCount || result.documents.length
    };
  }
  
  /**
   * Save user data
   */
  async saveUserData(userId: string, data: any): Promise<boolean> {
    const storage = await this.storageServicePromise;
    if (!storage.saveUserData) {
      console.warn('saveUserData not implemented in current storage provider');
      return false;
    }
    return storage.saveUserData(userId, data);
  }
  
  /**
   * Get user data
   */
  async getUserData(userId: string): Promise<any> {
    const storage = await this.storageServicePromise;
    if (!storage.getUserData) {
      console.warn('getUserData not implemented in current storage provider');
      return null;
    }
    return storage.getUserData(userId);
  }
  
  /**
   * Save loan data
   */
  async saveLoanData(loanId: string, data: any): Promise<boolean> {
    const storage = await this.storageServicePromise;
    if (!storage.saveLoanData) {
      console.warn('saveLoanData not implemented in current storage provider');
      return false;
    }
    return storage.saveLoanData(loanId, data);
  }
  
  /**
   * Get loan data
   */
  async getLoanData(loanId: string): Promise<any> {
    const storage = await this.storageServicePromise;
    if (!storage.getLoanData) {
      console.warn('getLoanData not implemented in current storage provider');
      return null;
    }
    return storage.getLoanData(loanId);
  }
  
  /**
   * Fix document associations (optional, server-side only)
   */
  async fixDocumentAssociations(loanId: string, targetLoanId?: string): Promise<SimpleDocument[]> {
    const storage = await this.storageServicePromise;
    if (!storage.fixDocumentAssociations) {
      console.warn('fixDocumentAssociations not implemented in current storage provider');
      return [];
    }
    return storage.fixDocumentAssociations(loanId, targetLoanId);
  }
  
  /**
   * Deduplicate loan documents (optional, server-side only)
   */
  async deduplicateLoanDocuments(loanId: string): Promise<SimpleDocument[]> {
    const storage = await this.storageServicePromise;
    if (!storage.deduplicateLoanDocuments) {
      console.warn('deduplicateLoanDocuments not implemented in current storage provider');
      return [];
    }
    return storage.deduplicateLoanDocuments(loanId);
  }
}

// Export a singleton instance
export const unifiedStorageService = new UnifiedStorageService();

// Also export as default for compatibility
export default unifiedStorageService; 