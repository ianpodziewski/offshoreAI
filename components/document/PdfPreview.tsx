// components/document/PdfPreview.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface PdfPreviewProps {
  fileUrl: string;
  filename: string;
}

export default function PdfPreview({ fileUrl, filename }: PdfPreviewProps) {
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [numPages, setNumPages] = useState(1);

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  }

  function changeScale(offset: number) {
    setScale(prevScale => {
      const newScale = prevScale + offset;
      return Math.max(0.5, Math.min(2.0, newScale));
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center bg-gray-100 p-2 border-b">
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => changePage(-1)} 
            disabled={pageNumber <= 1}
            variant="outline" 
            size="sm"
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="text-sm">
            Page {pageNumber} of {numPages}
          </span>
          <Button 
            onClick={() => changePage(1)} 
            disabled={pageNumber >= numPages}
            variant="outline" 
            size="sm"
          >
            <ChevronRight size={16} />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => changeScale(-0.1)} 
            disabled={scale <= 0.5}
            variant="outline" 
            size="sm"
          >
            <ZoomOut size={16} />
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <Button 
            onClick={() => changeScale(0.1)} 
            disabled={scale >= 2.0}
            variant="outline" 
            size="sm"
          >
            <ZoomIn size={16} />
          </Button>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto bg-gray-200 p-4 flex justify-center">
        {/* For the school project, just use iframe instead of a full PDF implementation */}
        <iframe 
          src={fileUrl} 
          className="bg-white rounded-lg shadow-lg"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
          width="100%" 
          height="100%"
        ></iframe>
      </div>
    </div>
  );
}