// utilities/documentService.ts
import { LoanData, LoanType } from './loanGenerator';
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
  switch(loan.loanType) {
    case 'fix_and_flip':
      documents.push({
        id: `rehab-plan-${loan.id}`,
        loanId: loan.id,
        docType: 'rehab_plan',
        category: 'property',
        filename: 'rehab_plan.pdf',
        dateCreated: loan.dateCreated,
        status: 'pending',
        content: `<div class="document">Rehab Plan for ${loan.borrowerName}'s Fix and Flip Project</div>`
      });
      break;
    
    case 'construction':
      documents.push({
        id: `construction-plan-${loan.id}`,
        loanId: loan.id,
        docType: 'construction_plan',
        category: 'property',
        filename: 'construction_plan.pdf',
        dateCreated: loan.dateCreated,
        status: 'pending',
        content: `<div class="document">Construction Plan for ${loan.borrowerName}'s Development Project</div>`
      });
      break;
    
    case 'bridge':
      documents.push({
        id: `bridge-loan-docs-${loan.id}`,
        loanId: loan.id,
        docType: 'bridge_loan_docs',
        category: 'loan',
        filename: 'bridge_loan_documents.pdf',
        dateCreated: loan.dateCreated,
        status: 'pending',
        content: `<div class="document">Bridge Loan Documentation for ${loan.borrowerName}</div>`
      });
      break;
    
    case 'rental':
      documents.push({
        id: `rental-pro-forma-${loan.id}`,
        loanId: loan.id,
        docType: 'rental_pro_forma',
        category: 'financial',
        filename: 'rental_pro_forma.pdf',
        dateCreated: loan.dateCreated,
        status: 'pending',
        content: `<div class="document">Rental Property Pro Forma for ${loan.borrowerName}</div>`
      });
      break;
    
    case 'commercial':
      documents.push({
        id: `commercial-appraisal-${loan.id}`,
        loanId: loan.id,
        docType: 'commercial_appraisal',
        category: 'financial',
        filename: 'commercial_appraisal.pdf',
        dateCreated: loan.dateCreated,
        status: 'pending',
        content: `<div class="document">Commercial Property Appraisal for ${loan.borrowerName}</div>`
      });
      break;
    
    case 'land':
      documents.push({
        id: `land-feasibility-${loan.id}`,
        loanId: loan.id,
        docType: 'land_feasibility',
        category: 'property',
        filename: 'land_feasibility_study.pdf',
        dateCreated: loan.dateCreated,
        status: 'pending',
        content: `<div class="document">Land Feasibility Study for ${loan.borrowerName}</div>`
      });
      break;
    
    case 'rehab':
      documents.push({
        id: `rehab-assessment-${loan.id}`,
        loanId: loan.id,
        docType: 'rehab_assessment',
        category: 'property',
        filename: 'rehab_assessment.pdf',
        dateCreated: loan.dateCreated,
        status: 'pending',
        content: `<div class="document">Rehab Property Assessment for ${loan.borrowerName}</div>`
      });
      break;
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