"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ChatInput from "@/components/chat/input";
import ChatMessages from "@/components/chat/messages";
import ChatContainer from "@/components/ChatContainer";
import useApp from "@/hooks/use-app";
import ChatHeader from "@/components/chat/header";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Eye, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import LayoutWrapper from '../layout-wrapper';

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
  
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  
  // Function to fetch recent documents
  const fetchRecentDocuments = useCallback(async () => {
    try {
      setLoadingDocs(true);
      const allDocs = simpleDocumentService.getAllDocuments();
      const sortedDocs = allDocs
        .sort((a, b) => new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime())
        .slice(0, 5);
      setRecentDocuments(sortedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocs(false);
    }
  }, []);
  
  // Function to clear chat documents
  const clearChatDocuments = useCallback(async () => {
    try {
      simpleDocumentService.clearChatDocuments();
      await fetchRecentDocuments();
    } catch (error) {
      console.error('Error clearing chat documents:', error);
    }
  }, [fetchRecentDocuments]);
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchRecentDocuments();
  }, [fetchRecentDocuments]);
  
  // Setup a refresh interval for documents
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchRecentDocuments();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [fetchRecentDocuments]);
  
  // Listen for messages changes to refresh documents after file uploads
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user' && lastMessage.fileName) {
      setTimeout(() => {
        fetchRecentDocuments();
      }, 1000);
    }
  }, [messages, fetchRecentDocuments]);

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
                  onUploadComplete={fetchRecentDocuments}
                />
              </div>
            </div>
          </div>
          
          {/* Sidebar with Recent Documents */}
          <div className="w-1/4">
            <Card className="shadow-lg border-gray-800 bg-gray-900 h-full">
              <CardHeader className="bg-gray-800/50 border-b border-gray-800 py-3">
                <CardTitle className="text-sm font-medium text-gray-200">Recent Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {loadingDocs ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-xs text-gray-400">Loading documents...</p>
                  </div>
                ) : recentDocuments.length > 0 ? (
                  <ul className="space-y-2">
                    {recentDocuments.map((doc) => (
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
                          {doc.category === 'chat' ? (
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
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    <FileText size={24} className="mx-auto mb-2 text-gray-700" />
                    <p>No documents available</p>
                    <Link href="/new-loan" className="text-blue-400 hover:underline mt-2 inline-block">
                      Upload your first document
                    </Link>
                  </div>
                )}
                
                <div className="mt-4 text-xs text-gray-400 p-2 bg-gray-800/50 rounded">
                  <p className="font-medium mb-1">Ask the assistant about:</p>
                  <ul className="list-disc pl-4 space-y-1">
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