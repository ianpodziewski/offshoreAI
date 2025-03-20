"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLoan = generateLoan;
exports.generateLoans = generateLoans;
// More specific names for real estate investors
var firstNames = ['Michael', 'David', 'Sarah', 'John', 'Emily', 'Robert', 'Jessica', 'William', 'Jennifer', 'Christopher'];
var lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
// More realistic street names for investment properties
var streets = [
    'Investor Way', 'Rehab Lane', 'Flip Street', 'Property Drive', 'Development Road',
    'Renovation Avenue', 'Capital Boulevard', 'Real Estate Court', 'Investment Plaza', 'Market Street'
];
// Cities with active real estate markets
var cities = [
    'Phoenix', 'Atlanta', 'Dallas', 'Tampa', 'Charlotte', 'Las Vegas',
    'Houston', 'Orlando', 'Austin', 'Nashville'
];
var states = ['AZ', 'GA', 'TX', 'FL', 'NC', 'NV', 'CA', 'CO', 'TN', 'OH'];
// More nuanced experience levels for real estate investors
var experienceLevels = [
    'Tier 3: Novice (0-1 projects)',
    'Tier 2: Intermediate (2-4 projects)',
    'Tier 1: Experienced (5+ projects)'
];
function getRandomName() {
    var firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    var lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return "".concat(firstName, " ").concat(lastName);
}
function getRandomEmail(name) {
    var _a = name.split(' '), firstName = _a[0], lastName = _a[1];
    return "".concat(firstName.toLowerCase(), ".").concat(lastName.toLowerCase(), "@investormail.com");
}
function getRandomAddress() {
    var houseNumber = Math.floor(Math.random() * 9000) + 1000;
    var street = streets[Math.floor(Math.random() * streets.length)];
    var city = cities[Math.floor(Math.random() * cities.length)];
    var state = states[Math.floor(Math.random() * states.length)];
    var zip = Math.floor(Math.random() * 90000) + 10000;
    return "".concat(houseNumber, " ").concat(street, ", ").concat(city, ", ").concat(state, " ").concat(zip);
}
// Function to generate a more realistic loan ID
function generateLoanId() {
    // Format: DEMO-YYYY-XXXX where YYYY is the current year and XXXX is a random 4-digit number
    var year = new Date().getFullYear();
    var randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number between 1000-9999
    return "DEMO-".concat(year, "-").concat(randomNum);
}
function generateLoan(overrides) {
    if (overrides === void 0) { overrides = {}; }
    var borrowerName = getRandomName();
    var dateCreated = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
    // More realistic property value generation
    var propertyType = ['single_family', 'multi_family_2_4', 'multi_family_5plus', 'mixed_use', 'retail', 'office', 'industrial', 'self_storage', 'hotel_motel'][Math.floor(Math.random() * 9)];
    var purchasePrice = (function () {
        switch (propertyType) {
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
    var loanType = ['fix_and_flip', 'rental_brrrr', 'bridge', 'construction', 'commercial'][Math.floor(Math.random() * 5)];
    // Rehab budget more tightly coupled to purchase price
    var rehabBudget = (function () {
        switch (loanType) {
            case 'fix_and_flip': return Math.floor(purchasePrice * (Math.random() * 0.3 + 0.15)); // 15-45% of purchase price
            case 'rental_brrrr': return Math.floor(purchasePrice * (Math.random() * 0.4 + 0.2)); // 20-60% of purchase price
            case 'bridge': return Math.floor(purchasePrice * (Math.random() * 0.5 + 0.5)); // 50-100% of purchase price
            case 'construction': return Math.floor(purchasePrice * (Math.random() * 0.5 + 0.5)); // 50-100% of purchase price
            case 'commercial': return Math.floor(purchasePrice * (Math.random() * 0.3 + 0.1));
            default: return Math.floor(purchasePrice * (Math.random() * 0.3 + 0.1));
        }
    })();
    // More sophisticated ARV calculation
    var afterRepairValue = Math.floor((purchasePrice + rehabBudget) * (Math.random() * 0.3 + 1.3)); // 30-60% value increase
    // LTV calculation with more realistic constraints
    var ltv = (function () {
        switch (loanType) {
            case 'fix_and_flip': return Math.floor(Math.random() * 10 + 70); // 70-80% LTV
            case 'rental_brrrr': return Math.floor(Math.random() * 10 + 65); // 65-75% LTV
            case 'bridge': return Math.floor(Math.random() * 10 + 65); // 65-75% LTV
            case 'construction': return Math.floor(Math.random() * 10 + 65); // 65-75% LTV
            case 'commercial': return Math.floor(Math.random() * 15 + 65); // 65-80% LTV
            default: return Math.floor(Math.random() * 15 + 65); // 65-80% LTV
        }
    })();
    var loanAmount = Math.floor((purchasePrice * ltv) / 100);
    var arv_ltv = Math.floor((loanAmount / afterRepairValue) * 100);
    // More realistic loan terms for hard money
    var loanTerm = [6, 9, 12, 18, 24][Math.floor(Math.random() * 5)]; // Common hard money terms
    var interestRate = Number((Math.random() * 4 + 9).toFixed(2)); // 9-13% interest rates
    var originationFee = Number((Math.random() * 2 + 2).toFixed(1)); // 2-4 points
    // Determine origination type
    var originationType = ['external', 'internal'][Math.floor(Math.random() * 2)];
    // Generate originator info if external
    var originatorInfo = originationType === 'external' ? {
        companyName: "".concat(lastNames[Math.floor(Math.random() * lastNames.length)], " Mortgage"),
        contactName: getRandomName(),
        contactEmail: "contact@".concat(lastNames[Math.floor(Math.random() * lastNames.length)].toLowerCase(), "mortgage.com"),
        contactPhone: "(".concat(Math.floor(Math.random() * 900) + 100, ")-").concat(Math.floor(Math.random() * 900) + 100, "-").concat(Math.floor(Math.random() * 9000) + 1000),
        referralFee: Number((Math.random() * 1.5 + 0.5).toFixed(2)), // 0.5-2% referral fee
    } : undefined;
    // Generate underwriter name if internal
    var underwriterName = originationType === 'internal' ? getRandomName() : undefined;
    // Generate loan status
    var status = ['pending', 'approved', 'in_review', 'funded', 'closed', 'rejected', 'default'][Math.floor(Math.random() * 7)];
    // Generate property address and extract location details
    var address = getRandomAddress();
    var addressParts = address.split(', ');
    var cityPart = addressParts[1];
    var stateZipParts = addressParts[2].split(' ');
    var state = stateZipParts[0];
    var zipCode = stateZipParts[1];
    // Generate credit score based on loan status
    var creditScore = Math.floor(Math.random() * 200) + 600; // 600-800
    // Generate DSCR for rental properties
    var dscr = loanType === 'rental_brrrr' ? Number((Math.random() * 0.5 + 1.1).toFixed(2)) : undefined; // 1.1-1.6
    // Generate cash reserves
    var cashReserves = Math.floor(Math.random() * 12) + 3; // 3-15 months
    // Generate property details
    var yearBuilt = Math.floor(Math.random() * 70) + 1950; // 1950-2020
    var squareFootage = (function () {
        switch (propertyType) {
            case 'single_family': return Math.floor(Math.random() * 2000) + 1000; // 1000-3000 sq ft
            case 'multi_family_2_4': return Math.floor(Math.random() * 3000) + 2000; // 2000-5000 sq ft
            case 'multi_family_5plus': return Math.floor(Math.random() * 10000) + 5000; // 5000-15000 sq ft
            default: return Math.floor(Math.random() * 5000) + 2000; // 2000-7000 sq ft
        }
    })();
    var lotSize = "".concat((Math.random() * 0.9 + 0.1).toFixed(2), " acres");
    var bedrooms = propertyType === 'single_family' ? Math.floor(Math.random() * 4) + 2 : undefined; // 2-5 bedrooms
    var bathrooms = propertyType === 'single_family' ? Math.floor(Math.random() * 3) + 1.5 : undefined; // 1.5-4.5 bathrooms
    // Generate location details
    var county = "".concat(lastNames[Math.floor(Math.random() * lastNames.length)], " County");
    var neighborhood = "".concat(lastNames[Math.floor(Math.random() * lastNames.length)], " ").concat(['Heights', 'Park', 'Village', 'Estates', 'Gardens'][Math.floor(Math.random() * 5)]);
    var schoolDistrict = "".concat(cityPart, " Unified School District");
    var floodZone = ['X', 'A', 'AE', 'B', 'C'][Math.floor(Math.random() * 5)];
    var zoning = ['R-1', 'R-2', 'C-1', 'M-1', 'PUD'][Math.floor(Math.random() * 5)];
    // Generate payment details
    var monthlyPayment = Math.round((loanAmount * (interestRate / 100 / 12) * Math.pow(1 + (interestRate / 100 / 12), loanTerm)) / (Math.pow(1 + (interestRate / 100 / 12), loanTerm) - 1));
    var paymentSchedule = ['Monthly', 'Interest Only', 'Quarterly'][Math.floor(Math.random() * 3)];
    // Generate entity information
    var entityName = "".concat(borrowerName.split(' ')[0], " ").concat(['Properties', 'Investments', 'Holdings', 'Capital', 'Ventures'][Math.floor(Math.random() * 5)], " LLC");
    var entityType = ['LLC', 'Corporation', 'Partnership', 'Sole Proprietorship'][Math.floor(Math.random() * 4)];
    // Generate EIN with masked format (XX-XXX****)
    var ein = "".concat(Math.floor(Math.random() * 90) + 10, "-").concat(Math.floor(Math.random() * 9000) + 1000);
    var maskedEin = "**-***".concat(ein.slice(-4));
    var stateOfFormation = state;
    var yearEstablished = Math.floor(Math.random() * 10) + 2010; // 2010-2020
    // Generate holding costs
    var holdingCosts = Math.round(monthlyPayment * 0.3 * loanTerm); // Roughly 30% of monthly payment over loan term
    // Generate borrower experience and corresponding risk tier
    var experienceIndex = Math.floor(Math.random() * experienceLevels.length);
    var borrowerExperience = experienceLevels[experienceIndex];
    var riskTier = experienceIndex === 2 ? 'tier_1' : experienceIndex === 1 ? 'tier_2' : 'tier_3';
    var baseLoan = {
        id: generateLoanId(),
        borrowerName: borrowerName,
        borrowerEmail: getRandomEmail(borrowerName),
        borrowerPhone: "(".concat(Math.floor(Math.random() * 900) + 100, ")-").concat(Math.floor(Math.random() * 900) + 100, "-").concat(Math.floor(Math.random() * 9000) + 1000),
        borrowerAddress: getRandomAddress(),
        borrowerExperience: borrowerExperience,
        loanAmount: loanAmount,
        interestRate: interestRate,
        originationFee: originationFee,
        loanTerm: loanTerm,
        loanType: loanType,
        propertyAddress: address,
        propertyType: propertyType,
        purchasePrice: purchasePrice,
        afterRepairValue: afterRepairValue,
        rehabBudget: rehabBudget,
        ltv: ltv,
        arv_ltv: arv_ltv,
        exitStrategy: ['sale', 'refinance', 'rental', 'development', 'other'][Math.floor(Math.random() * 5)],
        dateCreated: dateCreated,
        dateModified: new Date(new Date(dateCreated).getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: status,
        originationType: originationType,
        originatorInfo: originatorInfo,
        underwriterName: underwriterName,
        creditScore: creditScore,
        dscr: dscr,
        riskTier: riskTier,
        cashReserves: cashReserves,
        // Property details
        yearBuilt: yearBuilt,
        squareFootage: squareFootage,
        lotSize: lotSize,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        // Location details
        city: cityPart,
        state: state,
        zipCode: zipCode,
        county: county,
        neighborhood: neighborhood,
        schoolDistrict: schoolDistrict,
        floodZone: floodZone,
        zoning: zoning,
        // Payment details
        monthlyPayment: monthlyPayment,
        paymentSchedule: paymentSchedule,
        firstPaymentDate: status === 'funded' || status === 'closed' ? new Date(new Date(dateCreated).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        balloonPayment: loanAmount * 1.1,
        lateFee: '5% of payment amount',
        prepaymentPenalty: Math.random() > 0.5 ? "".concat(Math.floor(Math.random() * 3) + 1, "% if paid off in first ").concat(Math.floor(Math.random() * 6) + 6, " months") : 'None',
        extensionOptions: Math.random() > 0.5 ? "".concat(Math.floor(Math.random() * 2) + 1, " extensions of ").concat(Math.floor(Math.random() * 3) + 1, " months each") : 'None',
        // Entity information
        entityName: entityName,
        entityType: entityType,
        ein: maskedEin,
        stateOfFormation: stateOfFormation,
        yearEstablished: yearEstablished,
        // Holding costs
        holdingCosts: holdingCosts,
        documents: [
            {
                category: 'financial',
                files: [
                    {
                        filename: 'proof_of_funds.html',
                        uploadDate: dateCreated,
                        status: 'approved',
                    },
                    {
                        filename: 'personal_financial_statement.html',
                        uploadDate: dateCreated,
                        status: 'pending',
                    }
                ]
            },
            {
                category: 'property',
                files: [
                    {
                        filename: 'property_photos.html',
                        uploadDate: dateCreated,
                        status: 'pending',
                    },
                    {
                        filename: 'rehab_scope_of_work.html',
                        uploadDate: dateCreated,
                        status: 'pending',
                    }
                ]
            },
            {
                category: 'legal',
                files: [
                    {
                        filename: 'purchase_contract.html',
                        uploadDate: dateCreated,
                        status: 'pending',
                    },
                    {
                        filename: 'deed_of_trust.html',
                        uploadDate: dateCreated,
                        status: 'pending',
                    }
                ]
            },
            {
                category: 'loan',
                files: [
                    {
                        filename: 'promissory_note.html',
                        uploadDate: dateCreated,
                        status: 'pending',
                    },
                    {
                        filename: 'draw_schedule.html',
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
        var fundingDate = new Date(baseLoan.fundingDate);
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
    var loan = __assign(__assign({}, baseLoan), overrides);
    // Comment out the automatic generation of fake documents to prevent preloading
    // This is likely contributing to the PDF file issue
    /*
    setTimeout(async () => {
      try {
        await loanDocumentService.generateFakeDocuments(loan.id, loan.loanType);
      } catch (error) {
        console.error('Error generating fake documents in timeout:', error);
      }
    }, 100);
    */
    return loan;
}
// Generate multiple loans
function generateLoans(count) {
    return Array(count).fill(null).map(function () { return generateLoan(); });
}
