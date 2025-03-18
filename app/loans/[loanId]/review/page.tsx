'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  ClipboardCheck,
  FileCheck,
  FileSignature,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Home,
  Briefcase,
  FileText,
  ExternalLink
} from 'lucide-react';
import { loanDatabase } from '@/utilities/loanDatabase';
import LayoutWrapper from '@/app/layout-wrapper';
import LoanSidebar from '@/components/loan/LoanSidebar';
import { COLORS } from '@/app/theme/colors';

// Define review types
type ReviewType = 'initial_inquiry' | 'application' | 'property_evaluation' | 'underwriting' | 'closing_prep' | 'closing' | 'post_closing' | 'servicing';

// Define types for review items and checklist items
type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
};

type ReviewItem = {
  id: number;
  name: string;
  status: string;
  checklist?: ChecklistItem[];
  description?: string;
};

type ReviewSection = {
  status: string;
  items: ReviewItem[];
};

type ReviewData = {
  [key in ReviewType]: ReviewSection;
};

// Mock review data - in a real app, this would come from an API or database
const mockReviewData: ReviewData = {
  initial_inquiry: {
    status: 'incomplete',
    items: [
      { 
        id: 1, 
        name: 'Borrower Eligibility', 
        status: 'complete',
        checklist: [
          { id: 'be1', text: 'Credit score meets minimum program threshold (650+ for Fix-and-Flip, 680+ for other programs)', checked: true },
          { id: 'be2', text: 'No foreclosures or bankruptcies within past 3 years', checked: true },
          { id: 'be3', text: 'No outstanding judgments exceeding $10,000', checked: true },
          { id: 'be4', text: 'Borrower is not on OFAC list', checked: true },
          { id: 'be5', text: 'Borrower\'s experience level appropriately classified (Tier 1, 2, or 3)', checked: true }
        ]
      },
      { 
        id: 2, 
        name: 'Property Preliminary Assessment', 
        status: 'incomplete',
        checklist: [
          { id: 'ppa1', text: 'Property type is on approved list', checked: true },
          { id: 'ppa2', text: 'Property is not owner-occupied', checked: true },
          { id: 'ppa3', text: 'Property location is within lending territory', checked: true },
          { id: 'ppa4', text: 'Property size exceeds 500 square feet', checked: false },
          { id: 'ppa5', text: 'Property is not a mobile/manufactured home', checked: true },
          { id: 'ppa6', text: 'No known environmental issues', checked: false }
        ]
      },
      { 
        id: 3, 
        name: 'Loan Parameters', 
        status: 'incomplete',
        checklist: [
          { id: 'lp1', text: 'Requested loan amount within program limits', checked: true },
          { id: 'lp2', text: 'Preliminary LTV within program guidelines', checked: false },
          { id: 'lp3', text: 'Loan purpose aligns with program objectives', checked: true },
          { id: 'lp4', text: 'Loan term request is within guidelines', checked: true },
          { id: 'lp5', text: 'Preliminary exit strategy is viable', checked: false }
        ]
      }
    ]
  },
  application: {
    status: 'not_started',
    items: [
      { 
        id: 1, 
        name: 'Borrower Financial Verification', 
        status: 'not_started',
        checklist: [
          { id: 'bfv1', text: 'Financial statement shows positive net worth', checked: false },
          { id: 'bfv2', text: 'Bank statements verify declared liquidity', checked: false },
          { id: 'bfv3', text: 'Minimum cash reserves confirmed (6+ months of payments)', checked: false },
          { id: 'bfv4', text: 'Income sources verified and documented', checked: false },
          { id: 'bfv5', text: 'Debt-to-income ratio below 50%', checked: false },
          { id: 'bfv6', text: 'Credit report details match application information', checked: false },
          { id: 'bfv7', text: 'All credit issues have adequate explanations', checked: false },
          { id: 'bfv8', text: 'Schedule of real estate owned verified with no undisclosed foreclosures', checked: false }
        ]
      },
      { 
        id: 2, 
        name: 'Entity Verification', 
        status: 'not_started',
        checklist: [
          { id: 'ev1', text: 'Entity is in good standing with state', checked: false },
          { id: 'ev2', text: 'Formation documents are complete and current', checked: false },
          { id: 'ev3', text: 'Signatory authority verified', checked: false },
          { id: 'ev4', text: 'Operating agreement allows for borrowing', checked: false },
          { id: 'ev5', text: 'Entity structure meets lender requirements', checked: false }
        ]
      },
      { 
        id: 3, 
        name: 'Property Documentation Review', 
        status: 'not_started',
        checklist: [
          { id: 'pdr1', text: 'Property address and legal description match across all documents', checked: false },
          { id: 'pdr2', text: 'Purchase contract is fully executed with all addenda', checked: false },
          { id: 'pdr3', text: 'Purchase price is consistent across all documents', checked: false },
          { id: 'pdr4', text: 'Property photos support condition described in application', checked: false },
          { id: 'pdr5', text: 'Preliminary title report shows marketable title', checked: false },
          { id: 'pdr6', text: 'Property taxes are current', checked: false },
          { id: 'pdr7', text: 'No undisclosed liens or encumbrances', checked: false },
          { id: 'pdr8', text: 'No zoning violations identified', checked: false }
        ]
      }
    ]
  },
  property_evaluation: {
    status: 'not_started',
    items: [
      { 
        id: 1, 
        name: 'Appraisal Review', 
        status: 'not_started',
        checklist: [
          { id: 'ar1', text: 'Appraisal completed by approved appraiser', checked: false },
          { id: 'ar2', text: 'Appraised value supports LTV requirements', checked: false },
          { id: 'ar3', text: 'Comparables are appropriate (location, size, condition)', checked: false },
          { id: 'ar4', text: 'Appraiser\'s adjustments are reasonable', checked: false },
          { id: 'ar5', text: 'Discrepancies between appraised value and purchase price explained', checked: false },
          { id: 'ar6', text: 'ARV (After Repair Value) is supported by comparable sales (for fix-and-flip)', checked: false },
          { id: 'ar7', text: 'Special property features properly valued', checked: false }
        ]
      },
      { 
        id: 2, 
        name: 'Property Condition Assessment', 
        status: 'not_started',
        checklist: [
          { id: 'pca1', text: 'Inspection report received and reviewed', checked: false },
          { id: 'pca2', text: 'No major structural issues identified', checked: false },
          { id: 'pca3', text: 'All systems (electrical, plumbing, HVAC) functional or included in renovation budget', checked: false },
          { id: 'pca4', text: 'No evidence of water damage, mold, or pest infestation', checked: false },
          { id: 'pca5', text: 'Environmental issues addressed (if applicable)', checked: false },
          { id: 'pca6', text: 'Property condition matches description in loan application', checked: false },
          { id: 'pca7', text: 'Health and safety issues identified and addressed', checked: false }
        ]
      },
      { 
        id: 3, 
        name: 'Renovation/Construction Review', 
        status: 'not_started',
        checklist: [
          { id: 'rcr1', text: 'Budget includes line-item breakdown', checked: false },
          { id: 'rcr2', text: 'Cost estimates are reasonable for scope', checked: false },
          { id: 'rcr3', text: 'Contingency of at least 10% included', checked: false },
          { id: 'rcr4', text: 'Timeline is realistic', checked: false },
          { id: 'rcr5', text: 'Contractor is licensed and insured', checked: false },
          { id: 'rcr6', text: 'Contractor has experience with similar projects', checked: false },
          { id: 'rcr7', text: 'Necessary permits have been identified', checked: false },
          { id: 'rcr8', text: 'Plans comply with local building codes', checked: false },
          { id: 'rcr9', text: 'Draw schedule is appropriate for project milestones', checked: false }
        ]
      },
      { 
        id: 4, 
        name: 'Rental Property Assessment', 
        status: 'not_started',
        checklist: [
          { id: 'rpa1', text: 'Current/projected rents supported by market data', checked: false },
          { id: 'rpa2', text: 'Expense projections are reasonable', checked: false },
          { id: 'rpa3', text: 'Calculated DSCR meets minimum program requirement (1.25+ for Rental/BRRRR, 1.3+ for Commercial)', checked: false },
          { id: 'rpa4', text: 'Leases reviewed for problematic terms (if existing rental)', checked: false },
          { id: 'rpa5', text: 'Property management plan in place', checked: false },
          { id: 'rpa6', text: 'Vacancy rate assumptions are market-appropriate', checked: false }
        ]
      }
    ]
  },
  underwriting: {
    status: 'not_started',
    items: [
      { 
        id: 1, 
        name: 'Final Loan-to-Value Analysis', 
        status: 'not_started',
        checklist: [
          { id: 'flva1', text: 'LTV calculation based on lesser of purchase price or appraised value', checked: false },
          { id: 'flva2', text: 'LTV/LTC within program parameters', checked: false },
          { id: 'flva3', text: 'LTV adjusted appropriately for borrower risk tier', checked: false },
          { id: 'flva4', text: 'Combined LTV considered (if secondary financing)', checked: false },
          { id: 'flva5', text: 'Value adjustments for property condition documented', checked: false }
        ]
      },
      { 
        id: 2, 
        name: 'Cash Flow Analysis', 
        status: 'not_started',
        checklist: [
          { id: 'cfa1', text: 'DSCR calculation verified with stress-tested interest rates', checked: false },
          { id: 'cfa2', text: 'Global cash flow analysis for borrower\'s entire portfolio', checked: false },
          { id: 'cfa3', text: 'Liquidity sufficient for project and other obligations', checked: false },
          { id: 'cfa4', text: 'Net operating income calculation verified (commercial)', checked: false },
          { id: 'cfa5', text: 'Cap rate within market expectations (commercial)', checked: false }
        ]
      },
      { 
        id: 3, 
        name: 'Exit Strategy Verification', 
        status: 'not_started',
        checklist: [
          { id: 'esv1', text: 'Primary exit strategy supported by market data', checked: false },
          { id: 'esv2', text: 'Refinance qualification analysis (if BRRRR)', checked: false },
          { id: 'esv3', text: 'Sales comparables support target sale price (if fix-and-flip)', checked: false },
          { id: 'esv4', text: 'Realistic timeline for exit execution', checked: false },
          { id: 'esv5', text: 'Backup exit strategy identified', checked: false },
          { id: 'esv6', text: 'Market absorption rate supports timeline', checked: false }
        ]
      },
      { 
        id: 4, 
        name: 'Risk Assessment & Mitigants', 
        status: 'not_started',
        checklist: [
          { id: 'ram1', text: 'All identified risks have listed mitigants', checked: false },
          { id: 'ram2', text: 'Property location risks assessed (flood, wildfire, etc.)', checked: false },
          { id: 'ram3', text: 'Market risks evaluated (supply, demand, trends)', checked: false },
          { id: 'ram4', text: 'Borrower experience appropriate for project complexity', checked: false },
          { id: 'ram5', text: 'Exit strategy risks identified and addressed', checked: false },
          { id: 'ram6', text: 'Construction/renovation risks addressed', checked: false }
        ]
      },
      { 
        id: 5, 
        name: 'State-Specific Compliance', 
        status: 'not_started',
        checklist: [
          { id: 'ssc1', text: 'Interest rate complies with state usury laws', checked: false },
          { id: 'ssc2', text: 'Required state-specific disclosures identified', checked: false },
          { id: 'ssc3', text: 'Special state loan documents prepared', checked: false },
          { id: 'ssc4', text: 'State-specific property requirements addressed', checked: false },
          { id: 'ssc5', text: 'Local lending regulations complied with', checked: false }
        ]
      },
      { 
        id: 6, 
        name: 'Exception Analysis', 
        status: 'not_started',
        checklist: [
          { id: 'ea1', text: 'All exceptions to guidelines clearly documented', checked: false },
          { id: 'ea2', text: 'Compensating factors identified for each exception', checked: false },
          { id: 'ea3', text: 'Additional risk mitigation measures specified', checked: false },
          { id: 'ea4', text: 'Required approval levels obtained for exceptions', checked: false },
          { id: 'ea5', text: 'Exception falls within acceptable parameters', checked: false }
        ]
      }
    ]
  },
  closing_prep: {
    status: 'not_started',
    items: [
      { 
        id: 1, 
        name: 'Document Preparation', 
        status: 'not_started',
        checklist: [
          { id: 'dp1', text: 'Loan documents prepared according to approved terms', checked: false },
          { id: 'dp2', text: 'All state-specific language included', checked: false },
          { id: 'dp3', text: 'Documents reflect correct borrower/entity information', checked: false },
          { id: 'dp4', text: 'Property described correctly in all documents', checked: false },
          { id: 'dp5', text: 'Loan terms match final approval', checked: false },
          { id: 'dp6', text: 'Fee structure accurately reflected', checked: false },
          { id: 'dp7', text: 'All required disclosures included', checked: false }
        ]
      },
      { 
        id: 2, 
        name: 'Title & Insurance Verification', 
        status: 'not_started',
        checklist: [
          { id: 'tiv1', text: 'Final title report reviewed', checked: false },
          { id: 'tiv2', text: 'All title exceptions reviewed and approved', checked: false },
          { id: 'tiv3', text: 'Survey reviewed (if applicable)', checked: false },
          { id: 'tiv4', text: 'Property insurance meets coverage requirements', checked: false },
          { id: 'tiv5', text: 'Lender named as mortgagee/loss payee', checked: false },
          { id: 'tiv6', text: 'Flood insurance in place (if in flood zone)', checked: false },
          { id: 'tiv7', text: 'Builder\'s risk policy in place (if construction)', checked: false },
          { id: 'tiv8', text: 'Liability coverage meets requirements', checked: false }
        ]
      },
      { 
        id: 3, 
        name: 'Closing Logistics', 
        status: 'not_started',
        checklist: [
          { id: 'cl1', text: 'Closing agent confirmed', checked: false },
          { id: 'cl2', text: 'Closing disclosure prepared and reviewed', checked: false },
          { id: 'cl3', text: 'Settlement statement reconciled', checked: false },
          { id: 'cl4', text: 'Escrow instructions prepared', checked: false },
          { id: 'cl5', text: 'Funding amount confirmed', checked: false },
          { id: 'cl6', text: 'Wire instructions verified', checked: false },
          { id: 'cl7', text: 'Signatory availability confirmed', checked: false },
          { id: 'cl8', text: 'All conditions to funding addressed', checked: false }
        ]
      }
    ]
  },
  closing: {
    status: 'not_started',
    items: [
      { 
        id: 1, 
        name: 'Document Execution', 
        status: 'not_started',
        checklist: [
          { id: 'de1', text: 'All required documents properly executed', checked: false },
          { id: 'de2', text: 'Signatures match authorized signatories', checked: false },
          { id: 'de3', text: 'No alterations to documents without approval', checked: false },
          { id: 'de4', text: 'All applicable notarizations completed', checked: false },
          { id: 'de5', text: 'All required initials present', checked: false },
          { id: 'de6', text: 'All exhibits attached and referenced correctly', checked: false },
          { id: 'de7', text: 'Receipt of disclosures acknowledged', checked: false }
        ]
      },
      { 
        id: 2, 
        name: 'Funding Authorization', 
        status: 'not_started',
        checklist: [
          { id: 'fa1', text: 'All closing conditions satisfied', checked: false },
          { id: 'fa2', text: 'Verification that no material changes have occurred', checked: false },
          { id: 'fa3', text: 'Required down payment/equity injection verified', checked: false },
          { id: 'fa4', text: 'Closing costs paid as agreed', checked: false },
          { id: 'fa5', text: 'Disbursement instructions clear and verified', checked: false },
          { id: 'fa6', text: 'Wire security protocols followed', checked: false },
          { id: 'fa7', text: 'Funding confirmation received', checked: false }
        ]
      },
      { 
        id: 3, 
        name: 'Recording & Security Verification', 
        status: 'not_started',
        checklist: [
          { id: 'rsv1', text: 'Documents delivered for recording', checked: false },
          { id: 'rsv2', text: 'Priority of lien confirmed', checked: false },
          { id: 'rsv3', text: 'Recording numbers received', checked: false },
          { id: 'rsv4', text: 'Final title policy issued or committed', checked: false },
          { id: 'rsv5', text: 'UCC filings completed (if applicable)', checked: false },
          { id: 'rsv6', text: 'Assignment of leases recorded (if applicable)', checked: false }
        ]
      }
    ]
  },
  post_closing: {
    status: 'not_started',
    items: [
      { 
        id: 1, 
        name: 'File Completeness', 
        status: 'not_started',
        checklist: [
          { id: 'fc1', text: 'All required documents present in file', checked: false },
          { id: 'fc2', text: 'All documents properly executed', checked: false },
          { id: 'fc3', text: 'All approval conditions satisfied and documented', checked: false },
          { id: 'fc4', text: 'Exception documentation complete (if applicable)', checked: false },
          { id: 'fc5', text: 'State and federal compliance verified', checked: false }
        ]
      },
      { 
        id: 2, 
        name: 'Policy Adherence', 
        status: 'not_started',
        checklist: [
          { id: 'pa1', text: 'Underwriting guidelines followed', checked: false },
          { id: 'pa2', text: 'Pricing consistent with guidelines', checked: false },
          { id: 'pa3', text: 'Approval authorities respected', checked: false },
          { id: 'pa4', text: 'Risk tier classification appropriate', checked: false },
          { id: 'pa5', text: 'Documentation exceptions properly approved', checked: false }
        ]
      },
      { 
        id: 3, 
        name: 'Data Integrity', 
        status: 'not_started',
        checklist: [
          { id: 'di1', text: 'Loan system data matches documents', checked: false },
          { id: 'di2', text: 'Loan terms entered correctly', checked: false },
          { id: 'di3', text: 'Borrower information accurate', checked: false },
          { id: 'di4', text: 'Property information accurate', checked: false },
          { id: 'di5', text: 'Payment and due date information correct', checked: false }
        ]
      }
    ]
  },
  servicing: {
    status: 'not_started',
    items: [
      { 
        id: 1, 
        name: 'Loan Boarding', 
        status: 'not_started',
        checklist: [
          { id: 'lb1', text: 'Loan boarded to servicing system', checked: false },
          { id: 'lb2', text: 'Payment instructions provided to borrower', checked: false },
          { id: 'lb3', text: 'Automatic payment setup completed (if applicable)', checked: false },
          { id: 'lb4', text: 'Tax and insurance monitoring set up', checked: false },
          { id: 'lb5', text: 'Draw procedures established (if applicable)', checked: false }
        ]
      },
      { 
        id: 2, 
        name: 'Ongoing Monitoring Checks', 
        status: 'not_started',
        checklist: [
          { id: 'omc1', text: 'Timely payments verified', checked: false },
          { id: 'omc2', text: 'Tax payments confirmed', checked: false },
          { id: 'omc3', text: 'Insurance renewals tracked', checked: false },
          { id: 'omc4', text: 'Property inspections scheduled', checked: false },
          { id: 'omc5', text: 'Construction progress monitored (if applicable)', checked: false },
          { id: 'omc6', text: 'Draw requests verified against completed work', checked: false },
          { id: 'omc7', text: 'Covenant compliance verified', checked: false },
          { id: 'omc8', text: 'Exit strategy progress tracked', checked: false }
        ]
      }
    ]
  }
};

