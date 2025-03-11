import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowRight, Home, DollarSign } from 'lucide-react';
import { LoanData } from '@/utilities/loanGenerator';

interface LoanCardProps {
  loan?: LoanData | null;
}

// Helper function to capitalize first letter of each word
const capitalize = (str: string = '') => {
  return str.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

// Function to format loan status
const formatStatus = (status?: string) => {
  return capitalize(status?.replace('_', ' '));
};

const LoanCard: React.FC<LoanCardProps> = ({ loan }) => {
  // Get status color and style
  const getStatusStyle = (status?: string) => {
    switch (status) {
      case 'approved':
        return {
          bgColor: 'bg-green-900/50',
          textColor: 'text-green-400',
          pillColor: 'bg-green-500/20 text-green-400'
        };
      case 'rejected':
        return {
          bgColor: 'bg-red-900/50',
          textColor: 'text-red-400',
          pillColor: 'bg-red-500/20 text-red-400'
        };
      case 'pending':
        return {
          bgColor: 'bg-blue-900/50',
          textColor: 'text-blue-400',
          pillColor: 'bg-blue-500/20 text-blue-400'
        };
      default:
        return {
          bgColor: 'bg-gray-900/50',
          textColor: 'text-gray-400',
          pillColor: 'bg-gray-500/20 text-gray-400'
        };
    }
  };

  // Format loan type for display
  const formatLoanType = (loanType?: string) => {
    return loanType?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'Unknown Loan Type';
  };

  // Render placeholder if no loan
  if (!loan) {
    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 opacity-50 bg-gray-900 border-gray-800">
        <div className="p-4 text-center text-gray-500">
          Loan Not Available
        </div>
      </Card>
    );
  }

  const statusStyle = getStatusStyle(loan.status);

  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow duration-200 bg-gray-900 border-gray-800 ${statusStyle.bgColor}`}>
      {/* Card Header with Loan Number and Status */}
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <div className="flex items-center">
          <div className={`mr-2 ${statusStyle.textColor}`}>
            <DollarSign size={16} />
          </div>
          <h3 className="font-medium text-white">Loan #{(loan.id || '').substring(0, 8)}</h3>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.pillColor}`}>
          {formatStatus(loan.status)}
        </span>
      </div>

      {/* Property Address */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-start">
          <Home size={16} className="text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400 font-medium">Property Address</p>
            <p className="text-sm text-white">{loan.propertyAddress || 'No Address'}</p>
          </div>
        </div>
      </div>

      {/* Card Footer with Loan Details */}
      <div className="p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400 font-medium">Loan Type</p>
          <p className="text-sm font-medium text-white">{formatLoanType(loan.loanType)}</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-xs text-gray-400 font-medium mb-1">Loan Amount</p>
          <p className="text-sm font-medium mb-2 text-white">
            ${(loan.loanAmount ?? 0).toLocaleString()}
          </p>
          <Link 
            href={`/loans/${loan.id}`}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View Details
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default LoanCard;