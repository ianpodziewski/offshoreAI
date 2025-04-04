"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, DollarSign, Calendar, User, TrendingUp, MapPin, Briefcase, Users } from 'lucide-react';
import { loanDatabase } from '@/utilities/loanDatabase';
import { COLORS } from '@/app/theme/colors';
import LoanSidebar from '@/components/loan/LoanSidebar';
import LayoutWrapper from '@/app/layout-wrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoanData } from '@/utilities/loanGenerator';

// Extend the COLORS object with missing properties
const extendedColors = {
  ...COLORS,
  bgAccent: "rgba(31, 41, 55, 0.3)", // Add missing bgAccent property
  bgCard: "#1F2937", // Add missing bgCard property
  status: {
    ...COLORS.status,
    funded: "#3B82F6", // Add missing funded status color
    closed: "#6B7280", // Add missing closed status color
  }
};

/**
 * Converts a string to title case (first letter of each word capitalized)
 */
const toTitleCase = (str: string): string => {
  return str
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Section component for loan details
 */
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon, children }) => (
  <div className="mb-8">
    <div className="flex items-center mb-4">
      <div className="p-2 rounded-full mr-2" style={{ backgroundColor: extendedColors.bgAccent }}>
        {icon}
      </div>
      <h2 className="text-xl font-semibold" style={{ color: COLORS.textPrimary }}>
        {title}
      </h2>
    </div>
    <div className="pl-2">{children}</div>
  </div>
);

/**
 * Info item component for displaying label-value pairs
 */
interface InfoItemProps {
  label: string;
  value: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <div className="mb-4 pb-4 border-b" style={{ borderColor: COLORS.border }}>
    <div className="text-sm" style={{ color: COLORS.textMuted }}>
      {label}
    </div>
    <div className="mt-1 font-medium" style={{ color: COLORS.textPrimary }}>
      {value || (
        <span className="text-sm italic" style={{ color: COLORS.textMuted }}>
          Not specified
        </span>
      )}
    </div>
  </div>
);

// Define the timeline event interface
interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

/**
 * Main loan details page component
 */