export default function LoanReviewPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.loanId as string;
  
  const [loan, setLoan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ReviewType>('initial_inquiry');
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  
  // Load loan data
  useEffect(() => {
    if (loanId) {
      const loanData = loanDatabase.getLoanById(loanId);
      if (loanData) {
        setLoan(loanData);
        // Initialize review data
        setReviewData(mockReviewData);
      }
    }
  }, [loanId]);
  
  // Render loading state
  if (!loan || !reviewData) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </LayoutWrapper>
    );
  }
  
  // Handle checkbox change
  const handleCheckboxChange = (sectionId: ReviewType, itemId: number, checklistId: string) => {
    setReviewData((prevData: ReviewData | null) => {
      if (!prevData) return null;
      
      const newData = { ...prevData };
      const section = newData[sectionId];
      const item = section.items.find((i: ReviewItem) => i.id === itemId);
      
      if (item && item.checklist) {
        const checklistItem = item.checklist.find((c: ChecklistItem) => c.id === checklistId);
        if (checklistItem) {
          checklistItem.checked = !checklistItem.checked;
          
          // Update item status based on checklist completion
          const allChecked = item.checklist.every((c: ChecklistItem) => c.checked);
          const anyChecked = item.checklist.some((c: ChecklistItem) => c.checked);
          
          if (allChecked) {
            item.status = 'complete';
          } else if (anyChecked) {
            item.status = 'incomplete';
          } else {
            item.status = 'not_started';
          }
          
          // Update section status based on item statuses
          const allItemsComplete = section.items.every((i: ReviewItem) => i.status === 'complete');
          const anyItemsStarted = section.items.some((i: ReviewItem) => i.status === 'complete' || i.status === 'incomplete');
          
          if (allItemsComplete) {
            section.status = 'complete';
          } else if (anyItemsStarted) {
            section.status = 'incomplete';
          } else {
            section.status = 'not_started';
          }
        }
      }
      
      return newData;
    });
  };
  
  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'incomplete':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'not_started':
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Get status text based on status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'incomplete':
        return 'In Progress';
      case 'not_started':
      default:
        return 'Not Started';
    }
  };

  // Open detailed review in a new tab
  const openDetailedReview = (reviewType: ReviewType, itemId?: number) => {
    const url = `/loans/${loanId}/review/${reviewType}${itemId ? `/${itemId}` : ''}`;
    window.open(url, '_blank');
  };
  
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
            Loan Review Process for #{loanId}
          </h1>
          <p className="text-lg mt-1 text-gray-400">
            {loan.propertyAddress}
          </p>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-6">
          {/* Main Content */}
          <div className="w-full lg:w-3/4 space-y-6">
            <Card className="bg-[#1A2234] border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Review Progress Overview</CardTitle>
                <CardDescription className="text-gray-400">
                  Click on any review item to open the detailed review interface in a new tab
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(reviewData).map(([reviewType, section]) => (
                    <Card key={reviewType} className="bg-[#141b2d] border-gray-800 hover:border-gray-700 transition-colors">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg text-white">
                            {reviewType === 'initial_inquiry' && 'Initial Inquiry'}
                            {reviewType === 'application' && 'Application'}
                            {reviewType === 'property_evaluation' && 'Property Evaluation'}
                            {reviewType === 'underwriting' && 'Underwriting'}
                            {reviewType === 'closing_prep' && 'Closing Prep'}
                            {reviewType === 'closing' && 'Closing'}
                            {reviewType === 'post_closing' && 'Post-Closing'}
                            {reviewType === 'servicing' && 'Servicing'}
                          </CardTitle>
                          <div className="flex items-center">
                            {getStatusIcon(section.status)}
                          </div>
                        </div>
                        <CardDescription className="text-gray-400">
                          {getStatusText(section.status)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 pb-2">
                        <div className="text-xs text-gray-400 mb-2">
                          {section.items.length} review items
                        </div>
                        <div className="h-2 bg-gray-800 rounded overflow-hidden">
                          <div 
                            className="h-full rounded" 
                            style={{ 
                              width: `${section.items.filter(item => item.status === 'complete').length / section.items.length * 100}%`,
                              backgroundColor: section.status === 'complete' ? '#10B981' : section.status === 'incomplete' ? '#FBBF24' : '#6B7280' 
                            }}
                          ></div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-2">
                        <Button 
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => openDetailedReview(reviewType as ReviewType)}
                        >
                          <ExternalLink size={16} className="mr-2" />
                          Open Full Review
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1A2234] border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Review Items</CardTitle>
                <CardDescription className="text-gray-400">
                  Click on any item to open its detailed review interface
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs 
                  defaultValue="initial_inquiry" 
                  onValueChange={(value) => setActiveTab(value as ReviewType)}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-4 bg-[#0A0F1A] p-0 rounded-lg mb-4">
                    <TabsTrigger 
                      value="initial_inquiry" 
                      className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                    >
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      Initial Inquiry
                    </TabsTrigger>
                    <TabsTrigger 
                      value="application" 
                      className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                    >
                      <FileCheck className="h-4 w-4 mr-2" />
                      Application
                    </TabsTrigger>
                    <TabsTrigger 
                      value="property_evaluation" 
                      className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Property
                    </TabsTrigger>
                    <TabsTrigger 
                      value="underwriting" 
                      className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Underwriting
                    </TabsTrigger>
                    <TabsTrigger 
                      value="closing_prep" 
                      className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Closing Prep
                    </TabsTrigger>
                    <TabsTrigger 
                      value="closing" 
                      className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                    >
                      <FileSignature className="h-4 w-4 mr-2" />
                      Closing
                    </TabsTrigger>
                    <TabsTrigger 
                      value="post_closing" 
                      className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Post-Closing
                    </TabsTrigger>
                    <TabsTrigger 
                      value="servicing" 
                      className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Servicing
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={activeTab} className="mt-0">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviewData[activeTab].items.map((item: ReviewItem) => (
                          <Card key={item.id} className="bg-[#141b2d] border-gray-800 hover:border-gray-700 transition-colors">
                            <CardHeader className="p-4 flex flex-row items-center justify-between">
                              <div>
                                <CardTitle className="text-white">{item.name}</CardTitle>
                              </div>
                              <div className="flex items-center">
                                {getStatusIcon(item.status)}
                                <span className="ml-2 text-sm" style={{ color: item.status === 'complete' ? '#10B981' : item.status === 'incomplete' ? '#FBBF24' : '#6B7280' }}>
                                  {getStatusText(item.status)}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                              {item.checklist && (
                                <div className="mb-4">
                                  <p className="text-sm text-gray-400 mb-2">
                                    {item.checklist.filter(c => c.checked).length} of {item.checklist.length} items completed
                                  </p>
                                  <div className="h-2 bg-gray-800 rounded overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-600 rounded" 
                                      style={{ 
                                        width: `${(item.checklist.filter(c => c.checked).length / item.checklist.length) * 100}%` 
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                              
                              <Button 
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => openDetailedReview(activeTab, item.id)}
                              >
                                <ExternalLink size={16} className="mr-2" />
                                Open Detailed Review
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <LoanSidebar loan={loan} activePage="review" />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
} 