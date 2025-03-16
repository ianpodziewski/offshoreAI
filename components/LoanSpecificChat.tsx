import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLoanContext } from './LoanContextProvider';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Send, User, Bot } from 'lucide-react';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';

// Define message type for the loan-specific chat
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function LoanSpecificChat() {
  const { activeLoan, loanDocuments, refreshLoanDocuments: refreshContextDocuments } = useLoanContext();
  
  // Independent state for the loan-specific chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loanContext, setLoanContext] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Function to manually sync loan documents with chat - removed loanDocuments dependency
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
      
      // Try to enhance documents with content
      const enhancedDocs = loanDocs.map(doc => {
        // Log the document details for debugging
        console.log(`Document: ${doc.filename}, Type: ${doc.docType}, Category: ${doc.category}, Status: ${doc.status}`);
        
        // Try to get document content if not already present
        if (!doc.content && doc.documentId) {
          try {
            // Try to get content from localStorage first
            const docContentKey = `document_content_${doc.documentId}`;
            const storedContent = localStorage.getItem(docContentKey);
            
            if (storedContent) {
              console.log(`Found content for document ${doc.filename} in localStorage`);
              doc.content = storedContent;
            } else {
              // Try to get content from simpleDocumentService
              const simpleDoc = simpleDocumentService.getDocumentById(doc.documentId);
              if (simpleDoc && simpleDoc.content) {
                console.log(`Found content for document ${doc.filename} in simpleDocumentService`);
                doc.content = simpleDoc.content;
              }
            }
          } catch (error) {
            console.error(`Error retrieving content for document ${doc.filename}:`, error);
          }
        }
        
        return doc;
      });
      
      return enhancedDocs;
    } catch (error) {
      console.error('Error syncing loan documents with chat:', error);
      return [];
    }
  }, []); // Removed loanDocuments dependency
  
  // Function to refresh loan documents
  const refreshLoanDocuments = useCallback(() => {
    if (!activeLoan) return '';
    
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
    
    // Provide document context with content
    let documentContextStr = '';
    
    if (loanDocs.length > 0) {
      documentContextStr = loanDocs.map(doc => {
        // Try to get document content if available
        let contentStr = '';
        if (doc.content) {
          // Limit content length to avoid token limits
          contentStr = `\nContent: ${typeof doc.content === 'string' ? 
            doc.content.substring(0, 1000) + (doc.content.length > 1000 ? '...(truncated)' : '') : 
            'Content not available in text format'}`;
        } else if (doc.extractedData) {
          // If we have extracted data, use that instead
          contentStr = `\nExtracted Data: ${
            typeof doc.extractedData === 'object' ? 
              JSON.stringify(doc.extractedData).substring(0, 1000) : 
              String(doc.extractedData).substring(0, 1000)
          }`;
        }
        
        return `Document: ${doc.filename}, Status: ${doc.status}, Type: ${doc.docType}${contentStr}`;
      }).join('\n\n');
    } else {
      documentContextStr = 'No documents available for this loan.';
    }
    
    // Try to get additional document content from simpleDocumentService
    try {
      const simpleDocuments = simpleDocumentService.getDocumentsForLoan(activeLoan.id);
      if (simpleDocuments && simpleDocuments.length > 0) {
        console.log(`Found ${simpleDocuments.length} documents in simpleDocumentService`);
        
        // Add any documents that weren't already included
        const existingDocNames = new Set(loanDocs.map(doc => doc.filename));
        const additionalDocs = simpleDocuments.filter(doc => !existingDocNames.has(doc.filename));
        
        if (additionalDocs.length > 0) {
          documentContextStr += '\n\nAdditional Documents:\n' + additionalDocs.map(doc => {
            let contentStr = '';
            if (doc.content) {
              contentStr = `\nContent: ${typeof doc.content === 'string' ? 
                doc.content.substring(0, 1000) + (doc.content.length > 1000 ? '...(truncated)' : '') : 
                'Content not available in text format'}`;
            }
            
            return `Document: ${doc.filename}, Type: ${doc.docType}${contentStr}`;
          }).join('\n\n');
        }
      }
    } catch (error) {
      console.error('Error getting documents from simpleDocumentService:', error);
    }
    
    const fullContext = `${loanContextStr}\n\nDocuments:\n${documentContextStr}`;
    setLoanContext(fullContext);
    
    console.log('Loan context updated successfully');
    return fullContext;
  }, [activeLoan, syncLoanDocuments, refreshContextDocuments]);
  
  // Initialize loan context when component mounts or loan changes - with initialization guard
  useEffect(() => {
    if (!activeLoan || hasInitialized) return;
    
    console.log('LoanSpecificChat component initializing for the first time');
    
    // Add initial welcome message
    setMessages([{
      role: 'assistant',
      content: `Welcome to the loan assistant for loan #${activeLoan.id}. I can help you with information about this specific loan. Click "Load Context" to initialize the loan data or "Refresh Documents" to update document information.`,
      timestamp: new Date()
    }]);
    
    // Load documents and context
    refreshLoanDocuments();
    setHasInitialized(true);
  }, [activeLoan, hasInitialized]); // Removed refreshLoanDocuments from dependencies
  
  // Handle loan changes after initial load
  useEffect(() => {
    if (!activeLoan || !hasInitialized) return;
    
    console.log(`Active loan changed to: ${activeLoan.id}`);
    
    // Reset messages for new loan
    setMessages([{
      role: 'assistant',
      content: `Switched to loan #${activeLoan.id}. Click "Load Context" to initialize the loan data or "Refresh Documents" to update document information.`,
      timestamp: new Date()
    }]);
    
    // Load documents and context for new loan
    refreshLoanDocuments();
  }, [activeLoan?.id]); // Only depend on the loan ID changing
  
  // Function to send loan context to the chat
  const sendLoanContextToChat = () => {
    if (loanContext) {
      console.log('Sending loan context to assistant (not as a user message)');
      
      // Get current documents without triggering state updates
      const currentDocs = activeLoan ? syncLoanDocuments(activeLoan.id) : [];
      
      // Check if we have any documents with content
      const docsWithContent = currentDocs.filter(doc => doc.content || doc.extractedData);
      
      // Add a system message indicating context was loaded
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Loan context loaded successfully. I now have information about loan #${activeLoan?.id}.\n\nAvailable documents: ${
            currentDocs.length > 0 
              ? currentDocs.map(doc => `\n- ${doc.filename} (${doc.docType})${doc.content || doc.extractedData ? ' ✓' : ''}`).join('') 
              : '\nNo documents available for this loan.'
          }\n\n${docsWithContent.length > 0 
            ? `✓ Document content has been loaded for ${docsWithContent.length} document(s). I can now answer specific questions about these documents.` 
            : 'No document content is available. I can only answer general questions about the loan.'
          }\n\nYou can now ask questions about this specific loan and its documents.`,
          timestamp: new Date()
        }
      ]);
    } else {
      console.log('No loan context available to send');
      // Notify user that no context is available
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'No loan context available. Please try refreshing the documents first.',
          timestamp: new Date()
        }
      ]);
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
        messages: [
          // Include loan context as a system message if available
          ...(loanContext ? [{ role: 'system', content: loanContext }] : []),
          // Include previous messages for context
          ...messages.map(msg => ({ role: msg.role, content: msg.content })),
          // Include the new user message
          { role: 'user', content: userMessage.content }
        ]
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
  
  // Clear chat messages
  const clearChat = () => {
    setMessages([]);
  };
  
  return (
    <div className="w-full h-full flex flex-col">
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
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearChat}
            className="flex items-center gap-1"
          >
            Clear Chat
          </Button>
        </div>
      </div>
      
      {/* Chat container */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-900 rounded-lg border border-gray-800 shadow-lg">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>Start a conversation about this loan or click "Load Context" to begin.</p>
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
                      {message.role === 'user' ? 'You' : 'Assistant'} • {message.timestamp.toLocaleTimeString()}
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