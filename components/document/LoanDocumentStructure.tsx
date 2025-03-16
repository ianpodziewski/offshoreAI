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
  Eye
} from 'lucide-react';
import { DOCUMENT_STRUCTURE, DocumentCategory } from '@/utilities/loanDocumentStructure';

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
    const docId = getDocumentId(docType);
    
    if (isUploaded && docId && onViewDocument) {
      return (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onViewDocument(docId)}
          className="text-gray-300 hover:text-white hover:bg-transparent"
        >
          <Eye className="h-5 w-5" />
          <span className="sr-only">View</span>
        </Button>
      );
    } else if (onUploadDocument) {
      return (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onUploadDocument(category, section, docType)}
          className="text-gray-300 hover:text-white hover:bg-transparent"
        >
          <Upload className="h-5 w-5" />
          <span className="sr-only">Upload</span>
        </Button>
      );
    }
    
    return null;
  };
  
  // Get the sections for the current category
  const getCategorySections = () => {
    // Type-safe access to DOCUMENT_STRUCTURE
    if (category === 'borrower') return DOCUMENT_STRUCTURE.borrower;
    if (category === 'property') return DOCUMENT_STRUCTURE.property;
    if (category === 'closing') return DOCUMENT_STRUCTURE.closing;
    if (category === 'servicing') return DOCUMENT_STRUCTURE.servicing;
    return {};
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
        {Object.entries(getCategorySections()).map(([sectionKey, sectionData]) => {
          const { title, documents } = sectionData as { 
            title: string; 
            documents: { docType: string; label: string; isRequired: boolean; }[] 
          };
          
          return (
            <div key={sectionKey} className="rounded-md overflow-hidden bg-[#111827] border border-gray-800">
              <div className="bg-[#0A0F1A] py-3 px-4 border-b border-gray-800">
                <h3 className="text-lg font-medium text-white">{title}</h3>
              </div>
              <div className="divide-y divide-gray-800">
                {documents.map((doc) => (
                  <div key={doc.docType} className="flex items-center justify-between px-4 py-3 hover:bg-[#1A2234] transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-200 mr-3">{doc.label}</span>
                      {renderStatusBadge(doc.docType, doc.isRequired)}
                    </div>
                    <div>
                      {renderDocumentAction(category, sectionKey, doc.docType)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 