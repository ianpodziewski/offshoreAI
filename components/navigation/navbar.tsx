// components/navigation/navbar.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, MessageSquare, BarChart2, DollarSign } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: BarChart2 },
  { href: '/loans', label: 'Loans', icon: DollarSign },
  { href: '/new-loan', label: 'New Loan', icon: FileText },
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
        bg-gray-900 
        text-white 
        font-sans
      "
      style={{ fontFamily: 'Work Sans, sans-serif' }} // Use your font setup
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="text-xl font-bold">
          DocuLendAI
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium 
                  ${active ? 'bg-gray-800' : 'hover:bg-gray-700'}
                `}
              >
                <Icon className="w-4 h-4 mr-2" />
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