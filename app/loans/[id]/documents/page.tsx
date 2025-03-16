"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileCheck, MapPin, FileText, Upload, Eye, Clock, Check, X, Loader2 } from 'lucide-react';
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
  category: 'loan' | 'legal' | 'financial' | 'misc' | 'chat' | 'borrower' | 'property' | 'project' | 'compliance' | 'servicing' | 'exit' | 'insurance';
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
    <div className="mb-4 max-w-full">
      {/* Document Display - Long and skinny across the page */}
      <div 
        className="p-3 rounded-t-md shadow-sm w-full"
        style={{ 
          backgroundColor: '#1a2234',
          borderLeft: `3px solid ${COLORS.primary}`,
        }}
      >
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center min-w-0 flex-1">
            <FileText size={16} style={{ color: COLORS.textMuted }} className="mr-2 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate" style={{ color: COLORS.textPrimary }}>{label}</p>
              {document && (
                <p className="text-xs truncate" style={{ color: COLORS.textMuted }}>
                  {document.filename} • {new Date(document.dateUploaded).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {document && getStatusBadge(document.status)}
            {document && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onViewDocument(document)}
                style={{ color: COLORS.textAccent }}
                className="px-2 h-8"
              >
                <Eye size={14} className="mr-1" />
                View
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Upload Section - Same height underneath */}
      <div 
        className={`p-3 rounded-b-md shadow-sm w-full ${dragOver ? 'ring-2' : ''}`}
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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center">
              <Upload size={16} style={{ color: COLORS.textMuted }} className="mr-2" />
              <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                {dragOver ? 'Drop to upload' : 'Drag & drop a PDF file here'}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm" style={{ color: COLORS.textSecondary }}>
              Document uploaded. You can replace it by uploading a new file.
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
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

// Updated document types based on the new 4-section structure
const DOCUMENT_TYPES = [
  // 1. BORROWER DOCS
  // Personal Information
  { docType: 'loan_application', label: 'Completed Loan Application', category: 'borrower' as const, section: 'borrower_docs', subsection: 'personal_information' },
  { docType: 'government_id', label: 'Government-Issued Photo ID', category: 'borrower' as const, section: 'borrower_docs', subsection: 'personal_information' },
  { docType: 'credit_authorization', label: 'Credit Authorization', category: 'borrower' as const, section: 'borrower_docs', subsection: 'personal_information' },
  { docType: 'background_check', label: 'Background Check', category: 'borrower' as const, section: 'borrower_docs', subsection: 'personal_information' },
  { docType: 'contact_information', label: 'Contact Information', category: 'borrower' as const, section: 'borrower_docs', subsection: 'personal_information' },
  
  // Financial Documentation
  { docType: 'personal_financial_statement', label: 'Personal Financial Statement', category: 'financial' as const, section: 'borrower_docs', subsection: 'financial_documentation' },
  { docType: 'personal_tax_returns', label: 'Personal Tax Returns (2 Years)', category: 'financial' as const, section: 'borrower_docs', subsection: 'financial_documentation' },
  { docType: 'business_tax_returns', label: 'Business Tax Returns (2 Years)', category: 'financial' as const, section: 'borrower_docs', subsection: 'financial_documentation' },
  { docType: 'bank_statements', label: 'Bank Statements (3 Months)', category: 'financial' as const, section: 'borrower_docs', subsection: 'financial_documentation' },
  { docType: 'income_verification', label: 'Income Verification Documents', category: 'financial' as const, section: 'borrower_docs', subsection: 'financial_documentation' },
  { docType: 'real_estate_schedule', label: 'Schedule of Real Estate Owned', category: 'financial' as const, section: 'borrower_docs', subsection: 'financial_documentation' },
  { docType: 'debt_schedule', label: 'Debt Schedule', category: 'financial' as const, section: 'borrower_docs', subsection: 'financial_documentation' },
  { docType: 'credit_explanation', label: 'Credit Explanation Letters', category: 'financial' as const, section: 'borrower_docs', subsection: 'financial_documentation' },
  
  // Entity Documentation
  { docType: 'formation_documents', label: 'Business Formation Documents', category: 'legal' as const, section: 'borrower_docs', subsection: 'entity_documentation' },
  { docType: 'operating_agreement', label: 'Operating Agreement/Bylaws', category: 'legal' as const, section: 'borrower_docs', subsection: 'entity_documentation' },
  { docType: 'certificate_good_standing', label: 'Certificate of Good Standing', category: 'legal' as const, section: 'borrower_docs', subsection: 'entity_documentation' },
  { docType: 'ein_documentation', label: 'EIN Documentation', category: 'legal' as const, section: 'borrower_docs', subsection: 'entity_documentation' },
  { docType: 'resolution_to_borrow', label: 'Resolution to Borrow', category: 'legal' as const, section: 'borrower_docs', subsection: 'entity_documentation' },
  { docType: 'corporate_structure', label: 'Corporate Structure Chart', category: 'legal' as const, section: 'borrower_docs', subsection: 'entity_documentation' },
  
  // Experience & Background
  { docType: 'investment_history', label: 'Real Estate Investment History', category: 'borrower' as const, section: 'borrower_docs', subsection: 'experience_background' },
  { docType: 'project_portfolio', label: 'Past Project Portfolio', category: 'borrower' as const, section: 'borrower_docs', subsection: 'experience_background' },
  { docType: 'professional_credentials', label: 'Professional Credentials', category: 'borrower' as const, section: 'borrower_docs', subsection: 'experience_background' },
  { docType: 'references', label: 'References', category: 'borrower' as const, section: 'borrower_docs', subsection: 'experience_background' },
  { docType: 'risk_assessment', label: 'Risk Tier Assessment', category: 'borrower' as const, section: 'borrower_docs', subsection: 'experience_background' },
  
  // Exit Strategy
  { docType: 'exit_strategy_statement', label: 'Exit Strategy Statement', category: 'exit' as const, section: 'borrower_docs', subsection: 'exit_strategy' },
  { docType: 'project_timeline', label: 'Timeline for Project Completion', category: 'exit' as const, section: 'borrower_docs', subsection: 'exit_strategy' },
  { docType: 'refinance_qualification', label: 'Refinance Qualification', category: 'exit' as const, section: 'borrower_docs', subsection: 'exit_strategy' },
  { docType: 'sales_comparables', label: 'Sales Comparables', category: 'exit' as const, section: 'borrower_docs', subsection: 'exit_strategy' },
  { docType: 'marketing_plan', label: 'Marketing Plan', category: 'exit' as const, section: 'borrower_docs', subsection: 'exit_strategy' },
  
  // 2. PROPERTY DOCS
  // Property Information
  { docType: 'property_summary', label: 'Property Summary Sheet', category: 'property' as const, section: 'property_docs', subsection: 'property_information' },
  { docType: 'purchase_contract', label: 'Purchase Contract', category: 'property' as const, section: 'property_docs', subsection: 'property_information' },
  { docType: 'property_photos', label: 'Property Photos', category: 'property' as const, section: 'property_docs', subsection: 'property_information' },
  { docType: 'preliminary_title', label: 'Preliminary Title Report', category: 'property' as const, section: 'property_docs', subsection: 'property_information' },
  { docType: 'survey_plot_plan', label: 'Survey/Plot Plan', category: 'property' as const, section: 'property_docs', subsection: 'property_information' },
  { docType: 'legal_description', label: 'Legal Description', category: 'property' as const, section: 'property_docs', subsection: 'property_information' },
  { docType: 'zoning_verification', label: 'Zoning Verification', category: 'property' as const, section: 'property_docs', subsection: 'property_information' },
  
  // Valuation
  { docType: 'appraisal_report', label: 'Appraisal Report', category: 'property' as const, section: 'property_docs', subsection: 'valuation' },
  { docType: 'comparative_market_analysis', label: 'Comparative Market Analysis', category: 'property' as const, section: 'property_docs', subsection: 'valuation' },
  { docType: 'arv_assessment', label: 'After-Repair Value Assessment', category: 'property' as const, section: 'property_docs', subsection: 'valuation' },
  { docType: 'broker_price_opinion', label: 'Broker Price Opinion', category: 'property' as const, section: 'property_docs', subsection: 'valuation' },
  { docType: 'value_justification', label: 'Value Justification Analysis', category: 'property' as const, section: 'property_docs', subsection: 'valuation' },
  
  // Property Condition
  { docType: 'inspection_report', label: 'Inspection Report', category: 'property' as const, section: 'property_docs', subsection: 'property_condition' },
  { docType: 'environmental_assessment', label: 'Environmental Assessment', category: 'property' as const, section: 'property_docs', subsection: 'property_condition' },
  { docType: 'engineering_report', label: 'Engineering Report', category: 'property' as const, section: 'property_docs', subsection: 'property_condition' },
  { docType: 'pest_inspection', label: 'Pest Inspection', category: 'property' as const, section: 'property_docs', subsection: 'property_condition' },
  { docType: 'natural_hazard_disclosures', label: 'Natural Hazard Disclosures', category: 'property' as const, section: 'property_docs', subsection: 'property_condition' },
  { docType: 'lead_asbestos_testing', label: 'Lead/Asbestos Testing', category: 'property' as const, section: 'property_docs', subsection: 'property_condition' },
  { docType: 'soil_reports', label: 'Soil Reports', category: 'property' as const, section: 'property_docs', subsection: 'property_condition' },
  
  // Project Documentation
  { docType: 'renovation_budget', label: 'Renovation/Construction Budget', category: 'project' as const, section: 'property_docs', subsection: 'project_documentation' },
  { docType: 'scope_of_work', label: 'Scope of Work', category: 'project' as const, section: 'property_docs', subsection: 'project_documentation' },
  { docType: 'architectural_plans', label: 'Architectural Plans', category: 'project' as const, section: 'property_docs', subsection: 'project_documentation' },
  { docType: 'contractor_bids', label: 'Contractor Bids and Credentials', category: 'project' as const, section: 'property_docs', subsection: 'project_documentation' },
  { docType: 'construction_timeline', label: 'Construction Timeline', category: 'project' as const, section: 'property_docs', subsection: 'project_documentation' },
  { docType: 'permits_approvals', label: 'Permits and Approvals', category: 'project' as const, section: 'property_docs', subsection: 'project_documentation' },
  { docType: 'draw_schedule', label: 'Draw Schedule', category: 'project' as const, section: 'property_docs', subsection: 'project_documentation' },
  
  // Income Property Documents
  { docType: 'rent_roll', label: 'Rent Roll', category: 'property' as const, section: 'property_docs', subsection: 'income_property' },
  { docType: 'lease_agreements', label: 'Lease Agreements', category: 'property' as const, section: 'property_docs', subsection: 'income_property' },
  { docType: 'operating_expenses', label: 'Operating Expense History', category: 'property' as const, section: 'property_docs', subsection: 'income_property' },
  { docType: 'dscr_calculation', label: 'DSCR Calculation Worksheet', category: 'property' as const, section: 'property_docs', subsection: 'income_property' },
  { docType: 'property_management', label: 'Property Management Agreement', category: 'property' as const, section: 'property_docs', subsection: 'income_property' },
  { docType: 'market_rental_analysis', label: 'Market Rental Analysis', category: 'property' as const, section: 'property_docs', subsection: 'income_property' },
  { docType: 'tenant_estoppel', label: 'Tenant Estoppel Certificates', category: 'property' as const, section: 'property_docs', subsection: 'income_property' },
  
  // State-Specific Property Requirements
  { docType: 'state_property_disclosures', label: 'State-specific Property Disclosures', category: 'property' as const, section: 'property_docs', subsection: 'state_specific' },
  { docType: 'regional_certifications', label: 'Regional Certifications', category: 'property' as const, section: 'property_docs', subsection: 'state_specific' },
  { docType: 'local_compliance', label: 'Local Compliance Documentation', category: 'property' as const, section: 'property_docs', subsection: 'state_specific' },
  
  // 3. CLOSING DOCS
  // Pre-Closing
  { docType: 'pre_approval_letter', label: 'Pre-approval Letter', category: 'loan' as const, section: 'closing_docs', subsection: 'pre_closing' },
  { docType: 'term_sheet', label: 'Term Sheet', category: 'loan' as const, section: 'closing_docs', subsection: 'pre_closing' },
  { docType: 'fee_disclosure', label: 'Fee Disclosure', category: 'loan' as const, section: 'closing_docs', subsection: 'pre_closing' },
  { docType: 'rate_lock_agreement', label: 'Rate Lock Agreement', category: 'loan' as const, section: 'closing_docs', subsection: 'pre_closing' },
  { docType: 'underwriting_approval', label: 'Underwriting Approval', category: 'loan' as const, section: 'closing_docs', subsection: 'pre_closing' },
  { docType: 'closing_checklist', label: 'Closing Checklist', category: 'loan' as const, section: 'closing_docs', subsection: 'pre_closing' },
  
  // Loan Agreements
  { docType: 'promissory_note', label: 'Promissory Note', category: 'loan' as const, section: 'closing_docs', subsection: 'loan_agreements' },
  { docType: 'deed_of_trust', label: 'Mortgage/Deed of Trust', category: 'loan' as const, section: 'closing_docs', subsection: 'loan_agreements' },
  { docType: 'security_agreement', label: 'Security Agreement', category: 'loan' as const, section: 'closing_docs', subsection: 'loan_agreements' },
  { docType: 'personal_guarantee', label: 'Personal Guarantee', category: 'loan' as const, section: 'closing_docs', subsection: 'loan_agreements' },
  { docType: 'assignment_rents', label: 'Assignment of Rents and Leases', category: 'loan' as const, section: 'closing_docs', subsection: 'loan_agreements' },
  { docType: 'loan_servicing_agreement', label: 'Loan Servicing Agreement', category: 'loan' as const, section: 'closing_docs', subsection: 'loan_agreements' },
  
  // Compliance Documents
  { docType: 'state_lending_disclosures', label: 'State-specific Lending Disclosures', category: 'compliance' as const, section: 'closing_docs', subsection: 'compliance_documents' },
  { docType: 'federal_lending_disclosures', label: 'Federal Lending Disclosures', category: 'compliance' as const, section: 'closing_docs', subsection: 'compliance_documents' },
  { docType: 'aml_documentation', label: 'Anti-money Laundering Documentation', category: 'compliance' as const, section: 'closing_docs', subsection: 'compliance_documents' },
  { docType: 'ofac_check', label: 'OFAC Check Results', category: 'compliance' as const, section: 'closing_docs', subsection: 'compliance_documents' },
  { docType: 'patriot_act_compliance', label: 'Patriot Act Compliance Verification', category: 'compliance' as const, section: 'closing_docs', subsection: 'compliance_documents' },
  
  // Insurance
  { docType: 'property_insurance', label: 'Property Insurance Policy', category: 'insurance' as const, section: 'closing_docs', subsection: 'insurance' },
  { docType: 'flood_insurance', label: 'Flood Insurance', category: 'insurance' as const, section: 'closing_docs', subsection: 'insurance' },
  { docType: 'builders_risk', label: 'Builder\'s Risk Policy', category: 'insurance' as const, section: 'closing_docs', subsection: 'insurance' },
  { docType: 'liability_insurance', label: 'Liability Insurance', category: 'insurance' as const, section: 'closing_docs', subsection: 'insurance' },
  { docType: 'insurance_binder', label: 'Insurance Binder Naming Lender', category: 'insurance' as const, section: 'closing_docs', subsection: 'insurance' },
  
  // Funding
  { docType: 'closing_disclosure', label: 'Closing Disclosure', category: 'loan' as const, section: 'closing_docs', subsection: 'funding' },
  { docType: 'final_title_policy', label: 'Final Title Policy', category: 'loan' as const, section: 'closing_docs', subsection: 'funding' },
  { docType: 'disbursement_instructions', label: 'Disbursement Instructions', category: 'loan' as const, section: 'closing_docs', subsection: 'funding' },
  { docType: 'funding_authorization', label: 'Funding Authorization', category: 'loan' as const, section: 'closing_docs', subsection: 'funding' },
  { docType: 'escrow_agreements', label: 'Escrow Agreements', category: 'loan' as const, section: 'closing_docs', subsection: 'funding' },
  { docType: 'wiring_instructions', label: 'Wiring Instructions', category: 'loan' as const, section: 'closing_docs', subsection: 'funding' },
  
  // 4. SERVICING DOCS
  // Payment Records
  { docType: 'payment_history', label: 'Payment History', category: 'servicing' as const, section: 'servicing_docs', subsection: 'payment_records' },
  { docType: 'payment_receipts', label: 'Payment Receipts', category: 'servicing' as const, section: 'servicing_docs', subsection: 'payment_records' },
  { docType: 'ach_authorization', label: 'ACH Authorization', category: 'servicing' as const, section: 'servicing_docs', subsection: 'payment_records' },
  { docType: 'late_notices', label: 'Late Notices', category: 'servicing' as const, section: 'servicing_docs', subsection: 'payment_records' },
  { docType: 'payment_modification', label: 'Payment Modification Requests', category: 'servicing' as const, section: 'servicing_docs', subsection: 'payment_records' },
  
  // Loan Monitoring
  { docType: 'inspection_reports', label: 'Project Inspection Reports', category: 'servicing' as const, section: 'servicing_docs', subsection: 'loan_monitoring' },
  { docType: 'draw_requests', label: 'Draw Requests and Approvals', category: 'servicing' as const, section: 'servicing_docs', subsection: 'loan_monitoring' },
  { docType: 'progress_photos', label: 'Construction Progress Photos', category: 'servicing' as const, section: 'servicing_docs', subsection: 'loan_monitoring' },
  { docType: 'milestone_verification', label: 'Milestone Verification', category: 'servicing' as const, section: 'servicing_docs', subsection: 'loan_monitoring' },
  { docType: 'budget_variance', label: 'Budget Variance Tracking', category: 'servicing' as const, section: 'servicing_docs', subsection: 'loan_monitoring' },
  { docType: 'change_orders', label: 'Change Orders', category: 'servicing' as const, section: 'servicing_docs', subsection: 'loan_monitoring' },
  
  // Asset Management
  { docType: 'property_tax_verification', label: 'Property Tax Verification', category: 'servicing' as const, section: 'servicing_docs', subsection: 'asset_management' },
  { docType: 'insurance_renewal', label: 'Insurance Renewal Tracking', category: 'servicing' as const, section: 'servicing_docs', subsection: 'asset_management' },
  { docType: 'annual_financial_review', label: 'Annual Financial Review', category: 'servicing' as const, section: 'servicing_docs', subsection: 'asset_management' },
  { docType: 'property_condition_reports', label: 'Periodic Property Condition Reports', category: 'servicing' as const, section: 'servicing_docs', subsection: 'asset_management' },
  { docType: 'lease_monitoring', label: 'Lease/Tenant Monitoring', category: 'servicing' as const, section: 'servicing_docs', subsection: 'asset_management' },
  
  // Default Management
  { docType: 'default_notices', label: 'Default Notices', category: 'servicing' as const, section: 'servicing_docs', subsection: 'default_management' },
  { docType: 'workout_documentation', label: 'Workout Documentation', category: 'servicing' as const, section: 'servicing_docs', subsection: 'default_management' },
  { docType: 'forbearance_agreements', label: 'Forbearance Agreements', category: 'servicing' as const, section: 'servicing_docs', subsection: 'default_management' },
  { docType: 'loan_modification', label: 'Loan Modification Documents', category: 'servicing' as const, section: 'servicing_docs', subsection: 'default_management' },
  { docType: 'collection_communications', label: 'Collection Communications', category: 'servicing' as const, section: 'servicing_docs', subsection: 'default_management' },
  { docType: 'foreclosure_documentation', label: 'Foreclosure Documentation', category: 'servicing' as const, section: 'servicing_docs', subsection: 'default_management' },
  
  // Loan Conclusion
  { docType: 'payoff_statement', label: 'Payoff Statement', category: 'servicing' as const, section: 'servicing_docs', subsection: 'loan_conclusion' },
  { docType: 'satisfaction_of_mortgage', label: 'Satisfaction of Mortgage', category: 'servicing' as const, section: 'servicing_docs', subsection: 'loan_conclusion' },
  { docType: 'release_documents', label: 'Release Documents', category: 'servicing' as const, section: 'servicing_docs', subsection: 'loan_conclusion' },
  { docType: 'final_accounting', label: 'Final Accounting', category: 'servicing' as const, section: 'servicing_docs', subsection: 'loan_conclusion' },
  { docType: 'post_loan_documentation', label: 'Post-loan Project Documentation', category: 'servicing' as const, section: 'servicing_docs', subsection: 'loan_conclusion' },
  { docType: 'client_followup', label: 'Client Follow-up Records', category: 'servicing' as const, section: 'servicing_docs', subsection: 'loan_conclusion' },
];

// Define section icons and titles
type SectionKey = 'borrower_docs' | 'property_docs' | 'closing_docs' | 'servicing_docs' | 'unexecuted';

const SECTION_CONFIG: Record<SectionKey, {
  icon: React.ReactNode;
  title: string;
  subsections: Record<string, string>;
}> = {
  borrower_docs: {
    icon: <FileCheck size={20} />,
    title: 'Borrower Docs',
    subsections: {
      personal_information: 'Personal Information',
      financial_documentation: 'Financial Documentation',
      entity_documentation: 'Entity Documentation',
      experience_background: 'Experience & Background',
      exit_strategy: 'Exit Strategy'
    }
  },
  property_docs: {
    icon: <MapPin size={20} />,
    title: 'Property Docs',
    subsections: {
      property_information: 'Property Information',
      valuation: 'Valuation',
      property_condition: 'Property Condition',
      project_documentation: 'Project Documentation',
      income_property: 'Income Property Documents',
      state_specific: 'State-Specific Requirements'
    }
  },
  closing_docs: {
    icon: <FileText size={20} />,
    title: 'Closing Docs',
    subsections: {
      pre_closing: 'Pre-Closing',
      loan_agreements: 'Loan Agreements',
      compliance_documents: 'Compliance Documents',
      insurance: 'Insurance',
      funding: 'Funding'
    }
  },
  servicing_docs: {
    icon: <Clock size={20} />,
    title: 'Servicing Docs',
    subsections: {
      payment_records: 'Payment Records',
      loan_monitoring: 'Loan Monitoring',
      asset_management: 'Asset Management',
      default_management: 'Default Management',
      loan_conclusion: 'Loan Conclusion'
    }
  },
  unexecuted: {
    icon: <FileText size={20} />,
    title: 'Unexecuted Documents',
    subsections: {}
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

export default function DocumentsPage({ params }: { params: { id: string } }) {
  const loanId = params.id;
  const loan = loanDatabase.getLoanById(loanId);
  const [activeSection, setActiveSection] = useState<SectionKey>(Object.keys(SECTION_CONFIG)[0] as SectionKey);
  const [activeSubsection, setActiveSubsection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<SimpleDocument[]>([]);
  const [viewingDocument, setViewingDocument] = useState<SimpleDocument | null>(null);
  const [isGeneratingUnexecuted, setIsGeneratingUnexecuted] = useState(false);

  // Fetch documents on mount and when activeSection changes
  useEffect(() => {
    if (loan) {
      const docs = simpleDocumentService.getDocumentsForLoan(loanId);
      setDocuments(docs);
    }
  }, [loanId, loan]);

  // Set active subsection when active section changes
  useEffect(() => {
    if (activeSection && SECTION_CONFIG[activeSection]) {
      const subsectionKeys = Object.keys(SECTION_CONFIG[activeSection].subsections);
      if (subsectionKeys.length > 0) {
        setActiveSubsection(subsectionKeys[0]);
      } else {
        setActiveSubsection(null);
      }
    } else {
      setActiveSubsection(null);
    }
  }, [activeSection]);

  // Handle document upload
  const handleUpload = (docType: string) => {
    if (loan) {
      const docs = simpleDocumentService.getDocumentsForLoan(loanId);
      setDocuments(docs);
    }
  };

  // Handle document view
  const handleViewDocument = (document: SimpleDocument) => {
    setViewingDocument(document);
  };

  // Handle document close
  const handleCloseDocument = () => {
    setViewingDocument(null);
  };

  // Handle document status change
  const handleDocumentStatusChange = () => {
    setViewingDocument(null);
    if (loan) {
      const docs = simpleDocumentService.getDocumentsForLoan(loanId);
      setDocuments(docs);
    }
  };

  // Get document for a specific docType if it exists
  const getDocumentForType = (docType: string): SimpleDocument | undefined => {
    return documents.find(doc => doc.docType === docType);
  };
  
  const handleGenerateUnexecutedDocuments = async () => {
    if (!loan) return;
    
    setIsGeneratingUnexecuted(true);
    
    try {
      // Create unexecuted package
      const unexecutedPackage = createUnexecutedPackage(loan);
      
      // Generate each document in the package
      for (const docType of unexecutedPackage) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing time
        
        // Generate fake document
        const document = fakeDocumentService.generateFakeDocument(loan, docType);
        
        if (document) {
          // Refresh documents list
          const docs = simpleDocumentService.getDocumentsForLoan(loan.id);
          setDocuments(docs);
        }
      }
    } catch (error) {
      console.error("Error generating unexecuted package:", error);
    } finally {
      setIsGeneratingUnexecuted(false);
    }
  };
  
  // Function to create a combined package of all unexecuted documents
  const createUnexecutedPackage = (loan: any): string[] => {
    // Get document order from UNEXECUTED_CLOSING_DOCUMENTS (excluding the package itself)
    const documentOrder = UNEXECUTED_CLOSING_DOCUMENTS
      .filter((doc) => doc.docType !== 'unexecuted_package')
      .map((doc) => doc.docType);
    
    return documentOrder;
  };

  // Render document sections based on active section and subsection
  const renderDocumentSections = () => {
    if (!loan) return null;

    // Special case for unexecuted documents section
    if (activeSection === 'unexecuted') {
      return (
        <div>
          {UNEXECUTED_CLOSING_DOCUMENTS.map((docInfo) => {
            const existingDoc = getDocumentForType(docInfo.docType);
            
            return (
              <DocumentSocket
                key={docInfo.docType}
                label={docInfo.label}
                docType={docInfo.docType}
                category={docInfo.category}
                loanId={loan.id}
                document={existingDoc}
                onViewDocument={handleViewDocument}
                onUpload={handleUpload}
              />
            );
          })}
        </div>
      );
    }

    // Render documents based on active subsection
    if (activeSubsection) {
      // Get document types for this subsection
      const docTypesForSubsection = DOCUMENT_TYPES.filter(
        (doc) => doc.section === activeSection && doc.subsection === activeSubsection
      );
      
      return (
        <div>
          {docTypesForSubsection.map((docInfo) => {
            const existingDoc = getDocumentForType(docInfo.docType);
            
            return (
              <DocumentSocket
                key={docInfo.docType}
                label={docInfo.label}
                docType={docInfo.docType}
                category={docInfo.category}
                loanId={loan.id}
                document={existingDoc}
                onViewDocument={handleViewDocument}
                onUpload={handleUpload}
              />
            );
          })}
        </div>
      );
    }
    
    // If no subsection is active, show all documents for the section
    const docTypesForSection = DOCUMENT_TYPES.filter(
      (doc) => doc.section === activeSection
    );
    
    return (
      <div>
        {docTypesForSection.map((docInfo) => {
          const existingDoc = getDocumentForType(docInfo.docType);
          
          return (
            <DocumentSocket
              key={docInfo.docType}
              label={docInfo.label}
              docType={docInfo.docType}
              category={docInfo.category}
              loanId={loan.id}
              document={existingDoc}
              onViewDocument={handleViewDocument}
              onUpload={handleUpload}
            />
          );
        })}
      </div>
    );
  };

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
        {/* Sidebar - fixed on the left */}
        <div className="w-full md:w-64 flex-shrink-0">
          <LoanSidebar loan={loan} activePage="documents" />
        </div>

        {/* Main content - takes remaining space */}
        <div className="flex-grow overflow-hidden">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
              Loan Documents
            </h1>
            <p style={{ color: COLORS.textSecondary }}>
              View and manage documents for loan {loan.id.substring(0, 8)}
            </p>
          </div>

          {/* Section tabs - scrollable container */}
          <div className="mb-6 border-b border-gray-700">
            <div className="overflow-x-auto pb-1">
              <div className="flex min-w-max">
                {Object.entries(SECTION_CONFIG).map(([key, section]) => (
                  <button
                    key={key}
                    className={`px-4 py-2 text-sm font-medium mr-2 rounded-t-md transition-colors ${
                      activeSection === key
                        ? 'bg-blue-900/30 border-b-2 border-blue-500'
                        : 'hover:bg-gray-800'
                    }`}
                    style={{
                      color: activeSection === key ? COLORS.textPrimary : COLORS.textSecondary,
                    }}
                    onClick={() => setActiveSection(key as SectionKey)}
                  >
                    <div className="flex items-center">
                      <span className="mr-1.5">{section.icon}</span>
                      <span className="truncate max-w-[120px] inline-block">{section.title}</span>
                    </div>
                  </button>
                ))}
                
                {/* Special case for unexecuted documents */}
                <button
                  className={`px-4 py-2 text-sm font-medium mr-2 rounded-t-md transition-colors ${
                    activeSection === 'unexecuted'
                      ? 'bg-blue-900/30 border-b-2 border-blue-500'
                      : 'hover:bg-gray-800'
                  }`}
                  style={{
                    color: activeSection === 'unexecuted' ? COLORS.textPrimary : COLORS.textSecondary,
                  }}
                  onClick={() => setActiveSection('unexecuted' as SectionKey)}
                >
                  <div className="flex items-center">
                    <span className="mr-1.5"><FileText size={16} /></span>
                    <span className="truncate max-w-[120px] inline-block">Unexecuted Documents</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Subsection tabs if applicable */}
          {activeSection !== 'unexecuted' && SECTION_CONFIG[activeSection]?.subsections && Object.keys(SECTION_CONFIG[activeSection].subsections).length > 0 && (
            <div className="mb-6">
              <div className="overflow-x-auto pb-1">
                <div className="flex min-w-max">
                  {Object.entries(SECTION_CONFIG[activeSection].subsections).map(([key, label]) => (
                    <button
                      key={key}
                      className={`px-3 py-1 text-xs font-medium mr-2 rounded-md transition-colors ${
                        activeSubsection === key
                          ? 'bg-blue-900/20 border border-blue-500/50'
                          : 'hover:bg-gray-800 border border-transparent'
                      }`}
                      style={{
                        color: activeSubsection === key ? COLORS.textPrimary : COLORS.textSecondary,
                      }}
                      onClick={() => setActiveSubsection(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Special case for Unexecuted Documents section */}
          {activeSection === 'unexecuted' && (
            <div className="mb-6 p-4 rounded-md" style={{ backgroundColor: '#1a2234' }}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-1" style={{ color: COLORS.textPrimary }}>
                    Unexecuted Document Package
                  </h3>
                  <p className="text-sm" style={{ color: COLORS.textSecondary }}>
                    Generate and manage the unexecuted document package for this loan.
                  </p>
                </div>
                <Button
                  onClick={handleGenerateUnexecutedDocuments}
                  disabled={isGeneratingUnexecuted}
                  className="whitespace-nowrap"
                >
                  {isGeneratingUnexecuted ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Package
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Document list */}
          <div className="overflow-y-auto pr-1">
            {renderDocumentSections()}
          </div>
        </div>
      </div>

      {/* Document viewer */}
      {viewingDocument && (
        <SimpleDocumentViewer
          document={viewingDocument}
          onClose={handleCloseDocument}
          onStatusChange={handleDocumentStatusChange}
        />
      )}
    </LayoutWrapper>
  );
} 