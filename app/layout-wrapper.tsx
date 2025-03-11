"use client";

import React from 'react';
import Navbar from '@/components/navigation/navbar';
import Link from 'next/link';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <Navbar />
      {/* Modified the main element to remove the pt-16 and use pt-2 instead */}
      <main className="flex-grow pt-2">
        {children}
      </main>
      <footer className="bg-gray-800 text-gray-300 border-t border-gray-800 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
                Terms of Service
              </Link>
            </div>
            <div>
              <a 
                href="http://www.ringel.ai" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
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