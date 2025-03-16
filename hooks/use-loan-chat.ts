import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoanData } from "@/utilities/loanGenerator";
import { simpleDocumentService } from "@/utilities/simplifiedDocumentService";

// Define message type for the loan-specific chat
interface LoanChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Storage key for loan documents
const LOAN_DOCUMENTS_STORAGE_KEY = 'loan_documents';

export default function useLoanChat(activeLoan: LoanData | null, loanDocuments: any[]) {
  // Independent state for the loan-specific chat
  const [messages, setMessages] = useState<LoanChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loanContext, setLoanContext] = useState<string>('');
  
  // Function to prepare loan context
  const prepareLoanContext = useCallback(() => {
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
  }, [activeLoan, loanDocuments]);
  
  // Initialize loan context when component mounts or loan changes
  useEffect(() => {
    if (activeLoan) {
      console.log(`Active loan detected: ${activeLoan.id}`);
      prepareLoanContext();
      
      // Add welcome message when loan changes
      setMessages([{
        role: 'assistant',
        content: `Welcome to the loan assistant for loan #${activeLoan.id}. I can help you with information about this specific loan.`,
        timestamp: new Date()
      }]);
    }
  }, [activeLoan?.id, prepareLoanContext]); 
  
  // Function to handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);
  
  // Function to store loan documents in localStorage
  const storeLoanDocuments = useCallback(async () => {
    if (!activeLoan || loanDocuments.length === 0) return;
    
    console.log(`Storing ${loanDocuments.length} documents for loan ${activeLoan.id} in localStorage`);
    
    try {
      // Get existing documents from localStorage
      let existingDocs = [];
      const storedDocsRaw = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
      if (storedDocsRaw) {
        existingDocs = JSON.parse(storedDocsRaw);
        // Filter out documents for this loan to avoid duplicates
        existingDocs = existingDocs.filter((doc: any) => doc.loanId !== activeLoan.id);
      }
      
      // Prepare documents for storage
      const docsToStore = loanDocuments.map(doc => ({
        loanId: activeLoan.id,
        docType: doc.docType || doc.type || 'unknown',
        fileName: doc.filename || doc.name || 'unnamed',
        content: doc.content || '',
        dateAdded: new Date().toISOString()
      }));
      
      // Combine with existing documents and store
      const allDocs = [...existingDocs, ...docsToStore];
      localStorage.setItem(LOAN_DOCUMENTS_STORAGE_KEY, JSON.stringify(allDocs));
      
      console.log(`Successfully stored ${docsToStore.length} documents for loan ${activeLoan.id}`);
    } catch (error) {
      console.error('Error storing loan documents:', error);
    }
  }, [activeLoan, loanDocuments]);
  
  // Function to handle form submission
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: LoanChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Get loan documents from localStorage
      let documentContents = '';
      if (activeLoan) {
        try {
          const loanDocumentsRaw = localStorage.getItem(LOAN_DOCUMENTS_STORAGE_KEY);
          if (loanDocumentsRaw) {
            const loanDocuments = JSON.parse(loanDocumentsRaw);
            const documentsForLoan = loanDocuments.filter((doc: any) => doc.loanId === activeLoan.id);
            
            if (documentsForLoan.length > 0) {
              console.log(`Found ${documentsForLoan.length} documents for loan ${activeLoan.id}`);
              
              // Extract content from each document
              documentContents = documentsForLoan.map((doc: any) => {
                try {
                  return `Document: ${doc.fileName}, Type: ${doc.docType}${doc.content ? '\nContent: ' + doc.content.substring(0, 500) + '...' : ''}`;
                } catch (error) {
                  console.error(`Error extracting content from document ${doc.fileName}:`, error);
                  return `Document: ${doc.fileName} (content extraction failed)`;
                }
              }).join('\n\n');
            }
          }
        } catch (error) {
          console.error('Error retrieving loan documents:', error);
        }
      }
      
      // Enhance loan context with document contents
      const enhancedContext = documentContents 
        ? `${loanContext}\n\nDocument Contents:\n${documentContents}`
        : loanContext;
      
      // Prepare the API request with the enhanced loan context
      const apiRequestBody = {
        message: userMessage.content,
        loanContext: enhancedContext
      };
      
      // Make API call to your backend
      const response = await fetch('/api/loan-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequestBody),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Add assistant response to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || "I'm sorry, I couldn't process your request.",
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error while processing your request.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, loanContext, activeLoan]);
  
  // Function to clear chat messages
  const clearChat = useCallback(() => {
    if (activeLoan) {
      setMessages([{
        role: 'assistant',
        content: `Chat cleared. I'm still here to help with loan #${activeLoan.id}.`,
        timestamp: new Date()
      }]);
      
      // Also clear from localStorage
      localStorage.removeItem(`loanChat_${activeLoan.id}`);
    } else {
      setMessages([]);
    }
  }, [activeLoan]);
  
  // Save messages to localStorage when they change
  useEffect(() => {
    if (activeLoan && messages.length > 0) {
      localStorage.setItem(`loanChat_${activeLoan.id}`, JSON.stringify(messages));
    }
  }, [activeLoan, messages]);
  
  // Load stored messages from localStorage when loan changes
  useEffect(() => {
    if (activeLoan) {
      const storedMessages = localStorage.getItem(`loanChat_${activeLoan.id}`);
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            setMessages(parsedMessages);
          }
        } catch (error) {
          console.error("Error parsing stored loan chat messages:", error);
        }
      }
    }
  }, [activeLoan?.id]);
  
  // Store loan documents in localStorage when loan changes
  useEffect(() => {
    if (activeLoan && loanDocuments.length > 0) {
      storeLoanDocuments();
    }
  }, [activeLoan?.id, loanDocuments, storeLoanDocuments]);
  
  return {
    messages,
    input,
    isLoading,
    loanContext,
    handleInputChange,
    handleSubmit,
    clearChat,
    prepareLoanContext
  };
} 