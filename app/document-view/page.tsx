"use client";

import { Suspense } from 'react';
import DocumentPage from '@/components/DocumentPage';

// Create a client component that uses the search params
function DocumentViewerWithParams() {
  return <DocumentPage />;
}

// Export the page with a suspense boundary
export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <DocumentViewerWithParams />
    </Suspense>
  );
}