// Configuration settings for storage service
import { SimpleDocument } from '@/utilities/simplifiedDocumentService';

// Check if we're in a browser environment and can use localStorage
const isBrowser = typeof window !== 'undefined';

// Environment information
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Storage keys for localStorage
export const STORAGE_KEYS = {
  DOCUMENTS: 'simple_documents',
  DOCUMENT_IDS_BY_LOAN: 'document_ids_by_loan',
  INDEXED_DB_MIGRATION: 'indexeddb_migration_done'
};

// Helper for localStorage storage
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

// For compatibility with existing code, these functions now always return false
export const isRedisConfigured = (): boolean => false;
export const isVercelKVConfigured = (): boolean => false;

// Configuration for storage
export const STORAGE_CONFIG = {
  // Prefixes for different data types (keeping these for consistency with existing code)
  DOCUMENT_PREFIX: 'doc:',
  LOAN_PREFIX: 'loan:',
  DOCUMENT_LIST_KEY: 'document_list',
  DOCUMENT_BY_LOAN_PREFIX: 'docs_by_loan:',
  
  // Always use localStorage
  USE_FALLBACK: true,
  
  // Log level
  LOG_LEVEL: IS_PRODUCTION ? 'error' : 'debug',
  
  // Storage mode name for diagnostics/display
  get MODE_NAME() {
    return 'localStorage';
  }
};

// For backward compatibility
export const KV_CONFIG = STORAGE_CONFIG;

// Export the config
export default STORAGE_CONFIG; 