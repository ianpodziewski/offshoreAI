// components/document/DocumentSockets.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Upload, Check, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleDocument, simpleDocumentService } from '@/utilities/simplifiedDocumentService';

// Define the required document types for loans
export const REQUIRED_DOCUMENT_TYPES: {
  docType: string;
  label: string;
  category: 'loan' | 'legal' | 'financial' | 'misc';
}[] = [
  { docType: 'promissory_note', label: 'Promissory Note', category: 'loan' },
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

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
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
      
      // Simulate progress (in a real implementation, you might have actual upload progress)
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
        // Override document classification to ensure it goes into the correct socket
        const overrideClassification = {
          docType: docType,
          category: category as 'loan' | 'legal' | 'financial' | 'misc'
        };
        
        // Upload the document with specific classification
        const uploadedDoc = await simpleDocumentService.addDocument(file, loanId, overrideClassification);
        
        if (uploadedDoc) {
          setDocuments(prev => [...prev.filter(doc => doc.docType !== docType), uploadedDoc]);
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
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-500 text-sm">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {REQUIRED_DOCUMENT_TYPES.map((docTypeInfo) => {
        const document = getDocumentForType(docTypeInfo.docType);
        const isDragging = dragTarget === docTypeInfo.docType;
        const isUploading = uploading === docTypeInfo.docType;
        
        return (
          <div 
            key={docTypeInfo.docType} 
            className={`border rounded-md overflow-hidden transition-all ${isDragging ? 'border-blue-500 shadow-md' : ''}`}
          >
            {/* Document Type Header */}
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <h3 className="font-medium">{docTypeInfo.label}</h3>
              {document && getStatusBadge(document.status)}
            </div>
            
            {/* Document or empty state */}
            <div 
              className={`p-4 ${!document ? 'cursor-pointer' : ''}`}
              onDragOver={(e) => handleDragOver(e, docTypeInfo.docType)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, docTypeInfo.docType, docTypeInfo.category)}
            >
              {document ? (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText size={18} className="text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium">{document.filename}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(document.dateUploaded).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewDocument(document)}
                  >
                    <Eye size={16} className="mr-1" />
                    View
                  </Button>
                </div>
              ) : isUploading ? (
                <div className="text-center py-2">
                  <div className="h-2 w-full bg-gray-200 rounded-full mb-2">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Uploading document...</p>
                </div>
              ) : (
                <div className={`text-center py-3 ${isDragging ? 'bg-blue-50' : ''}`}>
                  <Upload size={20} className={`mx-auto mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className={`text-sm ${isDragging ? 'text-blue-700' : 'text-gray-400'}`}>
                    {isDragging ? 'Drop to upload' : 'Drag & drop a PDF file here'}
                  </p>
                  {!isDragging && (
                    <label 
                      className="text-xs text-blue-600 hover:underline cursor-pointer mt-1 block"
                      htmlFor={`file-upload-${docTypeInfo.docType}`}
                    >
                      or click to browse
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
                                { docType: docTypeInfo.docType, category: docTypeInfo.category as 'loan' | 'legal' | 'financial' | 'misc' }
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
                  )}
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