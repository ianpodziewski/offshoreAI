"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ChatInput from "../components/chat/input";
import ChatMessages from "../components/chat/messages";
import ChatContainer from "@/components/ChatContainer";
import useApp from "../hooks/use-app";
import ChatHeader from "../components/chat/header";
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { FileText, Eye, ExternalLink, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import LayoutWrapper from '@/app/layout-wrapper';
import { Button } from "../components/ui/button";
import { Icons } from "../components/icons";
import { DocumentList } from "../components/DocumentList";
import { DisplayMessage, LoadingIndicator } from "@/types";
import { SimpleDocument } from '@/utilities/simplifiedDocumentService';

// Define MessageList component for displaying chat messages
function MessageList({ 
  messages, 
  isLoading, 
  indicators 
}: { 
  messages: DisplayMessage[]; 
  isLoading: boolean; 
  indicators: LoadingIndicator[] 
}) {
  return (
    <ChatMessages messages={messages} indicatorState={indicators} />
  );
}

export default function ChatWithContext() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    indicatorState,
    clearMessages,
  } = useApp();

  const [chatDocuments, setChatDocuments] = useState<SimpleDocument[]>([]);

  // Function to clear chat documents
  const clearChatDocuments = useCallback(async () => {
    try {
      await simpleDocumentService.clearChatDocuments();
      // Update state to reflect the cleared documents
      setChatDocuments([]);
      console.log("Chat documents cleared from UI");
    } catch (error) {
      console.error("Error clearing chat documents:", error);
    }
  }, []);

  // Load actual chat uploads instead of mock documents
  useEffect(() => {
    const loadChatDocuments = () => {
      // Use the simpleDocumentService to get chat documents
      const chatDocs = simpleDocumentService.getChatDocuments();
      console.log("Found chat documents:", chatDocs.length);
      setChatDocuments(chatDocs);
    };

    // Load documents initially
    loadChatDocuments();

    // Set up interval to refresh documents periodically (every 5 seconds)
    const intervalId = setInterval(loadChatDocuments, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <LayoutWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full overflow-hidden max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Chat (3 columns) */}
        <div className="lg:col-span-3 flex flex-col h-[calc(100vh-180px)] bg-gray-900 rounded-lg border border-gray-800 shadow-lg overflow-hidden">
          {/* Chat header */}
          <ChatHeader clearMessages={clearMessages} clearChatDocuments={clearChatDocuments} />
          
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4">
            <ChatMessages messages={messages} indicatorState={indicatorState} />
          </div>
          
          {/* Chat input */}
          <div className="p-4 border-t border-gray-800">
            <ChatInput
              input={input}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              onUploadComplete={async () => {
                // Refresh documents when upload completes
                const chatDocs = simpleDocumentService.getChatDocuments();
                setChatDocuments(chatDocs);
                return Promise.resolve();
              }}
            />
          </div>
        </div>
        
        {/* Sidebar (1 column) */}
        <div className="lg:col-span-1 flex flex-col h-[calc(100vh-180px)] space-y-4">
          {/* Document section */}
          <Card className="flex-1 bg-gray-900 border-gray-800 shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold">Documents</h3>
            </div>
            <CardContent className="p-3 overflow-y-auto max-h-[calc(100vh-280px)]">
              {chatDocuments.length > 0 ? (
                <div className="space-y-2">
                  {chatDocuments.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="p-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <h4 className="font-medium text-sm mb-1">{doc.filename}</h4>
                      <p className="text-xs text-gray-400 truncate">
                        {doc.dateUploaded ? new Date(doc.dateUploaded).toLocaleString() : 'No date'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Icons.document className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents yet</p>
                  <p className="text-xs mt-1">Upload files in the chat to see them here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  );
}