"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import LayoutWrapper from '@/app/layout-wrapper';
import { loanDatabase } from '@/utilities/loanDatabase';
import { COLORS } from '@/app/theme/colors';
import LoanSidebar from '@/components/loan/LoanSidebar';

/**
 * Converts a string to title case (first letter of each word capitalized)
 * @param str The string to convert
 * @returns The string in title case
 */
const toTitleCase = (str: string): string => {
  return str
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loan, setLoan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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
          <Link href="/loans">
            <Button style={{ backgroundColor: COLORS.primary }}>
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
            <Button variant="ghost" className="mb-4" style={{ color: COLORS.textSecondary }}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Loans
            </Button>
          </Link>
          
          <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: COLORS.bgDark }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
              {loan.borrowerName}'s Hard Money Loan
            </h1>
            <p style={{ color: COLORS.textSecondary }}>
              {toTitleCase(loan.loanType)} • ${loan.loanAmount.toLocaleString()} • {loan.interestRate}%
            </p>
          </div>
        
          <div className="grid grid-cols-1 gap-6">
            {/* Loan Details */}
            <div>
              <Card className="mb-6" style={{ 
                backgroundColor: COLORS.bgDark,
                borderColor: COLORS.border
              }}>
                <CardHeader style={{ 
                  backgroundColor: COLORS.bgHeader,
                  borderColor: COLORS.border,
                  borderBottomWidth: '1px',
                  borderBottomStyle: 'solid'
                }}>
                  <CardTitle style={{ color: COLORS.textPrimary }}>Loan Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Loan Type</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>
                        {toTitleCase(loan.loanType)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Loan Amount</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>${loan.loanAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Interest Rate</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>{loan.interestRate}%</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Origination Fee</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>{loan.originationFee}%</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Loan Term</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>{loan.loanTerm} months</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Status</h3>
                      <p className="font-medium capitalize" style={{
                        color: loan.status === 'approved' ? COLORS.status.approved : 
                               loan.status === 'rejected' ? COLORS.status.rejected :
                               loan.status === 'in_review' ? COLORS.status.pending :
                               COLORS.textPrimary
                      }}>
                        {toTitleCase(loan.status)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 grid grid-cols-2 gap-4" style={{
                    borderTopWidth: '1px',
                    borderTopStyle: 'solid',
                    borderColor: COLORS.border
                  }}>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Property Address</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>{loan.propertyAddress}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Property Type</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>
                        {toTitleCase(loan.propertyType)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 grid grid-cols-2 gap-4" style={{
                    borderTopWidth: '1px',
                    borderTopStyle: 'solid',
                    borderColor: COLORS.border
                  }}>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Purchase Price</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>${loan.purchasePrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>After Repair Value</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>${loan.afterRepairValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Rehab Budget</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>${loan.rehabBudget.toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Exit Strategy</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>
                        {toTitleCase(loan.exitStrategy)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>LTV</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>{loan.ltv}%</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>ARV LTV</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>{loan.arv_ltv}%</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 grid grid-cols-2 gap-4" style={{
                    borderTopWidth: '1px',
                    borderTopStyle: 'solid',
                    borderColor: COLORS.border
                  }}>
                    <div>
                      <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Borrower Experience</h3>
                      <p className="font-medium" style={{ color: COLORS.textPrimary }}>{loan.borrowerExperience}</p>
                    </div>
                    {loan.lender && (
                      <div>
                        <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Lender</h3>
                        <p className="font-medium" style={{ color: COLORS.textPrimary }}>{loan.lender}</p>
                      </div>
                    )}
                    {loan.fundingDate && (
                      <div>
                        <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Funding Date</h3>
                        <p className="font-medium" style={{ color: COLORS.textPrimary }}>{new Date(loan.fundingDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {loan.maturityDate && (
                      <div>
                        <h3 className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>Maturity Date</h3>
                        <p className="font-medium" style={{ color: COLORS.textPrimary }}>{new Date(loan.maturityDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar Navigation */}
      <LoanSidebar loanId={loan.id} />
    </LayoutWrapper>
  );
}