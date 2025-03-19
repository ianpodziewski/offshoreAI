'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LayoutWrapper from '@/app/layout-wrapper';
import LoanSidebar from '@/components/loan/LoanSidebar';
import { loanDatabase } from '@/utilities/loanDatabase';
import { ArrowLeft, RefreshCw, MessageCircle } from 'lucide-react';
import { LoanData } from '@/utilities/loanGenerator';
import { LoanContextProvider } from '@/components/LoanContextProvider';
import LoanLevelChat from '@/components/LoanLevelChat';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';

export default function LoanChatPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.loanId as string;
  
  const [loan, setLoan] = useState<LoanData | null>(null);
  
  // Load loan data
  useEffect(() => {
    if (loanId) {
      const loanData = loanDatabase.getLoanById(loanId);
      if (loanData) {
        setLoan(loanData);
      }
    }
  }, [loanId]);
  
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
          <div className="w-full lg:w-3/4">
            <div className="bg-[#1A2234] shadow-md border border-gray-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle size={24} className="text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Loan Chatbot Assistant</h2>
              </div>
              <p className="text-gray-400 mb-4">
                This AI assistant can answer questions about this specific loan using all available loan documents and data points. 
                You can ask about details in specific documents, request comparisons between documents, or get summaries of loan terms.
              </p>
              
              {/* Chatbot interface */}
              <div className="h-[700px]">
                <LoanContextProvider initialLoanId={loanId}>
                  <LoanLevelChat />
                </LoanContextProvider>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <LoanSidebar loan={loan} activePage="chat" />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
} 