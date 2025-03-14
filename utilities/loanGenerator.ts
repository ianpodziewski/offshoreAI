import { v4 as uuidv4 } from 'uuid';

export type LoanStatus = 'pending' | 'approved' | 'in_review' | 'rejected' | 'closed' | 'funded' | 'default';
export type LoanType = 'fix_and_flip' | 'bridge' | 'construction' | 'rehab' | 'rental' | 'commercial' | 'land';
export type PropertyType = 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'commercial' | 'mixed_use' | 'land' | 'industrial';
export type ExitStrategy = 'sale' | 'refinance' | 'rental' | 'development' | 'other';
export type OriginationType = 'external' | 'internal';

export interface OriginatorInfo {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  referralFee?: number; // Percentage of loan amount
}

export interface LoanData {
  id: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerExperience: string; // Experience level with similar projects
  loanAmount: number;
  interestRate: number;
  originationFee: number; // Points charged (usually 1-5%)
  loanTerm: number; // in months (typically 6-36 for hard money)
  loanType: LoanType;
  propertyAddress: string;
  propertyType: PropertyType;
  purchasePrice: number; // Property purchase price
  afterRepairValue: number; // ARV - estimated value after renovations
  rehabBudget: number; // Cost of planned renovations
  ltv: number; // Loan-to-Value ratio
  arv_ltv: number; // Loan-to-ARV ratio 
  exitStrategy: ExitStrategy;
  dateCreated: string;
  dateModified: string;
  status: LoanStatus;
  lender?: string; // Hard money lender/investor
  fundingDate?: string; // When the loan was funded
  maturityDate?: string; // When the loan is due
  originationType: OriginationType; // Whether the loan was originated internally or externally
  originatorInfo?: OriginatorInfo; // Information about the external originator if applicable
  underwriterName?: string; // Name of the internal underwriter assigned to the loan
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

// More specific names for real estate investors
const firstNames = ['Michael', 'David', 'Sarah', 'John', 'Emily', 'Robert', 'Jessica', 'William', 'Jennifer', 'Christopher'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

// More realistic street names for investment properties
const streets = [
  'Investor Way', 'Rehab Lane', 'Flip Street', 'Property Drive', 'Development Road', 
  'Renovation Avenue', 'Capital Boulevard', 'Real Estate Court', 'Investment Plaza', 'Market Street'
];

// Cities with active real estate markets
const cities = [
  'Phoenix', 'Atlanta', 'Dallas', 'Tampa', 'Charlotte', 'Las Vegas', 
  'Houston', 'Orlando', 'Austin', 'Nashville'
];

const states = ['AZ', 'GA', 'TX', 'FL', 'NC', 'NV', 'CA', 'CO', 'TN', 'OH'];

// More nuanced experience levels for real estate investors
const experienceLevels = [
  'Beginner (0-1 projects)', 
  'Intermediate (2-5 projects)', 
  'Experienced (6-10 projects)', 
  'Seasoned Investor (10+ projects)'
];

function getRandomName(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

function getRandomEmail(name: string): string {
  const [firstName, lastName] = name.split(' ');
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@investormail.com`;
}

function getRandomAddress(): string {
  const houseNumber = Math.floor(Math.random() * 9000) + 1000;
  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const state = states[Math.floor(Math.random() * states.length)];
  const zip = Math.floor(Math.random() * 90000) + 10000;
  return `${houseNumber} ${street}, ${city}, ${state} ${zip}`;
}

export function generateLoan(overrides = {}): LoanData {
  const borrowerName = getRandomName();
  const dateCreated = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
  
  // More realistic property value generation
  const purchasePrice = (() => {
    // Different price ranges based on property type
    const propertyType = ['single_family', 'multi_family', 'commercial', 'land'][Math.floor(Math.random() * 4)];
    switch(propertyType) {
      case 'single_family': return Math.floor(Math.random() * 500000) + 150000; // $150k to $650k
      case 'multi_family': return Math.floor(Math.random() * 1000000) + 300000; // $300k to $1.3M
      case 'commercial': return Math.floor(Math.random() * 2000000) + 500000; // $500k to $2.5M
      case 'land': return Math.floor(Math.random() * 500000) + 50000; // $50k to $550k
      default: return Math.floor(Math.random() * 900000) + 150000;
    }
  })();

  // Rehab budget more tightly coupled to purchase price
  const rehabBudget = (() => {
    const loanType = ['fix_and_flip', 'rehab', 'construction'][Math.floor(Math.random() * 3)];
    switch(loanType) {
      case 'fix_and_flip': return Math.floor(purchasePrice * (Math.random() * 0.3 + 0.15)); // 15-45% of purchase price
      case 'rehab': return Math.floor(purchasePrice * (Math.random() * 0.4 + 0.2)); // 20-60% of purchase price
      case 'construction': return Math.floor(purchasePrice * (Math.random() * 0.5 + 0.5)); // 50-100% of purchase price
      default: return Math.floor(purchasePrice * (Math.random() * 0.3 + 0.1));
    }
  })();

  // More sophisticated ARV calculation
  const afterRepairValue = Math.floor((purchasePrice + rehabBudget) * (Math.random() * 0.3 + 1.3)); // 30-60% value increase

  // LTV calculation with more realistic constraints
  const ltv = (() => {
    const loanType = ['fix_and_flip', 'bridge', 'construction'][Math.floor(Math.random() * 3)];
    switch(loanType) {
      case 'fix_and_flip': return Math.floor(Math.random() * 10 + 70); // 70-80% LTV
      case 'bridge': return Math.floor(Math.random() * 10 + 65); // 65-75% LTV
      case 'construction': return Math.floor(Math.random() * 10 + 65); // 65-75% LTV
      default: return Math.floor(Math.random() * 15 + 65); // 65-80% LTV
    }
  })();

  const loanAmount = Math.floor((purchasePrice * ltv) / 100);
  const arv_ltv = Math.floor((loanAmount / afterRepairValue) * 100);
  
  // More realistic loan terms for hard money
  const loanTerm = [6, 9, 12, 18, 24][Math.floor(Math.random() * 5)]; // Common hard money terms
  const interestRate = Number((Math.random() * 4 + 9).toFixed(2)); // 9-13% interest rates
  const originationFee = Number((Math.random() * 2 + 2).toFixed(1)); // 2-4 points
  
  // Determine origination type
  const originationType = ['external', 'internal'][Math.floor(Math.random() * 2)] as OriginationType;
  
  // Generate originator info if external
  const originatorInfo = originationType === 'external' ? {
    companyName: `${lastNames[Math.floor(Math.random() * lastNames.length)]} Mortgage`,
    contactName: getRandomName(),
    contactEmail: `contact@${lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase()}mortgage.com`,
    contactPhone: `(${Math.floor(Math.random() * 900) + 100})-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    referralFee: Number((Math.random() * 1.5 + 0.5).toFixed(2)), // 0.5-2% referral fee
  } : undefined;
  
  // Generate underwriter name if internal
  const underwriterName = originationType === 'internal' ? getRandomName() : undefined;
  
  const baseLoan: LoanData = {
    id: uuidv4(),
    borrowerName,
    borrowerEmail: getRandomEmail(borrowerName),
    borrowerExperience: experienceLevels[Math.floor(Math.random() * experienceLevels.length)],
    loanAmount,
    interestRate,
    originationFee,
    loanTerm,
    loanType: ['fix_and_flip', 'bridge', 'construction', 'rehab', 'rental', 'commercial', 'land'][Math.floor(Math.random() * 7)] as LoanType,
    propertyAddress: getRandomAddress(),
    propertyType: ['single_family', 'multi_family', 'condo', 'townhouse', 'commercial', 'mixed_use', 'land', 'industrial'][Math.floor(Math.random() * 8)] as PropertyType,
    purchasePrice,
    afterRepairValue,
    rehabBudget,
    ltv,
    arv_ltv,
    exitStrategy: ['sale', 'refinance', 'rental', 'development', 'other'][Math.floor(Math.random() * 5)] as ExitStrategy,
    dateCreated,
    dateModified: new Date(new Date(dateCreated).getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: ['pending', 'approved', 'in_review', 'funded', 'closed', 'rejected', 'default'][Math.floor(Math.random() * 7)] as LoanStatus,
    originationType,
    originatorInfo,
    underwriterName,
    documents: [
      {
        category: 'financial',
        files: [
          {
            filename: 'proof_of_funds.pdf',
            uploadDate: dateCreated,
            status: 'approved',
          },
          {
            filename: 'personal_financial_statement.pdf',
            uploadDate: dateCreated,
            status: 'pending',
          }
        ]
      },
      {
        category: 'property',
        files: [
          {
            filename: 'property_photos.pdf',
            uploadDate: dateCreated,
            status: 'pending',
          },
          {
            filename: 'rehab_scope_of_work.pdf',
            uploadDate: dateCreated,
            status: 'pending',
          }
        ]
      },
      {
        category: 'legal',
        files: [
          {
            filename: 'purchase_contract.pdf',
            uploadDate: dateCreated,
            status: 'pending',
          },
          {
            filename: 'deed_of_trust.pdf',
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
          },
          {
            filename: 'draw_schedule.pdf',
            uploadDate: dateCreated,
            status: 'pending',
          }
        ]
      }
    ]
  };
  
  // Add lender if loan is in review, approved, or funded
  if (['in_review', 'approved', 'funded', 'closed'].includes(baseLoan.status)) {
    baseLoan.lender = getRandomName();
  }
  
  // Add funding date if loan is funded or closed
  if (['funded', 'closed'].includes(baseLoan.status)) {
    baseLoan.fundingDate = new Date(new Date(baseLoan.dateModified).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    // Add maturity date based on loan term
    const fundingDate = new Date(baseLoan.fundingDate);
    baseLoan.maturityDate = new Date(fundingDate.setMonth(fundingDate.getMonth() + baseLoan.loanTerm)).toISOString();
  }
  
  // Apply any overrides
  return { ...baseLoan, ...overrides };
}

// Generate multiple loans
export function generateLoans(count: number): LoanData[] {
  return Array(count).fill(null).map(() => generateLoan());
}