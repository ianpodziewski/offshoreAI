import React, { useEffect } from 'react';
import { LoanDocument } from '@/utilities/loanDocumentStructure';
import { FileSocket } from './FileSocket';

interface DocumentType {
  docType: string;
  label: string;
  category: string;
  section: string;
  subsection: string;
  isRequired: boolean;
}

interface DocumentSocketGroupProps {
  title: string;
  docTypes: DocumentType[];
  documents: LoanDocument[];
  onUpload: (docType: string, category: string, section: string) => void;
  onViewDocument: (document: LoanDocument) => void;
  onDeleteDocument: (document: LoanDocument) => void;
}

export function DocumentSocketGroup({
  title,
  docTypes,
  documents,
  onUpload,
  onViewDocument,
  onDeleteDocument
}: DocumentSocketGroupProps) {
  // Add debug logging for documents
  useEffect(() => {
    console.log(`[${title}] Document types:`, docTypes.map(dt => dt.docType));
    console.log(`[${title}] Available documents:`, documents);
  }, [title, docTypes, documents]);

  // Helper to find a document by docType with debug logging
  const findDocumentByType = (docType: string): LoanDocument | undefined => {
    console.log(`Looking for document with docType: ${docType}`);
    console.log(`Available documents for comparison:`, documents.map(doc => ({ 
      id: doc.id, 
      docType: doc.docType,
      filename: doc.filename
    })));
    
    const match = documents.find(doc => doc.docType === docType);
    
    if (match) {
      console.log(`Found matching document:`, match);
    } else {
      console.log(`No matching document found for docType: ${docType}`);
    }
    
    return match;
  };
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2 text-white">{title}</h3>
      
      <div className="space-y-4">
        {docTypes.map(docType => (
          <FileSocket
            key={docType.docType}
            docType={docType.docType}
            label={docType.label}
            category={docType.category}
            section={docType.section}
            isRequired={docType.isRequired}
            document={findDocumentByType(docType.docType)}
            onUpload={onUpload}
            onView={onViewDocument}
            onDelete={onDeleteDocument}
          />
        ))}
      </div>
    </div>
  );
}