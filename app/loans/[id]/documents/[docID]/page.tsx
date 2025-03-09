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
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="ml-3 text-gray-600">Loading document...</p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }
  
  if (!document) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-16 px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Document Not Found</h2>
          <p className="text-gray-600 mb-6">The document you're looking for doesn't exist or has been removed.</p>
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
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to {loanName}'s Loan
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Preview */}
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg">
                  {document.filename}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  className="document-viewer p-8 min-h-[800px] border bg-white"
                  dangerouslySetInnerHTML={{ __html: document.content }}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Document Actions */}
          <div>
            <Card className="shadow-md">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg">Document Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Document Details
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Type:</span>
                      <span className="font-medium">{document.docType.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <span className="font-medium capitalize">{document.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span className="font-medium">{new Date(document.dateCreated).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-medium ${
                        document.status === 'approved' ? 'text-green-600' :
                        document.status === 'rejected' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Update Document Status
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => updateStatus('approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check size={16} className="mr-2" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => updateStatus('rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-700" 
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