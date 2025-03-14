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
  { docType: 'unexecuted_package', label: 'Unexecuted Documents Package', category: 'loan' as const },
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
      // Get all existing documents first
      const allDocs = simpleDocumentService.getAllDocuments();
      const updatedDocs = [...allDocs];
      let docsChanged = false;
      
      // Store generated document contents for package creation
      const generatedContents: Record<string, string> = {};
      
      // Generate only unexecuted closing documents (excluding the package itself)
      const individualDocuments = UNEXECUTED_CLOSING_DOCUMENTS.filter(doc => doc.docType !== 'unexecuted_package');
      
      individualDocuments.forEach(docInfo => {
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
      .filter(doc => doc.docType !== 'unexecuted_package')
      .map(doc => ({
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