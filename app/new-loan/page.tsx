// app/documents/page.tsx (renamed to app/new-loan/page.tsx)
"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LayoutWrapper from '../layout-wrapper';
import SimpleDocumentUploader from '@/components/document/SimpleDocumentUploader';
import { LoanData } from '@/utilities/loanGenerator';
import { loanDatabase } from '@/utilities/loanDatabase';
import { useRouter } from 'next/navigation';

export default function NewLoanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loanData, setLoanData] = useState({
    borrowerName: '',
    loanAmount: '',
    interestRate: '',
    loanType: 'conventional',
    propertyAddress: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLoanData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoanCreation = () => {
    setLoading(true);
    
    // Create a new loan with the entered data
    const newLoan = loanDatabase.addLoan({
      ...loanDatabase.generateLoan(), // Generate default values
      borrowerName: loanData.borrowerName,
      loanAmount: parseFloat(loanData.loanAmount) || 250000,
      interestRate: parseFloat(loanData.interestRate) || 4.5,
      loanType: loanData.loanType as any,
      propertyAddress: loanData.propertyAddress
    });
    
    setLoading(false);
    
    // Redirect to the loan details page
    router.push(`/loans/${newLoan.id}`);
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Create New Loan</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loan Information Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Loan Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="borrowerName">Borrower Name</Label>
                      <Input 
                        id="borrowerName" 
                        name="borrowerName" 
                        value={loanData.borrowerName} 
                        onChange={handleInputChange}
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                      <Input 
                        id="loanAmount" 
                        name="loanAmount" 
                        value={loanData.loanAmount} 
                        onChange={handleInputChange}
                        placeholder="250000"
                        type="number"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input 
                        id="interestRate" 
                        name="interestRate" 
                        value={loanData.interestRate} 
                        onChange={handleInputChange}
                        placeholder="4.5"
                        type="number"
                        step="0.125"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="loanType">Loan Type</Label>
                      <select 
                        id="loanType" 
                        name="loanType" 
                        value={loanData.loanType}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 py-2 border rounded-md"
                      >
                        <option value="conventional">Conventional</option>
                        <option value="fha">FHA</option>
                        <option value="va">VA</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="propertyAddress">Property Address</Label>
                    <Input 
                      id="propertyAddress" 
                      name="propertyAddress" 
                      value={loanData.propertyAddress} 
                      onChange={handleInputChange}
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Document Uploader */}
          <div>
            <div className="mb-4">
              <SimpleDocumentUploader 
                loanId="temp" 
                onUploadComplete={(doc) => {
                  // Store in local state to attach to loan after creation
                  console.log("Document uploaded:", doc);
                }}
              />
            </div>
            
            <Button 
              onClick={handleLoanCreation}
              disabled={loading || !loanData.borrowerName}
              className="w-full"
            >
              {loading ? "Creating..." : "Create Loan"}
            </Button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}