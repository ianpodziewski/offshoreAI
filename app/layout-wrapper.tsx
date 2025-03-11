// app/layout-wrapper.tsx
"use client";

import React from 'react';
import Navbar from '@/components/navigation/navbar';
import Link from 'next/link';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="pt-16 flex-grow">
        {children}
      </main>
      <footer className="bg-gray-50 border-t py-4">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-2 md:mb-0">
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">
                Terms of Service
              </Link>
            </div>
            <div className="flex space-x-6">
              <a 
                href="http://www.ringel.ai" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                powered by ringel.AI
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}