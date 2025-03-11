"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { loanDatabase } from '@/utilities/loanDatabase';
import { LoanData } from '@/utilities/loanGenerator';
import dynamic from 'next/dynamic';
import { 
  BarChart2, 
  DollarSign, 
  TrendingUp, 
  Map, 
  FileText, 
  CheckCircle
} from 'lucide-react';
import LayoutWrapper from '@/app/layout-wrapper';
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

    loanData.forEach((loan) => {
      const status = loan.status || 'in_review';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    setLoanStatusCounts(statusCounts);

    // Calculate monthly loan origination data
    calculateMonthlyData(loanData);
  };

  // Calculate monthly loan origination data
  const calculateMonthlyData = (loanData: LoanData[]) => {
    const monthlyData: Record<string, { count: number; volume: number }> = {};

    // Get the last 6 months
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyData[monthYear] = { count: 0, volume: 0 };
    }

    // Populate with loan data
    loanData.forEach((loan) => {
      if (!loan.dateCreated) return;

      const date = new Date(loan.dateCreated);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

      if (monthlyData[monthYear]) {
        monthlyData[monthYear].count += 1;
        monthlyData[monthYear].volume += loan.loanAmount || 0;
      }
    });

    // Convert to array for Recharts
    const monthlyArray = Object.keys(monthlyData).map((key) => ({
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
        {/* MAIN HEADER (Renamed & sub-header removed) */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Loan Dashboard</h1>
          {/* Removed the paragraph that said "Review, manage, and track..." */}
        </div>

        {/* KEY METRICS SECTION (Centered, icons repositioned, no descriptions) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Loan Value */}
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-2">
              <div className="flex flex-row items-center space-x-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  Active Loan Value
                </span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalLoanValue)}
              </div>
            </CardContent>
          </Card>

          {/* Average Loan Size */}
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-2">
              <div className="flex flex-row items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  Average Loan Size
                </span>
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(averageLoanSize)}
              </div>
            </CardContent>
          </Card>

          {/* Total Loans */}
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-2">
              <div className="flex flex-row items-center space-x-2">
                <FileText className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  Total Loans
                </span>
              </div>
              <div className="text-2xl font-bold">
                {loans.length}
              </div>
            </CardContent>
          </Card>

          {/* Funded Loans */}
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-2">
              <div className="flex flex-row items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  Funded Loans
                </span>
              </div>
              <div className="text-2xl font-bold">
                {loanStatusCounts.funded}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* VISUALIZATIONS ROW 1 - Side by Side Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Loan Status Pipeline */}
          <Card>
            <CardContent className="h-80">
              <div className="flex items-center mb-4 space-x-2">
                <BarChart2 className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Loan Status Pipeline</h2>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    {
                      name: 'In Review',
                      value: loanStatusCounts.in_review || 0,
                      fill: '#FFB347',
                    },
                    {
                      name: 'Approved',
                      value: loanStatusCounts.approved || 0,
                      fill: '#77DD77',
                    },
                    {
                      name: 'Funded',
                      value: loanStatusCounts.funded || 0,
                      fill: '#59A5D8',
                    },
                    {
                      name: 'Closed',
                      value: loanStatusCounts.closed || 0,
                      fill: '#B19CD9',
                    },
                    {
                      name: 'Rejected',
                      value: loanStatusCounts.rejected || 0,
                      fill: '#FF6961',
                    },
                  ]}
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 14 }} />
                  <Tooltip formatter={(value: number) => [`${value} loans`]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {[
                      { name: 'In Review', fill: '#FFB347' },
                      { name: 'Approved', fill: '#77DD77' },
                      { name: 'Funded', fill: '#59A5D8' },
                      { name: 'Closed', fill: '#B19CD9' },
                      { name: 'Rejected', fill: '#FF6961' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Loan Origination */}
          <Card>
            <CardContent className="h-80">
              <div className="flex items-center mb-4 space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Monthly Loan Origination</h2>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyLoanData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'volume' ? `$${value}k` : value,
                      name === 'volume' ? 'Loan Volume (thousands)' : 'Loan Count',
                    ]}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="count"
                    name="Loan Count"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="volume"
                    name="Loan Volume ($k)"
                    stroke="#82ca9d"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* PROPERTY LOCATIONS MAP - Full Width */}
        <div className="mb-8">
          <Card>
            <CardContent className="h-96 bg-white">
              <div className="flex items-center mb-4 space-x-2">
                <Map className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Property Locations</h2>
              </div>
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
      </div>
    </LayoutWrapper>
  );
}