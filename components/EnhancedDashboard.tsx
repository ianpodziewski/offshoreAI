"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { loanDatabase } from '@/utilities/loanDatabase';
import { documentService } from '@/utilities/documentService';
import { LoanData } from '@/utilities/loanGenerator';
import dynamic from 'next/dynamic';
import { 
  BarChart2, 
  DollarSign, 
  PieChart, 
  TrendingUp, 
  Map, 
  FileText, 
  CheckCircle,
  Clock
} from 'lucide-react';
import LayoutWrapper from '@/app/layout-wrapper';
import Link from 'next/link';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// Custom type for loan status counts
interface LoanStatusCounts {
  approved: number;
  in_review: number;
  rejected: number;
  funded: number;
  closed: number;
  [key: string]: number;
}

// Dynamic import for LoanMap component
const LoanMap = dynamic(() => import('@/components/LoanMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex flex-col justify-center items-center bg-gray-50">
      <Map size={48} className="text-gray-300 mb-4" />
      <p className="text-gray-500 text-center">Loading map...</p>
    </div>
  ),
});

export default function EnhancedDashboard() {
  // State for loan data
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for derived metrics
  const [totalLoanValue, setTotalLoanValue] = useState(0);
  const [averageLoanSize, setAverageLoanSize] = useState(0);
  const [loanStatusCounts, setLoanStatusCounts] = useState<LoanStatusCounts>({
    approved: 0,
    in_review: 0,
    rejected: 0,
    funded: 0,
    closed: 0
  });
  const [monthlyLoanData, setMonthlyLoanData] = useState<any[]>([]);
  
  // Fetch loan data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ensure database is initialized
        await loanDatabase.initialize();
        
        // Fetch loans
        const fetchedLoans = await loanDatabase.getLoans();
        setLoans(fetchedLoans);
        
        // Calculate derived metrics
        calculateMetrics(fetchedLoans);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate derived metrics from loan data
  const calculateMetrics = (loanData: LoanData[]) => {
    if (!loanData || loanData.length === 0) return;
    
    // Calculate total and average loan values
    const totalValue = loanData.reduce((sum, loan) => sum + (loan.loanAmount || 0), 0);
    const avgSize = Math.round(totalValue / loanData.length);
    
    setTotalLoanValue(totalValue);
    setAverageLoanSize(avgSize);
    
    // Calculate status distribution
    const statusCounts: LoanStatusCounts = {
      approved: 0,
      in_review: 0,
      rejected: 0,
      funded: 0,
      closed: 0
    };
    
    loanData.forEach(loan => {
      const status = loan.status || 'in_review';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    setLoanStatusCounts(statusCounts);
    
    // Calculate monthly loan origination data
    calculateMonthlyData(loanData);
  };
  
  // Calculate monthly loan origination data
  const calculateMonthlyData = (loanData: LoanData[]) => {
    const monthlyData: Record<string, { count: number, volume: number }> = {};
    
    // Get the last 6 months
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyData[monthYear] = { count: 0, volume: 0 };
    }
    
    // Populate with loan data
    loanData.forEach(loan => {
      if (!loan.dateCreated) return;
      
      const date = new Date(loan.dateCreated);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (monthlyData[monthYear]) {
        monthlyData[monthYear].count += 1;
        monthlyData[monthYear].volume += (loan.loanAmount || 0);
      }
    });
    
    // Convert to array format for Recharts
    const monthlyArray = Object.keys(monthlyData).map(key => ({
      month: key,
      count: monthlyData[key].count,
      volume: monthlyData[key].volume / 1000 // Convert to thousands for better display
    }));
    
    // Sort by date (ascending)
    monthlyArray.sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/').map(Number);
      const [bMonth, bYear] = b.month.split('/').map(Number);
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });
    
    setMonthlyLoanData(monthlyArray);
  };
  
  // Helper to format loan type for display
  const formatLoanType = (type: string): string => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="ml-3 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }
  
  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Loan Document Management Dashboard</h1>
          <p className="text-gray-600">Review, manage, and track loan documents within your pipeline</p>
        </div>
        
        {/* Key Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* ... */}
        </div>
        
        {/* Visualizations Row 1 - Side by Side Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* ... */}
        </div>
        
        {/* Property Map - Full Width */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Map className="h-5 w-5 mr-2 text-blue-600" />
                Property Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="h-96 bg-white">
              {loans.length > 0 ? (
                <LoanMap loans={loans} />
              ) : (
                <div className="h-full flex flex-col justify-center items-center bg-gray-50">
                  <Map size={48} className="text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">No property data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Loan Applications Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Loan Applications</h2>
            <Link href="/loans" className="text-blue-600 hover:text-blue-800 text-sm">
              View All →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.slice(0, 3).map((loan) => (
              <Card key={loan.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Card Header with Loan Number and Status */}
                <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
                  <div className="flex items-center">
                    <div className="text-blue-600 mr-2">
                      <DollarSign size={16} />
                    </div>
                    <h3 className="font-medium">{loan.borrowerName}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                    loan.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                    loan.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    loan.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {loan.status ? loan.status.charAt(0).toUpperCase() + loan.status.slice(1).replace('_', ' ') : 'Pending'}
                  </span>
                </div>
  
                {/* Card Content */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Loan Amount</p>
                      <p className="font-medium">{formatCurrency(loan.loanAmount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Loan Type</p>
                      <p className="font-medium">{formatLoanType(loan.loanType || '')}</p>
                    </div>
                    <div className="col-span-2 mt-2">
                      <p className="text-xs text-gray-500 font-medium">Property</p>
                      <p className="text-sm truncate">{loan.propertyAddress}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Link 
                      href={`/loans/${loan.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}