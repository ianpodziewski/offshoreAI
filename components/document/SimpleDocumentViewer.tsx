// components/document/SimpleDocumentViewer.tsx
import React, { useState, useEffect } from 'react';
import { simpleDocumentService, SimpleDocument } from '@/utilities/simplifiedDocumentService';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowLeft, Download, ExternalLink } from 'lucide-react';

interface SimpleDocumentViewerProps {
  document: SimpleDocument;
  onClose: () => void;
  onStatusChange?: () => void;
}

export default function SimpleDocumentViewer({ 
  document, 
  onClose, 
  onStatusChange 
}: SimpleDocumentViewerProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(document.notes || '');
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  
  // Process the PDF data URL when the component mounts
  useEffect(() => {
    try {
      // Ensure content has the proper data URL format
      if (document.content) {
        // If it's already a proper data URL, use it
        if (document.content.startsWith('data:application/pdf')) {
          setPdfDataUrl(document.content);
        } 
        // If it's a base64 string without the prefix
        else {
          const formattedContent = `data:application/pdf;base64,${document.content.replace(/^data:.*?;base64,/, '')}`;
          setPdfDataUrl(formattedContent);
        }
      }
    } catch (error) {
      console.error('Error processing PDF data:', error);
    }
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
  
  // Open PDF in a new tab
  const openPdfInNewTab = () => {
    if (pdfDataUrl) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${document.filename}</title>
            </head>
            <body style="margin: 0; padding: 0; overflow: hidden; height: 100vh;">
              <embed 
                src="${pdfDataUrl}" 
                type="application/pdf" 
                width="100%" 
                height="100%"
                style="border: none;"
              />
            </body>
          </html>
        `);
      }
    }
  };
  
  // Download the PDF
  const downloadPdf = () => {
    if (pdfDataUrl) {
      // Use window.document to access the global document object
      const a = window.document.createElement('a');
      a.href = pdfDataUrl;
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
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check size={16} className="mr-1" />
              Approve
            </Button>
            <Button 
              onClick={() => updateStatus('rejected')} 
              disabled={loading}
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
            {pdfDataUrl ? (
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
                  <embed 
                    src={pdfDataUrl}
                    type="application/pdf"
                    className="w-full h-[600px] border rounded"
                  />
                </div>
                
                {/* Fallback for browsers that don't support embed */}
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
                <p className="text-gray-500">No preview available</p>
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
              />
            </div>
            
            <div className="mt-auto">
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}