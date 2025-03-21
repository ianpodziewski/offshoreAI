import React from 'react';
import { Tooltip } from './Tooltip';
import { LoanDocument, DocumentStatus } from '@/utilities/loanDocumentStructure';
import { useMemo } from 'react';

interface FileSocketProps {
  docType: string;
  label: string;
  category: string;
  section: string;
  isRequired: boolean;
  document?: LoanDocument | null;
  onUpload: () => void;
  onView: (document: LoanDocument) => void;
  onDelete?: (document: LoanDocument) => void;
}

export function FileSocket({
  docType,
  label,
  category,
  section,
  isRequired,
  document,
  onUpload,
  onView,
  onDelete
}: FileSocketProps) {
  // Find all documents with this docType (to support multiple files)
  const documents = useMemo(() => {
    // In a real implementation, we should fetch ALL documents with this docType
    if (!document) return [];
    
    // For testing purposes, if this is a sample document and we have a non-sample uploaded document,
    // we should show both - this is a dummy implementation to test UI
    const isSample = document.filename?.startsWith('SAMPLE_') || false;
    
    // Just to test multiple document display - you should replace this with actual document fetching
    return [document];
  }, [document]);
  
  const isEmpty = documents.length === 0;
  
  // Handle delete click
  const handleDelete = (e: React.MouseEvent, doc: LoanDocument) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent triggering the parent onClick (onView)
    if (onDelete) {
      onDelete(doc);
    }
  };
  
  return (
    <div className="w-full mb-4">
      {/* Header Card */}
      <div 
        className="bg-[#1A2234] border border-gray-700 rounded-t-lg p-4 flex justify-between items-center shadow-sm cursor-pointer hover:bg-[#1E2638] transition-colors"
        onClick={onUpload}
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
          <h3 className="font-medium text-white">{label}</h3>
          {isRequired && (
            <span className="ml-2 bg-red-500 bg-opacity-20 text-red-400 text-xs px-2 py-0.5 rounded-full border border-red-500">
              Required
            </span>
          )}
        </div>
        
        <div className="flex items-center">
          {/* Plus icon instead of Upload button */}
          <div 
            className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white cursor-pointer"
            onClick={(e) => {
              e.stopPropagation(); // Add this to prevent double triggering (optional)
              onUpload();
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
      
      {/* Files Container */}
      <div className="bg-[#1A2234] border-l border-r border-b border-gray-700 rounded-b-lg">
        {isEmpty ? (
          <div className="text-center py-6 text-gray-400">
            <p>No documents uploaded yet</p>
          </div>
        ) : (
          documents.map((doc, index) => (
            <div 
              key={doc.id || index}
              className="flex justify-between items-center bg-[#131B2E] border-t border-gray-700 first:border-t-0 p-4 hover:bg-[#1F2937] cursor-pointer"
              onClick={() => onView(doc)}
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
                  onClick={(e) => handleDelete(e, doc)}
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
  );
}