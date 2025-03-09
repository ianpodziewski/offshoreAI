// app/loans/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Save, User, Calendar, DollarSign, Home, FileCheck, Clock } from 'lucide-react';
import LayoutWrapper from '../../layout-wrapper';
import { LoanData } from '@/utilities/loanGenerator';
import { loanDatabase } from '@/utilities/loanDatabase';
import StatusBadge from '@/components/document/status-badge';
import Link from 'next/link';

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loan, setLoan] = useState<LoanData | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLoan = async () => {
      setLoading(true);
      try {
        if (params?.id) {
          const loanId = String(params.id);
          const fetchedLoan = loanDatabase.getLoanById(loanId);
          setLoan(fetchedLoan);
        }
      } catch (error) {
        console.error('Error fetching loan details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoan();
  }, [params?.id]);
  
  if (loading) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-16 px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="ml-3 text-gray-600">Loading loan details...</p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }
  
  if (!loan) {
    return (
      <LayoutWrapper>
        <div className="container mx-auto py-16 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Loan Not Found</h2>
            <p className="text-gray-600 mb-6">The loan you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push('/loans')}>
              <ArrowLeft size={16} className="mr-2" />
              Back to Loans
            </Button>
          </div>
        </div>
      </LayoutWrapper>
    );
  }
  
  return (
    <LayoutWrapper>
      <div className="container mx-auto py-16 px-4">
        <div className="mb-6">
          <button 
            onClick={() => router.push('/loans')} 
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Loans
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loan Overview */}
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader className="bg-gray-50 border-b flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-lg">{loan.borrowerName}'s Loan Application</CardTitle>
                  <p className="text-sm text-gray-500">ID: {loan.id}</p>
                </div>
                <div>
                  <StatusBadge status={loan.status} size="lg" showLabel={true} />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Borrower Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <User size={16} />
                      Borrower Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Borrower Name</p>
                        <p className="font-medium">{loan.borrowerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{loan.borrowerEmail}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Loan Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <DollarSign size={16} />
                      Loan Details
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Loan Amount</p>
                        <p className="font-medium">${loan.loanAmount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Interest Rate</p>
                        <p className="font-medium">{loan.interestRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Loan Term</p>
                        <p className="font-medium">{loan.loanTerm / 12} years</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Loan Type</p>
                        <p className="font-medium">{loan.loanType.toUpperCase()}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Property Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Home size={16} />
                      Property Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Property Address</p>
                        <p className="font-medium">{loan.propertyAddress}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Property Type</p>
                        <p className="font-medium">{loan.propertyType.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Appraised Value</p>
                        <p className="font-medium">${loan.appraisalValue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar size={16} />
                      Timeline
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Date Created</p>
                        <p className="font-medium">{new Date(loan.dateCreated).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Last Modified</p>
                        <p className="font-medium">{new Date(loan.dateModified).toLocaleDateString()}</p>
                      </div>
                      {loan.closingDate && (
                        <div>
                          <p className="text-sm text-gray-500">Closing Date</p>
                          <p className="font-medium">{new Date(loan.closingDate).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Assigned Staff */}
                {loan.underwriter && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-3">Assigned Staff</h3>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-medium">{loan.underwriter}</p>
                        <p className="text-sm text-gray-500">Underwriter</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Document List */}
          <div>
            <Card className="shadow-md">
              <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-lg">Loan Documents</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {loan.documents.map((category, i) => (
                  <div key={i} className="mb-4">
                    <h3 className="font-medium text-gray-700 capitalize mb-2">{category.category} Documents</h3>
                    <ul className="space-y-2">
                      {category.files.map((file, j) => (
                        <li key={j} className="border rounded p-3 hover:bg-gray-50">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <FileText size={14} className="text-gray-500 mr-2" />
                              <span className="text-sm">{file.filename}</span>
                            </div>
                            <StatusBadge status={file.status} size="sm" />
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              <Clock size={12} className="inline mr-1" />
                              {new Date(file.uploadDate).toLocaleDateString()}
                            </span>
                            {file.url ? (
                              <Link 
                                href={file.url}
                                className="text-xs text-blue-600 hover:underline flex items-center"
                                target="_blank"
                              >
                                <FileCheck size={12} className="mr-1" />
                                View
                              </Link>
                            ) : (
                              <span className="text-xs text-gray-400">No preview</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
              <CardFooter className="bg-gray-50 border-t p-4">
                <Button className="w-full">
                  <ArrowLeft size={16} className="mr-2" />
                  Upload New Document
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}