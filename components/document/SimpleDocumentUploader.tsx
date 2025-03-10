// components/document/SimpleDocumentUploader.tsx
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { simpleDocumentService } from '@/utilities/simplifiedDocumentService';
import { FileText, Upload, Check, AlertCircle } from 'lucide-react';

interface SimpleDocumentUploaderProps {
  loanId: string;
  onUploadComplete?: (documentInfo: any) => void;
}

export default function SimpleDocumentUploader({ loanId, onUploadComplete }: SimpleDocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle drag and drop
  const [isDragging, setIsDragging] = useState(false);

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

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  // Handle upload process
  const handleUpload = useCallback(async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      // Simulate progress (for better UX)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Upload document using our simplified service
      const result = await simpleDocumentService.addDocument(file, loanId);

      // Clear the interval and set progress to 100%
      clearInterval(progressInterval);
      setProgress(100);

      if (!result) {
        throw new Error("Failed to process document");
      }

      setSuccess(true);
      
      // Call the callback if provided
      if (onUploadComplete) {
        onUploadComplete(result);
      }

      // Reset the form after a delay
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
  }, [file, loanId, onUploadComplete]);

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Upload Loan Document</h3>
      
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
            {file ? file.name : isDragging ? "Drop PDF here" : "Drop your document here"}
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