export default function LoanPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params?.loanId as string;
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get loan status display with appropriate color
  const getStatusDisplay = (status: string) => {
    let color;
    
    switch (status) {
      case 'approved':
        color = COLORS.status.approved;
        break;
      case 'rejected':
        color = COLORS.status.rejected;
        break;
      case 'in_review':
        color = COLORS.status.pending;
        break;
      case 'funded':
        color = extendedColors.status.funded;
        break;
      case 'closed':
        color = extendedColors.status.closed;
        break;
      default:
        color = COLORS.textMuted;
    }
    
    return (
      <span className="font-medium" style={{ color }}>
        {toTitleCase(status)}
      </span>
    );
  };
  
  // Get loan data from database
  const loan = loanDatabase.getLoanById(loanId);
  
  if (!loan) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-16 px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Loan Not Found</h2>
          <p className="text-muted-foreground mb-6">The loan you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/loans')} style={{ backgroundColor: COLORS.primary }}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Loans
          </Button>
        </div>
      </LayoutWrapper>
    );
  }
  
  // Mock timeline data for display purposes
  const mockTimeline: TimelineEvent[] = [
    {
      date: new Date().toISOString(),
      title: 'Loan Created',
      description: 'Loan application was submitted'
    },
    {
      date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
      title: 'Documents Requested',
      description: 'Required documents were requested from borrower'
    },
    {
      date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      title: 'Initial Review',
      description: 'Loan application passed initial review'
    }
  ];
  
  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <button
            onClick={() => router.push('/loans')}
            className="flex items-center hover:text-foreground"
            style={{ color: COLORS.textMuted }}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Loans
          </button>
          <h1 className="text-3xl font-bold mt-4" style={{ color: COLORS.textPrimary }}>
            #{loan.id}
          </h1>
          <p className="text-lg mt-1" style={{ color: COLORS.textMuted }}>
            {loan.propertyAddress}
          </p>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-6">
          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            <Tabs defaultValue="overview" onValueChange={setActiveTab} className="mb-8">
              <div className="flex justify-center mb-2">
                <TabsList className="bg-[#1a2234] p-0 rounded-lg">
                  <TabsTrigger 
                    value="overview" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="property" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    Property
                  </TabsTrigger>
                  <TabsTrigger 
                    value="financials" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    Financials
                  </TabsTrigger>
                  <TabsTrigger 
                    value="borrower" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    Borrower
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Section title="Loan Details" icon={<Briefcase size={20} style={{ color: COLORS.primary }} />}>
                      <InfoItem label="Loan Type" value={toTitleCase(loan.loanType)} />
                      <InfoItem label="Loan Amount" value={`$${loan.loanAmount.toLocaleString()}`} />
                      <InfoItem label="Interest Rate" value={`${loan.interestRate}%`} />
                      <InfoItem label="Loan Term" value={`${loan.loanTerm} months`} />
                      <InfoItem label="Origination Date" value={new Date(loan.dateCreated).toLocaleDateString()} />
                      <InfoItem label="Maturity Date" value={loan.maturityDate ? new Date(loan.maturityDate).toLocaleDateString() : 'Not specified'} />
                      <InfoItem label="Status" value={getStatusDisplay(loan.status)} />
                    </Section>
                  </div>

                  <div>
                    <Section title="Property Information" icon={<Home size={20} style={{ color: COLORS.primary }} />}>
                      <InfoItem label="Property Address" value={loan.propertyAddress} />
                      <InfoItem label="Property Type" value={toTitleCase(loan.propertyType)} />
                      <InfoItem label="Purchase Price" value={`$${loan.purchasePrice.toLocaleString()}`} />
                      <InfoItem label="After Repair Value" value={`$${loan.afterRepairValue.toLocaleString()}`} />
                      <InfoItem label="Rehab Budget" value={`$${loan.rehabBudget.toLocaleString()}`} />
                    </Section>
                  </div>
                </div>

                <Section title="Loan Timeline" icon={<Calendar size={20} style={{ color: COLORS.primary }} />}>
                  <div className="relative">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    {mockTimeline.map((event, index) => (
                      <div key={index} className="relative pl-10 pb-6">
                        <div
                          className="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: extendedColors.bgAccent }}
                        >
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.primary }}></div>
                        </div>
                        <div className="text-sm" style={{ color: COLORS.textMuted }}>
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="font-medium" style={{ color: COLORS.textPrimary }}>
                          {event.title}
                        </div>
                        <div className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                          {event.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </TabsContent>

              {/* Property Tab */}
              <TabsContent value="property">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Section title="Property Details" icon={<Home size={20} style={{ color: COLORS.primary }} />}>
                      <InfoItem label="Property Address" value={loan.propertyAddress} />
                      <InfoItem label="Property Type" value={toTitleCase(loan.propertyType)} />
                      <InfoItem label="Year Built" value={loan.yearBuilt || 'Not available'} />
                      <InfoItem label="Square Footage" value={loan.squareFootage ? `${loan.squareFootage.toLocaleString()} sq ft` : 'Not available'} />
                      <InfoItem label="Lot Size" value={loan.lotSize || 'Not available'} />
                      <InfoItem label="Bedrooms" value={loan.bedrooms || 'Not available'} />
                      <InfoItem label="Bathrooms" value={loan.bathrooms || 'Not available'} />
                    </Section>
                  </div>

                  <div>
                    <Section title="Valuation" icon={<TrendingUp size={20} style={{ color: COLORS.primary }} />}>
                      <InfoItem label="Purchase Price" value={`$${loan.purchasePrice.toLocaleString()}`} />
                      <InfoItem label="After Repair Value" value={`$${loan.afterRepairValue.toLocaleString()}`} />
                      <InfoItem label="Rehab Budget" value={`$${loan.rehabBudget.toLocaleString()}`} />
                      <InfoItem label="LTV" value={`${loan.ltv}%`} />
                      <InfoItem label="ARV LTV" value={`${loan.arv_ltv}%`} />
                    </Section>
                  </div>
                </div>

                <Section title="Location Information" icon={<MapPin size={20} style={{ color: COLORS.primary }} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <InfoItem label="City" value={loan.city || 'Not available'} />
                      <InfoItem label="State" value={loan.state || 'Not available'} />
                      <InfoItem label="Zip Code" value={loan.zipCode || 'Not available'} />
                      <InfoItem label="County" value={loan.county || 'Not available'} />
                    </div>
                    <div>
                      <InfoItem label="Neighborhood" value={loan.neighborhood || 'Not available'} />
                      <InfoItem label="School District" value={loan.schoolDistrict || 'Not available'} />
                      <InfoItem label="Flood Zone" value={loan.floodZone || 'Not available'} />
                      <InfoItem label="Zoning" value={loan.zoning || 'Not available'} />
                    </div>
                  </div>
                </Section>
              </TabsContent>

              {/* Financials Tab */}
              <TabsContent value="financials">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Section title="Loan Terms" icon={<DollarSign size={20} style={{ color: COLORS.primary }} />}>
                      <InfoItem label="Loan Amount" value={`$${loan.loanAmount.toLocaleString()}`} />
                      <InfoItem label="Interest Rate" value={`${loan.interestRate}%`} />
                      <InfoItem label="Loan Term" value={`${loan.loanTerm} months`} />
                      <InfoItem label="Origination Fee" value={`${loan.originationFee}%`} />
                      <InfoItem label="Prepayment Penalty" value={loan.prepaymentPenalty || 'Not available'} />
                      <InfoItem label="Extension Options" value={loan.extensionOptions || 'Not available'} />
                    </Section>
                  </div>

                  <div>
                    <Section title="Payment Details" icon={<Calendar size={20} style={{ color: COLORS.primary }} />}>
                      <InfoItem label="Monthly Payment" value={loan.monthlyPayment ? `$${loan.monthlyPayment.toLocaleString()}` : 'Not available'} />
                      <InfoItem label="Payment Schedule" value={loan.paymentSchedule || 'Not available'} />
                      <InfoItem label="First Payment Date" value={loan.firstPaymentDate ? new Date(loan.firstPaymentDate).toLocaleDateString() : 'Not available'} />
                      <InfoItem label="Balloon Payment" value={loan.balloonPayment ? `$${loan.balloonPayment.toLocaleString()}` : 'Not available'} />
                      <InfoItem label="Late Fee" value={loan.lateFee || 'Not available'} />
                    </Section>
                  </div>
                </div>

                <Section title="Project Financials" icon={<TrendingUp size={20} style={{ color: COLORS.primary }} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <InfoItem label="Purchase Price" value={`$${loan.purchasePrice.toLocaleString()}`} />
                      <InfoItem label="Rehab Budget" value={`$${loan.rehabBudget.toLocaleString()}`} />
                      <InfoItem label="After Repair Value" value={`$${loan.afterRepairValue.toLocaleString()}`} />
                      <InfoItem label="Total Project Cost" value={`$${(loan.purchasePrice + loan.rehabBudget).toLocaleString()}`} />
                    </div>
                    <div>
                      <InfoItem label="Potential Profit" value={`$${(loan.afterRepairValue - loan.purchasePrice - loan.rehabBudget).toLocaleString()}`} />
                      <InfoItem label="ROI" value={`${Math.round(((loan.afterRepairValue - loan.purchasePrice - loan.rehabBudget) / (loan.purchasePrice + loan.rehabBudget)) * 100)}%`} />
                      <InfoItem label="Cash Required" value={`$${(loan.purchasePrice + loan.rehabBudget - loan.loanAmount).toLocaleString()}`} />
                      <InfoItem label="Holding Costs" value={loan.holdingCosts ? `$${loan.holdingCosts.toLocaleString()}` : 'Not available'} />
                    </div>
                  </div>
                </Section>
              </TabsContent>

              {/* Borrower Tab */}
              <TabsContent value="borrower">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Section title="Borrower Information" icon={<User size={20} style={{ color: COLORS.primary }} />}>
                      <InfoItem label="Borrower Name" value={loan.borrowerName} />
                      <InfoItem label="Email" value={loan.borrowerEmail} />
                      <InfoItem label="Phone" value={loan.borrowerPhone || 'Not available'} />
                      <InfoItem label="Address" value={loan.borrowerAddress || 'Not available'} />
                      <InfoItem label="Credit Score" value={loan.creditScore || 'Not available'} />
                      <InfoItem label="Experience Level" value={loan.borrowerExperience} />
                      <InfoItem label="Cash Reserves" value={loan.cashReserves ? `${loan.cashReserves} months` : 'Not available'} />
                    </Section>
                  </div>

                  <div>
                    <Section title="Entity Information" icon={<Briefcase size={20} style={{ color: COLORS.primary }} />}>
                      <InfoItem label="Entity Name" value={loan.entityName || 'Not available'} />
                      <InfoItem label="Entity Type" value={loan.entityType || 'Not available'} />
                      <InfoItem label="EIN" value={loan.ein || 'Not available'} />
                      <InfoItem label="State of Formation" value={loan.stateOfFormation || 'Not available'} />
                      <InfoItem label="Year Established" value={loan.yearEstablished || 'Not available'} />
                    </Section>
                  </div>
                </div>

                <Section title="Team Members" icon={<Users size={20} style={{ color: COLORS.primary }} />}>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: extendedColors.bgCard }}>
                      <div className="font-medium mb-2" style={{ color: COLORS.textPrimary }}>
                        No team members available
                      </div>
                    </div>
                  </div>
                </Section>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <LoanSidebar loan={loan} />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
} 