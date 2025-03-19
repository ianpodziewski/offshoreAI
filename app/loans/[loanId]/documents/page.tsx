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
import { DocumentCategory, LoanDocument, DocumentStatus } from '@/utilities/loanDocumentStructure';
import { loanDatabase } from '@/utilities/loanDatabase';
import LayoutWrapper from '@/app/layout-wrapper';
import LoanSidebar from '@/components/loan/LoanSidebar';

// Global styles for document viewer
const documentViewerStyles = `
  .document-content .document {
    font-family: Arial, sans-serif;
    color: #333;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    padding: 30px;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    border-radius: 8px;
  }
  .document-content .document-header {
    text-align: center;
    margin-bottom: 30px;
    border-bottom: 2px solid #1e5a9a;
    padding-bottom: 20px;
  }
  .document-content .document-title {
    font-size: 24px;
    font-weight: bold;
    color: #1e5a9a;
    margin-bottom: 8px;
  }
  .document-content .document-subtitle {
    color: #666;
    font-size: 15px;
  }
  .document-content .document-section {
    margin-bottom: 25px;
  }
  .document-content .section-title {
    font-size: 18px;
    font-weight: bold;
    color: #1e5a9a;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 1px solid #eee;
  }
  .document-content .signature-section {
    margin-top: 40px;
  }
  .document-content .signature-line {
    border-bottom: 1px solid #999;
    width: 250px;
    display: inline-block;
    margin-top: 30px;
  }
  .document-content table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  .document-content th, .document-content td {
    padding: 10px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  .document-content th {
    background-color: #f8f9fa;
    font-weight: bold;
    width: 35%;
  }
  .document-content td {
    width: 65%;
  }
  .document-content .info-table {
    border: 1px solid #eee;
    border-radius: 4px;
    overflow: hidden;
  }
`;

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
    // Check if this is a delete action
    if (documentId.startsWith('delete_')) {
      const idToDelete = documentId.replace('delete_', '');
      
      // Use the loanDocumentService to delete the document
      const success = loanDocumentService.deleteDocument(idToDelete);
      
      if (success) {
        // Filter out the document with this ID from the local state
        const updatedDocuments = documents.filter(doc => doc.id !== idToDelete);
        setDocuments(updatedDocuments);
        
        // Update completion status
        if (loan?.loanType) {
          const status = loanDocumentService.getDocumentCompletionStatus(loanId, loan.loanType);
          setCompletionStatus(status);
        }
      }
      
      return;
    }
    
    // Regular view document action
    const document = documents.find(doc => doc.id === documentId);
    if (document) {
      setSelectedDocument(document);
    }
  };
  
  // Handle document upload completion
  const handleDocumentUploaded = (document: any) => {
    console.log('Document to be uploaded:', document);
    
    // Create document with the required structure
    const newDoc = loanDocumentService.addDocument({
      ...document,
      // Make sure the status is set to 'pending' for a newly uploaded document
      status: 'pending',
      // Set the file upload date to now
      dateUploaded: new Date().toISOString(),
      // Make sure we have the correct subsection field 
      subsection: document.section || '',
      // For PDFs, we might not have content rendered, so we'll store the base64 data
      content: document.content || '',
      // Default to required if not specified
      isRequired: document.isRequired ?? true
    });
    
    console.log('Document after processing:', newDoc);
    console.log('Current documents:', documents);

    // Add the new document to the existing documents array
    const updatedDocuments = [...documents, newDoc];
    setDocuments(updatedDocuments);
    
    console.log('Updated documents list:', updatedDocuments);
    
    // Update completion status
    if (loan?.loanType) {
      const status = loanDocumentService.getDocumentCompletionStatus(loanId, loan.loanType);
      setCompletionStatus(status);
    }
  };
  
  // Handle document status change
  const handleDocumentStatusChange = async (documentId: string, newStatus: string) => {
    // Update UI first for responsiveness
    const updatedDocuments = documents.map(doc => {
      if (doc.id === documentId) {
        return {
          ...doc,
          status: newStatus as DocumentStatus
        };
      }
      return doc;
    });
    
    // Update state
    setDocuments(updatedDocuments as LoanDocument[]);
    
    try {
      // Update document in the database
      await loanDocumentService.updateDocumentStatus(documentId, newStatus as DocumentStatus);
      
      // Update completion status
      if (loan?.loanType) {
        const status = loanDocumentService.getDocumentCompletionStatus(loanId, loan.loanType);
        setCompletionStatus(status);
      }
    } catch (error) {
      console.error('Error updating document status:', error);
      // Revert UI state if update failed
      setDocuments(documents);
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
      <style jsx global>{documentViewerStyles}</style>
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
                {/* Removing the Document Management text as requested */}
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
                  className="bg-[#1A2234] hover:bg-[#1A2234]/90 border border-gray-800 text-white"
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
                  className="bg-[#1A2234] hover:bg-[#1A2234]/90 border border-gray-800 text-white"
                  title="Generate sample documents for all loans in the system"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate For All Loans
                </Button>
                <Button onClick={() => setIsUploaderOpen(true)} className="bg-[#1A2234] hover:bg-[#1A2234]/90 border border-gray-800 text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Add Document
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
                
                {Object.entries(completionStatus.byCategory)
                  .filter(([category]) => category !== 'misc') // Filter out the Miscellaneous card
                  .map(([category, data]: [string, any]) => (
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
                <TabsList className="grid grid-cols-4 bg-[#0A0F1A] p-1 rounded-lg h-[52px] w-full max-w-3xl">
                  <TabsTrigger 
                    value="borrower" 
                    className="text-base px-4 py-2 rounded-md data-[state=active]:bg-[#243156] data-[state=active]:text-blue-300 data-[state=active]:shadow-none transition-all h-full flex items-center justify-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Borrower
                  </TabsTrigger>
                  <TabsTrigger 
                    value="property" 
                    className="text-base px-4 py-2 rounded-md data-[state=active]:bg-[#243156] data-[state=active]:text-blue-300 data-[state=active]:shadow-none transition-all h-full flex items-center justify-center"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Property
                  </TabsTrigger>
                  <TabsTrigger 
                    value="closing" 
                    className="text-base px-4 py-2 rounded-md data-[state=active]:bg-[#243156] data-[state=active]:text-blue-300 data-[state=active]:shadow-none transition-all h-full flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Closing
                  </TabsTrigger>
                  <TabsTrigger 
                    value="servicing" 
                    className="text-base px-4 py-2 rounded-md data-[state=active]:bg-[#243156] data-[state=active]:text-blue-300 data-[state=active]:shadow-none transition-all h-full flex items-center justify-center"
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
                  onStatusChange={handleDocumentStatusChange}
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
                  onStatusChange={handleDocumentStatusChange}
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
                  onStatusChange={handleDocumentStatusChange}
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
                  onStatusChange={handleDocumentStatusChange}
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
                  <h2 className="text-xl font-semibold">{selectedDocument.docType.replace(/_/g, ' ')}</h2>
                </div>
                <button 
                  onClick={() => setSelectedDocument(null)}
                  className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* File Info Section */}
              <div className="px-4 py-3 bg-gray-50 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        // Open in new tab logic - only open in new tab, don't do anything else
                        const newWindow = window.open('', '_blank');
                        if (newWindow) {
                          newWindow.document.write(`
                            <html>
                              <head>
                                <title>${selectedDocument.filename}</title>
                                <style>${documentViewerStyles}</style>
                              </head>
                              <body class="document-content">
                                ${selectedDocument.content || `
                                  <div style="text-align: center; padding: 50px;">
                                    <h1>${selectedDocument.filename}</h1>
                                    <p>Document preview</p>
                                  </div>
                                `}
                              </body>
                            </html>
                          `);
                        }
                      }}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {selectedDocument.filename}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{new Date(selectedDocument.dateUploaded).toLocaleDateString()}</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {selectedDocument.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Document Content */}
              <div className="flex-grow overflow-auto p-2 bg-gray-100 relative">
                {selectedDocument.filename.startsWith('SAMPLE_') && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="border-4 border-red-500 text-red-500 text-6xl font-bold px-10 py-5 rotate-[-30deg] opacity-20 rounded-lg">
                      SAMPLE
                    </div>
                  </div>
                )}
                <div className="h-full bg-white shadow-md rounded p-5">
                  {selectedDocument.content ? (
                    <div 
                      className="document-content h-full overflow-auto"
                      style={{ maxHeight: 'calc(80vh - 140px)' }}
                      dangerouslySetInnerHTML={{ __html: selectedDocument.content }}
                    />
                  ) : (
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
                  )}
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