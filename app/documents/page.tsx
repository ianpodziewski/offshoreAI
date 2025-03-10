// app/documents/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import LayoutWrapper from '../layout-wrapper';
import SimpleDocumentUploader from '@/components/document/SimpleDocumentUploader';
import SimpleDocumentList from '@/components/document/SimpleDocumentList';
import SimpleDocumentViewer from '@/components/document/SimpleDocumentViewer';
import { SimpleDocument, simpleDocumentService } from '@/utilities/simplifiedDocumentService';

// Define document categories
const DOCUMENT_CATEGORIES = {
  "loan": "Loan Documentation",
  "legal": "Legal Documents",
  "financial": "Financial Documents",
  "misc": "Miscellaneous Documents"
};

export default function DocumentDashboard() {
  const [selectedDocument, setSelectedDocument] = useState<SimpleDocument | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Dummy loanId for demo purposes when not viewing from a specific loan
  const demoLoanId = "demo-loan-123";
  
  const handleUploadComplete = () => {
    // Increment counter to trigger a refresh of the document list
    setRefreshCounter(prev => prev + 1);
  };
  
  const handleDocumentStatusChange = () => {
    // Close the viewer and refresh the list
    setSelectedDocument(null);
    setRefreshCounter(prev => prev + 1);
  };
  
  const refreshData = () => {
    setLoading(true);
    // Simple timeout to simulate loading
    setTimeout(() => {
      setRefreshCounter(prev => prev + 1);
      setLoading(false);
    }, 500);
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-16 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Document Management</h1>
          <div className="flex gap-3">
            <Button 
              onClick={refreshData} 
              variant="outline"
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Link 
              href="/upload" 
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <Upload size={18} />
              Upload New Document
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Uploader */}
          <div>
            <SimpleDocumentUploader 
              loanId={demoLoanId} 
              onUploadComplete={handleUploadComplete}
            />
          </div>
          
          {/* Document List */}
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg">Document Library</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <SimpleDocumentList 
                  loanId={demoLoanId}
                  onViewDocument={setSelectedDocument}
                  refreshTrigger={refreshCounter}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Document Viewer Modal */}
        {selectedDocument && (
          <SimpleDocumentViewer 
            document={selectedDocument}
            onClose={() => setSelectedDocument(null)}
            onStatusChange={handleDocumentStatusChange}
          />
        )}
      </div>
    </LayoutWrapper>
  );
}