'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Upload, 
  FolderOpen, 
  CheckCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { LoanDocumentStructure } from '@/components/document/LoanDocumentStructure';
import { DocumentUploader } from '@/components/document/DocumentUploader';
import { loanDocumentService } from '@/utilities/loanDocumentService';
import { DocumentCategory, LoanDocument } from '@/utilities/loanDocumentStructure';
import { loanDatabase } from '@/utilities/loanDatabase';

export default function LoanDocumentsPage() {
  const params = useParams();
  const loanId = params.loanId as string;
  
  const [loan, setLoan] = useState<any>(null);
  const [documents, setDocuments] = useState<LoanDocument[]>([]);
  const [completionStatus, setCompletionStatus] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<DocumentCategory>('borrower');
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [uploadConfig, setUploadConfig] = useState<{
    category?: DocumentCategory;
    section?: string;
    docType?: string;
  }>({});
  
  // Load loan data
  useEffect(() => {
    if (loanId) {
      const loanData = loanDatabase.getLoanById(loanId);
      if (loanData) {
        setLoan(loanData);
      }
    }
  }, [loanId]);
  
  // Load documents
  useEffect(() => {
    if (loanId) {
      const docs = loanDocumentService.getDocumentsForLoan(loanId);
      setDocuments(docs);
      
      if (loan?.loanType) {
        const status = loanDocumentService.getDocumentCompletionStatus(loanId, loan.loanType);
        setCompletionStatus(status);
      }
    }
  }, [loanId, loan]);
  
  // Initialize documents if none exist
  useEffect(() => {
    if (loanId && loan?.loanType && documents.length === 0) {
      const placeholderDocs = loanDocumentService.initializeDocumentsForLoan(loanId, loan.loanType);
      setDocuments(placeholderDocs);
      
      const status = loanDocumentService.getDocumentCompletionStatus(loanId, loan.loanType);
      setCompletionStatus(status);
    }
  }, [loanId, loan, documents]);
  
  // Handle document upload
  const handleUploadDocument = (category: string, section: string, docType: string) => {
    setUploadConfig({
      category: category as DocumentCategory,
      section,
      docType
    });
    setIsUploaderOpen(true);
  };
  
  // Handle document view
  const handleViewDocument = (documentId: string) => {
    // Implement document viewing logic
    console.log('View document:', documentId);
  };
  
  // Handle document upload completion
  const handleDocumentUploaded = (document: any) => {
    const newDoc = loanDocumentService.addDocument(document);
    setDocuments([...documents, newDoc]);
    
    // Update completion status
    if (loan?.loanType) {
      const status = loanDocumentService.getDocumentCompletionStatus(loanId, loan.loanType);
      setCompletionStatus(status);
    }
  };
  
  // Render loading state
  if (!loan) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loan Documents</h1>
          <p className="text-muted-foreground">
            Manage documents for loan {loan.id} - {loan.propertyAddress}
          </p>
        </div>
        <Button onClick={() => setIsUploaderOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
      
      {/* Document Completion Status */}
      {completionStatus && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{completionStatus.completed} of {completionStatus.total} documents</span>
                  <span className="font-medium">{completionStatus.percentage}%</span>
                </div>
                <Progress value={completionStatus.percentage} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          {Object.entries(completionStatus.byCategory).map(([category, data]: [string, any]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg capitalize">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{data.completed} of {data.total}</span>
                    <span className="font-medium">{data.percentage}%</span>
                  </div>
                  <Progress value={data.percentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Document Tabs */}
      <Tabs defaultValue="borrower" onValueChange={(value) => setActiveTab(value as DocumentCategory)}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="borrower" className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Borrower
          </TabsTrigger>
          <TabsTrigger value="property" className="flex items-center">
            <FolderOpen className="h-4 w-4 mr-2" />
            Property
          </TabsTrigger>
          <TabsTrigger value="closing" className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Closing
          </TabsTrigger>
          <TabsTrigger value="servicing" className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Servicing
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="borrower">
          <LoanDocumentStructure
            loanId={loanId}
            loanType={loan.loanType}
            uploadedDocuments={documents}
            onUploadDocument={handleUploadDocument}
            onViewDocument={handleViewDocument}
          />
        </TabsContent>
        
        <TabsContent value="property">
          <LoanDocumentStructure
            loanId={loanId}
            loanType={loan.loanType}
            uploadedDocuments={documents}
            onUploadDocument={handleUploadDocument}
            onViewDocument={handleViewDocument}
          />
        </TabsContent>
        
        <TabsContent value="closing">
          <LoanDocumentStructure
            loanId={loanId}
            loanType={loan.loanType}
            uploadedDocuments={documents}
            onUploadDocument={handleUploadDocument}
            onViewDocument={handleViewDocument}
          />
        </TabsContent>
        
        <TabsContent value="servicing">
          <LoanDocumentStructure
            loanId={loanId}
            loanType={loan.loanType}
            uploadedDocuments={documents}
            onUploadDocument={handleUploadDocument}
            onViewDocument={handleViewDocument}
          />
        </TabsContent>
      </Tabs>
      
      {/* Document Uploader Dialog */}
      <DocumentUploader
        loanId={loanId}
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onUpload={handleDocumentUploaded}
        category={uploadConfig.category}
        section={uploadConfig.section}
        docType={uploadConfig.docType}
      />
    </div>
  );
} 