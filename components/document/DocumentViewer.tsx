// components/document/DocumentViewer.tsx
import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/utilities/firebaseConfig';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowLeft } from 'lucide-react';
import PdfPreview from './PdfPreview';

interface DocumentViewerProps {
  document: any;
  onClose: () => void;
  onStatusChange?: () => void;
}

export default function DocumentViewer({ document, onClose, onStatusChange }: DocumentViewerProps) {
  const [loading, setLoading] = useState(false);
  
  const updateStatus = async (status: string) => {
    if (!document?.id) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'documents', document.id), {
        status,
        reviewedAt: new Date().toISOString()
      });
      
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" onClick={onClose}>
              <ArrowLeft size={16} />
            </Button>
            <h3 className="font-medium ml-2">{document?.filename}</h3>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => updateStatus('approved')} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check size={16} className="mr-1" />
              Approve
            </Button>
            <Button 
              onClick={() => updateStatus('rejected')} 
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <X size={16} className="mr-1" />
              Reject
            </Button>
          </div>
        </div>
        
        <div className="flex-grow overflow-auto">
          {document?.fileURL ? (
            <PdfPreview 
              fileUrl={document.fileURL} 
              filename={document.filename} 
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No preview available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}