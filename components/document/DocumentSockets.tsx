// components/document/DocumentSockets.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Upload, Check, X, Eye, RefreshCw, FileCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleDocument, simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import { fakeDocumentService } from '@/utilities/fakeDocumentService';
import { loanDatabase } from '@/utilities/loanDatabase';
import { COLORS } from '@/app/theme/colors';

// Define the required document types for loans
export const REQUIRED_DOCUMENT_TYPES: {
  docType: string;
  label: string;
  category: 'loan' | 'legal' | 'financial' | 'misc';
}[] = [
  { docType: 'executed_package', label: 'Executed Documents Package', category: 'loan' },
  { docType: 'promissory_note', label: 'Promissory Note', category: 'legal' },
  { docType: 'deed_of_trust', label: 'Deed of Trust', category: 'legal' },
  { docType: 'closing_disclosure', label: 'Closing Disclosure', category: 'financial' },
  { docType: 'property_appraisal', label: 'Property Appraisal', category: 'financial' }
];

interface DocumentSocketsProps {
  loanId: string;
  onViewDocument: (document: SimpleDocument) => void;
  refreshTrigger?: number;
}

const DocumentSockets: React.FC<DocumentSocketsProps> = ({ 
  loanId, 
  onViewDocument,
  refreshTrigger = 0
}) => {
  const [documents, setDocuments] = useState<SimpleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatingAll, setGeneratingAll] = useState(false);
  
  // Fetch documents when component mounts or refreshTrigger changes
  useEffect(() => {
    const fetchDocuments = () => {
      setLoading(true);
      const loanDocuments = simpleDocumentService.getDocumentsForLoan(loanId);
      setDocuments(loanDocuments);
      setLoading(false);
    };

    fetchDocuments();
  }, [loanId, refreshTrigger]);

  // Get document for a specific docType if it exists
  const getDocumentForType = (docType: string): SimpleDocument | undefined => {
    return documents.find(doc => doc.docType === docType);
  };

  // Generate a single sample document
  const handleGenerateSample = (docType: string) => {
    const loan = loanDatabase.getLoanById(loanId);
    
    if (!loan) {
      console.error('Loan not found');
      return;
    }
    
    // Generate the document
    const document = fakeDocumentService.generateFakeDocument(loan, docType);
    
    if (document) {
      // Update the documents list
      setDocuments(prev => [...prev.filter(doc => doc.docType !== docType), document]);
    }
  };

  // Generate all sample documents
  const handleGenerateAllSamples = () => {
    setGeneratingAll(true);
    
    try {
      const loan = loanDatabase.getLoanById(loanId);
      
      if (!loan) {
        console.error('Loan not found');
        return;
      }
      
      // Generate all documents
      const generatedDocs = fakeDocumentService.generateAllFakeDocuments(loan);
      
      // Update the state with new documents
      if (generatedDocs.length > 0) {
        setDocuments(prev => {
          const existingDocTypes = new Set(generatedDocs.map(doc => doc.docType));
          // Keep only documents that weren't regenerated
          const filteredPrev = prev.filter(doc => !existingDocTypes.has(doc.docType));
          return [...filteredPrev, ...generatedDocs];
        });
      }
    } catch (error) {
      console.error('Error generating sample documents:', error);
    } finally {
      setGeneratingAll(false);
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

  // Handle drag events
  const handleDragOver = (e: React.DragEvent, docType: string) => {
    e.preventDefault();
    setDragTarget(docType);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragTarget(null);
  };

  const handleDrop = useCallback(async (e: React.DragEvent, docType: string, category: 'loan' | 'legal' | 'financial' | 'misc') => {
    e.preventDefault();
    setDragTarget(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file");
        return;
      }
      
      setUploading(docType);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      try {
        // If this is the executed package, handle it differently
        if (docType === 'executed_package') {
          // First upload the package itself
          const uploadedDoc = await simpleDocumentService.addDocument(
            file, 
            loanId,
            { docType: docType, category: category }
          );

          if (uploadedDoc) {
            setDocuments(prev => [...prev.filter(doc => doc.docType !== docType), uploadedDoc]);
            
            // Then trigger the split process
            const response = await fetch('/api/split-document', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                documentId: uploadedDoc.id,
                loanId: loanId,
              }),
            });
            
            const result = await response.json();
            
            if (result.success && result.splitDocuments) {
              // Update the documents list with the split documents
              setDocuments(prev => {
                const withoutSplitTypes = prev.filter(doc => 
                  !result.splitDocuments.some((splitDoc: any) => splitDoc.docType === doc.docType)
                );
                return [...withoutSplitTypes, ...result.splitDocuments];
              });
            }
          }
        } else {
          // Handle normal document upload
          const uploadedDoc = await simpleDocumentService.addDocument(
            file, 
            loanId,
            { docType: docType, category: category }
          );
          
          if (uploadedDoc) {
            setDocuments(prev => [...prev.filter(doc => doc.docType !== docType), uploadedDoc]);
          }
        }
      } catch (error) {
        console.error("Error uploading document:", error);
      } finally {
        clearInterval(progressInterval);
        setUploadProgress(0);
        setUploading(null);
      }
    }
  }, [loanId]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto mb-2" 
             style={{ borderColor: COLORS.primary }}></div>
        <p style={{ color: COLORS.textSecondary }}>Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* We're removing the button from here as it appears to be handled elsewhere */}

      {REQUIRED_DOCUMENT_TYPES.map((docTypeInfo) => {
        const document = getDocumentForType(docTypeInfo.docType);
        const isDragging = dragTarget === docTypeInfo.docType;
        const isUploading = uploading === docTypeInfo.docType;
        
        return (
          <div 
            key={docTypeInfo.docType} 
            className={`rounded-md overflow-hidden transition-all ${isDragging ? 'shadow-md' : ''}`}
            style={{ 
              borderWidth: '1px', 
              borderStyle: 'solid',
              borderColor: isDragging ? COLORS.primary : COLORS.border
            }}
          >
            {/* Document Type Header */}
            <div className="px-4 py-3 flex justify-between items-center" 
                 style={{ 
                   backgroundColor: COLORS.bgDark, 
                   borderBottomWidth: '1px', 
                   borderBottomStyle: 'solid',
                   borderBottomColor: COLORS.border
                 }}>
              <h3 className="font-medium" style={{ color: COLORS.textPrimary }}>{docTypeInfo.label}</h3>
              {document && getStatusBadge(document.status)}
            </div>
            
            {/* Document or empty state */}
            <div 
              className={`p-4 ${!document ? 'cursor-pointer' : ''}`}
              style={{ 
                backgroundColor: COLORS.bgDarker,
                borderColor: isDragging ? COLORS.primary : COLORS.border,
              }}
              onDragOver={(e) => handleDragOver(e, docTypeInfo.docType)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, docTypeInfo.docType, docTypeInfo.category)}
            >
              {document ? (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText size={18} style={{ color: COLORS.textMuted }} className="mr-3" />
                    <div>
                      <div className="relative">
                        <p className="font-medium" style={{ color: COLORS.textPrimary }}>{document.filename}</p>
                      </div>
                      <p className="text-xs" style={{ color: COLORS.textMuted }}>
                        {new Date(document.dateUploaded).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewDocument(document)}
                    style={{ color: COLORS.textAccent }}
                  >
                    <Eye size={16} className="mr-1" />
                    View
                  </Button>
                </div>
              ) : isUploading ? (
                <div className="text-center py-2">
                  <div className="h-2 w-full rounded-full mb-2" style={{ backgroundColor: COLORS.bgHeader }}>
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ 
                        width: `${uploadProgress}%`,
                        backgroundColor: COLORS.primary 
                      }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                    Uploading document...
                  </p>
                </div>
              ) : (
                <div className={`text-center py-3 ${isDragging ? '' : ''}`} style={{ 
                  backgroundColor: isDragging ? COLORS.bgButton : 'transparent' 
                }}>
                  <Upload size={20} className="mx-auto mb-2" style={{ 
                    color: isDragging ? COLORS.primary : COLORS.textMuted 
                  }} />
                  <p className="text-sm" style={{ 
                    color: isDragging ? COLORS.textAccent : COLORS.textSecondary 
                  }}>
                    {isDragging ? 'Drop to upload' : 'Drag & drop a PDF file here'}
                  </p>
                  <div className="flex justify-center mt-2 space-x-2">
                    <label 
                      className="text-xs cursor-pointer hover:underline"
                      style={{ color: COLORS.textAccent }}
                      htmlFor={`file-upload-${docTypeInfo.docType}`}
                    >
                      Upload File
                      <input 
                        type="file" 
                        id={`file-upload-${docTypeInfo.docType}`}
                        className="hidden" 
                        accept=".pdf"
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            if (file.type !== "application/pdf") {
                              alert("Please upload a PDF file");
                              return;
                            }
                            
                            // Use the same upload function as for drag and drop
                            setUploading(docTypeInfo.docType);
                            
                            const progressInterval = setInterval(() => {
                              setUploadProgress(prev => {
                                if (prev >= 90) {
                                  clearInterval(progressInterval);
                                  return 90;
                                }
                                return prev + 10;
                              });
                            }, 200);
                            
                            try {
                              const uploadedDoc = await simpleDocumentService.addDocument(
                                file, 
                                loanId,
                                { docType: docTypeInfo.docType, category: docTypeInfo.category }
                              );
                              
                              if (uploadedDoc) {
                                setDocuments(prev => [...prev.filter(doc => doc.docType !== docTypeInfo.docType), uploadedDoc]);
                              }
                            } catch (error) {
                              console.error("Error uploading document:", error);
                            } finally {
                              clearInterval(progressInterval);
                              setUploadProgress(0);
                              setUploading(null);
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
                      onClick={() => handleGenerateSample(docTypeInfo.docType)}
                      disabled={generatingAll}
                    >
                      Generate Sample
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DocumentSockets;