"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DocumentCard } from '@/components/DocumentCard';
import { Tooltip } from '@/components/Tooltip';
import { Button } from '@/components/Button';
import { DocumentUploadForm } from '@/components/DocumentUploadForm';
import { DocumentViewer } from '@/components/DocumentViewer';
import { DocumentSocketGroup } from '@/components/DocumentSocketGroup';
import LayoutWrapper from '@/app/layout-wrapper';
import LoanSidebar from '@/components/loan/LoanSidebar';
import { 
  LoanDocument, 
  DocumentCategory, 
  DocumentStatus, 
  getAllDocumentTypes,
  getRequiredDocuments,
  DOCUMENT_STRUCTURE
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

interface DocumentGroup {
  category: string;
  section: string;
  title: string;
  docTypes: DocumentType[];
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
  
  // New state for tracking the selected document type for upload
  const [selectedDocType, setSelectedDocType] = useState<{
    docType: string;
    category: string;
    section: string;
  } | null>(null);
  
  // State for category filter
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
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
  
  // Function to handle filter changes
  const handleFilterChange = (category: string) => {
    setActiveFilter(category === activeFilter ? null : category);
  };
  
  const loadDocuments = async () => {
    try {
      console.log("Loading documents for loan:", loanId);
      setLoading(true);
      setError(null);
  
      // Ensure loan data is loaded
      if (!loan) {
        console.error('Cannot load documents: Loan data not available');
        setError('Loan data not available');
        return;
      }
  
      // Load documents from service
      console.log("Calling documentService.getDocumentsForLoan...");
      const docs = await documentService.getDocumentsForLoan(loanId);
      console.log("Documents retrieved:", docs ? docs.length : 0);
      console.log("Document details:", docs ? docs.map(doc => ({
        id: doc.id,
        docType: doc.docType,
        category: doc.category,
        section: doc.section,
        filename: doc.filename
      })) : []);
      
      setDocuments(docs || []);
      console.log("Documents state updated");
  
      // Get document completion status
      const status = await documentService.getDocumentCompletionStatus(loanId, loan.loanType);
      console.log("Document completion status:", status);
      
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

  // Modified to accept document type information
  const handleUploadDocument = (docType?: string, category?: string, section?: string) => {
    if (docType && category) {
      // If we have document type info, store it
      setSelectedDocType({
        docType,
        category,
        section: section || ''
      });
    } else {
      // For generic uploads (from the main Upload button)
      setSelectedDocType(null);
    }
    setUploadingDocument(true);
  };

  const handleCloseViewer = () => {
    setViewingDocument(false);
    setSelectedDocument(null);
  };

  // Implement a document submission handler with the correct documentService method
  const handleSubmitDocument = async (document: LoanDocument): Promise<void> => {
    try {
      console.log("Starting document submission...");
      
      // If we have a selected document type, apply it to the document
      if (selectedDocType) {
        document.docType = selectedDocType.docType;
        document.category = selectedDocType.category as DocumentCategory;
        document.section = selectedDocType.section;
        console.log(`Applied docType info: ${document.docType}, ${document.category}, ${document.section}`);
      } else {
        console.log("No docType selected, using defaults from form");
      }
      
      // Make sure the loanId is set
      document.loanId = loanId;
      
      // Use the addDocument method from documentService
      await documentService.addDocument(document);
      
      console.log("Document saved successfully");
      showToast('Success', 'Document uploaded successfully', 'success');
    } catch (err) {
      console.error('Error uploading document:', err);
      showToast('Error', 'Failed to upload document', 'error');
      throw err;
    }
  };

  const fetchDocuments = async () => {
    try {
      console.log("Fetching documents only...");
      
      if (!loanId) {
        console.error("Cannot fetch documents: missing loanId");
        return;
      }
      
      const docs = await documentService.getDocumentsForLoan(loanId);
      console.log(`Retrieved ${docs.length} documents`);
      
      // Update state with the new documents
      setDocuments(docs || []);
      
      console.log("Documents state updated successfully");
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };

  // Updated close handler that only fetches documents
  const handleCloseUpload = () => {
    setUploadingDocument(false);
    setSelectedDocType(null); // Clear the selected document type
    
    // Only fetch documents, not all the status information
    fetchDocuments();
  };

  // Modified handleGenerateSampleDocuments function for DocumentsPage.tsx
  const handleGenerateSampleDocuments = async () => {
    try {
      if (!loan) {
        showToast('Error', 'Loan data not available', 'error');
        return;
      }

      showToast('Info', 'Generating sample documents...', 'info');

      // Get current document types that already have user uploads
      // (we don't want to overwrite these with samples)
      const existingUserDocs = documents.filter(doc => 
        !doc.filename?.startsWith('SAMPLE_')
      );
      
      // Create a set of doc types that already have user uploads
      const userDocTypes = new Set(existingUserDocs.map(doc => doc.docType));

      // First, find and delete only existing sample documents
      const existingSamples = documents.filter(doc => 
        doc.filename && doc.filename.startsWith('SAMPLE_')
      );
      
      if (existingSamples.length > 0) {
        showToast('Info', 'Removing existing sample documents...', 'info');
        
        // Delete each sample document
        for (const doc of existingSamples) {
          await documentService.deleteDocument(doc.id);
        }
      }

      // Generate new sample documents - for ALL doc types
      // We'll filter them later based on existing user uploads
      const generatedDocs = await documentService.generateSampleDocuments(loanId, loan.loanType);
      
      // Filter out any generated samples for doc types that already have user uploads
      const filteredDocs = generatedDocs.filter(doc => !userDocTypes.has(doc.docType));
      
      if (filteredDocs.length === 0) {
        showToast('Warning', 'No new sample documents were generated', 'warning');
      } else {
        // Save each document individually using addDocument 
        // since saveDocuments is not available
        for (const doc of filteredDocs) {
          await documentService.addDocument(doc);
        }
        
        showToast('Success', `Generated ${filteredDocs.length} sample documents`, 'success');
      }

      // Reload documents
      loadDocuments();
    } catch (err) {
      console.error('Error generating sample documents:', err);
      showToast('Error', 'Failed to generate sample documents', 'error');
    }
  };

  const handleDeleteDocument = async (document: LoanDocument) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        // Add loading state
        setLoading(true);
        
        console.log(`Attempting to delete document: ${document.id}`);
        
        const success = await documentService.deleteDocument(document.id);
        
        if (success) {
          console.log(`Document ${document.id} successfully deleted`);
          // Add a small delay before reloading
          setTimeout(() => {
            loadDocuments();
            showToast('Success', 'Document deleted', 'success');
          }, 300);
        } else {
          console.error(`Failed to delete document ${document.id}`);
          showToast('Error', 'Failed to delete document', 'error');
        }
      } catch (err) {
        console.error('Error deleting document:', err);
        showToast('Error', 'An error occurred while deleting the document', 'error');
      } finally {
        setLoading(false);
      }
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

  const getOrganizedDocumentTypes = () => {
    if (!loan) return [];
    
    const organizedGroups: DocumentGroup[] = [];
    
    // Iterate through the structure in the original order
    Object.entries(DOCUMENT_STRUCTURE).forEach(([category, sections]) => {
      Object.entries(sections).forEach(([sectionKey, sectionData]) => {
        // Create a group for this category and section
        const group: DocumentGroup = {
          category: category,
          section: sectionKey,
          title: `${category.charAt(0).toUpperCase() + category.slice(1)} - ${sectionData.title}`,
          docTypes: []
        };
        
        // Add all document types for this section
        sectionData.documents.forEach(doc => {
          group.docTypes.push({
            docType: doc.docType,
            label: doc.label,
            category: category,
            section: sectionKey,
            subsection: '',  // If needed
            isRequired: doc.isRequired
          });
        });
        
        // Add this group to our results
        organizedGroups.push(group);
      });
    });
    
    return organizedGroups;
  };

  const fixDocumentDisplay = async () => {
    try {
      console.log("🔍 Running document display diagnostic...");
      
      // Step 1: Verify documents are in the storage
      console.log("Checking document storage...");
      const storedDocs = await documentService.getDocumentsForLoan(loanId);
      console.log(`Storage contains ${storedDocs.length} documents for loan ${loanId}`);
      
      // Step 2: Compare with state
      console.log(`Current state contains ${documents.length} documents`);
      
      // Step 3: Check specific document types
      const docTypeMap = new Map();
      
      // Build a map of docType -> count from stored docs
      storedDocs.forEach(doc => {
        const count = docTypeMap.get(doc.docType) || 0;
        docTypeMap.set(doc.docType, count + 1);
      });
      
      console.log("Document types in storage:");
      docTypeMap.forEach((count, docType) => {
        console.log(`- ${docType}: ${count} document(s)`);
      });
      
      // Step 4: Check for matching socket types
      const organizedTypes = getOrganizedDocumentTypes();
      const socketDocTypes = new Set(
        organizedTypes.flatMap(g => g.docTypes.map(dt => dt.docType))
      );
      
      console.log("Document sockets available:");
      organizedTypes.forEach(group => {
        console.log(`- ${group.title}:`);
        group.docTypes.forEach(dt => {
          console.log(`  - ${dt.label} (${dt.docType})`);
        });
      });
      
      // Step 5: Find documents that don't match any socket
      const orphanedDocs = storedDocs.filter(doc => !socketDocTypes.has(doc.docType));
      
      if (orphanedDocs.length > 0) {
        console.log("⚠️ Found documents that don't match any socket:");
        orphanedDocs.forEach(doc => {
          console.log(`- ${doc.filename} (docType: "${doc.docType}")`);
        });
        
        console.log("Would you like to fix these documents? Check browser console for instructions.");
        console.log("To fix a document, run: fixOrphanedDocument(documentId, newDocType)");
      } else {
        console.log("✅ All documents match a valid socket docType");
      }
      
      // Step 6: Check document matcher function
      console.log("Testing document matching...");
      storedDocs.forEach(doc => {
        const matchingDocs = documents.filter(d => d.docType === doc.docType);
        console.log(`DocType "${doc.docType}" (${doc.filename}): ${matchingDocs.length} matches in state`);
      });
      
      // Step 7: Force refresh of documents
      console.log("Forcing document refresh...");
      await fetchDocuments();
      console.log("Documents refreshed");
      
      return {
        storedDocsCount: storedDocs.length,
        stateDocsCount: documents.length,
        docTypes: Array.from(docTypeMap.entries()),
        orphanedDocs: orphanedDocs
      };
    } catch (err) {
      console.error("Error diagnosing document display:", err);
      return null;
    }
  };
  
  // Function to fix orphaned documents using the available documentService methods
  const fixOrphanedDocument = async (documentId: string, newDocType: string) => {
    try {
      // Get the document
      const doc = await documentService.getDocumentById(documentId);
      
      if (!doc) {
        console.error(`Document ${documentId} not found`);
        return false;
      }
      
      // Find matching socket type
      const organizedTypes = getOrganizedDocumentTypes();
      let matchingType = null;
      
      for (const group of organizedTypes) {
        for (const socketType of group.docTypes) {
          if (socketType.docType === newDocType) {
            matchingType = socketType;
            break;
          }
        }
        if (matchingType) break;
      }
      
      if (!matchingType) {
        console.error(`No socket found with docType "${newDocType}"`);
        return false;
      }
      
      console.log(`Updating document ${doc.filename} from "${doc.docType}" to "${newDocType}"`);
      
      // Update the document fields
      doc.docType = newDocType;
      doc.category = matchingType.category as DocumentCategory;
      doc.section = matchingType.section;
      
      // Save the updated document using addDocument (which will update existing document)
      await documentService.addDocument(doc);
      
      console.log("Document updated successfully");
      await fetchDocuments();
      
      return true;
    } catch (err) {
      console.error("Error fixing orphaned document:", err);
      return false;
    }
  };
  
  // Add these to the window for console access
  (window as any).fixDocumentDisplay = fixDocumentDisplay;
  (window as any).fixOrphanedDocument = fixOrphanedDocument;

  // Add this function to DocumentsPage.tsx to help debug document matching issues
  const findDocumentByFilename = (filename: string) => {
    console.log(`Searching for document with filename containing: ${filename}`);
    
    // Get current documents from state
    const matchingDocs = documents.filter(doc => 
      doc.filename && doc.filename.toLowerCase().includes(filename.toLowerCase())
    );
    
    console.log(`Found ${matchingDocs.length} matching documents`);
    
    if (matchingDocs.length > 0) {
      // Log the details of matching documents
      matchingDocs.forEach((doc, index) => {
        console.log(`Match #${index + 1}:`);
        console.log(`- ID: ${doc.id}`);
        console.log(`- Filename: ${doc.filename}`);
        console.log(`- Document Type: ${doc.docType}`);
        console.log(`- Category: ${doc.category}`);
        console.log(`- Section: ${doc.section}`);
        
        // Now check if this document would match any socket
        const organizedTypes = getOrganizedDocumentTypes();
        let matchingSocket = false;
        
        for (const group of organizedTypes) {
          for (const socketType of group.docTypes) {
            if (socketType.docType === doc.docType) {
              console.log(`- Would match socket: ${socketType.label} (${group.title})`);
              matchingSocket = true;
              break;
            }
          }
          if (matchingSocket) break;
        }
        
        if (!matchingSocket) {
          console.log(`- WARNING: Document doesn't match any socket!`);
          console.log(`- Available socket docTypes: ${organizedTypes
            .flatMap(g => g.docTypes.map(dt => dt.docType))
            .join(', ')}`);
        }
      });
    } else {
      console.log("No matching documents found");
    }
    
    return matchingDocs;
  };

  useEffect(() => {
    // Initialize documents when the loan data is loaded
    if (loan && !loanLoading) {
      loadDocuments();
    }
  }, [loan, loanLoading]);

  if (loanLoading) {
    return (
      <LayoutWrapper>
        <div className="p-6">Loading loan data...</div>
      </LayoutWrapper>
    );
  }

  if (loanError || !loan) {
    return (
      <LayoutWrapper>
        <div className="p-6 text-red-500">Error loading loan: {loanError || 'Loan not found'}</div>
      </LayoutWrapper>
    );
  }

  const organizedDocTypes = getOrganizedDocumentTypes();

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Loan Documents</h1>
          <p className="text-lg mt-1 text-gray-500">
            {loan.propertyAddress}
          </p>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-6">
          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <Button onClick={() => handleUploadDocument()} variant="primary" size="sm">
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

            {/* Update the Document Completion Status card */}
            <div className="mb-6">
              <div className="bg-[#131B2E] p-4 rounded-lg shadow">
                <div className="flex items-center mb-2">
                  <h2 className="text-lg font-semibold text-white">Document Completion Status</h2>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${completionStatus.percentage}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-200">
                    {completionStatus.completed} of {completionStatus.total} ({completionStatus.percentage}%)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(categories).map(([category, status]) => (
                    <div key={category} className="bg-[#1A2234] p-3 rounded">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize text-gray-200">{category}</span>
                        <span className="text-xs text-gray-400">
                          {status.completed}/{status.total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className="bg-indigo-600 h-1.5 rounded-full"
                          style={{ width: `${status.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Update the category filter buttons to match the theme */}
            <div className="mb-6 flex justify-center flex-wrap gap-2">
              <Button
                onClick={() => handleFilterChange('borrower')}
                className={`rounded-full px-4 py-2 transition-colors ${
                  activeFilter === 'borrower' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-[#131B2E] text-gray-200 hover:bg-[#1A2234]'
                }`}
              >
                Borrower
              </Button>
              <Button
                onClick={() => handleFilterChange('property')}
                className={`rounded-full px-4 py-2 transition-colors ${
                  activeFilter === 'property' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-[#131B2E] text-gray-200 hover:bg-[#1A2234]'
                }`}
              >
                Property
              </Button>
              <Button
                onClick={() => handleFilterChange('closing')}
                className={`rounded-full px-4 py-2 transition-colors ${
                  activeFilter === 'closing' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-[#131B2E] text-gray-200 hover:bg-[#1A2234]'
                }`}
              >
                Closing
              </Button>
              <Button
                onClick={() => handleFilterChange('servicing')}
                className={`rounded-full px-4 py-2 transition-colors ${
                  activeFilter === 'servicing' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-[#131B2E] text-gray-200 hover:bg-[#1A2234]'
                }`}
              >
                Servicing
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center p-12">
                <div className="spinner"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            ) : (
              // Only show Socket view
              <div className="space-y-8">
                {organizedDocTypes
                  .filter(group => !activeFilter || group.category === activeFilter)
                  .map((group) => (
                  <DocumentSocketGroup
                    key={`${group.category}|${group.section}`}
                    title={group.title}
                    docTypes={group.docTypes}
                    documents={documents}
                    onUpload={(docType, category, section) => 
                      handleUploadDocument(docType, category, section)
                    }
                    onViewDocument={handleViewDocument}
                    onDeleteDocument={handleDeleteDocument}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <LoanSidebar loan={loan} activePage="documents"/>
          </div>
        </div>
      </div>

      {viewingDocument && selectedDocument && (
        <DocumentViewer document={selectedDocument} onClose={handleCloseViewer} />
      )}

      {uploadingDocument && (
        <DocumentUploadForm
          loanId={loanId}
          // Pass the selected document type info to the upload form
          docType={selectedDocType?.docType}
          category={selectedDocType?.category}
          section={selectedDocType?.section}
          onClose={handleCloseUpload}
          onSubmit={handleSubmitDocument}
        />
      )}
    </LayoutWrapper>
  );
}