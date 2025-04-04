// components/chat/header.tsx
import { Button } from "@/components/ui/button";
import { EraserIcon } from "lucide-react";
import Image from "next/image";
import { CHAT_HEADER, CLEAR_BUTTON_TEXT } from "@/configuration/ui";
import { AI_NAME } from "@/configuration/identity";

export const AILogo = () => (
  <div className="w-10 h-10 relative">
    <Image
      src="/ai-logo.png"
      alt={AI_NAME}
      width={40}
      height={40}
      className="rounded-full"
    />
    <div className="w-2 h-2 rounded-full bg-green-500 absolute -bottom-0.5 -right-0.5"></div>
  </div>
);

interface ChatHeaderProps {
  clearMessages: () => void;
  clearChatDocuments?: () => void; // Add new prop
}

export default function ChatHeader({
  clearMessages,
  clearChatDocuments
}: ChatHeaderProps) {
  // Combined clear function that clears both messages and documents
  const handleClearAll = () => {
    clearMessages(); // Clear chat messages

    // If the function to clear documents exists, call it
    if (clearChatDocuments) {
      clearChatDocuments();
    }
  };

  return (
    <div className="mb-4">
      <div className="relative bg-gray-800 rounded-lg p-3 shadow-sm">
        {/* Centered logo and title */}
        <div className="flex items-center justify-center">
          <AILogo />
          <p className="font-medium text-white ml-2">Loan Underwriting Assistant</p>
        </div>
        {/* Clear button positioned on the right */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <Button
            onClick={handleClearAll}
            className="gap-2"
            variant="outline"
            size="sm"
          >
            <EraserIcon className="w-4 h-4" />
            <span>{CLEAR_BUTTON_TEXT}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}