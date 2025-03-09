"use client";

import React, { useState, useEffect } from 'react';
import ChatInput from "@/components/chat/input";
import ChatMessages from "@/components/chat/messages";
import useApp from "@/hooks/use-app";
import ChatHeader from "@/components/chat/header";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/document/status-badge';
import { FileText, Eye } from 'lucide-react';
import Link from 'next/link';

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
    // Fetch recent documents to provide context
    const fetchRecentDocuments = async () => {
      try {
        setLoadingDocs(true);
        
        // Fetch document sockets
        const socketsResponse = await fetch('/api/get-file-sockets');
        const socketsData = await socketsResponse.json();
        
        // Fetch document statuses
        const statusesResponse = await fetch('/api/document-status');
        const statusesData = await statusesResponse.json();
        
        // Flatten the document structure for display
        const flattenedDocs = [];
        for (const [category, docs] of Object.entries(socketsData.files || {})) {
          for (const docUrl of docs as string[]) {
            const path = docUrl.replace('/api/download?file=', '');
            const name = path.split('/').pop()?.replace('.pdf', '') || 'Document';
            const status = statusesData.statuses?.[path]?.status || 'unassigned';
            
            flattenedDocs.push({
              category,
              url: docUrl,
              path,
              name,
              status
            });
          }
        }
        
        // Sort by status: prioritize 'reviewing' and 'assigned' documents
        flattenedDocs.sort((a, b) => {
          const statusOrder = { 'reviewing': 0, 'assigned': 1, 'unassigned': 2, 'approved': 3, 'rejected': 4 };
          return (statusOrder[a.status as keyof typeof statusOrder] || 99) - 
                 (statusOrder[b.status as keyof typeof statusOrder] || 99);
        });
        
        // Take top 5
        setRecentDocuments(flattenedDocs.slice(0, 5));
        
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoadingDocs(false);
      }
    };
    
    fetchRecentDocuments();
  }, []);

  return (
    <>
      <ChatHeader clearMessages={clearMessages} />
      <div className="flex justify-center items-start min-h-screen pt-16">
        <div className="flex w-full max-w-screen-xl mx-auto py-6 px-4 gap-6">
          {/* Main Chat Area */}
          <div className="flex flex-col w-3/4">
            <div className="flex-1 overflow-y-auto min-h-[calc(100vh-250px)]">
              <ChatMessages messages={messages} indicatorState={indicatorState} />
            </div>
            <div className="mt-4">
              <ChatInput
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                input={input}
                isLoading={isLoading}
              />
            </div>
          </div>
          
          {/* Document Context Sidebar */}
          <div className="w-1/4">
            <Card className="shadow-md sticky top-20">
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
                    {recentDocuments.map((doc, idx) => (
                      <li key={idx} className="text-xs border rounded p-2 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText size={12} className="text-gray-500 mr-2 flex-shrink-0" />
                            <span className="truncate font-medium">{doc.name}</span>
                          </div>
                          <StatusBadge status={doc.status} size="sm" />
                        </div>
                        <div className="mt-1 flex justify-end">
                          <Link 
                            href={`/document?path=${encodeURIComponent(doc.path)}`}
                            className="text-xs text-blue-600 hover:underline flex items-center"
                          >
                            <Eye size={10} className="mr-1" />
                            View
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-xs">
                    No documents available
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
    </>
  );
}