"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileCheck, MapPin, FileText, Upload, Eye, Clock, Check, X } from 'lucide-react';
import LayoutWrapper from '@/app/layout-wrapper';
import { loanDatabase } from '@/utilities/loanDatabase';
import SimpleDocumentViewer from '@/components/document/SimpleDocumentViewer';
import { SimpleDocument, simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import { COLORS } from '@/app/theme/colors';
import { fakeDocumentService } from '@/utilities/fakeDocumentService';
import LoanSidebar from '@/components/loan/LoanSidebar';

// Convert string to title case
const toTitleCase = (str: string): string => {
  return str
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Section component for grouping related document types
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children, actionButton }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4 pb-2" style={{ 
      borderBottom: `1px solid ${COLORS.border}`,
    }}>
      <div className="flex items-center">
        <span className="mr-2" style={{ color: COLORS.primary }}>{icon}</span>
        <h2 className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>{title}</h2>
      </div>
      {actionButton}
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

// Document socket component for individual document types
interface DocumentSocketProps {
  label: string;
  docType: string;
  category: 'loan' | 'legal' | 'financial' | 'misc' | 'borrower' | 'property' | 'project' | 'compliance' | 'servicing' | 'exit';
  loanId: string;
  document?: SimpleDocument;
  onViewDocument: (doc: SimpleDocument) => void;
  onUpload: (docType: string) => void;
}

