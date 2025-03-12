"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from 'lucide-react';
import LayoutWrapper from '../layout-wrapper';
import { loanDatabase } from '@/utilities/loanDatabase';
import LoanCard from '@/components/loans/LoanCard';
import { LoanData } from '@/utilities/loanGenerator';

// Define color palette consistent with dashboard
const COLORS = {
  // Primary UI colors
  primary: "#3B82F6", // Blue primary accent (blue-500)
  secondary: "#6B7280", // Gray secondary accent (gray-500)

  // Background colors
  bgDark: "#111827", // Card/container background (gray-900)
  bgDarker: "#0F1629", // Deeper background (darker than gray-900)

  // Border colors
  border: "#1F2937", // Border color (gray-800)

  // Text colors
  textPrimary: "#F3F4F6", // Primary text (gray-200)
  textSecondary: "#D1D5DB", // Secondary text (gray-300)
  textMuted: "#6B7280", // Muted text (gray-500)
  textAccent: "#60A5FA", // Accent text (blue-400)
};

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure database is initialized
      loanDatabase.initialize();
      
      // Fetch loans
      const fetchedLoans = loanDatabase.getLoans();
      
      // Validate loans
      const validLoans = fetchedLoans.filter(loan => 
        loan && typeof loan === 'object' && loan.id
      );
      
      if (validLoans.length === 0) {
        // If no valid loans, reset the database
        const resetLoans = loanDatabase.reset();
        setLoans(resetLoans);
      } else {
        setLoans(validLoans);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
      setError('Failed to load loans. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLoans();
  }, []);
  
  const resetDatabase = () => {
    loanDatabase.reset();
    fetchLoans();
  };
  
  const createNewLoan = () => {
    const newLoan = loanDatabase.addLoan({});
    fetchLoans();
  };
  
  if (error) {
    return (
      <LayoutWrapper>
        <div 
          className="container mx-auto py-8 px-4 text-center"
          style={{ backgroundColor: COLORS.bgDark, color: COLORS.textPrimary }}
        >
          <p className="mb-4" style={{ color: COLORS.textAccent }}>{error}</p>
          <Button 
            onClick={resetDatabase}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Reset Database
          </Button>
        </div>
      </LayoutWrapper>
    );
  }
  
  return (
    <LayoutWrapper>
      <div 
        className="container mx-auto py-8 px-4"
        style={{ backgroundColor: COLORS.bgDarker }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 
            className="text-2xl font-bold"
            style={{ color: COLORS.textPrimary }}
          >
            Loan Management
          </h1>
          <div className="flex gap-3">
            <Button 
              onClick={resetDatabase} 
              variant="outline"
              className="flex items-center gap-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <RefreshCw size={16} className="text-gray-300" />
              Reset Database
            </Button>
            <Button 
              onClick={createNewLoan}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus size={16} />
              Create New Loan
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div 
              className="animate-spin w-8 h-8 border-4 rounded-full mx-auto mb-4"
              style={{
                borderColor: COLORS.primary,
                borderTopColor: 'transparent'
              }}
            ></div>
            <p style={{ color: COLORS.textSecondary }}>Loading loans...</p>
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: COLORS.textMuted }}>No loans available. Please create a new loan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan) => (
              <LoanCard 
                key={loan.id} 
                loan={loan} 
              />
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}