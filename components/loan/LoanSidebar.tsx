import React from 'react';
import { FileText, Info } from 'lucide-react';
import { COLORS } from '@/app/theme/colors';

interface LoanSidebarProps {
  loan: any;
  activePage?: string;
}

const LoanSidebar: React.FC<LoanSidebarProps> = ({ loan, activePage }) => {
  if (!loan) return null;

  // Simplified navigation items
  const navItems = [
    {
      name: 'Overview',
      path: `/loans/${loan.id}`,
      icon: <Info size={18} />,
      isActive: activePage === 'overview'
    },
    {
      name: 'Documents',
      path: `/loans/${loan.id}/documents`,
      icon: <FileText size={18} />,
      isActive: activePage === 'documents'
    }
  ];

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
      
      {/* Navigation - using simple anchor tags instead of Next.js Links */}
      <div className="p-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.path}
                className={`flex items-center px-3 py-3 rounded-md transition-colors ${
                  item.isActive
                    ? 'bg-[#1a2234] text-white'
                    : 'text-gray-400 hover:bg-[#1a2234] hover:text-white'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LoanSidebar; 