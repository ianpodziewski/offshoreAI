import { useLoanContext } from './LoanContextProvider';
import ChatWithContext from './ChatWithContext';
import { useEffect, useState } from 'react';
import useApp from '@/hooks/use-app';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export default function LoanSpecificChat() {
  const { activeLoan, loanDocuments } = useLoanContext();
  const { handleSubmit } = useApp();
  const [loanContext, setLoanContext] = useState<string>('');
  
  useEffect(() => {
    if (activeLoan) {
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
      const documentContextStr = loanDocuments.length > 0 
        ? loanDocuments.map(doc => 
            `Document: ${doc.filename}, Status: ${doc.status}`
          ).join('\n')
        : 'No documents available for this loan.';
      
      setLoanContext(`${loanContextStr}\n\nDocuments:\n${documentContextStr}`);
      
      // Automatically send the loan context to the chat when the component mounts
      // or when the loan data changes
      setTimeout(() => {
        handleSubmit(`Please use the following loan information as context for our conversation: ${loanContextStr}\n\nDocuments:\n${documentContextStr}`);
      }, 500);
    }
  }, [activeLoan, loanDocuments, handleSubmit]);
  
  // Function to send loan context to the chat
  const sendLoanContextToChat = () => {
    if (loanContext) {
      handleSubmit(`Please use the following loan information as context for our conversation: ${loanContext}`);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Loan Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="context">Loan Context</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Ask questions about this specific loan or get help with underwriting tasks.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={sendLoanContextToChat}
                className="mb-4"
              >
                Reload Loan Context
              </Button>
            </div>
            <ChatWithContext loanSpecificContext={loanContext} />
          </TabsContent>
          
          <TabsContent value="context">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2">Current Loan Context</h3>
              <pre className="text-xs whitespace-pre-wrap">{loanContext}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 