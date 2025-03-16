"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X } from 'lucide-react';
import LayoutWrapper from '@/app/layout-wrapper';
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
        if (params?.docId && params?.loanId) {
          const loanId = String(params.loanId);
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
  }, [params?.docId, params?.loanId]);
  
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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="ml-3 text-muted-foreground">Loading document...</p>
        </div>
      </LayoutWrapper>
    );
  }
  
  if (!document) {
    return (
      <LayoutWrapper>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Document Not Found</h2>
          <p className="text-muted-foreground mb-6">The document you're looking for doesn't exist or has been removed.</p>
          <Button 
            onClick={() => router.push(`/loans/${params?.loanId}`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Loan
          </Button>
        </div>
      </LayoutWrapper>
    );
  }
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-400';
      case 'rejected':
        return 'text-red-400';
      case 'pending':
      case 'in_review':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };
  
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <div className="mb-6">
          <button 
            onClick={() => router.push(`/loans/${params?.loanId}`)} 
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to {loanName}'s Loan
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Preview */}
          <div className="lg:col-span-2">
            <Card className="shadow-md bg-[#1A2234] border-gray-800">
              <CardHeader className="border-b border-gray-800 bg-[#0A0F1A]">
                <CardTitle className="text-lg text-white">
                  {document.filename}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  className="document-viewer p-8 min-h-[800px] bg-[#1A2234] text-white"
                  dangerouslySetInnerHTML={{ __html: document.content }}
                />
              </CardContent>
            </Card>
          </div>
          
          {/* Document Actions */}
          <div>
            <Card className="shadow-md bg-[#1A2234] border-gray-800">
              <CardHeader className="border-b border-gray-800 bg-[#0A0F1A]">
                <CardTitle className="text-lg text-white">
                  Document Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1 text-white">
                    Document Details
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Type:</span>
                      <span className="font-medium text-white">
                        {document.docType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Category:</span>
                      <span className="font-medium capitalize text-white">
                        {document.category}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Created:</span>
                      <span className="font-medium text-white">
                        {new Date(document.dateCreated).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status:</span>
                      <span className={`font-medium ${getStatusClass(document.status)}`}>
                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-800">
                  <p className="text-sm font-medium mb-3 text-white">
                    Update Document Status
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => updateStatus('approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check size={16} className="mr-2" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => updateStatus('rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
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