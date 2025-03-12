"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { loanDatabase } from "@/utilities/loanDatabase";
import { LoanData } from "@/utilities/loanGenerator";
import dynamic from "next/dynamic";
import {
  BarChart2,
  DollarSign,
  TrendingUp,
  Map,
  FileText,
  CheckCircle,
} from "lucide-react";
import LayoutWrapper from "@/app/layout-wrapper";
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
  Cell,
} from "recharts";

// Define a consistent color palette based on your chat interface
const COLORS = {
  // Primary UI colors
  primary: "#3B82F6",        // Blue primary accent (blue-500)
  secondary: "#6B7280",      // Gray secondary accent (gray-500)
  
  // Background colors
  bgDark: "#111827",         // Card/container background (gray-900)
  bgDarker: "#0F1629",       // Map/chart background (darker than gray-900)
  bgHeader: "rgba(31, 41, 55, 0.7)",  // Header background (gray-800/70)
  bgHover: "rgba(31, 41, 55, 0.5)",   // Hover state (gray-800/50)
  bgButton: "rgba(31, 41, 55, 0.3)",  // Button background (gray-800/30)
  
  // Border colors
  border: "#1F2937",         // Border color (gray-800)
  borderAccent: "#3B82F6",   // Accent border (blue-500)
  
  // Text colors
  textPrimary: "#F3F4F6",    // Primary text (gray-200)
  textSecondary: "#D1D5DB",  // Secondary text (gray-300)
  textMuted: "#6B7280",      // Muted text (gray-500)
  textAccent: "#60A5FA",     // Accent text (blue-400)
  
  // Status colors matching your chat interface
  status: {
    approved: "#10B981",     // Approved status (green-400)
    approvedBg: "rgba(6, 78, 59, 0.3)", // Approved bg (green-900/30)
    pending: "#FBBF24",      // Pending/in-review status (yellow-400)
    pendingBg: "rgba(120, 53, 15, 0.3)", // Pending bg (yellow-900/30)
    rejected: "#F87171",     // Rejected status (red-400)
    rejectedBg: "rgba(127, 29, 29, 0.3)" // Rejected bg (red-900/30)
  },
  
  // Chart colors
  chart: {
    primary: "#60A5FA",      // Primary line/bar color (blue-400)
    secondary: "#94A3B8",    // Secondary line/bar color (now gray for monthly chart)
    tertiary: "#F59E0B",     // Tertiary color (amber-500)
    grid: "#374151",         // Grid lines (gray-700)
    
    // Blue shades for status pipeline chart
    inReview: "#93C5FD",     // Lightest blue (blue-300)
    approved: "#60A5FA",     // Light blue (blue-400)
    funded: "#3B82F6",       // Medium blue (blue-500)
    closed: "#2563EB",       // Dark blue (blue-600)
    rejected: "#1D4ED8"      // Darkest blue (blue-700)
  }
};

interface LoanStatusCounts {
  approved: number;
  in_review: number;
  rejected: number;
  funded: number;
  closed: number;
  [key: string]: number;
}

// 1) Define the LoanMapProps interface exactly as in LoanMap.tsx
interface LoanMapProps {
  stateData: Record<string, number>;
}

// Map abbreviations to full state names
const usStateNames: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