const DocumentSocket: React.FC<DocumentSocketProps> = ({ 
  label, 
  docType, 
  category, 
  loanId, 
  document, 
  onViewDocument,
  onUpload
}) => {
  const [dragOver, setDragOver] = useState(false);
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file");
        return;
      }
      
      try {
        // Upload the document
        const uploadedDoc = await simpleDocumentService.addDocument(
          file, 
          loanId,
          { docType: docType, category: category }
        );
        
        if (uploadedDoc) {
          onUpload(docType);
        }
      } catch (error) {
        console.error("Error uploading document:", error);
      }
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span 
            className="px-2 py-1 text-xs rounded-full" 
            style={{ 
              backgroundColor: COLORS.status.approvedBg, 
              color: COLORS.status.approved 
            }}
          >
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span 
            className="px-2 py-1 text-xs rounded-full" 
            style={{ 
              backgroundColor: COLORS.status.rejectedBg, 
              color: COLORS.status.rejected 
            }}
          >
            Rejected
          </span>
        );
      default:
        return (
          <span 
            className="px-2 py-1 text-xs rounded-full" 
            style={{ 
              backgroundColor: COLORS.status.pendingBg, 
              color: COLORS.status.pending 
            }}
          >
            Pending
          </span>
        );
    }
  };
  
  return (
    <div className="mb-4">
      {/* Document Display - Long and skinny across the page */}
      <div 
        className="p-4 rounded-t-md shadow-sm w-full"
        style={{ 
          backgroundColor: '#1a2234',
          borderLeft: `3px solid ${COLORS.primary}`,
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-grow">
            <FileText size={18} style={{ color: COLORS.textMuted }} className="mr-3 flex-shrink-0" />
            <div className="flex-grow">
              <p className="font-medium" style={{ color: COLORS.textPrimary }}>{label}</p>
              {document && (
                <p className="text-xs" style={{ color: COLORS.textMuted }}>
                  {document.filename} • {new Date(document.dateUploaded).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {document && getStatusBadge(document.status)}
            {document && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewDocument(document)}
                style={{ color: COLORS.textAccent }}
              >
                <Eye size={16} className="mr-1" />
                View
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Upload Section - Same height underneath */}
      <div 
        className={`p-4 rounded-b-md shadow-sm w-full ${dragOver ? 'ring-2' : ''}`}
        style={{ 
          backgroundColor: '#141b2d',
          borderLeft: `3px solid ${COLORS.primary}`,
          borderColor: dragOver ? COLORS.primary : undefined,
          borderTop: 'none'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {!document ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Upload size={18} style={{ color: COLORS.textMuted }} className="mr-3" />
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                {dragOver ? 'Drop to upload' : 'Drag & drop a PDF file here'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label 
                className="text-xs cursor-pointer hover:underline"
                style={{ color: COLORS.textAccent }}
                htmlFor={`file-upload-${docType}`}
              >
                Upload File
                <input 
                  type="file" 
                  id={`file-upload-${docType}`}
                  className="hidden" 
                  accept=".pdf"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      if (file.type !== "application/pdf") {
                        alert("Please upload a PDF file");
                        return;
                      }
                      
                      try {
                        const uploadedDoc = await simpleDocumentService.addDocument(
                          file, 
                          loanId,
                          { docType: docType, category: category }
                        );
                        
                        if (uploadedDoc) {
                          onUpload(docType);
                        }
                      } catch (error) {
                        console.error("Error uploading document:", error);
                      } finally {
                        // Reset file input
                        e.target.value = '';
                      }
                    }
                  }}
                />
              </label>
              <span className="text-xs" style={{ color: COLORS.textMuted }}>or</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs hover:underline p-0 h-auto"
                style={{ color: COLORS.textAccent }}
                onClick={() => {
                  const loan = loanDatabase.getLoanById(loanId);
                  if (loan) {
                    const document = fakeDocumentService.generateFakeDocument(loan, docType);
                    if (document) {
                      onUpload(docType);
                    }
                  }
                }}
              >
                Generate Sample
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              Document uploaded. You can replace it by uploading a new file.
            </p>
            <div className="flex items-center gap-3">
              <label 
                className="text-xs cursor-pointer hover:underline"
                style={{ color: COLORS.textAccent }}
                htmlFor={`file-upload-${docType}`}
              >
                Replace File
                <input 
                  type="file" 
                  id={`file-upload-${docType}`}
                  className="hidden" 
                  accept=".pdf"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      if (file.type !== "application/pdf") {
                        alert("Please upload a PDF file");
                        return;
                      }
                      
                      try {
                        const uploadedDoc = await simpleDocumentService.addDocument(
                          file, 
                          loanId,
                          { docType: docType, category: category }
                        );
                        
                        if (uploadedDoc) {
                          onUpload(docType);
                        }
                      } catch (error) {
                        console.error("Error uploading document:", error);
                      } finally {
                        // Reset file input
                        e.target.value = '';
                      }
                    }
                  }}
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Updated document types based on the recommended loan system file structure
const DOCUMENT_TYPES = [
  // 1. BORROWER PROFILE
  // Borrower Information
  { docType: 'application_form', label: 'Application Form', category: 'borrower' as const, section: 'borrower_profile', subsection: 'borrower_information' },
  { docType: 'government_id', label: 'Government ID', category: 'borrower' as const, section: 'borrower_profile', subsection: 'borrower_information' },
  { docType: 'credit_authorization', label: 'Credit Authorization', category: 'borrower' as const, section: 'borrower_profile', subsection: 'borrower_information' },
  { docType: 'personal_financial_statement', label: 'Personal Financial Statement', category: 'borrower' as const, section: 'borrower_profile', subsection: 'borrower_information' },
  { docType: 'background_check', label: 'Background Check Results', category: 'borrower' as const, section: 'borrower_profile', subsection: 'borrower_information' },
  
  // Financial Documentation
  { docType: 'tax_returns', label: 'Tax Returns', category: 'financial' as const, section: 'borrower_profile', subsection: 'financial_documentation' },
  { docType: 'bank_statements', label: 'Bank Statements', category: 'financial' as const, section: 'borrower_profile', subsection: 'financial_documentation' },
  { docType: 'income_verification', label: 'Income Verification', category: 'financial' as const, section: 'borrower_profile', subsection: 'financial_documentation' },
  { docType: 'debt_schedule', label: 'Debt Schedule', category: 'financial' as const, section: 'borrower_profile', subsection: 'financial_documentation' },
  { docType: 'real_estate_portfolio', label: 'Real Estate Portfolio', category: 'financial' as const, section: 'borrower_profile', subsection: 'financial_documentation' },
  
  // Entity Documentation
  { docType: 'formation_documents', label: 'Formation Documents', category: 'legal' as const, section: 'borrower_profile', subsection: 'entity_documentation' },
  { docType: 'operating_agreement', label: 'Operating Agreement', category: 'legal' as const, section: 'borrower_profile', subsection: 'entity_documentation' },
  { docType: 'resolution_to_borrow', label: 'Resolution to Borrow', category: 'legal' as const, section: 'borrower_profile', subsection: 'entity_documentation' },
  { docType: 'certificate_good_standing', label: 'Certificate of Good Standing', category: 'legal' as const, section: 'borrower_profile', subsection: 'entity_documentation' },
  { docType: 'ein_documentation', label: 'EIN Documentation', category: 'legal' as const, section: 'borrower_profile', subsection: 'entity_documentation' },
  
  // 2. PROPERTY FILE
  // Property Information
  { docType: 'property_details', label: 'Property Details Summary', category: 'property' as const, section: 'property_file', subsection: 'property_information' },
  { docType: 'purchase_contract', label: 'Purchase Contract', category: 'property' as const, section: 'property_file', subsection: 'property_information' },
  { docType: 'property_photos', label: 'Property Photos', category: 'property' as const, section: 'property_file', subsection: 'property_information' },
  { docType: 'preliminary_title', label: 'Preliminary Title Report', category: 'property' as const, section: 'property_file', subsection: 'property_information' },
  { docType: 'survey_plot_plan', label: 'Survey/Plot Plan', category: 'property' as const, section: 'property_file', subsection: 'property_information' },
  
  // Valuation
  { docType: 'appraisal_report', label: 'Appraisal Report', category: 'property' as const, section: 'property_file', subsection: 'valuation' },
  { docType: 'comparative_market_analysis', label: 'Comparative Market Analysis', category: 'property' as const, section: 'property_file', subsection: 'valuation' },
  { docType: 'broker_price_opinion', label: 'Broker Price Opinion (BPO)', category: 'property' as const, section: 'property_file', subsection: 'valuation' },
  { docType: 'historical_property_values', label: 'Historical Property Values', category: 'property' as const, section: 'property_file', subsection: 'valuation' },
  
  // Property Condition
  { docType: 'inspection_report', label: 'Inspection Report', category: 'property' as const, section: 'property_file', subsection: 'property_condition' },
  { docType: 'environmental_assessment', label: 'Environmental Assessment', category: 'property' as const, section: 'property_file', subsection: 'property_condition' },
  { docType: 'engineering_report', label: 'Engineering Report', category: 'property' as const, section: 'property_file', subsection: 'property_condition' },
  { docType: 'pest_inspection', label: 'Pest Inspection', category: 'property' as const, section: 'property_file', subsection: 'property_condition' },
  { docType: 'natural_hazard_disclosures', label: 'Natural Hazard Disclosures', category: 'property' as const, section: 'property_file', subsection: 'property_condition' },
  
  // 3. PROJECT DOCUMENTATION
  // Fix-and-Flip/Construction
  { docType: 'renovation_budget', label: 'Renovation/Construction Budget', category: 'project' as const, section: 'project_documentation', subsection: 'fix_and_flip' },
  { docType: 'project_timeline', label: 'Timeline and Milestones', category: 'project' as const, section: 'project_documentation', subsection: 'fix_and_flip' },
  { docType: 'contractor_information', label: 'Contractor Information', category: 'project' as const, section: 'project_documentation', subsection: 'fix_and_flip' },
  { docType: 'permits_approvals', label: 'Permits and Approvals', category: 'project' as const, section: 'project_documentation', subsection: 'fix_and_flip' },
  { docType: 'architectural_plans', label: 'Architectural Plans', category: 'project' as const, section: 'project_documentation', subsection: 'fix_and_flip' },
  { docType: 'draw_schedule', label: 'Draw Schedule', category: 'project' as const, section: 'project_documentation', subsection: 'fix_and_flip' },
  
  // Rental/Commercial
  { docType: 'rent_roll', label: 'Rent Roll', category: 'project' as const, section: 'project_documentation', subsection: 'rental_commercial' },
  { docType: 'lease_agreements', label: 'Lease Agreements', category: 'project' as const, section: 'project_documentation', subsection: 'rental_commercial' },
  { docType: 'operating_expenses', label: 'Operating Expenses', category: 'project' as const, section: 'project_documentation', subsection: 'rental_commercial' },
  { docType: 'dscr_calculations', label: 'DSCR Calculations', category: 'project' as const, section: 'project_documentation', subsection: 'rental_commercial' },
  { docType: 'property_management_plan', label: 'Property Management Plan', category: 'project' as const, section: 'project_documentation', subsection: 'rental_commercial' },
  { docType: 'market_rental_analysis', label: 'Market Rental Analysis', category: 'project' as const, section: 'project_documentation', subsection: 'rental_commercial' },
  
  // 4. LOAN DOCUMENTS
  // Pre-Approval
  { docType: 'pre_qualification_letter', label: 'Pre-qualification Letter', category: 'loan' as const, section: 'loan_documents', subsection: 'pre_approval' },
  { docType: 'term_sheet', label: 'Term Sheet', category: 'loan' as const, section: 'loan_documents', subsection: 'pre_approval' },
  { docType: 'rate_lock_agreement', label: 'Rate Lock Agreement', category: 'loan' as const, section: 'loan_documents', subsection: 'pre_approval' },
  { docType: 'fee_disclosure', label: 'Fee Disclosure', category: 'loan' as const, section: 'loan_documents', subsection: 'pre_approval' },
  
  // Loan Agreement
  { docType: 'promissory_note', label: 'Promissory Note', category: 'loan' as const, section: 'loan_documents', subsection: 'loan_agreement' },
  { docType: 'deed_of_trust', label: 'Mortgage/Deed of Trust', category: 'loan' as const, section: 'loan_documents', subsection: 'loan_agreement' },
  { docType: 'security_agreement', label: 'Security Agreement', category: 'loan' as const, section: 'loan_documents', subsection: 'loan_agreement' },
  { docType: 'personal_guarantee', label: 'Personal Guarantee', category: 'loan' as const, section: 'loan_documents', subsection: 'loan_agreement' },
  { docType: 'assignment_rents', label: 'Assignment of Rents/Leases', category: 'loan' as const, section: 'loan_documents', subsection: 'loan_agreement' },
  
  // Closing Documents
  { docType: 'closing_disclosure', label: 'Closing Disclosure', category: 'loan' as const, section: 'loan_documents', subsection: 'closing_documents' },
  { docType: 'title_insurance_policy', label: 'Title Insurance Policy', category: 'loan' as const, section: 'loan_documents', subsection: 'closing_documents' },
  { docType: 'insurance_certificates', label: 'Insurance Certificates', category: 'loan' as const, section: 'loan_documents', subsection: 'closing_documents' },
  { docType: 'funding_authorization', label: 'Funding Authorization', category: 'loan' as const, section: 'loan_documents', subsection: 'closing_documents' },
  { docType: 'disbursement_instructions', label: 'Disbursement Instructions', category: 'loan' as const, section: 'loan_documents', subsection: 'closing_documents' },
  
  // 5. COMPLIANCE & STATE-SPECIFIC
  // Regulatory Compliance
  { docType: 'state_disclosures', label: 'State-specific Disclosures', category: 'compliance' as const, section: 'compliance', subsection: 'regulatory_compliance' },
  { docType: 'federal_disclosures', label: 'Federal Disclosures', category: 'compliance' as const, section: 'compliance', subsection: 'regulatory_compliance' },
  { docType: 'aml_documentation', label: 'Anti-money Laundering Documentation', category: 'compliance' as const, section: 'compliance', subsection: 'regulatory_compliance' },
  { docType: 'ofac_check', label: 'OFAC Check Results', category: 'compliance' as const, section: 'compliance', subsection: 'regulatory_compliance' },
  { docType: 'patriot_act_compliance', label: 'Patriot Act Compliance', category: 'compliance' as const, section: 'compliance', subsection: 'regulatory_compliance' },
  
  // State-Specific Requirements
  { docType: 'ca_documentation', label: 'CA Documentation Socket', category: 'compliance' as const, section: 'compliance', subsection: 'state_specific' },
  { docType: 'fl_documentation', label: 'FL Documentation Socket', category: 'compliance' as const, section: 'compliance', subsection: 'state_specific' },
  { docType: 'ny_documentation', label: 'NY Documentation Socket', category: 'compliance' as const, section: 'compliance', subsection: 'state_specific' },
  { docType: 'tx_documentation', label: 'TX Documentation Socket', category: 'compliance' as const, section: 'compliance', subsection: 'state_specific' },
  { docType: 'az_documentation', label: 'AZ Documentation Socket', category: 'compliance' as const, section: 'compliance', subsection: 'state_specific' },
  
  // 6. LOAN SERVICING
  // Payment Records
  { docType: 'payment_history', label: 'Payment History', category: 'servicing' as const, section: 'loan_servicing', subsection: 'payment_records' },
  { docType: 'late_notices', label: 'Late Notices', category: 'servicing' as const, section: 'loan_servicing', subsection: 'payment_records' },
  { docType: 'modification_requests', label: 'Modification Requests', category: 'servicing' as const, section: 'loan_servicing', subsection: 'payment_records' },
  { docType: 'payoff_statements', label: 'Payoff Statements', category: 'servicing' as const, section: 'loan_servicing', subsection: 'payment_records' },
  
  // Loan Monitoring
  { docType: 'monitoring_inspection_reports', label: 'Inspection Reports', category: 'servicing' as const, section: 'loan_servicing', subsection: 'loan_monitoring' },
  { docType: 'draw_request_documentation', label: 'Draw Request Documentation', category: 'servicing' as const, section: 'loan_servicing', subsection: 'loan_monitoring' },
  { docType: 'project_update_reports', label: 'Project Update Reports', category: 'servicing' as const, section: 'loan_servicing', subsection: 'loan_monitoring' },
  { docType: 'insurance_renewal_tracking', label: 'Insurance Renewal Tracking', category: 'servicing' as const, section: 'loan_servicing', subsection: 'loan_monitoring' },
  { docType: 'tax_payment_verification', label: 'Tax Payment Verification', category: 'servicing' as const, section: 'loan_servicing', subsection: 'loan_monitoring' },
  
  // Default Management
  { docType: 'default_notices', label: 'Default Notices', category: 'servicing' as const, section: 'loan_servicing', subsection: 'default_management' },
  { docType: 'workout_documentation', label: 'Workout Documentation', category: 'servicing' as const, section: 'loan_servicing', subsection: 'default_management' },
  { docType: 'forbearance_agreements', label: 'Forbearance Agreements', category: 'servicing' as const, section: 'loan_servicing', subsection: 'default_management' },
  { docType: 'foreclosure_documentation', label: 'Foreclosure Documentation', category: 'servicing' as const, section: 'loan_servicing', subsection: 'default_management' },
  
  // 7. EXIT STRATEGY
  // Exit Documentation
  { docType: 'exit_strategy_statement', label: 'Exit Strategy Statement', category: 'exit' as const, section: 'exit_strategy', subsection: 'exit_documentation' },
  { docType: 'sale_documentation', label: 'Sale Documentation', category: 'exit' as const, section: 'exit_strategy', subsection: 'exit_documentation' },
  { docType: 'refinance_documentation', label: 'Refinance Documentation', category: 'exit' as const, section: 'exit_strategy', subsection: 'exit_documentation' },
  { docType: 'leaseup_documentation', label: 'Lease-up Documentation', category: 'exit' as const, section: 'exit_strategy', subsection: 'exit_documentation' },
  { docType: 'marketing_materials', label: 'Marketing Materials', category: 'exit' as const, section: 'exit_strategy', subsection: 'exit_documentation' },
];

// Define section icons and titles
type SectionKey = 'borrower_profile' | 'property_file' | 'project_documentation' | 'loan_documents' | 'compliance' | 'loan_servicing' | 'exit_strategy';

const SECTION_CONFIG: Record<SectionKey, {
  icon: React.ReactNode;
  title: string;
  subsections: Record<string, string>;
}> = {
  borrower_profile: {
    icon: <FileCheck size={20} />,
    title: 'Borrower Profile',
    subsections: {
      borrower_information: 'Borrower Information',
      financial_documentation: 'Financial Documentation',
      entity_documentation: 'Entity Documentation'
    }
  },
  property_file: {
    icon: <MapPin size={20} />,
    title: 'Property File',
    subsections: {
      property_information: 'Property Information',
      valuation: 'Valuation',
      property_condition: 'Property Condition'
    }
  },
  project_documentation: {
    icon: <FileText size={20} />,
    title: 'Project Documentation',
    subsections: {
      fix_and_flip: 'Fix-and-Flip/Construction',
      rental_commercial: 'Rental/Commercial'
    }
  },
  loan_documents: {
    icon: <FileText size={20} />,
    title: 'Loan Documents',
    subsections: {
      pre_approval: 'Pre-Approval',
      loan_agreement: 'Loan Agreement',
      closing_documents: 'Closing Documents'
    }
  },
  compliance: {
    icon: <Check size={20} />,
    title: 'Compliance & State-Specific',
    subsections: {
      regulatory_compliance: 'Regulatory Compliance',
      state_specific: 'State-Specific Requirements'
    }
  },
  loan_servicing: {
    icon: <Clock size={20} />,
    title: 'Loan Servicing',
    subsections: {
      payment_records: 'Payment Records',
      loan_monitoring: 'Loan Monitoring',
      default_management: 'Default Management'
    }
  },
  exit_strategy: {
    icon: <FileText size={20} />,
    title: 'Exit Strategy',
    subsections: {
      exit_documentation: 'Exit Documentation'
    }
  }
};

// Define unexecuted closing documents
const UNEXECUTED_CLOSING_DOCUMENTS = [
  { docType: 'promissory_note_draft', label: 'Promissory Note (Draft)', category: 'loan' as const },
  { docType: 'deed_of_trust_draft', label: 'Deed of Trust (Draft)', category: 'loan' as const },
  { docType: 'closing_disclosure_draft', label: 'Closing Disclosure (Draft)', category: 'loan' as const },
  { docType: 'loan_agreement_draft', label: 'Loan Agreement (Draft)', category: 'loan' as const },
  { docType: 'unexecuted_package', label: 'Unexecuted Documents Package', category: 'loan' as const },
];

// Map unexecuted document types to their corresponding generator types
const UNEXECUTED_TO_GENERATOR_MAP: Record<string, string> = {
  'promissory_note_draft': 'promissory_note',
  'deed_of_trust_draft': 'deed_of_trust',
  'closing_disclosure_draft': 'closing_disclosure',
  'loan_agreement_draft': 'promissory_note', // Use promissory note generator as fallback
};

export default function LoanDocumentsPage() {
  const params = useParams();
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<SimpleDocument | null>(null);
  const [documents, setDocuments] = useState<SimpleDocument[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  
  useEffect(() => {
    if (params?.id) {
      const loanId = String(params.id);
      const fetchedLoan = loanDatabase.getLoanById(loanId);
      
      if (fetchedLoan) {
        setLoan(fetchedLoan);
        // Fetch documents for this loan
        const loanDocuments = simpleDocumentService.getDocumentsForLoan(loanId);
        setDocuments(loanDocuments);
        
        // Set active section based on loan type
        if (fetchedLoan.loanType === 'fix_and_flip' || fetchedLoan.loanType === 'construction') {
          setActiveSection('project_documentation');
        } else if (fetchedLoan.loanType === 'rental_brrrr') {
          setActiveSection('property_file');
        } else {
          setActiveSection('loan_documents');
        }
      }
      setLoading(false);
    }
  }, [params?.id, refreshTrigger]);
  
  const handleDocumentStatusChange = () => {
    setSelectedDocument(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUpload = (docType: string) => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Get document for a specific docType if it exists
  const getDocumentForType = (docType: string): SimpleDocument | undefined => {
    return documents.find(doc => doc.docType === docType);
  };
  
  const handleGenerateUnexecutedDocuments = () => {
    if (loan) {
      // Get all existing documents first
      const allDocs = simpleDocumentService.getAllDocuments();
      const updatedDocs = [...allDocs];
      let docsChanged = false;
      
      // Store generated document contents for package creation
      const generatedContents: Record<string, string> = {};
      
      // Generate only unexecuted closing documents (excluding the package itself)
      const individualDocuments = UNEXECUTED_CLOSING_DOCUMENTS.filter((doc) => doc.docType !== 'unexecuted_package');
      
      individualDocuments.forEach((docInfo) => {
        // Get the corresponding generator document type
        const generatorDocType = UNEXECUTED_TO_GENERATOR_MAP[docInfo.docType];
        
        if (generatorDocType) {
          try {
            // Check if this unexecuted document already exists
            const existingDocIndex = updatedDocs.findIndex(doc => 
              doc.loanId === loan.id && 
              doc.docType === docInfo.docType
            );
            
            // Generate the document content using the appropriate generator
            const content = fakeDocumentService.generateDocumentContent(loan, generatorDocType);
            
            if (content) {
              // Store content for package creation
              generatedContents[docInfo.docType] = content;
              
              // Create a new unexecuted document
              const unexecutedDoc: SimpleDocument = {
                id: existingDocIndex >= 0 ? updatedDocs[existingDocIndex].id : `fake-${docInfo.docType}-${loan.id}`,
                loanId: loan.id,
                docType: docInfo.docType,
                filename: `${docInfo.docType.replace(/_/g, '-')}.html`,
                category: docInfo.category,
                content: content,
                dateUploaded: new Date().toISOString(),
                status: 'pending',
                fileType: 'text/html'
              };
              
              // Update or add the document in our local array
              if (existingDocIndex >= 0) {
                updatedDocs[existingDocIndex] = unexecutedDoc;
              } else {
                updatedDocs.push(unexecutedDoc);
              }
              
              docsChanged = true;
            }
          } catch (error) {
            console.error(`Error generating document for ${docInfo.docType}:`, error);
          }
        } else {
          console.error(`No generator mapping found for document type: ${docInfo.docType}`);
        }
      });
      
      // Now create the unexecuted package document that combines all individual documents
      if (Object.keys(generatedContents).length > 0) {
        try {
          // Check if package document already exists
          const existingPackageIndex = updatedDocs.findIndex(doc => 
            doc.loanId === loan.id && 
            doc.docType === 'unexecuted_package'
          );
          
          // Create the combined content with a table of contents
          const packageContent = createUnexecutedPackage(loan, generatedContents);
          
          // Create the package document
          const packageDoc: SimpleDocument = {
            id: existingPackageIndex >= 0 ? updatedDocs[existingPackageIndex].id : `fake-unexecuted_package-${loan.id}`,
            loanId: loan.id,
            docType: 'unexecuted_package',
            filename: 'unexecuted-documents-package.html',
            category: 'loan',
            content: packageContent,
            dateUploaded: new Date().toISOString(),
            status: 'pending',
            fileType: 'text/html'
          };
          
          // Update or add the package document
          if (existingPackageIndex >= 0) {
            updatedDocs[existingPackageIndex] = packageDoc;
          } else {
            updatedDocs.push(packageDoc);
          }
          
          docsChanged = true;
        } catch (error) {
          console.error('Error creating unexecuted documents package:', error);
        }
      }
      
      // Only update storage if documents were changed
      if (docsChanged) {
        // Save all documents back to storage
        localStorage.setItem('simple_documents', JSON.stringify(updatedDocs));
        
        // Refresh the document list
        setRefreshTrigger(prev => prev + 1);
      }
    }
  };
  
  // Function to create a combined package of all unexecuted documents
  const createUnexecutedPackage = (loan: any, contents: Record<string, string>): string => {
    // Get document order from UNEXECUTED_CLOSING_DOCUMENTS (excluding the package itself)
    const documentOrder = UNEXECUTED_CLOSING_DOCUMENTS
      .filter((doc) => doc.docType !== 'unexecuted_package')
      .map((doc) => ({
        docType: doc.docType,
        label: doc.label
      }));
    
    // Create table of contents
    const tableOfContents = `
      <div class="toc-section">
        <h2>Table of Contents</h2>
        <ol>
          ${documentOrder.map((doc, index) => `
            <li>
              <a href="#document-${index + 1}">${doc.label}</a>
            </li>
          `).join('')}
        </ol>
      </div>
    `;
    
    // Create document sections in the specified order
    const documentSections = documentOrder.map((doc, index) => {
      const content = contents[doc.docType] || `<p>Document content not available for ${doc.label}</p>`;
      return `
        <div class="document-section" id="document-${index + 1}">
          <div class="document-header">
            <h2>${index + 1}. ${doc.label}</h2>
          </div>
          <div class="document-content">
            ${content}
          </div>
          <div class="page-break"></div>
        </div>
      `;
    }).join('');
    
    // Create the full package HTML
    return `
      <div class="document legal-document unexecuted-package">
        <style>
          .document {
            font-family: 'Times New Roman', Times, serif;
            line-height: 1.5;
            color: #333;
            max-width: 100%;
            margin: 0 auto;
            padding: 1rem;
            position: relative;
            background-color: white;
          }
          
          .package-header {
            margin-bottom: 2rem;
            border-bottom: 2px solid #333;
            padding-bottom: 1rem;
            text-align: center;
          }
          
          h1 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            font-weight: bold;
          }
          
          .toc-section {
            margin: 2rem 0;
            padding: 1rem;
            border: 1px solid #eee;
            background-color: #f9f9f9;
          }
          
          .toc-section h2 {
            font-size: 1.2rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid #ccc;
            padding-bottom: 0.5rem;
          }
          
          .toc-section ol {
            margin-left: 1.5rem;
          }
          
          .toc-section li {
            margin-bottom: 0.5rem;
          }
          
          .document-section {
            margin-top: 3rem;
            border-top: 1px solid #ccc;
            padding-top: 1rem;
          }
          
          .document-header {
            margin-bottom: 1.5rem;
          }
          
          .document-header h2 {
            font-size: 1.3rem;
            font-weight: bold;
          }
          
          .page-break {
            page-break-after: always;
            height: 0;
            margin: 3rem 0;
          }
          
          .watermark {
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 3rem;
            color: rgba(255, 0, 0, 0.1);
            transform: rotate(-45deg);
            pointer-events: none;
            z-index: 1;
          }
        </style>
        
        <div class="watermark">UNEXECUTED DRAFT</div>
        
        <div class="package-header">
          <h1>Unexecuted Loan Documents Package</h1>
          <div class="document-id">Loan #: ${loan.id.substring(0, 8)}</div>
          <div class="document-date">Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div class="borrower-info">Borrower: ${loan.borrowerName}</div>
          <div class="property-info">Property: ${loan.propertyAddress}</div>
        </div>
        
        ${tableOfContents}
        
        ${documentSections}
        
        <div class="package-footer">
          <p>This package contains unexecuted draft documents for review purposes only.</p>
          <p>These documents are not legally binding until properly executed by all parties.</p>
        </div>
      </div>
    `;
  };

  // Group documents by section and subsection
  const renderDocumentSections = () => {
    if (!loan) return null;
    
    // Get all sections
    const sections = Object.keys(SECTION_CONFIG) as SectionKey[];
    
    return (
      <div className="space-y-8">
        {/* Section tabs */}
        <div className="flex overflow-x-auto pb-2 mb-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
          {sections.map((section) => (
            <button
              key={section}
              className={`px-4 py-2 mr-2 rounded-t-md whitespace-nowrap ${activeSection === section ? 'font-semibold' : ''}`}
              style={{ 
                backgroundColor: activeSection === section ? COLORS.primary : 'transparent',
                color: activeSection === section ? 'white' : COLORS.textPrimary,
                borderBottom: activeSection === section ? `2px solid ${COLORS.primary}` : 'none'
              }}
              onClick={() => setActiveSection(section)}
            >
              <div className="flex items-center">
                <span className="mr-2">{SECTION_CONFIG[section].icon}</span>
                {SECTION_CONFIG[section].title}
              </div>
            </button>
          ))}
        </div>
        
        {/* Active section content */}
        {activeSection && (
          <div className="space-y-8">
            {Object.entries(SECTION_CONFIG[activeSection].subsections).map(([subsectionKey, subsectionTitle]) => {
              // Filter documents for this subsection
              const subsectionDocs = DOCUMENT_TYPES.filter(
                doc => doc.section === activeSection && doc.subsection === subsectionKey
              );
              
              if (subsectionDocs.length === 0) return null;
              
              return (
                <Section 
                  key={subsectionKey} 
                  title={subsectionTitle as string} 
                  icon={SECTION_CONFIG[activeSection].icon}
                >
                  {subsectionDocs.map(docType => {
                    const existingDoc = getDocumentForType(docType.docType);
                    return (
                      <DocumentSocket
                        key={docType.docType}
                        label={docType.label}
                        docType={docType.docType}
                        category={docType.category}
                        loanId={loan.id}
                        document={existingDoc}
                        onViewDocument={setSelectedDocument}
                        onUpload={handleUpload}
                      />
                    );
                  })}
                </Section>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-16 px-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto mb-4" style={{
            borderColor: COLORS.primary,
            borderTopColor: "transparent"
          }}></div>
          <p style={{ color: COLORS.textSecondary }}>Loading loan details...</p>
        </div>
      </LayoutWrapper>
    );
  }
  
  if (!loan) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-16 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.textPrimary }}>Loan Not Found</h2>
          <p className="mb-6" style={{ color: COLORS.textSecondary }}>The loan you're looking for doesn't exist or has been removed.</p>
        </div>
      </LayoutWrapper>
    );
  }
  
  return (
    <LayoutWrapper>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar - positioned consistently on the left */}
        <div className="w-full md:w-64 flex-shrink-0">
          <LoanSidebar loan={loan} activePage="documents" />
        </div>
        
        {/* Main content */}
        <div className="flex-grow">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>
              Loan Documents
            </h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleGenerateUnexecutedDocuments}
                style={{ 
                  borderColor: COLORS.border,
                  color: COLORS.textPrimary
                }}
              >
                Generate Unexecuted Package
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : (
            <>
              {renderDocumentSections()}
              
              {/* Document viewer modal */}
              {selectedDocument && (
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                  onClick={() => setSelectedDocument(null)}
                >
                  <div 
                    className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-semibold">{selectedDocument.filename}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedDocument(null)}>
                        <X size={18} />
                      </Button>
                    </div>
                    <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
                      <SimpleDocumentViewer 
                        document={selectedDocument} 
                        onStatusChange={handleDocumentStatusChange} 
                        onClose={() => setSelectedDocument(null)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </LayoutWrapper>
  );
} 