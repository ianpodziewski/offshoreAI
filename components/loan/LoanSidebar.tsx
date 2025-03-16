import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Info } from 'lucide-react';
import { COLORS } from '@/app/theme/colors';

interface LoanSidebarProps {
  loan: any;
  activePage?: string;
}

const LoanSidebar: React.FC<LoanSidebarProps> = ({ loan, activePage }) => {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  // Determine if the current path is active
  const isActive = (path: string) => {
    if (activePage) {
      return activePage === path;
    }
    return pathname?.includes(path) || false;
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
    <div className="bg-[#141b2d] rounded-lg shadow-md overflow-hidden">
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
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={`/loans/${loan.id}${item.path === 'overview' ? '' : `/${item.path}`}`}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-[#1a2234] text-white'
                    : 'text-gray-400 hover:bg-[#1a2234] hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default LoanSidebar; 