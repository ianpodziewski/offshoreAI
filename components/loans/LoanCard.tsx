// components/loans/LoanCard.tsx
import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowRight, Home, DollarSign } from 'lucide-react';
import { LoanData } from '@/utilities/loanGenerator';

interface LoanCardProps {
  loan: LoanData;
}

// Helper function to capitalize first letter of each word
const capitalize = (str: string) => {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Function to format loan status
const formatStatus = (status: string) => {
  return capitalize(status.replace('_', ' '));
};

const LoanCard: React.FC<LoanCardProps> = ({ loan }) => {
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Card Header with Loan Number and Status */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
        <div className="flex items-center">
          <div className="text-blue-600 mr-2">
            <DollarSign size={16} />
          </div>
          <h3 className="font-medium">Loan #{loan.id.substring(0, 8)}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
          {formatStatus(loan.status)}
        </span>
      </div>

      {/* Property Address */}
      <div className="p-4 border-b">
        <div className="flex items-start">
          <Home size={16} className="text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 font-medium">Property Address</p>
            <p className="text-sm">{loan.propertyAddress}</p>
          </div>
        </div>
      </div>

      {/* Card Footer with Loan Type and View Details Link */}
      <div className="p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 font-medium">Loan Type</p>
          <p className="text-sm font-medium">{loan.loanType.toUpperCase()}</p>
        </div>
        <Link 
          href={`/loans/${loan.id}`}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details
          <ArrowRight size={14} />
        </Link>
      </div>
    </Card>
  );
};

export default LoanCard;