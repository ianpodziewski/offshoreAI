/**
 * Type definitions for loan-related data structures
 */

/**
 * Interface representing property address details
 */
export interface PropertyAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * Interface representing the core loan details used across the application
 */
export interface LoanDetails {
  // Identifiers
  loanNumber: string;
  
  // Borrower information
  borrowerName: string;
  
  // Lender information
  lenderName: string;
  
  // Property information
  propertyAddress: PropertyAddress;
  propertyType: string; // 'Residential', 'Commercial', 'Industrial', etc.
  
  // Loan terms
  loanAmount: number;
  interestRate: number;
  loanTerm: number; // in months
  originationFee: number; // percentage
  
  // Dates
  applicationDate?: string;
  approvalDate?: string;
  closingDate: string;
  
  // Additional details that might be needed for documents
  escrowRequired?: boolean;
  prepaymentPenalty?: boolean;
  prepaymentPenaltyTerm?: number;
  loanPurpose?: string;
  loanType?: string;
} 