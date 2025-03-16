import React, { useState, useEffect, useRef } from 'react';
import { useLoanContext } from './LoanContextProvider';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Send, User, Bot } from 'lucide-react';

// Define message type for the loan-specific chat
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function LoanSpecificChat() {
  const { activeLoan, loanDocuments, refreshLoanDocuments } = useLoanContext();
  
  // Independent state for the loan-specific chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loanContext, setLoanContext] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
      
      // Add welcome message when loan changes
      setMessages([{
        role: 'assistant',
        content: `Welcome to the loan assistant for loan #${activeLoan.id}. I can help you with information about this specific loan.`,
        timestamp: new Date()
      }]);
    }
  }, [activeLoan?.id]); // Only depend on the loan ID
  
  // Function to refresh documents and context
  const handleRefreshDocuments = () => {
    refreshLoanDocuments();
    setTimeout(() => {
      prepareLoanContext();
      
      // Add a message to indicate documents were refreshed
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Documents have been refreshed.',
        timestamp: new Date()
      }]);
    }, 300);
  };
  
  // Function to clear chat messages
  const clearChat = () => {
    if (activeLoan) {
      setMessages([{
        role: 'assistant',
        content: `Chat cleared. I'm still here to help with loan #${activeLoan.id}.`,
        timestamp: new Date()
      }]);
    } else {
      setMessages([]);
    }
  };
  
  // Function to handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  // Function to handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = {
      role: 'user' as const,
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
        isLoanSpecific: true
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
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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
  
  return (
    <div className="w-full h-full flex flex-col">
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearChat}
            className="flex items-center gap-1"
          >
            <Trash2 size={14} />
            Clear Chat
          </Button>
        </div>
      </div>
      
      {/* Custom chat interface */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-900 rounded-lg border border-gray-800 shadow-lg">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>Start a conversation about this loan.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 text-gray-200'
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.role === 'user' ? (
                      <User size={14} className="mr-2" />
                    ) : (
                      <Bot size={14} className="mr-2" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.role === 'user' ? 'You' : 'Assistant'} • {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input area */}
        <div className="border-t border-gray-800 p-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send size={18} />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
} 