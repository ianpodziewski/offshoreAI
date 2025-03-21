import { v4 as uuidv4 } from 'uuid';
import { 
  LoanDocument, 
  DocumentStatus, 
  DocumentCategory,
  createDocument,
  getRequiredDocuments
} from './loanDocumentStructure';
import { loanDatabase } from './loanDatabase';
import { getDocumentTemplate } from './templates/documentTemplateStrings';
import { documentStorage } from './documentStorageAdapter';

// Document statuses for sample documents (excluding 'required')
const SAMPLE_DOCUMENT_STATUSES: DocumentStatus[] = ['pending', 'approved', 'received', 'reviewed'];

/**
 * Document Service
 * Provides business logic for document operations
 */
export class DocumentService {
  /**
   * Get documents for a specific loan
   */
  async getDocumentsForLoan(loanId: string): Promise<LoanDocument[]> {
    if (!loanId) {
      console.error('Cannot get documents: missing loanId');
      return [];
    }

    return documentStorage.getDocumentsForLoan(loanId);
  }

  /**
   * Get document by ID
   */
  async getDocumentById(documentId: string): Promise<LoanDocument | null> {
    if (!documentId) {
      console.error('Cannot get document: missing documentId');
      return null;
    }

    const allDocs = await documentStorage.getAllDocuments();
    return allDocs.find(doc => doc.id === documentId) || null;
  }

  /**
   * Add a new document
   */
  async addDocument(document: LoanDocument): Promise<LoanDocument> {
    return documentStorage.saveDocument(document);
  }

  /**
   * Update document status
   */
  async updateDocumentStatus(documentId: string, status: DocumentStatus): Promise<boolean> {
    return documentStorage.updateDocument({ id: documentId, status });
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    return documentStorage.deleteDocument(documentId);
  }

  /**
   * Calculate document completion status
   */
  async getDocumentCompletionStatus(loanId: string, loanType: string): Promise<{
    total: number;
    completed: number;
    percentage: number;
    byCategory: Record<DocumentCategory, { total: number; completed: number; percentage: number }>;
  }> {
    // Default return object with zero values
    const defaultResult = {
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

    if (!loanId || !loanType) {
      console.error('Cannot get document completion status: missing loanId or loanType');
      return defaultResult;
    }

    try {
      // Get all required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      if (!Array.isArray(requiredDocTypes) || requiredDocTypes.length === 0) {
        console.error(`No required document types found for loan type ${loanType}`);
        return defaultResult;
      }

      // Get existing documents for this loan
      const existingDocs = await this.getDocumentsForLoan(loanId);
      
      // Count total required document types
      const total = requiredDocTypes.length;
      
      // Get completed documents (status not 'required')
      const completedDocs = existingDocs.filter(doc => 
        doc.status && doc.status !== 'required'
      );
      
      // Get unique document types that have at least one completed document
      const uniqueCompletedDocTypes = new Set(completedDocs.map(doc => doc.docType));
      
      // Count completed document types that are required
      const completed = Array.from(uniqueCompletedDocTypes).filter(docType =>
        requiredDocTypes.some(rt => rt.docType === docType)
      ).length;
      
      // Calculate completion percentage
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      // Calculate completion by category
      const categories: DocumentCategory[] = ['borrower', 'property', 'closing', 'servicing', 'misc'];
      const byCategory = {} as Record<DocumentCategory, { total: number; completed: number; percentage: number }>;
      
      for (const category of categories) {
        // Get required docs for this category
        const categoryRequiredDocs = requiredDocTypes.filter(doc => doc.category === category);
        const categoryTotal = categoryRequiredDocs.length;
        
        // Get completed docs for this category
        const categoryCompletedDocs = completedDocs.filter(doc => doc.category === category);
        const categoryCompletedDocTypes = new Set(categoryCompletedDocs.map(doc => doc.docType));
        
        // Count unique completed document types that are required for this category
        const categoryCompleted = Array.from(categoryCompletedDocTypes).filter(docType =>
          categoryRequiredDocs.some(rt => rt.docType === docType)
        ).length;
        
        // Calculate percentage
        const categoryPercentage = categoryTotal > 0 
          ? Math.round((categoryCompleted / categoryTotal) * 100) 
          : 0;
        
        byCategory[category] = {
          total: categoryTotal,
          completed: categoryCompleted,
          percentage: categoryPercentage
        };
      }
      
      return {
        total,
        completed,
        percentage,
        byCategory
      };
    } catch (error) {
      console.error('Error getting document completion status:', error);
      return defaultResult;
    }
  }
  
