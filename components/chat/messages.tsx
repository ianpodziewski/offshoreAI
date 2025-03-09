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
    <div className="w-9 h-9">
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
      className="flex flex-col items-end py-1"
    >
      {message.fileName && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mb-1 inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg bg-blue-50 text-blue-800 shadow-sm"
        >
          <Paperclip className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">{message.fileName}</span>
        </motion.div>
      )}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="px-3 py-1 bg-blue-500 rounded-2xl text-white max-w-[60%] shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        {message.content}
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
      className="flex flex-1 py-1 justify-start gap-[5px]"
    >
      <div className="w-9 flex items-end"><AILogo /></div>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="px-3 py-1 bg-gray-200 rounded-2xl text-black max-w-[60%] shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <Formatting message={message} />
      </motion.div>
    </motion.div>
  );
});
AssistantMessage.displayName = "AssistantMessage";

// Memoize the EmptyMessages component
const EmptyMessages = memo(() => {
  return (
    <div className="flex flex-col flex-1 p-1 gap-3 justify-center items-center">
      <p className="text-gray-500">Ask a question to start the conversation</p>
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
      className="flex flex-col flex-1 p-1 gap-3"
    >
      <div className="h-[60px]"></div>
      {messages.length === 0 ? (
        <EmptyMessages />
      ) : (
        renderedMessages
      )}
      {showLoading && <Loading indicatorState={indicatorState} />}
      <div className="h-[225px]"></div>
    </motion.div>
  );
}