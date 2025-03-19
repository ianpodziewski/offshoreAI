// @ts-nocheck /* This disables TypeScript type checking for this file due to complex template literals */
import { v4 as uuidv4 } from 'uuid';
import { 
  LoanDocument, 
  DocumentStatus, 
  DocumentCategory,
  createDocument,
  getRequiredDocuments,
  getAllDocumentTypes,
  DOCUMENT_STRUCTURE
} from './loanDocumentStructure';
import { loanDatabase } from './loanDatabase';
import { LoanData } from './loanGenerator';
import { getDocumentTemplate } from './templates/documentTemplateStrings';
import { simpleDocumentService } from './simplifiedDocumentService';

// Constants for storage keys
const LOAN_DOCUMENTS_STORAGE_KEY = 'loan_documents';

// Document statuses for fake documents (excluding 'required' since we want to show uploaded docs)
const FAKE_DOCUMENT_STATUSES: DocumentStatus[] = ['pending', 'approved', 'received', 'reviewed'];

// Document file types
const FILE_TYPES = ['.pdf', '.docx', '.jpg', '.png'];

// Function to generate a random file size between 100KB and 10MB
const getRandomFileSize = (): number => {
  return Math.floor(Math.random() * 9900000) + 100000; // 100KB to 10MB
};

// Function to format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

// Generate fake document content
const generateDocumentContent = (docType: string, loan: LoanData): string => {
  // First check if the loan object is valid
  if (!loan) {
    console.error(`Cannot generate document content: loan data is undefined`);
    return `<html><body><h1>Error: Missing Loan Data</h1><p>The loan data required to generate this document is unavailable.</p></body></html>`;
  }

  // Ensure borrowerName is set to prevent errors in templates
  const safeLoan = {
    ...loan,
    borrowerName: loan.borrowerName || 'Borrower Name Not Available',
    propertyAddress: loan.propertyAddress || 'Property Address Not Available',
    loanAmount: loan.loanAmount || 0,
    loanTerm: loan.loanTerm || 0,
    interestRate: loan.interestRate || 0,
    loanType: loan.loanType || 'unknown'
  };

  try {
    // Call getDocumentTemplate with both required parameters
    const template = getDocumentTemplate(docType, safeLoan);
    if (!template) return '';
    
    // The template already has the loan data injected, so we can return it directly
    return template;
  } catch (error) {
    console.error(`Error generating document content for ${docType}:`, error);
    return `<html><body><h1>Error Generating Document</h1><p>There was an error generating the ${docType} document.</p></body></html>`;
  }
};

// Helper function to check if localStorage is almost full
// Returns true if we have less than 10% space remaining
const isLocalStorageFull = (): boolean => {
  try {
    const maxSize = 5 * 1024 * 1024; // Estimate: 5MB max for most browsers
    let totalSize = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      totalSize += (key?.length || 0) + (value?.length || 0);
    }
    
    const percentUsed = (totalSize / maxSize) * 100;
    return percentUsed > 90; // More than 90% used
  } catch (error) {
    console.error('Error checking localStorage capacity:', error);
    return true; // Assume full to be safe
  }
};

// Batch size for generating fake documents
const BATCH_SIZE = 5;

