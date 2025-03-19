import { SimpleDocument } from '@/utilities/simplifiedDocumentService';
import { STORAGE_CONFIG, localStorageFallback, isRedisConfigured, STORAGE_KEYS } from '@/configuration/storageConfig';
import { serverRedisUtil } from '@/lib/redis-server';

// Prefixes for different data types
const DOCUMENT_PREFIX = STORAGE_CONFIG.DOCUMENT_PREFIX;
const LOAN_PREFIX = STORAGE_CONFIG.LOAN_PREFIX;
const DOCUMENT_LIST_KEY = STORAGE_CONFIG.DOCUMENT_LIST_KEY;
const DOCUMENT_BY_LOAN_PREFIX = STORAGE_CONFIG.DOCUMENT_BY_LOAN_PREFIX;

// Add a more reliable check for Redis configuration
const isRedisAvailable = () => {
  // Check if we have a Redis URL in the environment
  const hasRedisUrl = typeof process !== 'undefined' && !!process.env.REDIS_URL;
  console.log(`Redis URL detection: ${hasRedisUrl ? 'Found' : 'Not found'}`);
  return hasRedisUrl;
};

// Add a check to make sure we avoid localStorage operations on the server-side
// Update the "useFallback" check
const isBrowser = typeof window !== 'undefined';
const useRedis = isRedisAvailable() && !STORAGE_CONFIG.USE_FALLBACK;
const useFallback = !useRedis && isBrowser;

// Log the storage mode with more details
console.log(`Storage Mode Decision:
  - Is browser environment: ${isBrowser}
  - Redis URL available: ${isRedisAvailable()}
  - CONFIG.USE_FALLBACK: ${STORAGE_CONFIG.USE_FALLBACK}
  - Using Redis: ${useRedis}
  - Using Fallback: ${useFallback}
  - Final Storage Mode: ${useFallback ? 'localStorage Fallback' : 'Redis'}`);

