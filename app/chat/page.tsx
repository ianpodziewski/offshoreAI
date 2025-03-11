// app/chat/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import ChatInput from "@/components/chat/input";
import ChatMessages from "@/components/chat/messages";
import useApp from "@/hooks/use-app";
import ChatHeader from "@/components/chat/header";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { FileText, Eye } from 'lucide-react';
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
  
  useEffect(() => {
    // Fetch recent documents
    const fetchRecentDocuments = async () => {
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
    };
    
    fetchRecentDocuments();
  }, []);

  return (
    <LayoutWrapper>
      <div className="flex flex-col h-full">
        <ChatHeader clearMessages={clearMessages} />
        
        <div className="flex-grow overflow-hidden flex flex-col">
          <div className="container mx-auto flex-grow flex my-2">
            <div className="flex w-full gap-4 h-[calc(100vh-170px)]">
              {/* Main chat area */}
              <div className="w-3/4 flex flex-col h-full bg-white rounded-lg border shadow">
                {/* Messages container with proper scrolling */}
                <div className="flex-grow overflow-y-auto px-4 py-2">
                  <ChatMessages messages={messages} indicatorState={indicatorState} />
                </div>
                
                {/* Input container */}
                <div className="p-2 border-t">
                  <ChatInput
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    input={input}
                    isLoading={isLoading}
                  />
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="w-1/4">
                <Card className="h-full shadow-sm">
                  <CardHeader className="bg-gray-50 border-b py-3">
                    <CardTitle className="text-sm font-medium">Recent Documents</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    {/* Document list content - kept the same */}
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
                              <Link 
                                href={`/loans/${doc.loanId}`}
                                className="text-xs text-blue-600 hover:underline flex items-center"
                              >
                                <Eye size={10} className="mr-1" />
                                View Loan
                              </Link>
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
        </div>
      </div>
    </LayoutWrapper>
  );
}