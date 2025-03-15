import { useLoanContext } from './LoanContextProvider';
import ChatWithContext from './ChatWithContext';
import { useEffect, useState, useCallback } from 'react';
import useApp from '@/hooks/use-app';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import { FileText, Upload } from 'lucide-react';

export default function LoanSpecificChat() {
  const { activeLoan, loanDocuments } = useLoanContext();
  const { handleSubmit } = useApp();
  const [loanContext, setLoanContext] = useState<string>('');
  
  // Function to manually sync loan documents with chat
  const syncLoanDocuments = useCallback((loanId: string) => {
    try {
      // Get all documents
      const allDocs = simpleDocumentService.getAllDocuments();
      
      // Find documents for this loan
      const loanDocs = allDocs.filter(doc => doc.loanId === loanId);
      
      // Ensure each loan document is properly tagged for the chat
      let hasChanges = false;
      loanDocs.forEach(doc => {
        // Make sure the document has the correct loanId
        if (doc.loanId !== loanId) {
          doc.loanId = loanId;
          hasChanges = true;
        }
      });
      
      // If we made changes, save them back to storage
      if (hasChanges) {
        localStorage.setItem('simple_documents', JSON.stringify(allDocs));
      }
      
      return loanDocs;
    } catch (error) {
      console.error('Error syncing loan documents with chat:', error);
      return [];
    }
  }, []);
  
  // Function to refresh loan documents
  const refreshLoanDocuments = useCallback(() => {
    if (activeLoan) {
      // Sync loan documents first
      syncLoanDocuments(activeLoan.id);
      
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
      
      // Get the latest documents for this loan
      const latestLoanDocs = simpleDocumentService.getDocumentsForLoan(activeLoan.id);
      
      // Provide document context as well
      const documentContextStr = latestLoanDocs.length > 0 
        ? latestLoanDocs.map(doc => 
            `Document: ${doc.filename}, Status: ${doc.status}`
          ).join('\n')
        : 'No documents available for this loan.';
      
      setLoanContext(`${loanContextStr}\n\nDocuments:\n${documentContextStr}`);
    }
  }, [activeLoan, syncLoanDocuments]);
  
  // Initialize loan context when component mounts or loan changes
  useEffect(() => {
    refreshLoanDocuments();
  }, [activeLoan, refreshLoanDocuments]);
  
  // Function to send loan context to the chat
  const sendLoanContextToChat = () => {
    if (loanContext) {
      handleSubmit(`Please use the following loan information as context for our conversation: ${loanContext}`);
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Loan Underwriting Assistant</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshLoanDocuments}
            className="flex items-center gap-1"
          >
            <FileText size={14} />
            Refresh Documents
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={sendLoanContextToChat}
            className="flex items-center gap-1"
          >
            <Upload size={14} />
            Load Context
          </Button>
        </div>
      </div>
      
      {/* Pass isLoanSpecific={true} to get the simplified interface */}
      <ChatWithContext loanSpecificContext={loanContext} isLoanSpecific={true} />
    </div>
  );
} 