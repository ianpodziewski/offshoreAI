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
  // Helper to find all documents by docType
  const findAllDocumentsByType = (docType: string): LoanDocument[] => {
    // Log for debugging
    console.log(`Finding all documents for docType: ${docType}`);
    const docs = documents.filter(doc => doc.docType === docType);
    console.log(`Found ${docs.length} documents for docType ${docType}:`, 
      docs.map(d => ({ id: d.id, filename: d.filename })));
    return docs;
  };
  
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2 text-white">{title}</h3>
      
      <div className="space-y-4">
        {docTypes.map(docType => {
          // Get all documents for this docType
          const docsForType = findAllDocumentsByType(docType.docType);
          
          return (
            <React.Fragment key={docType.docType}>
              <div className="mb-2">
                {/* Socket Header */}
                <div 
                  className="bg-[#1A2234] border border-gray-700 rounded-t-lg p-4 flex justify-between items-center shadow-sm cursor-pointer hover:bg-[#1E2638] transition-colors"
                  onClick={() => onUpload(docType.docType, docType.category, docType.section)}
                >
                  <div className="flex items-center">
                    <svg 
                      className="w-6 h-6 text-indigo-400 mr-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"  
                      />
                    </svg>
                    <h3 className="font-medium text-white">{docType.label}</h3>
                    {docType.isRequired && (
                      <span className="ml-2 bg-red-500 bg-opacity-20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500">
                        Required
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    {/* Plus icon */}
                    <div 
                      className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpload(docType.docType, docType.category, docType.section);
                      }}
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Document Cards */}
                <div className="bg-[#1A2234] border-l border-r border-b border-gray-700 rounded-b-lg">
                  {docsForType.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                      <p>No documents uploaded yet</p>
                    </div>
                  ) : (
                    docsForType.map((doc, index) => (
                      <div 
                        key={doc.id || index}
                        className="flex justify-between items-center bg-[#131B2E] border-t border-gray-700 first:border-t-0 p-4 hover:bg-[#1F2937] cursor-pointer"
                        onClick={() => onViewDocument(doc)}
                      >
                        <div className="flex items-center">
                          <svg 
                            className="w-5 h-5 text-indigo-400 mr-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={1.5} 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"  
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-white">{doc.filename || 'Document'}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(doc.dateUploaded).toLocaleDateString()}
                              {doc.filename?.startsWith('SAMPLE_') && (
                                <span className="ml-2 bg-yellow-500 bg-opacity-20 text-yellow-400 text-xs px-2 py-0.5 rounded-full">
                                  Sample
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          {/* Trash can icon */}
                          <button
                            className="text-red-500 hover:text-red-400 transition-colors p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteDocument(doc);
                            }}
                            aria-label="Delete document"
                          >
                            <svg 
                              className="w-5 h-5" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={1.5} 
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}