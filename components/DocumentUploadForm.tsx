import React, { useState, ChangeEvent, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DocumentStatus, LoanDocument, DocumentCategory, getAllDocumentTypes } from '@/utilities/loanDocumentStructure';
import { Button } from './Button';

interface DocumentUploadFormProps {
  loanId: string;
  onClose: () => void;
  onSubmit: (document: LoanDocument) => Promise<void>;
}

export function DocumentUploadForm({ loanId, onClose, onSubmit }: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>('');
  const [category, setCategory] = useState<DocumentCategory>('borrower');
  const [section, setSection] = useState<string>('');
  const [subsection, setSubsection] = useState<string>('');
  const [status, setStatus] = useState<DocumentStatus>('received');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get document types for dropdown
  const documentTypes = getAllDocumentTypes();
  
  // Get sections for selected category
  const sections = Array.from(
    new Set(
      documentTypes
        .filter(doc => doc.category === category)
        .map(doc => doc.section)
    )
  );
  
  // Get subsections for selected section
  const subsections = Array.from(
    new Set(
      documentTypes
        .filter(doc => doc.category === category && doc.section === section)
        .map(doc => doc.subsection)
    )
  );
  
  // Get doc types for selected category, section, and subsection
  const availableDocTypes = documentTypes.filter(
    doc => doc.category === category && 
          (section === '' || doc.section === section) && 
          (subsection === '' || doc.subsection === subsection)
  );
  
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
    
    if (!docType) {
      setError('Please select a document type');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Get document type info
      const docTypeInfo = documentTypes.find(dt => dt.docType === docType);
      
      if (!docTypeInfo) {
        setError('Invalid document type selected');
        return;
      }
      
      // Create document object
      const newDocument: LoanDocument = {
        id: uuidv4(),
        loanId,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        dateUploaded: new Date().toISOString(),
        category: docTypeInfo.category,
        section: section || docTypeInfo.section,
        subsection: subsection || docTypeInfo.subsection,
        docType,
        status,
        isRequired: docTypeInfo.isRequired,
        version: 1
      };
      
      // For text-based files, read the content
      if (file.type === 'text/plain' || 
          file.type === 'text/html' || 
          file.type === 'application/json') {
        newDocument.content = await readFileAsText(file);
      }
      
      await onSubmit(newDocument);
    } catch (err) {
      console.error('Error uploading document:', err);
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
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Upload Document</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">File</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded p-2"
              disabled={submitting}
              required
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected file: {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as DocumentCategory);
                setSection('');
                setSubsection('');
                setDocType('');
              }}
              className="w-full border border-gray-300 rounded p-2"
              disabled={submitting}
              required
            >
              <option value="borrower">Borrower</option>
              <option value="property">Property</option>
              <option value="closing">Closing</option>
              <option value="servicing">Servicing</option>
              <option value="misc">Miscellaneous</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Section (Optional)</label>
            <select
              value={section}
              onChange={(e) => {
                setSection(e.target.value);
                setSubsection('');
                setDocType('');
              }}
              className="w-full border border-gray-300 rounded p-2"
              disabled={submitting}
            >
              <option value="">-- Select Section --</option>
              {sections.map(s => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Subsection (Optional)</label>
            <select
              value={subsection}
              onChange={(e) => {
                setSubsection(e.target.value);
                setDocType('');
              }}
              className="w-full border border-gray-300 rounded p-2"
              disabled={submitting || section === ''}
            >
              <option value="">-- Select Subsection --</option>
              {subsections.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full border border-gray-300 rounded p-2"
              disabled={submitting}
              required
            >
              <option value="">-- Select Document Type --</option>
              {availableDocTypes.map(dt => (
                <option key={dt.docType} value={dt.docType}>
                  {dt.label || dt.docType.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as DocumentStatus)}
              className="w-full border border-gray-300 rounded p-2"
              disabled={submitting}
            >
              <option value="received">Received</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="reviewed">Reviewed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={submitting}
              isLoading={submitting}
            >
              Upload Document
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 