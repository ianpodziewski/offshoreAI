"use client";

import { useCallback, useEffect } from 'react';
import ChatWithContext from '@/components/ChatWithContext';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';

export default function ChatPage() {
  // Move the cleanup function here at the page level
  const cleanupProblematicDocuments = useCallback(() => {
    try {
      const storageDocsRaw = localStorage.getItem('simple_documents');
      if (storageDocsRaw) {
        const storageDocs = JSON.parse(storageDocsRaw);
        if (Array.isArray(storageDocs)) {
          const cleaned = storageDocs.filter(doc => 
            !(doc.filename && doc.filename.includes('Practice Loan Package'))
          );
          if (cleaned.length !== storageDocs.length) {
            console.log('Page-level cleanup: Removed problematic documents');
            localStorage.setItem('simple_documents', JSON.stringify(cleaned));
          }
        }
      }
    } catch (error) {
      console.error('Error during page-level localStorage cleanup:', error);
    }
  }, []);

  // Execute the cleanup on page load
  useEffect(() => {
    cleanupProblematicDocuments();
  }, [cleanupProblematicDocuments]);

  return <ChatWithContext />;
}