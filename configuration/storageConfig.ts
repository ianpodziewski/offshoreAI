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

// Helper for localStorage fallback when Redis is not available in development
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

// Detect if Redis is properly configured
export const isRedisConfigured = (): boolean => {
  // Check for REDIS_URL in the environment
  const hasRedisUrl = !!process.env.REDIS_URL;
  
  // Log the Redis configuration status for debugging
  if (IS_DEVELOPMENT) {
    console.log(`Redis configuration status: ${hasRedisUrl ? 'Configured' : 'Not configured'}`);
    if (hasRedisUrl && process.env.REDIS_URL) {
      console.log(`Redis URL begins with: ${process.env.REDIS_URL.substring(0, 8)}...`);
    }
  }
  
  return hasRedisUrl;
};

// We want to prioritize Redis for document storage to support the chatbot
// Only fall back to localStorage if Redis is truly not available
const shouldUseFallback = (): boolean => {
  // In server-side context, never use fallback
  if (!isBrowser) return false;
  
  // In production, never use fallback 
  if (IS_PRODUCTION) return false;
  
  // In development, only use fallback if Redis is not configured
  return !isRedisConfigured();
};

// Configuration for Redis storage
export const STORAGE_CONFIG = {
  // Prefixes for different data types
  DOCUMENT_PREFIX: 'doc:',
  LOAN_PREFIX: 'loan:',
  DOCUMENT_LIST_KEY: 'document_list',
  DOCUMENT_BY_LOAN_PREFIX: 'docs_by_loan:',
  
  // Use a fallback mechanism only when Redis is unavailable
  USE_FALLBACK: shouldUseFallback(),
  
  // Redis URL (only used server-side)
  REDIS_URL: process.env.REDIS_URL || '',
  
  // Log level
  LOG_LEVEL: IS_PRODUCTION ? 'error' : 'debug',
  
  // Storage mode name for diagnostics/display
  get MODE_NAME() {
    return this.USE_FALLBACK ? 'localStorage' : 'Redis';
  }
};

// For backward compatibility
export const KV_CONFIG = STORAGE_CONFIG;

// Legacy function name maintained for backward compatibility
export const isVercelKVConfigured = isRedisConfigured;

// Export the config
export default STORAGE_CONFIG; 