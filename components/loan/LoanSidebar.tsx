import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Info, ChevronRight, ChevronLeft } from 'lucide-react';
import { COLORS } from '@/app/theme/colors';

interface LoanSidebarProps {
  loanId: string;
}

const LoanSidebar: React.FC<LoanSidebarProps> = ({ loanId }) => {
  const [expanded, setExpanded] = useState(true);
  const pathname = usePathname();

  // Determine if the current path is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Toggle sidebar expansion
  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  // Navigation items
  const navItems = [
    {
      name: 'Loan',
      shortName: 'L',
      icon: <Info size={expanded ? 18 : 16} />,
      path: `/loans/${loanId}`,
    },
    {
      name: 'Documents',
      shortName: 'D',
      icon: <FileText size={expanded ? 18 : 16} />,
      path: `/loans/${loanId}/documents`,
    },
  ];

  return (
    <div 
      className={`fixed right-0 top-1/4 flex h-auto transition-all duration-300 z-10 group ${expanded ? 'w-48' : 'w-12'}`}
      onMouseEnter={() => !expanded && setExpanded(true)}
      onMouseLeave={() => expanded && setExpanded(false)}
    >
      {/* Toggle button */}
      <button
        className="absolute -left-6 top-1/2 transform -translate-y-1/2 bg-gray-800 rounded-l-md p-1 text-white z-20"
        onClick={toggleSidebar}
        aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {expanded ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Sidebar content */}
      <div 
        className={`flex flex-col w-full rounded-l-lg shadow-lg overflow-hidden`}
        style={{ backgroundColor: COLORS.bgDark, borderColor: COLORS.border }}
      >
        {navItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.path}
            className={`flex items-center px-4 py-3 transition-colors ${
              isActive(item.path) 
                ? 'text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
            style={{ 
              backgroundColor: isActive(item.path) ? COLORS.primary : 'transparent',
              borderBottom: `1px solid ${COLORS.border}`
            }}
          >
            <span className="mr-3">{item.icon}</span>
            {expanded ? (
              <span className="whitespace-nowrap">{item.name}</span>
            ) : (
              <span className="whitespace-nowrap">{item.shortName}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LoanSidebar; 