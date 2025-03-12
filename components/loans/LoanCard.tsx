import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowRight, Home, DollarSign } from 'lucide-react';
import { LoanData } from '@/utilities/loanGenerator';

// Define a consistent color palette
const COLORS = {
  // Primary UI colors
  primary: "#3B82F6", // Blue primary accent (blue-500)
  secondary: "#6B7280", // Gray secondary accent (gray-500)

  // Background colors
  bgDark: "#111827", // Card/container background (gray-900)
  bgDarker: "#0F1629", // Deeper background (darker than gray-900)
  bgHeader: "rgba(31, 41, 55, 0.7)", // Header background (gray-800/70)

  // Border colors
  border: "#1F2937", // Border color (gray-800)

  // Text colors
  textPrimary: "#F3F4F6", // Primary text (gray-200)
  textSecondary: "#D1D5DB", // Secondary text (gray-300)
  textMuted: "#6B7280", // Muted text (gray-500)
  textAccent: "#60A5FA", // Accent text (blue-400)

  // Status colors
  status: {
    approved: {
      bg: "rgba(6, 78, 59, 0.3)", // Green-900/30
      text: "#10B981", // Green-400
      pill: "bg-green-500/20 text-green-400"
    },
    rejected: {
      bg: "rgba(127, 29, 29, 0.3)", // Red-900/30
      text: "#F87171", // Red-400
      pill: "bg-red-500/20 text-red-400"
    },
    pending: {
      bg: "rgba(30, 64, 175, 0.3)", // Blue-900/30
      text: "#60A5FA", // Blue-400
      pill: "bg-blue-500/20 text-blue-400"
    },
    default: {
      bg: "rgba(31, 41, 55, 0.5)", // Gray-900/50
      text: "#6B7280", // Gray-500
      pill: "bg-gray-500/20 text-gray-400"
    }
  }
};

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
        return COLORS.status.approved;
      case 'rejected':
        return COLORS.status.rejected;
      case 'pending':
        return COLORS.status.pending;
      default:
        return COLORS.status.default;
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
      <Card 
        className="overflow-hidden hover:shadow-md transition-shadow duration-200 opacity-50" 
        style={{ 
          backgroundColor: COLORS.bgDark,
          borderColor: COLORS.border 
        }}
      >
        <div className="p-4 text-center" style={{ color: COLORS.textMuted }}>
          Loan Not Available
        </div>
      </Card>
    );
  }

  const statusStyle = getStatusStyle(loan.status);

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col" 
      style={{ 
        backgroundColor: COLORS.bgDark,
        borderColor: COLORS.border 
      }}
    >
      {/* Card Header with Loan Number and Status */}
      <div 
        className="flex justify-between items-center p-4 border-b"
        style={{ 
          backgroundColor: COLORS.bgHeader,
          borderColor: COLORS.border 
        }}
      >
        <div className="flex items-center">
          <div className="mr-2" style={{ color: statusStyle.text }}>
            <DollarSign size={16} />
          </div>
          <h3 className="font-medium" style={{ color: COLORS.textPrimary }}>
            Loan #{(loan.id || '').substring(0, 8)}
          </h3>
        </div>
        <span 
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.pill}`}
        >
          {formatStatus(loan.status)}
        </span>
      </div>

      {/* Property Address */}
      <div 
        className="p-4 border-b flex-grow"
        style={{ 
          borderColor: COLORS.border 
        }}
      >
        <div className="flex items-start mb-4">
          <Home size={16} className="mt-0.5 mr-2 flex-shrink-0" style={{ color: COLORS.textMuted }} />
          <div>
            <p className="text-xs font-medium" style={{ color: COLORS.textMuted }}>Property Address</p>
            <p className="text-sm" style={{ color: COLORS.textPrimary }}>
              {loan.propertyAddress || 'No Address'}
            </p>
          </div>
        </div>

        {/* Loan Type and Loan Amount on the same line */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-medium" style={{ color: COLORS.textMuted }}>Loan Type</p>
            <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
              {formatLoanType(loan.loanType)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium" style={{ color: COLORS.textMuted }}>Loan Amount</p>
            <p className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
              ${(loan.loanAmount ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* View Details Button */}
      <div className="p-4 flex justify-center">
        <Link 
          href={`/loans/${loan.id}`}
          className="flex items-center gap-1 text-sm font-medium px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200"
        >
          View Details
          <ArrowRight size={14} />
        </Link>
      </div>
    </Card>
  );
};

export default LoanCard;