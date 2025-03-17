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
  ArrowLeft,
  X
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
  const [selectedDocument, setSelectedDocument] = useState<LoanDocument | null>(null);
  
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
    const document = documents.find(doc => doc.id === documentId);
    if (document) {
      setSelectedDocument(document);
    }
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
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/loans/${loanId}`)}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Loan Overview
          </button>
          <h1 className="text-3xl font-bold mt-4 text-white">
            #{loanId}
          </h1>
          <p className="text-lg mt-1 text-gray-400">
            {loan.propertyAddress}
          </p>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-6">
          {/* Main Content */}
          <div className="w-full lg:w-3/4 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">Document Management</h2>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => {
                    const fakeDocuments = loanDocumentService.generateFakeDocuments(loanId, loan.loanType);
                    if (fakeDocuments.length > 0) {
                      setDocuments([...documents, ...fakeDocuments]);
                      
                      // Update completion status
                      if (loan?.loanType) {
                        const status = loanDocumentService.getDocumentCompletionStatus(loanId, loan.loanType);
                        setCompletionStatus(status);
                      }
                    }
                  }} 
                  className="bg-green-600 hover:bg-green-700"
                  title="Generate sample documents for this loan"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Sample Documents
                </Button>
                <Button 
                  onClick={() => {
                    const totalGenerated = loanDocumentService.generateFakeDocumentsForAllLoans();
                    alert(`Generated ${totalGenerated} sample documents across all loans.`);
                    
                    // Refresh documents for current loan
                    const docs = loanDocumentService.getDocumentsForLoan(loanId);
                    setDocuments(docs);
                    
                    // Update completion status
                    if (loan?.loanType) {
                      const status = loanDocumentService.getDocumentCompletionStatus(loanId, loan.loanType);
                      setCompletionStatus(status);
                    }
                  }} 
                  className="bg-purple-600 hover:bg-purple-700"
                  title="Generate sample documents for all loans in the system"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate For All Loans
                </Button>
                <Button onClick={() => setIsUploaderOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </div>
            
            {/* Document Completion Status */}
            {completionStatus && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
              <div className="flex justify-center mb-4">
                <TabsList className="grid grid-cols-4 bg-[#0A0F1A] p-0 rounded-lg">
                  <TabsTrigger 
                    value="borrower" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Borrower
                  </TabsTrigger>
                  <TabsTrigger 
                    value="property" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Property
                  </TabsTrigger>
                  <TabsTrigger 
                    value="closing" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Closing
                  </TabsTrigger>
                  <TabsTrigger 
                    value="servicing" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Servicing
                  </TabsTrigger>
                </TabsList>
              </div>
              
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
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <LoanSidebar loan={loan} activePage="documents" />
          </div>
        </div>
        
        {/* Document Uploader Modal */}
        {isUploaderOpen && (
          <DocumentUploader
            loanId={loanId}
            isOpen={isUploaderOpen}
            category={uploadConfig.category}
            section={uploadConfig.section}
            docType={uploadConfig.docType}
            onClose={() => setIsUploaderOpen(false)}
            onUpload={handleDocumentUploaded}
          />
        )}
        
        {/* Document Viewer Modal */}
        {selectedDocument && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b flex justify-between items-center">
                <div className="relative">
                  <h2 className="text-xl font-semibold">{selectedDocument.filename}</h2>
                  {selectedDocument.filename.startsWith('SAMPLE_') && (
                    <span className="absolute -top-1 -right-1 text-xs text-red-500 font-bold border border-red-500 px-1 rotate-[-10deg] opacity-80">
                      SAMPLE
                    </span>
                  )}
                </div>
                <button 
                  onClick={() => setSelectedDocument(null)}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Document Content */}
              <div className="flex-grow overflow-auto p-1 bg-gray-100 relative">
                {selectedDocument.filename.startsWith('SAMPLE_') && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="border-4 border-red-500 text-red-500 text-5xl font-bold px-8 py-4 rotate-[-30deg] opacity-20">
                      SAMPLE
                    </div>
                  </div>
                )}
                <div className="h-full bg-white shadow-md rounded p-4">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText size={64} className="mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Document Preview</h3>
                      <p className="text-gray-500 mb-4">
                        This is a sample document for demonstration purposes.
                      </p>
                      <p className="text-sm text-gray-400">
                        Filename: {selectedDocument.filename}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t">
                <Button 
                  onClick={() => setSelectedDocument(null)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
} 