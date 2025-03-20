import React from 'react';
import { LoanDocument, DocumentStatus } from '@/utilities/loanDocumentStructure';
import { formatFileSize, formatDate } from '@/utilities/formatUtils';

interface DocumentCardProps {
  document: LoanDocument;
  onClick: () => void;
  onStatusChange: (status: DocumentStatus) => void;
  onDelete: () => void;
}

export function DocumentCard({ document, onClick, onStatusChange, onDelete }: DocumentCardProps) {
  // Get file extension from filename or file type
  const getFileExtension = (): string => {
    if (document.filename) {
      const parts = document.filename.split('.');
      if (parts.length > 1) {
        return parts[parts.length - 1].toLowerCase();
      }
    }
    
    if (document.fileType && document.fileType.startsWith('.')) {
      return document.fileType.substring(1).toLowerCase();
    }
    
    return 'unknown';
  };
  
  // Format the upload date
  const formatUploadDate = (): string => {
    return formatDate(document.dateUploaded);
  };
  
  // Map document status to a color class
  const getStatusColorClass = (): string => {
    const statusColorMap: Record<DocumentStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      required: 'bg-gray-100 text-gray-800',
      optional: 'bg-blue-100 text-blue-800',
      received: 'bg-indigo-100 text-indigo-800',
      reviewed: 'bg-purple-100 text-purple-800',
      expired: 'bg-orange-100 text-orange-800'
    };
    
    return statusColorMap[document.status] || 'bg-gray-100 text-gray-800';
  };
  
  // Return default document icon based on extension
  const getDocumentIcon = (): JSX.Element => {
    return (
      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
        <svg
          className="w-6 h-6 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-start mb-3">
          {getDocumentIcon()}
          <div className="ml-3 flex-1 min-w-0">
            <h3 
              className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
              onClick={onClick}
            >
              {document.filename}
            </h3>
            <div className="flex flex-wrap mt-1">
              <span className="text-xs text-gray-500 mr-2 mb-1 capitalize">
                {document.category}
              </span>
              <span className="text-xs text-gray-500 mr-2 mb-1">
                {document.docType.replace(/_/g, ' ')}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColorClass()} mb-1`}>
                {document.status}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <span className="mr-3">
            Uploaded: {formatUploadDate()}
          </span>
          {document.fileSize && (
            <span>
              Size: {formatFileSize(document.fileSize)}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <select
              value={document.status}
              onChange={(e) => onStatusChange(e.target.value as DocumentStatus)}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="received">Received</option>
              <option value="reviewed">Reviewed</option>
              <option value="required">Required</option>
              <option value="optional">Optional</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={onClick}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View
            </button>
            
            <button
              onClick={onDelete}
              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 