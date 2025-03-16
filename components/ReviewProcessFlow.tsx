import React, { useState, useEffect, ChangeEvent } from 'react';
import { useLoanContext } from './LoanContextProvider';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText,
  User,
  Building,
  DollarSign,
  Calendar,
  Home,
  Briefcase,
  Map,
  TrendingUp,
  Shield
} from 'lucide-react';
import documentDatabase from '../utilities/documentDatabase';
import { Textarea } from '../components/ui/textarea';

// Define review stages based on Atlas Capital's underwriting process
const REVIEW_STAGES = [
  {
    id: 'initial_application',
    name: 'Initial Application & Pre-Qualification',
    requiredDocuments: [
      'loan_application', 
      'photo_id', 
      'credit_authorization', 
      'proof_of_funds'
    ],
    description: 'Review initial application and pre-qualify the borrower',
    timeline: '24-48 hours'
  },
  {
    id: 'property_evaluation',
    name: 'Property Evaluation',
    requiredDocuments: [
      'title_report', 
      'property_photos', 
      'purchase_contract', 
      'comparative_market_analysis', 
      'renovation_budget'
    ],
    description: 'Evaluate the property and review supporting documentation',
    timeline: '3-5 business days'
  },
  {
    id: 'borrower_financial',
    name: 'Borrower Financial Analysis',
    requiredDocuments: [
      'financial_statement', 
      'tax_returns', 
      'bank_statements', 
      'real_estate_schedule', 
      'business_documents'
    ],
    description: 'Analyze borrower financials and creditworthiness',
    timeline: '2-3 business days'
  },
  {
    id: 'exit_strategy',
    name: 'Exit Strategy Validation',
    requiredDocuments: [
      'exit_strategy_statement', 
      'market_data', 
      'timeline'
    ],
    description: 'Validate the borrower\'s exit strategy',
    timeline: '1-2 business days'
  },
  {
    id: 'final_underwriting',
    name: 'Final Underwriting & Approval',
    requiredApprovers: ['underwriter', 'loan_committee'],
    description: 'Final review and approval decision',
    timeline: '5-7 business days'
  },
  {
    id: 'closing_process',
    name: 'Closing Process',
    requiredDocuments: [
      'signed_term_sheet', 
      'insurance_binder', 
      'entity_documents'
    ],
    description: 'Prepare for closing and fund the loan',
    timeline: '7-10 business days'
  }
];

// Define document types required for Atlas Capital's underwriting process
const DOCUMENT_TYPES = {
  loan_application: 'Atlas Capital Loan Application',
  photo_id: 'Government-Issued Photo ID',
  credit_authorization: 'Credit Authorization Form',
  proof_of_funds: 'Proof of Funds for Down Payment',
  title_report: 'Preliminary Title Report',
  property_photos: 'Property Photos (Interior/Exterior)',
  purchase_contract: 'Purchase Contract',
  comparative_market_analysis: 'Comparative Market Analysis',
  renovation_budget: 'Renovation Budget',
  financial_statement: 'Personal Financial Statement',
  tax_returns: 'Last 2 Years Tax Returns',
  bank_statements: 'Last 3 Months Bank Statements',
  real_estate_schedule: 'Schedule of Real Estate Owned',
  business_documents: 'Business Formation Documents',
  exit_strategy_statement: 'Detailed Exit Strategy Statement',
  market_data: 'Supporting Market Data',
  timeline: 'Exit Strategy Timeline',
  signed_term_sheet: 'Signed Term Sheet',
  insurance_binder: 'Insurance Binder',
  entity_documents: 'Entity Documents'
};

// Define evaluation criteria for each stage
const EVALUATION_CRITERIA = {
  initial_application: [
    'Credit score meets minimum program requirements',
    'Property aligns with lending guidelines',
    'Feasible exit strategy',
    'Sufficient cash reserves (minimum 6 months of loan payments)'
  ],
  property_evaluation: [
    'Property condition assessment',
    'Valuation verification',
    'Title review',
    'Market analysis',
    'Renovation budget review (if applicable)'
  ],
  borrower_financial: [
    'Debt-to-income ratio below 50%',
    'Sufficient liquidity (minimum 10% of loan amount in reserves)',
    'Stable income sources',
    'History of timely debt payments',
    'Clean background check (no financial felonies)',
    'Experience level appropriate for project scope'
  ],
  exit_strategy: [
    'Realistic timeline',
    'Market-supported valuation expectations',
    'Feasible execution plan',
    'Backup exit options'
  ],
  final_underwriting: [
    'Complete documentation package',
    'Satisfactory property condition and value',
    'Borrower financial strength',
    'Experience level',
    'Exit strategy viability',
    'Compliance with all guidelines',
    'Risk-adjusted return analysis'
  ],
  closing_process: [
    'Final title review',
    'Document preparation',
    'Closing coordination',
    'Funds disbursement',
    'Establishment of draw schedule (if applicable)'
  ]
};

