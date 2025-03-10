// app/document/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import StatusBadge from '@/components/document/status-badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, User, AlertTriangle, CheckCircle } from 'lucide-react';
import LayoutWrapper from '../layout-wrapper';
import { simpleDocumentService, SimpleDocument } from '@/utilities/simplifiedDocumentService';

function DocumentViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [documentId, setDocumentId] = useState<string>('');
  const [document, setDocument] = useState<SimpleDocument | null>(null);
  const [status, setStatus] = useState<string>('pending');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  useEffect(() => {
    const docId = searchParams.get('id');
    if (docId) {
      setDocumentId(docId);
      
      // Fetch the document
      const doc = simpleDocumentService.getDocumentById(docId);
      if (doc) {
        setDocument(doc);
        setStatus(doc.status);
        setAssignedTo(doc.assignedTo || '');
        setNotes(doc.notes || '');
      }
      setLoading(false);
    } else {
      // No document ID provided
      setLoading(false);
    }
  }, [searchParams]);
  
  // Function to safely display PDF content
  const getDocumentSrc = () => {
    if (!document?.content) return '';
    
    // Check if content is already a data URL
    if (document.content.startsWith('data:')) {
      return document.content;
    }
    
    // If it's not a data URL but we have content, try to convert it
    try {
      // Check if it needs a prefix
      if (!document.content.startsWith('data:application/pdf')) {
        return `data:application/pdf;base64,${document.content.replace(/^data:.*?;base64,/, '')}`;
      }
    } catch (error) {
      console.error('Error formatting document content:', error);
    }
    
    return '';
  };
  
  // Update the document status
  const updateStatus = async () => {
    if (!document) return;
    
    try {
      setSaving(true);
      setSaveSuccess(false);
      setSaveError('');
      
      const updatedDoc = simpleDocumentService.updateDocumentStatus(
        document.id,
        status as 'pending' | 'approved' | 'rejected',
        notes,
        assignedTo
      );
      
      if (!updatedDoc) {
        throw new Error('Failed to update status');
      }
      
      setSaveSuccess(true);
      setDocument(updatedDoc);
      
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
  
  const documentName = document ? document.filename : 'Document';
  
  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading document...</p>
      </div>
    );
  }
  
  if (!document) {
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
              <CardTitle className="text-lg">{documentName}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[800px]">
              {document.content ? (
                <object 
                  data={getDocumentSrc()}
                  type="application/pdf"
                  className="w-full h-full border-0"
                >
                  <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-100">
                    <p className="mb-4 text-gray-600">PDF cannot be displayed directly.</p>
                    <a 
                      href={getDocumentSrc()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Open PDF in New Tab
                    </a>
                  </div>
                </object>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
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

export default function DocumentViewer() {
  return (
    <LayoutWrapper>
      <DocumentViewerContent />
    </LayoutWrapper>
  );
}