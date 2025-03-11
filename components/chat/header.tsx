// components/chat/header.tsx
import { Button } from "@/components/ui/button";
import { EraserIcon } from "lucide-react";
import Image from "next/image";
import { CHAT_HEADER, CLEAR_BUTTON_TEXT } from "@/configuration/ui";
import { AI_NAME } from "@/configuration/identity";

export const AILogo = () => (
  <div className="w-10 h-10 relative">
    <Image src="/ai-logo.png" alt={AI_NAME} width={40} height={40} className="rounded-full" />
    <div className="w-2 h-2 rounded-full bg-green-500 absolute -bottom-0.5 -right-0.5"></div>
  </div>
);

export default function ChatHeader({
  clearMessages,
}: {
  clearMessages: () => void;
}) {
  return (
    <div className="border-b bg-white">
      <div className="container mx-auto max-w-screen-xl">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <AILogo />
            <p className="font-medium">{CHAT_HEADER}</p>
          </div>
          <Button
            onClick={clearMessages}
            className="gap-2 shadow-sm"
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