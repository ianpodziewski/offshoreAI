"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="animate-pulse">Loading document...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Link href="/documents" className="inline-flex items-center hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Link>
        </div>
        <div className="border rounded-lg p-8 text-center bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Document Not Found</h2>
          <p className="text-muted-foreground">The document you're looking for doesn't exist or has been moved.</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="p-6">
        <div className="mb-4">
          <Link href="/documents" className="inline-flex items-center hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Link>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-bold">{document.filename}</h1>
          <div className="text-sm text-muted-foreground mt-1">
            Uploaded on {new Date(document.dateUploaded).toLocaleDateString()}
          </div>
        </div>

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
      </div>
    </ToastProvider>
  );
} 