// Document service for managing loan documents
export const loanDocumentService = {
  // Get all documents
  getAllDocuments: (): LoanDocument[] => {
    const docsJson = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
    return docsJson ? JSON.parse(docsJson) : [];
  },
  
  // Get documents for a specific loan
  getDocumentsForLoan: (loanId: string): LoanDocument[] => {
    const allDocs = loanDocumentService.getAllDocuments();
    return allDocs.filter(doc => doc.loanId === loanId);
  },
  
  // Get documents for a specific loan by category
  getDocumentsByCategory: (loanId: string, category: DocumentCategory): LoanDocument[] => {
    const loanDocs = loanDocumentService.getDocumentsForLoan(loanId);
    return loanDocs.filter(doc => doc.category === category);
  },
  
  // Get documents for a specific loan by section
  getDocumentsBySection: (loanId: string, section: string): LoanDocument[] => {
    const loanDocs = loanDocumentService.getDocumentsForLoan(loanId);
    return loanDocs.filter(doc => doc.section === section);
  },
  
  // Get document by ID
  getDocumentById: (docId: string): LoanDocument | null => {
    const allDocs = loanDocumentService.getAllDocuments();
    return allDocs.find(doc => doc.id === docId) || null;
  },
  
  // Add a document
  addDocument: (document: LoanDocument): LoanDocument => {
    const allDocs = loanDocumentService.getAllDocuments();
    allDocs.push(document);
    localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocs));
    return document;
  },
  
  // Update a document
  updateDocument: async (documentId: string, updates: Partial<LoanDocument>): Promise<LoanDocument | null> => {
    const allDocs = loanDocumentService.getAllDocuments();
    const docIndex = allDocs.findIndex(doc => doc.id === documentId);
    
    if (docIndex === -1) return null;
    
    allDocs[docIndex] = { ...allDocs[docIndex], ...updates };
    localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocs));
    
    return allDocs[docIndex];
  },
  
  // Delete a document
  deleteDocument: (documentId: string): boolean => {
    const allDocs = loanDocumentService.getAllDocuments();
    const filteredDocs = allDocs.filter(doc => doc.id !== documentId);
    
    if (filteredDocs.length === allDocs.length) return false;
    
    localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(filteredDocs));
    return true;
  },
  
  // Update document status
  updateDocumentStatus: async (docId: string, status: DocumentStatus): Promise<LoanDocument | null> => {
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
        filename: `SAMPLE_${docType.label}.pdf`,
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
        filename: `SAMPLE_${docType.label}.pdf`,
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
      
      // Count total required document types (sockets)
      const total = requiredDocTypes.length;
      
      // Get unique docTypes that have at least one document (status not 'required')
      // This counts each document socket only once, regardless of how many documents it contains
      const uniqueCompletedDocTypes = new Set(
        existingDocs
          .filter(doc => doc.status !== 'required')
          .map(doc => doc.docType)
      );
      
      // Count completed document sockets (those with at least one document)
      const completed = [...uniqueCompletedDocTypes].filter(docType => 
        requiredDocTypes.some(rt => rt.docType === docType)
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
        
        // Get unique docTypes in this category that have at least one document
        const categoryCompletedDocTypes = new Set(
          existingDocs
            .filter(doc => doc.category === category && doc.status !== 'required')
            .map(doc => doc.docType)
        );
        
        // Count document sockets that have at least one document
        const categoryCompleted = [...categoryCompletedDocTypes].filter(docType => 
          categoryRequiredDocs.some(rt => rt.docType === docType)
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
  
  // Generate fake documents for a loan
  generateFakeDocuments: async (loanId: string, loanType: string): Promise<LoanDocument[]> => {
    try {
      console.log(`Generating fake documents for loan ${loanId} (type: ${loanType})`);
      
      // Check if localStorage is getting full - if so, use simpleDocumentService instead
      if (isLocalStorageFull()) {
        console.log('localStorage is close to full, using simpleDocumentService instead');
        return await loanDocumentService.generateFakeDocumentsUsingSimpleService(loanId, loanType);
      }
      
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Get existing documents for this loan
      const existingDocs = loanDocumentService.getDocumentsForLoan(loanId);
      
      // Create fake documents for each required type
      const fakeDocuments: LoanDocument[] = [];
      
      // Fetch loan data
      const loanData = loanDatabase.getLoanById(loanId);
      if (!loanData) {
        console.error(`Loan data not found for loanId: ${loanId}`);
        return [];
      }
      
      // Generate a random date within the last 30 days
      const getRandomDate = (): string => {
        const now = new Date();
        const daysAgo = Math.floor(Math.random() * 30);
        const randomDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        return randomDate.toISOString();
      };
      
      // Generate a random status with bias towards 'approved' and 'received'
      const getRandomStatus = (): DocumentStatus => {
        const rand = Math.random();
        if (rand < 0.4) return 'approved';
        if (rand < 0.7) return 'received';
        if (rand < 0.85) return 'reviewed';
        return 'pending';
      };
      
      // Generate a random file type
      const getRandomFileType = (): string => {
        return FILE_TYPES[Math.floor(Math.random() * FILE_TYPES.length)];
      };
      
      // Generate fake documents in batches to avoid memory issues
      console.log(`Need to generate ${requiredDocTypes.length} document types`);
      
      // Filter out document types that already exist
      const existingDocTypes = new Set(existingDocs.map(doc => doc.docType));
      const docTypesToGenerate = requiredDocTypes.filter(docType => !existingDocTypes.has(docType.docType));
      
      console.log(`After filtering existing docs, need to generate ${docTypesToGenerate.length} document types`);
      
      // Process in small batches
      for (let i = 0; i < docTypesToGenerate.length; i += BATCH_SIZE) {
        const batch = docTypesToGenerate.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${i/BATCH_SIZE + 1} (${batch.length} docs)`);
        
        // Process each doc type in this batch
        for (const docType of batch) {
          // Generate random document attributes
          const fileType = getRandomFileType();
          const fileSize = getRandomFileSize();
          const uploadDate = getRandomDate();
          const status = getRandomStatus();
          
          // Generate a filename
          const filename = `${docType.docType.replace(/_/g, '-')}${fileType}`;
          
          // Generate document content based on the document type
          const content = generateDocumentContent(docType.docType, loanData);
          
          // Create the fake document
          const fakeDocument: LoanDocument = {
            id: uuidv4(),
            loanId,
            filename,
            fileType,
            fileSize,
            dateUploaded: uploadDate,
            category: docType.category,
            section: docType.section,
            subsection: docType.subsection,
            docType: docType.docType,
            status,
            isRequired: true,
            version: 1,
            content, // Add the generated content
            notes: `This is a sample document for ${loanData.borrowerName} with loan amount ${loanData.loanAmount} for the property at ${loanData.propertyAddress}. Status: ${status === 'approved' ? 'Document verified and approved.' : 
                   status === 'rejected' ? 'Document rejected. Please resubmit.' : 
                   status === 'reviewed' ? 'Document reviewed, pending approval.' : 
                   'Document uploaded, awaiting review.'}`
          };
          
          // Add expiration date for certain document types
          if (['insurance_policy', 'appraisal_report', 'credit_report', 'background_check'].includes(docType.docType)) {
            const expirationDate = new Date();
            expirationDate.setFullYear(expirationDate.getFullYear() + 1);
            fakeDocument.expirationDate = expirationDate.toISOString();
          }
          
          fakeDocuments.push(fakeDocument);
        }
        
        // Save this batch
        if (fakeDocuments.length > 0) {
          const allDocs = loanDocumentService.getAllDocuments();
          try {
            localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify([...allDocs, ...fakeDocuments]));
          } catch (error) {
            console.error('localStorage quota exceeded, switching to simpleDocumentService:', error);
            
            // If we hit storage limitations, switch to the simpleDocumentService 
            // and copy over what we've generated so far
            return await loanDocumentService.generateFakeDocumentsUsingSimpleService(loanId, loanType, fakeDocuments);
          }
        }
      }
      
      return fakeDocuments;
    } catch (error) {
      console.error('Error generating fake documents:', error);
      return [];
    }
  },
  
  // Generate fake documents using simpleDocumentService (which uses IndexedDB for content)
  generateFakeDocumentsUsingSimpleService: async (loanId: string, loanType: string, existingFakeDocs: LoanDocument[] = []): Promise<LoanDocument[]> => {
    try {
      console.log('Generating fake documents using simpleDocumentService with IndexedDB');
      
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      
      // Get existing documents for this loan (from simpleDocumentService)
      const existingSimpleDocs = simpleDocumentService.getDocumentsForLoan(loanId);
      const existingDocTypes = new Set([
        ...existingSimpleDocs.map(doc => doc.docType),
        ...existingFakeDocs.map(doc => doc.docType)
      ]);
      
      // Filter out document types that already exist
      const docTypesToGenerate = requiredDocTypes.filter(docType => !existingDocTypes.has(docType.docType));
      
      // Fetch loan data
      const loanData = loanDatabase.getLoanById(loanId);
      if (!loanData) {
        console.error(`Loan data not found for loanId: ${loanId}`);
        return existingFakeDocs;
      }
      
      // Track the documents we create
      const generatedDocs: LoanDocument[] = [...existingFakeDocs];
      
      // Process in small batches
      for (let i = 0; i < docTypesToGenerate.length; i += BATCH_SIZE) {
        const batch = docTypesToGenerate.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${i/BATCH_SIZE + 1} (${batch.length} docs) with simpleDocumentService`);
        
        // Process each doc type in this batch
        for (const docType of batch) {
          // Generate random document attributes
          const fileType = '.html'; // Use HTML for all docs in simpleDocumentService
          const uploadDate = new Date().toISOString();
          const status = 'pending';
          
          // Generate a filename
          const filename = `${docType.docType.replace(/_/g, '-')}${fileType}`;
          
          // Generate document content based on the document type
          const content = generateDocumentContent(docType.docType, loanData);
          
          // Create a unique ID
          const docId = uuidv4();
          
          // Create the document in simpleDocumentService
          try {
            const simpleDoc = await simpleDocumentService.addDocumentDirectly({
              id: docId,
              loanId,
              filename,
              fileType: 'text/html',
              dateUploaded: uploadDate,
              category: docType.category as any,
              docType: docType.docType,
              status: status as any,
              content,
              section: docType.section,
              subsection: docType.subsection
            });
            
            console.log(`Added document to simpleDocumentService: ${filename} (ID: ${docId})`);
            
            // Add to our tracking array
            generatedDocs.push({
              id: docId,
              loanId,
              filename,
              fileType: 'text/html',
              dateUploaded: uploadDate,
              category: docType.category,
              section: docType.section,
              subsection: docType.subsection,
              docType: docType.docType,
              status,
              isRequired: true,
              version: 1,
              content
            });
          } catch (error) {
            console.error(`Error adding document to simpleDocumentService: ${filename}`, error);
          }
        }
      }
      
      return generatedDocs;
    } catch (error) {
      console.error('Error generating fake documents using simpleDocumentService:', error);
      return existingFakeDocs;
    }
  },
  
  // Generate fake documents for all loans
  generateFakeDocumentsForAllLoans: async (): Promise<number> => {
    try {
      // Get all loans from the database
      const loans = loanDatabase.getLoans();
      let totalDocumentsGenerated = 0;
      
      // Generate fake documents for each loan
      for (const loan of loans) {
        const fakeDocuments = await loanDocumentService.generateFakeDocuments(loan.id, loan.loanType);
        totalDocumentsGenerated += fakeDocuments.length;
      }
      
      return totalDocumentsGenerated;
    } catch (error) {
      console.error('Error generating fake documents for all loans:', error);
      return 0;
    }
  },
  
  // Clear all documents (for testing and reset)
  clearAllDocuments: (): void => {
    localStorage.removeItem(LOAN_DOCUMENTS_STORAGE_KEY);
  }
}; 