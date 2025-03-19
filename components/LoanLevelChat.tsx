import React, { useRef, useState, useEffect } from 'react';
import { useLoanContext } from './LoanContextProvider';
import { Button } from '@/components/ui/button';
import { Send, User, Bot, AlertCircle, FileText } from 'lucide-react';
import LoanChatIndexer from './loan/LoanChatIndexer';

// Define message type for the loan-specific chat
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function LoanLevelChat() {
  const { activeLoan, loanDocuments, refreshLoanDocuments } = useLoanContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasIndexedDocuments, setHasIndexedDocuments] = useState(false);
  
  // Initialize the chat with a welcome message
  useEffect(() => {
    if (activeLoan) {
      // Check local storage for existing messages
      const storedMessages = localStorage.getItem(`loanLevelChat_${activeLoan.id}`);
      
      if (storedMessages) {
        try {
          const parsedMessages = JSON.parse(storedMessages);
          if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
            setMessages(parsedMessages);
            return;
          }
        } catch (error) {
          console.error('Error parsing stored messages:', error);
        }
      }
      
      // If no stored messages, set the welcome message
      setMessages([{
        role: 'assistant',
        content: `Welcome to the loan chatbot for loan #${activeLoan.id}. I can answer questions about this specific loan using all available loan documents.`,
        timestamp: new Date()
      }]);
    }
  }, [activeLoan?.id]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Save messages to localStorage
  useEffect(() => {
    if (activeLoan && messages.length > 0) {
      localStorage.setItem(`loanLevelChat_${activeLoan.id}`, JSON.stringify(messages));
    }
  }, [activeLoan, messages]);
  
  // Function to handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  // Function to handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!input.trim() || !activeLoan || isLoading) return;
    
    const userMessage = input.trim();
    setInput('');
    
    // Add user message to the chat
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // First, get relevant context from Pinecone
      const contextResponse = await fetch('/api/loan-documents/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loanId: activeLoan.id,
          query: userMessage
        }),
      });
      
      if (!contextResponse.ok) {
        throw new Error(`Failed to retrieve document context: ${contextResponse.statusText}`);
      }
      
      const contextData = await contextResponse.json();
      
      // Now build the prompt with the loan context and document context
      const loanInfo = `
        Loan ID: ${activeLoan.id}
        Borrower: ${activeLoan.borrowerName}
        Loan Amount: $${activeLoan.loanAmount.toLocaleString()}
        Interest Rate: ${activeLoan.interestRate}%
        Property: ${activeLoan.propertyAddress}
        Loan Status: ${activeLoan.status}
        Loan Type: ${activeLoan.loanType}
      `;
      
      // Check if we have any document context
      const documentContext = contextData.contextString || "No relevant documents found for this query.";
      const hasRelevantDocs = contextData.matchCount > 0;
      setHasIndexedDocuments(hasRelevantDocs);
      
      // Call OpenAI API directly for simplicity
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a loan-specific AI assistant that provides information about a specific loan based on the loan data and associated documents. 
              Use the provided loan information and document context to answer the user's question accurately. 
              If the information is not available in the context, state that you don't have that specific information.
              
              Loan Information:
              ${loanInfo}
              
              Document Context:
              ${documentContext}`
            },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7,
        }),
      });
      
      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
      }
      
      const openaiData = await openaiResponse.json();
      const assistantReply = openaiData.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      
      // Add assistant message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantReply,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I'm sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to clear chat
  const clearChat = () => {
    if (activeLoan) {
      setMessages([{
        role: 'assistant',
        content: `Chat cleared. I'm still here to help with loan #${activeLoan.id}.`,
        timestamp: new Date()
      }]);
    }
  };
  
  if (!activeLoan) {
    return <div>No active loan selected</div>;
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Document Indexer */}
      <LoanChatIndexer loanId={activeLoan.id} />
      
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto rounded-lg bg-gray-900 border border-gray-800 mb-4 p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-[80%] rounded-lg p-3 ${
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
        ))}
        
        {/* Show notice if no documents have been found or referenced */}
        {messages.length > 1 && !hasIndexedDocuments && (
          <div className="flex items-start mb-4 p-3 bg-yellow-900/30 text-yellow-400 rounded-lg">
            <AlertCircle size={16} className="mr-2 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">No indexed documents found</p>
              <p className="text-xs mt-1">
                Use the "Index Documents" button above to make loan documents searchable by the chatbot.
              </p>
            </div>
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-2">
            <div className="animate-pulse flex items-center text-gray-500">
              <div className="h-2 w-2 bg-blue-400 rounded-full mr-1"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full mr-1 animate-pulse-delay-200"></div>
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-pulse-delay-400"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border border-gray-800 rounded-lg bg-gray-900 p-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question about this loan..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send size={18} />
          </Button>
        </form>
        
        <div className="flex justify-start mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear Chat
          </Button>
        </div>
      </div>
    </div>
  );
} 