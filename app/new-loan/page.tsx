"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// You need to create this file if it doesn't exist
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LayoutWrapper from "../layout-wrapper";
import SimpleDocumentUploader from "@/components/document/SimpleDocumentUploader";
import { LoanType, PropertyType, ExitStrategy, OriginationType, OriginatorInfo } from "@/utilities/loanGenerator";
import { loanDatabase } from "@/utilities/loanDatabase";
import { useRouter } from "next/navigation";
import { InfoIcon } from "lucide-react";

// Custom Switch component to avoid import issues
interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({ id, checked, onCheckedChange, disabled = false }) => {
  const handleClick = () => {
    if (!disabled) {
      onCheckedChange(!checked);
    }
  };

  return (
    <div
      id={id}
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      aria-disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-blue-600" : "bg-gray-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      onClick={handleClick}
    >
      <span
        data-state={checked ? "checked" : "unchecked"}
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </div>
  );
};

export default function NewLoanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [originationType, setOriginationType] = useState<OriginationType>("internal");
  
  // Basic loan data (common to both originator and underwriter)
  const [loanData, setLoanData] = useState({
    borrowerName: "",
    borrowerEmail: "",
    borrowerExperience: "",
    loanAmount: "",
    interestRate: "",
    originationFee: "",
    loanTerm: "",
    loanType: "" as LoanType,
    propertyAddress: "",
    propertyType: "" as PropertyType,
    purchasePrice: "",
    afterRepairValue: "",
    rehabBudget: "",
    exitStrategy: "" as ExitStrategy,
  });
  
  // External originator data
  const [originatorInfo, setOriginatorInfo] = useState<Partial<OriginatorInfo>>({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    referralFee: undefined,
  });
  
  // Internal underwriter data
  const [underwriterName, setUnderwriterName] = useState("");
  
  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setLoanData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleOriginatorInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setOriginatorInfo((prev) => ({ ...prev, [name]: value }));
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
      loanTerm: parseInt(loanData.loanTerm) || 12,
      loanType: loanData.loanType || "fix_and_flip",
      propertyAddress: loanData.propertyAddress,
      propertyType: loanData.propertyType || "single_family",
      purchasePrice: parseFloat(loanData.purchasePrice) || 0,
      afterRepairValue: parseFloat(loanData.afterRepairValue) || 0,
      rehabBudget: parseFloat(loanData.rehabBudget) || 0,
      exitStrategy: loanData.exitStrategy || "sale",
      originationType: originationType,
      // Add originator info if external
      originatorInfo: originationType === "external" ? {
        companyName: originatorInfo.companyName || "",
        contactName: originatorInfo.contactName || "",
        contactEmail: originatorInfo.contactEmail || "",
        contactPhone: originatorInfo.contactPhone || "",
        referralFee: parseFloat(originatorInfo.referralFee?.toString() || "0") || 0,
      } : undefined,
      // Add underwriter name if internal
      underwriterName: originationType === "internal" ? underwriterName : undefined,
    });

    setLoading(false);

    // Redirect to the loan details page
    router.push(`/loans/${newLoan.id}`);
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-2xl font-bold mb-6">Create New Hard Money Loan</h1>
        
        {/* Origination Type Toggle */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Loan Origination Type</CardTitle>
            <CardDescription>
              Select whether this loan is being originated internally or by an external partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="origination-type" 
                  checked={originationType === "external"}
                  onCheckedChange={(checked: boolean) => setOriginationType(checked ? "external" : "internal")}
                />
                <Label htmlFor="origination-type">
                  {originationType === "external" ? "External Originator" : "Internal Origination"}
                </Label>
              </div>
              <div className="text-sm text-gray-500 flex items-center">
                <InfoIcon size={16} className="mr-1" />
                {originationType === "external" 
                  ? "Loan originated by an external partner" 
                  : "Loan originated by our company"}
              </div>
            </div>
          </CardContent>
        </Card>

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
                      <Label htmlFor="loanTerm">Loan Term (months)</Label>
                      <Select 
                        value={loanData.loanTerm || undefined} 
                        onValueChange={(value: string) => 
                          setLoanData((prev) => ({ ...prev, loanTerm: value }))
                        }
                      >
                        <SelectTrigger id="loanTerm" className="w-full">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="9">9 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="18">18 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="36">36 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div>
                    <Label htmlFor="propertyAddress">Property Address</Label>
                    <Input
                      id="propertyAddress"
                      name="propertyAddress"
                      value={loanData.propertyAddress}
                      onChange={handleInputChange}
                      placeholder=""
                    />
                  </div>

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
                </div>
              </CardContent>
            </Card>
            
            {/* Originator/Underwriter Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>
                  {originationType === "external" ? "Originator Information" : "Underwriter Information"}
                </CardTitle>
                <CardDescription>
                  {originationType === "external" 
                    ? "Information about the external originator" 
                    : "Information about the internal underwriter"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {originationType === "external" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={originatorInfo.companyName}
                          onChange={handleOriginatorInfoChange}
                          placeholder=""
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactName">Contact Name</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          value={originatorInfo.contactName}
                          onChange={handleOriginatorInfoChange}
                          placeholder=""
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          value={originatorInfo.contactEmail}
                          onChange={handleOriginatorInfoChange}
                          placeholder=""
                          type="email"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          value={originatorInfo.contactPhone}
                          onChange={handleOriginatorInfoChange}
                          placeholder=""
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="referralFee">Referral Fee (%)</Label>
                      <Input
                        id="referralFee"
                        name="referralFee"
                        value={originatorInfo.referralFee?.toString() || ""}
                        onChange={handleOriginatorInfoChange}
                        placeholder=""
                        type="number"
                        step="0.25"
                        min="0"
                        max="10"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="underwriterName">Underwriter Name</Label>
                    <Input
                      id="underwriterName"
                      name="underwriterName"
                      value={underwriterName}
                      onChange={(e) => setUnderwriterName(e.target.value)}
                      placeholder=""
                      required
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Document Upload and Submit */}
          <div className="lg:col-span-1">
            {/* Document Upload Section - Only for External Originators */}
            {originationType === "external" && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Upload Documents</CardTitle>
                  <CardDescription>
                    Upload required documents for this loan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SimpleDocumentUploader 
                    loanId="new" 
                    onUploadComplete={(docs) => setUploadedDocuments(docs)}
                  />
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Card>
              <CardHeader>
                <CardTitle>Create Loan</CardTitle>
                <CardDescription>
                  Review the information and create the loan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleLoanCreation}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Loan"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}