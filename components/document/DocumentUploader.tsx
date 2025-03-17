'use client';

import React, { useState, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Upload, 
  File, 
  X, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createDocument, DocumentCategory } from '@/utilities/loanDocumentStructure';

interface DocumentUploaderProps {
  loanId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpload: (document: any) => void;
  category?: DocumentCategory;
  section?: string;
  docType?: string;
}

export function DocumentUploader({
  loanId,
  isOpen,
  onClose,
  onUpload,
  category,
  section,
  docType
}: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Reset state when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFile(null);
      setNotes('');
      setError(null);
      setSuccess(false);
      setUploading(false);
    }
  }, [isOpen]);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
  };
  
  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };
  
  // Prevent default drag behaviors
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Clear selected file
  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      // Read file as base64
      const fileContent = await readFileAsBase64(file);
      
      // Create document object
      const document = {
        loanId,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        dateUploaded: new Date().toISOString(),
        category: category || 'misc',
        section: section || '',
        docType: docType || 'misc_document',
        status: 'pending',
        content: fileContent,
        notes: notes,
        isRequired: true
      };
      
      // Call the onUpload callback
      onUpload(document);
      
      // Show success message
      setSuccess(true);
      
      // Close dialog after a delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  // Helper function to read file as base64
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a document for this loan. Supported formats: PDF, JPG, PNG, DOCX.
          </DialogDescription>
        </DialogHeader>
        
        {/* File Drop Area */}
        <div 
          className={`
            border-2 border-dashed rounded-md p-6 text-center cursor-pointer
            ${file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500'}
          `}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative">
                  <File className="h-8 w-8 text-blue-500 mr-2" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border border-red-500 text-red-500 text-[8px] font-bold px-1 rotate-[-20deg] opacity-80">
                      SAMPLE
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-10 w-10 text-gray-400 mx-auto" />
              <p className="text-sm font-medium">Drag and drop a file here or click to browse</p>
              <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          />
        </div>
        
        {/* Notes Field */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes about this document..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Success Message */}
        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription>Document uploaded successfully!</AlertDescription>
          </Alert>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={uploading || success}>
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 