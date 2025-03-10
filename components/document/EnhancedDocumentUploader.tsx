import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Check, AlertCircle, FileUp } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { storage, db } from '@/utilities/firebaseConfig';

interface EnhancedDocumentUploaderProps {
  loanId: string;
  onUploadComplete?: (documents: any[]) => void;
}

interface ProcessedDocument {
  path: string;
  filename: string;
  docType: string;
  category: string;
  pageRange: string;
  confidenceScore: number;
}

export default function EnhancedDocumentUploader({ loanId, onUploadComplete }: EnhancedDocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [processedDocs, setProcessedDocs] = useState<ProcessedDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // Only accept PDFs
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (droppedFile.type !== "application/pdf") {
        setError("Please drop a PDF file");
        return;
      }
      
      setFile(droppedFile);
      setError(null);
    }
  }, []);

  const storeProcessedDocuments = async (documents: ProcessedDocument[]) => {
    try {
      // Create a batch write to store all documents
      const batch = writeBatch(db);
      const storedDocs = [];
      
      for (const doc_info of documents) {
        // Create a reference to a new document
        const docRef = doc(collection(db, 'documents'));
        
        // Add document data
        batch.set(docRef, {
          id: docRef.id,
          loanId,
          filename: doc_info.filename,
          fileURL: `/uploads/split/${doc_info.filename}`, // Path to the split file
          documentType: doc_info.docType,
          category: doc_info.category,
          uploadDate: new Date().toISOString(),
          status: 'pending',
          confidenceScore: doc_info.confidenceScore,
          pageRange: doc_info.pageRange,
          extractedFromBulk: true
        });
        
        storedDocs.push({
          ...doc_info,
          id: docRef.id
        });
      }
      
      // Commit the batch
      await batch.commit();
      return storedDocs;
      
    } catch (error) {
      console.error("Error storing processed documents:", error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);
    setProcessedDocs([]);

    try {
      // Step 1: Upload the file to temporary storage for processing
      setProgress(20);
      setProgress(40);
      
      // Step 2: Process and split the PDF
      setProgress(60);
      
      // Create a FormData object to send the file
      const fileBuffer = await file.arrayBuffer();
      
      const splitResponse = await fetch("/api/split_pdf", {
        method: "POST",
        body: fileBuffer,
      });
      
      if (!splitResponse.ok) {
        throw new Error(`HTTP error: ${splitResponse.status}`);
      }

      const splitData = await splitResponse.json();
      
      if (!splitData.success) {
        throw new Error(splitData.message || "Failed to process PDF");
      }
      
      setProgress(80);
      
      // Save the processed documents to the database
      const documents = await storeProcessedDocuments(splitData.files);
      
      setProcessedDocs(splitData.files);
      setProgress(100);
      setSuccess(true);
      
      // Call the callback with the stored documents
      if (onUploadComplete) {
        onUploadComplete(documents);
      }
      
      // Reset after 5 seconds
      setTimeout(() => {
        setFile(null);
        setSuccess(false);
        setProgress(0);
        setProcessedDocs([]);
      }, 5000);
      
    } catch (error) {
      console.error("Upload error:", error);
      setError(`Failed to upload and process file: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setUploading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'loan': 'bg-blue-100 text-blue-800',
      'legal': 'bg-purple-100 text-purple-800',
      'financial': 'bg-green-100 text-green-800',
      'misc': 'bg-gray-100 text-gray-800'
    };
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Enhanced Document Processor</h3>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          id="enhanced-file-upload"
          accept=".pdf" 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <label 
          htmlFor="enhanced-file-upload" 
          className="flex flex-col items-center cursor-pointer"
        >
          <FileUp size={48} className="text-gray-400 mb-3" />
          <p className="text-lg font-medium mb-2">
            {file ? file.name : isDragging ? "Drop PDF here" : "Upload Document Package"}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Upload a PDF with multiple documents to automatically split and classify
          </p>
          <Button 
            type="button" 
            variant="outline"
          >
            Select PDF File
          </Button>
        </label>
      </div>
      
      {file && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <div className="flex items-center">
            <FileText size={20} className="text-gray-500 mr-2" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
          <AlertCircle size={16} className="mr-2" />
          <p>{error}</p>
        </div>
      )}
      
      {uploading && (
        <div className="mb-4">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center mt-1">{progress}% - {
            progress < 40 ? "Uploading document package..." :
            progress < 80 ? "Processing and analyzing document..." :
            "Storing documents..."
          }</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
          <div className="flex items-center mb-2">
            <Check size={16} className="mr-2" />
            <p className="font-medium">Document package processed successfully!</p>
          </div>
          
          <p className="text-sm mb-2">Split into {processedDocs.length} documents:</p>
          
          <div className="max-h-40 overflow-y-auto">
            <ul className="text-xs space-y-2">
              {processedDocs.map((doc, index) => (
                <li key={index} className="flex justify-between p-2 rounded-md bg-white">
                  <div>
                    <span className="font-medium capitalize">{doc.docType.replace(/_/g, ' ')}</span>
                    <span className="text-gray-500 ml-2">(Pages {doc.pageRange})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(doc.category)}`}>
                      {doc.category}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                      {Math.round(doc.confidenceScore * 100)}% confidence
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full"
      >
        <Upload size={16} className="mr-2" />
        {uploading ? "Processing..." : "Process Document Package"}
      </Button>
      
      <div className="mt-4 text-xs text-gray-500 p-2 bg-gray-50 rounded">
        <p className="font-medium">AI-Powered Document Splitting</p>
        <p className="mt-1">This enhanced document processor will:</p>
        <ul className="mt-1 list-disc pl-5 space-y-1">
          <li>Analyze the content of the document using AI</li>
          <li>Automatically identify document types</li>
          <li>Split multi-document PDFs into separate files</li>
          <li>Categorize and organize documents automatically</li>
        </ul>
      </div>
    </div>
  );
}