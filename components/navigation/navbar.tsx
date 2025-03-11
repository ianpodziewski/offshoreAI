// components/navigation/navbar.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, MessageSquare, Upload, Home, BarChart2, DollarSign } from 'lucide-react';

// Updated navigation items to include Loans
const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: BarChart2 },
  { href: '/loans', label: 'Loans', icon: DollarSign }, // New loans navigation item
  { href: '/new-loan', label: 'New Loan', icon: FileText },
  { href: '/chat', label: 'Chat Assistant', icon: MessageSquare },
];

const Navbar: React.FC = () => {
  const pathname = usePathname();
  
  // Function to check if a nav item is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname === path || pathname?.startsWith(path + '/');
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center gap-2"
          >
            <Home className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold">Loan Document Manager</span>
          </Link>
          
          <div className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;