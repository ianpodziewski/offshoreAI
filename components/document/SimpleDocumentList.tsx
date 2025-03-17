// components/document/SimpleDocumentList.tsx
import React, { useState, useEffect } from 'react';
import { simpleDocumentService, SimpleDocument } from '@/utilities/simplifiedDocumentService';
import { FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimpleDocumentListProps {
  loanId: string;
  onViewDocument: (document: SimpleDocument) => void;
  refreshTrigger?: number; // Optional counter to trigger refresh
}

// Group documents by category for display
interface GroupedDocuments {
  [category: string]: SimpleDocument[];
}

export default function SimpleDocumentList({ 
  loanId, 
  onViewDocument, 
  refreshTrigger = 0 
}: SimpleDocumentListProps) {
  const [documents, setDocuments] = useState<GroupedDocuments>({});
  const [loading, setLoading] = useState(true);
  
  // Fetch documents whenever the component loads or refreshTrigger changes
  useEffect(() => {
    const fetchDocuments = () => {
      setLoading(true);
      
      try {
        // Get documents for this loan
        const docs = simpleDocumentService.getDocumentsForLoan(loanId);
        
        // Group by category
        const grouped = docs.reduce((acc: GroupedDocuments, doc) => {
          const category = doc.category;
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(doc);
          return acc;
        }, {});
        
        setDocuments(grouped);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocuments();
  }, [loanId, refreshTrigger]);
  
  // Helper for document status styling
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500">Loading documents...</p>
      </div>
    );
  }
  
  if (Object.keys(documents).length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50">
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
            {docs.map((doc) => (
              <li key={doc.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText size={18} className="text-gray-400 mr-3" />
                    <div>
                      <div className="relative">
                        <p className="font-medium">{doc.filename}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.dateUploaded).toLocaleDateString()} • {doc.docType.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs mr-3 ${getStatusStyles(doc.status)}`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDocument(doc)}
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