"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, DollarSign, Calendar, User, TrendingUp } from 'lucide-react';
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

// Section component for grouping related loan information
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <div className="mb-8">
    <div className="flex items-center mb-4 pb-2" style={{ 
      borderBottom: `1px solid ${COLORS.border}`,
    }}>
      <span className="mr-2" style={{ color: COLORS.primary }}>{icon}</span>
      <h2 className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);

// Info item component for displaying individual data points
interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  dark?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, highlight = false, dark = false }) => (
  <div className="p-4 rounded-md" style={{ 
    backgroundColor: dark ? COLORS.bgDark : (highlight ? `${COLORS.primary}15` : '#f0f4f8'),
  }}>
    <p className="text-xs font-medium mb-1" style={{ 
      color: dark ? COLORS.textSecondary : '#64748b'
    }}>
      {label}
    </p>
    <p className="font-medium text-lg" style={{ 
      color: highlight ? COLORS.primary : (dark ? COLORS.textPrimary : '#1e293b'),
    }}>
      {value}
    </p>
  </div>
);

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
  
  // Format status with appropriate styling
  const getStatusDisplay = (status: string) => {
    const statusColor = 
      status === 'approved' ? COLORS.status.approved : 
      status === 'rejected' ? COLORS.status.rejected :
      status === 'in_review' ? COLORS.status.pending :
      COLORS.textPrimary;
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{
        backgroundColor: `${statusColor}25`,
        color: statusColor
      }}>
        {toTitleCase(status)}
      </span>
    );
  };
  
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
          
          <div className="p-6 rounded-lg mb-6 flex flex-col md:flex-row justify-between items-start md:items-center" 
               style={{ backgroundColor: COLORS.bgDark }}>
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
                Loan #{loan.id}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span style={{ color: COLORS.textSecondary }}>{toTitleCase(loan.loanType)}</span>
                <span style={{ color: COLORS.textMuted }}>•</span>
                <span style={{ color: COLORS.textSecondary }}>${loan.loanAmount.toLocaleString()}</span>
                <span style={{ color: COLORS.textMuted }}>•</span>
                <span style={{ color: COLORS.textSecondary }}>{loan.interestRate}% Interest</span>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              {getStatusDisplay(loan.status)}
            </div>
          </div>
        
          <div className="rounded-lg p-6" style={{ backgroundColor: COLORS.bgDarker }}>
            {/* Key Loan Details */}
            <Section title="Key Loan Details" icon={<DollarSign size={20} />}>
              <InfoItem 
                label="Loan Amount" 
                value={`$${loan.loanAmount.toLocaleString()}`} 
                highlight={true}
                dark={false}
              />
              <InfoItem 
                label="Interest Rate" 
                value={`${loan.interestRate}%`}
                dark={true}
              />
              <InfoItem 
                label="Loan Term" 
                value={`${loan.loanTerm} months`}
                dark={true}
              />
              <InfoItem 
                label="Origination Fee" 
                value={`${loan.originationFee}%`}
                dark={true}
              />
              <InfoItem 
                label="Loan Type" 
                value={toTitleCase(loan.loanType)}
                dark={true}
              />
              <InfoItem 
                label="Exit Strategy" 
                value={toTitleCase(loan.exitStrategy)}
                dark={true}
              />
            </Section>

            {/* Property Information */}
            <Section title="Property Information" icon={<Home size={20} />}>
              <InfoItem 
                label="Property Address" 
                value={loan.propertyAddress}
                highlight={true}
                dark={false}
              />
              <InfoItem 
                label="Property Type" 
                value={toTitleCase(loan.propertyType)}
                dark={true}
              />
              <InfoItem 
                label="Purchase Price" 
                value={`$${loan.purchasePrice.toLocaleString()}`}
                dark={true}
              />
              <InfoItem 
                label="After Repair Value" 
                value={`$${loan.afterRepairValue.toLocaleString()}`}
                dark={true}
              />
              <InfoItem 
                label="Rehab Budget" 
                value={`$${loan.rehabBudget.toLocaleString()}`}
                dark={true}
              />
            </Section>

            {/* Loan Metrics */}
            <Section title="Loan Metrics" icon={<TrendingUp size={20} />}>
              <InfoItem 
                label="Loan-to-Value (LTV)" 
                value={`${loan.ltv}%`}
                dark={true}
              />
              <InfoItem 
                label="After-Repair LTV" 
                value={`${loan.arv_ltv}%`}
                dark={true}
              />
            </Section>

            {/* Parties */}
            <Section title="Parties" icon={<User size={20} />}>
              <InfoItem 
                label="Borrower" 
                value={loan.borrowerName}
                highlight={true}
                dark={false}
              />
              <InfoItem 
                label="Borrower Experience" 
                value={loan.borrowerExperience}
                dark={true}
              />
              {loan.lender && (
                <InfoItem 
                  label="Lender" 
                  value={loan.lender}
                  dark={true}
                />
              )}
            </Section>

            {/* Dates */}
            {(loan.fundingDate || loan.maturityDate) && (
              <Section title="Important Dates" icon={<Calendar size={20} />}>
                {loan.fundingDate && (
                  <InfoItem 
                    label="Funding Date" 
                    value={new Date(loan.fundingDate).toLocaleDateString()}
                    dark={true}
                  />
                )}
                {loan.maturityDate && (
                  <InfoItem 
                    label="Maturity Date" 
                    value={new Date(loan.maturityDate).toLocaleDateString()}
                    dark={true}
                  />
                )}
              </Section>
            )}
          </div>
        </div>
      </div>
      
      {/* Sidebar Navigation */}
      <LoanSidebar loanId={loan.id} />
    </LayoutWrapper>
  );
}