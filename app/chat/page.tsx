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
      console.log("📄 Recent documents loaded:", sortedDocs.length);
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
      console.log("🧹 Chat documents cleared");
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
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-6">
          {/* Main chat area with bubble header */}
          <div className="w-3/4 flex flex-col">
            {/* Chat Header with bubble */}
            <ChatHeader 
              clearMessages={clearMessages} 
              clearChatDocuments={clearChatDocuments}
            />
            
            {/* Chat Container - FIXED LAYOUT */}
            <div className="flex flex-col h-[calc(100vh-220px)] bg-white rounded-lg border shadow overflow-hidden">
              {/* Messages container - explicitly set to take remaining space but allow scrolling */}
              <div className="flex-1 min-h-0">
                <ChatContainer messages={messages}>
                  <ChatMessages messages={messages} indicatorState={indicatorState} />
                </ChatContainer>
              </div>
              
              {/* Input area - explicitly set not to shrink */}
              <div className="flex-shrink-0 p-3 border-t bg-white">
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
            <Card className="shadow-sm h-full">
              <CardHeader className="bg-gray-50 border-b py-3">
                <CardTitle className="text-sm font-medium">Recent Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {loadingDocs ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-xs text-gray-500">Loading documents...</p>
                  </div>
                ) : recentDocuments.length > 0 ? (
                  <ul className="space-y-2">
                    {recentDocuments.map((doc) => (
                      <li key={doc.id} className="text-xs border rounded p-2 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center max-w-[80%]">
                            <FileText size={12} className="text-gray-500 mr-2 flex-shrink-0" />
                            <span className="truncate font-medium" title={doc.filename}>
                              {doc.filename.length > 25 
                                ? doc.filename.substring(0, 22) + '...' 
                                : doc.filename}
                            </span>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                            doc.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : doc.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between items-center">
                          <span className="text-xs text-gray-500 truncate">
                            {new Date(doc.dateUploaded).toLocaleDateString()}
                          </span>
                          {doc.category === 'chat' ? (
                            <span className="text-xs text-blue-600 italic">
                              Chat Document
                            </span>
                          ) : (
                            <Link 
                              href={getDocumentActionLink(doc).href}
                              className="text-xs text-blue-600 hover:underline flex items-center"
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
                    <FileText size={24} className="mx-auto mb-2 text-gray-300" />
                    <p>No documents available</p>
                    <Link href="/new-loan" className="text-blue-600 hover:underline mt-2 inline-block">
                      Upload your first document
                    </Link>
                  </div>
                )}
                
                <div className="mt-4 text-xs text-gray-500 p-2 bg-gray-50 rounded">
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