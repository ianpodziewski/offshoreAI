"use client";

import { useState, useRef } from "react";
import { Input, FileInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowUp, Plus, Paperclip } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import ChatFooter from "@/components/chat/footer";
import { cn } from "@/lib/utils";

// Define a type that extends HTMLInputElement with a clear method.
interface FileInputRef extends HTMLInputElement {
  clear: () => void;
}

interface ChatInputProps {
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (userText: string, file?: File) => void;
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
  // Updated ref type to include clear() method.
  const fileInputRef = useRef<FileInputRef | null>(null);

  const form = useForm({
    defaultValues: {
      message: "",
    },
  });

  // Open the file dialog when the Plus (+) button is clicked
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

    if (!input.trim() && !file) {
      console.warn("⚠️ No input or file provided.");
      return;
    }

    console.log("📤 Submitting chat input:", { input, file });
    if (typeof handleSubmit !== "function") {
      console.error("❌ handleSubmit is not a function!", handleSubmit);
      return;
    }

    handleSubmit(input, file || undefined);
    setFile(null);
    form.reset({ message: "" });

    const mockEvent = {
      target: { value: "" },
      currentTarget: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(mockEvent);
  };

  const removeFile = () => {
    setFile(null);
    fileInputRef.current?.clear(); // Now recognized by TypeScript
  };

  return (
    <div className="z-10 flex flex-col items-center justify-center fixed bottom-0 w-full p-5 bg-white shadow-[0_-10px_15px_-2px_rgba(255,255,255,1)] text-base">
      <div className="max-w-screen-lg w-full">
        <Form {...form}>
          <form
            onSubmit={onSubmit}
            className={cn(
              "flex items-center w-full p-2 border rounded-full shadow-sm",
              isFocused ? "ring-2 ring-ring ring-offset-2" : ""
            )}
          >
            {/* Hidden File Input */}
            <FileInput
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
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Type your message here..."
                      // Added `text-left` for typed text alignment
                      // and `placeholder:text-left` to ensure the placeholder also aligns left
                      className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-left placeholder:text-left"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Plus Button (Open File Dialog) */}
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
              disabled={(!input.trim() && !file) || isLoading}
            >
              <ArrowUp className="w-5 h-5" />
            </Button>
          </form>
        </Form>

        {file && (
          <div className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm">
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
      </div>
      <ChatFooter />
    </div>
  );
}






// "use client";

// import { useState, useRef } from "react";
// import { Input, FileInput } from "@/components/ui/input"; // ✅ Import FileInput
// import { Button } from "@/components/ui/button";
// import { ArrowUp, Plus } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
// import ChatFooter from "@/components/chat/footer";

// interface ChatInputProps {
//   handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   handleSubmit: (combinedInput: string, file?: File) => void;
//   input: string;
//   isLoading: boolean;
// }

// export default function ChatInput({
//   handleInputChange,
//   handleSubmit,
//   input,
//   isLoading,
// }: ChatInputProps) {
//   const [isFocused, setIsFocused] = useState(false);
//   const [file, setFile] = useState<File | null>(null);
//   const fileInputRef = useRef<HTMLInputElement | null>(null);

//   const form = useForm({
//     defaultValues: {
//       message: "",
//     },
//   });

//   // Trigger the file input when clicking the Plus button
//   const openFileDialog = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.click();
//     }
//   };

//   // Handle file selection
//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setFile(e.target.files[0]);
//       console.log("📂 File selected:", e.target.files[0].name);
//     } else {
//       console.warn("⚠️ No file selected.");
//     }
//   };

//   // Handle form submission
//   const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     console.log("📤 Submitting chat input:", { input, file });

//     if (!input.trim() && !file) {
//       console.warn("⚠️ No input or file provided.");
//       return;
//     }

//     console.log("🚀 Calling handleSubmit with:", { message: input, file });

//     if (typeof handleSubmit !== "function") {
//       console.error("❌ handleSubmit is not a function!", handleSubmit);
//       return;
//     }

//     // Send data up to the parent
//     handleSubmit(input, file || undefined);

//     // Clear out file state and the text input in both:
//     // 1) The local form (react-hook-form)
//     // 2) The parent component’s `input` prop
//     setFile(null);
//     form.reset({ message: "" });

//     // Create a mock event to reset the parent’s controlled input
//     const mockEvent = {
//       target: { value: "" },
//       currentTarget: { value: "" },
//     } as React.ChangeEvent<HTMLInputElement>;
//     handleInputChange(mockEvent);
//   };

//   return (
//     <div className="z-10 flex flex-col justify-center items-center fixed bottom-0 w-full p-5 bg-white shadow-[0_-10px_15px_-2px_rgba(255,255,255,1)] text-base">
//       <div className="max-w-screen-lg w-full">
//         <Form {...form}>
//           <form
//             onSubmit={onSubmit}
//             className={`flex-0 flex w-full p-1 border rounded-full shadow-sm ${
//               isFocused ? "ring-2 ring-ring ring-offset-2" : ""
//             }`}
//           >
//             {/* File Input (Hidden) */}
//             <FileInput
//               ref={fileInputRef}
//               accept=".pdf,.docx,.txt"
//               onChange={handleFileChange}
//               className="hidden"
//             />

//             {/* Text Input */}
//             <FormField
//               control={form.control}
//               name="message"
//               render={({ field }) => (
//                 <FormItem className="flex-grow">
//                   <FormControl>
//                     <Input
//                       {...field}
//                       onChange={(e) => {
//                         handleInputChange(e);
//                         console.log("📝 Input changed:", e.target.value);
//                       }}
//                       value={input}
//                       className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
//                       onFocus={() => setIsFocused(true)}
//                       onBlur={() => setIsFocused(false)}
//                       placeholder="Type your message here..."
//                     />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />

//             {/* Plus Button (Triggers File Upload) */}
//             <Button
//               type="button"
//               variant="ghost"
//               className="rounded-full w-10 h-10 p-0 flex items-center justify-center mr-2"
//               onClick={openFileDialog}
//             >
//               <Plus className="w-5 h-5" />
//             </Button>

//             {/* Send Button */}
//             <Button
//               type="submit"
//               className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
//               disabled={input.trim() === "" || isLoading}
//             >
//               <ArrowUp className="w-5 h-5" />
//             </Button>
//           </form>
//         </Form>

//         {/* Show Selected File Name (only until user sends the message) */}
//         {file && (
//           <p className="mt-2 text-sm text-gray-500">
//             Selected file: {file.name}
//           </p>
//         )}
//       </div>
//       <ChatFooter />
//     </div>
//   );
// }
