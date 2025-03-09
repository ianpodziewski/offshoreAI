"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import StatusBadge from '@/components/document/status-badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, User, AlertTriangle, CheckCircle } from 'lucide-react';
import LayoutWrapper from '../layout-wrapper';

// Create a client component that uses the hooks
function DocumentViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [documentPath, setDocumentPath] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [status, setStatus] = useState<string>('unassigned');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  useEffect(() => {
    const path = searchParams.get('path');
    if (path) {
      setDocumentPath(path);
      setDocumentUrl(`/api/download?file=${path}`);
      
      // Fetch the current status
      fetchDocumentStatus(path);
    }
  }, [searchParams]);
  
  // Fetch the document's current status
  const fetchDocumentStatus = async (path: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/document-status');
      const data = await response.json();
      
      if (data.statuses && data.statuses[path]) {
        const docStatus = data.statuses[path];
        setStatus(docStatus.status);
        setAssignedTo(docStatus.assignedTo || '');
        setNotes(docStatus.notes || '');
      }
    } catch (error) {
      console.error('Error fetching document status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Update the document status
  const updateStatus = async () => {
    // Your existing updateStatus code...
    try {
      setSaving(true);
      setSaveSuccess(false);
      setSaveError('');
      
      const response = await fetch('/api/document-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentPath,
          status,
          assignedTo: assignedTo.trim() || undefined,
          notes: notes.trim() || undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      setSaveSuccess(true);
      
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
  
  const documentName = documentPath ? documentPath.split('/').pop() || 'Document' : 'Document';
  
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
              {documentUrl && (
                <iframe 
                  src={documentUrl} 
                  className="w-full h-full border-0" 
                  title="Document Preview"
                />
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
              {/* Rest of your component remains the same */}
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500">Loading status...</p>
                </div>
              ) : (
                <>
                  {/* Your existing status UI */}
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
                      {/* Your status options would go here */}
                      <option value="unassigned">Unassigned</option>
                      <option value="assigned">Assigned</option>
                      <option value="reviewing">Under Review</option>
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
                </>
              )}
              
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
      <Suspense fallback={<div className="container mx-auto py-16 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="ml-3 text-gray-600">Loading document viewer...</p>
        </div>
      </div>}>
        <DocumentViewerContent />
      </Suspense>
    </LayoutWrapper>
  );
}