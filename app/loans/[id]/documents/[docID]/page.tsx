// app/loans/[id]/documents/[docId]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Check, X } from 'lucide-react';
import LayoutWrapper from '../../../../layout-wrapper';
import { documentService, LoanDocument } from '@/utilities/documentService';
import { loanDatabase } from '@/utilities/loanDatabase';

export default function DocumentViewerPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<LoanDocument | null>(null);
  const [loanName, setLoanName] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      try {
        if (params?.docId && params?.id) {
          const loanId = String(params.id);
          const docId = String(params.docId);
          
          const allDocs = documentService.getAllDocuments();
          const doc = allDocs.find(d => d.id === docId);
          
          if (doc) {
            setDocument(doc);
            
            // Get loan name
            const loan = loanDatabase.getLoanById(loanId);
            if (loan) {
              setLoanName(loan.borrowerName);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [params?.docId, params?.id]);
  
  const updateStatus = (status: string) => {
    if (document) {
      const updatedDoc = documentService.updateDocumentStatus(document.id, status);
      if (updatedDoc) {
        setDocument(updatedDoc);
      }
    }
  };
  
  if (loading) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-16 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="ml-3 text-muted-foreground">Loading document...</p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }
  
  if (!document) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-16 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Document Not Found</h2>
          <p className="text-muted-foreground mb-6">The document you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push(`/loans/${params?.id}`)}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Loan
          </Button>
        </div>
      </LayoutWrapper>
    );
  }
  
  return (
    <LayoutWrapper>
      <div className="container mx-auto py-16 px-4">
        <div className="mb-6">
          <button 
            onClick={() => router.push(`/loans/${params?.id}`)} 
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to {loanName}'s Loan
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Preview */}
          <div className="lg:col-span-2">
            <Card className="shadow-md border-border">
              <CardHeader className="bg-muted border-b border-border">
                <CardTitle className="text-lg">
                  {document.filename}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  className="document-viewer p-8 min-h-[800px] border border-border bg-card text-card-foreground"
                  dangerouslySetInnerHTML={{ __html: document.content }}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Document Actions */}
          <div>
            <Card className="shadow-md border-border">
              <CardHeader className="bg-muted border-b border-border">
                <CardTitle className="text-lg">Document Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">
                    Document Details
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{document.docType.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Category:</span>
                      <span className="font-medium capitalize">{document.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Created:</span>
                      <span className="font-medium">{new Date(document.dateCreated).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${
                        document.status === 'approved' ? 'text-green-500' :
                        document.status === 'rejected' ? 'text-destructive' :
                        'text-primary'
                      }`}>
                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-3">
                    Update Document Status
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => updateStatus('approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      variant="secondary"
                    >
                      <Check size={16} className="mr-2" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => updateStatus('rejected')}
                      className="flex-1"
                      variant="destructive"
                    >
                      <X size={16} className="mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}