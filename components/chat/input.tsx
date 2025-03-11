"use client";

import { useState, useRef } from "react";
import { Input, FileInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Plus, Paperclip } from "lucide-react";
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
  const [fileInputKey, setFileInputKey] = useState(0); // Add a key to force re-render of file input
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm({
    defaultValues: {
      message: "",
    },
  });

  // Trigger the file input when clicking the Plus button
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      console.log("📂 File selected:", e.target.files[0].name);
    } else {
      console.warn("⚠️ No file selected.");
    }
  };

  // Remove selected file
  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Reset the file input completely
  const resetFileInput = () => {
    // Reset state
    setFile(null);
    
    // Reset form field
    form.reset({ message: "" });
    
    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Increment key to force re-render of file input
    setFileInputKey(prev => prev + 1);
  };

  // Handle form submission
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("📤 Submitting chat input:", { input, file });

    if (!input.trim() && !file) {
      console.warn("⚠️ No input or file provided.");
      return;
    }

    // Capture the current file in a local variable
    const fileToSubmit = file;

    // If there's a file, add it to the document service first
    if (fileToSubmit) {
      setIsUploadingDocument(true);
      try {
        // Use a generic loanId for chat-uploaded documents
        const chatLoanId = 'chat-uploads';
        const result = await simpleDocumentService.addDocument(fileToSubmit, chatLoanId);
        console.log("✅ Document added to Recent Documents:", result);
        
        // Call the onUploadComplete callback if provided
        if (onUploadComplete) {
          await onUploadComplete();
          console.log("🔄 Called onUploadComplete to refresh documents");
        }
      } catch (error) {
        console.error("❌ Error saving document to Recent Documents:", error);
      } finally {
        setIsUploadingDocument(false);
      }
    }

    console.log("🚀 Calling handleSubmit with:", { message: input, file: fileToSubmit });

    if (typeof handleSubmit !== "function") {
      console.error("❌ handleSubmit is not a function!", handleSubmit);
      return;
    }

    // Send data up to the parent with the captured file value
    handleSubmit(input, fileToSubmit || undefined);

    // Create a mock event to reset the parent's controlled input
    const mockEvent = {
      target: { value: "" },
      currentTarget: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(mockEvent);
    
    // Complete reset of file input to allow re-uploading same file
    resetFileInput();
  };

  return (
    <div className="w-full">
      {/* Selected File Bubble */}
      {file && (
        <div className="mb-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm">
          <Paperclip className="w-5 h-5 text-gray-500 mr-2" />
          <span className="text-sm text-gray-800">{file.name}</span>
          <button
            type="button"
            onClick={removeFile}
            className="ml-4 text-sm text-red-500 hover:underline"
          >
            Remove
          </button>
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className={`flex w-full p-1 border rounded-full shadow-sm ${
            isFocused ? "ring-2 ring-blue-400" : ""
          } bg-white`}
        >
          {/* File Input (Hidden) - Now with key to force re-render */}
          <FileInput
            key={fileInputKey}
            ref={fileInputRef}
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Text Input */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      handleInputChange(e);
                      console.log("📝 Input changed:", e.target.value);
                    }}
                    value={input}
                    className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Type your message here..."
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Plus Button (Triggers File Upload) */}
          <Button
            type="button"
            variant="ghost"
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center mr-2"
            onClick={openFileDialog}
          >
            <Plus className="w-5 h-5" />
          </Button>

          {/* Send Button */}
          <Button
            type="submit"
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
            disabled={(input.trim() === "" && !file) || isLoading || isUploadingDocument}
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        </form>
      </Form>
    </div>
  );
}