"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ChatInput from "@/components/chat/input";
import ChatMessages from "@/components/chat/messages";
import ChatContainer from "@/components/ChatContainer";
import useApp from "@/hooks/use-app";
import ChatHeader from "@/components/chat/header";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Eye, ExternalLink, ChevronRight, HelpCircle, FileQuestion, AlertCircle, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import LayoutWrapper from '@/app/layout-wrapper';
import { Button } from '@/components/ui/button';
import ChatSidebar from '@/components/chat/sidebar';

// Quick Suggestions Component
const QuickSuggestions = ({ onSuggestionClick }: { onSuggestionClick: (suggestion: string) => void }) => {
  const suggestions = [
    { 
      text: "Document requirements", 
      icon: <FileQuestion className="w-4 h-4 mr-2" />,
      query: "What documents are required for a hard money loan application?"
    },
    { 
      text: "Common errors in loan documents", 
      icon: <AlertCircle className="w-4 h-4 mr-2" />,
      query: "What are common errors to avoid in loan documents?"
    },
    { 
      text: "Regulatory guidelines", 
      icon: <BookOpen className="w-4 h-4 mr-2" />,
      query: "What regulatory guidelines should I be aware of for hard money loans?"
    },
    { 
      text: "Review best practices", 
      icon: <HelpCircle className="w-4 h-4 mr-2" />,
      query: "What are best practices for reviewing loan applications?"
    }
  ];

  return (
    <div className="mb-6 mt-2">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Ask the assistant about:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="flex items-center justify-start border-gray-700 bg-gray-800/30 hover:bg-gray-800/70 text-gray-300 text-sm"
            onClick={() => onSuggestionClick(suggestion.query)}
          >
            {suggestion.icon}
            <span>{suggestion.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default function ChatWithContext() {
  const {
    messages,
    handleInputChange,
    handleSubmit,
    input,
    isLoading,
    indicatorState,
    clearMessages,
  } = useApp();
  
  const [chatDocuments, setChatDocuments] = useState<any[]>([]);
  const [loanDocuments, setLoanDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [showAllChatDocs, setShowAllChatDocs] = useState(false);
  const [showAllLoanDocs, setShowAllLoanDocs] = useState(false);
  
  // Function to fetch documents with special handling for the problematic document
  const fetchDocuments = useCallback(async () => {
    try {
      setLoadingDocs(true);
      
      // Get raw data from localStorage to ensure we're working with the most current state
      const storageDocsRaw = localStorage.getItem('simple_documents');
      let storageDocs = storageDocsRaw ? JSON.parse(storageDocsRaw) : [];
      
      // Special fix: Remove the problematic "Practice Loan Package" document if it exists
      // This is a one-time fix for the specific document that's stuck in the interface
      if (Array.isArray(storageDocs)) {
        const hasPracticePackage = storageDocs.some(doc => 
          doc.filename && doc.filename.includes('Practice Loan Package')
        );
        
        if (hasPracticePackage) {
          console.log('Found and removing stuck Practice Loan Package document');
          storageDocs = storageDocs.filter(doc => 
            !(doc.filename && doc.filename.includes('Practice Loan Package'))
          );
          // Save the cleaned document list back to localStorage
          localStorage.setItem('simple_documents', JSON.stringify(storageDocs));
        }
      }
      
      // Now proceed with normal document fetching from the service
      // This ensures the service gets the updated localStorage data
      const allDocs = simpleDocumentService.getAllDocuments();
      
      // Log the documents we found
      console.log('Documents after cleanup:', allDocs.map(d => ({ id: d.id, filename: d.filename, loanId: d.loanId })));
      
      // Sort by upload date (newest first)
      const sortedDocs = allDocs.sort((a, b) => 
        new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime()
      );
      
      // Split into chat and loan documents
      const chatDocs = sortedDocs.filter(doc => doc.category === 'chat' || doc.loanId === 'chat-uploads');
      const loanDocs = sortedDocs.filter(doc => doc.category !== 'chat' && doc.loanId !== 'chat-uploads');
      
      setChatDocuments(chatDocs);
      setLoanDocuments(loanDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  }, []);
  
  // Add a useEffect to clean the localStorage on component mount
  useEffect(() => {
    // One-time cleanup of localStorage to ensure the problematic document is removed
    const cleanupLocalStorage = () => {
      try {
        const storageDocsRaw = localStorage.getItem('simple_documents');
        if (storageDocsRaw) {
          const storageDocs = JSON.parse(storageDocsRaw);
          if (Array.isArray(storageDocs)) {
            const cleaned = storageDocs.filter(doc => 
              !(doc.filename && doc.filename.includes('Practice Loan Package'))
            );
            if (cleaned.length !== storageDocs.length) {
              console.log('Initial cleanup: Removed problematic documents');
              localStorage.setItem('simple_documents', JSON.stringify(cleaned));
            }
          }
        }
      } catch (error) {
        console.error('Error during initial localStorage cleanup:', error);
      }
    };
    
    cleanupLocalStorage();
    
    // Run fetch documents after the cleanup
    fetchDocuments();
  }, [fetchDocuments]);
  
  // Setup a refresh interval for documents
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchDocuments();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [fetchDocuments]);
  
  // Listen for messages changes to refresh documents after file uploads
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user' && lastMessage.fileName) {
      setTimeout(() => {
        fetchDocuments();
      }, 1000);
    }
  }, [messages, fetchDocuments]);

  // Function to clear chat documents
  const clearChatDocuments = useCallback(async () => {
    try {
      simpleDocumentService.clearChatDocuments();
      await fetchDocuments();
    } catch (error) {
      console.error('Error clearing chat documents:', error);
    }
  }, [fetchDocuments]);

  // Add this function to handle suggestion clicks
  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange({ target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>);
    // Use setTimeout to allow the input to update before submitting
    setTimeout(() => {
      handleSubmit(suggestion);
    }, 100);
  };
  
  // Function to get document action link
  const getDocumentActionLink = useCallback((doc: any) => {
    if (doc.category === 'chat' || doc.loanId === 'chat-uploads') {
      return `/documents/${doc.id}`;
    } else {
      return `/loans/${doc.loanId}/documents/${doc.id}`;
    }
  }, []);

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="border border-gray-800 bg-gray-900 shadow-md h-[calc(100vh-10rem)]">
              <ChatHeader clearMessages={clearMessages} />
              <CardContent className="p-0 h-[calc(100%-4rem)]">
                <ChatContainer messages={messages}>
                  {messages.length === 0 ? (
                    <div className="flex flex-col h-full justify-center items-center p-6">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <HelpCircle className="h-8 w-8 text-blue-400" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-200 mb-2">Loan Underwriting Assistant</h2>
                      <p className="text-gray-400 text-center max-w-md mb-6">
                        Ask questions about loan documents, underwriting requirements, or upload documents for analysis.
                      </p>
                      
                      {/* Add Quick Suggestions here */}
                      <QuickSuggestions onSuggestionClick={handleSuggestionClick} />
                    </div>
                  ) : (
                    <ChatMessages messages={messages} indicatorState={indicatorState} />
                  )}
                </ChatContainer>
              </CardContent>
              <div className="p-4 border-t border-gray-800">
                <ChatInput
                  input={input}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </div>
            </Card>
          </div>

          {/* Documents Sidebar */}
          <div className="lg:col-span-1">
            <ChatSidebar 
              chatDocuments={chatDocuments}
              loanDocuments={loanDocuments}
              loadingDocs={loadingDocs}
              getDocumentActionLink={getDocumentActionLink}
            />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}