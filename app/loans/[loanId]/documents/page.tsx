'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { LoanDocumentStructure } from '@/components/document/LoanDocumentStructure';
import { DocumentUploader } from '@/components/document/DocumentUploader';
import { loanDocumentService } from '@/utilities/loanDocumentService';
import { DocumentCategory, LoanDocument } from '@/utilities/loanDocumentStructure';
import { loanDatabase } from '@/utilities/loanDatabase';
import LayoutWrapper from '@/app/layout-wrapper';
import LoanSidebar from '@/components/loan/LoanSidebar';

export default function LoanDocumentsPage() {
  const params = useParams();
  const router = useRouter();
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
  
  // Filter documents by category
  const getFilteredDocuments = (category: DocumentCategory) => {
    return documents.filter(doc => doc.category === category);
  };
  
  // Render loading state
  if (!loan) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </LayoutWrapper>
    );
  }
  
  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/loans/${loanId}`)}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Loan Overview
          </button>
          <h1 className="text-3xl font-bold mt-4 text-white">
            {loan.borrowerName}'s Loan Documents
          </h1>
          <p className="text-muted-foreground">
            Manage documents for loan {loan.id} - {loan.propertyAddress}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <LoanSidebar loan={loan} activePage="documents" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">Document Management</h2>
              </div>
              <Button onClick={() => setIsUploaderOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
            
            {/* Document Completion Status */}
            {completionStatus && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-[#1A2234] border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-white">Overall Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-300">
                        <span>{completionStatus.completed} of {completionStatus.total} documents</span>
                        <span className="font-medium">{completionStatus.percentage}%</span>
                      </div>
                      <Progress value={completionStatus.percentage} className="h-2 bg-gray-700" />
                    </div>
                  </CardContent>
                </Card>
                
                {Object.entries(completionStatus.byCategory).map(([category, data]: [string, any]) => (
                  <Card key={category} className="bg-[#1A2234] border-gray-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg capitalize text-white">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>{data.completed} of {data.total}</span>
                          <span className="font-medium">{data.percentage}%</span>
                        </div>
                        <Progress value={data.percentage} className="h-2 bg-gray-700" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Document Tabs */}
            <Tabs 
              defaultValue="borrower" 
              onValueChange={(value) => setActiveTab(value as DocumentCategory)}
              className="bg-[#1A2234] p-4 rounded-lg border border-gray-800"
            >
              <TabsList className="grid grid-cols-4 mb-4 bg-[#0A0F1A]">
                <TabsTrigger value="borrower" className="flex items-center data-[state=active]:bg-blue-900/40 data-[state=active]:text-blue-300">
                  <FileText className="h-4 w-4 mr-2" />
                  Borrower
                </TabsTrigger>
                <TabsTrigger value="property" className="flex items-center data-[state=active]:bg-blue-900/40 data-[state=active]:text-blue-300">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Property
                </TabsTrigger>
                <TabsTrigger value="closing" className="flex items-center data-[state=active]:bg-blue-900/40 data-[state=active]:text-blue-300">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Closing
                </TabsTrigger>
                <TabsTrigger value="servicing" className="flex items-center data-[state=active]:bg-blue-900/40 data-[state=active]:text-blue-300">
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
                  category="borrower"
                />
              </TabsContent>
              
              <TabsContent value="property">
                <LoanDocumentStructure
                  loanId={loanId}
                  loanType={loan.loanType}
                  uploadedDocuments={documents}
                  onUploadDocument={handleUploadDocument}
                  onViewDocument={handleViewDocument}
                  category="property"
                />
              </TabsContent>
              
              <TabsContent value="closing">
                <LoanDocumentStructure
                  loanId={loanId}
                  loanType={loan.loanType}
                  uploadedDocuments={documents}
                  onUploadDocument={handleUploadDocument}
                  onViewDocument={handleViewDocument}
                  category="closing"
                />
              </TabsContent>
              
              <TabsContent value="servicing">
                <LoanDocumentStructure
                  loanId={loanId}
                  loanType={loan.loanType}
                  uploadedDocuments={documents}
                  onUploadDocument={handleUploadDocument}
                  onViewDocument={handleViewDocument}
                  category="servicing"
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
        </div>
      </div>
    </LayoutWrapper>
  );
} 