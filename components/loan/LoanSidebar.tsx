import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Info } from 'lucide-react';
import { COLORS } from '@/app/theme/colors';

interface LoanSidebarProps {
  loanId: string;
}

const LoanSidebar: React.FC<LoanSidebarProps> = ({ loanId }) => {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  // Determine if the current path is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Navigation items
  const navItems = [
    {
      name: 'Loan',
      icon: <Info size={expanded ? 18 : 16} />,
      path: `/loans/${loanId}`,
    },
    {
      name: 'Documents',
      icon: <FileText size={expanded ? 18 : 16} />,
      path: `/loans/${loanId}/documents`,
    },
  ];

  return (
    <div 
      className={`fixed right-0 top-1/4 flex h-auto transition-all duration-300 z-10 ${expanded ? 'w-48' : 'w-12'}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Sidebar content */}
      <div 
        className={`flex flex-col w-full rounded-l-lg shadow-lg overflow-hidden`}
        style={{ backgroundColor: COLORS.bgDark, borderColor: COLORS.border }}
      >
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.path}
            className={`flex items-center ${expanded ? 'px-4' : 'justify-center'} py-3 transition-colors ${
              isActive(item.path) 
                ? 'text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            style={{ 
              backgroundColor: isActive(item.path) ? COLORS.primary : 'transparent',
              borderBottom: `1px solid ${COLORS.border}`
            }}
          >
            <span className={expanded ? "mr-3" : ""}>{item.icon}</span>
            {expanded && (
              <span className="whitespace-nowrap">{item.name}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LoanSidebar; 