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
  category: 'loan' | 'legal' | 'financial' | 'misc';
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

// Define document types for each section
const INITIAL_DOCUMENTS = [
  { docType: 'borrower_identification', label: 'Borrower Identification', category: 'loan' as const },
  { docType: 'credit_report', label: 'Credit Report', category: 'financial' as const },
  { docType: 'property_appraisal', label: 'Property Appraisal', category: 'financial' as const },
  { docType: 'purchase_contract', label: 'Purchase Contract', category: 'legal' as const },
  { docType: 'insurance_proof', label: 'Proof of Insurance', category: 'misc' as const },
  { docType: 'income_verification', label: 'Income Verification', category: 'financial' as const },
];

const UNEXECUTED_CLOSING_DOCUMENTS = [
  { docType: 'promissory_note_draft', label: 'Promissory Note (Draft)', category: 'legal' as const },
  { docType: 'deed_of_trust_draft', label: 'Deed of Trust (Draft)', category: 'legal' as const },
  { docType: 'closing_disclosure_draft', label: 'Closing Disclosure (Draft)', category: 'financial' as const },
  { docType: 'loan_agreement_draft', label: 'Loan Agreement (Draft)', category: 'legal' as const },
];

const EXECUTED_CLOSING_DOCUMENTS = [
  { docType: 'executed_package', label: 'Executed Documents Package', category: 'loan' as const },
  { docType: 'promissory_note', label: 'Promissory Note', category: 'legal' as const },
  { docType: 'deed_of_trust', label: 'Deed of Trust', category: 'legal' as const },
  { docType: 'closing_disclosure', label: 'Closing Disclosure', category: 'financial' as const },
  { docType: 'loan_agreement', label: 'Loan Agreement', category: 'legal' as const },
];

export default function LoanDocumentsPage() {
  const params = useParams();
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<SimpleDocument | null>(null);
  const [documents, setDocuments] = useState<SimpleDocument[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    if (params?.id) {
      const loanId = String(params.id);
      const fetchedLoan = loanDatabase.getLoanById(loanId);
      
      if (fetchedLoan) {
        setLoan(fetchedLoan);
        // Fetch documents for this loan
        const loanDocuments = simpleDocumentService.getDocumentsForLoan(loanId);
        setDocuments(loanDocuments);
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
      // Generate only unexecuted closing documents
      UNEXECUTED_CLOSING_DOCUMENTS.forEach(docInfo => {
        fakeDocumentService.generateFakeDocument(loan, docInfo.docType);
      });
      setRefreshTrigger(prev => prev + 1);
    }
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
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <div className="p-6 rounded-lg mb-6 flex flex-col md:flex-row justify-between items-start md:items-center" 
               style={{ backgroundColor: COLORS.bgDark }}>
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
                Loan #{loan.id} Documents
              </h1>
              <div className="flex items-center">
                <MapPin size={16} className="mr-2" style={{ color: COLORS.textSecondary }} />
                <span style={{ color: COLORS.textSecondary }}>{loan.propertyAddress}</span>
              </div>
            </div>
          </div>
        
          <div className="rounded-lg p-6" style={{ backgroundColor: COLORS.bgDarker }}>
            {/* Initial Documents */}
            <Section title="Initial Documents" icon={<Clock size={20} />}>
              {INITIAL_DOCUMENTS.map((docInfo) => (
                <DocumentSocket
                  key={docInfo.docType}
                  label={docInfo.label}
                  docType={docInfo.docType}
                  category={docInfo.category}
                  loanId={loan.id}
                  document={getDocumentForType(docInfo.docType)}
                  onViewDocument={setSelectedDocument}
                  onUpload={handleUpload}
                />
              ))}
            </Section>

            {/* Unexecuted Closing Documents */}
            <Section 
              title="Unexecuted Closing Documents" 
              icon={<FileText size={20} />}
              actionButton={
                <Button
                  onClick={handleGenerateUnexecutedDocuments}
                  className="flex items-center gap-2"
                  size="sm"
                  style={{ 
                    backgroundColor: COLORS.primary, 
                    color: COLORS.textPrimary 
                  }}
                >
                  <FileCheck size={14} className="mr-1" />
                  Generate Unexecuted Documents
                </Button>
              }
            >
              {UNEXECUTED_CLOSING_DOCUMENTS.map((docInfo) => (
                <DocumentSocket
                  key={docInfo.docType}
                  label={docInfo.label}
                  docType={docInfo.docType}
                  category={docInfo.category}
                  loanId={loan.id}
                  document={getDocumentForType(docInfo.docType)}
                  onViewDocument={setSelectedDocument}
                  onUpload={handleUpload}
                />
              ))}
            </Section>

            {/* Executed Closing Documents */}
            <Section title="Executed Closing Documents" icon={<Check size={20} />}>
              {EXECUTED_CLOSING_DOCUMENTS.map((docInfo) => (
                <DocumentSocket
                  key={docInfo.docType}
                  label={docInfo.label}
                  docType={docInfo.docType}
                  category={docInfo.category}
                  loanId={loan.id}
                  document={getDocumentForType(docInfo.docType)}
                  onViewDocument={setSelectedDocument}
                  onUpload={handleUpload}
                />
              ))}
            </Section>
          </div>
        </div>
        
        {/* Document Viewer Modal */}
        {selectedDocument && (
          <SimpleDocumentViewer 
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
            onStatusChange={handleDocumentStatusChange}
            onDelete={() => {
              setSelectedDocument(null);
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        )}
      </div>
      
      {/* Sidebar Navigation */}
      <LoanSidebar loanId={loan.id} />
    </LayoutWrapper>
  );
} 