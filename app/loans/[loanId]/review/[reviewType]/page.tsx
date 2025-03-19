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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft,
  ClipboardCheck,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { loanDatabase } from '@/utilities/loanDatabase';
import { simpleDocumentService, SimpleDocument } from '@/utilities/simplifiedDocumentService';
import DocumentSockets from '@/components/document/DocumentSockets';
import LayoutWrapper from '@/app/layout-wrapper';
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
// This is a simplified version for the specific review page
const mockReviewData: ReviewData = {
  initial_inquiry: {
    status: 'incomplete',
    items: [
      { 
        id: 1, 
        name: 'Borrower Eligibility', 
        status: 'complete',
        description: 'Verify borrower meets eligibility requirements for the loan program',
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
        description: 'Evaluate property type, location, and basic characteristics',
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
        description: 'Verify loan request meets program parameters and guidelines',
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
        description: 'Verify borrower financial information and capacity',
        checklist: [
          { id: 'bfv1', text: 'Financial statement shows positive net worth', checked: false },
          { id: 'bfv2', text: 'Bank statements verify declared liquidity', checked: false },
          { id: 'bfv3', text: 'Minimum cash reserves confirmed (6+ months of payments)', checked: false },
          { id: 'bfv4', text: 'Income sources verified and documented', checked: false },
          { id: 'bfv5', text: 'Debt-to-income ratio below 50%', checked: false }
        ]
      }
    ]
  },
  property_evaluation: { status: 'not_started', items: [] },
  underwriting: { status: 'not_started', items: [] },
  closing_prep: { status: 'not_started', items: [] },
  closing: { status: 'not_started', items: [] },
  post_closing: { status: 'not_started', items: [] },
  servicing: { status: 'not_started', items: [] }
};

// Required documents based on review type
const requiredDocuments: Record<ReviewType, string[]> = {
  initial_inquiry: ['loan_application', 'credit_authorization', 'photo_id'],
  application: ['financial_statement', 'bank_statements', 'tax_returns'],
  property_evaluation: ['property_photos', 'title_report', 'purchase_contract'],
  underwriting: ['appraisal', 'renovation_budget', 'insurance_quote'],
  closing_prep: ['closing_disclosure', 'title_insurance', 'deed_of_trust'],
  closing: ['executed_package', 'promissory_note', 'security_agreement'],
  post_closing: ['recorded_documents', 'final_title_policy', 'compliance_checklist'],
  servicing: ['payment_schedule', 'escrow_setup', 'tax_monitoring']
};