  /**
   * Initialize placeholder documents for a loan
   */
  async initializeDocumentsForLoan(loanId: string, loanType: string): Promise<LoanDocument[]> {
    if (!loanId || !loanType) {
      console.error('Cannot initialize documents: missing loanId or loanType');
      return [];
    }

    try {
      console.log(`Initializing documents for loan ${loanId} with type ${loanType}`);
      
      // Get required document types for this loan type
      const requiredDocTypes = getRequiredDocuments(loanType);
      if (!Array.isArray(requiredDocTypes) || requiredDocTypes.length === 0) {
        console.warn(`No required document types found for loan type ${loanType}`);
        return [];
      }
      
      // Get existing documents for this loan
      const existingDocs = await this.getDocumentsForLoan(loanId);
      
      // Create placeholder documents only for missing document types
      const placeholderDocs: LoanDocument[] = [];
      
      for (const docType of requiredDocTypes) {
        // Skip if document type already exists
        const hasExistingDocument = existingDocs.some(doc => 
          doc.docType === docType.docType
        );
        
        if (!hasExistingDocument) {
          const placeholderDoc: LoanDocument = {
            id: uuidv4(),
            loanId,
            filename: `SAMPLE_${docType.label || docType.docType}.html`,
            dateUploaded: new Date().toISOString(),
            category: docType.category as DocumentCategory,
            section: docType.section || '',
            subsection: docType.subsection || '',
            docType: docType.docType,
            status: 'required' as DocumentStatus,
            isRequired: true,
            version: 1
          };
          
          placeholderDocs.push(placeholderDoc);
        }
      }
      
      // Save placeholder documents
      if (placeholderDocs.length > 0) {
        await documentStorage.saveDocuments(placeholderDocs);
        console.log(`Created ${placeholderDocs.length} placeholder documents for loan ${loanId}`);
      } else {
        console.log(`No new documents needed for loan ${loanId}`);
      }
      
      return placeholderDocs;
    } catch (error) {
      console.error('Error initializing documents for loan:', error);
      return [];
    }
  }
  
  /**
   * Generate random file size between 100KB and 10MB
   */
  private getRandomFileSize(): number {
    return Math.floor(Math.random() * 9900000) + 100000; // 100KB to 10MB
  }
  
  /**
   * Generate sample documents for a loan
   */
  async generateSampleDocuments(loanId: string, loanType: string): Promise<LoanDocument[]> {
    if (!loanId || !loanType) {
      console.error('Cannot generate sample documents: missing loanId or loanType');
      return [];
    }
    
    try {
      // Get loan data
      const loan = loanDatabase.getLoanById(loanId);
      if (!loan) {
        console.error(`Cannot generate sample documents: loan ${loanId} not found`);
        return [];
      }
      
      // Get required document types
      const requiredDocTypes = getRequiredDocuments(loanType);
      if (!Array.isArray(requiredDocTypes) || requiredDocTypes.length === 0) {
        console.error(`No required document types found for loan type ${loanType}`);
        return [];
      }
      
      // Generate documents
      const sampleDocuments: LoanDocument[] = [];
      
      for (const docType of requiredDocTypes) {
        try {
          // Generate document content
          const content = getDocumentTemplate(docType.docType, loan);
          if (!content) {
            console.warn(`No content generated for document type ${docType.docType}`);
            continue;
          }
          
          // Create the document
          const sampleDoc: LoanDocument = {
            id: uuidv4(),
            loanId,
            docType: docType.docType,
            filename: `SAMPLE_${docType.docType}-${Math.floor(Math.random() * 10000)}.html`,
            category: docType.category as DocumentCategory,
            section: docType.section || '',
            subsection: docType.subsection || '',
            dateUploaded: new Date().toISOString(),
            fileType: '.html',
            fileSize: this.getRandomFileSize(),
            content,
            isRequired: true,
            version: 1,
            status: 'pending' as DocumentStatus
          };
          
          sampleDocuments.push(sampleDoc);
        } catch (error) {
          console.error(`Error generating sample document for ${docType.docType}:`, error);
        }
      }
      
      // Save the generated documents
      if (sampleDocuments.length > 0) {
        await documentStorage.saveDocuments(sampleDocuments);
        console.log(`Generated and stored ${sampleDocuments.length} sample documents for loan ${loanId}`);
      }
      
      return sampleDocuments;
    } catch (error) {
      console.error(`Error generating sample documents for loan ${loanId}:`, error);
      return [];
    }
  }
  
  /**
   * Generate sample documents for all loans
   */
  async generateSampleDocumentsForAllLoans(): Promise<number> {
    try {
      // Get all loans
      const loans = loanDatabase.getLoans();
      let totalDocumentsGenerated = 0;
      
      // Generate sample documents for each loan
      for (const loan of loans) {
        const sampleDocuments = await this.generateSampleDocuments(loan.id, loan.loanType);
        totalDocumentsGenerated += sampleDocuments.length;
      }
      
      return totalDocumentsGenerated;
    } catch (error) {
      console.error('Error generating sample documents for all loans:', error);
      return 0;
    }
  }
  
  /**
   * Clear all documents
   */
  async clearAllDocuments(): Promise<void> {
    return documentStorage.clearAllDocuments();
  }
}

// Export singleton instance
export const documentService = new DocumentService(); 