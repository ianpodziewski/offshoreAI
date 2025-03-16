// components/navigation/navbar.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, MessageSquare, BarChart2, DollarSign, Files, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: BarChart2 },
  { href: '/loans', label: 'Loans', icon: DollarSign },
  { href: '/new-loan', label: 'New Loan', icon: FileText },
  { href: '/documents', label: 'Documents', icon: Files },
  { href: '/chat', label: 'Chat Assistant', icon: MessageSquare },
];

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine if a navigation item is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <nav
      className="bg-[#0A0F1A] text-white font-sans border-b border-gray-800 shadow-md relative z-50"
      style={{ fontFamily: 'Work Sans, sans-serif' }}
    >
      <div className="container mx-auto py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="text-xl font-bold text-blue-400">
          <Link href="/" className="hover:text-blue-300 transition-colors">
            DocuLendAI
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            type="button"
            className="text-gray-400 hover:text-white focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                  ${active 
                    ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50' 
                    : 'hover:bg-gray-800/50 hover:text-blue-200'}
                `}
              >
                <Icon className={`w-4 h-4 mr-2 ${active ? 'text-blue-300' : ''}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-800">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200
                    ${active 
                      ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50' 
                      : 'hover:bg-gray-800/50 hover:text-blue-200'}
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className={`w-5 h-5 mr-3 ${active ? 'text-blue-300' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;