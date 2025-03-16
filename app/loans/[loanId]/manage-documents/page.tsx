"use client";

import { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LayoutWrapper from '@/app/layout-wrapper';
import Link from 'next/link';
import { simpleDocumentService, SimpleDocument } from '@/utilities/simplifiedDocumentService';
import SimpleDocumentUploader from '@/components/document/SimpleDocumentUploader';
import SimpleDocumentList from '@/components/document/SimpleDocumentList';
import SimpleDocumentViewer from '@/components/document/SimpleDocumentViewer';
import { loanDatabase } from '@/utilities/loanDatabase';
import SimpleDocumentAnalytics from '@/components/document/SimpleDocumentAnalytics';

// Loading component for suspense fallback
function LoadingState() {
  return (
    <div className="text-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading loan details...</p>
    </div>
  );
}

// Main content component
function ManageDocumentsContent({ loanId }: { loanId: string }) {
  const [selectedDocument, setSelectedDocument] = useState<SimpleDocument | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [loanDetails, setLoanDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch loan details
  useEffect(() => {
    const fetchLoanDetails = async () => {
      if (!loanId) return;
      
      try {
        setLoading(true);
        // Try to fetch from our local database
        const loan = loanDatabase.getLoanById(loanId);
        
        if (loan) {
          setLoanDetails(loan);
        } else {
          // Fallback - use loan ID as borrower name
          setLoanDetails({ id: loanId, borrowerName: `Loan #${loanId}` });
        }
      } catch (error) {
        console.error("Error fetching loan:", error);
        // Final fallback - use loan ID as borrower name
        setLoanDetails({ id: loanId, borrowerName: `Loan #${loanId}` });
      } finally {
        setLoading(false);
      }
    };
    
    if (loanId) {
      fetchLoanDetails();
    }
  }, [loanId]);
  
  // Handle document upload completion
  const handleUploadComplete = () => {
    setRefreshCounter(prev => prev + 1);
  };
  
  // Handle document status change
  const handleDocumentStatusChange = () => {
    setSelectedDocument(null);
    setRefreshCounter(prev => prev + 1);
  };
  
  // Handle document deletion
  const handleDocumentDelete = () => {
    setSelectedDocument(null);
    setRefreshCounter(prev => prev + 1);
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Link href={`/loans/${loanId}`} className="flex items-center text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Loan Details
        </Link>
        <h1 className="text-2xl font-bold mt-4 text-white">
          Document Management: {loanDetails?.borrowerName || `Loan #${loanId}`}
        </h1>
        <p className="text-muted-foreground">
          Upload, review, and manage documents for this loan
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Upload */}
        <div>
          <SimpleDocumentUploader 
            loanId={loanId} 
            onUploadComplete={handleUploadComplete}
          />
          
          <div className="mt-6">
            <SimpleDocumentAnalytics 
              loanId={loanId}
              refreshTrigger={refreshCounter}
            />
          </div>
          
          <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-800/30">
            <h3 className="font-medium flex items-center mb-2 text-blue-300">
              <FileText size={16} className="mr-2 text-blue-400" />
              Document Tips
            </h3>
            <ul className="text-sm text-gray-300 space-y-2 ml-5 list-disc">
              <li>Upload all required loan documents</li>
              <li>Ensure all pages are properly oriented</li>
              <li>Make sure text is legible in the scanned documents</li>
              <li>Use descriptive filenames for better categorization</li>
            </ul>
          </div>
        </div>
        
        {/* Main content - Document List */}
        <div className="md:col-span-2">
          <div className="bg-[#1A2234] shadow-md border border-gray-800 rounded-lg">
            <div className="p-4 border-b border-gray-800 bg-[#0A0F1A]">
              <h2 className="text-lg font-semibold text-white">Loan Documents</h2>
            </div>
            <div className="p-4">
              <SimpleDocumentList 
                loanId={loanId} 
                onViewDocument={setSelectedDocument}
                refreshTrigger={refreshCounter}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Document Viewer Modal */}
      {selectedDocument && (
        <SimpleDocumentViewer 
          document={selectedDocument} 
          onClose={() => setSelectedDocument(null)}
          onStatusChange={handleDocumentStatusChange}
          onDelete={handleDocumentDelete}
        />
      )}
    </div>
  );
}

// Main page component with params destructuring and proper suspense boundaries
export default function ManageDocumentsPage({ params }: { params: { loanId: string } }) {
  return (
    <LayoutWrapper>
      <Suspense fallback={<LoadingState />}>
        <ManageDocumentsContent loanId={params.loanId} />
      </Suspense>
    </LayoutWrapper>
  );
} 