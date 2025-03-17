import { v4 as uuidv4 } from 'uuid';

export type LoanStatus = 'pending' | 'approved' | 'in_review' | 'rejected' | 'closed' | 'funded' | 'default';
export type LoanType = 'fix_and_flip' | 'rental_brrrr' | 'bridge' | 'construction' | 'commercial';
export type PropertyType = 'single_family' | 'multi_family_2_4' | 'multi_family_5plus' | 'mixed_use' | 'retail' | 'office' | 'industrial' | 'self_storage' | 'hotel_motel';
export type ExitStrategy = 'sale' | 'refinance' | 'rental' | 'development' | 'other';
export type OriginationType = 'external' | 'internal';
export type RiskTier = 'tier_1' | 'tier_2' | 'tier_3';

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
  borrowerPhone?: string;
  borrowerAddress?: string;
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
  creditScore?: number; // Borrower's credit score
  dscr?: number; // Debt Service Coverage Ratio (for rental properties)
  riskTier?: RiskTier; // Risk tier based on borrower experience
  cashReserves?: number; // Cash reserves in months of loan payments
  
  // Property details
  yearBuilt?: number;
  squareFootage?: number;
  lotSize?: string;
  bedrooms?: number;
  bathrooms?: number;
  
  // Location details
  city?: string;
  state?: string;
  zipCode?: string;
  county?: string;
  neighborhood?: string;
  schoolDistrict?: string;
  floodZone?: string;
  zoning?: string;
  
  // Payment details
  monthlyPayment?: number;
  paymentSchedule?: string;
  firstPaymentDate?: string;
  balloonPayment?: number;
  lateFee?: string;
  prepaymentPenalty?: string;
  extensionOptions?: string;
  
  // Entity information
  entityName?: string;
  entityType?: string;
  ein?: string; // Employer Identification Number
  stateOfFormation?: string;
  yearEstablished?: number;
  
  // Holding costs
  holdingCosts?: number;
  
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
  'Tier 3: Novice (0-1 projects)', 
  'Tier 2: Intermediate (2-4 projects)', 
  'Tier 1: Experienced (5+ projects)'
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

// Function to generate a more realistic loan ID
function generateLoanId(): string {
  // Format: DEMO-YYYY-XXXX where YYYY is the current year and XXXX is a random 4-digit number
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number between 1000-9999
  return `DEMO-${year}-${randomNum}`;
}

