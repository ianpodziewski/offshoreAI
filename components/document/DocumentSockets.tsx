// components/document/DocumentSockets.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Upload, Check, X, Eye, RefreshCw, FileCheck, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleDocument, simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import { fakeDocumentService } from '@/utilities/fakeDocumentService';
import { loanDatabase } from '@/utilities/loanDatabase';
import { COLORS } from '@/app/theme/colors';
import { useLoanContext } from '@/components/LoanContextProvider';

// Define the required document types for loans
export const REQUIRED_DOCUMENT_TYPES: {
  docType: string;
  label: string;
  category: 'loan' | 'legal' | 'financial' | 'misc';
}[] = [
  { docType: 'executed_package', label: 'Executed Documents Package', category: 'loan' },
  { docType: 'promissory_note', label: 'Promissory Note', category: 'legal' },
  { docType: 'deed_of_trust', label: 'Deed of Trust', category: 'legal' },
  { docType: 'closing_disclosure', label: 'Closing Disclosure', category: 'financial' },
  { docType: 'property_appraisal', label: 'Property Appraisal', category: 'financial' }
];

interface DocumentSocketsProps {
  loanId: string;
  onViewDocument: (document: SimpleDocument) => void;
  refreshTrigger?: number;
}

const DocumentSockets: React.FC<DocumentSocketsProps> = ({ 
  loanId, 
  onViewDocument,
  refreshTrigger = 0
}) => {
  const [documents, setDocuments] = useState<SimpleDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragTarget, setDragTarget] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatingAll, setGeneratingAll] = useState(false);
  const { refreshLoanDocuments } = useLoanContext();
  const [documentGenerated, setDocumentGenerated] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Add states for document type selection
  const [selectedDocType, setSelectedDocType] = useState('');
  const [localRefreshTrigger, setLocalRefreshTrigger] = useState(refreshTrigger);
  const [documentIdsHash, setDocumentIdsHash] = useState(''); // Track unique set of documents
  
  const documentTypes = Object.keys(REQUIRED_DOCUMENT_TYPES.reduce((acc, doc) => {
    acc[doc.docType] = doc.label;
    return acc;
  }, {} as Record<string, string>));
  
  // Clear any duplicate documents for better display
  const clearDuplicateDocuments = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Checking for and cleaning up duplicate documents...");
      
      // Get all documents from the current loan
      const allDocs = simpleDocumentService.getDocumentsForLoan(loanId);
      
      // Group documents by docType
      const docsByType: Record<string, SimpleDocument[]> = {};
      
      // Organize documents by type
      allDocs.forEach(doc => {
        if (!docsByType[doc.docType]) {
          docsByType[doc.docType] = [];
        }
        docsByType[doc.docType].push(doc);
      });
      
      let dupsRemoved = 0;
      const docsToKeep: SimpleDocument[] = [];
      
      // For each document type
      for (const docType in docsByType) {
        const docsOfThisType = docsByType[docType];
        
        // If we have more than one document of this type
        if (docsOfThisType.length > 1) {
          // Sort by date uploaded (newest first)
          docsOfThisType.sort((a, b) => 
            new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime()
          );
          
          // Keep the newest one
          const newestDoc = docsOfThisType[0];
          docsToKeep.push(newestDoc);
          
          // Delete all others
          for (let i = 1; i < docsOfThisType.length; i++) {
            const docToRemove = docsOfThisType[i];
            console.log(`Removing duplicate ${docType} document: ${docToRemove.id}`);
            await simpleDocumentService.deleteDocument(docToRemove.id);
            dupsRemoved++;
          }
        } else {
          // Just one document of this type, keep it
          docsToKeep.push(docsOfThisType[0]);
        }
      }
      
      // Update our state with the deduplicated list
      if (dupsRemoved > 0) {
        console.log(`Cleaned up ${dupsRemoved} duplicate documents`);
        
        // Update state with clean list
        setDocuments(docsToKeep);
        
        // Generate a hash of the document IDs to track changes
        const docIdsHash = docsToKeep.map(d => d.id).sort().join('|');
        setDocumentIdsHash(docIdsHash);
        
        // Show success message if we cleaned up duplicates
        setSuccessMessage(`Cleaned up ${dupsRemoved} duplicate documents`);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        console.log("No duplicate documents found");
      }
    } catch (error) {
      console.error("Error cleaning up duplicate documents:", error);
    } finally {
      setLoading(false);
    }
  }, [loanId]);
  
  // Function to delete a single document
  const deleteDocument = useCallback(async (docId: string) => {
    try {
      setLoading(true);
      
      // Delete the document
      await simpleDocumentService.deleteDocument(docId);
      console.log(`Deleted document: ID ${docId}`);
      
      // Update the state by removing the deleted document
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
      
      // Generate a new hash of document IDs
      const updatedDocs = simpleDocumentService.getDocumentsForLoan(loanId);
      const newDocIdsHash = updatedDocs.map(d => d.id).sort().join('|');
      setDocumentIdsHash(newDocIdsHash);
      
      // Show success message
      setSuccessMessage(`Document deleted successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
      // Refresh loan context
      refreshLoanDocuments();
      setDocumentGenerated(true);
      setLocalRefreshTrigger(prev => prev + 1);
    } catch (error: any) {
      console.error("Error deleting document:", error);
      setErrorMessage(`Failed to delete document: ${error?.message || "Unknown error"}`);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  }, [loanId, refreshLoanDocuments]);
  
  // Fetch documents with de-duplication built in
  const fetchAndDeduplicateDocuments = useCallback(async () => {
    setLoading(true);
    try {
      // First get all documents from localStorage
      const loanDocuments = simpleDocumentService.getDocumentsForLoan(loanId);
      
      // Generate a hash of document IDs to detect changes
      const newDocIdsHash = loanDocuments.map(d => d.id).sort().join('|');
      
      // Check if document set has changed - only update if changed
      if (newDocIdsHash !== documentIdsHash) {
        console.log("Document set has changed, updating component state");
        
        // Group documents by type and keep only the most recent of each type
        const latestByType: Record<string, SimpleDocument> = {};
        
        loanDocuments.forEach(doc => {
          if (!latestByType[doc.docType] || 
              new Date(doc.dateUploaded) > new Date(latestByType[doc.docType].dateUploaded)) {
            latestByType[doc.docType] = doc;
          }
        });
        
        // Convert to array and update state
        const dedupedDocs = Object.values(latestByType);
        setDocuments(dedupedDocs);
        setDocumentIdsHash(newDocIdsHash);
      }
    } catch (error) {
      console.error("Error fetching and deduplicating documents:", error);
    } finally {
      setLoading(false);
    }
  }, [loanId, documentIdsHash]);
  
  // Fetch documents when component mounts or refreshTrigger changes
  useEffect(() => {
    // On mount or refresh trigger change, fetch documents and clean up duplicates
    fetchAndDeduplicateDocuments();
    
    // Then also refresh the loan context to ensure it has the latest data
    if (documentGenerated) {
      refreshLoanDocuments();
      setDocumentGenerated(false);
    }
    
    // Also set up a refresh interval to check for documents
    const intervalId = setInterval(() => {
      if (!loading) {
        fetchAndDeduplicateDocuments();
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(intervalId);
  }, [loanId, localRefreshTrigger, documentGenerated, refreshLoanDocuments, loading, fetchAndDeduplicateDocuments]);
  
  // Also refresh documents from context when component mounts
  useEffect(() => {
    refreshLoanDocuments();
    
    // When the component first mounts, perform a thorough duplicate cleanup
    const cleanupDuplicates = async () => {
      console.log("Component mounted - performing thorough duplicate cleanup");
      try {
        setLoading(true);
        
        // First, use our dedicated deduplication function
        await simpleDocumentService.deduplicateLoanDocuments(loanId);
        
        // Then do our component-level cleanup
        await clearDuplicateDocuments();
        
        // Refresh the documents display with deduplicated documents
        await fetchAndDeduplicateDocuments();
      } catch (error) {
        console.error("Error during thorough document cleanup:", error);
      } finally {
        setLoading(false);
      }
    };
    
    cleanupDuplicates();
    
    // Store a marker in sessionStorage that we've loaded this loan's documents
    // This helps with persistence between page navigations
    const storageKey = `doc_loaded_${loanId}`;
    if (!sessionStorage.getItem(storageKey)) {
      sessionStorage.setItem(storageKey, 'true');
    }
  }, [loanId, refreshLoanDocuments, clearDuplicateDocuments, fetchAndDeduplicateDocuments]);

  // Get document for a specific docType if it exists - always get the most recent
  const getDocumentForType = (docType: string): SimpleDocument | undefined => {
    // Get all documents matching this docType
    const matchingDocs = documents.filter(doc => doc.docType === docType);
    
    // If none found, return undefined
    if (matchingDocs.length === 0) return undefined;
    
    // If only one found, return it
    if (matchingDocs.length === 1) return matchingDocs[0];
    
    // If multiple, return the most recent one (by dateUploaded)
    return matchingDocs.sort((a, b) => 
      new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime()
    )[0];
  };

  // Generate a sample document for a specific type
  const handleGenerateSample = async (docType: string) => {
    try {
      setLoading(true);
      console.log(`Generating sample document of type: ${docType}`);

      // Get the current loan
      const loan = loanDatabase.getLoanById(loanId);
      
      if (!loan) {
        throw new Error(`Loan with ID ${loanId} not found`);
      }

      // First check if a document of this type already exists and remove it
      const existingDocs = simpleDocumentService.getDocumentsForLoan(loanId);
      const existingDocs_ThisType = existingDocs.filter(doc => doc.docType === docType);
      
      // Remove ALL existing documents of this type
      for (const docToRemove of existingDocs_ThisType) {
        console.log(`Removing existing document of type ${docType} before generating new one: ${docToRemove.id}`);
        await simpleDocumentService.deleteDocument(docToRemove.id);
      }

      // Use our fake document service to generate a realistic document
      const newDoc = await fakeDocumentService.generateFakeDocument(loan, docType);

      if (newDoc) {
        console.log(`Generated document: ${newDoc.id}`);
        
        // Set a flag that documents were generated to trigger refresh
        setDocumentGenerated(true);
        
        // Trigger a refresh of our documents
        await fetchAndDeduplicateDocuments();
        
        // Sync the single document to server storage
        setSuccessMessage(`Generated ${docType} document. Syncing to server...`);
        
        try {
          // Call the sync API endpoint for this specific document
          const syncResponse = await fetch(`/api/loan-documents/sync?loanId=${loanId}`);
          const syncData = await syncResponse.json();
          
          if (syncData.error) {
            console.warn('Document sync warning:', syncData.error);
            setSuccessMessage(`Generated ${docType} document. Note: ${syncData.error}`);
          } else {
            console.log('Document synced to server:', syncData);
            setSuccessMessage(`Generated ${docType} document and synced to server`);
          }
        } catch (syncError) {
          console.warn('Error syncing document:', syncError);
          setSuccessMessage(`Generated ${docType} document. Server sync failed (document still available locally)`);
        }
        
        // Force an additional refresh after a delay to ensure UI is updated
        setTimeout(async () => {
          await fetchAndDeduplicateDocuments();
        }, 500);
        
        // Clear success message after a delay
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (error: any) {
      console.error("Error generating sample document:", error);
      setErrorMessage(`Failed to generate ${docType} document: ${error?.message || "Unknown error"}`);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Generate all sample documents
  const handleGenerateAllSamples = async () => {
    try {
      setLoading(true);
      setGeneratingAll(true);
      console.log("Generating all sample documents");

      // Get the current loan
      const loan = loanDatabase.getLoanById(loanId);
      
      if (!loan) {
        throw new Error(`Loan with ID ${loanId} not found`);
      }

      // Use our fake document service to generate all document types
      const generatedDocuments = await fakeDocumentService.generateAllFakeDocuments(loan);

      console.log(`Generated ${generatedDocuments.length} documents successfully`);
      
      // Set a flag that documents were generated to trigger refresh
      setDocumentGenerated(true);
      
      // Trigger a complete refresh to get the latest documents
      await fetchAndDeduplicateDocuments();
      
      // Refresh loan context to ensure documents are persisted
      refreshLoanDocuments();
      
      // Sync documents to server storage
      setSuccessMessage(`Generated ${generatedDocuments.length} documents. Syncing to server...`);
      
      try {
        // Call the sync API endpoint
        const syncResponse = await fetch(`/api/loan-documents/sync?loanId=${loanId}`);
        const syncData = await syncResponse.json();
        
        if (syncData.error) {
          console.warn('Document sync warning:', syncData.error);
          setSuccessMessage(`Generated ${generatedDocuments.length} documents. Note: ${syncData.error}`);
        } else {
          console.log('Documents synced to server:', syncData);
          setSuccessMessage(`Generated ${generatedDocuments.length} documents and synced to server`);
        }
      } catch (syncError) {
        console.warn('Error syncing documents:', syncError);
        setSuccessMessage(`Generated ${generatedDocuments.length} documents. Server sync failed (documents still available locally)`);
      }
      
      // Force an additional refresh after a delay to ensure UI is updated
      setTimeout(async () => {
        await fetchAndDeduplicateDocuments();
        setDocumentGenerated(false);
      }, 1000);
      
      // Clear success message after delay
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error: any) {
      console.error("Error generating all sample documents:", error);
      setErrorMessage(`Failed to generate all documents: ${error?.message || "Unknown error"}`);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setLoading(false);
      setGeneratingAll(false);
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span 
            className="px-2 py-1 text-xs rounded-full" 
            style={{ 
              backgroundColor: COLORS.status.approvedBg, 
              color: COLORS.status.approved 
            }}
          >
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span 
            className="px-2 py-1 text-xs rounded-full" 
            style={{ 
              backgroundColor: COLORS.status.rejectedBg, 
              color: COLORS.status.rejected 
            }}
          >
            Rejected
          </span>
        );
      default:
        return (
          <span 
            className="px-2 py-1 text-xs rounded-full" 
            style={{ 
              backgroundColor: COLORS.status.pendingBg, 
              color: COLORS.status.pending 
            }}
          >
            Pending
          </span>
        );
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent, docType: string) => {
    e.preventDefault();
    setDragTarget(docType);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragTarget(null);
  };

  const handleDrop = useCallback(async (e: React.DragEvent, docType: string, category: 'loan' | 'legal' | 'financial' | 'misc') => {
    e.preventDefault();
    setDragTarget(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Validate file type
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file");
        return;
      }
      
      setUploading(docType);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      try {
        // First, remove any existing documents of this type to avoid duplicates
        const existingDocs = simpleDocumentService.getDocumentsForLoan(loanId);
        const existingDocsOfType = existingDocs.filter(doc => doc.docType === docType);
        
        // Remove all existing documents of this type
        for (const docToRemove of existingDocsOfType) {
          console.log(`Removing existing document of type ${docType} before uploading new one: ${docToRemove.id}`);
          await simpleDocumentService.deleteDocument(docToRemove.id);
        }
      
        // If this is the executed package, handle it differently
        if (docType === 'executed_package') {
          // First upload the package itself
          const uploadedDoc = await simpleDocumentService.addDocument(
            file, 
            loanId,
            { docType: docType, category: category }
          );

          if (uploadedDoc) {
            // Refresh document list after upload
            await fetchAndDeduplicateDocuments();
            
            // Then trigger the split process
            const response = await fetch('/api/split-document', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                documentId: uploadedDoc.id,
                loanId: loanId,
              }),
            });
            
            const result = await response.json();
            
            if (result.success && result.splitDocuments) {
              // Update the documents list with the split documents
              await fetchAndDeduplicateDocuments();
              
              // Clean up any potential duplicates
              await clearDuplicateDocuments();
            }
          }
        } else {
          // Handle normal document upload
          const uploadedDoc = await simpleDocumentService.addDocument(
            file, 
            loanId,
            { docType: docType, category: category }
          );
          
          if (uploadedDoc) {
            // Refresh document list with deduplication
            await fetchAndDeduplicateDocuments();
          }
        }
      } catch (error) {
        console.error("Error uploading document:", error);
      } finally {
        clearInterval(progressInterval);
        setUploadProgress(0);
        setUploading(null);
      }
    }
  }, [loanId, fetchAndDeduplicateDocuments, clearDuplicateDocuments]);

  const handleFilesAccepted = useCallback(async (files: File[]) => {
    try {
      setLoading(true);
      console.log(`Uploading ${files.length} documents`);

      for (const file of files) {
        // Validate file type
        if (file.type !== "application/pdf") {
          console.error(`File ${file.name} is not a PDF`);
          continue;
        }
        
        setUploading(file.name);
        
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 10;
          });
        }, 200);
        
        try {
          // Generate a document type from file name
          const docType = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, '_').toLowerCase();
          
          // Check for and remove any existing documents with this name/type
          const existingDocs = simpleDocumentService.getDocumentsForLoan(loanId);
          const existingDocsOfType = existingDocs.filter(doc => doc.docType === docType);
          
          // Remove all existing documents of this type
          for (const docToRemove of existingDocsOfType) {
            console.log(`Removing existing document with type ${docType} before uploading new one: ${docToRemove.id}`);
            await simpleDocumentService.deleteDocument(docToRemove.id);
          }
        
          // Handle the upload
          const uploadedDoc = await simpleDocumentService.addDocument(
            file, 
            loanId,
            { docType: docType, category: 'misc' }
          );
          
          if (uploadedDoc) {
            // Refresh document list with deduplication
            await fetchAndDeduplicateDocuments();
          }
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
        } finally {
          clearInterval(progressInterval);
          setUploadProgress(0);
          setUploading(null);
        }
      }

      // Final cleanup of any duplicates that might have been created
      await clearDuplicateDocuments();
      
      setSuccessMessage(`${files.length} documents uploaded successfully`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error uploading documents:", error);
      setErrorMessage("Failed to upload documents. Please try again later.");
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setLoading(false);
    }
  }, [loanId, fetchAndDeduplicateDocuments, clearDuplicateDocuments]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    try {
      setLoading(true);
      const files = Array.from(event.target.files);
      console.log(`Uploading ${files.length} documents`);

      for (const file of files) {
        try {
          // Create a docType from the filename (without extension)
          const docType = file.name.replace(/\.[^/.]+$/, "").replace(/\s+/g, '_').toLowerCase();
          
          // Check for and remove any existing documents with this name/type
          const existingDocs = simpleDocumentService.getDocumentsForLoan(loanId);
          const existingDocsOfType = existingDocs.filter(doc => doc.docType === docType);
          
          // Remove all existing documents of this type
          for (const docToRemove of existingDocsOfType) {
            console.log(`Removing existing document with type ${docType} before uploading new one: ${docToRemove.id}`);
            await simpleDocumentService.deleteDocument(docToRemove.id);
          }
        
          const uploadedDoc = await simpleDocumentService.addDocument(
            file, 
            loanId,
            { docType: docType, category: 'misc' }
          );
          
          if (uploadedDoc) {
            setSuccessMessage(`Uploaded document: ${file.name}`);
            setDocumentGenerated(true);
            await fetchAndDeduplicateDocuments();
          }
        } catch (error: any) {
          console.error(`Error uploading file ${file.name}:`, error);
          setErrorMessage(`Failed to upload ${file.name}: ${error?.message || "Unknown error"}`);
        }
      }
      
      // Final cleanup of any duplicates
      await clearDuplicateDocuments();
      
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 3000);
      
    } catch (error: any) {
      console.error("Error handling file upload:", error);
      setErrorMessage(`Upload failed: ${error?.message || "Unknown error"}`);
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setLoading(false);
      // Reset the input value
      if (event.target.value) event.target.value = '';
    }
  }, [loanId, fetchAndDeduplicateDocuments, clearDuplicateDocuments]);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto mb-2" 
             style={{ borderColor: COLORS.primary }}></div>
        <p style={{ color: COLORS.textSecondary }}>Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="document-sockets">
      <div className="document-header" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginBottom: '15px'
        }}>
        <h2>Loan Documents</h2>
        <div className="document-controls" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center'
        }}>
          {/* Add a button to add new documents from upload */}
          <div style={{ position: 'relative' }}>
            <button className="file-upload-button" onClick={() => {
              document.getElementById('main-file-upload')?.click();
            }}>
              <Upload size={18} />
              <span>Upload Document</span>
            </button>
            <input
              type="file"
              id="main-file-upload"
              accept=".pdf,.doc,.docx,.html,.txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              multiple
            />
          </div>
          
          {/* Sample document generator */}
          <div className="sample-document-controls">
            <select 
              value={selectedDocType} 
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="document-type-selector"
            >
              <option value="">Select Document Type</option>
              {documentTypes.map(docType => (
                <option key={docType} value={docType}>
                  {docType.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            <button 
              onClick={() => handleGenerateSample(selectedDocType)}
              disabled={!selectedDocType || loading}
              className="generate-button"
            >
              Generate Sample
            </button>
            <button 
              onClick={handleGenerateAllSamples}
              disabled={loading || generatingAll}
              className="generate-all-button"
            >
              Generate All Samples
            </button>
          </div>
        </div>
      </div>
      
      {/* Status messages */}
      {successMessage && (
        <div className="alert alert-success" style={{
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb'
        }}>
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="alert alert-error" style={{
          padding: '10px',
          margin: '10px 0',
          borderRadius: '4px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb'
        }}>
          {errorMessage}
        </div>
      )}

      {REQUIRED_DOCUMENT_TYPES.map((docTypeInfo) => {
        const document = getDocumentForType(docTypeInfo.docType);
        const isDragging = dragTarget === docTypeInfo.docType;
        const isUploading = uploading === docTypeInfo.docType;
        
        return (
          <div 
            key={docTypeInfo.docType} 
            className={`rounded-md overflow-hidden transition-all ${isDragging ? 'shadow-md' : ''}`}
            style={{ 
              borderWidth: '1px', 
              borderStyle: 'solid',
              borderColor: isDragging ? COLORS.primary : COLORS.border
            }}
          >
            {/* Document Type Header */}
            <div className="px-4 py-3 flex justify-between items-center" 
                 style={{ 
                   backgroundColor: COLORS.bgDark, 
                   borderBottomWidth: '1px', 
                   borderBottomStyle: 'solid',
                   borderBottomColor: COLORS.border
                 }}>
              <h3 className="font-medium" style={{ color: COLORS.textPrimary }}>{docTypeInfo.label}</h3>
              {document && getStatusBadge(document.status)}
            </div>
            
            {/* Document or empty state */}
            <div 
              className={`p-4 ${!document ? 'cursor-pointer' : ''}`}
              style={{ 
                backgroundColor: COLORS.bgDarker,
                borderColor: isDragging ? COLORS.primary : COLORS.border,
              }}
              onDragOver={(e) => handleDragOver(e, docTypeInfo.docType)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, docTypeInfo.docType, docTypeInfo.category)}
            >
              {document ? (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FileText size={18} style={{ color: COLORS.textMuted }} className="mr-3" />
                    <div>
                      <div className="relative">
                        <p className="font-medium" style={{ color: COLORS.textPrimary }}>{document.filename}</p>
                      </div>
                      <p className="text-xs" style={{ color: COLORS.textMuted }}>
                        {new Date(document.dateUploaded).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDocument(document)}
                      style={{ color: COLORS.textAccent }}
                    >
                      <Eye size={16} className="mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteDocument(document.id)}
                      style={{ color: '#f44336' }}
                    >
                      <Trash2 size={16} className="mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : isUploading ? (
                <div className="text-center py-2">
                  <div className="h-2 w-full rounded-full mb-2" style={{ backgroundColor: COLORS.bgHeader }}>
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ 
                        width: `${uploadProgress}%`,
                        backgroundColor: COLORS.primary 
                      }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: COLORS.textSecondary }}>
                    Uploading document...
                  </p>
                </div>
              ) : (
                <div className={`text-center py-3 ${isDragging ? '' : ''}`} style={{ 
                  backgroundColor: isDragging ? COLORS.bgButton : 'transparent' 
                }}>
                  <Upload size={20} className="mx-auto mb-2" style={{ 
                    color: isDragging ? COLORS.primary : COLORS.textMuted 
                  }} />
                  <p className="text-sm" style={{ 
                    color: isDragging ? COLORS.textAccent : COLORS.textSecondary 
                  }}>
                    {isDragging ? 'Drop to upload' : 'Drag & drop a PDF file here'}
                  </p>
                  <div className="flex justify-center mt-2 space-x-2">
                    <label 
                      className="text-xs cursor-pointer hover:underline"
                      style={{ color: COLORS.textAccent }}
                      htmlFor={`file-upload-${docTypeInfo.docType}`}
                    >
                      Upload File
                      <input 
                        type="file" 
                        id={`file-upload-${docTypeInfo.docType}`}
                        className="hidden" 
                        accept=".pdf"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <span className="text-xs" style={{ color: COLORS.textMuted }}>or</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs hover:underline p-0 h-auto"
                      style={{ color: COLORS.textAccent }}
                      onClick={() => handleGenerateSample(docTypeInfo.docType)}
                      disabled={generatingAll}
                    >
                      Generate Sample
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DocumentSockets;