"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, Search, Filter } from 'lucide-react';
import LayoutWrapper from '../layout-wrapper';
import { loanDatabase } from '@/utilities/loanDatabase';
import LoanCard from '@/components/loans/LoanCard';
import { LoanData, LoanStatus, LoanType, PropertyType } from '@/utilities/loanGenerator';
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [filteredLoans, setFilteredLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loanTypeFilter, setLoanTypeFilter] = useState<string>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('all');
  
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
        setFilteredLoans(resetLoans);
      } else {
        setLoans(validLoans);
        setFilteredLoans(validLoans);
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
  
  // Apply filters whenever filter states change
  useEffect(() => {
    if (loans.length === 0) return;
    
    let result = [...loans];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(loan => 
        (loan.borrowerName?.toLowerCase().includes(query)) ||
        (loan.propertyAddress?.toLowerCase().includes(query)) ||
        (loan.id?.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(loan => loan.status === statusFilter);
    }
    
    // Apply loan type filter
    if (loanTypeFilter !== 'all') {
      result = result.filter(loan => loan.loanType === loanTypeFilter);
    }
    
    // Apply property type filter
    if (propertyTypeFilter !== 'all') {
      result = result.filter(loan => loan.propertyType === propertyTypeFilter);
    }
    
    setFilteredLoans(result);
  }, [loans, searchQuery, statusFilter, loanTypeFilter, propertyTypeFilter]);
  
  const resetDatabase = () => {
    loanDatabase.reset();
    fetchLoans();
  };
  
  const createNewLoan = () => {
    const newLoan = loanDatabase.addLoan({});
    fetchLoans();
  };
  
  // Helper function to format display text
  const formatDisplayText = (text: string) => {
    return text.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
        <div className="flex justify-between items-center mb-6">
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
          </div>
        </div>
        
        {/* Search and Filter Section */}
        <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: COLORS.bgDark, borderColor: COLORS.border }}>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-grow relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} style={{ color: COLORS.textMuted }} />
              </div>
              <Input
                type="text"
                placeholder="Search by borrower, address, or loan ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
                style={{ backgroundColor: 'rgba(31, 41, 55, 0.5)' }}
              />
            </div>
            
            {/* Filter Button for Mobile */}
            <div className="md:hidden">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 border-gray-700 text-gray-300"
                onClick={() => document.getElementById('filter-section')?.classList.toggle('hidden')}
              >
                <Filter size={16} />
                Filters
              </Button>
            </div>
          </div>
          
          {/* Filter Options */}
          <div id="filter-section" className="hidden md:flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textMuted }}>
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Loan Type Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textMuted }}>
                Loan Type
              </label>
              <Select value={loanTypeFilter} onValueChange={setLoanTypeFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="All Loan Types" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="all">All Loan Types</SelectItem>
                  <SelectItem value="fix_and_flip">Fix and Flip</SelectItem>
                  <SelectItem value="bridge">Bridge</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="rehab">Rehab</SelectItem>
                  <SelectItem value="rental">Rental</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Property Type Filter */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" style={{ color: COLORS.textMuted }}>
                Property Type
              </label>
              <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectValue placeholder="All Property Types" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                  <SelectItem value="all">All Property Types</SelectItem>
                  <SelectItem value="single_family">Single Family</SelectItem>
                  <SelectItem value="multi_family">Multi Family</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="mixed_use">Mixed Use</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Reset Filters Button */}
            <div className="flex items-end">
              <Button 
                variant="outline" 
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setLoanTypeFilter('all');
                  setPropertyTypeFilter('all');
                }}
              >
                Reset Filters
              </Button>
            </div>
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
        ) : filteredLoans.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: COLORS.textMuted }}>
              {loans.length === 0 
                ? "No loans available. Please create a new loan." 
                : "No loans match your search criteria. Try adjusting your filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLoans.map((loan) => (
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