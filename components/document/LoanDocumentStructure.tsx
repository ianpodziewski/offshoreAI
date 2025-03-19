'use client';

import React, { useState } from 'react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Upload, 
  Check, 
  X, 
  ChevronRight, 
  FolderOpen, 
  FileUp, 
  AlertCircle,
  Eye,
  Calendar,
  HardDrive,
  Trash2,
  Plus
} from 'lucide-react';
import { DOCUMENT_STRUCTURE, DocumentCategory, DocumentStatus } from '@/utilities/loanDocumentStructure';
import { formatFileSize } from '@/utilities/loanDocumentService';
import { StoplightChecklist } from './StoplightChecklist';

interface LoanDocumentStructureProps {
  loanId: string;
  loanType: string;
  uploadedDocuments?: any[];
  onUploadDocument?: (category: string, section: string, docType: string) => void;
  onViewDocument?: (documentId: string) => void;
  category?: DocumentCategory;
  onStatusChange?: (documentId: string, newStatus: DocumentStatus) => void;
}

export function LoanDocumentStructure({
  loanId,
  loanType,
  uploadedDocuments = [],
  onUploadDocument,
  onViewDocument,
  category = 'borrower',
  onStatusChange
}: LoanDocumentStructureProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [draggingDocType, setDraggingDocType] = useState<string | null>(null);
  
  // Toggle category expansion
  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };
  
  // Check if a document has been uploaded
  const isDocumentUploaded = (docType: string) => {
    // Check if there's at least one non-required document with this docType
    return uploadedDocuments.some(doc => doc.docType === docType && doc.status !== 'required');
  };
  
  // Get document status if uploaded
  const getDocumentStatus = (docType: string): DocumentStatus => {
    // Get the most recent document of this type
    const docs = uploadedDocuments.filter(doc => doc.docType === docType && doc.status !== 'required');
    if (docs.length > 0) {
      // Sort by date uploaded (most recent first)
      docs.sort((a, b) => new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime());
      return docs[0].status as DocumentStatus;
    }
    return 'required';
  };
  
  // Get document ID if uploaded
  const getDocumentId = (docType: string) => {
    // Get the most recent document of this type
    const docs = uploadedDocuments.filter(doc => doc.docType === docType && doc.status !== 'required');
    if (docs.length > 0) {
      // Sort by date uploaded (most recent first)
      docs.sort((a, b) => new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime());
      return docs[0].id;
    }
    return null;
  };
  
  // Get document if uploaded
  const getDocument = (docType: string) => {
    // Get the most recent document of this type
    const docs = uploadedDocuments.filter(doc => doc.docType === docType && doc.status !== 'required');
    if (docs.length > 0) {
      // Sort by date uploaded (most recent first)
      docs.sort((a, b) => new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime());
      return docs[0];
    }
    return null;
  };
  
  // Get all documents of a specific type
  const getAllDocumentsOfType = (docType: string) => {
    return uploadedDocuments.filter(doc => doc.docType === docType && doc.status !== 'required')
      .sort((a, b) => new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime());
  };
  
  // Delete document 
  const handleDeleteDocument = (e: React.MouseEvent, documentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete this document?")) {
      // Filter out the document with the given ID
      const updatedDocuments = uploadedDocuments.filter(doc => doc.id !== documentId);
      
      // Update the parent component with the new documents array
      if (onViewDocument) {
        // We're using onViewDocument as a handler to pass the ID to the parent
        // The parent component will need to handle the delete operation
        onViewDocument(`delete_${documentId}`);
      }
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Handle drag and drop functionality
  const handleDragOver = (e: React.DragEvent, docType: string) => {
    e.preventDefault();
    setDraggingDocType(docType);
  };
  
  const handleDragLeave = () => {
    setDraggingDocType(null);
  };
  
  const handleDrop = (e: React.DragEvent, docType: string, section: string) => {
    e.preventDefault();
    setDraggingDocType(null);
    
    // If there's an upload handler, call it
    if (onUploadDocument) {
      onUploadDocument(category, section, docType);
    }
  };
  
  // Open document in new tab
  const openDocumentInNewTab = (document: any) => {
    if (document) {
      // For HTML files
      if (document.filename.toLowerCase().endsWith('.html')) {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          // If the document has HTML content
          if (document.content) {
            newWindow.document.write(`
              <html>
                <head>
                  <title>${document.filename}</title>
                  <style>
                    body { 
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      padding: 20px;
                      max-width: 800px;
                      margin: 0 auto;
                    }
                    .document-header {
                      text-align: center;
                      margin-bottom: 30px;
                      border-bottom: 2px solid #1e5a9a;
                      padding-bottom: 20px;
                    }
                    .document-content {
                      padding: 20px;
                      background-color: white;
                    }
                  </style>
                </head>
                <body>
                  <div class="document-header">
                    <h1>${document.filename}</h1>
                  </div>
                  <div class="document-content">
                    ${document.content}
                  </div>
                </body>
              </html>
            `);
            newWindow.document.close(); // Important for some browsers
          } else {
            // If no content, show placeholder
            newWindow.document.write(`
              <html>
                <head>
                  <title>${document.filename}</title>
                </head>
                <body>
                  <div style="text-align: center; margin-top: 50px;">
                    <h1>${document.filename}</h1>
                    <p>This document could not be previewed.</p>
                  </div>
                </body>
              </html>
            `);
            newWindow.document.close();
          }
        }
        return;
      }
      
      // Check if this is a PDF or similar file type with base64 content
      if (document.fileType && (document.fileType.includes('pdf') || document.fileType.includes('application/'))) {
        // For PDF files, create an object URL and open it directly
        try {
          // The content is likely a base64 string, remove the data URI prefix if present
          let base64Content = document.content;
          if (base64Content && base64Content.includes('base64,')) {
            base64Content = base64Content.split('base64,')[1];
          }
          
          // Convert base64 to blob
          const byteCharacters = atob(base64Content);
          const byteArrays = [];
          
          for (let i = 0; i < byteCharacters.length; i += 512) {
            const slice = byteCharacters.slice(i, i + 512);
            
            const byteNumbers = new Array(slice.length);
            for (let j = 0; j < slice.length; j++) {
              byteNumbers[j] = slice.charCodeAt(j);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          
          const blob = new Blob(byteArrays, { type: document.fileType });
          const url = URL.createObjectURL(blob);
          
          // Open in a new tab
          window.open(url, '_blank');
        } catch (error) {
          console.error('Error displaying PDF:', error);
          // Fallback to a simple message if there's an error
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            newWindow.document.write(`
              <html>
                <head>
                  <title>${document.filename}</title>
                </head>
                <body>
                  <div style="text-align: center; margin-top: 50px;">
                    <h1>Unable to display PDF</h1>
                    <p>The PDF file could not be displayed. Please download the file instead.</p>
                  </div>
                </body>
              </html>
            `);
            newWindow.document.close();
          }
        }
      } else if (document.content) {
        // For other content, display as HTML
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${document.filename}</title>
                <style>
                  body { 
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                  }
                  .document-header {
                    text-align: center;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #1e5a9a;
                    padding-bottom: 20px;
                  }
                  .document-content {
                    padding: 20px;
                    background-color: white;
                  }
                </style>
              </head>
              <body>
                <div class="document-header">
                  <h1>${document.filename}</h1>
                </div>
                <div class="document-content">
                  ${document.content}
                </div>
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      } else {
        // If document has no content or is of an unknown type
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${document.filename}</title>
              </head>
              <body>
                <div style="text-align: center; margin-top: 50px;">
                  <h1>${document.filename}</h1>
                  <p>This document could not be previewed.</p>
                </div>
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      }
    }
  };
  
  // Handle status change from stoplight
  const handleStoplightStatusChange = (docType: string, newStatus: DocumentStatus) => {
    const document = getDocument(docType);
    if (document && onStatusChange) {
      onStatusChange(document.id, newStatus);
    }
  };
  
  // Render status badge
  const renderStatusBadge = (docType: string, isRequired: boolean) => {
    const status = getDocumentStatus(docType);
    
    switch(status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white text-xs font-medium px-2 py-0.5 rounded">Pending</Badge>;
      case 'received':
        return <Badge className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded">Received</Badge>;
      case 'reviewed':
        return <Badge className="bg-purple-500 text-white text-xs font-medium px-2 py-0.5 rounded">Reviewed</Badge>;
      default:
        return isRequired ? 
          <Badge className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded">Required</Badge> : 
          <Badge className="bg-gray-500 text-white text-xs font-medium px-2 py-0.5 rounded">Optional</Badge>;
    }
  };
  
  // Render document item
  const renderDocumentItem = (category: string, section: string, docType: string, label: string, isRequired: boolean) => {
    const isUploaded = isDocumentUploaded(docType);
    const document = getDocument(docType);
    const allDocuments = getAllDocumentsOfType(docType);
    const isDragging = draggingDocType === docType;
    const status = getDocumentStatus(docType);
    
    const handleHeaderClick = (e: React.MouseEvent) => {
      // Check if the click is coming from a stoplight element
      const target = e.target as HTMLElement;
      if (target.closest('.stoplight-container')) {
        return; // If clicking stoplight, do nothing
      }
      
      // Otherwise, trigger file upload
      if (onUploadDocument) {
        onUploadDocument(category, section, docType);
      }
    };
    
    return (
      <div key={docType} className="mb-4">
        {/* Document header - always shown */}
        <div 
          className={`bg-[#131B2E] border-gray-800 border rounded-t-lg transition-colors duration-200 hover:bg-[#1F2A42] ${isDragging ? 'border-blue-500 border-2' : ''} ${!isUploaded ? 'rounded-b-lg' : ''}`}
          onDragOver={(e) => handleDragOver(e, docType)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, docType, section)}
        >
          <div className="py-4 px-5 flex justify-between items-center">
            {/* Left side content - clickable for upload */}
            <div 
              className="flex items-center flex-1 cursor-pointer"
              onClick={(e) => handleHeaderClick(e)}
            >
              <h3 className="text-base text-white">{label}</h3>
              {isUploaded && (
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-blue-900/50 text-blue-300">
                  {allDocuments.length} file{allDocuments.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {/* Right side content - stoplight and add button */}
            <div className="flex items-center space-x-2">
              {isUploaded && (
                <div onClick={(e) => {
                  // Stop event propagation at this level
                  e.preventDefault();
                  e.stopPropagation();
                }}>
                  <StoplightChecklist 
                    docType={docType} 
                    status={status} 
                    onStatusChange={(newStatus) => handleStoplightStatusChange(docType, newStatus)}
                  />
                </div>
              )}
              {/* Add button - clickable for upload */}
              <div onClick={(e) => handleHeaderClick(e)} className="cursor-pointer">
                <Plus size={18} className="text-blue-500" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Document content - only shown if documents exist */}
        {isUploaded && (
          <div className="border border-t-0 border-gray-800 rounded-b-lg overflow-hidden">
            {allDocuments.map((doc, index) => (
              <div 
                key={doc.id} 
                className={`bg-[#070B15] p-3 transition-colors hover:bg-[#0A1020] ${index !== allDocuments.length - 1 ? 'border-b border-gray-800' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText size={16} className="text-blue-500 mr-2" />
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        // If it's an HTML file, open directly in a new tab
                        if (doc.filename.toLowerCase().endsWith('.html')) {
                          openDocumentInNewTab(doc);
                        } else if (onViewDocument) {
                          // Otherwise use the document viewer
                          onViewDocument(doc.id);
                        }
                      }}
                      className="text-blue-500 hover:underline font-medium"
                    >
                      {doc.filename}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <div className="text-xs text-gray-400 mr-3">
                      {formatDate(doc.dateUploaded)}
                    </div>
                    <button
                      onClick={(e) => handleDeleteDocument(e, doc.id)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-100/10"
                      title="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render document section
  const renderDocumentSection = (category: string, section: string, title: string, documents: any[]) => {
    return (
      <div key={section} className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3">{title}</h3>
        <div className="space-y-2">
          {documents.map(doc => renderDocumentItem(category, section, doc.docType, doc.label, doc.isRequired))}
        </div>
      </div>
    );
  };
  
  // Get category sections
  const getCategorySections = () => {
    // Type-safe access to DOCUMENT_STRUCTURE
    let categoryData;
    if (category === 'borrower') categoryData = DOCUMENT_STRUCTURE.borrower;
    else if (category === 'property') categoryData = DOCUMENT_STRUCTURE.property;
    else if (category === 'closing') categoryData = DOCUMENT_STRUCTURE.closing;
    else if (category === 'servicing') categoryData = DOCUMENT_STRUCTURE.servicing;
    else return null;
    
    return (
      <div className="space-y-6">
        {Object.entries(categoryData).map(([sectionKey, sectionData]: [string, any]) => {
          const { title, documents } = sectionData;
          
          if (!documents || documents.length === 0) {
            return null;
          }
          
          return renderDocumentSection(category, sectionKey, title, documents);
        })}
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      {getCategorySections()}
    </div>
  );
} 