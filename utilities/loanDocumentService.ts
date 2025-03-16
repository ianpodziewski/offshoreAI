import { v4 as uuidv4 } from 'uuid';
import { 
  LoanDocument, 
  DocumentStatus, 
  DocumentCategory,
  createDocument,
  getRequiredDocuments,
  getAllDocumentTypes
} from './loanDocumentStructure';

// Constants for storage keys
const LOAN_DOCUMENTS_STORAGE_KEY = 'loan_documents';

// Document service for managing loan documents
export const loanDocumentService = {
  // Get all documents
  getAllDocuments: (): LoanDocument[] => {
    try {
      const docsJson = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
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
  getDocumentsForLoan: (loanId: string): LoanDocument[] => {
    try {
      const allDocs = loanDocumentService.getAllDocuments();
      return allDocs.filter(doc => doc.loanId === loanId);
    } catch (error) {
      console.error('Error getting loan documents:', error);
      return [];
    }
  },
  
  // Get documents for a specific loan by category
  getDocumentsByCategory: (loanId: string, category: DocumentCategory): LoanDocument[] => {
    try {
      const loanDocs = loanDocumentService.getDocumentsForLoan(loanId);
      return loanDocs.filter(doc => doc.category === category);
    } catch (error) {
      console.error('Error getting documents by category:', error);
      return [];
    }
  },
  
  // Get documents for a specific loan by section
  getDocumentsBySection: (loanId: string, section: string): LoanDocument[] => {
    try {
      const loanDocs = loanDocumentService.getDocumentsForLoan(loanId);
      return loanDocs.filter(doc => doc.section === section);
    } catch (error) {
      console.error('Error getting documents by section:', error);
      return [];
    }
  },
  
  // Get document by ID
  getDocumentById: (docId: string): LoanDocument | null => {
    try {
      const allDocs = loanDocumentService.getAllDocuments();
      return allDocs.find(doc => doc.id === docId) || null;
    } catch (error) {
      console.error('Error getting document by ID:', error);
      return null;
    }
  },
  
  // Add a document
  addDocument: (document: Omit<LoanDocument, 'id'>): LoanDocument => {
    try {
      // Get existing documents from storage
      const existingDocs = loanDocumentService.getAllDocuments();
      
      // Create new document with ID
      const newDocument: LoanDocument = {
        ...document,
        id: uuidv4()
      };
      
      // Save the updated documents
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify([...existingDocs, newDocument]));
      
      return newDocument;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  },
  
  // Update a document
  updateDocument: (docId: string, updates: Partial<LoanDocument>): LoanDocument | null => {
    try {
      // Get existing documents from storage
      const existingDocs = loanDocumentService.getAllDocuments();
      
      // Find the document to update
      const docIndex = existingDocs.findIndex(doc => doc.id === docId);
      
      if (docIndex === -1) {
        console.warn(`Document with ID ${docId} not found`);
        return null;
      }
      
      // Create updated document
      const updatedDocument: LoanDocument = {
        ...existingDocs[docIndex],
        ...updates,
        // Increment version if it exists
        version: existingDocs[docIndex].version ? existingDocs[docIndex].version! + 1 : 1
      };
      
      // Update the document in the array
      existingDocs[docIndex] = updatedDocument;
      
      // Save the updated documents
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(existingDocs));
      
      return updatedDocument;
    } catch (error) {
      console.error('Error updating document:', error);
      return null;
    }
  },
  
  // Delete a document
  deleteDocument: (docId: string): boolean => {
    try {
      // Get existing documents from storage
      const existingDocs = loanDocumentService.getAllDocuments();
      
      // Filter out the document to delete
      const updatedDocs = existingDocs.filter(doc => doc.id !== docId);
      
      // Check if a document was removed
      if (updatedDocs.length === existingDocs.length) {
        console.warn(`Document with ID ${docId} not found`);
        return false;
      }
      
      // Save the updated documents
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(updatedDocs));
      
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  },
  
  // Update document status
  updateDocumentStatus: (docId: string, status: DocumentStatus): LoanDocument | null => {
    return loanDocumentService.updateDocument(docId, { status });
  },
  
  // Get missing required documents for a loan
  getMissingRequiredDocuments: (loanId: string, loanType: string): LoanDocument[] => {
    try {
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Get existing documents for this loan
      const existingDocs = loanDocumentService.getDocumentsForLoan(loanId);
      
      // Get existing document types
      const existingDocTypes = existingDocs.map(doc => doc.docType);
      
      // Filter out document types that already exist
      const missingDocTypes = requiredDocTypes.filter(doc => !existingDocTypes.includes(doc.docType));
      
      // Create placeholder documents for each missing type
      return missingDocTypes.map(docType => ({
        id: uuidv4(),
        loanId,
        filename: `${docType.label}.pdf`,
        dateUploaded: new Date().toISOString(),
        category: docType.category,
        section: docType.section,
        subsection: docType.subsection,
        docType: docType.docType,
        status: 'required' as DocumentStatus,
        isRequired: true,
        version: 1
      }));
    } catch (error) {
      console.error('Error getting missing required documents:', error);
      return [];
    }
  },
  
  // Initialize documents for a new loan
  initializeDocumentsForLoan: (loanId: string, loanType: string): LoanDocument[] => {
    try {
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Create placeholder documents for each required type
      const placeholderDocs = requiredDocTypes.map(docType => ({
        id: uuidv4(),
        loanId,
        filename: `${docType.label}.pdf`,
        dateUploaded: new Date().toISOString(),
        category: docType.category,
        section: docType.section,
        subsection: docType.subsection,
        docType: docType.docType,
        status: 'required' as DocumentStatus,
        isRequired: true,
        version: 1
      }));
      
      // Get existing documents from storage
      const existingDocs = loanDocumentService.getAllDocuments();
      
      // Save the combined documents
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify([...existingDocs, ...placeholderDocs]));
      
      return placeholderDocs;
    } catch (error) {
      console.error('Error initializing documents for loan:', error);
      return [];
    }
  },
  
  // Get document completion status for a loan
  getDocumentCompletionStatus: (loanId: string, loanType: string): {
    total: number;
    completed: number;
    percentage: number;
    byCategory: Record<DocumentCategory, { total: number; completed: number; percentage: number }>;
  } => {
    try {
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Get existing documents for this loan
      const existingDocs = loanDocumentService.getDocumentsForLoan(loanId);
      
      // Count total required documents
      const total = requiredDocTypes.length;
      
      // Count completed documents (status is not 'required')
      const completed = existingDocs.filter(doc => 
        requiredDocTypes.some(rt => rt.docType === doc.docType) && 
        doc.status !== 'required'
      ).length;
      
      // Calculate completion percentage
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Calculate completion by category
      const byCategory: Record<DocumentCategory, { total: number; completed: number; percentage: number }> = {} as any;
      
      // Initialize categories
      const categories: DocumentCategory[] = ['borrower', 'property', 'closing', 'servicing', 'misc'];
      categories.forEach(category => {
        const categoryRequiredDocs = requiredDocTypes.filter(doc => doc.category === category);
        const categoryTotal = categoryRequiredDocs.length;
        const categoryCompleted = existingDocs.filter(doc => 
          categoryRequiredDocs.some(rt => rt.docType === doc.docType) && 
          doc.status !== 'required'
        ).length;
        const categoryPercentage = categoryTotal > 0 ? Math.round((categoryCompleted / categoryTotal) * 100) : 0;
        
        byCategory[category] = {
          total: categoryTotal,
          completed: categoryCompleted,
          percentage: categoryPercentage
        };
      });
      
      return {
        total,
        completed,
        percentage,
        byCategory
      };
    } catch (error) {
      console.error('Error getting document completion status:', error);
      return {
        total: 0,
        completed: 0,
        percentage: 0,
        byCategory: {
          borrower: { total: 0, completed: 0, percentage: 0 },
          property: { total: 0, completed: 0, percentage: 0 },
          closing: { total: 0, completed: 0, percentage: 0 },
          servicing: { total: 0, completed: 0, percentage: 0 },
          misc: { total: 0, completed: 0, percentage: 0 }
        }
      };
    }
  },
  
  // Clear all documents (for testing and reset)
  clearAllDocuments: (): void => {
    localStorage.removeItem(LOAN_DOCUMENTS_STORAGE_KEY);
  }
}; 