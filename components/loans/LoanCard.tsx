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
  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'funded':
        return 'bg-blue-100 text-blue-800';
      case 'default':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
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
      <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200 opacity-50">
        <div className="p-4 text-center text-gray-500">
          Loan Not Available
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Card Header with Loan Number and Status */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
        <div className="flex items-center">
          <div className="text-blue-600 mr-2">
            <DollarSign size={16} />
          </div>
          <h3 className="font-medium">Loan #{(loan.id || '').substring(0, 8)}</h3>
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
            <p className="text-sm">{loan.propertyAddress || 'No Address'}</p>
          </div>
        </div>
      </div>

      {/* Card Footer with Loan Details */}
      <div className="p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500 font-medium">Loan Type</p>
          <p className="text-sm font-medium">{formatLoanType(loan.loanType)}</p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-xs text-gray-500 font-medium mb-1">Loan Amount</p>
          <p className="text-sm font-medium mb-2">
            ${(loan.loanAmount ?? 0).toLocaleString()}
          </p>
          <Link 
            href={`/loans/${loan.id}`}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
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