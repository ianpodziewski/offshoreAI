// /hooks/use-app.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { INITIAL_MESSAGE, WORD_CUTOFF, WORD_BREAK_MESSAGE } from "@/configuration/chat";
import {
  LoadingIndicator,
  DisplayMessage,
  Citation,
  StreamedDone,
  streamedDoneSchema,
  StreamedLoading,
  streamedLoadingSchema,
  StreamedMessage,
  streamedMessageSchema,
  StreamedError,
  streamedErrorSchema,
} from "@/types";
import { simpleDocumentService } from "@/utilities/simplifiedDocumentService";

export default function useApp() {
  const initialAssistantMessage = useMemo<DisplayMessage>(() => ({
    role: "assistant",
    content: INITIAL_MESSAGE,
    citations: [],
  }), []);

  const [messages, setMessages] = useState<DisplayMessage[]>([initialAssistantMessage]);
  const [wordCount, setWordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [indicatorState, setIndicatorState] = useState<LoadingIndicator[]>([]);
  const [input, setInput] = useState("");
  
  // Use a ref to avoid including this function in dependency arrays
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  // Calculate word count only when messages change
  useEffect(() => {
    setWordCount(
      messages.reduce((acc, message) => acc + message.content.split(" ").length, 0)
    );
  }, [messages]);

  // Memoize addUserMessage function
  const addUserMessage = useCallback((userInput: string, file?: File) => {
    const newUserMessage: DisplayMessage = {
      role: "user",
      content: userInput,
      citations: [],
      fileName: file ? file.name : undefined,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    return newUserMessage;
  }, []);

  // Memoize addAssistantMessage function
  const addAssistantMessage = useCallback((content: string, citations: Citation[]) => {
    const newAssistantMessage: DisplayMessage = {
      role: "assistant",
      content,
      citations,
    };
    setMessages((prev) => [...prev, newAssistantMessage]);
    return newAssistantMessage;
  }, []);

  // Memoize fetchAssistantResponse function with updated file handling
  const fetchAssistantResponse = useCallback(async (combinedInput: string, file?: File) => {
    const formData = new FormData();
    formData.append("message", combinedInput);
    
    if (file) {
      formData.append("file", file);
      // Always include the fileName as a separate field
      // This is crucial for the API to find previously uploaded files
      formData.append("fileName", file.name);
      console.log("📎 Sending file to API:", file.name);
    }
    
    // Log form data fields in a way that's compatible with all TypeScript targets
    const formDataFields: string[] = [];
    formData.forEach((value, key) => {
      formDataFields.push(key);
    });
    console.log("🚀 FormData fields:", formDataFields);
    
    const response = await fetch("/api/chat", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error("Failed to send message");
    }
    
    return response;
  }, []);

  // Improved stream handling with cleanup
  const processStreamedResponse = useCallback(async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader available");
    }
    
    // Store reader in ref for possible abortion
    readerRef.current = reader;
    
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Split on newline since the server ends each message with "\n"
        const payloads = chunk.split("\n").filter((p) => p.trim() !== "");
        for (const payload of payloads) {
          try {
            const parsed = JSON.parse(payload);
            if (streamedMessageSchema.safeParse(parsed).success) {
              handleStreamedMessage(parsed as StreamedMessage);
            } else if (streamedLoadingSchema.safeParse(parsed).success) {
              handleStreamedLoading(parsed as StreamedLoading);
            } else if (streamedErrorSchema.safeParse(parsed).success) {
              handleStreamedError(parsed as StreamedError);
            } else if (streamedDoneSchema.safeParse(parsed).success) {
              handleStreamedDone(parsed as StreamedDone);
            } else {
              console.error("Unknown payload type", parsed);
            }
          } catch (err) {
            console.error("Failed to parse payload:", err);
          }
        }
      }
    } catch (error) {
      console.error("Stream processing error:", error);
    } finally {
      readerRef.current = null;
    }
  }, []);

  // Memoize stream handlers
  const handleStreamedMessage = useCallback((streamedMessage: StreamedMessage) => {
    setIndicatorState([]);
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && last.role === "assistant") {
        updated[updated.length - 1] = {
          ...last,
          content: streamedMessage.message.content,
          citations: streamedMessage.message.citations,
        };
      } else {
        updated.push({
          role: "assistant",
          content: streamedMessage.message.content,
          citations: streamedMessage.message.citations,
        });
      }
      return updated;
    });
  }, []);

  const handleStreamedLoading = useCallback((streamedLoading: StreamedLoading) => {
    setIndicatorState((prev) => [...prev, streamedLoading.indicator]);
  }, []);

  const handleStreamedError = useCallback((streamedError: StreamedError) => {
    setIndicatorState((prev) => [...prev, streamedError.indicator]);
  }, []);

  const handleStreamedDone = useCallback((streamedDone: StreamedDone) => {
    console.log("Stream completed. Final message:", streamedDone.final_message);
  }, []);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel().catch(console.error);
      }
    };
  }, []);

  // Optimize handleSubmit with useCallback
  const handleSubmit = useCallback(async (combinedInput: string, file?: File) => {
    setIndicatorState([]);
    setIsLoading(true);
    
    // Abort any active stream
    if (readerRef.current) {
      await readerRef.current.cancel().catch(console.error);
      readerRef.current = null;
    }
    
    // Add user message
    addUserMessage(combinedInput, file);

    // If a file is included, ensure it's saved to the document service
    // We only do this as a fallback in case it wasn't already handled in the input component
    if (file && file.size > 0) { // Only process real files, not reference-only files
      try {
        // Use a dedicated loanId for chat-related documents
        const chatLoanId = 'chat-uploads';
        const result = await simpleDocumentService.addDocument(file, chatLoanId);
        console.log("✅ Document added to Recent Documents via useApp:", result);
      } catch (error) {
        console.error("❌ Error saving document to Recent Documents:", error);
      }
    } else if (file) {
      // This might be a reference file (empty file with just a name)
      console.log("📑 Processing reference to existing file:", file.name);
    }

    if (wordCount > WORD_CUTOFF) {
      addAssistantMessage(WORD_BREAK_MESSAGE, []);
      setIsLoading(false);
    } else {
      setIndicatorState([{ status: "Understanding your message", icon: "understanding" }]);
      try {
        const response = await fetchAssistantResponse(combinedInput, file);
        await processStreamedResponse(response);
      } catch (error) {
        console.error("Error:", error);
        addAssistantMessage("Something went wrong processing your request.", []);
      } finally {
        setIsLoading(false);
        setInput("");
      }
    }
  }, [addUserMessage, addAssistantMessage, fetchAssistantResponse, processStreamedResponse, wordCount]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  // Load stored messages from localStorage
  useEffect(() => {
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
      } catch (error) {
        console.error("Error parsing stored messages:", error);
      }
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    } else {
      localStorage.removeItem("chatMessages");
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([initialAssistantMessage]);
    setWordCount(0);
  }, [initialAssistantMessage]);

  return {
    messages,
    handleInputChange,
    handleSubmit,
    indicatorState,
    input,
    isLoading,
    setMessages,
    clearMessages,
  };
}