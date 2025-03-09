// Update /app/upload/page.tsx
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileIcon, ArrowRight, AlertCircle, Upload, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LayoutWrapper from '../layout-wrapper';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<any[]>([]);

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
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage("Uploading document package...");
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Step 1: Upload to Blob storage
      setProgress(20);
      const uploadRes = await fetch("/api/upload", { 
        method: "POST", 
        body: formData 
      });
      
      if (!uploadRes.ok) {
        throw new Error("Failed to upload document");
      }
      
      setProgress(40);
      setMessage("Processing and splitting documents...");
      
      // Step 2: Process the uploaded PDF
      const fileBuffer = await file.arrayBuffer();
      setProgress(60);
      
      const splitResponse = await fetch("/api/split_pdf", {
        method: "POST",
        body: fileBuffer,
      });

      const splitData = await splitResponse.json();
      
      if (!splitResponse.ok) {
        throw new Error(splitData.message || "Failed to process documents");
      }
      
      setProcessedFiles(splitData.files || []);
      setProgress(100);
      setMessage("Document package processed successfully!");
      setSuccess(true);
      
      // Wait a moment before navigating to documents page
      setTimeout(() => {
        router.push('/documents');
      }, 3000);
      
    } catch (error: any) {
      setError(`Error: ${error.message || "Failed to process upload"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle>Upload Executed Loan Document Package</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {!success ? (
                <>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
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
                      <FileText size={48} className="text-gray-400 mb-4" />
                      <p className="text-lg font-medium mb-2">
                        {file ? file.name : "Drop your document package here"}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload a PDF containing all loan documents
                      </p>
                      <Button 
                        type="button" 
                        variant="outline"
                      >
                        Select PDF File
                      </Button>
                    </label>
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-center gap-2">
                      <AlertCircle size={16} />
                      <p>{error}</p>
                    </div>
                  )}
                  
                  {file && (
                    <div className="flex justify-center">
                      <Button 
                        onClick={handleUpload} 
                        disabled={uploading}
                        className="px-6"
                      >
                        {uploading ? "Processing..." : "Process Document Package"}
                      </Button>
                    </div>
                  )}
                  
                  {uploading && (
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-center text-sm text-gray-600">{message}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Document Package Processed</h3>
                  <p className="text-gray-600">
                    Your document package has been successfully processed and split into {processedFiles.length} documents
                  </p>
                  <p className="text-sm text-gray-500">Redirecting to documents page...</p>
                  <Link 
                    href="/documents" 
                    className="inline-flex items-center gap-2 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                  >
                    View Documents <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  );
}