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
  'preliminary_title': getPreliminaryTitleReportTemplate,
  'closing_checklist': getLenderClosingChecklistTemplate,
  'mortgage_deed_of_trust': generateDeedOfTrust,
  'patriot_act_compliance': getPatriotActComplianceTemplate,
  'property_insurance': getPropertyInsurancePolicyTemplate,
  'liability_insurance': getLiabilityInsurancePolicyTemplate,
  'investment_history': (loan: LoanData) => `<h1>Investment History</h1><p>Investment history for ${loan.borrowerName} is not yet implemented.</p>`,
  'loan_servicing_agreement': (loan: LoanData) => `<h1>Loan Servicing Agreement</h1><p>Loan servicing agreement for ${loan.borrowerName} is not yet implemented.</p>`,
  'state_lending_disclosures': (loan: LoanData) => `<h1>State Lending Disclosures</h1><p>State lending disclosures for ${loan.borrowerName} are not yet implemented.</p>`,
  'federal_lending_disclosures': (loan: LoanData) => `<h1>Federal Lending Disclosures</h1><p>Federal lending disclosures for ${loan.borrowerName} are not yet implemented.</p>`,
  'ofac_check': (loan: LoanData) => `<h1>OFAC Check</h1><p>OFAC check for ${loan.borrowerName} is not yet implemented.</p>`,
  'payment_history': (loan: LoanData) => `<h1>Payment History</h1><p>Payment history for ${loan.borrowerName} is not yet implemented.</p>`,
  'payment_receipts': (loan: LoanData) => `<h1>Payment Receipts</h1><p>Payment receipts for ${loan.borrowerName} are not yet implemented.</p>`,
  'ach_authorization': (loan: LoanData) => `<h1>ACH Authorization</h1><p>ACH authorization for ${loan.borrowerName} is not yet implemented.</p>`,
  'property_tax_verification': (loan: LoanData) => `<h1>Property Tax Verification</h1><p>Property tax verification for ${loan.borrowerName} is not yet implemented.</p>`,
  'insurance_renewal': (loan: LoanData) => `<h1>Insurance Renewal</h1><p>Insurance renewal for ${loan.borrowerName} is not yet implemented.</p>`,
  'annual_financial_review': (loan: LoanData) => `<h1>Annual Financial Review</h1><p>Annual financial review for ${loan.borrowerName} is not yet implemented.</p>`
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
  'preliminary_title': 'property',
  'closing_checklist': 'loan',
  'mortgage_deed_of_trust': 'legal',
  'patriot_act_compliance': 'legal',
  'property_insurance': 'property',
  'liability_insurance': 'property',
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
  'preliminary_title': 'Preliminary Title Report',
  'closing_checklist': 'Closing Checklist',
  'mortgage_deed_of_trust': 'Mortgage/Deed of Trust',
  'patriot_act_compliance': 'Patriot Act Compliance',
  'property_insurance': 'Property Insurance',
  'liability_insurance': 'Liability Insurance',
  'investment_history': 'Investment History',
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
   * Generate document content without adding it to the document service
   */
  generateDocumentContent(loan: LoanData, docType: string): string | null {
    // Check if we have a generator for this document type
    if (!documentGenerators[docType]) {
      console.error(`No generator found for document type: ${docType}`);
      return null;
    }

    // Generate the HTML content using the appropriate generator
    return documentGenerators[docType](loan);
  },

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
    // Note: We're not formatting the content as base64 because it's HTML, not a PDF
    const fakeDocument: SimpleDocument = {
      id: `fake-${docType}-${loan.id}`,
      loanId: loan.id,
      filename: `${docType.replace(/_/g, '-')}.html`, // Changed to .html to indicate it's HTML content
      docType: docType,
      category: documentCategories[docType] || 'misc',
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