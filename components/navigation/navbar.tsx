// components/navigation/navbar.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, MessageSquare, BarChart2, DollarSign, Files } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: BarChart2 },
  { href: '/loans', label: 'Loans', icon: DollarSign },
  { href: '/new-loan', label: 'New Loan', icon: FileText },
  { href: '/documents', label: 'Documents', icon: Files },
  { href: '/chat', label: 'Chat Assistant', icon: MessageSquare },
];

const Navbar: React.FC = () => {
  const pathname = usePathname();

  // Determine if a navigation item is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <nav
      className="
        bg-[#0A0F1A] 
        text-white 
        font-sans
        border-b
        border-gray-800
        shadow-md
        relative
        z-50
      "
      style={{ fontFamily: 'Work Sans, sans-serif', position: 'relative', zIndex: 100 }} // Use your font setup
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="text-xl font-bold text-blue-400 relative z-50">
          <Link 
            href="/" 
            className="hover:text-blue-300 transition-colors pointer-events-auto"
            style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            DocuLendAI
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-4 relative z-50" style={{ position: 'relative', zIndex: 100 }}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                  relative z-50 pointer-events-auto
                  ${active 
                    ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50' 
                    : 'hover:bg-gray-800/50 hover:text-blue-200'}
                `}
                style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Icon className={`w-4 h-4 mr-2 ${active ? 'text-blue-300' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;