export default function ReviewProcessFlow() {
  const { activeLoan, loanDocuments } = useLoanContext();
  const [currentStage, setCurrentStage] = useState('initial_application');
  const [stageStatus, setStageStatus] = useState<Record<string, 'pending' | 'in_progress' | 'completed' | 'issues'>>({});
  const [extractedData, setExtractedData] = useState<Record<string, string | number>>({});
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [issueNote, setIssueNote] = useState('');
  
  // Initialize the process
  useEffect(() => {
    if (activeLoan) {
      // Initialize the document database
      documentDatabase.initialize();
      
      // Get any existing document data for this loan
      const loanData = documentDatabase.getDataForLoan(activeLoan.id);
      
      // Combine all extracted data
      const combinedData = documentDatabase.getAggregatedLoanData(activeLoan.id);
      setExtractedData(combinedData);
      
      // Initialize stage status
      const initialStatus: Record<string, 'pending' | 'in_progress' | 'completed' | 'issues'> = {};
      REVIEW_STAGES.forEach(stage => {
        initialStatus[stage.id] = 'pending';
      });
      
      // Set first stage to in_progress
      initialStatus['initial_application'] = 'in_progress';
      
      setStageStatus(initialStatus);
    }
  }, [activeLoan]);
  
  // Calculate completion for current stage
  const calculateStageCompletion = (stageId: string) => {
    const stage = REVIEW_STAGES.find(s => s.id === stageId);
    if (!stage) return 0;
    
    if (stage.requiredDocuments) {
      const required = stage.requiredDocuments.length;
      const completed = stage.requiredDocuments.filter(doc => 
        loanDocuments.some(ld => ld.docType === doc && ld.status === 'approved')
      ).length;
      
      return Math.floor((completed / required) * 100);
    }
    
    if (stage.requiredApprovers) {
      const required = stage.requiredApprovers.length;
      const completed = stage.requiredApprovers.filter(approver => 
        reviewNotes[`${stageId}_${approver}`]
      ).length;
      
      return Math.floor((completed / required) * 100);
    }
    
    return 0;
  };
  
  // Complete current stage and move to next
  const completeCurrentStage = () => {
    const currentIndex = REVIEW_STAGES.findIndex(s => s.id === currentStage);
    if (currentIndex < 0 || currentIndex >= REVIEW_STAGES.length - 1) return;
    
    const nextStage = REVIEW_STAGES[currentIndex + 1].id;
    
    setStageStatus(prev => ({
      ...prev,
      [currentStage]: 'completed',
      [nextStage]: 'in_progress'
    }));
    
    setCurrentStage(nextStage);
  };
  
  // Report issues with current stage
  const reportIssues = () => {
    if (!issueNote.trim()) return;
    
    setStageStatus(prev => ({
      ...prev,
      [currentStage]: 'issues'
    }));
    
    setReviewNotes(prev => ({
      ...prev,
      [`${currentStage}_issues`]: issueNote
    }));
    
    setIssueNote('');
  };
  
  // Handle note changes
  const handleNoteChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setIssueNote(e.target.value);
  };
  
  // Handle approver note changes
  const handleApproverNoteChange = (approver: string, note: string) => {
    setReviewNotes(prev => ({
      ...prev,
      [`${currentStage}_${approver}`]: note
    }));
  };
  
  // Get icon for stage
  const getStageIcon = (stageId: string) => {
    switch (stageId) {
      case 'initial_application':
        return <FileText className="h-5 w-5" />;
      case 'property_evaluation':
        return <Home className="h-5 w-5" />;
      case 'borrower_financial':
        return <User className="h-5 w-5" />;
      case 'exit_strategy':
        return <TrendingUp className="h-5 w-5" />;
      case 'final_underwriting':
        return <Briefcase className="h-5 w-5" />;
      case 'closing_process':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };
  
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'issues':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Loan Review Process</h2>
        <div className="text-sm text-gray-500">
          Loan ID: {activeLoan?.id}
        </div>
      </div>
      
      {/* Progress indicators */}
      <div className="flex justify-between">
        {REVIEW_STAGES.map((stage, index) => (
          <div key={stage.id} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              stageStatus[stage.id] === 'completed' ? 'bg-green-100 text-green-600' :
              stageStatus[stage.id] === 'in_progress' ? 'bg-blue-100 text-blue-600' :
              stageStatus[stage.id] === 'issues' ? 'bg-red-100 text-red-600' :
              'bg-gray-100 text-gray-400'
            }`}>
              {stageStatus[stage.id] === 'completed' ? <CheckCircle size={20} /> :
               stageStatus[stage.id] === 'in_progress' ? <Clock size={20} /> :
               stageStatus[stage.id] === 'issues' ? <AlertTriangle size={20} /> :
               index + 1}
            </div>
            <div className="text-xs mt-2 text-center max-w-[80px]">{stage.name}</div>
            {index < REVIEW_STAGES.length - 1 && (
              <div className={`h-[2px] w-16 mt-5 ${
                stageStatus[stage.id] === 'completed' ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Current Stage Details */}
      {currentStage && (
        <Card>
          <CardHeader>
            <CardTitle>{REVIEW_STAGES.find(s => s.id === currentStage)?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {REVIEW_STAGES.find(s => s.id === currentStage)?.description}
            </p>
            
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${calculateStageCompletion(currentStage)}%` }}
                ></div>
              </div>
              
              {/* Stage-specific content */}
              {currentStage === 'initial_application' && (
                <div className="space-y-2">
                  <h3 className="font-medium">Required Documents:</h3>
                  {REVIEW_STAGES.find(s => s.id === currentStage)?.requiredDocuments?.map(doc => (
                    <div key={doc} className="flex items-center">
                      <FileText size={16} className="mr-2 text-gray-400" />
                      <span>
                        {doc.replace(/_/g, ' ')}
                        {loanDocuments.some(ld => ld.docType === doc && ld.status === 'approved') && 
                          <CheckCircle size={16} className="ml-2 inline text-green-500" />
                        }
                      </span>
                    </div>
                  ))}
                </div>
              )}
              
              {currentStage === 'property_evaluation' && (
                <div className="space-y-2">
                  <h3 className="font-medium">Property Information:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Building size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium">Property Address</span>
                      </div>
                      <div className="text-sm ml-6">
                        {extractedData.property_address || activeLoan?.propertyAddress || 'Not available'}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <DollarSign size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium">Property Value</span>
                      </div>
                      <div className="text-sm ml-6">
                        {extractedData.property_value ? 
                          `$${Number(extractedData.property_value).toLocaleString()}` : 
                          'Not available'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStage === 'borrower_financial' && (
                <div className="space-y-2">
                  <h3 className="font-medium">Borrower Information:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <User size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium">Borrower Name</span>
                      </div>
                      <div className="text-sm ml-6">
                        {extractedData.borrower_name || activeLoan?.borrowerName || 'Not available'}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <DollarSign size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium">Credit Score</span>
                      </div>
                      <div className="text-sm ml-6">
                        {extractedData.credit_score || 'Not available'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStage === 'exit_strategy' && (
                <div className="space-y-2">
                  <h3 className="font-medium">Exit Strategy:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium">Exit Strategy Timeline</span>
                      </div>
                      <div className="text-sm ml-6">
                        {activeLoan?.exitStrategy || extractedData.timeline || 'Not available'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Issues alert */}
              {stageStatus[currentStage] === 'issues' && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Issues Detected</AlertTitle>
                  <AlertDescription>
                    {reviewNotes[`${currentStage}_issues`]}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Issue reporting form */}
              <div className="mt-6 space-y-2">
                <h3 className="font-medium">Report Issues</h3>
                <Textarea 
                  placeholder="Describe any issues with this stage..." 
                  value={issueNote}
                  onChange={handleNoteChange}
                  className="h-24"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={reportIssues}
              disabled={!issueNote.trim()}
            >
              Report Issues
            </Button>
            <Button onClick={completeCurrentStage}>
              Complete Stage
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 