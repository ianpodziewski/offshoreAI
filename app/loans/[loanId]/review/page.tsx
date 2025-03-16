'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft,
  ClipboardCheck,
  FileCheck,
  FileSignature,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { loanDatabase } from '@/utilities/loanDatabase';
import LayoutWrapper from '@/app/layout-wrapper';
import LoanSidebar from '@/components/loan/LoanSidebar';
import { COLORS } from '@/app/theme/colors';

// Define review types
type ReviewType = 'initial' | 'unexecuted' | 'executed';

export default function LoanReviewPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.loanId as string;
  
  const [loan, setLoan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ReviewType>('initial');
  
  // Load loan data
  useEffect(() => {
    if (loanId) {
      const loanData = loanDatabase.getLoanById(loanId);
      if (loanData) {
        setLoan(loanData);
      }
    }
  }, [loanId]);
  
  // Render loading state
  if (!loan) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </LayoutWrapper>
    );
  }
  
  // Mock review data - in a real app, this would come from an API or database
  const mockReviewData = {
    initial: {
      status: 'incomplete',
      items: [
        { id: 1, name: 'Borrower Information', status: 'complete' },
        { id: 2, name: 'Property Details', status: 'incomplete' },
        { id: 3, name: 'Loan Terms', status: 'incomplete' },
        { id: 4, name: 'Credit Check', status: 'not_started' },
        { id: 5, name: 'Income Verification', status: 'not_started' }
      ]
    },
    unexecuted: {
      status: 'not_started',
      items: [
        { id: 1, name: 'Loan Agreement', status: 'not_started' },
        { id: 2, name: 'Promissory Note', status: 'not_started' },
        { id: 3, name: 'Deed of Trust', status: 'not_started' },
        { id: 4, name: 'Escrow Instructions', status: 'not_started' },
        { id: 5, name: 'Closing Disclosure', status: 'not_started' }
      ]
    },
    executed: {
      status: 'not_started',
      items: [
        { id: 1, name: 'Signed Loan Agreement', status: 'not_started' },
        { id: 2, name: 'Signed Promissory Note', status: 'not_started' },
        { id: 3, name: 'Signed Deed of Trust', status: 'not_started' },
        { id: 4, name: 'Insurance Verification', status: 'not_started' },
        { id: 5, name: 'Final Closing Requirements', status: 'not_started' }
      ]
    }
  };
  
  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'incomplete':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'not_started':
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  // Get status text based on status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Complete';
      case 'incomplete':
        return 'In Progress';
      case 'not_started':
      default:
        return 'Not Started';
    }
  };
  
  return (
    <LayoutWrapper>
      <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/loans/${loanId}`)}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Loan Overview
          </button>
          <h1 className="text-3xl font-bold mt-4 text-white">
            #{loanId} Review
          </h1>
          <p className="text-muted-foreground">
            Review and verify loan information for {loan.propertyAddress}
          </p>
        </div>

        <div className="flex flex-col-reverse lg:flex-row gap-6">
          {/* Main Content */}
          <div className="w-full lg:w-3/4 space-y-6">
            {/* Review Tabs */}
            <Tabs 
              defaultValue="initial" 
              onValueChange={(value) => setActiveTab(value as ReviewType)}
              className="bg-[#1A2234] p-4 rounded-lg border border-gray-800"
            >
              <div className="flex justify-center mb-4">
                <TabsList className="grid grid-cols-3 bg-[#0A0F1A] p-0 rounded-lg">
                  <TabsTrigger 
                    value="initial" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Initial Review
                  </TabsTrigger>
                  <TabsTrigger 
                    value="unexecuted" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Unexecuted Documents
                  </TabsTrigger>
                  <TabsTrigger 
                    value="executed" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <FileSignature className="h-4 w-4 mr-2" />
                    Executed Documents
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Initial Review Tab */}
              <TabsContent value="initial">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Initial Review</h2>
                      <p className="text-sm text-gray-400">
                        Review and verify initial loan application data
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Status:</span>
                      <span className="flex items-center text-yellow-500">
                        {getStatusIcon(mockReviewData.initial.status)}
                        <span className="ml-1">{getStatusText(mockReviewData.initial.status)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {mockReviewData.initial.items.map((item) => (
                      <Card key={item.id} className="bg-[#141b2d] border-gray-800 hover:border-gray-700 transition-colors">
                        <CardHeader className="p-4 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                          </div>
                          <div className="flex items-center">
                            {getStatusIcon(item.status)}
                            <span className="ml-2 text-sm" style={{ color: item.status === 'complete' ? '#10B981' : item.status === 'incomplete' ? '#FBBF24' : '#6B7280' }}>
                              {getStatusText(item.status)}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => console.log(`Start review for ${item.name}`)}
                          >
                            {item.status === 'not_started' ? 'Start Review' : 'Continue Review'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Unexecuted Documents Tab */}
              <TabsContent value="unexecuted">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Unexecuted Documents Review</h2>
                      <p className="text-sm text-gray-400">
                        Review documents sent to borrower for signing
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Status:</span>
                      <span className="flex items-center text-gray-400">
                        {getStatusIcon(mockReviewData.unexecuted.status)}
                        <span className="ml-1">{getStatusText(mockReviewData.unexecuted.status)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {mockReviewData.unexecuted.items.map((item) => (
                      <Card key={item.id} className="bg-[#141b2d] border-gray-800 hover:border-gray-700 transition-colors">
                        <CardHeader className="p-4 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                          </div>
                          <div className="flex items-center">
                            {getStatusIcon(item.status)}
                            <span className="ml-2 text-sm" style={{ color: item.status === 'complete' ? '#10B981' : item.status === 'incomplete' ? '#FBBF24' : '#6B7280' }}>
                              {getStatusText(item.status)}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => console.log(`Start review for ${item.name}`)}
                          >
                            {item.status === 'not_started' ? 'Start Review' : 'Continue Review'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Executed Documents Tab */}
              <TabsContent value="executed">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Executed Documents Review</h2>
                      <p className="text-sm text-gray-400">
                        Review signed documents and verify closing requirements
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Status:</span>
                      <span className="flex items-center text-gray-400">
                        {getStatusIcon(mockReviewData.executed.status)}
                        <span className="ml-1">{getStatusText(mockReviewData.executed.status)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {mockReviewData.executed.items.map((item) => (
                      <Card key={item.id} className="bg-[#141b2d] border-gray-800 hover:border-gray-700 transition-colors">
                        <CardHeader className="p-4 flex flex-row items-center justify-between">
                          <div>
                            <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                          </div>
                          <div className="flex items-center">
                            {getStatusIcon(item.status)}
                            <span className="ml-2 text-sm" style={{ color: item.status === 'complete' ? '#10B981' : item.status === 'incomplete' ? '#FBBF24' : '#6B7280' }}>
                              {getStatusText(item.status)}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <Button 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => console.log(`Start review for ${item.name}`)}
                          >
                            {item.status === 'not_started' ? 'Start Review' : 'Continue Review'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="w-full lg:w-1/4">
            <LoanSidebar loan={loan} activePage="review" />
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
} 