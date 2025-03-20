import React from 'react';
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
  onUpload: () => void;
  onViewDocument: (document: LoanDocument) => void;
}

export function DocumentSocketGroup({
  title,
  docTypes,
  documents,
  onUpload,
  onViewDocument
}: DocumentSocketGroupProps) {
  // Helper to find a document by docType
  const findDocumentByType = (docType: string): LoanDocument | undefined => {
    return documents.find(doc => doc.docType === docType);
  };
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3 border-b pb-2">{title}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
          />
        ))}
      </div>
    </div>
  );
} 