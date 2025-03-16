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
  const { activeLoan, loanDocuments, refreshLoanDocuments: refreshContextDocuments } = useLoanContext();
  const { handleSubmit } = useApp();
  const [loanContext, setLoanContext] = useState<string>('');
  const [autoSendDisabled, setAutoSendDisabled] = useState(true);
  
  // Function to manually sync loan documents with chat
  const syncLoanDocuments = useCallback((loanId: string) => {
    try {
      console.log(`Syncing documents for loan: ${loanId}`);
      
      // Get all documents from localStorage directly to ensure we have the latest data
      const storageDocsRaw = localStorage.getItem('simple_documents');
      if (!storageDocsRaw) {
        console.log('No documents found in localStorage');
        return [];
      }
      
      const allDocs = JSON.parse(storageDocsRaw);
      if (!Array.isArray(allDocs)) {
        console.log('Invalid document data structure');
        return [];
      }
      
      // Find documents for this loan
      const loanDocs = allDocs.filter(doc => doc.loanId === loanId);
      console.log(`Found ${loanDocs.length} documents for loan ${loanId}`);
      
      // Log the document details for debugging
      loanDocs.forEach(doc => {
        console.log(`Document: ${doc.filename}, Type: ${doc.docType}, Category: ${doc.category}`);
      });
      
      return loanDocs;
    } catch (error) {
      console.error('Error syncing loan documents with chat:', error);
      return [];
    }
  }, []);
  
  // Function to refresh loan documents
  const refreshLoanDocuments = useCallback(() => {
    if (activeLoan) {
      console.log(`Refreshing documents for loan: ${activeLoan.id}`);
      
      // First refresh the documents in the context
      refreshContextDocuments();
      
      // Then sync loan documents
      const loanDocs = syncLoanDocuments(activeLoan.id);
      
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
      
      // Provide document context as well
      const documentContextStr = loanDocs.length > 0 
        ? loanDocs.map(doc => 
            `Document: ${doc.filename}, Status: ${doc.status}, Type: ${doc.docType}`
          ).join('\n')
        : 'No documents available for this loan.';
      
      const fullContext = `${loanContextStr}\n\nDocuments:\n${documentContextStr}`;
      setLoanContext(fullContext);
      
      console.log('Loan context updated successfully');
      return fullContext;
    }
    return '';
  }, [activeLoan, syncLoanDocuments, refreshContextDocuments]);
  
  // Initialize loan context when component mounts or loan changes
  useEffect(() => {
    console.log('LoanSpecificChat component mounted or loan changed');
    if (activeLoan) {
      console.log(`Active loan detected: ${activeLoan.id}`);
      refreshLoanDocuments();
    }
  }, [activeLoan, refreshLoanDocuments]);
  
  // Function to send loan context to the chat
  const sendLoanContextToChat = () => {
    if (loanContext) {
      console.log('Sending loan context to chat');
      handleSubmit(`Please use the following loan information as context for our conversation: ${loanContext}`);
    } else {
      console.log('No loan context available to send');
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