import React, { useState } from 'react';
import { FileText, Info, ChevronRight, ChevronLeft, MessageCircle } from 'lucide-react';
import { COLORS } from '@/app/theme/colors';
import Link from 'next/link';

interface LoanSidebarProps {
  loan: any;
  activePage?: string;
}

const LoanSidebar: React.FC<LoanSidebarProps> = ({ loan, activePage }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  if (!loan) return null;

  // Simplified navigation items
  const navItems = [
    {
      name: 'Loan Data Points',
      path: `/loans/${loan.id}`,
      icon: <Info size={18} />,
      isActive: !activePage || activePage === 'overview'
    },
    {
      name: 'Documents',
      path: `/loans/${loan.id}/documents`,
      icon: <FileText size={18} />,
      isActive: activePage === 'documents'
    },
    {
      name: 'Loan Chatbot',
      path: `/loans/${loan.id}/chat`,
      icon: <MessageCircle size={18} />,
      isActive: activePage === 'chat'
    }
  ];

  return (
    <div className="relative sticky top-6">
      <div 
        className={`bg-[#141b2d] rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-full'
        }`}
      >
        {/* Navigation */}
        <div className="p-4">
          <ul className="space-y-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    item.isActive
                      ? 'bg-blue-900/70 text-blue-300 font-medium'
                      : 'text-gray-400 hover:bg-[#1a2234] hover:text-white'
                  }`}
                >
                  <span className={isCollapsed ? "mx-auto" : "mr-3"}>{item.icon}</span>
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Toggle button - positioned absolutely and centered vertically */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-3 top-1/2 transform -translate-y-1/2 bg-[#1a2234] rounded-full p-1 shadow-md z-10 hover:bg-[#232d45] transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight size={16} className="text-gray-400" />
        ) : (
          <ChevronLeft size={16} className="text-gray-400" />
        )}
      </button>
    </div>
  );
};

export default LoanSidebar; 