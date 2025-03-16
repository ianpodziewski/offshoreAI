"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { loanDatabase } from '@/utilities/loanDatabase';
import { COLORS } from '@/app/theme/colors';
import LoanSidebar from '@/components/loan/LoanSidebar';

export default function LoanPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params?.id as string;
  const loan = loanDatabase.getLoanById(loanId);

  if (!loan) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.textPrimary }}>Loan Not Found</h2>
        <p className="mb-6" style={{ color: COLORS.textSecondary }}>The loan you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push('/loans')}>
          Back to Loans
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <LoanSidebar loan={loan} activePage="overview" />
        </div>
        
        {/* Main content */}
        <div className="flex-grow">
          <div className="mb-6">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-4"
              onClick={() => router.push('/loans')}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Loans
            </Button>
            
            <h1 className="text-2xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
              Loan Overview
            </h1>
            <p className="text-sm mb-6" style={{ color: COLORS.textMuted }}>
              View and manage details for loan {loan.id}
            </p>
          </div>
          
          {/* Loan overview content */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: COLORS.bgDarker }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.textPrimary }}>
              Loan Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.textMuted }}>Borrower</p>
                <p className="text-base" style={{ color: COLORS.textPrimary }}>{loan.borrowerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.textMuted }}>Loan Amount</p>
                <p className="text-base" style={{ color: COLORS.textPrimary }}>${loan.loanAmount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.textMuted }}>Interest Rate</p>
                <p className="text-base" style={{ color: COLORS.textPrimary }}>{loan.interestRate}%</p>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.textMuted }}>Term</p>
                <p className="text-base" style={{ color: COLORS.textPrimary }}>{loan.loanTerm} months</p>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.textMuted }}>Property Address</p>
                <p className="text-base" style={{ color: COLORS.textPrimary }}>{loan.propertyAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: COLORS.textMuted }}>Status</p>
                <p className="text-base" style={{ color: COLORS.textPrimary }}>{loan.status}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}