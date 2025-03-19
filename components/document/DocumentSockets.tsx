// components/document/DocumentSockets.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Upload, Check, X, Eye, RefreshCw, FileCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleDocument, simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import { fakeDocumentService } from '@/utilities/fakeDocumentService';
import { loanDatabase } from '@/utilities/loanDatabase';
import { COLORS } from '@/app/theme/colors';
import { useLoanContext } from '@/components/LoanContextProvider';

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
  const { refreshLoanDocuments } = useLoanContext();
  const [documentGenerated, setDocumentGenerated] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Add states for document type selection
  const [selectedDocType, setSelectedDocType] = useState('');
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(refreshTrigger);
  const documentTypes = Object.keys(REQUIRED_DOCUMENT_TYPES.reduce((acc, doc) => {
    acc[doc.docType] = doc.label;
    return acc;
  }, {} as Record<string, string>));
  
  // Clear any duplicate documents for better display
  const clearDuplicateDocuments = useCallback(async () => {
    try {
      // Get all documents from the current loan
      const allDocs = simpleDocumentService.getDocumentsForLoan(loanId);
      
      // If we have duplicates, we should clean them up
      const uniqueDocs: Record<string, SimpleDocument> = {};
      
      // Keep track of which documents we'll keep
      const docsToKeep: SimpleDocument[] = [];
      const docsToRemove: SimpleDocument[] = [];
      
      // Group by docType and keep the most recent for each type
      allDocs.forEach(doc => {
        const key = doc.docType;
        
        if (!uniqueDocs[key] || new Date(doc.dateUploaded) > new Date(uniqueDocs[key].dateUploaded)) {
          // If we already had a document for this type, mark it for removal
          if (uniqueDocs[key]) {
            docsToRemove.push(uniqueDocs[key]);
          }
          
          // Keep the most recent one
          uniqueDocs[key] = doc;
          docsToKeep.push(doc);
        } else {
          // This is an older duplicate, so mark it for removal
          docsToRemove.push(doc);
        }
      });
      
      // If we found duplicates to remove
      if (docsToRemove.length > 0) {
        console.log(`Found ${docsToRemove.length} duplicate documents to clean up`);
        
        // Delete each duplicate
        for (const doc of docsToRemove) {
          await simpleDocumentService.deleteDocument(doc.id);
          console.log(`Removed duplicate document: ${doc.filename} (ID: ${doc.id})`);
        }
        
        // Update our local state with the cleaned list
        setDocuments(docsToKeep);
        
        // Show a message if we cleaned up duplicates
        setSuccessMessage(`Cleaned up ${docsToRemove.length} duplicate documents`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error cleaning up duplicate documents:", error);
    }
  }, [loanId]);
  
  // Fetch documents when component mounts or refreshTrigger changes
  useEffect(() => {
    const fetchDocuments = () => {
      setLoading(true);
      // First get documents from localStorage (metadata only)
      const loanDocuments = simpleDocumentService.getDocumentsForLoan(loanId);
      setDocuments(loanDocuments);
      setLoading(false);
      
      // Then also refresh the loan context to ensure it has the latest data
      if (documentGenerated) {
        refreshLoanDocuments();
        
        // Double-check after a short delay to make sure documents are persisted
        setTimeout(() => {
          const refreshedDocs = simpleDocumentService.getDocumentsForLoan(loanId);
          if (refreshedDocs.length !== loanDocuments.length) {
            console.log(`Document count changed from ${loanDocuments.length} to ${refreshedDocs.length}`);
            setDocuments(refreshedDocs);
          }
          setDocumentGenerated(false);
        }, 500);
      }
    };

    fetchDocuments();
    
    // Also set up a refresh interval to check for documents
    const intervalId = setInterval(() => {
      if (!loading) {
        const refreshedDocs = simpleDocumentService.getDocumentsForLoan(loanId);
        if (refreshedDocs.length !== documents.length) {
          console.log(`Document count changed from ${documents.length} to ${refreshedDocs.length}`);
          setDocuments(refreshedDocs);
        }
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [loanId, localRefreshTrigger, documentGenerated, refreshLoanDocuments, loading, documents.length]);
  
  // Also refresh documents from context when component mounts
  useEffect(() => {
    refreshLoanDocuments();
    
    // Clean up duplicate documents when the component first loads
    clearDuplicateDocuments();
    
    // Store a marker in sessionStorage that we've loaded this loan's documents
    // This helps with persistence between page navigations
    const storageKey = `doc_loaded_${loanId}`;
    if (!sessionStorage.getItem(storageKey)) {
      sessionStorage.setItem(storageKey, 'true');
      
      // Check for documents after a delay to ensure they're properly loaded
      setTimeout(() => {
        const refreshedDocs = simpleDocumentService.getDocumentsForLoan(loanId);
        if (refreshedDocs.length > 0 && refreshedDocs.length !== documents.length) {
          console.log(`Initial document retrieval found ${refreshedDocs.length} documents`);
          setDocuments(refreshedDocs);
        }
      }, 1000);
    }
  }, [refreshLoanDocuments, loanId, documents.length, clearDuplicateDocuments]);

  // Get document for a specific docType if it exists
  const getDocumentForType = (docType: string): SimpleDocument | undefined => {
    // Get all documents matching this docType
    const matchingDocs = documents.filter(doc => doc.docType === docType);
    
    // If none found, return undefined
    if (matchingDocs.length === 0) return undefined;
    
    // If only one found, return it
    if (matchingDocs.length === 1) return matchingDocs[0];
    
    // If multiple, return the most recent one (by dateUploaded)
    return matchingDocs.sort((a, b) => 
      new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime()
    )[0];
  };

  // Generate a sample document for a specific type
  const handleGenerateSample = async (docType: string) => {
    try {
      setLoading(true);
      console.log(`Generating sample document of type: ${docType}`);

      // Get the current loan
      const loan = loanDatabase.getLoanById(loanId);
      
      if (!loan) {
        throw new Error(`Loan with ID ${loanId} not found`);
      }

      // Use our fake document service to generate a realistic document
      const newDoc = await fakeDocumentService.generateFakeDocument(loan, docType);

      if (newDoc) {
        console.log(`Generated document: ${newDoc.id}`);
        
        // Set a flag that documents were generated to trigger refresh
        setDocumentGenerated(true);
        
        // Trigger an immediate refresh
        const updatedDocs = simpleDocumentService.getDocumentsForLoan(loanId);
        setDocuments(updatedDocs);
        
        // Clean up any duplicate documents
        await clearDuplicateDocuments();
        
        // Show success message
        setSuccessMessage(`Generated ${docType} document successfully`);
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (error: any) {
      console.error("Error generating sample document:", error);
      setErrorMessage(`Failed to generate ${docType} document: ${error?.message || "Unknown error"}`);
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Generate all sample documents
  const handleGenerateAllSamples = async () => {
    try {
      setLoading(true);
      console.log("Generating all sample documents");

      // Get the current loan
      const loan = loanDatabase.getLoanById(loanId);
      
      if (!loan) {
        throw new Error(`Loan with ID ${loanId} not found`);
      }

      // Use our fake document service to generate all document types
      await fakeDocumentService.generateAllFakeDocuments(loan);

      console.log("All documents generated");
      
      // Set a flag that documents were generated to trigger refresh
      setDocumentGenerated(true);
      
      // Trigger an immediate refresh
      const updatedDocs = simpleDocumentService.getDocumentsForLoan(loanId);
      setDocuments(updatedDocs);
      
      // Clean up any duplicate documents
      await clearDuplicateDocuments();
      
      // Refresh loan context to ensure documents are persisted
      refreshLoanDocuments();
      
      // Show success message
      setSuccessMessage("Generated all sample documents successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error: any) {
      console.error("Error generating all sample documents:", error);
      setErrorMessage(`Failed to generate all documents: ${error?.message || "Unknown error"}`);
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
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

  const handleFilesAccepted = useCallback(async (files: File[]) => {
    try {
      setLoading(true);
      console.log(`Uploading ${files.length} documents`);

      for (const file of files) {
        // Validate file type
        if (file.type !== "application/pdf") {
          console.error(`File ${file.name} is not a PDF`);
          continue;
        }
        
        setUploading(file.name);
        
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
          // Handle the upload
          const uploadedDoc = await simpleDocumentService.addDocument(
            file, 
            loanId,
            { docType: file.name, category: 'misc' }
          );
          
          if (uploadedDoc) {
            setDocuments(prev => [...prev.filter(doc => doc.docType !== file.name), uploadedDoc]);
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
        } finally {
          clearInterval(progressInterval);
          setUploadProgress(0);
          setUploading(null);
        }
      }

      setSuccessMessage(`${files.length} documents uploaded successfully`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error uploading documents:", error);
      setErrorMessage("Failed to upload documents. Please try again later.");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  }, [loanId]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    try {
      setLoading(true);
      const files = Array.from(event.target.files);
      console.log(`Uploading ${files.length} documents`);

      for (const file of files) {
        try {
          const uploadedDoc = await simpleDocumentService.addDocument(
            file, 
            loanId,
            { docType: file.name.replace(/\.[^/.]+$/, ""), category: 'misc' }
          );
          
          if (uploadedDoc) {
            setSuccessMessage(`Uploaded document: ${file.name}`);
            setDocumentGenerated(true);
            setLocalRefreshTrigger(prev => prev + 1);
          }
        } catch (error: any) {
          console.error(`Error uploading file ${file.name}:`, error);
          setErrorMessage(`Failed to upload ${file.name}: ${error?.message || "Unknown error"}`);
        }
      }
      
      // Clean up any duplicate documents after uploads
      await clearDuplicateDocuments();
      
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 3000);
      
    } catch (error: any) {
      console.error("Error handling file upload:", error);
      setErrorMessage(`Upload failed: ${error?.message || "Unknown error"}`);
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setLoading(false);
      // Reset the input value
      if (event.target.value) event.target.value = '';
    }
  }, [loanId, clearDuplicateDocuments]);

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
    <div className="document-sockets">
      <div className="document-header">
        <h2>Loan Documents</h2>
        <div className="document-controls">
          {/* Add a button to add new documents from upload */}
          <div style={{ position: 'relative' }}>
            <button className="file-upload-button" onClick={() => {
              document.getElementById('main-file-upload')?.click();
            }}>
              <Upload size={18} />
              <span>Upload Document</span>
            </button>
            <input
              type="file"
              id="main-file-upload"
              accept=".pdf,.doc,.docx,.html,.txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              multiple
            />
          </div>
          
          {/* Sample document generator */}
          <div className="sample-document-controls">
            <select 
              value={selectedDocType} 
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="document-type-selector"
            >
              <option value="">Select Document Type</option>
              {documentTypes.map(docType => (
                <option key={docType} value={docType}>
                  {docType.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <button 
              onClick={() => handleGenerateSample(selectedDocType)}
              disabled={!selectedDocType || loading}
              className="generate-button"
            >
              Generate Sample
            </button>
            <button 
              onClick={handleGenerateAllSamples}
              disabled={loading || generatingAll}
              className="generate-all-button"
            >
              Generate All
            </button>
          </div>
        </div>
      </div>
      
      {/* Status messages */}
      {successMessage && (
        <div className="alert alert-success" style={{
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb'
        }}>
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="alert alert-error" style={{
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        }}>
          {errorMessage}
        </div>
      )}

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
                        onChange={handleFileUpload}
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