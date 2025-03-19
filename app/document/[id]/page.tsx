"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import DocumentSplitter from '@/components/document/DocumentSplitter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, SplitSquareVertical } from 'lucide-react';
import Link from 'next/link';
import { ToastProvider } from '@/components/ui/toast';

export default function DocumentPage() {
  const params = useParams();
  const documentId = params.id as string;
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchDocument() {
      if (documentId) {
        try {
          const doc = await simpleDocumentService.getDocumentById(documentId);
          if (doc) {
            setDocument(doc);
            
            // Process PDF data to create a blob URL
            try {
              if (doc.content) {
                let dataUrl = doc.content;
                
                // If it's not a complete data URL, add the prefix
                if (!dataUrl.startsWith('data:application/pdf')) {
                  dataUrl = `data:application/pdf;base64,${dataUrl.replace(/^data:.*?;base64,/, '')}`;
                }
                
                // Convert Data URL to Blob
                fetch(dataUrl)
                  .then(res => res.blob())
                  .then(blob => {
                    // Create a blob URL from the blob
                    const url = URL.createObjectURL(blob);
                    setPdfUrl(url);
                  })
                  .catch(err => {
                    console.error("Error creating blob URL:", err);
                  });
              }
            } catch (error) {
              console.error('Error processing PDF data:', error);
            }
          }
        } catch (error) {
          console.error('Error fetching document:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    fetchDocument();
    
    // Clean up blob URL on component unmount
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId, refreshKey]);

  const handleSplitComplete = (result: any) => {
    if (result.success) {
      // Refresh the document view
      setRefreshKey(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading document...</span>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl mb-4">Document not found</div>
        <Link href="/documents">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/documents" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Documents
            </Link>
            <h1 className="text-2xl font-bold">{document.filename}</h1>
            <div className="flex gap-2 mt-1">
              <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">{document.docType}</span>
              <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">{document.category}</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="view">
          <TabsList className="mb-4">
            <TabsTrigger value="view">
              <FileText className="h-4 w-4 mr-2" />
              View Document
            </TabsTrigger>
            <TabsTrigger value="split">
              <SplitSquareVertical className="h-4 w-4 mr-2" />
              Split Document
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="view">
            <Card>
              <CardHeader>
                <CardTitle>Document Viewer</CardTitle>
              </CardHeader>
              <CardContent>
                {pdfUrl ? (
                  <div className="w-full h-[700px] border rounded overflow-hidden">
                    <iframe 
                      src={pdfUrl}
                      className="w-full h-full border-0"
                      title={document.filename}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[700px] text-gray-500">
                    Unable to display document
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="split">
            <DocumentSplitter 
              document={document}
              onSplitComplete={handleSplitComplete}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ToastProvider>
  );
} 