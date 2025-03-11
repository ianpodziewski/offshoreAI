// components/document/SimpleDocumentViewer.tsx
import React, { useState, useEffect } from 'react';
import { simpleDocumentService, SimpleDocument } from '@/utilities/simplifiedDocumentService';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowLeft, Download, ExternalLink, Trash2 } from 'lucide-react';

interface SimpleDocumentViewerProps {
  document: SimpleDocument;
  onClose: () => void;
  onStatusChange?: () => void;
  onDelete?: () => void;
}

export default function SimpleDocumentViewer({ 
  document, 
  onClose, 
  onStatusChange,
  onDelete
}: SimpleDocumentViewerProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(document.notes || '');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Convert data URL to Blob URL on component mount
  useEffect(() => {
    try {
      // Ensure content has the proper data URL format
      if (document.content) {
        let dataUrl = document.content;
        
        // If it's not a complete data URL, add the prefix
        if (!dataUrl.startsWith('data:application/pdf')) {
          dataUrl = `data:application/pdf;base64,${dataUrl.replace(/^data:.*?;base64,/, '')}`;
        }
        
        // Convert Data URL to Blob
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => {
            // Create a blob URL from the blob
            const url = URL.createObjectURL(blob);
            setPdfBlobUrl(url);
          })
          .catch(err => {
            console.error("Error creating blob URL:", err);
          });
      }
    } catch (error) {
      console.error('Error processing PDF data:', error);
    }
    
    // Clean up blob URL on component unmount
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [document.content]);
  
  // Handle status update
  const updateStatus = async (status: 'pending' | 'approved' | 'rejected') => {
    if (!document?.id) return;
    
    setLoading(true);
    try {
      const result = simpleDocumentService.updateDocumentStatus(
        document.id, 
        status,
        notes
      );
      
      if (onStatusChange && result) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle document deletion
  const handleDelete = async () => {
    if (!document?.id) return;
    
    if (!deleteConfirm) {
      // First click - show confirmation
      setDeleteConfirm(true);
      return;
    }
    
    // Second click - actually delete
    setDeleting(true);
    try {
      const success = simpleDocumentService.deleteDocument(document.id);
      
      if (success && onDelete) {
        onDelete();
      } else {
        setDeleteConfirm(false);
        setDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      setDeleteConfirm(false);
      setDeleting(false);
    }
  };
  
  // Cancel delete operation
  const cancelDelete = () => {
    setDeleteConfirm(false);
  };
  
  // Open PDF in a new tab
  const openPdfInNewTab = () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, '_blank');
    }
  };
  
  // Download the PDF
  const downloadPdf = () => {
    if (pdfBlobUrl) {
      // Use window.document to access the global document object
      const a = window.document.createElement('a');
      a.href = pdfBlobUrl;
      a.download = document.filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onClose}>
              <ArrowLeft size={16} />
            </Button>
            <h3 className="font-medium ml-2">{document?.filename}</h3>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => updateStatus('approved')} 
              disabled={loading || deleteConfirm}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check size={16} className="mr-1" />
              Approve
            </Button>
            <Button 
              onClick={() => updateStatus('rejected')} 
              disabled={loading || deleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <X size={16} className="mr-1" />
              Reject
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row h-full">
          {/* Document Preview */}
          <div className="flex-grow overflow-auto p-4 border-r">
            {pdfBlobUrl ? (
              <div className="w-full h-full flex flex-col">
                <div className="mb-4 flex justify-end gap-2">
                  <Button onClick={openPdfInNewTab} variant="outline" size="sm">
                    <ExternalLink size={16} className="mr-1" />
                    Open in New Tab
                  </Button>
                  <Button onClick={downloadPdf} variant="outline" size="sm">
                    <Download size={16} className="mr-1" />
                    Download
                  </Button>
                </div>
                
                <div className="flex-grow">
                  {/* Use iframe instead of embed for better browser compatibility */}
                  <iframe 
                    src={pdfBlobUrl}
                    className="w-full h-[600px] border rounded"
                    title={document.filename}
                  />
                </div>
                
                {/* Fallback for browsers that don't support iframe */}
                <div className="mt-4 p-4 bg-gray-100 rounded text-center">
                  <p className="text-gray-600 mb-2">If the document is not visible above, you can:</p>
                  <div className="flex justify-center gap-3">
                    <Button onClick={openPdfInNewTab} variant="default" size="sm">
                      <ExternalLink size={16} className="mr-1" />
                      Open in New Tab
                    </Button>
                    <Button onClick={downloadPdf} variant="default" size="sm">
                      <Download size={16} className="mr-1" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading document preview...</p>
              </div>
            )}
          </div>
          
          {/* Document Details Panel */}
          <div className="w-full md:w-1/3 p-4 flex flex-col">
            <h4 className="font-medium mb-3">Document Details</h4>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Type</p>
                <p className="font-medium capitalize">{document.docType.replace(/_/g, ' ')}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Category</p>
                <p className="font-medium capitalize">{document.category}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className={`font-medium ${
                  document.status === 'approved' ? 'text-green-600' :
                  document.status === 'rejected' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Upload Date</p>
                <p className="font-medium">{new Date(document.dateUploaded).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-500 mb-1">
                Review Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded h-32 text-sm"
                placeholder="Add notes about this document..."
                disabled={deleteConfirm}
              />
            </div>
            
            {/* Delete Document Section */}
            <div className="mt-4 pt-4 border-t">
              {deleteConfirm ? (
                <div>
                  <p className="text-sm text-red-600 font-medium mb-3">
                    Are you sure you want to delete this document? This action cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleDelete} 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </Button>
                    <Button 
                      onClick={cancelDelete} 
                      variant="outline" 
                      className="flex-1"
                      disabled={deleting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  onClick={handleDelete} 
                  variant="outline" 
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  disabled={loading}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Document
                </Button>
              )}
            </div>
            
            <div className="mt-auto pt-4">
              <Button onClick={onClose} className="w-full" disabled={deleteConfirm}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}