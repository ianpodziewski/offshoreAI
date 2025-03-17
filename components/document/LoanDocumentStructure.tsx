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
  
  // Render document action button
  const renderDocumentAction = (category: string, section: string, docType: string) => {
    const isUploaded = isDocumentUploaded(docType);
    const documentId = getDocumentId(docType);
    
    if (isUploaded && documentId) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-blue-500 border-blue-500 hover:bg-blue-100 hover:text-blue-700"
          onClick={() => onViewDocument && onViewDocument(documentId)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      );
    }
    
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="text-green-500 border-green-500 hover:bg-green-100 hover:text-green-700"
        onClick={() => onUploadDocument && onUploadDocument(category, section, docType)}
      >
        <Upload className="h-4 w-4 mr-1" />
        Upload
      </Button>
    );
  };
  
  // Render document item
  const renderDocumentItem = (category: string, section: string, docType: string, label: string, isRequired: boolean) => {
    const isUploaded = isDocumentUploaded(docType);
    const document = getDocument(docType);
    
    return (
      <div key={docType} className="flex items-start justify-between py-3 border-b border-gray-700 relative">
        {isUploaded && document && (
          <div className="absolute -rotate-12 opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="border-2 border-red-500 text-red-500 font-bold text-xl px-4 py-1 rounded">
              SAMPLE
            </div>
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-sm text-gray-200">{label}</span>
            <div className="ml-2">
              {renderStatusBadge(docType, isRequired)}
            </div>
          </div>
          
          {isUploaded && document && (
            <div className="mt-1 ml-6 text-xs text-gray-400 flex flex-col space-y-1">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Uploaded: {formatDate(document.dateUploaded)}</span>
              </div>
              {document.fileSize && (
                <div className="flex items-center">
                  <HardDrive className="h-3 w-3 mr-1" />
                  <span>Size: {formatFileSize(document.fileSize)}</span>
                </div>
              )}
              {document.notes && (
                <div className="mt-1">
                  <span>Notes: {document.notes}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="z-10">
          {renderDocumentAction(category, section, docType)}
        </div>
      </div>
    );
  };
  
  // Render document section
  const renderDocumentSection = (category: string, section: string, title: string, documents: any[]) => {
    return (
      <div key={section} className="mb-6">
        <h3 className="text-lg font-medium text-white mb-3">{title}</h3>
        <div className="bg-[#141b2d] rounded-lg border border-gray-800 p-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-[#1A2234] border-gray-800">
          <CardHeader className="border-b border-gray-800 bg-[#0A0F1A]">
            <CardTitle className="text-white">Loan Document Checklist</CardTitle>
            <CardDescription className="text-gray-400">
              Required and optional documents for {loanType.replace('_', ' ')} loans
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-sm text-gray-300 mb-4">
              <div className="flex items-center mb-2">
                <Badge className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded mr-2">Required</Badge>
                <span>Documents that must be submitted for loan approval</span>
              </div>
              <div className="flex items-center">
                <Badge className="bg-gray-500 text-white text-xs font-medium px-2 py-0.5 rounded mr-2">Optional</Badge>
                <span>Documents that may be required based on loan specifics</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1A2234] border-gray-800">
          <CardHeader className="border-b border-gray-800 bg-[#0A0F1A]">
            <CardTitle className="text-white">Document Status</CardTitle>
            <CardDescription className="text-gray-400">
              Current status of your document submissions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
              <div className="flex items-center">
                <Badge className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded mr-2">Approved</Badge>
                <span>Document accepted</span>
              </div>
              <div className="flex items-center">
                <Badge className="bg-yellow-500 text-white text-xs font-medium px-2 py-0.5 rounded mr-2">Pending</Badge>
                <span>Under review</span>
              </div>
              <div className="flex items-center">
                <Badge className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded mr-2">Rejected</Badge>
                <span>Needs resubmission</span>
              </div>
              <div className="flex items-center">
                <Badge className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded mr-2">Received</Badge>
                <span>Document received</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        {getCategorySections()}
      </div>
    </div>
  );
} 