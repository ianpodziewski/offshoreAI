"use client";

import { useState } from "react";
import { Citation } from "@/types";

export function CitationCircle({
  number,
  citation,
}: {
  number: number;
  citation: Citation;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Log when this component renders
  console.log(`Citation ${number} rendering:`, citation);
  
  // Ensure we have citation data
  const description = citation?.source_description || `Reference ${number}`;
  
  return (
    <span className="relative inline-block">
      {/* The citation marker */}
      <span
        className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full px-2 py-0.5 mx-1 text-xs font-medium cursor-pointer hover:bg-blue-600"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        [{number}]
      </span>
      
      {/* Simple tooltip */}
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 bg-white text-gray-900 px-3 py-1 rounded shadow-lg text-sm whitespace-nowrap z-50">
          {description}
        </span>
      )}
    </span>
  );
}