// utilities/fakeDocumentService.ts
import { LoanData } from './loanGenerator';
import { SimpleDocument, simpleDocumentService } from './simplifiedDocumentService';
import {
  generatePromissoryNote,
  generateDeedOfTrust,
  generateClosingDisclosure,
  generatePropertyAppraisal
} from './enhancedDocumentGenerator';
import { 
  getPurchaseContractTemplate, 
  getPreliminaryTitleReportTemplate 
} from './templates/propertyInformationTemplates';
import {
  getAppraisalReportTemplate,
  getBrokerPriceOpinionTemplate
} from './templates/valuationTemplates';
import {
  getRenovationBudgetTemplate,
  getDrawScheduleTemplate
} from './templates/projectDocumentationTemplates';
import {
  getLeaseAgreementTemplate,
  getDscrCalculationWorksheetTemplate,
  getPropertyManagementAgreementTemplate
} from './templates/incomeDocumentTemplates';
import {
  getPreApprovalLetterTemplate,
  getFeeDisclosureTemplate,
  getRateLockAgreementTemplate
} from './templates/preClosingDocuments';
import {
  getLenderClosingChecklistTemplate,
  getLoanAgreementTemplate
} from './templates/lenderLoanDocs';
import {
  getAntiMoneyLaunderingDocTemplate,
  getPatriotActComplianceTemplate
} from './templates/complianceDocuments';
import {
  getPropertyInsurancePolicyTemplate,
  getFloodInsurancePolicyTemplate,
  getBuildersRiskPolicyTemplate,
  getLiabilityInsurancePolicyTemplate
} from './templates/insuranceDocumentTemplates';
import {
  getFinalTitlePolicyTemplate,
  getDisbursementInstructionsTemplate,
  getFundingAuthorizationTemplate,
  getEscrowAgreementTemplate,
  getWiringInstructionsTemplate
} from './templates/fundingDocumentTemplates';

// Define document name prefixes based on loan type
const getLoanTypePrefix = (loanType: string): string => {
  const prefixMap: Record<string, string> = {
    'fix_and_flip': 'F&F',
    'bridge': 'BR',
    'construction': 'CON',
    'rental': 'RNT',
    'multifamily': 'MF'
  };
  
  return prefixMap[loanType] || 'STD';
};

// Helper function to generate unimplemented document templates
const generateUnimplementedTemplate = (title: string, borrowerName: string): string => {
  return `
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 40px;
        line-height: 1.6;
      }
      .document-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 5px;
      }
      h1 {
        color: #333;
        border-bottom: 2px solid #ddd;
        padding-bottom: 10px;
      }
      .warning {
        background-color: #fff8e1;
        border-left: 4px solid #ffc107;
        padding: 12px 20px;
        margin: 20px 0;
      }
      .info {
        background-color: #e1f5fe;
        border-left: 4px solid #03a9f4;
        padding: 12px 20px;
        margin: 20px 0;
      }
    </style>
  </head>
  <body>
    <div class="document-container">
      <h1>${title}</h1>
      
      <div class="warning">
        <p><strong>Document Not Yet Implemented</strong></p>
        <p>This document template for ${borrowerName} is currently in development and not yet fully implemented.</p>
      </div>
      
      <div class="info">
        <p><strong>What This Document Will Include:</strong></p>
        <p>When implemented, this document will contain relevant information about ${title.toLowerCase()} for the borrower.</p>
        <p>If you need this document urgently, please contact your system administrator.</p>
      </div>
      
      <p>Document ID: SAMPLE-${Date.now()}</p>
      <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>
  </body>
  </html>
  `;
};

