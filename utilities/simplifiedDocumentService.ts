// utilities/simplifiedDocumentService.ts
import { v4 as uuidv4 } from 'uuid';

export interface SimpleDocument {
  id: string;
  loanId: string;
  filename: string;
  fileType?: string;
  fileSize?: number;
  dateUploaded: string;
  category: 'loan' | 'legal' | 'financial' | 'misc' | 'chat';
  docType: string;
  status: 'pending' | 'approved' | 'rejected';
  content: string; // Base64 encoded content or HTML for generated documents
  notes?: string;
  assignedTo?: string;
}

// Constants for storage keys
const STORAGE_KEY = 'simple_documents';

// Helper function for document type classification
function classifyDocument(filename: string): { 
  docType: string; 
  category: 'loan' | 'legal' | 'financial' | 'misc' | 'chat';
} {
  const lowerName = filename.toLowerCase();
  
  // Check if it's a chat document first
  if (lowerName.includes('hud') || lowerName.includes('example')) {
    return { docType: 'chat_document', category: 'chat' };
  }
  
  // Simple classification rules
  if (lowerName.includes('note') || lowerName.includes('promissory')) {
    return { docType: 'promissory_note', category: 'loan' };
  }
  if (lowerName.includes('deed') || lowerName.includes('trust')) {
    return { docType: 'deed_of_trust', category: 'legal' };
  }
  if (lowerName.includes('disclosure') || lowerName.includes('closing')) {
    return { docType: 'closing_disclosure', category: 'financial' };
  }
  if (lowerName.includes('income') || lowerName.includes('statement')) {
    return { docType: 'income_verification', category: 'financial' };
  }
  if (lowerName.includes('insurance')) {
    return { docType: 'insurance_policy', category: 'legal' };
  }
  if (lowerName.includes('appraisal')) {
    return { docType: 'property_appraisal', category: 'financial' };
  }
  
  // Default
  return { docType: 'general_document', category: 'misc' };
}

// Helper function to read file as base64
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    
    reader.onerror = () => reject(reader.error);
    
    // Use readAsDataURL instead of readAsArrayBuffer for PDFs
    reader.readAsDataURL(file);
  });
}

