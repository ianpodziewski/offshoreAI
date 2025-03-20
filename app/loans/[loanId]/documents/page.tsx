"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DocumentCard } from '@/components/DocumentCard';
import { Tooltip } from '@/components/Tooltip';
import { Button } from '@/components/Button';
import { DocumentUploadForm } from '@/components/DocumentUploadForm';
import { DocumentViewer } from '@/components/DocumentViewer';
import { DocumentSocketGroup } from '@/components/DocumentSocketGroup';
import { 
  LoanDocument, 
  DocumentCategory, 
  DocumentStatus, 
  getAllDocumentTypes,
  getRequiredDocuments 
} from '@/utilities/loanDocumentStructure';
import { documentService } from '@/utilities/documentService';
import { loanDatabase } from '@/utilities/loanDatabase';
import { useLoanData } from '@/hooks/useLoanData';
import { useToast } from '@/hooks/useToast';

// Define the DocumentType interface to match what's expected in DocumentSocketGroup
interface DocumentType {
  docType: string;
  label: string;
  category: string;
  section: string;
  subsection: string;
  isRequired: boolean;
}

export default function DocumentsPage() {
  const params = useParams();
  const loanId = params?.loanId as string;
  const { loan, error: loanError, loading: loanLoading } = useLoanData(loanId);
  const { showToast } = useToast();
  
  const [documents, setDocuments] = useState<LoanDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<LoanDocument | null>(null);
  const [viewingDocument, setViewingDocument] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'sockets'>('sockets');
  const [categories, setCategories] = useState<{
    [key in DocumentCategory]: {
      total: number;
      completed: number;
      percentage: number;
    };
  }>({
    borrower: { total: 0, completed: 0, percentage: 0 },
    property: { total: 0, completed: 0, percentage: 0 },
    closing: { total: 0, completed: 0, percentage: 0 },
    servicing: { total: 0, completed: 0, percentage: 0 },
    misc: { total: 0, completed: 0, percentage: 0 },
  });
  const [completionStatus, setCompletionStatus] = useState({
    total: 0,
    completed: 0,
    percentage: 0,
  });
  
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Ensure loan data is loaded
      if (!loan) {
        console.error('Cannot load documents: Loan data not available');
        setError('Loan data not available');
        return;
      }

      // Load documents from service
      const docs = await documentService.getDocumentsForLoan(loanId);
      setDocuments(docs || []);

      // Get document completion status
      const status = await documentService.getDocumentCompletionStatus(loanId, loan.loanType);
      
      // Update state
      setCompletionStatus({
        total: status.total,
        completed: status.completed,
        percentage: status.percentage,
      });
      
      setCategories(status.byCategory);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (document: LoanDocument) => {
    setSelectedDocument(document);
    setViewingDocument(true);
  };

  const handleUploadDocument = () => {
    setUploadingDocument(true);
  };

  const handleCloseViewer = () => {
    setViewingDocument(false);
    setSelectedDocument(null);
  };

  const handleCloseUpload = () => {
    setUploadingDocument(false);
    loadDocuments(); // Reload documents after upload
  };

  const handleToggleViewMode = () => {
    setViewMode(viewMode === 'list' ? 'sockets' : 'list');
  };

  const handleGenerateSampleDocuments = async () => {
    try {
      if (!loan) {
        showToast('Error', 'Loan data not available', 'error');
        return;
      }

      showToast('Info', 'Generating sample documents...', 'info');

      // Generate sample documents
      const generatedDocs = await documentService.generateSampleDocuments(loanId, loan.loanType);
      
      if (generatedDocs.length === 0) {
        showToast('Warning', 'No documents were generated', 'warning');
      } else {
        showToast('Success', `Generated ${generatedDocs.length} sample documents`, 'success');
      }

      // Reload documents
      loadDocuments();
    } catch (err) {
      console.error('Error generating sample documents:', err);
      showToast('Error', 'Failed to generate sample documents', 'error');
    }
  };

  const handleDeleteAllDocuments = async () => {
    try {
      if (window.confirm('Are you sure you want to delete all documents? This action cannot be undone.')) {
        showToast('Info', 'Deleting all documents...', 'info');
        
        // Delete all documents for this loan
        await documentService.clearAllDocuments();
        
        showToast('Success', 'All documents have been deleted', 'success');
        
        // Reload documents
        loadDocuments();
      }
    } catch (err) {
      console.error('Error deleting documents:', err);
      showToast('Error', 'Failed to delete documents', 'error');
    }
  };

  // Organize document types by category and section
  const getOrganizedDocumentTypes = () => {
    if (!loan) return [];
    
    // Get all document types for this loan type
    const allDocTypes = getRequiredDocuments(loan.loanType);
    
    // Group by category and section
    const grouped = allDocTypes.reduce((acc, docType) => {
      const key = `${docType.category}|${docType.section}`;
      if (!acc[key]) {
        acc[key] = {
          category: docType.category,
          section: docType.section,
          title: `${docType.category.charAt(0).toUpperCase() + docType.category.slice(1)} - ${docType.section.replace(/_/g, ' ')}`,
          docTypes: []
        };
      }
      acc[key].docTypes.push(docType as DocumentType);
      return acc;
    }, {} as Record<string, {
      category: string;
      section: string;
      title: string;
      docTypes: DocumentType[];
    }>);
    
    // Sort by category and section
    return Object.values(grouped).sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.section.localeCompare(b.section);
    });
  };

  useEffect(() => {
    // Initialize documents when the loan data is loaded
    if (loan && !loanLoading) {
      loadDocuments();
    }
  }, [loan, loanLoading]);

  if (loanLoading) {
    return <div className="p-6">Loading loan data...</div>;
  }

  if (loanError || !loan) {
    return <div className="p-6 text-red-500">Error loading loan: {loanError || 'Loan not found'}</div>;
  }

  const organizedDocTypes = getOrganizedDocumentTypes();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Loan Documents</h1>
        <div className="flex gap-2">
          <Button onClick={handleUploadDocument} variant="primary" size="sm">
            Upload Document
          </Button>
          <Button onClick={handleGenerateSampleDocuments} variant="outline" size="sm">
            Generate Sample Documents
          </Button>
          <Button onClick={handleDeleteAllDocuments} variant="danger" size="sm">
            Delete All Documents
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Document Completion Status</h2>
            <Button 
              onClick={handleToggleViewMode} 
              variant="outline" 
              size="sm"
            >
              {viewMode === 'list' ? 'Socket View' : 'List View'}
            </Button>
          </div>
          
          <div className="flex items-center mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${completionStatus.percentage}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm font-medium">
              {completionStatus.completed} of {completionStatus.total} ({completionStatus.percentage}%)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(categories).map(([category, status]) => (
              <div key={category} className="bg-gray-50 p-3 rounded">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium capitalize">{category}</span>
                  <span className="text-xs">
                    {status.completed}/{status.total}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${status.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : documents.length === 0 && viewMode === 'list' ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-8 rounded text-center">
          <p className="mb-4">No documents found for this loan.</p>
          <p>Click "Generate Sample Documents" to create sample documents for this loan.</p>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            // List view of documents
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onClick={() => handleViewDocument(document)}
                  onStatusChange={async (status: DocumentStatus) => {
                    try {
                      const success = await documentService.updateDocumentStatus(document.id, status);
                      if (success) {
                        loadDocuments();
                        showToast('Success', 'Document status updated', 'success');
                      } else {
                        showToast('Error', 'Failed to update document status', 'error');
                      }
                    } catch (err) {
                      console.error('Error updating document status:', err);
                      showToast('Error', 'An error occurred while updating document status', 'error');
                    }
                  }}
                  onDelete={async () => {
                    if (window.confirm('Are you sure you want to delete this document?')) {
                      try {
                        const success = await documentService.deleteDocument(document.id);
                        if (success) {
                          loadDocuments();
                          showToast('Success', 'Document deleted', 'success');
                        } else {
                          showToast('Error', 'Failed to delete document', 'error');
                        }
                      } catch (err) {
                        console.error('Error deleting document:', err);
                        showToast('Error', 'An error occurred while deleting the document', 'error');
                      }
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            // Socket view of documents
            <div className="space-y-8">
              {organizedDocTypes.map((group) => (
                <DocumentSocketGroup
                  key={`${group.category}|${group.section}`}
                  title={group.title}
                  docTypes={group.docTypes}
                  documents={documents}
                  onUpload={handleUploadDocument}
                  onViewDocument={handleViewDocument}
                />
              ))}
            </div>
          )}
        </>
      )}

      {viewingDocument && selectedDocument && (
        <DocumentViewer document={selectedDocument} onClose={handleCloseViewer} />
      )}

      {uploadingDocument && (
        <DocumentUploadForm
          loanId={loanId}
          onClose={handleCloseUpload}
          onSubmit={async (document: LoanDocument) => {
            try {
              await documentService.addDocument(document);
              showToast('Success', 'Document uploaded successfully', 'success');
              handleCloseUpload();
            } catch (err) {
              console.error('Error uploading document:', err);
              showToast('Error', 'Failed to upload document', 'error');
            }
          }}
        />
      )}
    </div>
  );
} 