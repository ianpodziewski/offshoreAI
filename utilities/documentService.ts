// utilities/documentService.ts
import { LoanData } from './loanGenerator';
import { 
  generatePromissoryNote, 
  generateDeedOfTrust, 
  generateClosingDisclosure 
} from './documentTemplates';

export interface LoanDocument {
  id: string;
  loanId: string;
  docType: string;
  category: string;
  filename: string;
  dateCreated: string;
  status: string;
  content: string;
}

// Generate all required documents for a loan
export function generateLoanDocuments(loan: LoanData): LoanDocument[] {
  const documents: LoanDocument[] = [];
  const now = new Date().toISOString();
  
  // Generate documents based on loan type and other criteria
  // Promissory Note - standard for all loans
  documents.push({
    id: `pnote-${loan.id}`,
    loanId: loan.id,
    docType: 'promissory_note',
    category: 'loan',
    filename: 'promissory_note.pdf',
    dateCreated: loan.dateCreated,
    status: 'pending',
    content: generatePromissoryNote(loan)
  });
  
  // Deed of Trust - for property-secured loans
  documents.push({
    id: `deed-${loan.id}`,
    loanId: loan.id,
    docType: 'deed_of_trust',
    category: 'legal',
    filename: 'deed_of_trust.pdf',
    dateCreated: loan.dateCreated,
    status: 'pending',
    content: generateDeedOfTrust(loan)
  });
  
  // Closing Disclosure - for all loans
  documents.push({
    id: `cd-${loan.id}`,
    loanId: loan.id,
    docType: 'closing_disclosure',
    category: 'financial',
    filename: 'closing_disclosure.pdf',
    dateCreated: loan.dateCreated,
    status: 'pending',
    content: generateClosingDisclosure(loan)
  });
  
  // Add loan-specific documents based on loan type
  if (loan.loanType === 'fha') {
    documents.push({
      id: `fha-${loan.id}`,
      loanId: loan.id,
      docType: 'fha_loan_application',
      category: 'loan',
      filename: 'fha_loan_application.pdf',
      dateCreated: loan.dateCreated,
      status: 'pending',
      content: `<div class="document">FHA Loan Application for ${loan.borrowerName}</div>`
    });
  } else if (loan.loanType === 'va') {
    documents.push({
      id: `va-${loan.id}`,
      loanId: loan.id,
      docType: 'va_loan_certificate',
      category: 'loan',
      filename: 'va_loan_certificate.pdf',
      dateCreated: loan.dateCreated,
      status: 'pending',
      content: `<div class="document">VA Loan Certificate for ${loan.borrowerName}</div>`
    });
  }
  
  return documents;
}

// Local storage management for documents
const DOCUMENTS_STORAGE_KEY = 'simulated_loan_documents';

export const documentService = {
  // Initialize documents for a loan
  generateDocumentsForLoan: (loan: LoanData): LoanDocument[] => {
    const documents = generateLoanDocuments(loan);
    
    // Get existing documents
    const existingDocs = documentService.getAllDocuments();
    
    // Filter out any existing docs for this loan
    const otherDocs = existingDocs.filter(doc => doc.loanId !== loan.id);
    
    // Save the combined documents
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify([...otherDocs, ...documents]));
    
    return documents;
  },
  
  getAllDocuments: (): LoanDocument[] => {
    const docsJson = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    const docs = docsJson ? JSON.parse(docsJson) : [];
    console.log("Retrieved documents:", docs); // Add this for debugging
    return docs;
  },
  
  // Get documents for a specific loan
  getDocumentsForLoan: (loanId: string): LoanDocument[] => {
    const allDocs = documentService.getAllDocuments();
    return allDocs.filter(doc => doc.loanId === loanId);
  },
  
  // Update document status
  updateDocumentStatus: (docId: string, status: string): LoanDocument | null => {
    const allDocs = documentService.getAllDocuments();
    const docIndex = allDocs.findIndex(doc => doc.id === docId);
    
    if (docIndex === -1) return null;
    
    allDocs[docIndex].status = status;
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocs));
    
    return allDocs[docIndex];
  }
};