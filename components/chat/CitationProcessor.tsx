// components/chat/CitationProcessor.tsx
import React from 'react';
import { Citation } from "@/types";
import { CitationCircle } from './citation';

interface CitationProcessorProps {
  text: string;
  citations: Citation[];
}

/**
 * Component that directly processes citation markers in text
 * This bypasses ReactMarkdown and applies citations after rendering
 */
export function CitationProcessor({ text, citations }: CitationProcessorProps) {
  // Ensure we have both text and citations
  if (!text || !citations || citations.length === 0) {
    return <span>{text}</span>;
  }

  // Find all citation markers like [1], [2], etc.
  const segments = [];
  const citationRegex = /\[(\d+)\]/g;
  let lastIndex = 0;
  let match;

  // Create a new RegExp object for each exec iteration
  const regex = new RegExp(citationRegex);
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the citation
    if (match.index > lastIndex) {
      segments.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
    }
    
    // Get the citation number
    const citationNumber = parseInt(match[1], 10);
    
    // Add the citation if it exists
    if (citationNumber > 0 && citationNumber <= citations.length) {
      segments.push(
        <CitationCircle 
          key={`citation-${match.index}`}
          number={citationNumber}
          citation={citations[citationNumber - 1]}
        />
      );
    } else {
      // Just add the text if the citation doesn't exist
      segments.push(<span key={`literal-${match.index}`}>{match[0]}</span>);
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    segments.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }
  
  return <>{segments}</>;
}