// A mapping of document types to their generation functions
const documentGenerators: Record<string, (loan: LoanData) => string> = {
  'promissory_note': generatePromissoryNote,
  'deed_of_trust': generateDeedOfTrust,
  'closing_disclosure': generateClosingDisclosure,
  'property_appraisal': generatePropertyAppraisal,
  'purchase_contract': getPurchaseContractTemplate,
  'preliminary_title_report': getPreliminaryTitleReportTemplate,
  'appraisal_report': getAppraisalReportTemplate,
  'broker_price_opinion': getBrokerPriceOpinionTemplate,
  'bpo': getBrokerPriceOpinionTemplate,
  'renovation_budget': getRenovationBudgetTemplate,
  'construction_budget': getRenovationBudgetTemplate,
  'draw_schedule': getDrawScheduleTemplate,
  'lease_agreement': getLeaseAgreementTemplate,
  'dscr_calculation': getDscrCalculationWorksheetTemplate,
  'property_management_agreement': getPropertyManagementAgreementTemplate,
  'pre_approval_letter': getPreApprovalLetterTemplate,
  'fee_disclosure': getFeeDisclosureTemplate,
  'rate_lock_agreement': getRateLockAgreementTemplate,
  'lender_closing_checklist': getLenderClosingChecklistTemplate,
  'loan_agreement': getLoanAgreementTemplate,
  'aml_documentation': getAntiMoneyLaunderingDocTemplate,
  'patriot_act_certification': getPatriotActComplianceTemplate,
  'property_insurance_policy': getPropertyInsurancePolicyTemplate,
  'flood_insurance_policy': getFloodInsurancePolicyTemplate,
  'builders_risk_policy': getBuildersRiskPolicyTemplate,
  'liability_insurance_policy': getLiabilityInsurancePolicyTemplate,
  'final_title_policy': getFinalTitlePolicyTemplate,
  'disbursement_instructions': getDisbursementInstructionsTemplate,
  'funding_authorization': getFundingAuthorizationTemplate,
  'escrow_agreements': getEscrowAgreementTemplate,
  'wiring_instructions': getWiringInstructionsTemplate,
  
  // Placeholder templates for currently unimplemented documents that are being requested
  'investment_history': (loan: LoanData) => generateUnimplementedTemplate('RE Track Record', loan.borrowerName),
  'state_lending_disclosures': (loan: LoanData) => generateUnimplementedTemplate('State Lending Disclosures', loan.borrowerName),
  'federal_lending_disclosures': (loan: LoanData) => generateUnimplementedTemplate('Federal Lending Disclosures', loan.borrowerName),
  'ofac_check': (loan: LoanData) => generateUnimplementedTemplate('OFAC Check', loan.borrowerName),
  'payment_history': (loan: LoanData) => generateUnimplementedTemplate('Payment History', loan.borrowerName),
  'payment_receipts': (loan: LoanData) => generateUnimplementedTemplate('Payment Receipts', loan.borrowerName),
  'ach_authorization': (loan: LoanData) => generateUnimplementedTemplate('ACH Authorization', loan.borrowerName),
  'property_tax_verification': (loan: LoanData) => generateUnimplementedTemplate('Property Tax Verification', loan.borrowerName),
  'insurance_renewal': (loan: LoanData) => generateUnimplementedTemplate('Insurance Renewal', loan.borrowerName),
  'annual_financial_review': (loan: LoanData) => generateUnimplementedTemplate('Annual Financial Review', loan.borrowerName)
};

// A mapping of document types to their categories
const documentCategories: Record<string, 'loan' | 'legal' | 'financial' | 'misc' | 'property' | 'project'> = {
  'promissory_note': 'legal',
  'deed_of_trust': 'legal',
  'closing_disclosure': 'financial',
  'property_appraisal': 'financial',
  'purchase_contract': 'property',
  'preliminary_title_report': 'property',
  'appraisal_report': 'financial',
  'broker_price_opinion': 'financial',
  'bpo': 'financial',
  'renovation_budget': 'project',
  'construction_budget': 'project',
  'draw_schedule': 'project',
  'lease_agreement': 'financial',
  'dscr_calculation': 'financial',
  'property_management_agreement': 'financial',
  'pre_approval_letter': 'loan',
  'fee_disclosure': 'financial',
  'rate_lock_agreement': 'loan',
  'lender_closing_checklist': 'loan',
  'loan_agreement': 'loan',
  'aml_documentation': 'legal',
  'patriot_act_certification': 'legal',
  'property_insurance_policy': 'property',
  'flood_insurance_policy': 'property',
  'builders_risk_policy': 'property',
  'liability_insurance_policy': 'property',
  'final_title_policy': 'legal',
  'disbursement_instructions': 'financial',
  'funding_authorization': 'financial',
  'escrow_agreements': 'legal',
  'wiring_instructions': 'financial',
  'investment_history': 'financial',
  'loan_servicing_agreement': 'loan',
  'state_lending_disclosures': 'legal',
  'federal_lending_disclosures': 'legal',
  'ofac_check': 'legal',
  'payment_history': 'financial',
  'payment_receipts': 'financial',
  'ach_authorization': 'financial',
  'property_tax_verification': 'property',
  'insurance_renewal': 'property',
  'annual_financial_review': 'financial'
};

