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
        { docType: "loan_application", label: "Completed loan application", isRequired: true },
        { docType: "photo_id", label: "Government-issued photo ID", isRequired: true },
        { docType: "credit_authorization", label: "Credit authorization", isRequired: true },
        { docType: "background_check", label: "Background check results", isRequired: true },
        { docType: "contact_information", label: "Contact information sheet", isRequired: true }
      ]
    },
    financial_documentation: {
      title: "Financial Documentation",
      documents: [
        { docType: "financial_statement", label: "Personal financial statement", isRequired: true },
        { docType: "personal_tax_returns", label: "Last 2 years personal tax returns", isRequired: true },
        { docType: "business_tax_returns", label: "Last 2 years business tax returns", isRequired: false },
        { docType: "bank_statements", label: "Last 3 months bank statements", isRequired: true },
        { docType: "income_verification", label: "Income verification documents", isRequired: true },
        { docType: "real_estate_schedule", label: "Schedule of real estate owned", isRequired: true },
        { docType: "debt_schedule", label: "Debt schedule", isRequired: true },
        { docType: "credit_explanation", label: "Credit explanation letters", isRequired: false }
      ]
    },
    entity_documentation: {
      title: "Entity Documentation",
      documents: [
        { docType: "formation_documents", label: "Business formation documents", isRequired: false },
        { docType: "operating_agreement", label: "Operating agreement/bylaws", isRequired: false },
        { docType: "certificate_good_standing", label: "Certificate of good standing", isRequired: false },
        { docType: "ein_documentation", label: "EIN documentation", isRequired: false },
        { docType: "resolution_to_borrow", label: "Resolution to borrow", isRequired: false },
        { docType: "corporate_structure", label: "Corporate structure chart", isRequired: false }
      ]
    },
    experience_background: {
      title: "Experience & Background",
      documents: [
        { docType: "investment_history", label: "Real estate investment history", isRequired: true },
        { docType: "project_portfolio", label: "Past project portfolio", isRequired: true },
        { docType: "professional_credentials", label: "Professional credentials", isRequired: false },
        { docType: "references", label: "References", isRequired: true },
        { docType: "risk_assessment", label: "Risk tier assessment", isRequired: true }
      ]
    },
    exit_strategy: {
      title: "Exit Strategy",
      documents: [
        { docType: "exit_strategy", label: "Exit strategy statement", isRequired: true },
        { docType: "project_timeline", label: "Timeline for project completion", isRequired: true },
        { docType: "refinance_qualification", label: "Refinance qualification", isRequired: false },
        { docType: "sales_comparables", label: "Sales comparables", isRequired: false },
        { docType: "marketing_plan", label: "Marketing plan", isRequired: false }
      ]
    }
  },
  
  property: {
    property_information: {
      title: "Property Information",
      documents: [
        { docType: "property_summary", label: "Property summary sheet", isRequired: true },
        { docType: "purchase_contract", label: "Purchase contract", isRequired: true },
        { docType: "property_photos", label: "Property photos (interior/exterior)", isRequired: true },
        { docType: "preliminary_title", label: "Preliminary title report", isRequired: true },
        { docType: "survey_plot", label: "Survey/plot plan", isRequired: true },
        { docType: "legal_description", label: "Legal description", isRequired: true },
        { docType: "zoning_verification", label: "Zoning verification", isRequired: true }
      ]
    },
    valuation: {
      title: "Valuation",
      documents: [
        { docType: "appraisal_report", label: "Appraisal report", isRequired: true },
        { docType: "comparative_market_analysis", label: "Comparative market analysis", isRequired: true },
        { docType: "arv_assessment", label: "After-repair value assessment", isRequired: false },
        { docType: "broker_price_opinion", label: "Broker price opinion", isRequired: false },
        { docType: "value_justification", label: "Value justification analysis", isRequired: true }
      ]
    },
    property_condition: {
      title: "Property Condition",
      documents: [
        { docType: "inspection_report", label: "Inspection report", isRequired: true },
        { docType: "environmental_assessment", label: "Environmental assessment", isRequired: true },
        { docType: "engineering_report", label: "Engineering report", isRequired: false },
        { docType: "pest_inspection", label: "Pest inspection", isRequired: true },
        { docType: "natural_hazard_disclosure", label: "Natural hazard disclosures", isRequired: true },
        { docType: "lead_asbestos_testing", label: "Lead/asbestos testing", isRequired: false },
        { docType: "soil_reports", label: "Soil reports", isRequired: false }
      ]
    },
    project_documentation: {
      title: "Project Documentation",
      documents: [
        { docType: "renovation_budget", label: "Renovation/construction budget", isRequired: false },
        { docType: "scope_of_work", label: "Scope of work", isRequired: false },
        { docType: "architectural_plans", label: "Architectural plans", isRequired: false },
        { docType: "contractor_bids", label: "Contractor bids and credentials", isRequired: false },
        { docType: "construction_timeline", label: "Construction timeline", isRequired: false },
        { docType: "permits_approvals", label: "Permits and approvals", isRequired: false },
        { docType: "draw_schedule", label: "Draw schedule", isRequired: false }
      ]
    },
    income_property_documents: {
      title: "Income Property Documents",
      documents: [
        { docType: "rent_roll", label: "Rent roll", isRequired: false },
        { docType: "lease_agreements", label: "Lease agreements", isRequired: false },
        { docType: "operating_expense_history", label: "Operating expense history", isRequired: false },
        { docType: "dscr_calculation", label: "DSCR calculation worksheet", isRequired: false },
        { docType: "property_management_agreement", label: "Property management agreement", isRequired: false },
        { docType: "market_rental_analysis", label: "Market rental analysis", isRequired: false },
        { docType: "tenant_estoppel", label: "Tenant estoppel certificates", isRequired: false }
      ]
    },
    state_specific_requirements: {
      title: "State-Specific Property Requirements",
      documents: [
        { docType: "state_disclosures", label: "State-specific property disclosures", isRequired: false },
        { docType: "regional_certifications", label: "Regional certifications", isRequired: false },
        { docType: "local_compliance", label: "Local compliance documentation", isRequired: false }
      ]
    }
  },
  
  closing: {
    pre_closing: {
      title: "Pre-Closing",
      documents: [
        { docType: "pre_approval_letter", label: "Pre-approval letter", isRequired: true },
        { docType: "term_sheet", label: "Term sheet", isRequired: true },
        { docType: "fee_disclosure", label: "Fee disclosure", isRequired: true },
        { docType: "rate_lock_agreement", label: "Rate lock agreement", isRequired: false },
        { docType: "underwriting_approval", label: "Underwriting approval", isRequired: true },
        { docType: "closing_checklist", label: "Closing checklist", isRequired: true }
      ]
    },
    loan_agreements: {
      title: "Loan Agreements",
      documents: [
        { docType: "promissory_note", label: "Promissory note", isRequired: true },
        { docType: "mortgage_deed_of_trust", label: "Mortgage/Deed of trust", isRequired: true },
        { docType: "security_agreement", label: "Security agreement", isRequired: true },
        { docType: "personal_guarantee", label: "Personal guarantee", isRequired: false },
        { docType: "assignment_rents_leases", label: "Assignment of rents and leases", isRequired: false },
        { docType: "loan_servicing_agreement", label: "Loan servicing agreement", isRequired: true }
      ]
    },
    compliance_documents: {
      title: "Compliance Documents",
      documents: [
        { docType: "state_lending_disclosures", label: "State-specific lending disclosures", isRequired: true },
        { docType: "federal_lending_disclosures", label: "Federal lending disclosures", isRequired: true },
        { docType: "aml_documentation", label: "Anti-money laundering documentation", isRequired: true },
        { docType: "ofac_check", label: "OFAC check results", isRequired: true },
        { docType: "patriot_act_compliance", label: "Patriot Act compliance verification", isRequired: true }
      ]
    },
    insurance: {
      title: "Insurance",
      documents: [
        { docType: "property_insurance", label: "Property insurance policy", isRequired: true },
        { docType: "flood_insurance", label: "Flood insurance", isRequired: false },
        { docType: "builders_risk_policy", label: "Builder's risk policy", isRequired: false },
        { docType: "liability_insurance", label: "Liability insurance", isRequired: true },
        { docType: "insurance_binder", label: "Insurance binder naming lender", isRequired: true }
      ]
    },
    funding: {
      title: "Funding",
      documents: [
        { docType: "closing_disclosure", label: "Closing disclosure", isRequired: true },
        { docType: "final_title_policy", label: "Final title policy", isRequired: true },
        { docType: "disbursement_instructions", label: "Disbursement instructions", isRequired: true },
        { docType: "funding_authorization", label: "Funding authorization", isRequired: true },
        { docType: "escrow_agreements", label: "Escrow agreements", isRequired: false },
        { docType: "wiring_instructions", label: "Wiring instructions", isRequired: true }
      ]
    }
  },
  
  servicing: {
    payment_records: {
      title: "Payment Records",
      documents: [
        { docType: "payment_history", label: "Payment history", isRequired: true },
        { docType: "payment_receipts", label: "Payment receipts", isRequired: true },
        { docType: "ach_authorization", label: "ACH authorization", isRequired: true },
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