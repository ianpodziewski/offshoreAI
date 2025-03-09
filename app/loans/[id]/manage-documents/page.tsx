// app/loans/[id]/manage-documents/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentUploader from '@/components/document/DocumentUploader';
import DocumentList from '@/components/document/DocumentList';
import DocumentViewer from '@/components/document/DocumentViewer';
import LayoutWrapper from '@/app/layout-wrapper';
import Link from 'next/link';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/utilities/firebaseConfig';
import BulkDocumentProcessor from '@/components/document/BulkDocumentProcessor';
import DocumentAnalytics from '@/components/document/DocumentAnalytics';

export default function ManageDocumentsPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [loanDetails, setLoanDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allDocuments, setAllDocuments] = useState<any[]>([]);
  
  // Fetch loan details
  useEffect(() => {
    const fetchLoanDetails = async () => {
      if (!id) return;
      
      try {
        // First try to fetch from Firebase
        const docRef = doc(db, "loans", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setLoanDetails(docSnap.data());
        } else {
          // Fallback to our mock database
          const response = await fetch(`/api/loans/${id}`);
          const data = await response.json();
          setLoanDetails(data.loan);
        }
      } catch (error) {
        console.error("Error fetching loan:", error);
        // Final fallback - use loan ID as borrower name
        setLoanDetails({ id, borrowerName: `Loan #${id}` });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchLoanDetails();
    }
  }, [id]);
  
  // Fetch documents - Added new useEffect to fetch documents for analytics
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!id) return;
      
      try {
        const q = query(collection(db, "documents"), where("loanId", "==", id));
        const querySnapshot = await getDocs(q);
        
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAllDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    
    fetchDocuments();
  }, [id, refreshCounter]); // Added refreshCounter to the dependency array
  
  // Force refresh document list when a new document is uploaded
  const handleUploadComplete = () => {
    setRefreshCounter(prev => prev + 1);
  };
  
  if (loading) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-16 px-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading loan details...</p>
        </div>
      </LayoutWrapper>
    );
  }
  
  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href={`/loans/${id}`} className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft size={16} className="mr-2" />
            Back to Loan Details
          </Link>
          <h1 className="text-2xl font-bold mt-4">
            Document Management: {loanDetails?.borrowerName || `Loan #${id}`}
          </h1>
          <p className="text-gray-600">
            Upload, review, and manage documents for this loan
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar - Upload */}
          <div>
            <DocumentUploader 
              loanId={id} 
              onUploadComplete={handleUploadComplete}
            />
            
            <div className="mt-6">
              <BulkDocumentProcessor 
                loanId={id}
                onProcessComplete={handleUploadComplete}
              />
            </div>
            
            {/* Add the DocumentAnalytics component here */}
            <div className="mt-6">
              <DocumentAnalytics documents={allDocuments} />
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-medium flex items-center mb-2">
                <FileText size={16} className="mr-2 text-blue-500" />
                Document Tips
              </h3>
              <ul className="text-sm text-gray-700 space-y-2 ml-5 list-disc">
                <li>Upload each document as a separate PDF</li>
                <li>Ensure all pages are properly oriented</li>
                <li>Make sure text is legible in the scanned documents</li>
                <li>For best results, use descriptive filenames</li>
              </ul>
            </div>
          </div>
          
          {/* Main content - Document List */}
          <div className="md:col-span-2">
            <div className="bg-white shadow-sm border rounded-lg">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Loan Documents</h2>
              </div>
              <div className="p-4">
                <DocumentList 
                  loanId={id} 
                  onViewDocument={setSelectedDocument}
                  key={refreshCounter} // Force refresh when counter changes
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Document Viewer Modal */}
        {selectedDocument && (
          <DocumentViewer 
            document={selectedDocument} 
            onClose={() => setSelectedDocument(null)}
            onStatusChange={() => {
              setSelectedDocument(null);
              setRefreshCounter(prev => prev + 1);
            }}
          />
        )}
      </div>
    </LayoutWrapper>
  );
}