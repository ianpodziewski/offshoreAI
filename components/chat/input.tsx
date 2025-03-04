"use client";

import { useState, useRef } from "react";
import { Input, FileInput } from "@/components/ui/input"; // ✅ Import FileInput
import { Button } from "@/components/ui/button";
import { ArrowUp, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import ChatFooter from "@/components/chat/footer";

interface ChatInputProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (combinedInput: string, file?: File) => void;
  input: string;
  isLoading: boolean;
}

export default function ChatInput({
  handleInputChange,
  handleSubmit,
  input,
  isLoading,
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [file, setFile] = useState<File | null>(null);
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

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("📤 Submitting chat input:", { input, file });

    if (!input.trim() && !file) {
      console.warn("⚠️ No input or file provided.");
      return;
    }

    // ✅ Add explicit logging before calling handleSubmit
    console.log("🚀 Calling handleSubmit with:", { message: input, file });

    handleSubmit(input, file || undefined);
  };

  return (
    <div className="z-10 flex flex-col justify-center items-center fixed bottom-0 w-full p-5 bg-white shadow-[0_-10px_15px_-2px_rgba(255,255,255,1)] text-base">
      <div className="max-w-screen-lg w-full">
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className={`flex-0 flex w-full p-1 border rounded-full shadow-sm ${
              isFocused ? "ring-2 ring-ring ring-offset-2" : ""
            }`}
          >
            {/* File Input (Visible but styled) */}
            <FileInput
              ref={fileInputRef} // ✅ Use FileInput Component
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
              disabled={input.trim() === "" || isLoading}
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </form>
        </Form>

        {/* Show Selected File Name */}
        {file && (
          <p className="mt-2 text-sm text-gray-500">
            Selected file: {file.name}
          </p>
        )}
      </div>
      <ChatFooter />
    </div>
  );
}












/*
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { ArrowUp, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import ChatFooter from "@/components/chat/footer";

interface ChatInputProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  input: string;
  isLoading: boolean;
}

export default function ChatInput({
  handleInputChange,
  handleSubmit,
  input,
  isLoading,
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm({
    defaultValues: {
      message: "",
    },
  });

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
  };

  return (
    <>
      <div className="z-10 flex flex-col justify-center items-center fixed bottom-0 w-full p-5 bg-white shadow-[0_-10px_15px_-2px_rgba(255,255,255,1)] text-base">
        <div className="max-w-screen-lg w-full">
          <Form {...form}>
            <form
              onSubmit={handleSubmit}
              className={`flex-0 flex w-full p-1 border rounded-full shadow-sm ${
                isFocused ? "ring-2 ring-ring ring-offset-2" : ""
              }`}
            >

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
              />


              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input
                        {...field}
                        onChange={handleInputChange}
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


              <Button
                type="button"
                variant="ghost"
                className="rounded-full w-10 h-10 p-0 flex items-center justify-center mr-2"
                onClick={openFileDialog}
              >
                <Plus className="w-5 h-5" />
              </Button>


              <Button
                type="submit"
                className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                disabled={input.trim() === "" || isLoading}
              >
                <ArrowUp className="w-5 h-5" />
              </Button>
            </form>
          </Form>


          {file && (
            <p className="mt-2 text-sm text-gray-500">
              Selected file: {file.name}
            </p>
          )}
        </div>
        <ChatFooter />
      </div>
    </>
  );
}
*/



/*
"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowUp } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import ChatFooter from "@/components/chat/footer";

interface ChatInputProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  input: string;
  isLoading: boolean;
}

export default function ChatInput({
  handleInputChange,
  handleSubmit,
  input,
  isLoading,
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const form = useForm({
    defaultValues: {
      message: "",
    },
  });

  return (
    <>
      <div className="z-10 flex flex-col justify-center items-center fixed bottom-0 w-full p-5 bg-white shadow-[0_-10px_15px_-2px_rgba(255,255,255,1)] text-base">
        <div className="max-w-screen-lg w-full">
          <Form {...form}>
            <form
              onSubmit={handleSubmit}
              className={`flex-0 flex w-full p-1 border rounded-full shadow-sm ${
                isFocused ? "ring-2 ring-ring ring-offset-2" : ""
              }`}
            >
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input
                        {...field}
                        onChange={handleInputChange}
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
              <Button
                type="submit"
                className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                disabled={input.trim() === "" || isLoading}
              >
                <ArrowUp className="w-5 h-5" />
              </Button>
            </form>
          </Form>
        </div>
        <ChatFooter />
      </div>
    </>
  );
}
*/
