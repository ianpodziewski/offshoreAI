import React from 'react';

interface Document {
  id: number;
  name: string;
  content: string;
}

interface DocumentListProps {
  documents: Document[];
}

export function DocumentList({ documents }: DocumentListProps) {
  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div 
          key={doc.id} 
          className="p-3 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <h4 className="font-medium text-sm mb-1">{doc.name}</h4>
          <p className="text-xs text-gray-400 truncate">{doc.content}</p>
        </div>
      ))}
    </div>
  );
} 