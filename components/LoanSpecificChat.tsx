import React, { useState, useEffect } from 'react';
import { useLoanContext } from './LoanContextProvider';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';
import ChatWithContext from './ChatWithContext';

export default function LoanSpecificChat() {
  const { activeLoan, loanDocuments, refreshLoanDocuments } = useLoanContext();
  const [loanContext, setLoanContext] = useState<string>('');
  
  // Function to prepare loan context
  const prepareLoanContext = () => {
    if (!activeLoan) return '';
    
    console.log(`Preparing context for loan: ${activeLoan.id}`);
    
    // Format loan data into a context string
    const loanContextStr = `
      Active Loan: ${activeLoan.id}
      Borrower: ${activeLoan.borrowerName}
      Loan Amount: $${activeLoan.loanAmount.toLocaleString()}
      Interest Rate: ${activeLoan.interestRate}%
      Property: ${activeLoan.propertyAddress}
      Loan Status: ${activeLoan.status}
      Loan Type: ${activeLoan.loanType}
      LTV: ${activeLoan.ltv}%
      ARV LTV: ${activeLoan.arv_ltv}%
    `;
    
    // Add document information
    const documentContextStr = loanDocuments && loanDocuments.length > 0
      ? loanDocuments.map(doc => 
          `Document: ${doc.filename || doc.name}, Type: ${doc.docType || doc.type}`
        ).join('\n')
      : 'No documents available for this loan.';
    
    const fullContext = `${loanContextStr}\n\nDocuments:\n${documentContextStr}`;
    setLoanContext(fullContext);
    
    console.log('Loan context updated successfully');
    return fullContext;
  };
  
  // Initialize loan context when component mounts or loan changes
  useEffect(() => {
    if (activeLoan) {
      console.log(`Active loan detected: ${activeLoan.id}`);
      prepareLoanContext();
    }
  }, [activeLoan]);
  
  // Function to refresh documents and context
  const handleRefreshDocuments = () => {
    refreshLoanDocuments();
    setTimeout(() => {
      prepareLoanContext();
    }, 300);
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Loan Underwriting Assistant</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshDocuments}
            className="flex items-center gap-1"
          >
            <FileText size={14} />
            Refresh Documents
          </Button>
        </div>
      </div>
      
      {/* Use the existing ChatWithContext component with loan-specific settings */}
      <ChatWithContext 
        isLoanSpecific={true} 
        loanSpecificContext={loanContext}
      />
    </div>
  );
} 