// 2) Dynamically import the default export from LoanMap
//    Then cast it to React.FC<LoanMapProps> to satisfy TS
const LoanMap = dynamic(() =>
  import("@/components/LoanMap").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex flex-col justify-center items-center" style={{ backgroundColor: COLORS.bgDarker }}>
        <Map size={48} style={{ color: COLORS.textSecondary }} className="mb-4" />
        <p style={{ color: COLORS.textMuted }} className="text-center">Loading map...</p>
      </div>
    ),
  }
) as React.FC<LoanMapProps>;

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
    closed: 0,
  });
  const [monthlyLoanData, setMonthlyLoanData] = useState<any[]>([]);

  // State data for the map's choropleth
  const [stateData, setStateData] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await loanDatabase.initialize();
        const fetchedLoans = await loanDatabase.getLoans();
        setLoans(fetchedLoans);

        // Normal existing metrics
        calculateMetrics(fetchedLoans);

        // Build dictionary from addresses => aggregated amounts
        buildStateData(fetchedLoans);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build up a record: { "California": totalAmount, "New York": totalAmount, ...}
  const buildStateData = (loanData: LoanData[]) => {
    const byState: Record<string, number> = {};

    for (const loan of loanData) {
      if (!loan.propertyAddress) continue;
      const match = loan.propertyAddress.match(/,\s*([A-Z]{2})\b/);
      if (!match) continue;
      const abbr = match[1]; // e.g. "CA"
      const fullName = usStateNames[abbr] || abbr;
      byState[fullName] = (byState[fullName] || 0) + (loan.loanAmount || 0);
    }

    setStateData(byState);
  };

  const calculateMetrics = (loanData: LoanData[]) => {
    if (!loanData || loanData.length === 0) return;

    const totalValue = loanData.reduce(
      (sum, loan) => sum + (loan.loanAmount || 0),
      0
    );
    const avgSize = Math.round(totalValue / loanData.length);

    setTotalLoanValue(totalValue);
    setAverageLoanSize(avgSize);

    const statusCounts: LoanStatusCounts = {
      approved: 0,
      in_review: 0,
      rejected: 0,
      funded: 0,
      closed: 0,
    };
    loanData.forEach((loan) => {
      const status = loan.status || "in_review";
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
      volume: monthlyData[key].volume / 1000,
    }));

    // sort ascending
    monthlyArray.sort((a, b) => {
      const [aMonth, aYear] = a.month.split("/").map(Number);
      const [bMonth, bYear] = b.month.split("/").map(Number);
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });

    setMonthlyLoanData(monthlyArray);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-8 h-8 border-4 rounded-full" 
              style={{ 
                borderColor: COLORS.primary, 
                borderTopColor: 'transparent' 
              }}></div>
            <p className="ml-3" style={{ color: COLORS.textSecondary }}>Loading dashboard data...</p>
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
          <h1 className="text-2xl font-bold" style={{ color: COLORS.textPrimary }}>Loan Dashboard</h1>
        </div>

        {/* KPI SECTION (4 CARDS) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card style={{ backgroundColor: COLORS.bgDark }}>
            <div className="px-4 pt-4 pb-3 text-center" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                Active Loan Value
              </h2>
            </div>
            <div className="w-full py-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: COLORS.textPrimary }}>
                  {formatCurrency(totalLoanValue)}
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ backgroundColor: COLORS.bgDark }}>
            <div className="px-4 pt-4 pb-3 text-center" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                Average Loan Size
              </h2>
            </div>
            <div className="w-full py-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: COLORS.textPrimary }}>
                  {formatCurrency(averageLoanSize)}
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ backgroundColor: COLORS.bgDark }}>
            <div className="px-4 pt-4 pb-3 text-center" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                Total Loans
              </h2>
            </div>
            <div className="w-full py-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: COLORS.textPrimary }}>
                  {loans.length}
                </div>
              </div>
            </div>
          </Card>

          <Card style={{ backgroundColor: COLORS.bgDark }}>
            <div className="px-4 pt-4 pb-3 text-center" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                Funded Loans
              </h2>
            </div>
            <div className="w-full py-6 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: COLORS.textPrimary }}>
                  {loanStatusCounts.funded}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 2 SIDE-BY-SIDE CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Loan Status Pipeline */}
          <Card style={{ backgroundColor: COLORS.bgDark }}>
            <div className="px-4 pt-4 pb-3 text-center" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                Loan Status Pipeline
              </h2>
            </div>
            <div className="w-full h-80 flex items-center justify-center">
              <ResponsiveContainer width="95%" height="90%">
                <BarChart
                  layout="vertical"
                  data={[
                    {
                      name: "In Review",
                      value: loanStatusCounts.in_review || 0,
                      fill: COLORS.chart.inReview,
                    },
                    {
                      name: "Approved",
                      value: loanStatusCounts.approved || 0,
                      fill: COLORS.chart.approved,
                    },
                    {
                      name: "Funded",
                      value: loanStatusCounts.funded || 0,
                      fill: COLORS.chart.funded,
                    },
                    {
                      name: "Closed",
                      value: loanStatusCounts.closed || 0,
                      fill: COLORS.chart.closed,
                    },
                    {
                      name: "Rejected",
                      value: loanStatusCounts.rejected || 0,
                      fill: COLORS.chart.rejected,
                    },
                  ]}
                  margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chart.grid} />
                  <XAxis type="number" stroke={COLORS.textSecondary} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 14, fill: COLORS.textSecondary }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} loans`]}
                    contentStyle={{ backgroundColor: "#2D2D2D", border: "none" }}
                    itemStyle={{ color: COLORS.textPrimary }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Monthly Loan Origination */}
          <Card style={{ backgroundColor: COLORS.bgDark }}>
            <div className="px-4 pt-4 pb-3 text-center" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <h2 className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
                Monthly Loan Origination
              </h2>
            </div>
            <CardContent className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyLoanData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chart.grid} />
                  <XAxis
                    dataKey="month"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12, fill: COLORS.textSecondary }}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    stroke={COLORS.chart.primary}
                    tick={{ fill: COLORS.textSecondary }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke={COLORS.chart.secondary}
                    tick={{ fill: COLORS.textSecondary }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#2D2D2D", border: "none" }}
                    itemStyle={{ color: COLORS.textPrimary }}
                    formatter={(value: number, name: string) => [
                      name === "volume" ? `${value}k` : value,
                      name === "volume" ? "Loan Volume (thousands)" : "Loan Count",
                    ]}
                  />
                  <Legend wrapperStyle={{ color: COLORS.textPrimary }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="count"
                    name="Loan Count"
                    stroke={COLORS.chart.primary}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="volume"
                    name="Loan Volume ($k)"
                    stroke={COLORS.chart.secondary}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* PROPERTY LOCATIONS */}
        <Card style={{ backgroundColor: COLORS.bgDark }}>
          <div className="px-4 pt-4 pb-3 text-center" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
            <h2 className="text-lg font-semibold" style={{ color: COLORS.textPrimary }}>
              Property Locations
            </h2>
          </div>
          <div className="w-full h-96 flex items-center justify-center" style={{ backgroundColor: COLORS.bgDarker }}>
            <div className="w-11/12 h-5/6">
              <LoanMap stateData={stateData} />
            </div>
          </div>
        </Card>
      </div>
    </LayoutWrapper>
  );
}