"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import LayoutWrapper from '@/app/layout-wrapper';
import { loanDatabase } from '@/utilities/loanDatabase';
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
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h1 className="text-3xl font-bold mb-2">{loan.borrowerName}'s Hard Money Loan</h1>
            <p className="text-gray-600">
              {loan.loanType.replace('_', ' ').toUpperCase()} • ${loan.loanAmount.toLocaleString()} • {loan.interestRate}%
            </p>
          </div>
        
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Loan Details */}
            <div className="lg:col-span-3">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Loan Information</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Loan Type</h3>
                    <p className="font-medium">{loan.loanType.replace('_', ' ').toUpperCase()}</p>
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
                    <h3 className="text-sm font-medium text-gray-500">Origination Fee</h3>
                    <p className="font-medium">{loan.originationFee}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Loan Term</h3>
                    <p className="font-medium">{loan.loanTerm} months</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="font-medium capitalize">{loan.status.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Property Address</h3>
                    <p className="font-medium">{loan.propertyAddress}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Property Type</h3>
                    <p className="font-medium">{loan.propertyType.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Purchase Price</h3>
                    <p className="font-medium">${loan.purchasePrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">After Repair Value</h3>
                    <p className="font-medium">${loan.afterRepairValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rehab Budget</h3>
                    <p className="font-medium">${loan.rehabBudget.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Exit Strategy</h3>
                    <p className="font-medium">{loan.exitStrategy.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">LTV</h3>
                    <p className="font-medium">{loan.ltv}%</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">ARV LTV</h3>
                    <p className="font-medium">{loan.arv_ltv}%</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Borrower Experience</h3>
                    <p className="font-medium">{loan.borrowerExperience}</p>
                  </div>
                  {loan.lender && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Lender</h3>
                      <p className="font-medium">{loan.lender}</p>
                    </div>
                  )}
                  {loan.fundingDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Funding Date</h3>
                      <p className="font-medium">{new Date(loan.fundingDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {loan.maturityDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Maturity Date</h3>
                      <p className="font-medium">{new Date(loan.maturityDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Document Sockets */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Loan Documents</CardTitle>
              </CardHeader>
              <CardContent className="bg-gray-50 rounded-lg">
                <DocumentSockets
                  loanId={loan.id}
                  onViewDocument={setSelectedDocument}
                  refreshTrigger={refreshTrigger}
                />
              </CardContent>
            </Card>
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
        </div>
      </LayoutWrapper>
  );
}