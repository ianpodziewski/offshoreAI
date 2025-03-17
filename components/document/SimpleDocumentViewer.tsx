// components/document/SimpleDocumentViewer.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SimpleDocument, simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import { X, CheckCircle, XCircle, AlignJustify, Download, Printer } from 'lucide-react';

interface SimpleDocumentViewerProps {
  document: SimpleDocument;
  onClose: () => void;
  onStatusChange?: () => void;
  onDelete?: () => void;
}

// Import any necessary CSS
import '@/styles/document-styles.css';

const SimpleDocumentViewer: React.FC<SimpleDocumentViewerProps> = ({
  document,
  onClose,
  onStatusChange,
  onDelete
}) => {
  const [currentStatus, setCurrentStatus] = useState<string>(document.status);
  const [notes, setNotes] = useState<string>(document.notes || '');
  const [isHtmlContent, setIsHtmlContent] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Determine if the document is HTML or PDF content
  useEffect(() => {
    // Check if content is HTML or if fileType indicates HTML
    if (
      document.fileType === 'text/html' || 
      document.filename.endsWith('.html') || 
      document.content.trim().startsWith('<')
    ) {
      setIsHtmlContent(true);
    } else {
      // For PDF content, use the content as URL if it's already a data URL
      if (document.content.startsWith('data:application/pdf')) {
        setPdfUrl(document.content);
      } else {
        // Otherwise, assume it's base64 and create a data URL
        try {
          setPdfUrl(`data:application/pdf;base64,${document.content}`);
        } catch (error) {
          console.error('Error creating PDF URL:', error);
        }
      }
    }
  }, [document]);

  const updateDocumentStatus = (status: 'pending' | 'approved' | 'rejected') => {
    simpleDocumentService.updateDocumentStatus(document.id, status, notes);
    setCurrentStatus(status);
    if (onStatusChange) onStatusChange();
  };

  const deleteDocument = () => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      simpleDocumentService.deleteDocument(document.id);
      if (onDelete) onDelete();
    }
  };

  const printDocument = () => {
    if (isHtmlContent) {
      // For HTML content, open a new window and print the HTML
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${document.filename}</title>
              <style>
                /* Basic print styles */
                @media print {
                  body {
                    font-family: 'Times New Roman', Times, serif;
                    margin: 0;
                    padding: 0;
                  }
                  
                  .document {
                    margin: 0;
                    padding: 0;
                  }
                  
                  .watermark {
                    display: block !important;
                  }
                  
                  @page {
                    margin: 0.5in;
                  }
                }
              </style>
            </head>
            <body>
              ${document.content}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    } else if (pdfUrl) {
      // For PDF content, create a link to download and print
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={(e) => {
        // Only close if clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
        e.stopPropagation();
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <div className="relative">
            <h2 className="text-xl font-semibold">{document.filename}</h2>
            {document.filename.startsWith('SAMPLE_') && (
              <span className="absolute -top-1 -right-1 text-xs text-red-500 font-bold border border-red-500 px-1 rotate-[-10deg] opacity-80">
                SAMPLE
              </span>
            )}
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Document Content */}
        <div className="flex-grow overflow-auto p-1 bg-gray-100 relative">
          {document.filename.startsWith('SAMPLE_') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="border-4 border-red-500 text-red-500 text-5xl font-bold px-8 py-4 rotate-[-30deg] opacity-20">
                SAMPLE
              </div>
            </div>
          )}
          {isHtmlContent ? (
            // Render HTML content directly
            <div className="h-full bg-white shadow-md rounded">
              <div 
                className="document-container h-full"
                dangerouslySetInnerHTML={{ __html: document.content }}
              />
            </div>
          ) : (
            // For PDF content
            pdfUrl ? (
              <iframe 
                src={pdfUrl} 
                className="w-full h-full border-0"
                title={document.filename}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Unable to display document content</p>
              </div>
            )
          )}
        </div>
        
        {/* Footer with Actions */}
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">Document Status</p>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={currentStatus === 'pending' ? 'default' : 'outline'}
                  onClick={() => updateDocumentStatus('pending')}
                  className="flex items-center gap-1"
                >
                  <AlignJustify size={16} />
                  <span>Pending</span>
                </Button>
                
                <Button
                  type="button"
                  variant={currentStatus === 'approved' ? 'default' : 'outline'}
                  onClick={() => updateDocumentStatus('approved')}
                  className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle size={16} />
                  <span>Approve</span>
                </Button>
                
                <Button
                  type="button"
                  variant={currentStatus === 'rejected' ? 'default' : 'outline'}
                  onClick={() => updateDocumentStatus('rejected')}
                  className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle size={16} />
                  <span>Reject</span>
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 items-center">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-1"
                onClick={printDocument}
              >
                <Printer size={16} />
                <span>Print</span>
              </Button>
              
              {onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={deleteDocument}
                  className="flex items-center gap-1"
                >
                  <X size={16} />
                  <span>Delete</span>
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <label className="text-sm font-medium block mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm"
              rows={2}
              placeholder="Add notes about this document..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDocumentViewer;