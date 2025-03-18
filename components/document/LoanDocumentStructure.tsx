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
  HardDrive
} from 'lucide-react';
import { DOCUMENT_STRUCTURE, DocumentCategory } from '@/utilities/loanDocumentStructure';
import { formatFileSize } from '@/utilities/loanDocumentService';

interface LoanDocumentStructureProps {
  loanId: string;
  loanType: string;
  uploadedDocuments?: any[];
  onUploadDocument?: (category: string, section: string, docType: string) => void;
  onViewDocument?: (documentId: string) => void;
  category?: DocumentCategory;
}

export function LoanDocumentStructure({
  loanId,
  loanType,
  uploadedDocuments = [],
  onUploadDocument,
  onViewDocument,
  category = 'borrower'
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
    return uploadedDocuments.some(doc => doc.docType === docType);
  };
  
  // Get document status if uploaded
  const getDocumentStatus = (docType: string) => {
    const doc = uploadedDocuments.find(doc => doc.docType === docType);
    return doc ? doc.status : 'required';
  };
  
  // Get document ID if uploaded
  const getDocumentId = (docType: string) => {
    const doc = uploadedDocuments.find(doc => doc.docType === docType);
    return doc ? doc.id : null;
  };
  
  // Get document if uploaded
  const getDocument = (docType: string) => {
    return uploadedDocuments.find(doc => doc.docType === docType);
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
    if (document && document.content) {
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
      }
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
    const isDragging = draggingDocType === docType;
    
    const handleHeaderClick = () => {
      // Always trigger file upload when clicking the header, regardless of whether a document exists
      if (onUploadDocument) {
        onUploadDocument(category, section, docType);
      }
    };
    
    return (
      <div key={docType} className="mb-4">
        <div 
          className={`bg-[#131B2E] border-gray-800 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-[#1F2A42] ${isDragging ? 'border-blue-500 border-2' : 'border'} ${!isUploaded ? 'rounded-b-lg' : 'rounded-b-none'}`}
          onClick={handleHeaderClick}
          onDragOver={(e) => handleDragOver(e, docType)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, docType, section)}
        >
          <div className="py-4 px-5">
            <h3 className="text-base text-white">{label}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {isUploaded ? "Click to replace file" : "Click to upload or drag and drop"}
            </p>
          </div>
        </div>
        
        {isUploaded && document && (
          <div className="bg-[#070B15] border border-t-0 border-gray-800 rounded-b-lg py-4 px-5">
            <div className="flex justify-between items-center">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  openDocumentInNewTab(document);
                }}
                className="text-blue-500 hover:underline font-medium"
              >
                {document.filename}
              </a>
              <div className="text-xs text-gray-400">
                {formatDate(document.dateUploaded)}
              </div>
            </div>
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