export function generateLoan(overrides = {}): LoanData {
  const borrowerName = getRandomName();
  const dateCreated = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
  
  // More realistic property value generation
  const propertyType = ['single_family', 'multi_family_2_4', 'multi_family_5plus', 'mixed_use', 'retail', 'office', 'industrial', 'self_storage', 'hotel_motel'][Math.floor(Math.random() * 9)] as PropertyType;
  
  const purchasePrice = (() => {
    switch(propertyType) {
      case 'single_family': return Math.floor(Math.random() * 500000) + 150000; // $150k to $650k
      case 'multi_family_2_4': return Math.floor(Math.random() * 1000000) + 300000; // $300k to $1.3M
      case 'multi_family_5plus': return Math.floor(Math.random() * 2000000) + 500000; // $500k to $2.5M
      case 'mixed_use': return Math.floor(Math.random() * 2000000) + 500000; // $500k to $2.5M
      case 'retail': return Math.floor(Math.random() * 2000000) + 500000; // $500k to $2.5M
      case 'office': return Math.floor(Math.random() * 2000000) + 500000; // $500k to $2.5M
      case 'industrial': return Math.floor(Math.random() * 2000000) + 500000; // $500k to $2.5M
      case 'self_storage': return Math.floor(Math.random() * 2000000) + 500000; // $500k to $2.5M
      case 'hotel_motel': return Math.floor(Math.random() * 2000000) + 500000; // $500k to $2.5M
      default: return Math.floor(Math.random() * 900000) + 150000;
    }
  })();

  // Determine loan type
  const loanType = ['fix_and_flip', 'rental_brrrr', 'bridge', 'construction', 'commercial'][Math.floor(Math.random() * 5)] as LoanType;

  // Rehab budget more tightly coupled to purchase price
  const rehabBudget = (() => {
    switch(loanType) {
      case 'fix_and_flip': return Math.floor(purchasePrice * (Math.random() * 0.3 + 0.15)); // 15-45% of purchase price
      case 'rental_brrrr': return Math.floor(purchasePrice * (Math.random() * 0.4 + 0.2)); // 20-60% of purchase price
      case 'bridge': return Math.floor(purchasePrice * (Math.random() * 0.5 + 0.5)); // 50-100% of purchase price
      case 'construction': return Math.floor(purchasePrice * (Math.random() * 0.5 + 0.5)); // 50-100% of purchase price
      case 'commercial': return Math.floor(purchasePrice * (Math.random() * 0.3 + 0.1));
      default: return Math.floor(purchasePrice * (Math.random() * 0.3 + 0.1));
    }
  })();

  // More sophisticated ARV calculation
  const afterRepairValue = Math.floor((purchasePrice + rehabBudget) * (Math.random() * 0.3 + 1.3)); // 30-60% value increase

  // LTV calculation with more realistic constraints
  const ltv = (() => {
    switch(loanType) {
      case 'fix_and_flip': return Math.floor(Math.random() * 10 + 70); // 70-80% LTV
      case 'rental_brrrr': return Math.floor(Math.random() * 10 + 65); // 65-75% LTV
      case 'bridge': return Math.floor(Math.random() * 10 + 65); // 65-75% LTV
      case 'construction': return Math.floor(Math.random() * 10 + 65); // 65-75% LTV
      case 'commercial': return Math.floor(Math.random() * 15 + 65); // 65-80% LTV
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

  // Generate loan status
  const status = ['pending', 'approved', 'in_review', 'funded', 'closed', 'rejected', 'default'][Math.floor(Math.random() * 7)] as LoanStatus;
  
  // Generate property address and extract location details
  const address = getRandomAddress();
  const addressParts = address.split(', ');
  const cityPart = addressParts[1];
  const stateZipParts = addressParts[2].split(' ');
  const state = stateZipParts[0];
  const zipCode = stateZipParts[1];
  
  // Generate credit score based on loan status
  const creditScore = Math.floor(Math.random() * 200) + 600; // 600-800
  
  // Generate DSCR for rental properties
  const dscr = loanType === 'rental_brrrr' ? Number((Math.random() * 0.5 + 1.1).toFixed(2)) : undefined; // 1.1-1.6
  
  // Generate cash reserves
  const cashReserves = Math.floor(Math.random() * 12) + 3; // 3-15 months
  
  // Generate property details
  const yearBuilt = Math.floor(Math.random() * 70) + 1950; // 1950-2020
  const squareFootage = (() => {
    switch(propertyType) {
      case 'single_family': return Math.floor(Math.random() * 2000) + 1000; // 1000-3000 sq ft
      case 'multi_family_2_4': return Math.floor(Math.random() * 3000) + 2000; // 2000-5000 sq ft
      case 'multi_family_5plus': return Math.floor(Math.random() * 10000) + 5000; // 5000-15000 sq ft
      default: return Math.floor(Math.random() * 5000) + 2000; // 2000-7000 sq ft
    }
  })();
  const lotSize = `${(Math.random() * 0.9 + 0.1).toFixed(2)} acres`;
  const bedrooms = propertyType === 'single_family' ? Math.floor(Math.random() * 4) + 2 : undefined; // 2-5 bedrooms
  const bathrooms = propertyType === 'single_family' ? Math.floor(Math.random() * 3) + 1.5 : undefined; // 1.5-4.5 bathrooms
  
  // Generate location details
  const county = `${lastNames[Math.floor(Math.random() * lastNames.length)]} County`;
  const neighborhood = `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${['Heights', 'Park', 'Village', 'Estates', 'Gardens'][Math.floor(Math.random() * 5)]}`;
  const schoolDistrict = `${cityPart} Unified School District`;
  const floodZone = ['X', 'A', 'AE', 'B', 'C'][Math.floor(Math.random() * 5)];
  const zoning = ['R-1', 'R-2', 'C-1', 'M-1', 'PUD'][Math.floor(Math.random() * 5)];
  
  // Generate payment details
  const monthlyPayment = Math.round((loanAmount * (interestRate / 100 / 12) * Math.pow(1 + (interestRate / 100 / 12), loanTerm)) / (Math.pow(1 + (interestRate / 100 / 12), loanTerm) - 1));
  const paymentSchedule = ['Monthly', 'Interest Only', 'Quarterly'][Math.floor(Math.random() * 3)];
  
  // Generate entity information
  const entityName = `${borrowerName.split(' ')[0]} ${['Properties', 'Investments', 'Holdings', 'Capital', 'Ventures'][Math.floor(Math.random() * 5)]} LLC`;
  const entityType = ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship'][Math.floor(Math.random() * 4)];
  // Generate EIN with masked format (XX-XXX****)
  const ein = `${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`;
  const maskedEin = `**-***${ein.slice(-4)}`;
  const stateOfFormation = state;
  const yearEstablished = Math.floor(Math.random() * 10) + 2010; // 2010-2020
  
  // Generate holding costs
  const holdingCosts = Math.round(monthlyPayment * 0.3 * loanTerm); // Roughly 30% of monthly payment over loan term
  
  // Generate borrower experience and corresponding risk tier
  const experienceIndex = Math.floor(Math.random() * experienceLevels.length);
  const borrowerExperience = experienceLevels[experienceIndex];
  const riskTier = experienceIndex === 2 ? 'tier_1' : experienceIndex === 1 ? 'tier_2' : 'tier_3' as RiskTier;
  
  const baseLoan: LoanData = {
    id: generateLoanId(),
    borrowerName,
    borrowerEmail: getRandomEmail(borrowerName),
    borrowerPhone: `(${Math.floor(Math.random() * 900) + 100})-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    borrowerAddress: getRandomAddress(),
    borrowerExperience,
    loanAmount,
    interestRate,
    originationFee,
    loanTerm,
    loanType,
    propertyAddress: address,
    propertyType,
    purchasePrice,
    afterRepairValue,
    rehabBudget,
    ltv,
    arv_ltv,
    exitStrategy: ['sale', 'refinance', 'rental', 'development', 'other'][Math.floor(Math.random() * 5)] as ExitStrategy,
    dateCreated,
    dateModified: new Date(new Date(dateCreated).getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status,
    originationType,
    originatorInfo,
    underwriterName,
    creditScore,
    dscr,
    riskTier,
    cashReserves,
    
    // Property details
    yearBuilt,
    squareFootage,
    lotSize,
    bedrooms,
    bathrooms,
    
    // Location details
    city: cityPart,
    state,
    zipCode,
    county,
    neighborhood,
    schoolDistrict,
    floodZone,
    zoning,
    
    // Payment details
    monthlyPayment,
    paymentSchedule,
    firstPaymentDate: status === 'funded' || status === 'closed' ? new Date(new Date(dateCreated).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    balloonPayment: loanAmount * 1.1,
    lateFee: '5% of payment amount',
    prepaymentPenalty: Math.random() > 0.5 ? `${Math.floor(Math.random() * 3) + 1}% if paid off in first ${Math.floor(Math.random() * 6) + 6} months` : 'None',
    extensionOptions: Math.random() > 0.5 ? `${Math.floor(Math.random() * 2) + 1} extensions of ${Math.floor(Math.random() * 3) + 1} months each` : 'None',
    
    // Entity information
    entityName,
    entityType,
    ein: maskedEin,
    stateOfFormation,
    yearEstablished,
    
    // Holding costs
    holdingCosts,
    
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
  
  // For loans that are not yet funded or closed, make certain fields unavailable
  if (!['funded', 'closed'].includes(baseLoan.status)) {
    // Clear fields that would only be available after funding
    baseLoan.fundingDate = undefined;
    baseLoan.maturityDate = undefined;
    baseLoan.firstPaymentDate = undefined;
    
    // For early stage loans (pending, in_review), make more fields unavailable
    if (['pending', 'in_review'].includes(baseLoan.status)) {
      baseLoan.monthlyPayment = undefined;
      baseLoan.balloonPayment = undefined;
      baseLoan.prepaymentPenalty = undefined;
      baseLoan.extensionOptions = undefined;
      
      // For pending loans, make even more fields unavailable
      if (baseLoan.status === 'pending') {
        baseLoan.dscr = undefined;
        baseLoan.yearBuilt = undefined;
        baseLoan.squareFootage = undefined;
        baseLoan.lotSize = undefined;
        baseLoan.bedrooms = undefined;
        baseLoan.bathrooms = undefined;
        baseLoan.county = undefined;
        baseLoan.neighborhood = undefined;
        baseLoan.schoolDistrict = undefined;
        baseLoan.floodZone = undefined;
        baseLoan.zoning = undefined;
      }
    }
  }
  
  // Apply any overrides
  return { ...baseLoan, ...overrides };
}

// Generate multiple loans
export function generateLoans(count: number): LoanData[] {
  return Array(count).fill(null).map(() => generateLoan());
}