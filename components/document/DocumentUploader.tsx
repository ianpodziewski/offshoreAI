// components/document/DocumentUploader.tsx
import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '@/utilities/firebaseConfig';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Check, AlertCircle } from 'lucide-react';

interface DocumentUploaderProps {
  loanId: string;
  onUploadComplete?: (documentInfo: any) => void;
}

export default function DocumentUploader({ loanId, onUploadComplete }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      // Simulate progress (for demo purposes - in a real app we'd use an upload tracking mechanism)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // 1. Upload file to Firebase Storage
      const storageRef = ref(storage, `loans/${loanId}/${file.name}`);
      await uploadBytes(storageRef, await file.arrayBuffer());
      const downloadURL = await getDownloadURL(storageRef);

      // Clear the interval and set progress to 100%
      clearInterval(progressInterval);
      setProgress(100);

      // 2. Classify document type (simulated for demo)
      const documentType = classifyDocumentType(file.name);
      const category = mapTypeToCategory(documentType);

      // 3. Store metadata in Firestore
      const docRef = await addDoc(collection(db, 'documents'), {
        loanId,
        filename: file.name,
        fileURL: downloadURL,
        documentType,
        category,
        uploadDate: new Date().toISOString(),
        status: 'pending',
        fileSize: file.size
      });

      setSuccess(true);
      
      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete({
          id: docRef.id,
          filename: file.name,
          documentType,
          category,
          url: downloadURL
        });
      }

      // Reset the form after a short delay
      setTimeout(() => {
        setFile(null);
        setSuccess(false);
        setProgress(0);
      }, 3000);

    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Simple document type classification based on filename (would use AI in a real app)
  function classifyDocumentType(filename: string): string {
    const lowerName = filename.toLowerCase();
    
    if (lowerName.includes('note') || lowerName.includes('promissory')) 
      return 'promissory_note';
    if (lowerName.includes('deed') || lowerName.includes('trust')) 
      return 'deed_of_trust';
    if (lowerName.includes('disclosure') || lowerName.includes('closing')) 
      return 'closing_disclosure';
    if (lowerName.includes('agreement')) 
      return 'compliance_agreement';
    if (lowerName.includes('appraisal')) 
      return 'appraisal_report';
    
    return 'unclassified_document';
  }

  // Map document types to categories
  function mapTypeToCategory(docType: string): string {
    const categories: Record<string, string> = {
      'promissory_note': 'loan',
      'deed_of_trust': 'legal',
      'closing_disclosure': 'financial',
      'compliance_agreement': 'legal',
      'appraisal_report': 'financial',
    };
    
    return categories[docType] || 'misc';
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Upload Loan Document</h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
        <input 
          type="file" 
          id="file-upload"
          accept=".pdf" 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <label 
          htmlFor="file-upload" 
          className="flex flex-col items-center cursor-pointer"
        >
          <FileText size={48} className="text-gray-400 mb-3" />
          <p className="text-lg font-medium mb-2">
            {file ? file.name : "Drop your document here"}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Upload a PDF document
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
              <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
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
          <p className="text-xs text-center mt-1">{progress}% - Processing document...</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md flex items-center">
          <Check size={16} className="mr-2" />
          <p>Document uploaded and processed successfully!</p>
        </div>
      )}
      
      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full"
      >
        <Upload size={16} className="mr-2" />
        {uploading ? "Processing..." : "Upload & Process Document"}
      </Button>
    </div>
  );
}