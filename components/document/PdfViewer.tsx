// components/document/PdfViewer.tsx
import React from 'react';

interface PdfViewerProps {
  url: string;
  filename: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url, filename }) => {
  // For the school project, just show a placeholder
  return (
    <div className="flex flex-col items-center justify-center p-8 border rounded bg-gray-50 h-full relative">
      {filename.startsWith('SAMPLE_') && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="border-4 border-red-500 text-red-500 text-5xl font-bold px-8 py-4 rotate-[-30deg] opacity-20">
            SAMPLE
          </div>
        </div>
      )}
      <div className="text-center max-w-md">
        <h3 className="text-lg font-medium mb-4">Simulated PDF Viewer</h3>
        <p className="text-gray-600 mb-2">
          This is a placeholder for the PDF viewer component.
        </p>
        <p className="text-gray-500 text-sm mb-4">
          Filename: {filename}
        </p>
        <div className="bg-white p-4 border rounded shadow-sm w-full text-left">
          <p className="font-mono text-xs">{url}</p>
        </div>
      </div>
    </div>
  );
};

export default PdfViewer;