// /components/chat/messages.tsx
import React, { memo, useMemo } from "react";
import { DisplayMessage } from "@/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { Formatting } from "./formatting";
import { LoadingIndicator } from "@/types";
import Loading from "./loading";
import { AI_NAME } from "@/configuration/identity";
import { Paperclip } from "lucide-react";

// Memoize the AILogo component since it doesn't change
const AILogo = memo(() => {
  return (
    <div className="w-9 h-9 rounded-full border-2 border-gray-700 overflow-hidden flex-shrink-0">
      <Image src="/ai-logo.png" alt={AI_NAME} width={36} height={36} />
    </div>
  );
});
AILogo.displayName = "AILogo";

// Memoize individual message components to prevent re-renders
const UserMessage = memo(({ message }: { message: DisplayMessage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-end py-2"
    >
      {message.fileName && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mb-2 inline-flex items-center px-3 py-2 border border-blue-800 rounded-lg bg-blue-900/50 text-blue-300 shadow-md"
        >
          <Paperclip className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">{message.fileName}</span>
        </motion.div>
      )}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="px-4 py-2 bg-blue-600 rounded-2xl text-white max-w-[80%] shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <div className="text-base break-words">{message.content}</div>
      </motion.div>
    </motion.div>
  );
});
UserMessage.displayName = "UserMessage";

const AssistantMessage = memo(({ message }: { message: DisplayMessage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex py-2 justify-start gap-3"
    >
      <div className="flex-shrink-0 pt-1">
        <AILogo />
      </div>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="px-4 py-3 bg-gray-800/90 rounded-2xl text-white max-w-[85%] shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-700"
      >
        <div className="prose prose-invert max-w-none">
          <Formatting message={message} />
        </div>
      </motion.div>
    </motion.div>
  );
});
AssistantMessage.displayName = "AssistantMessage";

// Memoize the EmptyMessages component
const EmptyMessages = memo(() => {
  return (
    <div className="flex flex-col h-full justify-center items-center p-6">
      <div className="text-gray-400 text-center max-w-md">
        <p className="mb-3">Ask a question to start the conversation</p>
        <p className="text-sm text-gray-500">You can also upload documents for analysis</p>
      </div>
    </div>
  );
});
EmptyMessages.displayName = "EmptyMessages";

export default function ChatMessages({
  messages,
  indicatorState,
}: {
  messages: DisplayMessage[];
  indicatorState: LoadingIndicator[];
}) {
  // Use useMemo to avoid recreating this value on every render
  const showLoading = useMemo(() => 
    indicatorState.length > 0 &&
    messages.length > 0 &&
    messages[messages.length - 1].role === "user",
  [indicatorState.length, messages]);

  // Memoize the rendered messages to prevent unnecessary re-renders
  const renderedMessages = useMemo(() => 
    messages.map((message, index) => (
      <motion.div
        key={`${message.role}-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        {message.role === "user" ? (
          <UserMessage message={message} />
        ) : (
          <AssistantMessage message={message} />
        )}
      </motion.div>
    )),
  [messages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col w-full h-full p-2 gap-1 overflow-y-auto"
    >
      {messages.length === 0 ? (
        <EmptyMessages />
      ) : (
        <div className="flex flex-col space-y-1 pt-2 pb-4">
          {renderedMessages}
          {showLoading && <Loading indicatorState={indicatorState} />}
        </div>
      )}
    </motion.div>
  );
}