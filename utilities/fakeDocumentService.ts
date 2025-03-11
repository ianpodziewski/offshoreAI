// utilities/fakeDocumentService.ts
import { LoanData } from './loanGenerator';
import { SimpleDocument, simpleDocumentService } from './simplifiedDocumentService';
import {
  generatePromissoryNote,
  generateDeedOfTrust,
  generateClosingDisclosure,
  generatePropertyAppraisal
} from './enhancedDocumentGenerator';

// A mapping of document types to their generation functions
const documentGenerators: Record<string, (loan: LoanData) => string> = {
  'promissory_note': generatePromissoryNote,
  'deed_of_trust': generateDeedOfTrust,
  'closing_disclosure': generateClosingDisclosure,
  'property_appraisal': generatePropertyAppraisal
};

// A mapping of document types to their categories
const documentCategories: Record<string, 'loan' | 'legal' | 'financial' | 'misc'> = {
  'promissory_note': 'legal',
  'deed_of_trust': 'legal',
  'closing_disclosure': 'financial',
  'property_appraisal': 'financial'
};

// Document names for display
const documentNames: Record<string, string> = {
  'promissory_note': 'Promissory Note',
  'deed_of_trust': 'Deed of Trust',
  'closing_disclosure': 'Closing Disclosure',
  'property_appraisal': 'Property Appraisal'
};

export const fakeDocumentService = {
  /**
   * Generate a fake document for a specific loan and document type
   */
  generateFakeDocument(loan: LoanData, docType: string): SimpleDocument | null {
    // Check if we have a generator for this document type
    if (!documentGenerators[docType]) {
      console.error(`No generator found for document type: ${docType}`);
      return null;
    }

    // Generate the HTML content using the appropriate generator
    const content = documentGenerators[docType](loan);
    
    // Create a SimpleDocument object with the generated content
    const fakeDocument: SimpleDocument = {
      id: `fake-${docType}-${loan.id}`,
      loanId: loan.id,
      filename: `${docType.replace(/_/g, '-')}.pdf`,
      docType: docType,
      category: documentCategories[docType] || 'misc',
      content: content,
      dateUploaded: new Date().toISOString(),
      status: 'pending'
    };

    // Store the document using the existing service
    return simpleDocumentService.addDocumentDirectly(fakeDocument);
  },

  /**
   * Generate all available fake documents for a loan
   */
  generateAllFakeDocuments(loan: LoanData): SimpleDocument[] {
    const generatedDocuments: SimpleDocument[] = [];

    // Generate each document type
    Object.keys(documentGenerators).forEach(docType => {
      const document = this.generateFakeDocument(loan, docType);
      if (document) {
        generatedDocuments.push(document);
      }
    });

    return generatedDocuments;
  },

  /**
   * Check if a fake document exists for a loan and document type
   */
  hasFakeDocument(loanId: string, docType: string): boolean {
    const documents = simpleDocumentService.getDocumentsForLoan(loanId);
    return documents.some(doc => doc.docType === docType);
  },

  /**
   * Get a fake document by loan ID and document type
   */
  getFakeDocument(loanId: string, docType: string): SimpleDocument | null {
    const documents = simpleDocumentService.getDocumentsForLoan(loanId);
    return documents.find(doc => doc.docType === docType) || null;
  },

  /**
   * Get all fake documents for a loan
   */
  getAllFakeDocuments(loanId: string): SimpleDocument[] {
    return simpleDocumentService.getDocumentsForLoan(loanId);
  }
};