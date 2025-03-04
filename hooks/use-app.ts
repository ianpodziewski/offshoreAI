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

  const addUserMessage = (userInput: string) => {
    const newUserMessage: DisplayMessage = {
      role: "user",
      content: userInput,
      citations: [],
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

  // Process streamed response from the SSE endpoint.
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
      // Split the chunk on newline since our server sends "\n" after each JSON message.
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
    // Optionally handle finalization
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
    addUserMessage(combinedInput);

    // For word count check (if necessary)
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







/*
"use client";

import { useEffect, useState } from "react";
import { INITIAL_MESSAGE } from "@/configuration/chat";
import { WORD_CUTOFF, WORD_BREAK_MESSAGE } from "@/configuration/chat";
import {
  LoadingIndicator,
  DisplayMessage,
  StreamedDone,
  streamedDoneSchema,
  StreamedLoading,
  streamedLoadingSchema,
  StreamedMessage,
  streamedMessageSchema,
  Citation,
  StreamedError,
  streamedErrorSchema,
} from "@/types";

export default function useApp() {
  const initialAssistantMessage: DisplayMessage = {
    role: "assistant",
    content: INITIAL_MESSAGE,
    citations: [],
  };

  const [messages, setMessages] = useState<DisplayMessage[]>([
    initialAssistantMessage,
  ]);
  const [wordCount, setWordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [indicatorState, setIndicatorState] = useState<LoadingIndicator[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    setWordCount(
      messages.reduce(
        (acc, message) => acc + message.content.split(" ").length,
        0
      )
    );
  }, [messages]);

  const addUserMessage = (input: string) => {
    const newUserMessage: DisplayMessage = {
      role: "user",
      content: input,
      citations: [],
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    return newUserMessage;
  };

  const addAssistantMessage = (content: string, citations: Citation[]) => {
    const newAssistantMessage: DisplayMessage = {
      role: "assistant",
      content,
      citations,
    };
    setMessages((prevMessages) => [...prevMessages, newAssistantMessage]);
    return newAssistantMessage;
  };

  const fetchAssistantResponse = async (allMessages: DisplayMessage[]) => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat: { messages: allMessages } }),
    });

    if (!response.ok) {
      throw new Error("Failed to send message");
    }

    return response;
  };

  const handleStreamedMessage = (streamedMessage: StreamedMessage) => {
    setIndicatorState([]);
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];

      if (lastMessage && lastMessage.role === "assistant") {
        // Update the existing assistant message
        updatedMessages[updatedMessages.length - 1] = {
          ...lastMessage,
          content: streamedMessage.message.content,
          citations: streamedMessage.message.citations,
        };
      } else {
        // Add a new assistant message
        updatedMessages.push({
          role: "assistant",
          content: streamedMessage.message.content,
          citations: streamedMessage.message.citations,
        });
      }

      return updatedMessages;
    });
  };

  const handleStreamedLoading = (streamedLoading: StreamedLoading) => {
    setIndicatorState((prevIndicatorState) => [
      ...prevIndicatorState,
      streamedLoading.indicator,
    ]);
  };

  const handleStreamedError = (streamedError: StreamedError) => {
    setIndicatorState((prevIndicatorState) => [
      ...prevIndicatorState,
      streamedError.indicator,
    ]);
  };

  const handleStreamedDone = (streamedDone: StreamedDone) => {};

  const routeResponseToProperHandler = (payload: string) => {
    const payloads = payload.split("\n").filter((p) => p.trim() !== "");

    if (payloads.length === 0) {
      return; // No non-empty payloads
    }

    for (const payload of payloads) {
      const parsedPayload = JSON.parse(payload);

      if (streamedMessageSchema.safeParse(parsedPayload).success) {
        handleStreamedMessage(parsedPayload as StreamedMessage);
      } else if (streamedLoadingSchema.safeParse(parsedPayload).success) {
        handleStreamedLoading(parsedPayload as StreamedLoading);
      } else if (streamedErrorSchema.safeParse(parsedPayload).success) {
        handleStreamedError(parsedPayload as StreamedError);
      } else if (streamedDoneSchema.safeParse(parsedPayload).success) {
        handleStreamedDone(parsedPayload as StreamedDone);
      } else {
        throw new Error("Invalid payload type");
      }
    }
  };

  const processStreamedResponse = async (response: Response) => {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader available");
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const payload = new TextDecoder().decode(value);
      routeResponseToProperHandler(payload);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIndicatorState([]);
    setIsLoading(true);
    setInput("");
    const newUserMessage = addUserMessage(input);
    if (wordCount > WORD_CUTOFF) {
      addAssistantMessage(WORD_BREAK_MESSAGE, []);
      setIsLoading(false);
    } else {
      setTimeout(() => {
        // NOTE: This is a hacky way to show the indicator state only after the user message is added.
        // TODO: Find a better way to do this.
        setIndicatorState([
          {
            status: "Understanding your message",
            icon: "understanding",
          },
        ]);
      }, 600);

      try {
        const response = await fetchAssistantResponse([
          ...messages,
          newUserMessage,
        ]);
        await processStreamedResponse(response);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    // Load messages from local storage when component mounts
    const storedMessages = localStorage.getItem("chatMessages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, [setMessages]);

  useEffect(() => {
    // Save messages to local storage whenever they change
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
    handleSubmit,
    indicatorState,
    input,
    isLoading,
    setMessages,
    clearMessages,
  };
}
*/
