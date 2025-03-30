"use client";

import { useState, useRef, useEffect } from "react";
import { Input, FileInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Plus, Paperclip, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { simpleDocumentService } from "@/utilities/simplifiedDocumentService";

interface ChatInputProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (combinedInput: string, file?: File) => void;
  input: string;
  isLoading: boolean;
  onUploadComplete?: () => Promise<void>;
}

export default function ChatInput({
  handleInputChange,
  handleSubmit,
  input,
  isLoading,
  onUploadComplete
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      message: "",
    },
  });

  // Focus input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+P or Cmd+P to upload file
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        openFileDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setSelectedFileName(selectedFile.name);
      console.log("📂 File selected:", selectedFile.name);
      
      // Focus back on the input field after file selection
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      console.warn("⚠️ No file selected.");
    }
  };

  const removeFile = () => {
    setFile(null);
    setSelectedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Focus back on the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const resetFileInput = () => {
    setFile(null);
    setSelectedFileName(null);
    form.reset({ message: "" });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    setFileInputKey(prev => prev + 1);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim() && !file && !selectedFileName) {
      console.warn("⚠️ No input or file provided.");
      return;
    }

    const fileToSubmit = file;
    const fileNameToSubmit = selectedFileName;

    if (fileToSubmit) {
      setIsUploadingDocument(true);
      try {
        const chatLoanId = 'chat-uploads';
        const result = await simpleDocumentService.addDocument(fileToSubmit, chatLoanId);
        console.log("✅ Document added to Recent Documents:", result);
        
        if (onUploadComplete) {
          await onUploadComplete();
        }
      } catch (error) {
        console.error("❌ Error saving document to Recent Documents:", error);
      } finally {
        setIsUploadingDocument(false);
      }
    }

    let fileToPass = fileToSubmit;
    if (!fileToSubmit && fileNameToSubmit) {
      fileToPass = new File([""], fileNameToSubmit, { type: "application/octet-stream" });
    }

    handleSubmit(input, fileToPass || undefined);

    const mockEvent = {
      target: { value: "" },
      currentTarget: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(mockEvent);
    
    resetFileInput();
  };

  return (
    <div className="w-full">
      {/* Selected File Bubble */}
      {(file || selectedFileName) && (
        <div className="mb-2 inline-flex items-center px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 shadow-md">
          <Paperclip className="w-5 h-5 text-blue-400 mr-2" />
          <span className="text-sm text-gray-200">{file?.name || selectedFileName}</span>
          <button
            type="button"
            onClick={removeFile}
            className="ml-4 p-1 rounded-full hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
            aria-label="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className={`flex w-full p-1.5 border ${
            isFocused 
              ? "border-blue-500 ring-2 ring-blue-500/20" 
              : "border-gray-700"
          } rounded-full shadow-md bg-gray-800 transition-all duration-200`}
        >
          <FileInput
            key={fileInputKey}
            ref={fileInputRef}
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input
                    {...field}
                    ref={inputRef}
                    onChange={(e) => {
                      handleInputChange(e);
                    }}
                    value={input}
                    className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-white placeholder:text-gray-500"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Type your message here..."
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full w-9 h-9 text-gray-400 hover:text-blue-400 hover:bg-gray-700"
              onClick={openFileDialog}
              disabled={isLoading || isUploadingDocument}
              title="Upload file (Ctrl+P)"
            >
              <Plus className="w-5 h-5" />
            </Button>

            <Button
              type="submit"
              size="icon"
              className={`rounded-full w-9 h-9 ml-1 ${
                isLoading || isUploadingDocument
                  ? "bg-gray-700 text-gray-500"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              disabled={(input.trim() === "" && !file && !selectedFileName) || isLoading || isUploadingDocument}
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </Form>
      
      {isUploadingDocument && (
        <div className="mt-2 text-xs text-gray-400 flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-blue-500 border-r-2 border-blue-500 border-b-2 border-transparent mr-2"></div>
          Uploading document...
        </div>
      )}
    </div>
  );
}