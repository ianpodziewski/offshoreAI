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

// Memoized AI Logo
const AILogo = memo(() => (
  <div className="w-9 h-9">
    <Image src="/ai-logo.png" alt={AI_NAME} width={36} height={36} />
  </div>
));
AILogo.displayName = "AILogo";

// User message component
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
          className="mb-1 inline-flex items-center px-3 py-2 border border-blue-400 rounded-lg bg-blue-900 text-blue-100 shadow"
        >
          <Paperclip className="w-5 h-5 mr-2 text-blue-300" />
          <span className="text-sm font-medium">{message.fileName}</span>
        </motion.div>
      )}
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="px-3 py-2 bg-blue-600 rounded-2xl text-white max-w-[60%] shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        {message.content}
      </motion.div>
    </motion.div>
  );
});
UserMessage.displayName = "UserMessage";

// Assistant message component
const AssistantMessage = memo(({ message }: { message: DisplayMessage }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-1 py-1 justify-start gap-[5px]"
    >
      <div className="w-9 flex items-end">
        <AILogo />
      </div>
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="px-3 py-2 bg-gray-700 rounded-2xl text-gray-100 max-w-[60%] shadow-md hover:shadow-lg transition-shadow duration-300"
      >
        <Formatting message={message} />
      </motion.div>
    </motion.div>
  );
});
AssistantMessage.displayName = "AssistantMessage";

// Empty message state
const EmptyMessages = memo(() => (
  <div className="flex flex-col h-full justify-center items-center p-4">
    <p className="text-gray-400">Ask a question to start the conversation</p>
  </div>
));
EmptyMessages.displayName = "EmptyMessages";

// Main chat component
export default function ChatMessages({
  messages,
  indicatorState,
}: {
  messages: DisplayMessage[];
  indicatorState: LoadingIndicator[];
}) {
  const showLoading = useMemo(
    () =>
      indicatorState.length > 0 &&
      messages.length > 0 &&
      messages[messages.length - 1].role === "user",
    [indicatorState.length, messages]
  );

  const renderedMessages = useMemo(
    () =>
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
    [messages]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col w-full h-full p-1 gap-3 overflow-y-auto bg-gray-900 text-white rounded-lg"
    >
      {messages.length === 0 ? (
        <EmptyMessages />
      ) : (
        <div className="flex flex-col space-y-4 pt-2 pb-4">
          {renderedMessages}
          {showLoading && <Loading indicatorState={indicatorState} />}
        </div>
      )}
    </motion.div>
  );
}
