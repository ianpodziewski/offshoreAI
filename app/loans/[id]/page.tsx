// app/loans/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import LayoutWrapper from '@/app/layout-wrapper';
import { loanDatabase } from '@/utilities/loanDatabase';
import SimpleDocumentUploader from '@/components/document/SimpleDocumentUploader';
import SimpleDocumentViewer from '@/components/document/SimpleDocumentViewer';
import { SimpleDocument } from '@/utilities/simplifiedDocumentService';
import DocumentSockets from '@/components/document/DocumentSockets';

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<SimpleDocument | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    if (params?.id) {
      const loanId = String(params.id);
      const fetchedLoan = loanDatabase.getLoanById(loanId);
      
      if (fetchedLoan) {
        setLoan(fetchedLoan);
      }
      setLoading(false);
    }
  }, [params?.id]);
  
  const handleDocumentUploadComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  const handleDocumentStatusChange = () => {
    setSelectedDocument(null);
    setRefreshTrigger(prev => prev + 1);
  };
  
  if (loading) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-16 px-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading loan details...</p>
        </div>
      </LayoutWrapper>
    );
  }
  
  if (!loan) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-16 px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Loan Not Found</h2>
          <p className="text-gray-600 mb-6">The loan you're looking for doesn't exist or has been removed.</p>
          <Link href="/loans">
            <Button>
              <ArrowLeft size={16} className="mr-2" />
              Back to Loans
            </Button>
          </Link>
        </div>
      </LayoutWrapper>
    );
  }
  
  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/loans">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to Loans
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold mb-2">{loan.borrowerName}'s Loan</h1>
          <p className="text-gray-600">
            {loan.loanType.toUpperCase()} • ${loan.loanAmount.toLocaleString()} • {loan.interestRate}%
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loan Details */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Loan Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Loan Type</h3>
                    <p className="font-medium">{loan.loanType.toUpperCase()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Loan Amount</h3>
                    <p className="font-medium">${loan.loanAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Interest Rate</h3>
                    <p className="font-medium">{loan.interestRate}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Loan Term</h3>
                    <p className="font-medium">{loan.loanTerm / 12} years</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="font-medium capitalize">{loan.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created Date</h3>
                    <p className="font-medium">{new Date(loan.dateCreated).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500">Property Address</h3>
                  <p className="font-medium">{loan.propertyAddress}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Document Sockets */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Loan Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentSockets
                  loanId={loan.id}
                  onViewDocument={setSelectedDocument}
                  refreshTrigger={refreshTrigger}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Document Uploader */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Upload Loan Document</CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleDocumentUploader 
                  loanId={loan.id}
                  onUploadComplete={handleDocumentUploadComplete}
                />
              </CardContent>
            </Card>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-start mb-2">
                <AlertCircle size={18} className="text-blue-500 mr-2 mt-0.5" />
                <h3 className="font-medium">Required Documents</h3>
              </div>
              <ul className="pl-6 space-y-1 text-sm text-gray-700">
                <li>Promissory Note</li>
                <li>Deed of Trust</li>
                <li>Closing Disclosure</li>
                <li>Property Appraisal</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Document Viewer Modal */}
        {selectedDocument && (
          <SimpleDocumentViewer 
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
            onStatusChange={handleDocumentStatusChange}
            onDelete={() => {
              setSelectedDocument(null);
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        )}
      </div>
    </LayoutWrapper>
  );
}