// Document names for display
const documentNames: Record<string, string> = {
  'promissory_note': 'Promissory Note',
  'deed_of_trust': 'Deed of Trust',
  'closing_disclosure': 'Closing Disclosure',
  'property_appraisal': 'Property Appraisal',
  'purchase_contract': 'Purchase Contract',
  'preliminary_title_report': 'Preliminary Title Report',
  'appraisal_report': 'Appraisal Report',
  'broker_price_opinion': 'Broker Price Opinion',
  'bpo': 'Broker Price Opinion (BPO)',
  'renovation_budget': 'Renovation Budget',
  'construction_budget': 'Construction Budget',
  'draw_schedule': 'Draw Schedule',
  'lease_agreement': 'Lease Agreement',
  'dscr_calculation': 'DSCR Calculation Worksheet',
  'property_management_agreement': 'Property Management Agreement',
  'pre_approval_letter': 'Pre-Approval Letter',
  'fee_disclosure': 'Fee Disclosure',
  'rate_lock_agreement': 'Rate Lock Agreement',
  'lender_closing_checklist': 'Lender Closing Checklist',
  'loan_agreement': 'Loan Agreement',
  'aml_documentation': 'Anti-Money Laundering Documentation',
  'patriot_act_certification': 'Patriot Act Certification',
  'property_insurance_policy': 'Property Insurance Policy',
  'flood_insurance_policy': 'Flood Insurance Policy',
  'builders_risk_policy': 'Builders Risk Policy',
  'liability_insurance_policy': 'Liability Insurance Policy',
  'final_title_policy': 'Final Title Policy',
  'disbursement_instructions': 'Disbursement Instructions',
  'funding_authorization': 'Funding Authorization',
  'escrow_agreements': 'Escrow Agreement',
  'wiring_instructions': 'Wiring Instructions',
  'investment_history': 'RE Track Record',
  'loan_servicing_agreement': 'Loan Servicing Agreement',
  'state_lending_disclosures': 'State Lending Disclosures',
  'federal_lending_disclosures': 'Federal Lending Disclosures',
  'ofac_check': 'OFAC Check',
  'payment_history': 'Payment History',
  'payment_receipts': 'Payment Receipts',
  'ach_authorization': 'ACH Authorization',
  'property_tax_verification': 'Property Tax Verification',
  'insurance_renewal': 'Insurance Renewal',
  'annual_financial_review': 'Annual Financial Review'
};

export const fakeDocumentService = {
  /**
   * Document type alias mapping to handle different naming conventions 
   */
  documentTypeAliases: {
    'preliminary_title': 'preliminary_title_report',
    'mortgage_deed_of_trust': 'deed_of_trust',
    'property_insurance': 'property_insurance_policy',
    'liability_insurance': 'liability_insurance_policy',
    'patriot_act_compliance': 'patriot_act_certification',
    'closing_checklist': 'lender_closing_checklist',
    'loan_servicing_agreement': 'loan_agreement',
    'investment_history': 'investment_history',
    'lease_agreements': 'lease_agreement',
    'flood_insurance': 'flood_insurance_policy'
  } as Record<string, string>,

  /**
   * Get the standard document type name from a potentially aliased name
   */
  getStandardDocType(docType: string): string {
    return this.documentTypeAliases[docType] || docType;
  },

  /**
   * Generate document content without adding it to the document service
   */
  generateDocumentContent(loan: LoanData, docType: string): string | null {
    // Convert potentially aliased document type to standard name
    const standardDocType = this.getStandardDocType(docType);
    
    // Check if we have a generator for this document type
    if (!documentGenerators[standardDocType]) {
      console.error(`No generator found for document type: ${docType}`);
      return null;
    }

    // Generate the HTML content using the appropriate generator
    return documentGenerators[standardDocType](loan);
  },

  /**
   * Generate a fake document for a specific loan and document type
   */
  generateFakeDocument(loan: LoanData, docType: string): SimpleDocument | null {
    // Convert potentially aliased document type to standard name
    const standardDocType = this.getStandardDocType(docType);
    
    // Check if we have a generator for this document type
    if (!documentGenerators[standardDocType]) {
      console.error(`No generator found for document type: ${docType}`);
      return null;
    }

    // Generate the HTML content using the appropriate generator
    const content = documentGenerators[standardDocType](loan);
    
    // Create a SimpleDocument object with the generated content
    // Note: We're not formatting the content as base64 because it's HTML, not a PDF
    const fakeDocument: SimpleDocument = {
      id: `fake-${docType}-${loan.id}`,
      loanId: loan.id,
      filename: `${docType.replace(/_/g, '-')}.html`, // Changed to .html to indicate it's HTML content
      docType: docType, // Keep original docType for consistency with requests
      category: documentCategories[standardDocType] || 'misc',
      content: content, // Plain HTML content, not base64 encoded
      dateUploaded: new Date().toISOString(),
      status: 'pending',
      fileType: 'text/html' // Changed file type to HTML
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
    const standardDocType = this.getStandardDocType(docType);
    const documents = simpleDocumentService.getDocumentsForLoan(loanId);
    return documents.some(doc => doc.docType === docType || doc.docType === standardDocType);
  },

  /**
   * Get a fake document by loan ID and document type
   */
  getFakeDocument(loanId: string, docType: string): SimpleDocument | null {
    const standardDocType = this.getStandardDocType(docType);
    const documents = simpleDocumentService.getDocumentsForLoan(loanId);
    return documents.find(doc => doc.docType === docType || doc.docType === standardDocType) || null;
  },

  /**
   * Get all fake documents for a loan
   */
  getAllFakeDocuments(loanId: string): SimpleDocument[] {
    return simpleDocumentService.getDocumentsForLoan(loanId);
  }
};