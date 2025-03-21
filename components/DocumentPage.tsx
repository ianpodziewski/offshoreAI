"use client";

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { LoanDocument } from '@/utilities/loanDocumentStructure';
import { documentService } from '@/utilities/documentService';
import { formatDate, formatFileSize } from '@/utilities/formatUtils';
// Change to relative import if needed
import { getMimeTypeFromFilename } from '../utilities/documentUtils';

export default function DocumentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Try to get document ID from search params first, then from route params
  let documentId = searchParams?.get('id') || '';
  if (!documentId) {
    documentId = params?.documentId as string;
  }
  
  // Debug output
  console.log("Document ID:", documentId);
  console.log("Search params:", Object.fromEntries(searchParams?.entries() || []));
  console.log("Route params:", params);
  
  const [document, setDocument] = useState<LoanDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Handle document download
  const handleDownload = () => {
    if (!document) return;
    
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
  
  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        
        if (!documentId) {
          setError('Document ID is required');
          return;
        }
        
        const doc = await documentService.getDocumentById(documentId);
        
        if (!doc) {
          setError('Document not found');
          return;
        }
        
        setDocument(doc);
        
        // Generate preview URL for the document
        let url: string | null = null;
        
        // If document has fileData (base64)
        if (doc.fileData) {
          const mimeType = getMimeTypeFromFilename(doc.filename);
          url = `data:${mimeType};base64,${doc.fileData}`;
        }
        // If document has a fileUrl
        else if (doc.fileUrl) {
          url = doc.fileUrl;
        }
        
        setPreviewUrl(url);
      } catch (err) {
        console.error('Error loading document:', err);
        setError('Failed to load document. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDocument();
    
    // Clean up function to revoke blob URLs on unmount
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [documentId, previewUrl]);
  
  // Render document preview based on content and file type
  const renderDocumentPreview = () => {
    if (!document) return null;
    
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
    
    // For PDF files stored as base64
    if ((document.fileType === '.pdf' || document.filename.endsWith('.pdf')) && document.fileData) {
      const dataUrl = `data:application/pdf;base64,${document.fileData}`;
      return (
        <iframe
          title={document.filename}
          src={dataUrl}
          className="w-full h-full border-0"
        />
      );
    }
    
    // For image files stored as base64
    if ((document.fileType?.includes('image') || 
        ['.jpg', '.jpeg', '.png', '.gif'].includes(document.fileType || '') || 
        document.filename.match(/\.(jpg|jpeg|png|gif)$/i)) && 
        document.fileData) {
      const mimeType = document.fileType?.includes('image') 
        ? document.fileType 
        : `image/${document.fileType?.replace('.', '') || 'jpeg'}`;
      const dataUrl = `data:${mimeType};base64,${document.fileData}`;
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <img 
            src={dataUrl} 
            alt={document.filename} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }
    
    // Default preview message for unsupported file types
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
  
  // If we're still loading or there's an error, show appropriate messages
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-lg">
          <h2 className="font-bold mb-2">Error</h2>
          <p>{error || 'Document not found'}</p>
        </div>
      </div>
    );
  }
  
  // Main document display
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 truncate">
              {document.filename}
            </h1>
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
              onClick={() => window.close()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </header>
      
      {/* Document Content */}
      <main className="flex-1 p-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm h-[calc(100vh-140px)]">
          {renderDocumentPreview()}
        </div>
      </main>
    </div>
  );
}