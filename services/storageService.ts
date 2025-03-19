import { kv } from '@vercel/kv';
import { SimpleDocument } from '@/utilities/simplifiedDocumentService';
import { KV_CONFIG, localStorageFallback, isVercelKVConfigured } from '@/configuration/storageConfig';

// Prefixes for different data types
const DOCUMENT_PREFIX = KV_CONFIG.DOCUMENT_PREFIX;
const LOAN_PREFIX = KV_CONFIG.LOAN_PREFIX;
const DOCUMENT_LIST_KEY = KV_CONFIG.DOCUMENT_LIST_KEY;
const DOCUMENT_BY_LOAN_PREFIX = KV_CONFIG.DOCUMENT_BY_LOAN_PREFIX;

// Check if we should use the fallback mechanism
const useFallback = !isVercelKVConfigured() || KV_CONFIG.USE_FALLBACK;

// Log the storage mode
console.log(`Storage Mode: ${useFallback ? 'localStorage Fallback' : 'Vercel KV'}`);

/**
 * A unified storage service using Vercel KV (Redis) as the backend
 * This replaces the mix of localStorage, IndexedDB, and other storage mechanisms
 * 
 * In development without Vercel KV configured, it falls back to localStorage
 */
export const storageService = {
  // Document Operations
  
  /**
   * Save a document to storage
   */
  saveDocument: async (document: SimpleDocument): Promise<SimpleDocument> => {
    try {
      if (useFallback) {
        // Fallback: Use localStorage
        const allDocs = localStorageFallback.getAllDocuments();
        
        // Find and remove existing document with same ID if exists
        const filteredDocs = allDocs.filter(doc => doc.id !== document.id);
        
        // Add the new document
        filteredDocs.push(document);
        
        // Save all documents
        localStorageFallback.saveAllDocuments(filteredDocs);
        
        console.log(`Successfully saved document (localStorage): ${document.id} for loan: ${document.loanId}`);
        return document;
      }
      
      // Use Vercel KV
      const docKey = `${DOCUMENT_PREFIX}${document.id}`;
      
      // Store the document in KV
      await kv.set(docKey, document);
      
      // Add to the document list
      await kv.sadd(DOCUMENT_LIST_KEY, document.id);
      
      // Add to the loan's document list
      if (document.loanId) {
        const loanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${document.loanId}`;
        await kv.sadd(loanDocListKey, document.id);
      }
      
      console.log(`Successfully saved document (KV): ${document.id} for loan: ${document.loanId}`);
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
      if (useFallback) {
        // Fallback: Use localStorage
        const allDocs = localStorageFallback.getAllDocuments();
        return allDocs.find(doc => doc.id === docId) || null;
      }
      
      // Use Vercel KV
      const docKey = `${DOCUMENT_PREFIX}${docId}`;
      const document = await kv.get<SimpleDocument>(docKey);
      return document;
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
      if (useFallback) {
        // Fallback: Use localStorage
        const allDocs = localStorageFallback.getAllDocuments();
        const filteredDocs = allDocs.filter(doc => doc.id !== docId);
        
        if (filteredDocs.length === allDocs.length) {
          // No document was removed
          return false;
        }
        
        // Save the filtered documents
        localStorageFallback.saveAllDocuments(filteredDocs);
        console.log(`Successfully deleted document (localStorage): ${docId}`);
        return true;
      }
      
      // Use Vercel KV
      const docKey = `${DOCUMENT_PREFIX}${docId}`;
      
      // First get the document to find its loanId
      const document = await kv.get<SimpleDocument>(docKey);
      
      if (document) {
        // Remove from the loan's document list
        if (document.loanId) {
          const loanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${document.loanId}`;
          await kv.srem(loanDocListKey, docId);
        }
        
        // Remove from the document list
        await kv.srem(DOCUMENT_LIST_KEY, docId);
        
        // Delete the document itself
        await kv.del(docKey);
        
        console.log(`Successfully deleted document (KV): ${docId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error deleting document ${docId}:`, error);
      return false;
    }
  },
  
  /**
   * Get all documents (with pagination option)
   */
  getAllDocuments: async (limit = 1000, cursor = 0): Promise<{documents: SimpleDocument[], nextCursor: number | null}> => {
    try {
      if (useFallback) {
        // Fallback: Use localStorage
        const allDocs = localStorageFallback.getAllDocuments();
        
        const total = allDocs.length;
        const slicedDocs = allDocs.slice(cursor, cursor + limit);
        const nextCursor = cursor + limit < total ? cursor + limit : null;
        
        return { documents: slicedDocs, nextCursor };
      }
      
      // Use Vercel KV
      // Get all document IDs
      const docIds = await kv.smembers(DOCUMENT_LIST_KEY) as string[];
      
      const total = docIds.length;
      const slicedIds = docIds.slice(cursor, cursor + limit);
      const nextCursor = cursor + limit < total ? cursor + limit : null;
      
      // Get all documents in batch
      const documents: SimpleDocument[] = [];
      for (const docId of slicedIds) {
        const docKey = `${DOCUMENT_PREFIX}${docId}`;
        const doc = await kv.get<SimpleDocument>(docKey);
        if (doc) {
          documents.push(doc);
        }
      }
      
      return { documents, nextCursor };
    } catch (error) {
      console.error('Error retrieving all documents:', error);
      return { documents: [], nextCursor: null };
    }
  },
  
  /**
   * Get documents for a specific loan
   */
  getDocumentsForLoan: async (loanId: string): Promise<SimpleDocument[]> => {
    try {
      console.log(`🔍 Getting documents for loan ID: ${loanId}`);
      
      if (useFallback) {
        // Fallback: Use localStorage
        const allDocs = localStorageFallback.getAllDocuments();
        const loanDocs = allDocs.filter(doc => doc.loanId === loanId);
        
        console.log(`📋 Found ${loanDocs.length} documents for loan ${loanId} (localStorage)`);
        return loanDocs;
      }
      
      // Use Vercel KV
      const loanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${loanId}`;
      
      // Get all document IDs for this loan
      const docIds = await kv.smembers(loanDocListKey) as string[];
      console.log(`📋 Found ${docIds.length} document IDs for loan ${loanId}`);
      
      if (docIds.length === 0) {
        return [];
      }
      
      // Get all documents in batch
      const documents: SimpleDocument[] = [];
      for (const docId of docIds) {
        const docKey = `${DOCUMENT_PREFIX}${docId}`;
        const doc = await kv.get<SimpleDocument>(docKey);
        if (doc) {
          documents.push(doc);
        }
      }
      
      console.log(`📂 Retrieved ${documents.length} documents for loan ID ${loanId} (KV)`);
      return documents;
    } catch (error) {
      console.error(`❌ Error getting loan documents for ${loanId}:`, error);
      return [];
    }
  },
  
  /**
   * Update a document
   */
  updateDocument: async (document: SimpleDocument): Promise<SimpleDocument | null> => {
    try {
      if (useFallback) {
        // Fallback: Use localStorage
        const allDocs = localStorageFallback.getAllDocuments();
        const docIndex = allDocs.findIndex(doc => doc.id === document.id);
        
        if (docIndex === -1) {
          console.error(`Document ${document.id} not found for update (localStorage)`);
          return null;
        }
        
        // Update the document
        allDocs[docIndex] = document;
        
        // Save all documents
        localStorageFallback.saveAllDocuments(allDocs);
        
        console.log(`Successfully updated document (localStorage): ${document.id}`);
        return document;
      }
      
      // Use Vercel KV
      const docKey = `${DOCUMENT_PREFIX}${document.id}`;
      
      // First check if the document exists
      const existingDoc = await kv.get<SimpleDocument>(docKey);
      
      if (!existingDoc) {
        console.error(`Document ${document.id} not found for update (KV)`);
        return null;
      }
      
      // If the loanId is changing, update the loan document lists
      if (existingDoc.loanId !== document.loanId) {
        // Remove from old loan's document list
        if (existingDoc.loanId) {
          const oldLoanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${existingDoc.loanId}`;
          await kv.srem(oldLoanDocListKey, document.id);
        }
        
        // Add to new loan's document list
        if (document.loanId) {
          const newLoanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${document.loanId}`;
          await kv.sadd(newLoanDocListKey, document.id);
        }
      }
      
      // Update the document
      await kv.set(docKey, document);
      
      console.log(`Successfully updated document (KV): ${document.id}`);
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
      if (useFallback) {
        // Fallback: Use localStorage
        localStorageFallback.setItem('simple_documents', '[]');
        console.log('Successfully cleared all documents (localStorage)');
        return true;
      }
      
      // Use Vercel KV
      // Get all document IDs
      const docIds = await kv.smembers(DOCUMENT_LIST_KEY) as string[];
      
      // Delete each document
      for (const docId of docIds) {
        const docKey = `${DOCUMENT_PREFIX}${docId}`;
        await kv.del(docKey);
      }
      
      // Clear the document list
      await kv.del(DOCUMENT_LIST_KEY);
      
      // Get all loan keys
      const loanKeys = await kv.keys(`${DOCUMENT_BY_LOAN_PREFIX}*`);
      
      // Delete each loan document list
      for (const key of loanKeys) {
        await kv.del(key);
      }
      
      console.log('Successfully cleared all documents (KV)');
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
      if (useFallback) {
        // Fallback: Use localStorage
        const allDocs = localStorageFallback.getAllDocuments();
        
        // Find documents with missing or incorrect loanId
        const unassociatedDocs = allDocs.filter(doc => 
          // Documents with no loanId
          !doc.loanId || 
          // Documents with empty string loanId 
          doc.loanId === '' ||
          // Documents with 'undefined' as string
          doc.loanId === 'undefined'
        );
        
        console.log(`Found ${unassociatedDocs.length} documents to fix (localStorage)`);
        
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
        localStorageFallback.saveAllDocuments(updatedDocs);
        
        console.log(`Successfully fixed ${unassociatedDocs.length} document associations (localStorage)`);
        return unassociatedDocs.map(doc => ({ ...doc, loanId: targetLoanId }));
      }
      
      // Use Vercel KV
      const loanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${loanId}`;
      const targetLoanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${targetLoanId}`;
      
      // Get all document IDs for this loan
      const docIds = await kv.smembers(loanDocListKey) as string[];
      console.log(`Found ${docIds.length} documents to reassociate from ${loanId} to ${targetLoanId} (KV)`);
      
      const updatedDocs: SimpleDocument[] = [];
      
      // Update each document
      for (const docId of docIds) {
        const docKey = `${DOCUMENT_PREFIX}${docId}`;
        const doc = await kv.get<SimpleDocument>(docKey);
        
        if (doc) {
          // Update the loanId
          const updatedDoc = { 
            ...doc, 
            loanId: targetLoanId 
          };
          
          // Save the updated document
          await kv.set(docKey, updatedDoc);
          
          // Move from old loan to new loan
          await kv.srem(loanDocListKey, docId);
          await kv.sadd(targetLoanDocListKey, docId);
          
          updatedDocs.push(updatedDoc);
        }
      }
      
      console.log(`Successfully reassociated ${updatedDocs.length} documents (KV)`);
      return updatedDocs;
    } catch (error) {
      console.error(`Error fixing document associations for ${loanId}:`, error);
      return [];
    }
  },
  
  /**
   * Deduplicate documents for a loan by type
   */
  deduplicateLoanDocuments: async (loanId: string): Promise<SimpleDocument[]> => {
    try {
      console.log(`Deduplicating documents for loan ${loanId}`);
      
      // Get all documents for this loan
      const loanDocs = await storageService.getDocumentsForLoan(loanId);
      
      // Group documents by docType
      const docsByType: Record<string, SimpleDocument[]> = {};
      
      // Organize documents by type
      loanDocs.forEach(doc => {
        if (!docsByType[doc.docType]) {
          docsByType[doc.docType] = [];
        }
        docsByType[doc.docType].push(doc);
      });
      
      let dupsRemoved = 0;
      const docsToKeep: SimpleDocument[] = [];
      
      // For each document type
      for (const docType in docsByType) {
        const docsOfThisType = docsByType[docType];
        
        // If we have more than one document of this type
        if (docsOfThisType.length > 1) {
          // Sort by date uploaded (newest first)
          docsOfThisType.sort((a, b) => 
            new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime()
          );
          
          // Keep the newest one
          const newestDoc = docsOfThisType[0];
          docsToKeep.push(newestDoc);
          
          // Delete all others
          for (let i = 1; i < docsOfThisType.length; i++) {
            const docToRemove = docsOfThisType[i];
            await storageService.deleteDocument(docToRemove.id);
            dupsRemoved++;
          }
        } else {
          // Just one document of this type, keep it
          docsToKeep.push(docsOfThisType[0]);
        }
      }
      
      console.log(`Removed ${dupsRemoved} duplicate documents for loan ${loanId}`);
      return docsToKeep;
    } catch (error) {
      console.error(`Error deduplicating loan documents for ${loanId}:`, error);
      return [];
    }
  },
  
  /**
   * Migrate documents from localStorage to Vercel KV
   * Use this to transition from the old storage to the new one
   */
  migrateFromLocalStorage: async (): Promise<{migrated: number, errors: number}> => {
    if (useFallback) {
      console.log('Cannot migrate when in fallback mode');
      return { migrated: 0, errors: 0 };
    }
    
    try {
      // Get all documents from localStorage
      const oldDocs = localStorageFallback.getAllDocuments();
      console.log(`Found ${oldDocs.length} documents to migrate from localStorage`);
      
      let migrated = 0;
      let errors = 0;
      
      // Migrate each document
      for (const doc of oldDocs) {
        try {
          await storageService.saveDocument(doc);
          migrated++;
        } catch (error) {
          console.error(`Error migrating document ${doc.id}:`, error);
          errors++;
        }
      }
      
      console.log(`Migration complete: ${migrated} documents migrated, ${errors} errors`);
      return { migrated, errors };
    } catch (error) {
      console.error('Error during migration:', error);
      return { migrated: 0, errors: 1 };
    }
  },
  
  // Get documents that don't have a loan ID
  async getUnassociatedDocuments(): Promise<SimpleDocument[]> {
    const USE_FALLBACK = KV_CONFIG.USE_FALLBACK || !isVercelKVConfigured();
    console.log(`[Storage] Getting unassociated documents, using ${USE_FALLBACK ? 'localStorage fallback' : 'Vercel KV'}`);
    
    const unassociatedDocs: SimpleDocument[] = [];
    
    if (USE_FALLBACK) {
      // Local storage fallback
      const allDocsKey = KV_CONFIG.DOCUMENT_LIST_KEY;
      let allDocs = [];
      
      try {
        const storedDocs = localStorage.getItem(allDocsKey);
        if (storedDocs) {
          allDocs = JSON.parse(storedDocs);
        }
      } catch (error) {
        console.error('Error retrieving all documents from localStorage:', error);
        return [];
      }
      
      // Find unassociated documents
      for (const doc of allDocs) {
        if (!doc.loanId || doc.loanId === 'undefined' || doc.loanId === 'null') {
          unassociatedDocs.push(doc);
        }
      }
    } else {
      // Vercel KV
      const docKeys = await kv.keys(`${KV_CONFIG.DOCUMENT_PREFIX}:*`);
      
      for (const key of docKeys) {
        const doc = await kv.get<SimpleDocument>(key);
        if (doc && (!doc.loanId || doc.loanId === 'undefined' || doc.loanId === 'null')) {
          unassociatedDocs.push(doc);
        }
      }
    }
    
    return unassociatedDocs;
  },
  
  // Fix unassociated documents (documents without a loanId)
  async fixUnassociatedDocuments(loanId: string): Promise<SimpleDocument[]> {
    const USE_FALLBACK = KV_CONFIG.USE_FALLBACK || !isVercelKVConfigured();
    console.log(`[Storage] Fixing unassociated documents for loan ${loanId}, using ${USE_FALLBACK ? 'localStorage fallback' : 'Vercel KV'}`);
    
    const fixedDocuments: SimpleDocument[] = [];
    
    if (USE_FALLBACK) {
      // Local storage fallback
      const allDocsKey = KV_CONFIG.DOCUMENT_LIST_KEY;
      let allDocs = [];
      
      try {
        const storedDocs = localStorage.getItem(allDocsKey);
        if (storedDocs) {
          allDocs = JSON.parse(storedDocs);
        }
      } catch (error) {
        console.error('Error retrieving all documents from localStorage:', error);
        return [];
      }
      
      // Find unassociated documents
      const updatedDocs = allDocs.map((doc: SimpleDocument) => {
        if (!doc.loanId || doc.loanId === 'undefined' || doc.loanId === 'null') {
          // Update the document
          doc.loanId = loanId;
          fixedDocuments.push(doc);
          
          // Also update the individual document
          try {
            const docKey = `${KV_CONFIG.DOCUMENT_PREFIX}:${doc.id}`;
            localStorage.setItem(docKey, JSON.stringify(doc));
          } catch (error) {
            console.error(`Error updating document ${doc.id} in localStorage:`, error);
          }
        }
        return doc;
      });
      
      // Save the updated document list
      try {
        localStorage.setItem(allDocsKey, JSON.stringify(updatedDocs));
      } catch (error) {
        console.error('Error saving updated document list to localStorage:', error);
      }
      
      // Update the loan documents list
      await this.updateLoanDocumentsList(loanId, fixedDocuments);
    } else {
      // Vercel KV
      // Get all documents without loanId
      const docKeys = await kv.keys(`${KV_CONFIG.DOCUMENT_PREFIX}:*`);
      
      for (const key of docKeys) {
        const doc = await kv.get<SimpleDocument>(key);
        if (doc && (!doc.loanId || doc.loanId === 'undefined' || doc.loanId === 'null')) {
          // Update the document
          doc.loanId = loanId;
          await kv.set(key, doc);
          
          // Add to fixed documents list
          fixedDocuments.push(doc);
          
          // Add to loan documents list
          const loanDocsKey = `${KV_CONFIG.DOCUMENT_BY_LOAN_PREFIX}:${loanId}`;
          await kv.sadd(loanDocsKey, doc.id);
        }
      }
    }
    
    return fixedDocuments;
  },
  
  // Helper method to update the loan documents list
  async updateLoanDocumentsList(loanId: string, documents: SimpleDocument[]): Promise<void> {
    const USE_FALLBACK = KV_CONFIG.USE_FALLBACK || !isVercelKVConfigured();
    
    if (documents.length === 0) return;
    
    if (USE_FALLBACK) {
      // Add document IDs to loan-specific document list in localStorage
      const loanDocsKey = `${KV_CONFIG.DOCUMENT_BY_LOAN_PREFIX}:${loanId}`;
      let existingIds: string[] = [];
      
      try {
        const storedIds = localStorage.getItem(loanDocsKey);
        if (storedIds) {
          existingIds = JSON.parse(storedIds);
        }
      } catch (error) {
        console.error(`Error retrieving document IDs for loan ${loanId} from localStorage:`, error);
      }
      
      // Add the new document IDs
      const newIds = documents.map(doc => doc.id);
      const updatedIds = Array.from(new Set([...existingIds, ...newIds]));
      
      try {
        localStorage.setItem(loanDocsKey, JSON.stringify(updatedIds));
      } catch (error) {
        console.error(`Error saving document IDs for loan ${loanId} to localStorage:`, error);
      }
    } else {
      // Add document IDs to loan-specific document list in Vercel KV
      const loanDocsKey = `${KV_CONFIG.DOCUMENT_BY_LOAN_PREFIX}:${loanId}`;
      const docIds = documents.map(doc => doc.id);
      
      // Add all IDs to the set
      if (docIds.length > 0) {
        // Add IDs one by one to avoid spread operator issues
        for (const id of docIds) {
          await kv.sadd(loanDocsKey, id);
        }
      }
    }
  }
};

export default storageService; 