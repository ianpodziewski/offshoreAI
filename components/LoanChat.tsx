import React, { useRef } from 'react';
import { useLoanContext } from './LoanContextProvider';
import { Button } from '@/components/ui/button';
import { FileText, Trash2, Send, User, Bot } from 'lucide-react';
import useLoanChat from '@/hooks/use-loan-chat';

export default function LoanChat() {
  const { activeLoan, loanDocuments, refreshLoanDocuments } = useLoanContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use our custom hook for loan chat functionality
  const {
    messages,
    input,
    isLoading,
    loanContext,
    handleInputChange,
    handleSubmit,
    clearChat,
    prepareLoanContext
  } = useLoanChat(activeLoan, loanDocuments);
  
  // Function to refresh documents and context
  const handleRefreshDocuments = () => {
    refreshLoanDocuments();
    setTimeout(() => {
      prepareLoanContext();
    }, 300);
  };
  
  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
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