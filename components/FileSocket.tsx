import React from 'react';
import { Tooltip } from './Tooltip';
import { LoanDocument, DocumentStatus } from '@/utilities/loanDocumentStructure';

interface FileSocketProps {
  docType: string;
  label: string;
  category: string;
  section: string;
  isRequired: boolean;
  document?: LoanDocument | null;
  onUpload: () => void;
  onView: (document: LoanDocument) => void;
}

export function FileSocket({
  docType,
  label,
  category,
  section,
  isRequired,
  document,
  onUpload,
  onView
}: FileSocketProps) {
  // Determine socket status
  const isEmpty = !document;
  const status = document?.status || (isRequired ? 'required' : 'optional');
  
  // Get status color 
  const getStatusColor = (): string => {
    const statusColors: Record<DocumentStatus, string> = {
      pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      approved: 'bg-green-100 border-green-300 text-green-800',
      rejected: 'bg-red-100 border-red-300 text-red-800',
      required: 'bg-gray-100 border-gray-300 text-gray-800',
      optional: 'bg-blue-100 border-blue-300 text-blue-800',
      received: 'bg-indigo-100 border-indigo-300 text-indigo-800',
      reviewed: 'bg-purple-100 border-purple-300 text-purple-800',
      expired: 'bg-orange-100 border-orange-300 text-orange-800'
    };
    
    return statusColors[status] || 'bg-gray-100 border-gray-300 text-gray-800';
  };
  
  // Generate document icon
  const renderIcon = () => {
    if (isEmpty) {
      return (
        <svg 
          className="w-10 h-10 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
      );
    }
    
    return (
      <svg 
        className="w-10 h-10 text-blue-500" 
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
    );
  };
  
  return (
    <div 
      className={`
        ${getStatusColor()}
        border rounded-lg p-3 flex flex-col items-center transition-all
        ${isEmpty ? 'opacity-70 hover:opacity-100' : 'hover:shadow-md'}
        cursor-pointer
      `}
      onClick={() => isEmpty ? onUpload() : (document && onView(document))}
    >
      <div className="text-center mb-2">
        {renderIcon()}
      </div>
      
      <Tooltip
        content={
          <div className="space-y-1 text-xs">
            <p><strong>Type:</strong> {docType.replace(/_/g, ' ')}</p>
            <p><strong>Category:</strong> {category}</p>
            <p><strong>Section:</strong> {section.replace(/_/g, ' ')}</p>
            <p><strong>Required:</strong> {isRequired ? 'Yes' : 'No'}</p>
            {document && (
              <>
                <p><strong>Status:</strong> {document.status}</p>
                <p><strong>Date:</strong> {new Date(document.dateUploaded).toLocaleDateString()}</p>
              </>
            )}
          </div>
        }
      >
        <h3 className="text-sm font-medium text-center">
          {label}
        </h3>
      </Tooltip>
      
      <div className="mt-2 text-xs px-2 py-0.5 rounded-full text-center">
        {isEmpty ? (isRequired ? 'Required' : 'Optional') : document?.status}
      </div>
    </div>
  );
} 