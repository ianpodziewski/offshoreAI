"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCheck } from 'lucide-react';
import LayoutWrapper from '@/app/layout-wrapper';
import { loanDatabase } from '@/utilities/loanDatabase';
import SimpleDocumentViewer from '@/components/document/SimpleDocumentViewer';
import { SimpleDocument } from '@/utilities/simplifiedDocumentService';
import DocumentSockets from '@/components/document/DocumentSockets';
import { COLORS } from '@/app/theme/colors';
import { fakeDocumentService } from '@/utilities/fakeDocumentService';
import LoanSidebar from '@/components/loan/LoanSidebar';

export default function LoanDocumentsPage() {
  const params = useParams();
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<SimpleDocument | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [generatingDocs, setGeneratingDocs] = useState(false);
  
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

  const handleGenerateAllDocuments = () => {
    if (!loan) return;
    
    setGeneratingDocs(true);
    try {
      // Generate all documents for the loan
      fakeDocumentService.generateAllFakeDocuments(loan);
      // Refresh the documents list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error generating documents:', error);
    } finally {
      setGeneratingDocs(false);
    }
  };
  
  if (loading) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-16 px-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 rounded-full mx-auto mb-4" style={{
            borderColor: COLORS.primary,
            borderTopColor: "transparent"
          }}></div>
          <p style={{ color: COLORS.textSecondary }}>Loading loan details...</p>
        </div>
      </LayoutWrapper>
    );
  }
  
  if (!loan) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-16 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.textPrimary }}>Loan Not Found</h2>
          <p className="mb-6" style={{ color: COLORS.textSecondary }}>The loan you're looking for doesn't exist or has been removed.</p>
        </div>
      </LayoutWrapper>
    );
  }
  
  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: COLORS.bgDark }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
              {loan.borrowerName}'s Loan Documents
            </h1>
            <p style={{ color: COLORS.textSecondary }}>
              Manage and view all documents related to this loan
            </p>
          </div>
          
          {/* Document Sockets */}
          <div>
            <Card style={{ 
              backgroundColor: COLORS.bgDark,
              borderColor: COLORS.border
            }}>
              <div className="text-center py-4" style={{ 
                backgroundColor: COLORS.bgHeader,
                borderColor: COLORS.border,
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid'
              }}>
                <CardTitle style={{ color: COLORS.textPrimary }}>Loan Documents</CardTitle>
              </div>
              <div className="flex justify-center py-4">
                <Button
                  onClick={handleGenerateAllDocuments}
                  className="flex items-center gap-2"
                  disabled={generatingDocs}
                  style={{ 
                    backgroundColor: COLORS.primary, 
                    color: COLORS.textPrimary 
                  }}
                >
                  {generatingDocs ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-t-transparent rounded-full mr-1"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileCheck size={16} className="mr-1" />
                      Generate Sample Documents
                    </>
                  )}
                </Button>
              </div>
              <CardContent className="rounded-lg" style={{ backgroundColor: COLORS.bgDarker }}>
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
      
      {/* Sidebar Navigation */}
      <LoanSidebar loanId={loan.id} />
    </LayoutWrapper>
  );
} 