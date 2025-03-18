import { v4 as uuidv4 } from 'uuid';

/**
 * Comprehensive loan document structure for private lending
 * This structure defines all document categories, sections, and types required for loan processing
 */

// Document status types
export type DocumentStatus = 'pending' | 'approved' | 'rejected' | 'required' | 'optional' | 'received' | 'reviewed' | 'expired';

// Main document categories
export type DocumentCategory = 
  'borrower' | 
  'property' | 
  'closing' | 
  'servicing' | 
  'misc';

// Document interface
export interface LoanDocument {
  id: string;
  loanId: string;
  filename: string;
  fileType?: string;
  fileSize?: number;
  dateUploaded: string;
  category: DocumentCategory;
  section: string;
  subsection: string;
  docType: string;
  status: DocumentStatus;
  content?: string; // Base64 encoded content or HTML for generated documents
  notes?: string;
  assignedTo?: string;
  isRequired: boolean;
  expirationDate?: string;
  version?: number;
}

// Document structure definition
export const DOCUMENT_STRUCTURE = {
  borrower: {
    personal_information: {
      title: "Personal Information",
      documents: [
        { docType: "loan_application", label: "Loan Application", isRequired: true },
        { docType: "photo_id", label: "Identification", isRequired: true },
        { docType: "credit_authorization", label: "Credit Authorization", isRequired: true },
        { docType: "contact_information", label: "Contact Info Sheet", isRequired: true }
      ]
    },
    financial_documentation: {
      title: "Financial Documentation",
      documents: [
        { docType: "financial_statement", label: "Personal Financial Statement", isRequired: true },
        { docType: "personal_tax_returns", label: "Personal Tax Returns", isRequired: true },
        { docType: "business_tax_returns", label: "Business Tax Returns", isRequired: false },
        { docType: "bank_statements", label: "Bank Statements", isRequired: true },
        { docType: "income_verification", label: "Income Verification", isRequired: true },
        { docType: "real_estate_schedule", label: "Schedule of REO", isRequired: true },
        { docType: "investment_history", label: "RE Track Record", isRequired: true },
        { docType: "debt_schedule", label: "Debt Schedule", isRequired: true },
        { docType: "credit_explanation", label: "Credit LOE(s)", isRequired: false }
      ]
    },
    entity_documentation: {
      title: "Entity Documentation",
      documents: [
        { docType: "formation_documents", label: "Certificate of Formation", isRequired: true },
        { docType: "operating_agreement", label: "Operating Agreement/Bylaws", isRequired: true },
        { docType: "certificate_good_standing", label: "Certificate of Good Standing", isRequired: true },
        { docType: "ein_documentation", label: "EIN", isRequired: true },
        { docType: "resolution_to_borrow", label: "Resolution to Borrow", isRequired: true }
      ]
    },
    experience_background: {
      title: "Credit & Background",
      documents: [
        { docType: "credit_report", label: "Credit Report", isRequired: true },
        { docType: "background_check", label: "Background Check", isRequired: true }
      ]
    }
  },
  
  property: {
    property_information: {
      title: "Property Information",
      documents: [
        { docType: "purchase_contract", label: "Purchase Contract", isRequired: true },
        { docType: "preliminary_title", label: "Preliminary Title Report", isRequired: true },
      ]
    },
    valuation: {
      title: "Valuation",
      documents: [
        { docType: "appraisal_report", label: "Appraisal Report", isRequired: true },
        { docType: "broker_price_opinion", label: "Broker Price Opinion", isRequired: false }
      ]
    },
    project_documentation: {
      title: "Project Documentation",
      documents: [
        { docType: "renovation_budget", label: "Renovation/Construction Budget", isRequired: false },
        { docType: "draw_schedule", label: "Draw Schedule", isRequired: false }
      ]
    },
    income_property_documents: {
      title: "Income Property Documents",
      documents: [
        { docType: "lease_agreements", label: "Lease Agreements", isRequired: false },
        { docType: "dscr_calculation", label: "DSCR Calculation Worksheet", isRequired: false },
        { docType: "property_management_agreement", label: "Property Management Agreement", isRequired: false }
      ]
    },
    state_specific_requirements: {
      title: "State-Specific Property Requirements",
      documents: [
        { docType: "state_disclosures", label: "State-Specific property Disclosures", isRequired: false },
        { docType: "regional_certifications", label: "Regional Certifications", isRequired: false },
        { docType: "local_compliance", label: "Local Compliance Documentation", isRequired: false }
      ]
    }
  },
  
  closing: {
    pre_closing: {
      title: "Pre-Closing",
      documents: [
        { docType: "pre_approval_letter", label: "Pre-Approval Letter", isRequired: true },
        { docType: "term_sheet", label: "Term Sheet", isRequired: true },
        { docType: "fee_disclosure", label: "Fee Disclosure", isRequired: true },
        { docType: "rate_lock_agreement", label: "Rate Lock Agreement", isRequired: false }
      ]
    },
    loan_agreements: {
      title: "Loan Agreements",
      documents: [
        { docType: "closing_checklist", label: "Lender's Closing Checklist", isRequired: true },
        { docType: "promissory_note", label: "Promissory Note", isRequired: true },
        { docType: "mortgage_deed_of_trust", label: "Mortgage/Deed of Trust", isRequired: true },
        { docType: "security_agreement", label: "Security Agreement", isRequired: true },
        { docType: "personal_guarantee", label: "Personal Guarantee", isRequired: true },
        { docType: "assignment_rents_leases", label: "Assignment of Leases & Rents", isRequired: true },
        { docType: "loan_servicing_agreement", label: "Loan Agreement", isRequired: true }
      ]
    },
    compliance_documents: {
      title: "Compliance Documents",
      documents: [
        { docType: "state_lending_disclosures", label: "State-Specific Lending Disclosures", isRequired: false },
        { docType: "federal_lending_disclosures", label: "Federal Lending Disclosures", isRequired: false },
        { docType: "aml_documentation", label: "Anti-Money Laundering Documentation", isRequired: true },
        { docType: "ofac_check", label: "OFAC Check", isRequired: false },
        { docType: "patriot_act_compliance", label: "Patriot Act", isRequired: true }
      ]
    },
    insurance: {
      title: "Insurance",
      documents: [
        { docType: "property_insurance", label: "Property Insurance Policy", isRequired: true },
        { docType: "flood_insurance", label: "Flood Insurance", isRequired: false },
        { docType: "builders_risk_policy", label: "Builder's Risk Policy", isRequired: false },
        { docType: "liability_insurance", label: "Liability Insurance", isRequired: true }
      ]
    },
    funding: {
      title: "Funding",
      documents: [
        { docType: "closing_disclosure", label: "Closing Disclosure", isRequired: true },
        { docType: "final_title_policy", label: "Final Title Policy", isRequired: true },
        { docType: "disbursement_instructions", label: "Disbursement Instructions", isRequired: true },
        { docType: "funding_authorization", label: "Funding Authorization", isRequired: true },
        { docType: "escrow_agreements", label: "Escrow Agreements", isRequired: false },
        { docType: "wiring_instructions", label: "Wiring Instructions", isRequired: true }
      ]
    }
  },
  
  servicing: {
    payment_records: {
      title: "Payment Records",
      documents: [
        { docType: "payment_history", label: "Payment history", isRequired: false },
        { docType: "payment_receipts", label: "Payment receipts", isRequired: false },
        { docType: "ach_authorization", label: "ACH authorization", isRequired: false },
        { docType: "late_notices", label: "Late notices", isRequired: false },
        { docType: "payment_modification", label: "Payment modification requests", isRequired: false }
      ]
    },
    loan_monitoring: {
      title: "Loan Monitoring",
      documents: [
        { docType: "inspection_reports", label: "Project inspection reports", isRequired: false },
        { docType: "draw_requests", label: "Draw requests and approvals", isRequired: false },
        { docType: "progress_photos", label: "Construction progress photos", isRequired: false },
        { docType: "milestone_verification", label: "Milestone verification", isRequired: false },
        { docType: "budget_variance", label: "Budget variance tracking", isRequired: false },
        { docType: "change_orders", label: "Change orders", isRequired: false }
      ]
    },
    asset_management: {
      title: "Asset Management",
      documents: [
        { docType: "property_tax_verification", label: "Property tax verification", isRequired: true },
        { docType: "insurance_renewal", label: "Insurance renewal tracking", isRequired: true },
        { docType: "annual_financial_review", label: "Annual financial review", isRequired: true },
        { docType: "property_condition_reports", label: "Periodic property condition reports", isRequired: false },
        { docType: "lease_tenant_monitoring", label: "Lease/tenant monitoring", isRequired: false }
      ]
    },
    default_management: {
      title: "Default Management",
      documents: [
        { docType: "default_notices", label: "Default notices", isRequired: false },
        { docType: "workout_documentation", label: "Workout documentation", isRequired: false },
        { docType: "forbearance_agreements", label: "Forbearance agreements", isRequired: false },
        { docType: "loan_modification", label: "Loan modification documents", isRequired: false },
        { docType: "collection_communications", label: "Collection communications", isRequired: false },
        { docType: "foreclosure_documentation", label: "Foreclosure documentation", isRequired: false }
      ]
    },
    loan_conclusion: {
      title: "Loan Conclusion",
      documents: [
        { docType: "payoff_statement", label: "Payoff statement", isRequired: false },
        { docType: "satisfaction_of_mortgage", label: "Satisfaction of mortgage", isRequired: false },
        { docType: "release_documents", label: "Release documents", isRequired: false },
        { docType: "final_accounting", label: "Final accounting", isRequired: false },
        { docType: "post_loan_documentation", label: "Post-loan project documentation", isRequired: false },
        { docType: "client_followup", label: "Client follow-up records", isRequired: false }
      ]
    }
  }
};

