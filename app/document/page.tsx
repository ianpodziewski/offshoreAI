// app/document/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import StatusBadge from '@/components/document/status-badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, User, AlertTriangle, CheckCircle, Download, ExternalLink } from 'lucide-react';
import LayoutWrapper from '../layout-wrapper';
import { simpleDocumentService, SimpleDocument } from '@/utilities/simplifiedDocumentService';

// Loading fallback component
function DocumentViewerLoading() {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        <p className="ml-3 text-gray-600">Loading document viewer...</p>
      </div>
    </div>
  );
}

// This component uses hooks that require client-side rendering
function DocumentViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [documentId, setDocumentId] = useState<string>('');
  const [docData, setDocData] = useState<SimpleDocument | null>(null);
  const [status, setStatus] = useState<string>('pending');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  
  useEffect(() => {
    const docId = searchParams.get('id');
    if (docId) {
      setDocumentId(docId);
      
      // Fetch the document
      const doc = simpleDocumentService.getDocumentById(docId);
      if (doc) {
        setDocData(doc);
        setStatus(doc.status);
        setAssignedTo(doc.assignedTo || '');
        setNotes(doc.notes || '');
        
        // Process PDF data
        try {
          // Ensure content has the proper data URL format
          if (doc.content) {
            // If it's already a proper data URL, use it
            if (doc.content.startsWith('data:application/pdf')) {
              setPdfDataUrl(doc.content);
            } 
            // If it's a base64 string without the prefix
            else {
              const formattedContent = `data:application/pdf;base64,${doc.content.replace(/^data:.*?;base64,/, '')}`;
              setPdfDataUrl(formattedContent);
            }
          }
        } catch (error) {
          console.error('Error processing PDF data:', error);
        }
      }
      setLoading(false);
    } else {
      // No document ID provided
      setLoading(false);
    }
  }, [searchParams]);
  
  // Open PDF in a new tab
  const openPdfInNewTab = () => {
    if (pdfDataUrl) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>${docData?.filename || 'Document'}</title>
            </head>
            <body style="margin: 0; padding: 0; overflow: hidden; height: 100vh;">
              <embed 
                src="${pdfDataUrl}" 
                type="application/pdf" 
                width="100%" 
                height="100%"
                style="border: none;"
              />
            </body>
          </html>
        `);
      }
    }
  };
  
  // Download the PDF
  const downloadPdf = () => {
    if (pdfDataUrl && docData) {
      // Use window.document to access the global document object
      const a = window.document.createElement('a');
      a.href = pdfDataUrl;
      a.download = docData.filename;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    }
  };
  
  // Update the document status
  const updateStatus = async () => {
    if (!docData) return;
    
    try {
      setSaving(true);
      setSaveSuccess(false);
      setSaveError('');
      
      const updatedDoc = simpleDocumentService.updateDocumentStatus(
        docData.id,
        status as 'pending' | 'approved' | 'rejected',
        notes,
        assignedTo
      );
      
      if (!updatedDoc) {
        throw new Error('Failed to update status');
      }
      
      setSaveSuccess(true);
      setDocData(updatedDoc);
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
      
    } catch (error: any) {
      console.error('Error updating status:', error);
      setSaveError(error.message || 'Failed to update status');
      
      // Clear error message after a few seconds
      setTimeout(() => {
        setSaveError('');
      }, 5000);
      
    } finally {
      setSaving(false);
    }
  };
  
  const documentName = docData ? docData.filename : 'Document';
  
  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading document...</p>
      </div>
    );
  }
  
  if (!docData) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Document Not Found</h2>
        <p className="text-gray-600 mb-6">The document you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push('/documents')}>
          <ArrowLeft size={16} className="mr-2" />
          Back to Documents
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="mb-6">
        <button 
          onClick={() => router.push('/documents')} 
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Documents
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Preview */}
        <div className="lg:col-span-2">
          <Card className="shadow-md h-full">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>{documentName}</span>
                <div className="flex gap-2">
                  <Button onClick={openPdfInNewTab} variant="outline" size="sm">
                    <ExternalLink size={16} className="mr-1" />
                    Open in New Tab
                  </Button>
                  <Button onClick={downloadPdf} variant="outline" size="sm">
                    <Download size={16} className="mr-1" />
                    Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {pdfDataUrl ? (
                <div className="w-full h-full">
                  <embed 
                    src={pdfDataUrl}
                    type="application/pdf"
                    className="w-full h-[700px] border rounded"
                  />
                  
                  {/* Fallback for browsers that don't support embed */}
                  <div className="mt-4 p-4 bg-gray-100 rounded text-center">
                    <p className="text-gray-600 mb-2">If the document is not visible above, you can:</p>
                    <div className="flex justify-center gap-3">
                      <Button onClick={openPdfInNewTab} variant="default" size="sm">
                        <ExternalLink size={16} className="mr-1" />
                        Open in New Tab
                      </Button>
                      <Button onClick={downloadPdf} variant="default" size="sm">
                        <Download size={16} className="mr-1" />
                        Download PDF
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[700px] text-gray-500">
                  No document content available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Status Panel */}
        <div>
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg">Document Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status
                </label>
                <div className="mb-4">
                  <StatusBadge status={status} size="lg" showLabel={true} />
                </div>
                
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter reviewer name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md h-32"
                  placeholder="Add notes about this document..."
                />
              </div>
              
              {saveSuccess && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md flex items-center gap-2">
                  <CheckCircle size={16} />
                  <p>Status updated successfully</p>
                </div>
              )}
              
              {saveError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
                  <AlertTriangle size={16} />
                  <p>{saveError}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 border-t p-4">
              <Button
                onClick={updateStatus}
                disabled={loading || saving}
                className="w-full"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function DocumentViewer() {
  return (
    <LayoutWrapper>
      <Suspense fallback={<DocumentViewerLoading />}>
        <DocumentViewerContent />
      </Suspense>
    </LayoutWrapper>
  );
}