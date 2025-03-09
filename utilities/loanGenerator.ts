// utilities/loanGenerator.ts
import { v4 as uuidv4 } from 'uuid';

export type LoanStatus = 'pending' | 'approved' | 'in_review' | 'rejected' | 'closed';
export type LoanType = 'conventional' | 'fha' | 'va' | 'jumbo' | 'heloc';
export type PropertyType = 'single_family' | 'multi_family' | 'condo' | 'townhouse';

export interface LoanData {
  id: string;
  borrowerName: string;
  borrowerEmail: string;
  loanAmount: number;
  interestRate: number;
  loanTerm: number; // in months
  loanType: LoanType;
  propertyAddress: string;
  propertyType: PropertyType;
  appraisalValue: number;
  dateCreated: string;
  dateModified: string;
  status: LoanStatus;
  underwriter?: string;
  closingDate?: string;
  documents: {
    category: string;
    files: {
      filename: string;
      uploadDate: string;
      status: string;
      url?: string;
    }[];
  }[];
}

// Generate random names
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

// Generate random addresses
const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Washington Blvd', 'Park Lane', 'Cedar Dr', 'Lake View', 'Sunset Blvd'];
const cities = ['Springfield', 'Riverdale', 'Franklin', 'Greenville', 'Bristol', 'Clinton', 'Georgetown', 'Salem'];
const states = ['CA', 'TX', 'FL', 'NY', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];

// Generate a random person name
function getRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

// Generate a random email based on name
function getRandomEmail(name: string): string {
  const [firstName, lastName] = name.split(' ');
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
}

// Generate a random address
function getRandomAddress(): string {
  const houseNumber = Math.floor(Math.random() * 9000) + 1000;
  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const zip = Math.floor(Math.random() * 90000) + 10000;
  return `${houseNumber} ${street}, ${city}, ${state} ${zip}`;
}

// Generate random loan data
export function generateLoan(overrides = {}): LoanData {
  const borrowerName = getRandomName();
  const dateCreated = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
  
  // Base loan data with realistic values
  const baseLoan: LoanData = {
    id: uuidv4(),
    borrowerName,
    borrowerEmail: getRandomEmail(borrowerName),
    loanAmount: Math.floor(Math.random() * 900000) + 100000, // $100k to $1M
    interestRate: Number((Math.random() * 3.5 + 2.5).toFixed(3)), // 2.5% to 6%
    loanTerm: Math.random() > 0.7 ? 180 : 360, // 15 or 30 years
    loanType: ['conventional', 'fha', 'va', 'jumbo', 'heloc'][Math.floor(Math.random() * 5)] as LoanType,
    propertyAddress: getRandomAddress(),
    propertyType: ['single_family', 'multi_family', 'condo', 'townhouse'][Math.floor(Math.random() * 4)] as PropertyType,
    appraisalValue: 0, // Will be set based on loan amount
    dateCreated,
    dateModified: new Date(new Date(dateCreated).getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: ['pending', 'approved', 'in_review', 'rejected', 'closed'][Math.floor(Math.random() * 5)] as LoanStatus,
    documents: [
      {
        category: 'financial',
        files: [
          {
            filename: 'closing_disclosure.pdf',
            uploadDate: dateCreated,
            status: 'approved',
          },
          {
            filename: 'settlement_statement.pdf',
            uploadDate: dateCreated,
            status: 'pending',
          }
        ]
      },
      {
        category: 'legal',
        files: [
          {
            filename: 'deed_of_trust.pdf',
            uploadDate: dateCreated,
            status: 'pending',
          },
          {
            filename: 'compliance_agreement.pdf',
            uploadDate: dateCreated,
            status: 'pending',
          }
        ]
      },
      {
        category: 'loan',
        files: [
          {
            filename: 'promissory_note.pdf',
            uploadDate: dateCreated,
            status: 'pending',
          }
        ]
      }
    ]
  };
  
  // Set appraisal value based on loan amount (realistic LTV ratio)
  baseLoan.appraisalValue = Math.round(baseLoan.loanAmount / (Math.random() * 0.1 + 0.7)); // 70-80% LTV
  
  // Add underwriter if loan is in review or approved
  if (['in_review', 'approved', 'closed'].includes(baseLoan.status)) {
    baseLoan.underwriter = getRandomName();
  }
  
  // Add closing date if loan is closed
  if (baseLoan.status === 'closed') {
    baseLoan.closingDate = new Date(new Date(baseLoan.dateModified).getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
  }
  
  // Apply any overrides
  return { ...baseLoan, ...overrides };
}

// Generate multiple loans
export function generateLoans(count: number): LoanData[] {
  return Array(count).fill(null).map(() => generateLoan());
}