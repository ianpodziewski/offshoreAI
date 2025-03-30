// services/storageMiddleware.ts
import { SimpleDocument } from '@/utilities/simplifiedDocumentService';
import { STORAGE_CONFIG } from '@/configuration/storageConfig';

// Define interface for storage operations, matching the implementations
export interface StorageInterface {
  // Document operations
  saveDocument: (document: SimpleDocument) => Promise<SimpleDocument> | boolean;
  getDocument: (docId: string) => Promise<SimpleDocument | null> | (SimpleDocument | null);
  deleteDocument: (docId: string) => Promise<boolean> | boolean;
  getDocumentsForLoan: (loanId: string) => Promise<SimpleDocument[]> | SimpleDocument[];
  getAllDocuments: (page?: number, pageSize?: number) => Promise<{
    documents: SimpleDocument[];
    totalCount?: number;
    nextCursor?: number | null;
  }> | {
    documents: SimpleDocument[];
    totalCount: number;
  };
  
  // Optional methods (may only exist in server implementation)
  saveUserData?: (userId: string, data: any) => Promise<boolean> | boolean;
  getUserData?: (userId: string) => Promise<any> | any;
  saveLoanData?: (loanId: string, data: any) => Promise<boolean> | boolean;
  getLoanData?: (loanId: string) => Promise<any> | any;
  updateLoanDocumentsList?: (loanId: string, documents: SimpleDocument[]) => Promise<void> | void;
  fixDocumentAssociations?: (loanId: string, targetLoanId?: string) => Promise<SimpleDocument[]>;
  deduplicateLoanDocuments?: (loanId: string) => Promise<SimpleDocument[]>;
}

// Factory function to import the correct storage service based on environment
export async function getStorageService(): Promise<StorageInterface> {
  // Check if we're in a client environment
  const isClient = typeof window !== 'undefined';
  
  // Always use client storage in client context
  if (isClient) {
    const { default: clientStorageService } = await import('./clientStorageService');
    return clientStorageService;
  }
  
  // Server context
  // Check if we should use fallback mode
  if (STORAGE_CONFIG.USE_FALLBACK) {
    // Even on server, use fallback (which will return empty results)
    const { default: clientStorageService } = await import('./clientStorageService');
    return clientStorageService;
  }
  
  // Use server implementation with Redis
  const { storageService } = await import('./storageService');
  return storageService;
} 