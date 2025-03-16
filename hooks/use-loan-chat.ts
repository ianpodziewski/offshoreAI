import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoanData } from "@/utilities/loanGenerator";
import { simpleDocumentService } from "@/utilities/simplifiedDocumentService";

// Define message type for the loan-specific chat
interface LoanChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

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
  
  // Function to upload loan documents to the API
  const uploadLoanDocumentsToAPI = useCallback(async () => {
    if (!activeLoan || loanDocuments.length === 0) return;
    
    console.log(`Uploading ${loanDocuments.length} documents for loan ${activeLoan.id} to API`);
    
    // For each document, create a FormData and send it to the loan-chat API
    for (const doc of loanDocuments) {
      try {
        // Skip if no content
        if (!doc.content) {
          console.log(`Skipping document ${doc.filename} - no content`);
          continue;
        }
        
        // Create a blob from the document content
        let blob;
        if (doc.content.startsWith('data:')) {
          // Handle base64 data URLs
          const base64Data = doc.content.split(',')[1];
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          blob = new Blob([bytes], { type: 'application/pdf' });
        } else {
          // Handle HTML content
          blob = new Blob([doc.content], { type: 'text/html' });
        }
        
        // Create a File object from the blob
        const file = new File([blob], doc.filename, { 
          type: doc.fileType || 'application/pdf',
          lastModified: new Date().getTime()
        });
        
        // Create FormData
        const formData = new FormData();
        formData.append('file', file);
        formData.append('loanId', activeLoan.id);
        formData.append('docType', doc.docType);
        
        // Send to API
        const response = await fetch('/api/loan-chat/upload-document', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload document ${doc.filename}`);
        }
        
        console.log(`Successfully uploaded document ${doc.filename} to loan-chat API`);
      } catch (error) {
        console.error(`Error uploading document ${doc.filename}:`, error);
      }
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
      // Prepare the API request with the loan context
      const apiRequestBody = {
        message: userMessage.content,
        loanContext: loanContext,
        loanId: activeLoan?.id || ''
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
  
  // Upload loan documents to API when loan changes
  useEffect(() => {
    if (activeLoan && loanDocuments.length > 0) {
      uploadLoanDocumentsToAPI();
    }
  }, [activeLoan?.id, loanDocuments, uploadLoanDocumentsToAPI]);
  
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