export default function DetailedReviewPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.loanId as string;
  const reviewType = params.reviewType as ReviewType;
  const reviewItemId = params.reviewItemId as string | undefined;
  
  const [loan, setLoan] = useState<any>(null);
  const [reviewSection, setReviewSection] = useState<ReviewSection | null>(null);
  const [reviewItem, setReviewItem] = useState<ReviewItem | null>(null);
  const [documents, setDocuments] = useState<SimpleDocument[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [currentDocument, setCurrentDocument] = useState<SimpleDocument | null>(null);
  
  // Load loan data
  useEffect(() => {
    if (loanId) {
      const loanData = loanDatabase.getLoanById(loanId);
      if (loanData) {
        setLoan(loanData);
        
        // Initialize review data for this type
        setReviewSection(mockReviewData[reviewType]);
        
        // If reviewItemId is provided, find the specific item
        if (reviewItemId) {
          const item = mockReviewData[reviewType].items.find(
            (item) => item.id === parseInt(reviewItemId)
          );
          if (item) {
            setReviewItem(item);
          }
        } else {
          // Otherwise, set the first item as default
          if (mockReviewData[reviewType].items.length > 0) {
            setReviewItem(mockReviewData[reviewType].items[0]);
          }
        }
        
        // Load documents for this loan
        const loanDocuments = simpleDocumentService.getDocumentsForLoan(loanId);
        setDocuments(loanDocuments);
      }
    }
  }, [loanId, reviewType, reviewItemId]);
  
  // Render loading state
  if (!loan || !reviewSection) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </LayoutWrapper>
    );
  }
  
  // Handle checkbox change
  const handleCheckboxChange = (checklistId: string) => {
    if (!reviewItem) return;
    
    setReviewItem((prevItem) => {
      if (!prevItem || !prevItem.checklist) return prevItem;
      
      const updatedChecklist = prevItem.checklist.map((item) => {
        if (item.id === checklistId) {
          return { ...item, checked: !item.checked };
        }
        return item;
      });
      
      // Determine new status based on checklist completion
      const allChecked = updatedChecklist.every((item) => item.checked);
      const anyChecked = updatedChecklist.some((item) => item.checked);
      
      const newStatus = allChecked ? 'complete' : anyChecked ? 'incomplete' : 'not_started';
      
      return {
        ...prevItem,
        checklist: updatedChecklist,
        status: newStatus
      };
    });
  };
  
  // Save review changes
  const saveReviewChanges = () => {
    // Here you would implement the logic to save the review changes to your API or database
    alert('Review changes saved!');
  };
  
  // View a document
  const handleViewDocument = (document: SimpleDocument) => {
    setCurrentDocument(document);
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
  
  // Navigate between review items
  const navigateReviewItem = (direction: 'prev' | 'next') => {
    if (!reviewItem || !reviewSection) return;
    
    const currentIndex = reviewSection.items.findIndex((item) => item.id === reviewItem.id);
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : reviewSection.items.length - 1;
    } else {
      newIndex = currentIndex < reviewSection.items.length - 1 ? currentIndex + 1 : 0;
    }
    
    setReviewItem(reviewSection.items[newIndex]);
  };
  
  // Format reviewType for display
  const formatReviewType = (type: ReviewType): string => {
    switch (type) {
      case 'initial_inquiry':
        return 'Initial Inquiry & Pre-Qualification';
      case 'application':
        return 'Application & Initial Underwriting';
      case 'property_evaluation':
        return 'Property & Project Evaluation';
      case 'underwriting':
        return 'Comprehensive Underwriting';
      case 'closing_prep':
        return 'Closing Preparation';
      case 'closing':
        return 'Closing & Funding';
      case 'post_closing':
        return 'Post-Closing Quality Control';
      case 'servicing':
        return 'Servicing Setup & Monitoring';
      default:
        // This should never happen if we handle all cases above,
        // but TypeScript requires a default case
        const exhaustiveCheck: never = type;
        return exhaustiveCheck;
    }
  };
  
  return (
    <LayoutWrapper>
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Review Overview
          </button>
          <h1 className="text-3xl font-bold mt-4 text-white">
            {formatReviewType(reviewType)}
          </h1>
          <p className="text-lg mt-1 text-gray-400">
            {loan.propertyAddress}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* File Sockets-Left Side */}
          <div className="w-full lg:w-1/3 space-y-4">
            <Card className="bg-[#1A2234] border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">Required Documents</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload or generate required documents for this review stage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentSockets 
                  loanId={loanId} 
                  onViewDocument={handleViewDocument}
                  refreshTrigger={refreshKey}
                />
              </CardContent>
            </Card>
            
            {currentDocument && (
              <Card className="bg-[#1A2234] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg text-white">{currentDocument.filename}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setCurrentDocument(null)}
                  >
                    <ChevronLeft size={16} className="mr-1" />
                    Hide
                  </Button>
                </CardHeader>
                <CardContent className="p-1">
                  <div className="bg-white rounded h-[500px] overflow-auto">
                    {currentDocument.content.startsWith('<html') || currentDocument.content.includes('<!DOCTYPE html') ? (
                      <div 
                        className="h-full" 
                        dangerouslySetInnerHTML={{ __html: currentDocument.content }}
                      />
                    ) : (
                      <div className="p-4">
                        <pre className="whitespace-pre-wrap break-words">{currentDocument.content}</pre>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between p-4">
                  <Button variant="outline" size="sm">
                    <Download size={16} className="mr-1" />
                    Download
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Approve document logic
                        alert('Document approved!');
                      }}
                    >
                      <CheckCircle2 size={16} className="mr-1 text-green-500" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Reject document logic
                        alert('Document rejected!');
                      }}
                    >
                      <AlertCircle size={16} className="mr-1 text-red-500" />
                      Reject
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )}
          </div>
          
          {/* Right Side - Data Points and Checklist */}
          <div className="w-full lg:w-2/3 space-y-4">
            {/* Data Points - Top Right */}
            <Card className="bg-[#1A2234] border-gray-800">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Loan Data Points
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Key metrics and information for this loan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-[#141b2d] border-gray-800">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-400">Loan Amount</div>
                      <div className="text-2xl font-bold text-white">${loan.loanAmount.toLocaleString()}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#141b2d] border-gray-800">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-400">LTV</div>
                      <div className="text-2xl font-bold text-white">{loan.ltv}%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#141b2d] border-gray-800">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-400">Loan Term</div>
                      <div className="text-2xl font-bold text-white">{loan.term} Months</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#141b2d] border-gray-800">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-400">Interest Rate</div>
                      <div className="text-2xl font-bold text-white">{loan.interestRate}%</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#141b2d] border-gray-800">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-400">Property Type</div>
                      <div className="text-2xl font-bold text-white">{loan.propertyType}</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#141b2d] border-gray-800">
                    <CardContent className="p-4">
                      <div className="text-sm text-gray-400">Borrower</div>
                      <div className="text-2xl font-bold text-white">{loan.borrowerName}</div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
            
            {/* Review Checklist - Bottom Right */}
            {reviewItem && (
              <Card className="bg-[#1A2234] border-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-white">
                      {reviewItem.name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {reviewItem.description || 'Complete the following checklist items'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigateReviewItem('prev')}
                      disabled={reviewSection.items.length <= 1}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <div className="flex items-center">
                      {getStatusIcon(reviewItem.status)}
                      <span className="ml-2 text-sm" style={{ color: reviewItem.status === 'complete' ? '#10B981' : reviewItem.status === 'incomplete' ? '#FBBF24' : '#6B7280' }}>
                        {getStatusText(reviewItem.status)}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigateReviewItem('next')}
                      disabled={reviewSection.items.length <= 1}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {reviewItem.checklist ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {reviewItem.checklist.map((checkItem) => (
                          <div key={checkItem.id} className="flex items-start py-2 border-b border-gray-800">
                            <div className="flex h-5 items-center">
                              <input
                                type="checkbox"
                                checked={checkItem.checked}
                                onChange={() => handleCheckboxChange(checkItem.id)}
                                className="h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-600"
                              />
                            </div>
                            <label className="ml-2 text-sm text-gray-300">
                              {checkItem.text}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Review Notes
                        </label>
                        <Textarea 
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any notes or observations related to this review item..."
                          className="min-h-[100px] bg-[#141b2d] border-gray-800 text-gray-300"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      No checklist items for this review section
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="default" 
                    onClick={saveReviewChanges}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save size={16} className="mr-2" />
                    Save Review
                  </Button>
                  
                  <Button 
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      if (reviewItem.checklist?.every(item => item.checked)) {
                        alert('Review item completed successfully!');
                      } else {
                        alert('Please complete all checklist items before marking as complete.');
                      }
                    }}
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    Mark as Complete
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
} 