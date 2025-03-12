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
  console.log("CitationProcessor received:", { text, citationsCount: citations?.length });
  
  // Ensure we have both text and citations
  if (!text || !citations || citations.length === 0) {
    console.log("CitationProcessor: No text or citations to process");
    return <span>{text}</span>;
  }

  // Find all citation markers like [1], [2], etc.
  const segments = [];
  const citationRegex = /\[(\d+)\]/g;
  let lastIndex = 0;
  let match;
  let matchFound = false;

  // Create a new RegExp object for each exec iteration
  const regex = new RegExp(citationRegex);
  
  // Log what we're looking for in text
  console.log(`CitationProcessor: Looking for patterns like [1], [2] in "${text}"`);
  
  while ((match = regex.exec(text)) !== null) {
    matchFound = true;
    console.log(`CitationProcessor: Found citation marker ${match[0]} at position ${match.index}`);
    
    // Add text before the citation
    if (match.index > lastIndex) {
      segments.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
    }
    
    // Get the citation number
    const citationNumber = parseInt(match[1], 10);
    
    // Add the citation if it exists
    if (citationNumber > 0 && citationNumber <= citations.length) {
      console.log(`CitationProcessor: Creating citation component for [${citationNumber}]`);
      segments.push(
        <CitationCircle 
          key={`citation-${match.index}`}
          number={citationNumber}
          citation={citations[citationNumber - 1]}
        />
      );
    } else {
      // Just add the text if the citation doesn't exist
      console.log(`CitationProcessor: Citation number ${citationNumber} is out of range`);
      segments.push(<span key={`literal-${match.index}`}>{match[0]}</span>);
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    segments.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }
  
  if (!matchFound) {
    console.log("CitationProcessor: No citation markers found in text");
    return <span>{text}</span>;
  }
  
  console.log(`CitationProcessor: Created ${segments.length} segments`);
  return <>{segments}</>;
}