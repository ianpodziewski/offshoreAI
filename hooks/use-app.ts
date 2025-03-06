"use client";

import { useEffect, useState } from "react";
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

export default function useApp() {
  const initialAssistantMessage: DisplayMessage = {
    role: "assistant",
    content: INITIAL_MESSAGE,
    citations: [],
  };

  const [messages, setMessages] = useState<DisplayMessage[]>([initialAssistantMessage]);
  const [wordCount, setWordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [indicatorState, setIndicatorState] = useState<LoadingIndicator[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    setWordCount(
      messages.reduce((acc, message) => acc + message.content.split(" ").length, 0)
    );
  }, [messages]);

  // Update addUserMessage to accept an optional file parameter
  const addUserMessage = (userInput: string, file?: File) => {
    const newUserMessage: DisplayMessage = {
      role: "user",
      content: userInput,
      citations: [],
      fileName: file ? file.name : undefined, // add fileName property if a file is attached
    };
    setMessages((prev) => [...prev, newUserMessage]);
    return newUserMessage;
  };

  const addAssistantMessage = (content: string, citations: Citation[]) => {
    const newAssistantMessage: DisplayMessage = {
      role: "assistant",
      content,
      citations,
    };
    setMessages((prev) => [...prev, newAssistantMessage]);
    return newAssistantMessage;
  };

  /**
   * Sends FormData with "message" and optional "file" to the streaming API endpoint.
   */
  const fetchAssistantResponse = async (combinedInput: string, file?: File) => {
    const formData = new FormData();
    formData.append("message", combinedInput);
    if (file) {
      formData.append("file", file);
    }
    const response = await fetch("/api/chat", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Failed to send message");
    }
    return response;
  };

  /**
   * Processes the streaming (SSE) response from the API endpoint.
   * The server sends newline-delimited JSON messages.
   */
  const processStreamedResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader available");
    }
    const decoder = new TextDecoder();
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
  };

  const handleStreamedMessage = (streamedMessage: StreamedMessage) => {
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
  };

  const handleStreamedLoading = (streamedLoading: StreamedLoading) => {
    setIndicatorState((prev) => [...prev, streamedLoading.indicator]);
  };

  const handleStreamedError = (streamedError: StreamedError) => {
    setIndicatorState((prev) => [...prev, streamedError.indicator]);
  };

  const handleStreamedDone = (streamedDone: StreamedDone) => {
    // Optionally, finalize any state updates once the stream is complete.
    console.log("Stream completed. Final message:", streamedDone.final_message);
  };

  /**
   * handleSubmit:
   * 1. Adds the user message to the chat.
   * 2. Shows a loading indicator.
   * 3. Sends the message (and file) as FormData.
   * 4. Processes the SSE streaming response.
   */
  const handleSubmit = async (combinedInput: string, file?: File) => {
    setIndicatorState([]);
    setIsLoading(true);
    // Pass the file to addUserMessage so that the new message includes the fileName (if any)
    addUserMessage(combinedInput, file);

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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    } else {
      localStorage.removeItem("chatMessages");
    }
  }, [messages]);

  const clearMessages = () => {
    setMessages([]);
    setWordCount(0);
  };

  return {
    messages,
    handleInputChange,
    handleSubmit, // Now accepts (combinedInput, file?)
    indicatorState,
    input,
    isLoading,
    setMessages,
    clearMessages,
  };
}


// "use client";

// import { useEffect, useState } from "react";
// import { INITIAL_MESSAGE, WORD_CUTOFF, WORD_BREAK_MESSAGE } from "@/configuration/chat";
// import {
//   LoadingIndicator,
//   DisplayMessage,
//   Citation,
//   StreamedDone,
//   streamedDoneSchema,
//   StreamedLoading,
//   streamedLoadingSchema,
//   StreamedMessage,
//   streamedMessageSchema,
//   StreamedError,
//   streamedErrorSchema,
// } from "@/types";

// export default function useApp() {
//   const initialAssistantMessage: DisplayMessage = {
//     role: "assistant",
//     content: INITIAL_MESSAGE,
//     citations: [],
//   };

//   const [messages, setMessages] = useState<DisplayMessage[]>([initialAssistantMessage]);
//   const [wordCount, setWordCount] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [indicatorState, setIndicatorState] = useState<LoadingIndicator[]>([]);
//   const [input, setInput] = useState("");

//   useEffect(() => {
//     setWordCount(
//       messages.reduce((acc, message) => acc + message.content.split(" ").length, 0)
//     );
//   }, [messages]);

//   const addUserMessage = (userInput: string) => {
//     const newUserMessage: DisplayMessage = {
//       role: "user",
//       content: userInput,
//       citations: [],
//     };
//     setMessages((prev) => [...prev, newUserMessage]);
//     return newUserMessage;
//   };

//   const addAssistantMessage = (content: string, citations: Citation[]) => {
//     const newAssistantMessage: DisplayMessage = {
//       role: "assistant",
//       content,
//       citations,
//     };
//     setMessages((prev) => [...prev, newAssistantMessage]);
//     return newAssistantMessage;
//   };