// Create and export the document service
export const simpleDocumentService = {
  // Get all documents
  getAllDocuments: (): SimpleDocument[] => {
    try {
      const docsJson = localStorage.getItem(STORAGE_KEY);
      const docs = docsJson ? JSON.parse(docsJson) : [];
      
      // Validate data structure
      if (!Array.isArray(docs)) {
        console.warn("Invalid document data structure detected");
        return [];
      }
      
      return docs;
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  },
  
  // Get documents for a specific loan
  getDocumentsForLoan: (loanId: string): SimpleDocument[] => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      return allDocs.filter(doc => doc.loanId === loanId);
    } catch (error) {
      console.error('Error getting loan documents:', error);
      return [];
    }
  },
  
  // Get chat documents
  getChatDocuments: (): SimpleDocument[] => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      return allDocs.filter(doc => doc.category === 'chat');
    } catch (error) {
      console.error('Error getting chat documents:', error);
      return [];
    }
  },
  
  // Get document by ID
  getDocumentById: (docId: string): SimpleDocument | null => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      return allDocs.find(doc => doc.id === docId) || null;
    } catch (error) {
      console.error('Error getting document by ID:', error);
      return null;
    }
  },
  
  // Add a document directly (without file upload)
  // This is used for pre-generated documents
  addDocumentDirectly: (document: SimpleDocument): SimpleDocument => {
    try {
      // Get existing documents from storage
      const existingDocs = simpleDocumentService.getAllDocuments();
      
      // Check if a document with the same docType already exists for this loan
      const existingDoc = existingDocs.find(doc => 
        doc.loanId === document.loanId && 
        doc.docType === document.docType
      );
      
      if (existingDoc) {
        // Update existing document instead of creating new
        const updatedDoc = {
          ...existingDoc,
          ...document,
          id: existingDoc.id // Keep the original ID
        };
        
        // Replace in array
        const index = existingDocs.findIndex(doc => doc.id === existingDoc.id);
        if (index >= 0) {
          existingDocs[index] = updatedDoc;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(existingDocs));
          console.log(`Updated existing document: ${updatedDoc.filename} (ID: ${updatedDoc.id})`);
          return updatedDoc;
        }
      }
      
      // Add the new document
      existingDocs.push(document);
      
      // Save back to storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingDocs));
      
      console.log(`✅ Document added directly: ${document.filename}`);
      return document;
    } catch (error) {
      console.error('❌ Error adding document directly:', error);
      throw error;
    }
  },
  
  // Add a new document
  addDocument: async (file: File, loanId: string, classification?: { docType: string; category: 'loan' | 'legal' | 'financial' | 'misc' | 'chat' }): Promise<SimpleDocument | null> => {
    try {
      // Read file as base64
      const content = await readFileAsBase64(file);
      
      // Ensure content is properly formatted as a data URL
      let formattedContent = content;
      if (!content.startsWith('data:application/pdf')) {
        // If FileReader didn't add the correct prefix, add it
        formattedContent = `data:application/pdf;base64,${content.replace(/^data:.*?;base64,/, '')}`;
      }
      
      // Special handling for chat-uploads, mark them with the chat category
      let docClassification = classification;
      if (loanId === 'chat-uploads') {
        docClassification = { 
          docType: 'chat_document', 
          category: 'chat' 
        };
      } else {
        // Use provided classification or classify automatically
        docClassification = classification || classifyDocument(file.name);
      }
      
      const { docType, category } = docClassification;
      
      // Get all existing documents
      const allDocs = simpleDocumentService.getAllDocuments();
      
      // Check if a document with the same docType already exists for this loan
      // This ensures we replace by document type for document sockets
      const existingDoc = allDocs.find(doc => 
        doc.loanId === loanId && 
        doc.docType === docType
      );
      
      if (existingDoc) {
        console.log(`Updating existing document: ${file.name} as ${docType}`);
        
        // Update existing document instead of creating new
        const updatedDoc = {
          ...existingDoc,
          filename: file.name,
          fileType: file.type || 'application/pdf',
          fileSize: file.size,
          dateUploaded: new Date().toISOString(),
          content: formattedContent
        };
        
        // Replace in array
        const index = allDocs.findIndex(doc => doc.id === existingDoc.id);
        if (index >= 0) {
          allDocs[index] = updatedDoc;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
          console.log(`Updated existing document: ${updatedDoc.filename} (ID: ${updatedDoc.id})`);
          return updatedDoc;
        }
      }
      
      // Create new document object if no existing document was found and updated
      const newDoc: SimpleDocument = {
        id: uuidv4(),
        loanId,
        filename: file.name,
        fileType: file.type || 'application/pdf',
        fileSize: file.size,
        dateUploaded: new Date().toISOString(),
        category,
        docType,
        status: 'pending',
        content: formattedContent
      };
      
      // Add the new document
      allDocs.push(newDoc);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
      
      console.log(`Document added successfully: ${newDoc.filename} (ID: ${newDoc.id}, Category: ${newDoc.category})`);
      return newDoc;
    } catch (error) {
      console.error('Error adding document:', error);
      return null;
    }
  },
  
  // Update document status
  updateDocumentStatus: (docId: string, status: 'pending' | 'approved' | 'rejected', notes?: string, assignedTo?: string): SimpleDocument | null => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      const docIndex = allDocs.findIndex(doc => doc.id === docId);
      
      if (docIndex === -1) return null;
      
      allDocs[docIndex] = {
        ...allDocs[docIndex],
        status,
        notes: notes || allDocs[docIndex].notes,
        assignedTo: assignedTo || allDocs[docIndex].assignedTo
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
      
      return allDocs[docIndex];
    } catch (error) {
      console.error('Error updating document status:', error);
      return null;
    }
  },
  
  // Delete document
  deleteDocument: (docId: string): boolean => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      const filteredDocs = allDocs.filter(doc => doc.id !== docId);
      
      if (filteredDocs.length === allDocs.length) return false;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredDocs));
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  },
  
  // Transfer documents from temporary loan ID to actual loan ID
  transferDocumentsToLoan: (tempLoanId: string, actualLoanId: string): SimpleDocument[] => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      const transferredDocs: SimpleDocument[] = [];
      
      // Find documents with the temp ID
      const docsToTransfer = allDocs.filter(doc => doc.loanId === tempLoanId);
      
      if (docsToTransfer.length === 0) {
        return [];
      }
      
      // Update the loan ID for each document
      docsToTransfer.forEach(doc => {
        const index = allDocs.findIndex(d => d.id === doc.id);
        if (index !== -1) {
          allDocs[index] = {
            ...allDocs[index],
            loanId: actualLoanId
          };
          transferredDocs.push(allDocs[index]);
        }
      });
      
      // Save the updated documents
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
      
      return transferredDocs;
    } catch (error) {
      console.error('Error transferring documents:', error);
      return [];
    }
  },
  
  // Get document statistics for a loan
  getDocumentStats: (loanId: string) => {
    try {
      const loanDocs = simpleDocumentService.getDocumentsForLoan(loanId);
      
      const stats = {
        total: loanDocs.length,
        approved: loanDocs.filter(doc => doc.status === 'approved').length,
        rejected: loanDocs.filter(doc => doc.status === 'rejected').length,
        pending: loanDocs.filter(doc => doc.status === 'pending').length,
        byCategory: {} as Record<string, number>,
        byType: {} as Record<string, number>
      };
      
      // Count by category
      loanDocs.forEach(doc => {
        stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
        stats.byType[doc.docType] = (stats.byType[doc.docType] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting document stats:', error);
      return {
        total: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        byCategory: {},
        byType: {}
      };
    }
  },
  
  // Clear only chat documents
  clearChatDocuments: (): void => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      // Keep all documents that are NOT chat documents
      const nonChatDocs = allDocs.filter(doc => 
        doc.category !== 'chat' && doc.loanId !== 'chat-uploads'
      );
      
      // Save back only the non-chat documents
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nonChatDocs));
      console.log("Chat documents cleared successfully");
    } catch (error) {
      console.error('Error clearing chat documents:', error);
    }
  },
  
  // Clear all documents (for testing)
  clearAllDocuments: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },
  
  // Update a document directly
  updateDocument: (document: SimpleDocument): void => {
    try {
      const allDocs = simpleDocumentService.getAllDocuments();
      const index = allDocs.findIndex(d => d.id === document.id);
      
      if (index !== -1) {
        allDocs[index] = document;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  },
  
  // Sync loan documents with the chat
  syncLoanDocumentsWithChat: (loanId: string): SimpleDocument[] => {
    try {
      // Get all documents
      const allDocs = simpleDocumentService.getAllDocuments();
      
      // Find documents for this loan
      const loanDocs = allDocs.filter(doc => doc.loanId === loanId);
      
      // Ensure each loan document is properly tagged for the chat
      loanDocs.forEach(doc => {
        // Make sure the document has the correct loanId
        doc.loanId = loanId;
        
        // Update the document in storage
        const index = allDocs.findIndex(d => d.id === doc.id);
        if (index !== -1) {
          allDocs[index] = doc;
        }
      });
      
      // Save all updates at once
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allDocs));
      
      return loanDocs;
    } catch (error) {
      console.error('Error syncing loan documents with chat:', error);
      return [];
    }
  }
};