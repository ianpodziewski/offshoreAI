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
  Calendar
} from 'lucide-react';
import documentDatabase from '../utilities/documentDatabase';
import { Textarea } from '../components/ui/textarea';

// Define review stages
const REVIEW_STAGES = [
  {
    id: 'document_collection',
    name: 'Document Collection',
    requiredDocuments: ['credit_report', 'property_appraisal', 'income_verification'],
    description: 'Ensure all required documents are collected and legible'
  },
  {
    id: 'borrower_verification',
    name: 'Borrower Verification',
    requiredFields: ['credit_score', 'borrower_name', 'borrower_address'],
    description: 'Verify borrower identity and creditworthiness'
  },
  {
    id: 'property_verification',
    name: 'Property Verification',
    requiredFields: ['property_address', 'property_value', 'after_repair_value'],
    description: 'Verify property details and valuation'
  },
  {
    id: 'financial_analysis',
    name: 'Financial Analysis',
    requiredFields: ['ltv', 'dti_ratio', 'exit_strategy'],
    description: 'Analyze loan financials and risk factors'
  },
  {
    id: 'final_approval',
    name: 'Final Approval',
    requiredApprovers: ['underwriter', 'manager'],
    description: 'Final review and approval process'
  }
];

export default function ReviewProcessFlow() {
  const { activeLoan, loanDocuments } = useLoanContext();
  const [currentStage, setCurrentStage] = useState('document_collection');
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
      initialStatus['document_collection'] = 'in_progress';
      
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
    
    if (stage.requiredFields) {
      const required = stage.requiredFields.length;
      const completed = stage.requiredFields.filter(field => 
        field in extractedData && extractedData[field] !== undefined && extractedData[field] !== ''
      ).length;
      
      return Math.floor((completed / required) * 100);
    }
    
    return 0;
  };
  
  // Handle stage completion
  const completeCurrentStage = () => {
    if (!currentStage) return;
    
    const updatedStatus = { ...stageStatus };
    updatedStatus[currentStage] = 'completed';
    
    // Find next stage
    const currentIndex = REVIEW_STAGES.findIndex(s => s.id === currentStage);
    if (currentIndex < REVIEW_STAGES.length - 1) {
      const nextStage = REVIEW_STAGES[currentIndex + 1].id;
      updatedStatus[nextStage] = 'in_progress';
      setCurrentStage(nextStage);
    }
    
    setStageStatus(updatedStatus);
  };
  
  // Report issues with current stage
  const reportIssues = () => {
    if (!currentStage || !issueNote.trim()) return;
    
    const updatedStatus = { ...stageStatus };
    updatedStatus[currentStage] = 'issues';
    
    const updatedNotes = { ...reviewNotes };
    updatedNotes[currentStage] = issueNote.trim();
    
    setStageStatus(updatedStatus);
    setReviewNotes(updatedNotes);
    setIssueNote('');
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
              {currentStage === 'document_collection' && (
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
              
              {currentStage === 'borrower_verification' && (
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
              
              {currentStage === 'property_verification' && (
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
              
              {currentStage === 'financial_analysis' && (
                <div className="space-y-2">
                  <h3 className="font-medium">Financial Analysis:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <DollarSign size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium">Loan-to-Value (LTV)</span>
                      </div>
                      <div className="text-sm ml-6">
                        {activeLoan?.ltv ? `${activeLoan.ltv}%` : 'Not available'}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <span className="text-sm font-medium">Exit Strategy</span>
                      </div>
                      <div className="text-sm ml-6">
                        {activeLoan?.exitStrategy || extractedData.exit_strategy || 'Not available'}
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
                    {reviewNotes[currentStage]}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Issue reporting form */}
              <div className="mt-6 space-y-2">
                <h3 className="font-medium">Report Issues</h3>
                <Textarea 
                  placeholder="Describe any issues with this stage..." 
                  value={issueNote}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setIssueNote(e.target.value)}
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