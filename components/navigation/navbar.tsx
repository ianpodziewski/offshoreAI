import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Define navigation items
const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/upload', label: 'Upload Documents', icon: 'upload' },
  { href: '/workflow', label: 'Document Workflow', icon: 'file-text' },
  { href: '/chat', label: 'Chat Assistant', icon: 'message-square' },
];

const Navbar: React.FC = () => {
  const pathname = usePathname();
  
  // Function to check if a nav item is active
  const isActive = (path: string) => pathname === path;
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Loan Document Manager</span>
          </div>
          
          <div className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;