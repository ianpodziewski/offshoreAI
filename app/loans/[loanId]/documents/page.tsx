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
      // First ensure documents are deduplicated to avoid duplicates
      loanDocumentService.deduplicateLoanDocuments(loanId);
      
      // Get the deduplicated documents
      const docs = loanDocumentService.getDocumentsForLoan(loanId);
      
      // Only set documents if we have some - don't override with empty array
      if (docs.length > 0) {
        setDocuments(docs);
        
        if (loan?.loanType) {
          const status = loanDocumentService.getDocumentCompletionStatus(loanId, loan.loanType);
          setCompletionStatus(status);
        }
      }
    }
  }, [loanId, loan]);
  
  // Initialize documents if none exist
  useEffect(() => {
    if (loanId && loan?.loanType && documents.length === 0) {
      // Only initialize if no documents exist
      const placeholderDocs = loanDocumentService.initializeDocumentsForLoan(loanId, loan.loanType);
      
      // Get all documents for this loan, including both placeholders and any that might already exist
      const allLoanDocs = loanDocumentService.getDocumentsForLoan(loanId);
      setDocuments(allLoanDocs);
      
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
    }
  };
  
  // Handle document upload completion
  const handleDocumentUploaded = (document: any) => {
    console.log('Document to be uploaded:', document);
    
    // Ensure uploaded files have a distinct naming pattern
    let filename = document.filename;
    if (!filename.startsWith('UPLOAD_')) {
      filename = `UPLOAD_${filename}`;
    }
    
    // Create document with the required structure
    const newDoc = loanDocumentService.addDocument({
      ...document,
      filename,
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
    
    // Force reloading the document list from localStorage to ensure sync
    setTimeout(() => {
      const refreshedDocs = loanDocumentService.getDocumentsForLoan(loanId);
      setDocuments(refreshedDocs);
    }, 100);
    
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
                  onClick={async () => {
                    try {
                      console.log(`Generating sample documents for loan ${loanId} with type ${loan.loanType}`);
                      const fakeDocuments = await loanDocumentService.generateFakeDocuments(loanId, loan.loanType);
                      if (fakeDocuments.length > 0) {
                        // Deduplicate documents after generation
                        loanDocumentService.deduplicateLoanDocuments(loanId);
                        
                        // Load the deduplicated documents
                        const dedupedDocs = loanDocumentService.getDocumentsForLoan(loanId);
                        
                        // Log the deduplicated docs to help with debugging
                        console.log('Deduplicated documents after generation:', dedupedDocs);
                        
                        // Set the documents and ensure local state is updated
                        setDocuments(dedupedDocs);
                        
                        // Update completion status
                        if (loan?.loanType) {
                          const status = loanDocumentService.getDocumentCompletionStatus(loanId, loan.loanType);
                          setCompletionStatus(status);
                        }
                        
                        // Show success message (modified to be more accurate about storage depending on Redis availability)
                        const storageMode = typeof window !== 'undefined' && 
                                           (!process.env.REDIS_URL || window.localStorage.getItem('USE_FALLBACK') === 'true') ? 
                                           'localStorage only' : 'localStorage and Redis';
                        
                        alert(`Successfully generated ${fakeDocuments.length} documents. These documents are stored in ${storageMode} and will persist across page refreshes.`);
                      }
                    } catch (error) {
                      console.error('Error generating fake documents:', error);
                      alert('There was an error generating sample documents. Please check the console for details.');
                    }
                  }} 
                  className="bg-[#1A2234] hover:bg-[#1A2234]/90 border border-gray-800 text-white"
                  title="Generate sample documents for this loan"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Sample Documents
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      console.log('Generating sample documents for all loans');
                      const totalGenerated = await loanDocumentService.generateFakeDocumentsForAllLoans();
                      
                      // Get all loans and deduplicate their documents
                      const loans = loanDatabase.getLoans();
                      for (const loan of loans) {
                        loanDocumentService.deduplicateLoanDocuments(loan.id);
                      }
                      
                      // Update success message to include Redis information
                      alert(`Generated ${totalGenerated} sample documents across all loans. Documents are stored in both localStorage and Redis for chatbot access.`);
                      
                      // Refresh documents for current loan
                      const docs = loanDocumentService.getDocumentsForLoan(loanId);
                      setDocuments(docs);
                      
                      // Update completion status for current loan
                      const currentLoan = loanDatabase.getLoanById(loanId);
                      if (currentLoan?.loanType) {
                        const status = loanDocumentService.getDocumentCompletionStatus(loanId, currentLoan.loanType);
                        setCompletionStatus(status);
                      }
                    } catch (error) {
                      console.error('Error generating fake documents for all loans:', error);
                      alert('There was an error generating sample documents for all loans. Please check the console for details.');
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
      </div>
    </LayoutWrapper>
  );
} 