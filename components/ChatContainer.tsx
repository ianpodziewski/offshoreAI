// components/ChatContainer.tsx
import { useRef } from "react";

interface ChatContainerProps {
  messages: any[];
  children: React.ReactNode;
}

export default function ChatContainer({ messages, children }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="h-full relative">
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto p-4"
      >
        {children}
      </div>
    </div>
  );
}