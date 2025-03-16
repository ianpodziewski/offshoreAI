import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Info, ChevronRight } from 'lucide-react';
import { COLORS } from '@/app/theme/colors';

interface LoanSidebarProps {
  loan: any;
  activePage?: string;
}

const LoanSidebar: React.FC<LoanSidebarProps> = ({ loan, activePage }) => {
  const pathname = usePathname();

  // Determine if the current path is active
  const isActive = (path: string) => {
    if (activePage) {
      return activePage === path;
    }
    
    if (path === 'overview') {
      // For overview, check if the path ends with the loan ID or has /overview
      return pathname === `/loans/${loan.id}` || pathname?.endsWith('/overview');
    }
    
    // For other paths, check if the pathname includes the path segment
    return pathname?.includes(`/${path}`) || false;
  };

  // Navigation items
  const navItems = [
    {
      name: 'Overview',
      path: 'overview',
      icon: <Info size={18} />
    },
    {
      name: 'Documents',
      path: 'documents',
      icon: <FileText size={18} />
    }
  ];

  if (!loan) return null;

  return (
    <div className="md:sticky md:top-20 bg-[#141b2d] rounded-lg shadow-md overflow-hidden">
      {/* Loan header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-semibold text-lg" style={{ color: COLORS.textPrimary }}>
          {loan.borrowerName}
        </h3>
        <p className="text-sm" style={{ color: COLORS.textMuted }}>
          Loan #{loan.id.substring(0, 8)}
        </p>
      </div>
      
      {/* Navigation */}
      <nav className="p-2">
        <ul className="space-y-1">
          {navItems.map((item) => {
            // Construct the correct URL for each navigation item
            const href = item.path === 'overview' 
              ? `/loans/${loan.id}` 
              : `/loans/${loan.id}/${item.path}`;
              
            return (
              <li key={item.path}>
                <Link
                  href={href}
                  className={`flex items-center px-3 py-3 rounded-md transition-colors ${
                    isActive(item.path)
                      ? 'bg-[#1a2234] text-white'
                      : 'text-gray-400 hover:bg-[#1a2234] hover:text-white'
                  }`}
                  style={{ zIndex: 10 }} // Ensure links are clickable
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="flex-grow">{item.name}</span>
                  {isActive(item.path) && <ChevronRight size={16} />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default LoanSidebar; 