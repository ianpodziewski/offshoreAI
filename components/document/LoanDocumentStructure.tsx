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
  AlertCircle 
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
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending Review</Badge>;
      case 'received':
        return <Badge className="bg-blue-500">Received</Badge>;
      case 'reviewed':
        return <Badge className="bg-purple-500">Reviewed</Badge>;
      default:
        return isRequired ? 
          <Badge className="bg-red-100 text-red-800">Required</Badge> : 
          <Badge className="bg-gray-100 text-gray-800">Optional</Badge>;
    }
  };
  
  // Render document action button
  const renderDocumentAction = (category: string, section: string, docType: string) => {
    const isUploaded = isDocumentUploaded(docType);
    const docId = getDocumentId(docType);
    
    if (isUploaded && docId && onViewDocument) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewDocument(docId)}
          className="ml-2"
        >
          <FileText className="h-4 w-4 mr-1" />
          View
        </Button>
      );
    } else if (onUploadDocument) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onUploadDocument(category, section, docType)}
          className="ml-2"
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload
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
        <Card>
          <CardHeader>
            <CardTitle>Loan Document Checklist</CardTitle>
            <CardDescription>
              Required and optional documents for {loanType.replace('_', ' ')} loans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">
              <div className="flex items-center mb-2">
                <Badge className="bg-red-100 text-red-800 mr-2">Required</Badge>
                <span>Documents that must be submitted for loan approval</span>
              </div>
              <div className="flex items-center">
                <Badge className="bg-gray-100 text-gray-800 mr-2">Optional</Badge>
                <span>Documents that may be required based on loan specifics</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Document Status</CardTitle>
            <CardDescription>
              Current status of your document submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <Badge className="bg-green-500 mr-2">Approved</Badge>
                <span>Document accepted</span>
              </div>
              <div className="flex items-center">
                <Badge className="bg-yellow-500 mr-2">Pending</Badge>
                <span>Under review</span>
              </div>
              <div className="flex items-center">
                <Badge className="bg-red-500 mr-2">Rejected</Badge>
                <span>Needs resubmission</span>
              </div>
              <div className="flex items-center">
                <Badge className="bg-blue-500 mr-2">Received</Badge>
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
            <Card key={sectionKey} className="overflow-hidden">
              <CardHeader className="bg-slate-50 py-3">
                <CardTitle className="text-md font-medium">{title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y">
                  {documents.map((doc) => (
                    <li key={doc.docType} className="flex items-center justify-between p-3 hover:bg-slate-50">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-slate-400" />
                        <span className="text-sm">{doc.label}</span>
                        <div className="ml-2">
                          {renderStatusBadge(doc.docType, doc.isRequired)}
                        </div>
                      </div>
                      <div>
                        {renderDocumentAction(category, sectionKey, doc.docType)}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 