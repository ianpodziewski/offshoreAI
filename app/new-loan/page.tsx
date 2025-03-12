"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// You need to create this file if it doesn't exist
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LayoutWrapper from "../layout-wrapper";
import SimpleDocumentUploader from "@/components/document/SimpleDocumentUploader";
import { LoanType, PropertyType, ExitStrategy } from "@/utilities/loanGenerator";
import { loanDatabase } from "@/utilities/loanDatabase";
import { useRouter } from "next/navigation";

export default function NewLoanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loanData, setLoanData] = useState({
    borrowerName: "",
    borrowerEmail: "",
    borrowerExperience: "",
    loanAmount: "",
    interestRate: "",
    originationFee: "",
    loanType: "" as LoanType,
    propertyAddress: "",
    propertyType: "" as PropertyType,
    purchasePrice: "",
    afterRepairValue: "",
    rehabBudget: "",
    exitStrategy: "" as ExitStrategy,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLoanData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoanCreation = () => {
    setLoading(true);

    // Create a new loan with the entered data
    const newLoan = loanDatabase.addLoan({
      ...loanDatabase.generateLoan(), // generate default values
      borrowerName: loanData.borrowerName,
      borrowerEmail: loanData.borrowerEmail || "",
      borrowerExperience: loanData.borrowerExperience || "Beginner (0-1 projects)",
      loanAmount: parseFloat(loanData.loanAmount) || 250000,
      interestRate: parseFloat(loanData.interestRate) || 10,
      originationFee: parseFloat(loanData.originationFee) || 3,
      loanType: loanData.loanType || "fix_and_flip",
      propertyAddress: loanData.propertyAddress,
      propertyType: loanData.propertyType || "single_family",
      purchasePrice: parseFloat(loanData.purchasePrice) || 0,
      afterRepairValue: parseFloat(loanData.afterRepairValue) || 0,
      rehabBudget: parseFloat(loanData.rehabBudget) || 0,
      exitStrategy: loanData.exitStrategy || "sale",
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
                        placeholder=""
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
                        placeholder=""
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="borrowerExperience">Borrower Experience</Label>
                      <Select 
                        value={loanData.borrowerExperience || undefined} 
                        onValueChange={(value: string) => 
                          setLoanData((prev) => ({ ...prev, borrowerExperience: value }))
                        }
                      >
                        <SelectTrigger id="borrowerExperience" className="w-full">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner (0-1 projects)">Beginner (0-1 projects)</SelectItem>
                          <SelectItem value="Intermediate (2-5 projects)">Intermediate (2-5 projects)</SelectItem>
                          <SelectItem value="Experienced (6-10 projects)">Experienced (6-10 projects)</SelectItem>
                          <SelectItem value="Expert (10+ projects)">Expert (10+ projects)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="loanType">Loan Type</Label>
                      <Select 
                        value={loanData.loanType || undefined} 
                        onValueChange={(value: string) => 
                          setLoanData((prev) => ({ ...prev, loanType: value as LoanType }))
                        }
                      >
                        <SelectTrigger id="loanType" className="w-full">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fix_and_flip">Fix and Flip</SelectItem>
                          <SelectItem value="bridge">Bridge Loan</SelectItem>
                          <SelectItem value="construction">Construction</SelectItem>
                          <SelectItem value="rehab">Rehab</SelectItem>
                          <SelectItem value="rental">Rental</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                        </SelectContent>
                      </Select>
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
                        placeholder=""
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
                        placeholder=""
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
                        placeholder=""
                        type="number"
                        step="0.25"
                        min="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select 
                        value={loanData.propertyType || undefined} 
                        onValueChange={(value: string) => 
                          setLoanData((prev) => ({ ...prev, propertyType: value as PropertyType }))
                        }
                      >
                        <SelectTrigger id="propertyType" className="w-full">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single_family">Single Family</SelectItem>
                          <SelectItem value="multi_family">Multi-Family</SelectItem>
                          <SelectItem value="condo">Condo</SelectItem>
                          <SelectItem value="townhouse">Townhouse</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="mixed_use">Mixed Use</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                        </SelectContent>
                      </Select>
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
                        placeholder=""
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
                        placeholder=""
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
                        placeholder=""
                        type="number"
                        min="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="exitStrategy">Exit Strategy</Label>
                      <Select 
                        value={loanData.exitStrategy || undefined} 
                        onValueChange={(value: string) => 
                          setLoanData((prev) => ({ ...prev, exitStrategy: value as ExitStrategy }))
                        }
                      >
                        <SelectTrigger id="exitStrategy" className="w-full">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sale">Sale</SelectItem>
                          <SelectItem value="refinance">Refinance</SelectItem>
                          <SelectItem value="rental">Rental</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="propertyAddress">Property Address</Label>
                    <Input
                      id="propertyAddress"
                      name="propertyAddress"
                      value={loanData.propertyAddress}
                      onChange={handleInputChange}
                      placeholder=""
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