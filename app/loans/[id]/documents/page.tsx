"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileCheck, MapPin, FileText, Clock } from 'lucide-react';
import { loanDatabase } from '@/utilities/loanDatabase';
import { COLORS } from '@/app/theme/colors';
import LoanSidebar from '@/components/loan/LoanSidebar';

// Define section icons and titles
type SectionKey = 'borrower_docs' | 'property_docs' | 'closing_docs' | 'servicing_docs' | 'unexecuted';

const SECTION_CONFIG: Record<SectionKey, {
  icon: React.ReactNode;
  title: string;
}> = {
  borrower_docs: {
    icon: <FileCheck size={20} />,
    title: 'Borrower Docs'
  },
  property_docs: {
    icon: <MapPin size={20} />,
    title: 'Property Docs'
  },
  closing_docs: {
    icon: <FileText size={20} />,
    title: 'Closing Docs'
  },
  servicing_docs: {
    icon: <Clock size={20} />,
    title: 'Servicing Docs'
  },
  unexecuted: {
    icon: <FileText size={20} />,
    title: 'Unexecuted Documents'
  }
};

export default function DocumentsPage() {
  const params = useParams();
  const loanId = params?.id as string;
  const loan = loanDatabase.getLoanById(loanId);
  const [activeSection, setActiveSection] = useState<SectionKey>('borrower_docs');

  if (!loan) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.textPrimary }}>Loan Not Found</h2>
        <p className="mb-6" style={{ color: COLORS.textSecondary }}>The loan you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <LoanSidebar loan={loan} activePage="documents" />
        </div>
        
        {/* Main content */}
        <div className="flex-grow">
          <h1 className="text-2xl font-bold mb-2" style={{ color: COLORS.textPrimary }}>
            Loan Documents
          </h1>
          <p className="text-sm mb-6" style={{ color: COLORS.textMuted }}>
            View and manage documents for loan {loan.id}
          </p>
          
          {/* Section tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {Object.entries(SECTION_CONFIG).map(([key, config]) => (
                <Button
                  key={key}
                  variant={activeSection === key ? "default" : "outline"}
                  className="flex items-center px-4 py-2"
                  onClick={() => setActiveSection(key as SectionKey)}
                >
                  {config.icon}
                  <span className="ml-2">{config.title}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Placeholder for document content */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: COLORS.bgDarker }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.textPrimary }}>
              {SECTION_CONFIG[activeSection].title}
            </h2>
            <p style={{ color: COLORS.textSecondary }}>
              This is a simplified version of the documents page. Document content would appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 