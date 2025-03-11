"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ChatInput from "@/components/chat/input";
import ChatMessages from "@/components/chat/messages";
import ChatContainer from "@/components/ChatContainer";
import useApp from "@/hooks/use-app";
import ChatHeader from "@/components/chat/header";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Eye, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import LayoutWrapper from '@/app/layout-wrapper';

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

  // Get appropriate link and icon for a document
  const getDocumentActionLink = (doc: any) => {
    if (doc.category === 'chat' || doc.loanId === 'chat-uploads') {
      return {
        href: `#document-${doc.id}`,
        text: 'Preview',
        icon: <ExternalLink size={10} className="mr-1" />
      };
    }
    
    return {
      href: `/loans/${doc.loanId}`,
      text: 'View Loan',
      icon: <Eye size={10} className="mr-1" />
    };
  };

  // Render document list item
  const renderDocumentItem = (doc: any) => (
    <li key={doc.id} className="text-xs border border-gray-800 rounded p-2 hover:bg-gray-800/50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center max-w-[80%]">
          <FileText size={12} className="text-gray-400 mr-2 flex-shrink-0" />
          <span className="truncate font-medium text-gray-300" title={doc.filename}>
            {doc.filename.length > 25 
              ? doc.filename.substring(0, 22) + '...' 
              : doc.filename}
          </span>
        </div>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
          doc.status === 'approved' 
            ? 'bg-green-900/30 text-green-400' 
            : doc.status === 'rejected'
            ? 'bg-red-900/30 text-red-400'
            : 'bg-yellow-900/30 text-yellow-400'
        }`}>
          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
        </span>
      </div>
      <div className="mt-1 flex justify-between items-center">
        <span className="text-xs text-gray-500 truncate">
          {new Date(doc.dateUploaded).toLocaleDateString()}
        </span>
        {doc.category === 'chat' || doc.loanId === 'chat-uploads' ? (
          <span className="text-xs text-blue-400 italic">
            Chat Document
          </span>
        ) : (
          <Link 
            href={getDocumentActionLink(doc).href}
            className="text-xs text-blue-400 hover:underline flex items-center"
          >
            {getDocumentActionLink(doc).icon}
            {getDocumentActionLink(doc).text}
          </Link>
        )}
      </div>
    </li>
  );

  // Render document section with title, list, and "More +" button
  const renderDocumentSection = (title: string, documents: any[], showAll: boolean, setShowAll: React.Dispatch<React.SetStateAction<boolean>>) => {
    const displayDocs = showAll ? documents : documents.slice(0, 3);
    const hasMore = documents.length > 3;
    
    return (
      <div className="mb-4">
        {/* Section header with improved styling */}
        <div className="bg-gray-800/70 px-3 py-2 rounded-md mb-3 border-l-2 border-blue-500">
          <h3 className="text-xs font-medium text-gray-200">{title}</h3>
        </div>
        
        {displayDocs.length > 0 ? (
          <>
            <ul className="space-y-2">
              {displayDocs.map(renderDocumentItem)}
            </ul>
            {hasMore && (
              <button 
                onClick={() => setShowAll(!showAll)}
                className="text-xs text-blue-400 hover:underline mt-2 flex items-center justify-center w-full py-1 px-2 bg-gray-800/30 rounded-md"
              >
                {showAll ? 'Show Less' : 'More +'}
                <ChevronRight size={12} className={`ml-1 transition-transform ${showAll ? 'rotate-90' : ''}`} />
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-gray-500 text-xs bg-gray-800/30 rounded-md">
            <p>No {title.toLowerCase()} available</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <LayoutWrapper>
      {/* Removed the container's top padding to reduce the gap */}
      <div className="container mx-auto px-4 py-0"> {/* Changed py-4 to py-0 */}
        <div className="flex gap-6 mt-2"> {/* Added a small mt-2 instead */}
          {/* Main chat area with bubble header */}
          <div className="w-3/4 flex flex-col">
            {/* Chat Header with bubble */}
            <ChatHeader 
              clearMessages={clearMessages} 
              clearChatDocuments={clearChatDocuments}
            />
            
            {/* Chat Container - FIXED LAYOUT */}
            <div className="flex flex-col h-[calc(100vh-180px)] bg-gray-900 rounded-lg border border-gray-800 shadow-lg overflow-hidden"> {/* Increased height by reducing 220px to 180px */}
              {/* Messages container - make sure it fills available space */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {/* Pass messages directly to ChatContainer */}
                <ChatContainer messages={messages}>
                  <ChatMessages messages={messages} indicatorState={indicatorState} />
                </ChatContainer>
              </div>
              
              {/* Input area - fixed at bottom */}
              <div className="flex-shrink-0 p-3 border-t border-gray-800 bg-gray-900">
                <ChatInput
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                  input={input}
                  isLoading={isLoading}
                  onUploadComplete={fetchDocuments}
                />
              </div>
            </div>
          </div>
          
          {/* Sidebar with Documents */}
          <div className="w-1/4">
            <Card className="shadow-lg border-gray-800 bg-gray-900 h-full">
              <CardHeader className="bg-gray-800/70 border-b border-gray-800 py-3">
                <CardTitle className="text-sm font-medium text-gray-200 flex items-center">
                  <FileText size={16} className="mr-2 text-blue-400" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {loadingDocs ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-xs text-gray-400">Loading documents...</p>
                  </div>
                ) : (
                  <>
                    {/* Chat Documents Section */}
                    {renderDocumentSection(
                      "Chat Uploads", 
                      chatDocuments, 
                      showAllChatDocs, 
                      setShowAllChatDocs
                    )}
                    
                    {/* Loan Documents Section */}
                    {renderDocumentSection(
                      "Loan Documents", 
                      loanDocuments, 
                      showAllLoanDocs, 
                      setShowAllLoanDocs
                    )}
                    
                    {/* No documents message (only if both sections are empty) */}
                    {chatDocuments.length === 0 && loanDocuments.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-xs">
                        <FileText size={24} className="mx-auto mb-2 text-gray-700" />
                        <p>No documents available</p>
                        <Link href="/new-loan" className="text-blue-400 hover:underline mt-2 inline-block">
                          Upload your first document
                        </Link>
                      </div>
                    )}
                  </>
                )}
                
                <div className="mt-6 text-xs text-gray-400 p-3 bg-gray-800/50 rounded-md border-l-2 border-blue-500">
                  <p className="font-medium mb-2">Ask the assistant about:</p>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li>Document requirements</li>
                    <li>Common errors in loan documents</li>
                    <li>Regulatory guidelines</li>
                    <li>Review best practices</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}