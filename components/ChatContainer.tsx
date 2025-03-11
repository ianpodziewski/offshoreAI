// components/ChatContainer.tsx
import { useEffect, useRef } from "react";

interface ChatContainerProps {
  messages: any[];
  children: React.ReactNode;
}

export default function ChatContainer({ messages, children }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      console.log("📜 Scrolled to bottom using scrollIntoView");
    } else {
      console.log("📜 Could not scroll - messagesEndRef not available");
    }
  };
  
  // Scroll to bottom on initial load
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      console.log("📜 Initial scroll set directly on mount");
    }
  }, []);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    console.log("📜 Messages changed, length:", messages.length);
    
    // Small delay to ensure DOM has been updated with new messages
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages]);
  
  // Scroll to bottom on window resize
  useEffect(() => {
    const handleResize = () => {
      scrollToBottom();
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return (
    <div className="h-full relative">
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto p-4"
      >
        {children}
        
        {/* This empty div is used as a target for scrolling to the bottom */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}