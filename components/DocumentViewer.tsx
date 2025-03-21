import React, { useState, useEffect } from 'react';
import { LoanDocument } from '@/utilities/loanDocumentStructure';
import { formatDate, formatFileSize } from '@/utilities/formatUtils';
import { getDocumentPreviewUrl, revokeBlobUrl, getMimeTypeFromFilename } from '@/utilities/documentUtils';

interface DocumentViewerProps {
  document: LoanDocument;
  onClose: () => void;
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Generate preview URL when document changes
  useEffect(() => {
    // Get preview URL for the document
    const url = getDocumentPreviewUrl(document);
    setPreviewUrl(url);
    
    // Clean up function to revoke blob URLs when component unmounts
    return () => {
      if (previewUrl) {
        revokeBlobUrl(previewUrl);
      }
    };
  }, [document]);

  // Handle escape key to close viewer
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    
    // Set loading state to false after a brief delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
      clearTimeout(timer);
    };
  }, [onClose]);

  // Handle opening document in a new tab
  const handleOpenInNewTab = () => {
    // Use a simpler route with query parameters
    window.open(`/document-view?id=${document.id}&loanId=${document.loanId}`, '_blank');
    console.log("Opening document in new tab:", document.id);
  };

  // Handle document download
  const handleDownload = () => {
    let downloadUrl = previewUrl;
    
    // If we have base64 data but no URL yet
    if (!downloadUrl && document.fileData) {
      const mimeType = document.fileType?.includes('/') 
        ? document.fileType 
        : getMimeTypeFromFilename(document.fileType || document.filename);
      
      downloadUrl = `data:${mimeType};base64,${document.fileData}`;
    }
    
    if (downloadUrl) {
      // Create download link and trigger click
      const a = window.document.createElement('a');
      a.href = downloadUrl;
      a.download = document.filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    }
  };

  // Render document preview based on content and file type
  const renderDocumentPreview = () => {
    // If document has content, display it in an iframe
    if (document.content) {
      // Special case for HTML content
      if (document.fileType === '.html' || document.filename.endsWith('.html')) {
        return (
          <iframe
            title={document.filename}
            srcDoc={document.content}
            className="w-full h-full border-0"
            sandbox="allow-same-origin"
          />
        );
      }
      
      // For other content types, display as text
      return (
        <div className="w-full h-full overflow-auto p-4 bg-gray-50 text-gray-800 font-mono text-sm whitespace-pre-wrap">
          {document.content}
        </div>
      );
    }
    
    // Handle PDF files and other file types with preview URLs
    if (previewUrl) {
      return (
        <iframe
          title={document.filename}
          src={previewUrl}
          className="w-full h-full border-0"
        />
      );
    }
    
    // Default preview message for other file types
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <svg 
          className="w-16 h-16 text-gray-400 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        <p className="text-gray-600">
          Preview not available for this file type.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Please download the file to view its contents.
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-gray-800 truncate">
              {document.filename}
            </h2>
            <div className="flex flex-wrap mt-1">
              <span className="text-xs text-gray-500 mr-3 capitalize">
                {document.category}
              </span>
              <span className="text-xs text-gray-500 mr-3">
                {document.docType.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-gray-500 mr-3">
                Uploaded: {formatDate(document.dateUploaded)}
              </span>
              {document.fileSize && (
                <span className="text-xs text-gray-500">
                  Size: {formatFileSize(document.fileSize)}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        
        {/* Document Content */}
        <div className="flex-1 overflow-hidden relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            renderDocumentPreview()
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              Status: {document.status}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors flex items-center"
            >
              <svg 
                className="w-4 h-4 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                />
              </svg>
              Download
            </button>
            <button
              onClick={handleOpenInNewTab}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium transition-colors flex items-center"
            >
              <svg 
                className="w-4 h-4 mr-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                />
              </svg>
              Open in New Tab
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}