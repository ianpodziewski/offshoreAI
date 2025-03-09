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
      <footer className="bg-gray-50 border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Loan Document Management System
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/documents" className="text-sm text-gray-500 hover:text-gray-700">
                Documents
              </Link>
              <Link href="/upload" className="text-sm text-gray-500 hover:text-gray-700">
                Upload
              </Link>
              <Link href="/chat" className="text-sm text-gray-500 hover:text-gray-700">
                Chat Assistant
              </Link>
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