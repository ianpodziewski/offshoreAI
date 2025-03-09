// app/loans/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowRight, Plus, RefreshCw } from 'lucide-react';
import LayoutWrapper from '../layout-wrapper';
import { LoanData } from '@/utilities/loanGenerator';
import { loanDatabase } from '@/utilities/loanDatabase';
import { generateLoan } from '@/utilities/loanGenerator';

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchLoans = async () => {
    setLoading(true);
    try {
      // Initialize database if needed
      loanDatabase.initialize();
      const fetchedLoans = loanDatabase.getLoans();
      setLoans(fetchedLoans);
    } catch (error) {
      console.error('Error fetching loans:', error);
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
    const newLoan = loanDatabase.addLoan(generateLoan());
    fetchLoans();
  };
  
  return (
    <LayoutWrapper>
      <div className="container mx-auto py-16 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Loan Management</h1>
          <div className="flex gap-3">
            <Button 
              onClick={resetDatabase} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Reset Database
            </Button>
            <Button 
              onClick={createNewLoan}
              className="flex items-center gap-2 bg-blue-500 text-white"
            >
              <Plus size={16} />
              Create New Loan
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading loans...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loans.map((loan) => (
              <Card key={loan.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="flex justify-between items-center">
                    <span className="text-lg truncate">{loan.borrowerName}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
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
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Loan Amount</p>
                      <p className="font-medium">${loan.loanAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Interest Rate</p>
                      <p className="font-medium">{loan.interestRate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Loan Type</p>
                      <p className="font-medium">{loan.loanType.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date Created</p>
                      <p className="font-medium">{new Date(loan.dateCreated).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-gray-500 text-sm mb-1">Property</p>
                    <p className="text-sm truncate">{loan.propertyAddress}</p>
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <Link 
                      href={`/loans/${loan.id}`}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      View Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}