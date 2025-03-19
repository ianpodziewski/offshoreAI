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

// Define lender guidelines text constant
const LENDER_GUIDELINES = `
General Guidelines for Offshore Lending:
1. Compliance with international regulations is mandatory
2. Risk assessment must be thorough and documented
3. Customer identification procedures must be rigorous
4. Transaction monitoring should be continuous
5. Reporting of suspicious activity must be prompt
`;

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

  const [chatDocuments, setChatDocuments] = useState<any[]>([]);

  // Function to fetch and display relevant documents
  const fetchRelevantDocuments = async () => {
    // Simplified document fetching logic
    console.log("Fetching relevant documents");
    
    // Simulate fetching documents
    const mockDocuments = [
      { id: 1, name: "Sample Document 1", content: "This is a sample document content." },
      { id: 2, name: "Sample Document 2", content: "Another sample document for testing." }
    ];
    
    setChatDocuments(mockDocuments);
  };

  // Add a useEffect to incorporate the LENDER_GUIDELINES to the chat context
  useEffect(() => {
    // Use the LENDER_GUIDELINES as context for the chat assistant
    console.log("Guidelines available for chat context");
  }, []);

  return (
    <LayoutWrapper>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full overflow-hidden max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Chat (3 columns) */}
        <div className="lg:col-span-3 flex flex-col h-[calc(100vh-180px)] bg-gray-900 rounded-lg border border-gray-800 shadow-lg overflow-hidden">
          {/* Chat header */}
          <ChatHeader clearMessages={clearMessages} />
          
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
            />
          </div>
        </div>
        
        {/* Sidebar (1 column) */}
        <div className="lg:col-span-1 flex flex-col h-[calc(100vh-180px)] space-y-4">
          {/* Document section */}
          <Card className="flex-1 bg-gray-900 border-gray-800 shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold">Documents</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchRelevantDocuments}
                className="text-xs"
              >
                <Icons.refresh className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
            <CardContent className="p-3 overflow-y-auto max-h-[calc(100vh-280px)]">
              {chatDocuments.length > 0 ? (
                <DocumentList documents={chatDocuments} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Icons.document className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No documents yet</p>
                  <p className="text-xs mt-1">Click refresh to load documents</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  );
}