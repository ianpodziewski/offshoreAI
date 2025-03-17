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
  RefreshCw,
  Home,
  Briefcase,
  FileText
} from 'lucide-react';
import { loanDatabase } from '@/utilities/loanDatabase';
import LayoutWrapper from '@/app/layout-wrapper';
import LoanSidebar from '@/components/loan/LoanSidebar';
import { COLORS } from '@/app/theme/colors';

// Define review types
type ReviewType = 'initial_inquiry' | 'application' | 'property_evaluation' | 'underwriting' | 'closing_prep' | 'closing' | 'post_closing' | 'servicing';

export default function LoanReviewPage() {
  const params = useParams();
  const router = useRouter();
  const loanId = params.loanId as string;
  
  const [loan, setLoan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ReviewType>('initial_inquiry');
  
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
    initial_inquiry: {
      status: 'incomplete',
      items: [
        { id: 1, name: 'Borrower Eligibility', status: 'complete' },
        { id: 2, name: 'Property Preliminary Assessment', status: 'incomplete' },
        { id: 3, name: 'Loan Parameters', status: 'incomplete' }
      ]
    },
    application: {
      status: 'not_started',
      items: [
        { id: 1, name: 'Borrower Financial Verification', status: 'not_started' },
        { id: 2, name: 'Entity Verification', status: 'not_started' },
        { id: 3, name: 'Property Documentation Review', status: 'not_started' }
      ]
    },
    property_evaluation: {
      status: 'not_started',
      items: [
        { id: 1, name: 'Appraisal Review', status: 'not_started' },
        { id: 2, name: 'Property Condition Assessment', status: 'not_started' },
        { id: 3, name: 'Renovation/Construction Review', status: 'not_started' },
        { id: 4, name: 'Rental Property Assessment', status: 'not_started' }
      ]
    },
    underwriting: {
      status: 'not_started',
      items: [
        { id: 1, name: 'Final Loan-to-Value Analysis', status: 'not_started' },
        { id: 2, name: 'Cash Flow Analysis', status: 'not_started' },
        { id: 3, name: 'Exit Strategy Verification', status: 'not_started' },
        { id: 4, name: 'Risk Assessment & Mitigants', status: 'not_started' },
        { id: 5, name: 'State-Specific Compliance', status: 'not_started' },
        { id: 6, name: 'Exception Analysis', status: 'not_started' }
      ]
    },
    closing_prep: {
      status: 'not_started',
      items: [
        { id: 1, name: 'Document Preparation', status: 'not_started' },
        { id: 2, name: 'Title & Insurance Verification', status: 'not_started' },
        { id: 3, name: 'Closing Logistics', status: 'not_started' }
      ]
    },
    closing: {
      status: 'not_started',
      items: [
        { id: 1, name: 'Document Execution', status: 'not_started' },
        { id: 2, name: 'Funding Authorization', status: 'not_started' },
        { id: 3, name: 'Recording & Security Verification', status: 'not_started' }
      ]
    },
    post_closing: {
      status: 'not_started',
      items: [
        { id: 1, name: 'File Completeness', status: 'not_started' },
        { id: 2, name: 'Policy Adherence', status: 'not_started' },
        { id: 3, name: 'Data Integrity', status: 'not_started' }
      ]
    },
    servicing: {
      status: 'not_started',
      items: [
        { id: 1, name: 'Loan Boarding', status: 'not_started' },
        { id: 2, name: 'Ongoing Monitoring Checks', status: 'not_started' }
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
              defaultValue="initial_inquiry" 
              onValueChange={(value) => setActiveTab(value as ReviewType)}
              className="bg-[#1A2234] p-4 rounded-lg border border-gray-800"
            >
              <div className="flex justify-center mb-4">
                <TabsList className="grid grid-cols-4 bg-[#0A0F1A] p-0 rounded-lg">
                  <TabsTrigger 
                    value="initial_inquiry" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Initial Inquiry
                  </TabsTrigger>
                  <TabsTrigger 
                    value="application" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <FileCheck className="h-4 w-4 mr-2" />
                    Application
                  </TabsTrigger>
                  <TabsTrigger 
                    value="property_evaluation" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Property
                  </TabsTrigger>
                  <TabsTrigger 
                    value="underwriting" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Underwriting
                  </TabsTrigger>
                  <TabsTrigger 
                    value="closing_prep" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Closing Prep
                  </TabsTrigger>
                  <TabsTrigger 
                    value="closing" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <FileSignature className="h-4 w-4 mr-2" />
                    Closing
                  </TabsTrigger>
                  <TabsTrigger 
                    value="post_closing" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Post-Closing
                  </TabsTrigger>
                  <TabsTrigger 
                    value="servicing" 
                    className="text-base px-6 py-3 rounded-md data-[state=active]:bg-blue-900/70 data-[state=active]:text-blue-300 transition-all"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Servicing
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Initial Inquiry Tab */}
              <TabsContent value="initial_inquiry">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Initial Inquiry & Pre-Qualification</h2>
                      <p className="text-sm text-gray-400">
                        Review borrower eligibility and property preliminary assessment
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Status:</span>
                      <span className="flex items-center text-yellow-500">
                        {getStatusIcon(mockReviewData.initial_inquiry.status)}
                        <span className="ml-1">{getStatusText(mockReviewData.initial_inquiry.status)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {mockReviewData.initial_inquiry.items.map((item) => (
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
              
              {/* Application Tab */}
              <TabsContent value="application">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Application & Initial Underwriting</h2>
                      <p className="text-sm text-gray-400">
                        Review borrower financial verification and property documentation
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Status:</span>
                      <span className="flex items-center text-gray-400">
                        {getStatusIcon(mockReviewData.application.status)}
                        <span className="ml-1">{getStatusText(mockReviewData.application.status)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {mockReviewData.application.items.map((item) => (
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
              
              {/* Property Evaluation Tab */}
              <TabsContent value="property_evaluation">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Property & Project Evaluation</h2>
                      <p className="text-sm text-gray-400">
                        Review property condition, appraisal, and renovation plans
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Status:</span>
                      <span className="flex items-center text-gray-400">
                        {getStatusIcon(mockReviewData.property_evaluation.status)}
                        <span className="ml-1">{getStatusText(mockReviewData.property_evaluation.status)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {mockReviewData.property_evaluation.items.map((item) => (
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
              
              {/* Underwriting Tab */}
              <TabsContent value="underwriting">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Comprehensive Underwriting</h2>
                      <p className="text-sm text-gray-400">
                        Review final loan analysis, risk assessment, and compliance
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Status:</span>
                      <span className="flex items-center text-gray-400">
                        {getStatusIcon(mockReviewData.underwriting.status)}
                        <span className="ml-1">{getStatusText(mockReviewData.underwriting.status)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {mockReviewData.underwriting.items.map((item) => (
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
              
              {/* Closing Prep Tab */}
              <TabsContent value="closing_prep">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Closing Preparation</h2>
                      <p className="text-sm text-gray-400">
                        Review document preparation and closing logistics
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Status:</span>
                      <span className="flex items-center text-gray-400">
                        {getStatusIcon(mockReviewData.closing_prep.status)}
                        <span className="ml-1">{getStatusText(mockReviewData.closing_prep.status)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {mockReviewData.closing_prep.items.map((item) => (
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
              
              {/* Closing Tab */}
              <TabsContent value="closing">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Closing & Funding</h2>
                      <p className="text-sm text-gray-400">
                        Review document execution and funding authorization
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Status:</span>
                      <span className="flex items-center text-gray-400">
                        {getStatusIcon(mockReviewData.closing.status)}
                        <span className="ml-1">{getStatusText(mockReviewData.closing.status)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {mockReviewData.closing.items.map((item) => (
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
              
              {/* Post-Closing Tab */}
              <TabsContent value="post_closing">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Post-Closing Quality Control</h2>
                      <p className="text-sm text-gray-400">
                        Review file completeness and policy adherence
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Status:</span>
                      <span className="flex items-center text-gray-400">
                        {getStatusIcon(mockReviewData.post_closing.status)}
                        <span className="ml-1">{getStatusText(mockReviewData.post_closing.status)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {mockReviewData.post_closing.items.map((item) => (
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
              
              {/* Servicing Tab */}
              <TabsContent value="servicing">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Servicing Setup & Monitoring</h2>
                      <p className="text-sm text-gray-400">
                        Review loan boarding and ongoing monitoring setup
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 mr-2">Status:</span>
                      <span className="flex items-center text-gray-400">
                        {getStatusIcon(mockReviewData.servicing.status)}
                        <span className="ml-1">{getStatusText(mockReviewData.servicing.status)}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {mockReviewData.servicing.items.map((item) => (
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