// Helper function to get all document types in a flat structure
export function getAllDocumentTypes(): { 
  category: DocumentCategory; 
  section: string; 
  subsection: string; 
  docType: string; 
  label: string;
  isRequired: boolean;
}[] {
  const allDocTypes: { 
    category: DocumentCategory; 
    section: string; 
    subsection: string; 
    docType: string; 
    label: string;
    isRequired: boolean;
  }[] = [];
  
  // Iterate through the structure and flatten it
  Object.entries(DOCUMENT_STRUCTURE).forEach(([category, sections]) => {
    Object.entries(sections).forEach(([section, sectionData]) => {
      const { title, documents } = sectionData as { 
        title: string; 
        documents: { docType: string; label: string; isRequired: boolean; }[] 
      };
      
      documents.forEach(doc => {
        allDocTypes.push({
          category: category as DocumentCategory,
          section,
          subsection: title,
          docType: doc.docType,
          label: doc.label,
          isRequired: doc.isRequired
        });
      });
    });
  });
  
  return allDocTypes;
}

// Helper function to get required documents for a loan type
export function getRequiredDocuments(loanType: string): { 
  category: DocumentCategory; 
  section: string; 
  subsection: string; 
  docType: string; 
  label: string;
}[] {
  const allDocs = getAllDocumentTypes();
  let requiredDocs = allDocs.filter(doc => doc.isRequired);
  
  // Add loan-type specific requirements
  switch(loanType) {
    case 'fix_and_flip':
      // Add renovation-specific documents
      requiredDocs = requiredDocs.concat(
        allDocs.filter(doc => 
          doc.section === 'project_documentation' || 
          doc.docType === 'arv_assessment' ||
          doc.docType === 'sales_comparables'
        )
      );
      break;
      
    case 'rental':
    case 'brrrr':
      // Add rental property specific documents
      requiredDocs = requiredDocs.concat(
        allDocs.filter(doc => 
          doc.section === 'income_property_documents' ||
          doc.docType === 'refinance_qualification'
        )
      );
      break;
      
    case 'construction':
      // Add construction specific documents
      requiredDocs = requiredDocs.concat(
        allDocs.filter(doc => 
          doc.section === 'project_documentation' ||
          doc.docType === 'builders_risk_policy' ||
          doc.docType === 'soil_reports' ||
          doc.docType === 'engineering_report'
        )
      );
      break;
      
    case 'commercial':
      // Add commercial specific documents
      requiredDocs = requiredDocs.concat(
        allDocs.filter(doc => 
          doc.section === 'income_property_documents' ||
          doc.docType === 'entity_documentation'
        )
      );
      break;
  }
  
  // Remove duplicates that might have been added
  const uniqueDocs = requiredDocs.filter((doc, index, self) =>
    index === self.findIndex(d => d.docType === doc.docType)
  );
  
  return uniqueDocs;
}

