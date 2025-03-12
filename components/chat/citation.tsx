"use client";

import { useState } from "react";
import { Citation } from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import Link from "next/link";
import { EMPTY_CITATION_MESSAGE } from "@/configuration/ui";

export function CitationCircle({
  number,
  citation,
}: {
  number: number;
  citation: Citation;
}) {
  const [open, setOpen] = useState(false);

  // Debug logging - uncomment if needed for troubleshooting
  // console.log(`Rendering citation ${number}:`, citation);

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };
  
  // Safely access citation properties with fallbacks
  const sourceUrl = citation?.source_url || "";
  const sourceDescription = citation?.source_description || "Reference source";
  
  const hasSourceUrl = isValidUrl(sourceUrl);
  const hasSourceDescription = sourceDescription && sourceDescription.trim() !== "";

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <span
          className="inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 mx-1 text-xs font-medium hover:bg-blue-200 cursor-pointer"
          onClick={() => setOpen(true)}
          data-testid={`citation-${number}`}
        >
          [{number}]
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <div className="bg-white p-3 rounded-md shadow-md flex flex-col justify-center border border-gray-200 max-w-xs">
          <p className="text-sm">
            {hasSourceUrl && (
              <Link
                href={sourceUrl}
                target="_blank"
                className="text-blue-500 hover:underline"
              >
                {sourceDescription}
              </Link>
            )}
            {!hasSourceUrl && hasSourceDescription && sourceDescription}
            {!hasSourceUrl && !hasSourceDescription && EMPTY_CITATION_MESSAGE}
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}