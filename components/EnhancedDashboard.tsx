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

interface LoanStatusCounts {
  approved: number;
  in_review: number;
  rejected: number;
  funded: number;
  closed: number;
  [key: string]: number;
}

// Dynamic import for LoanMap
const LoanMap = dynamic(() => import('@/components/LoanMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex flex-col justify-center items-center bg-gray-900">
      <Map size={48} className="text-gray-300 mb-4" />
      <p className="text-gray-400 text-center">Loading map...</p>
    </div>
  ),
});

export default function EnhancedDashboard() {
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await loanDatabase.initialize();
        const fetchedLoans = await loanDatabase.getLoans();
        setLoans(fetchedLoans);
        calculateMetrics(fetchedLoans);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateMetrics = (loanData: LoanData[]) => {
    if (!loanData || loanData.length === 0) return;

    const totalValue = loanData.reduce((sum, loan) => sum + (loan.loanAmount || 0), 0);
    const avgSize = Math.round(totalValue / loanData.length);

    setTotalLoanValue(totalValue);
    setAverageLoanSize(avgSize);

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

    calculateMonthlyData(loanData);
  };

  const calculateMonthlyData = (loanData: LoanData[]) => {
    const monthlyData: Record<string, { count: number; volume: number }> = {};
    const today = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(today);
      date.setMonth(date.getMonth() - i);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyData[monthYear] = { count: 0, volume: 0 };
    }

    loanData.forEach((loan) => {
      if (!loan.dateCreated) return;
      const date = new Date(loan.dateCreated);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      if (monthlyData[monthYear]) {
        monthlyData[monthYear].count += 1;
        monthlyData[monthYear].volume += loan.loanAmount || 0;
      }
    });

    const monthlyArray = Object.keys(monthlyData).map((key) => ({
      month: key,
      count: monthlyData[key].count,
      volume: monthlyData[key].volume / 1000 
    }));

    monthlyArray.sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/').map(Number);
      const [bMonth, bYear] = b.month.split('/').map(Number);
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });

    setMonthlyLoanData(monthlyArray);
  };

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
            <p className="ml-3 text-gray-300">Loading dashboard data...</p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8 px-4">
        {/* MAIN HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Loan Dashboard</h1>
        </div>

        {/* KPI SECTION (4 CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-3">
              <div className="flex flex-row items-center space-x-2">
                <DollarSign className="h-6 w-6 text-blue-500" />
                <span className="text-lg font-semibold text-gray-200">
                  Active Loan Value
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(totalLoanValue)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-3">
              <div className="flex flex-row items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <span className="text-lg font-semibold text-gray-200">
                  Average Loan Size
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(averageLoanSize)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-3">
              <div className="flex flex-row items-center space-x-2">
                <FileText className="h-6 w-6 text-orange-500" />
                <span className="text-lg font-semibold text-gray-200">
                  Total Loans
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {loans.length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-3">
              <div className="flex flex-row items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-lg font-semibold text-gray-200">
                  Funded Loans
                </span>
              </div>
              <div className="text-3xl font-bold text-white">
                {loanStatusCounts.funded}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2 SIDE-BY-SIDE CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Loan Status Pipeline */}
          <Card className="bg-gray-800">
            {/* Header area with spacing & border below */}
            <div className="px-4 pt-4 pb-2 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <BarChart2 className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-200">
                  Loan Status Pipeline
                </h2>
              </div>
            </div>
            <CardContent className="h-80">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis type="number" stroke="#ccc" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 14, fill: '#ccc' }} />
                  <Tooltip
                    formatter={(value: number) => [`${value} loans`]}
                    contentStyle={{ backgroundColor: '#2D2D2D', border: 'none' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Loan Origination */}
          <Card className="bg-gray-800">
            <div className="px-4 pt-4 pb-2 border-b border-gray-700">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-200">
                  Monthly Loan Origination
                </h2>
              </div>
            </div>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyLoanData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis
                    dataKey="month"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12, fill: '#ccc' }}
                  />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fill: '#ccc' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fill: '#ccc' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#2D2D2D', border: 'none' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number, name: string) => [
                      name === 'volume' ? `$${value}k` : value,
                      name === 'volume' ? 'Loan Volume (thousands)' : 'Loan Count',
                    ]}
                  />
                  <Legend wrapperStyle={{ color: '#fff' }} />
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

        {/* PROPERTY LOCATIONS */}
        <Card className="bg-gray-800">
          <div className="px-4 pt-4 pb-2 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <Map className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-200">
                Property Locations
              </h2>
            </div>
          </div>
          {/* Make the background dark so edges of the map blend in */}
          <CardContent className="h-96 bg-gray-900 relative">
              <LoanMap />
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}