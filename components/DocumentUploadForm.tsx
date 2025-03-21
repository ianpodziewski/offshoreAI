import React, { useState, ChangeEvent, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DocumentStatus, LoanDocument } from '@/utilities/loanDocumentStructure';
import { Button } from './Button';

interface DocumentUploadFormProps {
  loanId: string;
  docType?: string;  // Optional - if provided from FileSocket
  category?: string; // Optional - if provided from FileSocket
  section?: string;  // Optional - if provided from FileSocket
  onClose: () => void;
  onSubmit: (document: LoanDocument) => Promise<void>;
}

export function DocumentUploadForm({ 
  loanId, 
  docType = '', 
  category = 'borrower',
  section = '',
  onClose, 
  onSubmit 
}: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add debug info
  console.log(`DocumentUploadForm initialized with:`, {
    loanId,
    docType,
    category,
    section
  });
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setSubmitting(true);
      console.log("Preparing to submit document...");
      
      // Create document object with minimal required info
      const newDocument: LoanDocument = {
        id: uuidv4(),
        loanId,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        dateUploaded: new Date().toISOString(),
        category: category as any, // Cast to match your DocumentCategory type
        section: section,
        subsection: '',
        docType: docType,
        status: 'received' as DocumentStatus,
        isRequired: false,
        version: 1
      };
      
      console.log("Document prepared for submission:", {
        id: newDocument.id,
        loanId: newDocument.loanId,
        filename: newDocument.filename,
        docType: newDocument.docType,
        category: newDocument.category,
        section: newDocument.section
      });
      
      // For text-based files, read the content
      if (file.type === 'text/plain' || 
          file.type === 'text/html' || 
          file.type === 'application/json') {
        newDocument.content = await readFileAsText(file);
      }
      
      await onSubmit(newDocument);
      console.log("Document submitted successfully");
      onClose(); // Close the modal after successful upload
    } catch (err) {
      console.error('Error in form submission:', err);
      setError('An error occurred while uploading the document. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Helper function to read file content
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1A2234] border border-gray-700 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center">
          <svg 
            className="w-5 h-5 mr-2 text-indigo-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Upload Document
          {docType && (
            <span className="ml-2 text-sm text-gray-300">
              ({docType})
            </span>
          )}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900 bg-opacity-30 text-red-300 border border-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-300">Select File</label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-[#131B2E]">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={submitting}
                required
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                {!file ? (
                  <div className="space-y-2">
                    <svg 
                      className="w-10 h-10 mx-auto text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1} 
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-gray-300">
                      <span className="text-indigo-400 hover:text-indigo-300">Browse</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">Supported formats: PDF, DOC, DOCX, JPG, PNG</p>
                  </div>
                ) : (
                  <div className="space-y-2 py-2">
                    <svg 
                      className="w-8 h-8 mx-auto text-green-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-sm font-medium text-gray-300 break-all">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    <p className="text-xs text-indigo-400 hover:text-indigo-300">Click to change file</p>
                  </div>
                )}
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={submitting}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={submitting || !file}
              isLoading={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Upload
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}