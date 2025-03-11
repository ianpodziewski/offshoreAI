"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LayoutWrapper from '../layout-wrapper';
import SimpleDocumentUploader from '@/components/document/SimpleDocumentUploader';
import { LoanType, PropertyType, ExitStrategy } from '@/utilities/loanGenerator';
import { loanDatabase } from '@/utilities/loanDatabase';
import { useRouter } from 'next/navigation';

export default function NewLoanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loanData, setLoanData] = useState({
    borrowerName: '',
    borrowerEmail: '',
    borrowerExperience: '',
    loanAmount: '',
    interestRate: '',
    originationFee: '',
    loanType: 'fix_and_flip' as LoanType,
    propertyAddress: '',
    propertyType: 'single_family' as PropertyType,
    purchasePrice: '',
    afterRepairValue: '',
    rehabBudget: '',
    exitStrategy: 'sale' as ExitStrategy
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
      borrowerEmail: loanData.borrowerEmail || '',
      borrowerExperience: loanData.borrowerExperience || 'Beginner (0-1 projects)',
      loanAmount: parseFloat(loanData.loanAmount) || 250000,
      interestRate: parseFloat(loanData.interestRate) || 10,
      originationFee: parseFloat(loanData.originationFee) || 3,
      loanType: loanData.loanType,
      propertyAddress: loanData.propertyAddress,
      propertyType: loanData.propertyType,
      purchasePrice: parseFloat(loanData.purchasePrice) || 0,
      afterRepairValue: parseFloat(loanData.afterRepairValue) || 0,
      rehabBudget: parseFloat(loanData.rehabBudget) || 0,
      exitStrategy: loanData.exitStrategy
    });
    
    setLoading(false);
    
    // Redirect to the loan details page
    router.push(`/loans/${newLoan.id}`);
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Create New Hard Money Loan</h1>
        
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
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="borrowerEmail">Borrower Email</Label>
                      <Input 
                        id="borrowerEmail" 
                        name="borrowerEmail" 
                        value={loanData.borrowerEmail} 
                        onChange={handleInputChange}
                        placeholder="john.doe@example.com"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="borrowerExperience">Borrower Experience</Label>
                      <select 
                        id="borrowerExperience" 
                        name="borrowerExperience"
                        value={loanData.borrowerExperience}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 py-2 border rounded-md"
                      >
                        <option value="Beginner (0-1 projects)">Beginner (0-1 projects)</option>
                        <option value="Intermediate (2-5 projects)">Intermediate (2-5 projects)</option>
                        <option value="Experienced (6-10 projects)">Experienced (6-10 projects)</option>
                        <option value="Expert (10+ projects)">Expert (10+ projects)</option>
                      </select>
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
                        <option value="fix_and_flip">Fix and Flip</option>
                        <option value="bridge">Bridge Loan</option>
                        <option value="construction">Construction</option>
                        <option value="rehab">Rehab</option>
                        <option value="rental">Rental</option>
                        <option value="commercial">Commercial</option>
                        <option value="land">Land</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                      <Input 
                        id="loanAmount" 
                        name="loanAmount" 
                        value={loanData.loanAmount} 
                        onChange={handleInputChange}
                        placeholder="250,000"
                        type="number"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input 
                        id="interestRate" 
                        name="interestRate" 
                        value={loanData.interestRate} 
                        onChange={handleInputChange}
                        placeholder="10"
                        type="number"
                        step="0.25"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="originationFee">Origination Fee (%)</Label>
                      <Input 
                        id="originationFee" 
                        name="originationFee" 
                        value={loanData.originationFee} 
                        onChange={handleInputChange}
                        placeholder="3"
                        type="number"
                        step="0.25"
                        min="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="propertyType">Property Type</Label>
                      <select 
                        id="propertyType" 
                        name="propertyType" 
                        value={loanData.propertyType}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 py-2 border rounded-md"
                      >
                        <option value="single_family">Single Family</option>
                        <option value="multi_family">Multi-Family</option>
                        <option value="condo">Condo</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="commercial">Commercial</option>
                        <option value="mixed_use">Mixed Use</option>
                        <option value="land">Land</option>
                        <option value="industrial">Industrial</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="purchasePrice">Purchase Price ($)</Label>
                      <Input 
                        id="purchasePrice" 
                        name="purchasePrice" 
                        value={loanData.purchasePrice} 
                        onChange={handleInputChange}
                        placeholder="300,000"
                        type="number"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="afterRepairValue">After Repair Value ($)</Label>
                      <Input 
                        id="afterRepairValue" 
                        name="afterRepairValue" 
                        value={loanData.afterRepairValue} 
                        onChange={handleInputChange}
                        placeholder="400,000"
                        type="number"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rehabBudget">Rehab Budget ($)</Label>
                      <Input 
                        id="rehabBudget" 
                        name="rehabBudget" 
                        value={loanData.rehabBudget} 
                        onChange={handleInputChange}
                        placeholder="50,000"
                        type="number"
                        min="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="exitStrategy">Exit Strategy</Label>
                      <select 
                        id="exitStrategy" 
                        name="exitStrategy" 
                        value={loanData.exitStrategy}
                        onChange={handleInputChange}
                        className="w-full h-10 px-3 py-2 border rounded-md"
                      >
                        <option value="sale">Sale</option>
                        <option value="refinance">Refinance</option>
                        <option value="rental">Rental</option>
                        <option value="development">Development</option>
                        <option value="other">Other</option>
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
                      required
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
              disabled={loading || !loanData.borrowerName || !loanData.propertyAddress}
              className="w-full"
            >
              {loading ? "Creating..." : "Create Hard Money Loan"}
            </Button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}