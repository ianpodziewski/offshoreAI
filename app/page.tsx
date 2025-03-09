// app/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, MessageSquare, CheckCircle, AlertTriangle, Clock, DollarSign, ArrowRight } from 'lucide-react';
import LayoutWrapper from './layout-wrapper';
import Link from 'next/link';
import { LoanData } from '@/utilities/loanGenerator';
import { loanDatabase } from '@/utilities/loanDatabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0,
    unassigned: 0,
  });

  const [loanStats, setLoanStats] = useState({
    totalLoans: 0,
    pendingLoans: 0,
    approvedLoans: 0,
    rejectedLoans: 0,
    inReviewLoans: 0,
  });

  const [loading, setLoading] = useState(true);
  const [recentLoans, setRecentLoans] = useState<LoanData[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Initialize loan database if needed
        loanDatabase.initialize();
        
        // Fetch all loans
        const loans = loanDatabase.getLoans();
        
        // Calculate loan statistics
        const loanStatsData = {
          totalLoans: loans.length,
          pendingLoans: loans.filter(loan => loan.status === 'pending').length,
          approvedLoans: loans.filter(loan => loan.status === 'approved').length,
          rejectedLoans: loans.filter(loan => loan.status === 'rejected').length,
          inReviewLoans: loans.filter(loan => loan.status === 'in_review').length,
        };
        
        setLoanStats(loanStatsData);
        
        // Set recent loans (latest 3)
        const sortedLoans = [...loans].sort((a, b) => 
          new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
        );
        setRecentLoans(sortedLoans.slice(0, 3));
        
        // Fetch document sockets
        const socketsResponse = await fetch('/api/get-file-sockets');
        const socketsData = await socketsResponse.json();
        
        // Fetch document statuses
        const statusesResponse = await fetch('/api/document-status');
        const statusesData = await statusesResponse.json();
        
        // Calculate statistics
        const statuses = statusesData.statuses || {};
        const statusCounts = {
          totalDocuments: 0,
          reviewing: 0,
          approved: 0,
          rejected: 0,
          unassigned: 0,
        };
        
        // Count total documents from file sockets
        let totalDocsFromSockets = 0;
        Object.values(socketsData.files || {}).forEach((docs: any) => {
          totalDocsFromSockets += (docs as any[]).length;
        });
        
        // Count documents by status
        Object.values(statuses).forEach((status: any) => {
          const statusValue = status.status;
          if (statusValue === 'reviewing') statusCounts.reviewing++;
          else if (statusValue === 'approved') statusCounts.approved++;
          else if (statusValue === 'rejected') statusCounts.rejected++;
          else if (statusValue === 'assigned' || statusValue === 'unassigned') statusCounts.unassigned++;
        });
        
        // Set total documents
        statusCounts.totalDocuments = Math.max(
          totalDocsFromSockets,
          Object.keys(statuses).length
        );
        
        setStats(statusCounts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Combined stats cards including both documents and loans
  const statCards = [
    {
      title: 'Total Documents',
      value: stats.totalDocuments,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      href: '/documents'
    },
    {
      title: 'Total Loans',
      value: loanStats.totalLoans,
      icon: DollarSign,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      href: '/loans'
    },
    {
      title: 'Under Review',
      value: stats.reviewing + loanStats.inReviewLoans,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      href: '/documents'
    },
    {
      title: 'Approved',
      value: stats.approved + loanStats.approvedLoans,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      href: '/documents'
    },
  ];
  
  return (
    <LayoutWrapper>
      <div className="container mx-auto py-16 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Loan Document Management Dashboard</h1>
          <p className="text-gray-600">Review, manage, and track loan documents within your pipeline</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Card key={i} className="shadow-sm bg-gray-50 animate-pulse">
                <CardContent className="p-6 h-24"></CardContent>
              </Card>
            ))
          ) : (
            statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Link href={card.href} key={index}>
                  <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">{card.title}</p>
                          <p className="text-3xl font-bold mt-1">{card.value}</p>
                        </div>
                        <div className={`p-3 rounded-full ${card.bgColor}`}>
                          <Icon className={`h-6 w-6 ${card.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
        
        {/* Recent Loans Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Loan Applications</h2>
            <Link href="/loans" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View All
              <ArrowRight size={16} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="shadow-sm bg-gray-50 animate-pulse">
                  <CardContent className="p-6 h-36"></CardContent>
                </Card>
              ))
            ) : recentLoans.length > 0 ? (
              recentLoans.map((loan) => (
                <Card key={loan.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="bg-gray-50 border-b p-4">
                    <CardTitle className="text-base flex justify-between items-center">
                      <span className="truncate">{loan.borrowerName}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                        loan.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                        loan.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        loan.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {loan.status.replace('_', ' ')}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Loan Amount:</span>
                        <span className="font-medium">${loan.loanAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type:</span>
                        <span className="font-medium">{loan.loanType.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="font-medium">{new Date(loan.dateCreated).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-4 text-right">
                      <Link 
                        href={`/loans/${loan.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center justify-end gap-1"
                      >
                        View Details
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No loan applications available</p>
                <Link 
                  href="/loans" 
                  className="mt-2 inline-block text-blue-600 hover:text-blue-800"
                >
                  Create a new loan
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Actions Section (Keep your existing section and update as needed) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg">Loan Document Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Link 
                  href="/upload" 
                  className="block p-3 border rounded-md hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <div className="p-2 rounded-full bg-blue-50">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Upload Document Package</h3>
                    <p className="text-sm text-gray-500">Split and categorize loan documents</p>
                  </div>
                </Link>
                
                <Link 
                  href="/loans" 
                  className="block p-3 border rounded-md hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <div className="p-2 rounded-full bg-purple-50">
                    <DollarSign className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Manage Loans</h3>
                    <p className="text-sm text-gray-500">View and update loan applications</p>
                  </div>
                </Link>
                
                <Link 
                  href="/documents" 
                  className="block p-3 border rounded-md hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <div className="p-2 rounded-full bg-green-50">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">Review Documents</h3>
                    <p className="text-sm text-gray-500">Update status and add notes to documents</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-lg">AI Assistance</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Link 
                href="/chat" 
                className="block p-3 border rounded-md hover:bg-gray-50 transition-colors flex items-center gap-3"
              >
                <div className="p-2 rounded-full bg-purple-50">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium">Chat with Loan Assistant</h3>
                  <p className="text-sm text-gray-500">Get help with document review and requirements</p>
                </div>
              </Link>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h3 className="font-medium text-sm mb-2">Ask the assistant about:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <span>Document requirements and verification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <span>Regulatory guidelines and compliance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <span>Loan calculation assistance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                    <span>Common errors in loan documentation</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWrapper>
  );
}