//   /**
//    * Sends FormData with "message" and optional "file" to the streaming API endpoint.
//    */
//   const fetchAssistantResponse = async (combinedInput: string, file?: File) => {
//     const formData = new FormData();
//     formData.append("message", combinedInput);
//     if (file) {
//       formData.append("file", file);
//     }
//     const response = await fetch("/api/chat", {
//       method: "POST",
//       body: formData,
//     });
//     if (!response.ok) {
//       throw new Error("Failed to send message");
//     }
//     return response;
//   };

//   /**
//    * Processes the streaming (SSE) response from the API endpoint.
//    * The server sends newline-delimited JSON messages.
//    */
//   const processStreamedResponse = async (response: Response) => {
//     const reader = response.body?.getReader();
//     if (!reader) {
//       throw new Error("No reader available");
//     }
//     const decoder = new TextDecoder();
//     while (true) {
//       const { done, value } = await reader.read();
//       if (done) break;
//       const chunk = decoder.decode(value, { stream: true });
//       // Split on newline since the server ends each message with "\n"
//       const payloads = chunk.split("\n").filter((p) => p.trim() !== "");
//       for (const payload of payloads) {
//         try {
//           const parsed = JSON.parse(payload);
//           if (streamedMessageSchema.safeParse(parsed).success) {
//             handleStreamedMessage(parsed as StreamedMessage);
//           } else if (streamedLoadingSchema.safeParse(parsed).success) {
//             handleStreamedLoading(parsed as StreamedLoading);
//           } else if (streamedErrorSchema.safeParse(parsed).success) {
//             handleStreamedError(parsed as StreamedError);
//           } else if (streamedDoneSchema.safeParse(parsed).success) {
//             handleStreamedDone(parsed as StreamedDone);
//           } else {
//             console.error("Unknown payload type", parsed);
//           }
//         } catch (err) {
//           console.error("Failed to parse payload:", err);
//         }
//       }
//     }
//   };

//   const handleStreamedMessage = (streamedMessage: StreamedMessage) => {
//     setIndicatorState([]);
//     setMessages((prev) => {
//       const updated = [...prev];
//       const last = updated[updated.length - 1];
//       if (last && last.role === "assistant") {
//         updated[updated.length - 1] = {
//           ...last,
//           content: streamedMessage.message.content,
//           citations: streamedMessage.message.citations,
//         };
//       } else {
//         updated.push({
//           role: "assistant",
//           content: streamedMessage.message.content,
//           citations: streamedMessage.message.citations,
//         });
//       }
//       return updated;
//     });
//   };

//   const handleStreamedLoading = (streamedLoading: StreamedLoading) => {
//     setIndicatorState((prev) => [...prev, streamedLoading.indicator]);
//   };

//   const handleStreamedError = (streamedError: StreamedError) => {
//     setIndicatorState((prev) => [...prev, streamedError.indicator]);
//   };

//   const handleStreamedDone = (streamedDone: StreamedDone) => {
//     // Optionally, finalize any state updates once the stream is complete.
//     console.log("Stream completed. Final message:", streamedDone.final_message);
//   };

//   /**
//    * handleSubmit:
//    * 1. Adds the user message to the chat.
//    * 2. Shows a loading indicator.
//    * 3. Sends the message (and file) as FormData.
//    * 4. Processes the SSE streaming response.
//    */
//   const handleSubmit = async (combinedInput: string, file?: File) => {
//     setIndicatorState([]);
//     setIsLoading(true);
//     addUserMessage(combinedInput);

//     if (wordCount > WORD_CUTOFF) {
//       addAssistantMessage(WORD_BREAK_MESSAGE, []);
//       setIsLoading(false);
//     } else {
//       setIndicatorState([{ status: "Understanding your message", icon: "understanding" }]);
//       try {
//         const response = await fetchAssistantResponse(combinedInput, file);
//         await processStreamedResponse(response);
//       } catch (error) {
//         console.error("Error:", error);
//         addAssistantMessage("Something went wrong processing your request.", []);
//       } finally {
//         setIsLoading(false);
//         setInput("");
//       }
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInput(e.target.value);
//   };

//   useEffect(() => {
//     const storedMessages = localStorage.getItem("chatMessages");
//     if (storedMessages) {
//       setMessages(JSON.parse(storedMessages));
//     }
//   }, []);

//   useEffect(() => {
//     if (messages.length > 1) {
//       localStorage.setItem("chatMessages", JSON.stringify(messages));
//     } else {
//       localStorage.removeItem("chatMessages");
//     }
//   }, [messages]);

//   const clearMessages = () => {
//     setMessages([]);
//     setWordCount(0);
//   };

//   return {
//     messages,
//     handleInputChange,
//     handleSubmit, // Now accepts (combinedInput, file?)
//     indicatorState,
//     input,
//     isLoading,
//     setMessages,
//     clearMessages,
//   };
// }
