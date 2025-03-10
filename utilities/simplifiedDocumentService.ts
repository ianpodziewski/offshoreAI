// utilities/simplifiedDocumentService.ts
import { v4 as uuidv4 } from 'uuid';

export interface SimpleDocument {
  id: string;
  loanId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  dateUploaded: string;
  category: 'loan' | 'legal' | 'financial' | 'misc';
  docType: string;
  status: 'pending' | 'approved' | 'rejected';
  content: string; // Base64 encoded content
  notes?: string;
  assignedTo?: string;
}

// Constants for storage keys
const DOCUMENTS_STORAGE_KEY = 'simple_documents';

// Helper function for document type classification
function classifyDocument(filename: string): { 
  docType: string; 
  category: 'loan' | 'legal' | 'financial' | 'misc';
} {
  const lowerName = filename.toLowerCase();
  
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
  
  // Default
  return { docType: 'general_document', category: 'misc' };
}

export const simpleDocumentService = {
  // Get all documents
  getAllDocuments: (): SimpleDocument[] => {
    try {
      const docsJson = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
      return docsJson ? JSON.parse(docsJson) : [];
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
  
  // Add a new document
  addDocument: async (file: File, loanId: string): Promise<SimpleDocument | null> => {
    try {
      // Read file as base64
      const content = await readFileAsBase64(file);
      
      // Classify document
      const { docType, category } = classifyDocument(file.name);
      
      // Create new document object
      const newDoc: SimpleDocument = {
        id: uuidv4(),
        loanId,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        dateUploaded: new Date().toISOString(),
        category,
        docType,
        status: 'pending',
        content
      };
      
      // Add to storage
      const allDocs = simpleDocumentService.getAllDocuments();
      allDocs.push(newDoc);
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocs));
      
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
      
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocs));
      
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
      
      localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(filteredDocs));
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  },
  
  // Clear all documents (for testing)
  clearAllDocuments: (): void => {
    localStorage.removeItem(DOCUMENTS_STORAGE_KEY);
  }
};

// Helper function to read file as base64
async function readFileAsBase64(file: File): Promise<string> {
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
    reader.readAsDataURL(file);
  });
}