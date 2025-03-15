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
import { InfoIcon, ArrowRight, Check, FileText, AlertCircle } from "lucide-react";

// Define a consistent color palette based on dashboard and loans pages
const COLORS = {
  // Primary UI colors
  primary: "#3B82F6", // Blue primary accent (blue-500)
  secondary: "#6B7280", // Gray secondary accent (gray-500)

  // Background colors
  bgDark: "#111827", // Card/container background (gray-900)
  bgDarker: "#0F1629", // Map/chart background (darker than gray-900)
  bgHeader: "rgba(31, 41, 55, 0.7)", // Header background (gray-800/70)
  bgHover: "rgba(31, 41, 55, 0.5)", // Hover state (gray-800/50)
  bgButton: "rgba(31, 41, 55, 0.3)", // Button background (gray-800/30)

  // Border colors
  border: "#1F2937", // Border color (gray-800)
  borderAccent: "#3B82F6", // Accent border (blue-500)

  // Text colors
  textPrimary: "#F3F4F6", // Primary text (gray-200)
  textSecondary: "#D1D5DB", // Secondary text (gray-300)
  textMuted: "#6B7280", // Muted text (gray-500)
  textAccent: "#60A5FA", // Accent text (blue-400)

  // Status colors
  status: {
    approved: "#10B981", // Approved status (green-400)
    approvedBg: "rgba(6, 78, 59, 0.3)", // Approved bg (green-900/30)
    pending: "#FBBF24", // Pending/in-review status (yellow-400)
    pendingBg: "rgba(120, 53, 15, 0.3)", // Pending bg (yellow-900/30)
    rejected: "#F87171", // Rejected status (red-400)
    rejectedBg: "rgba(127, 29, 29, 0.3)" // Rejected bg (red-900/30)
  },
};

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
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

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

  // Handle document drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      if (droppedFile.type !== "application/pdf") {
        setDocumentError("Please drop a PDF file");
        return;
      }
      
      setDocumentFile(droppedFile);
      setDocumentError(null);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (selectedFile.type !== "application/pdf") {
        setDocumentError("Please select a PDF file");
        setDocumentFile(null);
        return;
      }
      
      setDocumentFile(selectedFile);
      setDocumentError(null);
    }
  };

  const handleLoanCreation = async () => {
    setLoading(true);

    try {
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

      // Process document if one was uploaded
      if (documentFile) {
        try {
          // Import the document service dynamically to avoid issues
          const { simpleDocumentService } = await import('@/utilities/simplifiedDocumentService');
          await simpleDocumentService.addDocument(documentFile, newLoan.id);
        } catch (docError) {
          console.error("Error processing document:", docError);
          // Continue with loan creation even if document processing fails
        }
      }

      // Redirect to the loan details page
      router.push(`/loans/${newLoan.id}`);
    } catch (error) {
      console.error("Error creating loan:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutWrapper>
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-100">Create New Hard Money Loan</h1>
          <Button 
            onClick={() => router.push('/loans')}
            variant="outline" 
            className="border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 text-gray-300"
          >
            Back to Loans
          </Button>
        </div>
        
        {/* Origination Type Toggle */}
        <Card className="mb-6 border border-gray-800 bg-gray-900 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-100">Loan Origination Type</CardTitle>
            <CardDescription className="text-gray-400">
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
                <Label htmlFor="origination-type" className="text-gray-200">
                  {originationType === "external" ? "External Originator" : "Internal Origination"}
                </Label>
              </div>
              <div className="text-sm text-gray-400 flex items-center">
                <InfoIcon size={16} className="mr-1 text-blue-400" />
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
            <Card className="border border-gray-800 bg-gray-900 shadow-md">
              <CardHeader className="border-b border-gray-800 bg-gray-800/70 pb-3">
                <CardTitle className="text-gray-100">Loan Details</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="borrowerName" className="text-gray-300 mb-1.5 block">Borrower Name</Label>
                      <Input
                        id="borrowerName"
                        name="borrowerName"
                        value={loanData.borrowerName}
                        onChange={handleInputChange}
                        placeholder=""
                        required
                        className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="borrowerEmail" className="text-gray-300 mb-1.5 block">Borrower Email</Label>
                      <Input
                        id="borrowerEmail"
                        name="borrowerEmail"
                        value={loanData.borrowerEmail}
                        onChange={handleInputChange}
                        placeholder=""
                        type="email"
                        className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="borrowerExperience" className="text-gray-300 mb-1.5 block">Borrower Experience</Label>
                      <Select 
                        value={loanData.borrowerExperience || undefined} 
                        onValueChange={(value: string) => 
                          setLoanData((prev) => ({ ...prev, borrowerExperience: value }))
                        }
                      >
                        <SelectTrigger id="borrowerExperience" className="w-full bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                          <SelectItem value="Beginner (0-1 projects)">Beginner (0-1 projects)</SelectItem>
                          <SelectItem value="Intermediate (2-5 projects)">Intermediate (2-5 projects)</SelectItem>
                          <SelectItem value="Experienced (6-10 projects)">Experienced (6-10 projects)</SelectItem>
                          <SelectItem value="Expert (10+ projects)">Expert (10+ projects)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="loanType" className="text-gray-300 mb-1.5 block">Loan Type</Label>
                      <Select 
                        value={loanData.loanType || undefined} 
                        onValueChange={(value: string) => 
                          setLoanData((prev) => ({ ...prev, loanType: value as LoanType }))
                        }
                      >
                        <SelectTrigger id="loanType" className="w-full bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="loanAmount" className="text-gray-300 mb-1.5 block">Loan Amount ($)</Label>
                      <Input
                        id="loanAmount"
                        name="loanAmount"
                        value={loanData.loanAmount}
                        onChange={handleInputChange}
                        placeholder=""
                        type="number"
                        min="0"
                        className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="interestRate" className="text-gray-300 mb-1.5 block">Interest Rate (%)</Label>
                      <Input
                        id="interestRate"
                        name="interestRate"
                        value={loanData.interestRate}
                        onChange={handleInputChange}
                        placeholder=""
                        type="number"
                        step="0.25"
                        min="0"
                        className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="originationFee" className="text-gray-300 mb-1.5 block">Origination Fee (%)</Label>
                      <Input
                        id="originationFee"
                        name="originationFee"
                        value={loanData.originationFee}
                        onChange={handleInputChange}
                        placeholder=""
                        type="number"
                        step="0.25"
                        min="0"
                        className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="loanTerm" className="text-gray-300 mb-1.5 block">Loan Term (months)</Label>
                      <Select 
                        value={loanData.loanTerm || undefined} 
                        onValueChange={(value: string) => 
                          setLoanData((prev) => ({ ...prev, loanTerm: value }))
                        }
                      >
                        <SelectTrigger id="loanTerm" className="w-full bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="propertyType" className="text-gray-300 mb-1.5 block">Property Type</Label>
                      <Select 
                        value={loanData.propertyType || undefined} 
                        onValueChange={(value: string) => 
                          setLoanData((prev) => ({ ...prev, propertyType: value as PropertyType }))
                        }
                      >
                        <SelectTrigger id="propertyType" className="w-full bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
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
                      <Label htmlFor="exitStrategy" className="text-gray-300 mb-1.5 block">Exit Strategy</Label>
                      <Select 
                        value={loanData.exitStrategy || undefined} 
                        onValueChange={(value: string) => 
                          setLoanData((prev) => ({ ...prev, exitStrategy: value as ExitStrategy }))
                        }
                      >
                        <SelectTrigger id="exitStrategy" className="w-full bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                          <SelectItem value="sale">Sale</SelectItem>
                          <SelectItem value="refinance">Refinance</SelectItem>
                          <SelectItem value="rental">Rental</SelectItem>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="purchasePrice" className="text-gray-300 mb-1.5 block">Purchase Price ($)</Label>
                      <Input
                        id="purchasePrice"
                        name="purchasePrice"
                        value={loanData.purchasePrice}
                        onChange={handleInputChange}
                        placeholder=""
                        type="number"
                        min="0"
                        className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="afterRepairValue" className="text-gray-300 mb-1.5 block">After Repair Value ($)</Label>
                      <Input
                        id="afterRepairValue"
                        name="afterRepairValue"
                        value={loanData.afterRepairValue}
                        onChange={handleInputChange}
                        placeholder=""
                        type="number"
                        min="0"
                        className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="propertyAddress" className="text-gray-300 mb-1.5 block">Property Address</Label>
                    <Input
                      id="propertyAddress"
                      name="propertyAddress"
                      value={loanData.propertyAddress}
                      onChange={handleInputChange}
                      placeholder=""
                      className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="rehabBudget" className="text-gray-300 mb-1.5 block">Rehab Budget ($)</Label>
                    <Input
                      id="rehabBudget"
                      name="rehabBudget"
                      value={loanData.rehabBudget}
                      onChange={handleInputChange}
                      placeholder=""
                      type="number"
                      min="0"
                      className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Originator/Underwriter Information */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-800 bg-gray-900 shadow-md h-full">
              <CardHeader className="border-b border-gray-800 bg-gray-800/70 pb-3">
                <CardTitle className="text-gray-100">
                  {originationType === "external" ? "Originator Information" : "Underwriter Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {originationType === "external" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName" className="text-gray-300 mb-1.5 block">Company Name</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          value={originatorInfo.companyName}
                          onChange={handleOriginatorInfoChange}
                          placeholder=""
                          required
                          className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactName" className="text-gray-300 mb-1.5 block">Contact Name</Label>
                        <Input
                          id="contactName"
                          name="contactName"
                          value={originatorInfo.contactName}
                          onChange={handleOriginatorInfoChange}
                          placeholder=""
                          required
                          className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactEmail" className="text-gray-300 mb-1.5 block">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          value={originatorInfo.contactEmail}
                          onChange={handleOriginatorInfoChange}
                          placeholder=""
                          type="email"
                          className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contactPhone" className="text-gray-300 mb-1.5 block">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          value={originatorInfo.contactPhone}
                          onChange={handleOriginatorInfoChange}
                          placeholder=""
                          className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="referralFee" className="text-gray-300 mb-1.5 block">Referral Fee (%)</Label>
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
                        className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="underwriterName" className="text-gray-300 mb-1.5 block">Underwriter Name</Label>
                    <Input
                      id="underwriterName"
                      name="underwriterName"
                      value={underwriterName}
                      onChange={(e) => setUnderwriterName(e.target.value)}
                      placeholder=""
                      required
                      className="bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Document Upload Section - Simplified */}
        <Card className="mt-6 border border-gray-800 bg-gray-900 shadow-md">
          <CardHeader className="border-b border-gray-800 bg-gray-800/70 pb-3">
            <CardTitle className="text-gray-100">Upload Document</CardTitle>
            <CardDescription className="text-gray-400">
              Upload property photos, borrower documents, or other relevant files
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                isDragging 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : documentFile 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-gray-700 bg-gray-800/30'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                id="file-upload"
                accept=".pdf" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <label 
                htmlFor="file-upload" 
                className="flex flex-col items-center cursor-pointer"
              >
                {documentFile ? (
                  <>
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-3">
                      <Check className="h-8 w-8 text-green-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-200 mb-1">{documentFile.name}</p>
                    <p className="text-sm text-gray-400 mb-4">
                      {(documentFile.size / 1024).toFixed(2)} KB - PDF document
                    </p>
                    <Button 
                      type="button" 
                      variant="outline"
                      className="border-gray-700 bg-gray-800/50 hover:bg-gray-800/70 text-gray-300"
                    >
                      Change File
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-3">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-200 mb-1">
                      {isDragging ? "Drop PDF here" : "Drop your document here"}
                    </p>
                    <p className="text-sm text-gray-400 mb-4">
                      Upload a PDF document (optional)
                    </p>
                    <Button 
                      type="button" 
                      variant="outline"
                      className="border-gray-700 bg-gray-800/50 hover:bg-gray-800/70 text-gray-300"
                    >
                      Select PDF File
                    </Button>
                  </>
                )}
              </label>
            </div>
            
            {documentError && (
              <div className="mt-4 p-3 bg-red-900/30 text-red-400 rounded-md flex items-center">
                <AlertCircle size={16} className="mr-2" />
                <p>{documentError}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleLoanCreation} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md flex items-center"
          >
            {loading ? "Creating Loan..." : "Create Loan"}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </LayoutWrapper>
  );
}