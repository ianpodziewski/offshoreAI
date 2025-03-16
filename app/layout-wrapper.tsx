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
      {/* Modified the main element to add proper spacing and a slightly lighter background */}
      <main className="flex-grow pt-6 pb-12 px-4 bg-[#111827] relative" style={{ zIndex: 1 }}>
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </main>
      <footer className="bg-[#0A0F1A] text-gray-300 border-t border-gray-800 py-4 relative" style={{ zIndex: 10 }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <Link 
                href="/terms" 
                className="text-sm text-gray-400 hover:text-gray-200 transition-colors pointer-events-auto"
                style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </Link>
            </div>
            <div>
              <a 
                href="http://www.ringel.ai" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors pointer-events-auto"
                style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}
                onClick={(e) => e.stopPropagation()}
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