// Helper function to create a new document
export function createDocument(
  loanId: string,
  docType: string,
  filename: string,
  content: string,
  status: DocumentStatus = 'pending'
): LoanDocument | null {
  // Find the document type in our structure
  const docTypeInfo = getAllDocumentTypes().find(dt => dt.docType === docType);
  
  if (!docTypeInfo) {
    console.error(`Document type ${docType} not found in structure`);
    return null;
  }
  
  return {
    id: uuidv4(),
    loanId,
    filename,
    dateUploaded: new Date().toISOString(),
    category: docTypeInfo.category,
    section: docTypeInfo.section,
    subsection: docTypeInfo.subsection,
    docType,
    status,
    content,
    isRequired: docTypeInfo.isRequired,
    version: 1
  };
}

// Export the document service
export const loanDocumentService = {
  // Get all required documents for a loan
  getRequiredDocumentsForLoan: (loanId: string, loanType: string): LoanDocument[] => {
    const requiredDocTypes = getRequiredDocuments(loanType);
    
    // Create placeholder documents for each required type
    return requiredDocTypes.map(docType => ({
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
  },
  
  // Get document structure for UI display
  getDocumentStructureForUI: () => {
    return DOCUMENT_STRUCTURE;
  },
  
  // Get missing required documents for a loan
  getMissingRequiredDocuments: (loanId: string, loanType: string, existingDocs: LoanDocument[]): LoanDocument[] => {
    const requiredDocs = getRequiredDocuments(loanType);
    const existingDocTypes = existingDocs.map(doc => doc.docType);
    
    // Filter out document types that already exist
    const missingDocTypes = requiredDocs.filter(doc => !existingDocTypes.includes(doc.docType));
    
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
  }
}; 