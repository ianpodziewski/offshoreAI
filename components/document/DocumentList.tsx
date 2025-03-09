// components/document/DocumentList.tsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/utilities/firebaseConfig';
import { FileText, Eye, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Define proper interfaces
interface Document {
  id: string;
  filename: string;
  fileURL: string;
  documentType: string;
  category: string;
  uploadDate: string;
  status: string;
  [key: string]: any; // For any other fields
}

interface GroupedDocuments {
  [category: string]: Document[];
}

interface DocumentListProps {
  loanId: string;
  onViewDocument?: (document: Document) => void;
}

export default function DocumentList({ loanId, onViewDocument }: DocumentListProps) {
  // Change the state type to GroupedDocuments
  const [documents, setDocuments] = useState<GroupedDocuments>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDocuments() {
      try {
        setLoading(true);
        setError(null);
        
        const q = query(collection(db, "documents"), where("loanId", "==", loanId));
        const querySnapshot = await getDocs(q);
        
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Document[];
        
        // Group documents by category
        const grouped = docs.reduce((acc: GroupedDocuments, doc) => {
          const category = doc.category || 'misc';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(doc);
          return acc;
        }, {});
        
        setDocuments(grouped);
      } catch (error) {
        console.error("Error fetching documents:", error);
        setError("Failed to load documents");
      } finally {
        setLoading(false);
      }
    }
    
    fetchDocuments();
  }, [loanId]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Check if there are any documents
  const hasDocuments = Object.keys(documents).length > 0;

  if (!hasDocuments) {
    return (
      <div className="p-8 text-center border rounded-md">
        <FileText size={48} className="text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Documents Found</h3>
        <p className="text-gray-500 mb-4">Upload documents to get started with this loan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(documents).map(([category, docs]) => (
        <div key={category} className="border rounded-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-medium capitalize">{category} Documents</h3>
          </div>
          <ul className="divide-y">
            {docs.map((doc: Document) => (
              <li key={doc.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText size={18} className="text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium">{doc.filename}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.uploadDate).toLocaleDateString()} • {doc.documentType.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs mr-3 ${
                      doc.status === 'approved' ? 'bg-green-100 text-green-800' : 
                      doc.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDocument && onViewDocument(doc)}
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}