/**
 * A unified storage service using Redis as the backend
 * This replaces the mix of localStorage, IndexedDB, and other storage mechanisms
 * 
 * In development without Redis configured, it falls back to localStorage
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
      
      // Use Redis
      const docKey = `${DOCUMENT_PREFIX}${document.id}`;
      
      // Store the document in Redis (need to JSON.stringify)
      await serverRedisUtil.set(docKey, JSON.stringify(document));
      
      // Add to the document list
      await serverRedisUtil.sadd(DOCUMENT_LIST_KEY, document.id);
      
      // Add to the loan's document list
      if (document.loanId) {
        const loanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${document.loanId}`;
        await serverRedisUtil.sadd(loanDocListKey, document.id);
      }
      
      console.log(`Successfully saved document (Redis): ${document.id} for loan: ${document.loanId}`);
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
      
      // Use Redis
      const docKey = `${DOCUMENT_PREFIX}${docId}`;
      const documentStr = await serverRedisUtil.get(docKey);
      
      if (!documentStr) return null;
      
      // Parse the JSON string back to an object
      return JSON.parse(documentStr) as SimpleDocument;
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
      
      // Use Redis
      const docKey = `${DOCUMENT_PREFIX}${docId}`;
      
      // First get the document to find its loanId
      const documentStr = await serverRedisUtil.get(docKey);
      const document = documentStr ? JSON.parse(documentStr) as SimpleDocument : null;
      
      if (document) {
        // Remove from the loan's document list
        if (document.loanId) {
          const loanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${document.loanId}`;
          await serverRedisUtil.srem(loanDocListKey, docId);
        }
        
        // Remove from the document list
        await serverRedisUtil.srem(DOCUMENT_LIST_KEY, docId);
        
        // Delete the document itself
        await serverRedisUtil.del(docKey);
        
        console.log(`Successfully deleted document (Redis): ${docId}`);
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
      
      // Use Redis
      // Get all document IDs
      const docIds = await serverRedisUtil.smembers(DOCUMENT_LIST_KEY);
      
      const total = docIds.length;
      const slicedIds = docIds.slice(cursor, cursor + limit);
      const nextCursor = cursor + limit < total ? cursor + limit : null;
      
      // Get all documents in batch
      const documents: SimpleDocument[] = [];
      for (const docId of slicedIds) {
        const docKey = `${DOCUMENT_PREFIX}${docId}`;
        const documentStr = await serverRedisUtil.get(docKey);
        if (documentStr) {
          documents.push(JSON.parse(documentStr) as SimpleDocument);
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
      
      if (useFallback && isBrowser) {
        // Fallback: Use localStorage
        console.log(`Using localStorage fallback mode for loan ${loanId}`);
        
        // First check direct localStorage contents for debugging
        try {
          const rawData = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
          console.log(`Raw localStorage data exists: ${!!rawData}`);
          if (rawData) {
            try {
              const parsedData = JSON.parse(rawData);
              console.log(`Total localStorage documents: ${parsedData.length}`);
              console.log(`Unique loan IDs in storage: ${Array.from(new Set(parsedData.map((d: any) => d.loanId))).join(', ')}`);
            } catch (parseError) {
              console.error(`Error parsing localStorage data:`, parseError);
            }
          }
        } catch (lsError) {
          console.error(`Error directly accessing localStorage:`, lsError);
        }
        
        const allDocs = localStorageFallback.getAllDocuments();
        console.log(`Retrieved ${allDocs.length} documents from localStorage via helper`);
        
        const loanDocs = allDocs.filter(doc => doc.loanId === loanId);
        
        console.log(`📋 Found ${loanDocs.length} documents for loan ${loanId} (localStorage)`);
        
        // If no documents found, but we have documents, log more info
        if (loanDocs.length === 0 && allDocs.length > 0) {
          // List all unique loan IDs in localStorage
          const allLoanIds = Array.from(new Set(allDocs.map(doc => doc.loanId)));
          console.log(`Available loan IDs in localStorage: ${allLoanIds.join(', ')}`);
          
          // Check for documents with no loanId that might need fixing
          const unassociatedDocs = allDocs.filter(doc => !doc.loanId || doc.loanId === 'undefined' || doc.loanId === 'null');
          if (unassociatedDocs.length > 0) {
            console.log(`Found ${unassociatedDocs.length} documents with no loanId that could be fixed`);
          }
        }
        
        return loanDocs;
      }
      
      // Use Redis
      console.log(`Using Redis mode for loan ${loanId}`);
      
      // Debug Redis configuration
      console.log(`Redis URL configured: ${!!process.env.REDIS_URL}`);
      
      const loanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${loanId}`;
      console.log(`Looking up loan documents with key: ${loanDocListKey}`);
      
      // Get all document IDs for this loan
      const docIds = await serverRedisUtil.smembers(loanDocListKey);
      console.log(`📋 Found ${docIds.length} document IDs for loan ${loanId}`);
      
      if (docIds.length === 0) {
        // If no documents found, check if we can list any other loan keys to debug
        try {
          const allLoanKeys = await serverRedisUtil.keys(`${DOCUMENT_BY_LOAN_PREFIX}*`);
          console.log(`Available loan document lists: ${allLoanKeys.join(', ')}`);
          
          // Check for unassociated documents that might need fixing
          const allDocKeys = await serverRedisUtil.keys(`${DOCUMENT_PREFIX}*`);
          console.log(`Total document keys in Redis: ${allDocKeys.length}`);
          
          if (allDocKeys.length > 0) {
            // Sample a few documents to check loanId
            const sampleSize = Math.min(5, allDocKeys.length);
            for (let i = 0; i < sampleSize; i++) {
              const docKey = allDocKeys[i];
              const docStr = await serverRedisUtil.get(docKey);
              const doc = docStr ? JSON.parse(docStr) : null;
              console.log(`Sample document ${i+1}: loanId=${typeof doc === 'object' && doc !== null && 'loanId' in doc ? doc.loanId : 'none'}, id=${typeof doc === 'object' && doc !== null && 'id' in doc ? doc.id : 'none'}`);
            }
          }
        } catch (listError) {
          console.error(`Error listing Redis keys:`, listError);
        }
        
        return [];
      }
      
      // Get all documents in batch
      const documents: SimpleDocument[] = [];
      for (const docId of docIds) {
        const docKey = `${DOCUMENT_PREFIX}${docId}`;
        const docStr = await serverRedisUtil.get(docKey);
        if (docStr) {
          const doc = JSON.parse(docStr) as SimpleDocument;
          documents.push(doc);
        } else {
          console.warn(`Document with ID ${docId} referenced in loan ${loanId} list but not found in Redis store`);
        }
      }
      
      console.log(`📂 Retrieved ${documents.length} documents for loan ID ${loanId} (Redis)`);
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
      
      // Use Redis
      const docKey = `${DOCUMENT_PREFIX}${document.id}`;
      
      // First check if the document exists
      const existingDocStr = await serverRedisUtil.get(docKey);
      const existingDoc = existingDocStr ? JSON.parse(existingDocStr) as SimpleDocument : null;
      
      if (!existingDoc) {
        console.error(`Document ${document.id} not found for update (Redis)`);
        return null;
      }
      
      // If the loanId is changing, update the loan document lists
      if (existingDoc.loanId !== document.loanId) {
        // Remove from old loan's document list
        if (existingDoc.loanId) {
          const oldLoanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${existingDoc.loanId}`;
          await serverRedisUtil.srem(oldLoanDocListKey, document.id);
        }
        
        // Add to new loan's document list
        if (document.loanId) {
          const newLoanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${document.loanId}`;
          await serverRedisUtil.sadd(newLoanDocListKey, document.id);
        }
      }
      
      // Update the document
      await serverRedisUtil.set(docKey, JSON.stringify(document));
      
      console.log(`Successfully updated document (Redis): ${document.id}`);
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
      
      // Use Redis
      // Get all document IDs
      const docIds = await serverRedisUtil.smembers(DOCUMENT_LIST_KEY);
      
      // Delete each document
      for (const docId of docIds) {
        const docKey = `${DOCUMENT_PREFIX}${docId}`;
        await serverRedisUtil.del(docKey);
      }
      
      // Clear the document list
      await serverRedisUtil.del(DOCUMENT_LIST_KEY);
      
      // Get all loan keys
      const loanKeys = await serverRedisUtil.keys(`${DOCUMENT_BY_LOAN_PREFIX}*`);
      
      // Delete each loan document list
      for (const key of loanKeys) {
        await serverRedisUtil.del(key);
      }
      
      console.log('Successfully cleared all documents (Redis)');
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
      
      // Use Redis
      const loanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${loanId}`;
      const targetLoanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${targetLoanId}`;
      
      // Get all document IDs for this loan
      const docIds = await serverRedisUtil.smembers(loanDocListKey);
      console.log(`Found ${docIds.length} documents to reassociate from ${loanId} to ${targetLoanId} (Redis)`);
      
      const updatedDocs: SimpleDocument[] = [];
      
      // Update each document
      for (const docId of docIds) {
        const docKey = `${DOCUMENT_PREFIX}${docId}`;
        const docStr = await serverRedisUtil.get(docKey);
        const doc = docStr ? JSON.parse(docStr) as SimpleDocument : null;
        
        if (doc) {
          // Update the loanId
          const updatedDoc = { 
            ...doc, 
            loanId: targetLoanId 
          };
          
          // Save the updated document
          await serverRedisUtil.set(docKey, JSON.stringify(updatedDoc));
          
          // Move from old loan to new loan
          await serverRedisUtil.srem(loanDocListKey, docId);
          await serverRedisUtil.sadd(targetLoanDocListKey, docId);
          
          updatedDocs.push(updatedDoc);
        }
      }
      
      console.log(`Successfully reassociated ${updatedDocs.length} documents (Redis)`);
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
   * Migrate documents from localStorage to Redis
   * Use this to transition from the old storage to the new one
   */
  migrateFromLocalStorage: async (): Promise<{migrated: number, errors: number}> => {
    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined';
    if (!isBrowser) {
      console.error('Migration can only be performed in browser environment');
      return { migrated: 0, errors: 1 };
    }
    
    // Double-check Redis configuration
    const redisConfigured = isRedisAvailable();
    if (!redisConfigured) {
      console.error('Redis URL is not configured - cannot migrate');
      return { migrated: 0, errors: 1 };
    }
    
    // Check if we're in fallback mode
    if (STORAGE_CONFIG.USE_FALLBACK) {
      console.error('Cannot migrate when in fallback mode (USE_FALLBACK is true)');
      return { migrated: 0, errors: 1 };
    }
    
    try {
      console.log('Starting migration from localStorage to Redis...');
      
      // Get all documents from localStorage
      console.log('Retrieving documents from localStorage...');
      const oldDocs = localStorageFallback.getAllDocuments();
      console.log(`Found ${oldDocs.length} documents to migrate from localStorage`);
      
      if (oldDocs.length === 0) {
        console.log('No documents found in localStorage to migrate');
        return { migrated: 0, errors: 0 };
      }
      
      // Group documents by loan IDs for better logging
      const loanGroups = oldDocs.reduce((groups, doc) => {
        const loanId = doc.loanId || 'unassigned';
        if (!groups[loanId]) {
          groups[loanId] = [];
        }
        groups[loanId].push(doc);
        return groups;
      }, {} as Record<string, SimpleDocument[]>);
      
      console.log(`Documents are for ${Object.keys(loanGroups).length} loans: ${Object.keys(loanGroups).join(', ')}`);
      
      let migrated = 0;
      let errors = 0;
      
      // Migrate each document
      for (const doc of oldDocs) {
        try {
          // Use the Redis service directly to save the document
          const docKey = `${DOCUMENT_PREFIX}${doc.id}`;
          console.log(`Migrating document: ${doc.filename} (ID: ${doc.id}) for loan: ${doc.loanId || 'unassigned'}`);
          
          // Store the document in Redis
          await serverRedisUtil.set(docKey, JSON.stringify(doc));
          
          // Add to the document list
          await serverRedisUtil.sadd(DOCUMENT_LIST_KEY, doc.id);
          
          // Add to the loan's document list
          if (doc.loanId) {
            const loanDocListKey = `${DOCUMENT_BY_LOAN_PREFIX}${doc.loanId}`;
            await serverRedisUtil.sadd(loanDocListKey, doc.id);
          }
          
          migrated++;
        } catch (error) {
          console.error(`Error migrating document ${doc.id}:`, error);
          errors++;
        }
      }
      
      console.log(`Migration complete: ${migrated} documents migrated, ${errors} errors`);
      
      // Verify the migration was successful
      const docsInRedis = await serverRedisUtil.smembers(DOCUMENT_LIST_KEY);
      console.log(`Verification: ${docsInRedis.length} documents now in Redis`);
      
      return { migrated, errors };
    } catch (error) {
      console.error('Error during migration:', error);
      return { migrated: 0, errors: 1 };
    }
  },
  
  // Get documents that don't have a loan ID
  async getUnassociatedDocuments(): Promise<SimpleDocument[]> {
    const USE_FALLBACK = STORAGE_CONFIG.USE_FALLBACK || !isRedisConfigured();
    console.log(`[Storage] Getting unassociated documents, using ${USE_FALLBACK ? 'localStorage fallback' : 'Redis'}`);
    
    const unassociatedDocs: SimpleDocument[] = [];
    
    if (USE_FALLBACK) {
      // Local storage fallback
      const allDocsKey = STORAGE_CONFIG.DOCUMENT_LIST_KEY;
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
      // Redis
      const docKeys = await serverRedisUtil.keys(`${STORAGE_CONFIG.DOCUMENT_PREFIX}:*`);
      
      for (const key of docKeys) {
        const docStr = await serverRedisUtil.get(key);
        if (docStr) {
          const doc = JSON.parse(docStr) as SimpleDocument;
          if (!doc.loanId || doc.loanId === 'undefined' || doc.loanId === 'null') {
            unassociatedDocs.push(doc);
          }
        }
      }
    }
    
    return unassociatedDocs;
  },
  
  // Fix unassociated documents (documents without a loanId)
  async fixUnassociatedDocuments(loanId: string): Promise<SimpleDocument[]> {
    const USE_FALLBACK = STORAGE_CONFIG.USE_FALLBACK || !isRedisConfigured();
    console.log(`[Storage] Fixing unassociated documents for loan ${loanId}, using ${USE_FALLBACK ? 'localStorage fallback' : 'Redis'}`);
    
    const fixedDocuments: SimpleDocument[] = [];
    
    if (USE_FALLBACK) {
      // Local storage fallback
      const allDocsKey = STORAGE_CONFIG.DOCUMENT_LIST_KEY;
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
            const docKey = `${STORAGE_CONFIG.DOCUMENT_PREFIX}:${doc.id}`;
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
      // Redis
      // Get all documents without loanId
      const docKeys = await serverRedisUtil.keys(`${STORAGE_CONFIG.DOCUMENT_PREFIX}:*`);
      
      for (const key of docKeys) {
        const docStr = await serverRedisUtil.get(key);
        if (docStr) {
          let doc = JSON.parse(docStr) as SimpleDocument;
          if (!doc.loanId || doc.loanId === 'undefined' || doc.loanId === 'null') {
            // Update the document
            doc.loanId = loanId;
            
            // Store the updated document back to Redis
            await serverRedisUtil.set(key, JSON.stringify(doc));
            
            // Add to fixed documents list
            fixedDocuments.push(doc);
            
            // Add to loan documents list
            const loanDocsKey = `${STORAGE_CONFIG.DOCUMENT_BY_LOAN_PREFIX}:${loanId}`;
            await serverRedisUtil.sadd(loanDocsKey, doc.id);
          }
        }
      }
    }
    
    return fixedDocuments;
  },
  
  // Helper method to update the loan documents list
  async updateLoanDocumentsList(loanId: string, documents: SimpleDocument[]): Promise<void> {
    const USE_FALLBACK = STORAGE_CONFIG.USE_FALLBACK || !isRedisConfigured();
    
    if (documents.length === 0) return;
    
    if (USE_FALLBACK) {
      // Add document IDs to loan-specific document list in localStorage
      const loanDocsKey = `${STORAGE_CONFIG.DOCUMENT_BY_LOAN_PREFIX}:${loanId}`;
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
      // Add document IDs to loan-specific document list in Redis
      const loanDocsKey = `${STORAGE_CONFIG.DOCUMENT_BY_LOAN_PREFIX}:${loanId}`;
      const docIds = documents.map(doc => doc.id);
      
      // Add all IDs to the set
      if (docIds.length > 0) {
        // Add IDs one by one to avoid spread operator issues
        for (const id of docIds) {
          await serverRedisUtil.sadd(loanDocsKey, id);
        }
      }
    }
  }
};

export default storageService; 