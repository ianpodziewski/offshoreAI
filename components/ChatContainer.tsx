// components/ChatContainer.tsx
import { useEffect, useRef, useState } from "react";

interface ChatContainerProps {
  messages: any[];
  children: React.ReactNode;
}

export default function ChatContainer({ messages, children }: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const lastUserInteractionRef = useRef(Date.now());
  const isScrollingRef = useRef(false);

  // Function to scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (containerRef.current && shouldAutoScroll) {
      isScrollingRef.current = true;
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior
      });
      
      // Reset the scrolling flag after animation completes
      setTimeout(() => {
        isScrollingRef.current = false;
      }, behavior === "smooth" ? 500 : 0);
    }
  };

  // Set up intersection observer to detect when user scrolls away from bottom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create a sentinel element
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    container.appendChild(sentinel);

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only change auto-scroll if the user initiated the scroll
        if (!isScrollingRef.current) {
          const wasUserInitiated = Date.now() - lastUserInteractionRef.current < 500;
          if (wasUserInitiated) {
            setShouldAutoScroll(entry.isIntersecting);
          }
        }
      },
      {
        root: container,
        threshold: 0.1
      }
    );

    observer.observe(sentinel);

    // Track user scroll actions
    const handleScroll = () => {
      lastUserInteractionRef.current = Date.now();
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      container.removeEventListener('scroll', handleScroll);
      if (sentinel.parentNode) {
        sentinel.parentNode.removeChild(sentinel);
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  // Also scroll when window resizes
  useEffect(() => {
    const handleResize = () => scrollToBottom();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [shouldAutoScroll]);

  // Provide a way for the user to manually return to auto-scrolling
  const enableAutoScroll = () => {
    setShouldAutoScroll(true);
    scrollToBottom();
  };

  return (
    <div className="relative flex flex-col h-full">
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {children}
      </div>
      
      {/* Scroll to bottom button - only shows when auto-scroll is disabled */}
      {!shouldAutoScroll && (
        <button
          onClick={enableAutoScroll}
          className="absolute bottom-4 right-4 bg-blue-500 text-white rounded-full p-2 shadow-lg z-10"
          aria-label="Scroll to bottom"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L10 14.586l5.293-5.293a1 1 0 011.414 0z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      )}
    </div>
  );
}