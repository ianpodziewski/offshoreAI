"use client";

import React from 'react';
import Navbar from '@/components/navigation/navbar';
import Link from 'next/link';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#111827]">
      <Navbar />
      {/* Main content area with proper spacing and background */}
      <main className="flex-grow pt-6 pb-12 bg-[#111827] relative w-full" style={{ zIndex: 1 }}>
        {children}
      </main>
      <footer className="bg-[#0A0F1A] text-gray-300 border-t border-gray-800 py-4 relative" style={{ zIndex: 10 }}>
        <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <Link 
                href="/terms" 
                className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
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