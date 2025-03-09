// components/document/BulkDocumentProcessor.tsx
import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { storage, db } from '@/utilities/firebaseConfig';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Check, AlertCircle, FileUp } from 'lucide-react';

interface BulkDocumentProcessorProps {
  loanId: string;
  onProcessComplete?: () => void;
}

export default function BulkDocumentProcessor({ loanId, onProcessComplete }: BulkDocumentProcessorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [splitDocuments, setSplitDocuments] = useState<any[]>([]);

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
      setSplitDocuments([]);
    }
  };

  const handleProcess = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setError(null);
    setSuccess(false);
    setSplitDocuments([]);

    try {
      // Simulate progress (for demo purposes)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 10;
        });
      }, 500);

      // 1. Upload the main PDF to Firebase Storage
      const storageRef = ref(storage, `loans/${loanId}/bulk/${file.name}`);
      await uploadBytes(storageRef, await file.arrayBuffer());
      const downloadURL = await getDownloadURL(storageRef);

      // Clear the interval and set progress to 90%
      clearInterval(progressInterval);
      setProgress(90);

      // 2. Simulate PDF splitting by creating multiple document entries
      // In a real implementation, this would be done by a server-side process
      const splitDocs = simulatePdfSplit(file.name, downloadURL, loanId);
      setSplitDocuments(splitDocs);

      // 3. Save the split documents to Firestore
      const batchWrite = writeBatch(db);
      
      for (const splitDoc of splitDocs) {
        const docRef = doc(collection(db, 'documents'));
        batchWrite.set(docRef, {
          ...splitDoc,
          id: docRef.id
        });
      }
      
      await batchWrite.commit();
      
      setProgress(100);
      setSuccess(true);
      
      // Call the callback if provided
      if (onProcessComplete) {
        onProcessComplete();
      }

      // Reset the form after a delay
      setTimeout(() => {
        setFile(null);
        setSuccess(false);
        setProgress(0);
        setSplitDocuments([]);
      }, 5000);

    } catch (error) {
      console.error("Processing error:", error);
      setError("Failed to process file. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  // Add this function inside the BulkDocumentProcessor component before the simulatePdfSplit function
  function analyzeDocumentContent(filename: string) {
    // In a real application, this would use AI to analyze document content
    // For now, simulate analysis based on filename patterns
    const analysis = {
      detectedType: 'unknown',
      confidenceScore: 0,
      suggestedCategory: 'misc'
    };
    
    // Simulate document analysis
    if (filename.toLowerCase().includes('closing')) {
      analysis.detectedType = 'closing_disclosure';
      analysis.confidenceScore = 0.92;
      analysis.suggestedCategory = 'financial';
    } else if (filename.toLowerCase().includes('note')) {
      analysis.detectedType = 'promissory_note';
      analysis.confidenceScore = 0.89;
      analysis.suggestedCategory = 'loan';
    } else if (filename.toLowerCase().includes('deed') || filename.toLowerCase().includes('trust')) {
      analysis.detectedType = 'deed_of_trust';
      analysis.confidenceScore = 0.87;
      analysis.suggestedCategory = 'legal';
    } else {
      // Random document type for simulation
      const types = [
        { type: 'appraisal_report', category: 'financial', confidence: 0.75 },
        { type: 'insurance_policy', category: 'legal', confidence: 0.78 },
        { type: 'credit_report', category: 'financial', confidence: 0.82 },
        { type: 'identity_verification', category: 'legal', confidence: 0.76 }
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      analysis.detectedType = randomType.type;
      analysis.confidenceScore = randomType.confidence;
      analysis.suggestedCategory = randomType.category;
    }
    
    return analysis;
  }

  // Update the simulatePdfSplit function to use the analyzer
  function simulatePdfSplit(filename: string, url: string, loanId: string) {
    const documents = [];
    
    // Simulate 3-7 documents from one PDF
    const numDocs = Math.floor(Math.random() * 5) + 3;
    
    // Predefined document types to cycle through
    const docTypes = [
      { type: 'promissory_note', category: 'loan' },
      { type: 'deed_of_trust', category: 'legal' },
      { type: 'closing_disclosure', category: 'financial' },
      { type: 'compliance_agreement', category: 'legal' },
      { type: 'appraisal_report', category: 'financial' },
      { type: 'insurance_policy', category: 'financial' },
      { type: 'tax_return', category: 'financial' }
    ];
    
    for (let i = 0; i < numDocs; i++) {
      const docInfo = docTypes[i % docTypes.length];
      
      // Analyze the "content" of this simulated document
      const simulatedName = `${docInfo.type}_${i+1}.pdf`;
      const analysis = analyzeDocumentContent(simulatedName);
      
      documents.push({
        loanId,
        filename: simulatedName,
        fileURL: url, // In a real app, each doc would have its own URL
        documentType: docInfo.type,
        category: docInfo.category,
        uploadDate: new Date().toISOString(),
        status: 'pending',
        extractedFromBulk: true,
        bulkSourceFile: filename,
        pageRange: `${i*3+1}-${i*3+3}`, // Simulate page ranges
        confidenceScore: analysis.confidenceScore
      });
    }
    
    return documents;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-4">Bulk Document Processing</h3>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
        <input 
          type="file" 
          id="bulk-upload"
          accept=".pdf" 
          onChange={handleFileChange} 
          className="hidden" 
        />
        <label 
          htmlFor="bulk-upload" 
          className="flex flex-col items-center cursor-pointer"
        >
          <FileUp size={48} className="text-gray-400 mb-3" />
          <p className="text-lg font-medium mb-2">
            {file ? file.name : "Upload Document Package"}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Upload a PDF with multiple documents to split automatically
          </p>
          <Button 
            type="button" 
            variant="outline"
          >
            Select PDF Package
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
      
      {processing && (
        <div className="mb-4">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-center mt-1">{progress}% - Processing document package...</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
          <div className="flex items-center mb-2">
            <Check size={16} className="mr-2" />
            <p className="font-medium">Document package processed successfully!</p>
          </div>
          
          <p className="text-sm mb-2">Split into {splitDocuments.length} documents:</p>
          
          <div className="max-h-32 overflow-y-auto">
            <ul className="text-xs space-y-2 ml-5 list-disc">
              {splitDocuments.map((doc, index) => (
                <li key={index} className="flex justify-between">
                  <span>
                    {doc.documentType.replace(/_/g, ' ')} 
                    <span className="text-gray-500">(Pages {doc.pageRange})</span>
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                    {Math.round(doc.confidenceScore * 100)}% confidence
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <Button
        onClick={handleProcess}
        disabled={!file || processing}
        className="w-full"
      >
        <Upload size={16} className="mr-2" />
        {processing ? "Processing..." : "Process Document Package"}
      </Button>
    </div>
  );
}