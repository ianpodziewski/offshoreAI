"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Eye, ExternalLink, ChevronRight, HelpCircle, FileQuestion, AlertCircle, BookOpen, Info } from 'lucide-react';
import Link from 'next/link';

interface DocumentItem {
  id: string;
  filename: string;
  dateUploaded: string;
  loanId: string;
  category?: string;
}

interface ChatSidebarProps {
  chatDocuments: DocumentItem[];
  loanDocuments: DocumentItem[];
  loadingDocs: boolean;
  getDocumentActionLink: (doc: DocumentItem) => string;
}

export default function ChatSidebar({ 
  chatDocuments, 
  loanDocuments, 
  loadingDocs,
  getDocumentActionLink
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState("documents");
  
  const renderDocumentItem = (doc: DocumentItem) => (
    <div key={doc.id} className="flex items-start p-2 hover:bg-gray-800/50 rounded-md transition-colors group">
      <div className="flex-shrink-0 mt-1">
        <FileText size={16} className="text-gray-400" />
      </div>
      <div className="ml-2 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-300 truncate">{doc.filename}</p>
        <p className="text-xs text-gray-500">
          {new Date(doc.dateUploaded).toLocaleDateString()}
        </p>
      </div>
      <Link 
        href={getDocumentActionLink(doc)}
        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 hover:bg-gray-700 rounded"
      >
        <Eye size={14} className="text-blue-400" />
      </Link>
    </div>
  );
  
  const renderResourceItem = (title: string, description: string, icon: React.ReactNode) => (
    <div className="p-3 border border-gray-800 rounded-md hover:bg-gray-800/50 transition-colors">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="ml-3">
          <h4 className="text-sm font-medium text-gray-200">{title}</h4>
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="shadow-lg border-gray-800 bg-gray-900 h-full">
      <CardHeader className="bg-gray-800/70 border-b border-gray-800 py-3">
        <CardTitle className="text-gray-100 text-lg flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-400" />
          Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="documents" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 bg-gray-800/50">
            <TabsTrigger value="documents" className="data-[state=active]:bg-gray-700">
              Documents
            </TabsTrigger>
            <TabsTrigger value="help" className="data-[state=active]:bg-gray-700">
              Help
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="documents" className="mt-0">
            {loadingDocs ? (
              <div className="py-4 text-center text-gray-500 text-sm">
                Loading documents...
              </div>
            ) : (
              <>
                {/* Chat Documents Section */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                    <span>Chat Uploads</span>
                  </h3>
                  <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                    {chatDocuments.length > 0 ? (
                      chatDocuments.map(doc => renderDocumentItem(doc))
                    ) : (
                      <div className="text-xs text-gray-500 py-2 px-1">
                        No chat uploads available
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Loan Documents Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                    <span>Loan Documents</span>
                  </h3>
                  <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1">
                    {loanDocuments.length > 0 ? (
                      loanDocuments.map(doc => renderDocumentItem(doc))
                    ) : (
                      <div className="text-xs text-gray-500 py-2 px-1">
                        No loan documents available
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="help" className="mt-0">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Loan Underwriting Resources</h3>
              
              {renderResourceItem(
                "Document Requirements", 
                "Learn about required documents for loan applications",
                <FileQuestion className="h-4 w-4 text-blue-400" />
              )}
              
              {renderResourceItem(
                "Common Document Errors", 
                "Avoid common mistakes in loan documentation",
                <AlertCircle className="h-4 w-4 text-amber-400" />
              )}
              
              {renderResourceItem(
                "Regulatory Guidelines", 
                "Stay compliant with current lending regulations",
                <BookOpen className="h-4 w-4 text-green-400" />
              )}
              
              {renderResourceItem(
                "Best Practices", 
                "Review industry best practices for loan underwriting",
                <Info className="h-4 w-4 text-purple-400" />
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-800">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full border-gray-700 bg-gray-800/30 hover:bg-gray-800/70 text-gray-300"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  <span>View Documentation</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 