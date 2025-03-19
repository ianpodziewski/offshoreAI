// Configuration settings for storage service
import { SimpleDocument } from '@/utilities/simplifiedDocumentService';

// Check if we're in a browser environment and can use localStorage
const isBrowser = typeof window !== 'undefined';

// Environment information
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Storage fallback keys (for localStorage in development)
export const STORAGE_KEYS = {
  DOCUMENTS: 'simple_documents',
  DOCUMENT_IDS_BY_LOAN: 'document_ids_by_loan',
  INDEXED_DB_MIGRATION: 'indexeddb_migration_done'
};

// Helper for localStorage fallback when Vercel KV is not available in development
export const localStorageFallback = {
  getItem: (key: string): string | null => {
    if (!isBrowser) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Error accessing localStorage for key ${key}:`, error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Error writing to localStorage for key ${key}:`, error);
    }
  },
  
  removeItem: (key: string): void => {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing from localStorage for key ${key}:`, error);
    }
  },
  
  // Get all documents from localStorage
  getAllDocuments: (): SimpleDocument[] => {
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
  
  // Save all documents to localStorage
  saveAllDocuments: (documents: SimpleDocument[]): void => {
    if (!isBrowser) return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch (error) {
      console.error('Error saving documents to localStorage:', error);
    }
  }
};

// Configuration for Vercel KV
export const KV_CONFIG = {
  // Prefixes for different data types
  DOCUMENT_PREFIX: 'doc:',
  LOAN_PREFIX: 'loan:',
  DOCUMENT_LIST_KEY: 'document_list',
  DOCUMENT_BY_LOAN_PREFIX: 'docs_by_loan:',
  
  // Use a fallback mechanism in development environment
  USE_FALLBACK: IS_DEVELOPMENT && !process.env.VERCEL_KV_URL,
  
  // Log level
  LOG_LEVEL: IS_PRODUCTION ? 'error' : 'debug',
};

// Detect if Vercel KV is properly configured
export const isVercelKVConfigured = (): boolean => {
  const hasKVUrl = !!process.env.VERCEL_KV_URL;
  const hasKVRestToken = !!process.env.VERCEL_KV_REST_API_TOKEN;
  const hasKVRestUrl = !!process.env.VERCEL_KV_REST_API_URL;
  
  return hasKVUrl || (hasKVRestToken && hasKVRestUrl);
};

// Export the config
export default KV_CONFIG; 