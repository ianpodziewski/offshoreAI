import { documentStyleService } from "../documentStyleService";
import { LoanData } from "../loanGenerator";

/**
 * Insurance Document Templates
 * Contains templates for various insurance documents required for real estate loans
 */

// Format date helper
const formatDate = (): string => {
  return new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2
  }).format(amount);
};

// Generate future date helper
const getFutureDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

// Base style for the document
const baseStyle = `
<style>
  .document {
    font-family: 'Arial', sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    color: #333;
  }
  .document-header {
    text-align: center;
    margin-bottom: 30px;
  }
  .document-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 5px;
    text-transform: uppercase;
  }
  .document-subtitle {
    font-size: 16px;
    margin-bottom: 20px;
  }
  .document-section {
    margin-bottom: 30px;
  }
  .section-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 15px;
    padding-bottom: 5px;
    border-bottom: 1px solid #ddd;
  }
  .subsection-title {
    font-size: 16px;
    font-weight: bold;
    margin: 10px 0;
  }
  .info-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  .info-table th, .info-table td {
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  .info-table th {
    width: 35%;
    font-weight: bold;
    background-color: #f5f5f5;
  }
  .signature-section {
    margin-top: 50px;
    page-break-inside: avoid;
  }
  .signature-line {
    border-top: 1px solid #000;
    width: 50%;
    margin-top: 40px;
    margin-bottom: 5px;
  }
  .letterhead {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;
    border-bottom: 2px solid #2d5ca6;
    padding-bottom: 20px;
  }
  .letterhead-logo {
    font-size: 22px;
    font-weight: bold;
    color: #2d5ca6;
  }
  .letterhead-contact {
    font-size: 14px;
    text-align: right;
  }
  .notice {
    background-color: #f8f9fa;
    border-left: 4px solid #2d5ca6;
    padding: 15px;
    margin: 20px 0;
  }
  .highlight {
    background-color: #fffbd6;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
  }
  .warning {
    background-color: #fff3f3;
    border-left: 4px solid #dc3545;
    padding: 15px;
    margin: 20px 0;
  }
  .coverage-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  .coverage-table th, .coverage-table td {
    padding: 10px;
    text-align: left;
    border: 1px solid #ddd;
  }
  .coverage-table th {
    background-color: #f0f0f0;
    font-weight: bold;
  }
  .coverage-table tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  .footer {
    margin-top: 50px;
    font-size: 12px;
    color: #666;
    border-top: 1px solid #ddd;
    padding-top: 20px;
    text-align: center;
  }
  .policy-stamp {
    text-align: center;
    border: 2px solid #2d5ca6;
    padding: 10px;
    margin: 20px auto;
    width: 250px;
    color: #2d5ca6;
    font-weight: bold;
    text-transform: uppercase;
  }
  .grid-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 20px;
  }
  @media print {
    .document {
      padding: 0;
    }
    .page-break {
      page-break-before: always;
    }
  }
</style>`;

/**
 * Property Insurance Policy Template
 * Generates a comprehensive property insurance declaration page
 */
export const getPropertyInsurancePolicyTemplate = (loanData: LoanData): string => {
  const currentDate = formatDate();
  const policyNumber = `PIP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Calculate policy period (1 year)
  const policyStartDate = currentDate;
  const policyEndDate = getFutureDate(365);
  
  // Calculate insurance amounts
  const propertyValue = loanData.propertyValue || loanData.purchasePrice || (loanData.loanAmount * (100 / loanData.ltv));
  const buildingCoverage = Math.round(propertyValue * 0.9); // 90% of property value
  const contentsCoverage = Math.round(propertyValue * 0.2); // 20% of property value
  const liabilityCoverage = 1000000; // $1M liability
  const medicalCoverage = 5000; // $5K medical
  const lossOfRentsCoverage = Math.round((propertyValue * 0.08) / 12 * 6); // 6 months of estimated rental income
  
  // Calculate deductibles
  const standardDeductible = Math.max(1000, Math.min(5000, Math.round(propertyValue * 0.01 / 1000) * 1000));
  const windHailDeductible = standardDeductible * 2;
  const floodDeductible = standardDeductible * 2;
  const earthquakeDeductible = Math.round(propertyValue * 0.05); // 5% of property value
  
  // Calculate premium (simplified calculation)
  const annualPremiumRate = loanData.propertyType.includes("commercial") ? 0.008 : 0.006;
  const annualPremium = Math.round(buildingCoverage * annualPremiumRate);
  const monthlyPremium = Math.round(annualPremium / 12);
  
  // Generate insurance company information
  const insuranceCompanies = [
    {
      name: "Pacific Shield Insurance Group",
      address: "123 Underwriter Blvd, Hartford, CT 06103",
      phone: "(800) 555-7890",
      website: "www.pacificshieldinsurance.com",
      email: "claims@pacificshieldinsurance.com",
      rating: "A+ (Superior)"
    },
    {
      name: "Cornerstone Property & Casualty",
      address: "456 Risk Management Ave, Boston, MA 02110",
      phone: "(800) 999-8765",
      website: "www.cornerstoneproperty.com",
      email: "claims@cornerstoneproperty.com",
      rating: "A (Excellent)"
    },
    {
      name: "Liberty National Insurance Co.",
      address: "789 Protection Lane, Chicago, IL 60601",
      phone: "(800) 777-1234",
      website: "www.libertynationalins.com",
      email: "claims@libertynationalins.com",
      rating: "A++ (Superior)"
    }
  ];
  
  const insuranceCompany = insuranceCompanies[Math.floor(Math.random() * insuranceCompanies.length)];
  
  // Generate agent information
  const agents = [
    {
      name: "Robert Williams",
      company: "Williams Insurance Agency",
      address: "555 Broker Street, Suite 200, Boston, MA 02110",
      phone: "(617) 555-2345",
      email: "rwilliams@williamsinsurance.com",
      license: "BK-789456"
    },
    {
      name: "Jennifer Martinez",
      company: "Premier Insurance Solutions",
      address: "888 Coverage Lane, Suite 300, Boston, MA 02108",
      phone: "(617) 555-8765",
      email: "jmartinez@premierinsurance.com",
      license: "BK-456123"
    },
    {
      name: "Michael Chen",
      company: "Guardian Insurance Services",
      address: "777 Protection Plaza, Suite 150, Boston, MA 02116",
      phone: "(617) 555-9876",
      email: "mchen@guardianinsurance.com",
      license: "BK-123987"
    }
  ];
  
  const agent = agents[Math.floor(Math.random() * agents.length)];
  
  const content = `
    <div class="document">
      <div class="letterhead">
        <div class="letterhead-logo">
          ${insuranceCompany.name.toUpperCase()}
        </div>
        <div class="letterhead-contact">
          ${insuranceCompany.address}<br>
          ${insuranceCompany.phone}<br>
          ${insuranceCompany.website}<br>
          Rating: ${insuranceCompany.rating}
        </div>
      </div>
      
      <div class="document-header">
        <div class="document-title">Property Insurance Policy Declarations</div>
        <div class="document-subtitle">Policy Number: ${policyNumber}</div>
      </div>
      
      <div class="policy-stamp">POLICY DECLARATIONS</div>
      
      <div class="document-section">
        <div class="section-title">Policy Information</div>
        <table class="info-table">
          <tr>
            <th>Named Insured:</th>
            <td>${loanData.entityName || loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Mailing Address:</th>
            <td>${loanData.borrowerAddress || "Same as Property Address"}</td>
          </tr>
          <tr>
            <th>Policy Period:</th>
            <td>From: ${policyStartDate} To: ${policyEndDate} (12:01 AM Standard Time)</td>
          </tr>
          <tr>
            <th>Policy Type:</th>
            <td>${loanData.propertyType.includes("commercial") ? "Commercial Property" : "Investment Property"}</td>
          </tr>
          <tr>
            <th>Annual Premium:</th>
            <td>${formatCurrency(annualPremium)}</td>
          </tr>
          <tr>
            <th>Payment Schedule:</th>
            <td>Monthly: ${formatCurrency(monthlyPremium)} (Includes $5 installment fee)</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Property Information</div>
        <table class="info-table">
          <tr>
            <th>Insured Location:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Property Type:</th>
            <td>${loanData.propertyType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</td>
          </tr>
          <tr>
            <th>Year Built:</th>
            <td>${loanData.yearBuilt || "Not Provided"}</td>
          </tr>
          <tr>
            <th>Square Footage:</th>
            <td>${loanData.squareFootage ? loanData.squareFootage.toLocaleString() + " sq ft" : "Not Provided"}</td>
          </tr>
          <tr>
            <th>Construction Type:</th>
            <td>${loanData.propertyType.includes("commercial") ? "Masonry Non-Combustible" : "Frame"}</td>
          </tr>
          <tr>
            <th>Occupancy:</th>
            <td>${loanData.propertyType.includes("single_family") ? "Single Family Rental" : 
                  loanData.propertyType.includes("multi_family") ? "Multi-Family Rental" : 
                  "Commercial"}</td>
          </tr>
          <tr>
            <th>Protection Class:</th>
            <td>Class ${Math.floor(Math.random() * 5) + 1}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Coverage Summary</div>
        <table class="coverage-table">
          <tr>
            <th>Coverage</th>
            <th>Limit</th>
            <th>Deductible</th>
            <th>Premium</th>
          </tr>
          <tr>
            <td>Building</td>
            <td>${formatCurrency(buildingCoverage)}</td>
            <td>${formatCurrency(standardDeductible)}</td>
            <td>${formatCurrency(Math.round(annualPremium * 0.7))}</td>
          </tr>
          <tr>
            <td>Business Personal Property / Contents</td>
            <td>${formatCurrency(contentsCoverage)}</td>
            <td>${formatCurrency(standardDeductible)}</td>
            <td>${formatCurrency(Math.round(annualPremium * 0.1))}</td>
          </tr>
          <tr>
            <td>Loss of Rents / Business Income</td>
            <td>${formatCurrency(lossOfRentsCoverage)} (6 months)</td>
            <td>72 Hours</td>
            <td>${formatCurrency(Math.round(annualPremium * 0.1))}</td>
          </tr>
          <tr>
            <td>General Liability</td>
            <td>${formatCurrency(liabilityCoverage)} each occurrence<br>
                ${formatCurrency(liabilityCoverage * 2)} aggregate</td>
            <td>None</td>
            <td>${formatCurrency(Math.round(annualPremium * 0.08))}</td>
          </tr>
          <tr>
            <td>Medical Payments</td>
            <td>${formatCurrency(medicalCoverage)} per person</td>
            <td>None</td>
            <td>${formatCurrency(Math.round(annualPremium * 0.02))}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right; font-weight: bold;">Total Annual Premium:</td>
            <td style="font-weight: bold;">${formatCurrency(annualPremium)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Optional Coverages & Endorsements</div>
        <table class="coverage-table">
          <tr>
            <th>Coverage</th>
            <th>Limit</th>
            <th>Deductible</th>
            <th>Included</th>
          </tr>
          <tr>
            <td>Ordinance or Law</td>
            <td>25% of Building Limit</td>
            <td>Same as Building</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>Equipment Breakdown</td>
            <td>Building Limit</td>
            <td>${formatCurrency(standardDeductible)}</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>Wind/Hail</td>
            <td>Building Limit</td>
            <td>${formatCurrency(windHailDeductible)}</td>
            <td>Yes</td>
          </tr>
          <tr>
            <td>Flood</td>
            <td>Not Covered</td>
            <td>N/A</td>
            <td>No</td>
          </tr>
          <tr>
            <td>Earthquake</td>
            <td>Not Covered</td>
            <td>N/A</td>
            <td>No</td>
          </tr>
        </table>
        
        <div class="notice">
          <p><strong>Note:</strong> Flood and Earthquake coverages are not included in this policy. Separate policies may be required for these perils.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Mortgagee / Loss Payee</div>
        <table class="info-table">
          <tr>
            <th>Mortgagee:</th>
            <td>Harrington Capital Partners<br>
                123 Financial Plaza, Suite 400<br>
                Boston, MA 02110<br>
                Loan #: ${loanData.id}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Additional Information</div>
        <ul>
          <li>This is a summary of your insurance coverage. Please refer to your policy for complete terms, conditions, limitations, and exclusions.</li>
          <li>This policy is subject to minimum earned premium of 25%.</li>
          <li>Cancellation by insured: Short rate penalty may apply.</li>
          <li>Cancellation by company: Pro-rata return premium.</li>
          <li>Policy forms: ${policyNumber.substring(0, 3)}${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 900) + 100}</li>
        </ul>
      </div>
      
      <div class="document-section">
        <div class="section-title">Claims Information</div>
        <p>To report a claim, please contact:</p>
        <p>
          <strong>Claims Department</strong><br>
          Phone: ${insuranceCompany.phone} (24/7 Claims Hotline)<br>
          Email: ${insuranceCompany.email}<br>
          Online: ${insuranceCompany.website}/claims
        </p>
        <div class="highlight">
          <p>Please have your policy number available when reporting a claim.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Producer / Agent Information</div>
        <table class="info-table">
          <tr>
            <th>Agent:</th>
            <td>${agent.name}</td>
          </tr>
          <tr>
            <th>Agency:</th>
            <td>${agent.company}</td>
          </tr>
          <tr>
            <th>Address:</th>
            <td>${agent.address}</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>${agent.phone}</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>${agent.email}</td>
          </tr>
          <tr>
            <th>License #:</th>
            <td>${agent.license}</td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <p>Countersigned and dated at ${insuranceCompany.address.split(',')[0]}:</p>
        <div style="margin-top: 20px;">
          <div class="signature-line"></div>
          <p>Authorized Representative</p>
        </div>
        <p>Issue Date: ${currentDate}</p>
      </div>
      
      <div class="footer">
        <p>THIS DECLARATIONS PAGE, ALONG WITH THE COMMON POLICY CONDITIONS, COVERAGE FORM(S) AND ENDORSEMENTS, COMPLETES THE POLICY.</p>
        <p>Policy Number: ${policyNumber} | Insured: ${loanData.entityName || loanData.borrowerName} | Effective: ${policyStartDate}</p>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Property Insurance Policy Declarations - ${loanData.borrowerName}`, content);
};

/**
 * Flood Insurance Policy Template
 * Generates a comprehensive flood insurance declaration page based on NFIP standards
 */
export const getFloodInsurancePolicyTemplate = (loanData: LoanData): string => {
  const currentDate = formatDate();
  const policyNumber = `FIP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Calculate policy period (1 year)
  const policyStartDate = currentDate;
  const policyEndDate = getFutureDate(365);
  
  // Calculate insurance amounts
  const propertyValue = loanData.propertyValue || loanData.purchasePrice || (loanData.loanAmount * (100 / loanData.ltv));
  const buildingCoverage = Math.min(500000, Math.round(propertyValue * 0.8)); // NFIP limit is $500K for commercial
  const contentsCoverage = Math.min(100000, Math.round(propertyValue * 0.2)); // NFIP limit is $100K for contents
  
  // Calculate deductibles and premiums
  const buildingDeductible = 5000; // Standard NFIP deductible
  const contentsDeductible = 5000; // Standard NFIP deductible
  
  // Determine flood zone (simplified)
  const floodZones = ['X', 'A', 'AE', 'AH', 'AO', 'V', 'VE'];
  const floodZone = loanData.floodZone || floodZones[Math.floor(Math.random() * floodZones.length)];
  
  // Calculate premium based on flood zone (simplified)
  const isHighRiskZone = ['A', 'AE', 'AH', 'AO', 'V', 'VE'].includes(floodZone);
  let annualPremium = 0;
  
  if (isHighRiskZone) {
    annualPremium = Math.round(buildingCoverage * 0.007); // 0.7% for high-risk zones
  } else {
    annualPremium = Math.round(buildingCoverage * 0.003); // 0.3% for moderate to low-risk zones
  }
  
  // Calculate ICC premium (Increased Cost of Compliance)
  const iccPremium = isHighRiskZone ? 75 : 6;
  
  // Calculate total premium
  const totalPremium = annualPremium + iccPremium;
  const federalPolicyFee = 25;
  const reserveFundAssessment = Math.round(totalPremium * 0.18); // 18% of premium
  const hfiaaAssessment = isHighRiskZone ? Math.round(totalPremium * 0.15) : 25; // 15% of premium for high-risk
  const totalWithFees = totalPremium + federalPolicyFee + reserveFundAssessment + hfiaaAssessment;
  
  // Community information (simplified)
  const communityNumber = `${loanData.state || 'MA'}${Math.floor(1000 + Math.random() * 9000)}`;
  
  // Replacement Cost Value calculation
  const replacementCost = Math.round(propertyValue * 1.2); // 120% of property value
  
  // Generate insurance company information
  // For flood insurance, we'll use "NFIP Direct" or servicing companies
  const floodInsurers = [
    {
      name: "NFIP Direct",
      address: "P.O. Box 2965, Shawnee Mission, KS 66201",
      phone: "(800) 638-6620",
      website: "www.fema.gov/nfip",
      email: "info@nfipdirect.fema.gov"
    },
    {
      name: "Wright Flood Insurance Services",
      address: "801 94th Avenue North, St. Petersburg, FL 33702",
      phone: "(866) 373-5663",
      website: "www.wrightflood.com",
      email: "floodcustomercare@weareflood.com"
    },
    {
      name: "Selective Flood",
      address: "40 Wantage Avenue, Branchville, NJ 07890",
      phone: "(877) 348-0552",
      website: "www.selectiveflood.com",
      email: "floodcustomerservice@selective.com"
    }
  ];
  
  const insurer = floodInsurers[Math.floor(Math.random() * floodInsurers.length)];
  
  // Generate agent information
  const agents = [
    {
      name: "Robert Williams",
      company: "Williams Insurance Agency",
      address: "555 Broker Street, Suite 200, Boston, MA 02110",
      phone: "(617) 555-2345",
      email: "rwilliams@williamsinsurance.com",
      license: "BK-789456"
    },
    {
      name: "Jennifer Martinez",
      company: "Premier Insurance Solutions",
      address: "888 Coverage Lane, Suite 300, Boston, MA 02108",
      phone: "(617) 555-8765",
      email: "jmartinez@premierinsurance.com",
      license: "BK-456123"
    },
    {
      name: "Michael Chen",
      company: "Guardian Insurance Services",
      address: "777 Protection Plaza, Suite 150, Boston, MA 02116",
      phone: "(617) 555-9876",
      email: "mchen@guardianinsurance.com",
      license: "BK-123987"
    }
  ];
  
  const agent = agents[Math.floor(Math.random() * agents.length)];
  
  const content = `
    <div class="document">
      <div class="letterhead">
        <div class="letterhead-logo">
          ${insurer.name.toUpperCase()}
        </div>
        <div class="letterhead-contact">
          ${insurer.address}<br>
          ${insurer.phone}<br>
          ${insurer.website}<br>
          FEMA/NFIP Approved Provider
        </div>
      </div>
      
      <div class="document-header">
        <div class="document-title">Flood Insurance Policy Declarations</div>
        <div class="document-subtitle">Policy Number: ${policyNumber}</div>
      </div>
      
      <div class="policy-stamp">FLOOD INSURANCE DECLARATIONS</div>
      
      <div class="document-section">
        <div class="section-title">Policy Information</div>
        <table class="info-table">
          <tr>
            <th>Named Insured:</th>
            <td>${loanData.entityName || loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Mailing Address:</th>
            <td>${loanData.borrowerAddress || "Same as Property Address"}</td>
          </tr>
          <tr>
            <th>Policy Period:</th>
            <td>From: ${policyStartDate} To: ${policyEndDate} (12:01 AM Standard Time)</td>
          </tr>
          <tr>
            <th>Policy Form:</th>
            <td>${loanData.propertyType.includes("commercial") ? "General Property Form" : "Standard Flood Insurance Policy"}</td>
          </tr>
          <tr>
            <th>Community Number:</th>
            <td>${communityNumber}</td>
          </tr>
          <tr>
            <th>Flood Zone:</th>
            <td>${floodZone}${isHighRiskZone ? " (High Risk)" : " (Moderate/Low Risk)"}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Property Information</div>
        <table class="info-table">
          <tr>
            <th>Insured Location:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Property Type:</th>
            <td>${loanData.propertyType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</td>
          </tr>
          <tr>
            <th>Building Occupancy:</th>
            <td>${loanData.propertyType.includes("commercial") ? "Non-Residential" : "Other Residential"}</td>
          </tr>
          <tr>
            <th>Number of Floors:</th>
            <td>${loanData.propertyType.includes("single_family") ? "1-2" : 
                  loanData.propertyType.includes("multi_family") ? "2-4" : 
                  loanData.propertyType.includes("multi_family_5plus") ? "5+" : "1-2"}</td>
          </tr>
          <tr>
            <th>Building Description:</th>
            <td>${loanData.propertyType.includes("single_family") ? "Single Family" : 
                  loanData.propertyType.includes("multi_family") ? "Multi-Family" : 
                  "Non-Residential Building"}</td>
          </tr>
          <tr>
            <th>Replacement Cost Value:</th>
            <td>${formatCurrency(replacementCost)}</td>
          </tr>
          <tr>
            <th>Base Flood Elevation:</th>
            <td>${isHighRiskZone ? Math.floor(Math.random() * 20) + 5 + " feet" : "N/A"}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Coverage Summary</div>
        <table class="coverage-table">
          <tr>
            <th>Coverage</th>
            <th>Limit</th>
            <th>Deductible</th>
            <th>Premium</th>
          </tr>
          <tr>
            <td>Building Coverage</td>
            <td>${formatCurrency(buildingCoverage)}</td>
            <td>${formatCurrency(buildingDeductible)}</td>
            <td>${formatCurrency(annualPremium)}</td>
          </tr>
          <tr>
            <td>Contents Coverage</td>
            <td>${formatCurrency(contentsCoverage)}</td>
            <td>${formatCurrency(contentsDeductible)}</td>
            <td>${formatCurrency(0)}</td>
          </tr>
          <tr>
            <td>Increased Cost of Compliance (ICC)</td>
            <td>${formatCurrency(30000)}</td>
            <td>N/A</td>
            <td>${formatCurrency(iccPremium)}</td>
          </tr>
          <tr>
            <td colspan="3">Subtotal</td>
            <td>${formatCurrency(totalPremium)}</td>
          </tr>
          <tr>
            <td colspan="3">Federal Policy Fee</td>
            <td>${formatCurrency(federalPolicyFee)}</td>
          </tr>
          <tr>
            <td colspan="3">Reserve Fund Assessment (18%)</td>
            <td>${formatCurrency(reserveFundAssessment)}</td>
          </tr>
          <tr>
            <td colspan="3">HFIAA Surcharge</td>
            <td>${formatCurrency(hfiaaAssessment)}</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: right; font-weight: bold;">Total Annual Premium:</td>
            <td style="font-weight: bold;">${formatCurrency(totalWithFees)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Additional Information</div>
        <ul>
          <li>This policy meets the federal mandatory purchase requirement for properties in high-risk flood zones.</li>
          <li>30-day waiting period may apply to new policies unless for loan closing or map revision.</li>
          <li>Coverage is subject to the terms and conditions of the Standard Flood Insurance Policy.</li>
          <li>This policy does not provide coverage for damage to land, landscaping, decks, fences, or swimming pools.</li>
          <li>Some items in basements and below-lowest-elevated-floor have limited or no coverage.</li>
        </ul>
        
        <div class="warning">
          <p><strong>Important Notice:</strong> This policy provides coverage on a replacement cost basis only if the insured property is your principal residence and the building is insured to at least 80% of its replacement cost.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Mortgagee / Loss Payee</div>
        <table class="info-table">
          <tr>
            <th>First Mortgagee:</th>
            <td>Harrington Capital Partners<br>
                123 Financial Plaza, Suite 400<br>
                Boston, MA 02110<br>
                Loan #: ${loanData.id}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Claims Information</div>
        <p>In the event of flood damage, contact your agent or insurer immediately. To file a claim:</p>
        <ol>
          <li>Call ${insurer.phone} or visit ${insurer.website}</li>
          <li>Have your policy number and contact information ready</li>
          <li>Take photos of all damaged property before removing or disposing of items</li>
          <li>Create a detailed inventory of all damaged property</li>
        </ol>
        <div class="highlight">
          <p>Claims should be reported as soon as possible, but no later than 60 days after the date of loss.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Producer / Agent Information</div>
        <table class="info-table">
          <tr>
            <th>Agent:</th>
            <td>${agent.name}</td>
          </tr>
          <tr>
            <th>Agency:</th>
            <td>${agent.company}</td>
          </tr>
          <tr>
            <th>Address:</th>
            <td>${agent.address}</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>${agent.phone}</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>${agent.email}</td>
          </tr>
          <tr>
            <th>License #:</th>
            <td>${agent.license}</td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <p>This policy is issued pursuant to the National Flood Insurance Act of 1968, as amended, and applicable Federal Regulations.</p>
        <div style="margin-top: 20px;">
          <div class="signature-line"></div>
          <p>Authorized Representative</p>
        </div>
        <p>Issue Date: ${currentDate}</p>
      </div>
      
      <div class="footer">
        <p>THIS DECLARATIONS PAGE IS NOT A COMPLETE POLICY DOCUMENT. PLEASE REFER TO THE STANDARD FLOOD INSURANCE POLICY FOR COMPLETE TERMS AND CONDITIONS.</p>
        <p>Policy Number: ${policyNumber} | Insured: ${loanData.entityName || loanData.borrowerName} | Effective: ${policyStartDate}</p>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Flood Insurance Policy Declarations - ${loanData.borrowerName}`, content);
};

/**
 * Builder's Risk Policy Template
 * Generates a comprehensive builder's risk insurance policy for construction/renovation projects
 */
export const getBuildersRiskPolicyTemplate = (loanData: LoanData): string => {
  const currentDate = formatDate();
  const policyNumber = `BRP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Calculate policy period (based on loan term or fixed duration)
  const policyStartDate = currentDate;
  const constructionDuration = 12; // Default to 12 months
  const policyEndDate = getFutureDate(constructionDuration * 30);
  
  // Calculate insurance amounts
  const projectValue = loanData.propertyValue || loanData.purchasePrice || (loanData.loanAmount * (100 / loanData.ltv));
  const constructionCost = Math.round(projectValue * 0.7); // Estimate construction cost as 70% of total value
  
  // Calculate coverage limits based on construction cost
  const basicCoverage = constructionCost; // Full value of construction
  const extendedCoverage = Math.round(constructionCost * 0.1); // 10% for extended coverage
  const debrisCoverage = Math.round(constructionCost * 0.05); // 5% for debris removal
  const transitCoverage = Math.round(constructionCost * 0.02); // 2% for materials in transit
  const tempStructuresCoverage = Math.round(constructionCost * 0.03); // 3% for temporary structures
  
  // Calculate deductibles
  const standardDeductible = Math.max(2500, Math.min(10000, Math.round(constructionCost * 0.005))); // 0.5% with min and max
  const waterDeductible = standardDeductible * 2; // Double for water damage
  const windDeductible = Math.round(constructionCost * 0.02); // 2% for wind/hail
  
  // Calculate premium (simplified calculation)
  const ratePerHundred = 0.35; // $0.35 per $100 of construction cost
  const annualPremium = Math.round((constructionCost / 100) * ratePerHundred);
  const totalPremium = Math.round(annualPremium * (constructionDuration / 12)); // Prorated for construction period
  
  // Add taxes and fees
  const taxRate = 0.0275; // 2.75% tax rate
  const taxes = Math.round(totalPremium * taxRate);
  const policyFee = 250;
  const totalWithFees = totalPremium + taxes + policyFee;
  
  // Generate insurance company information
  const insuranceCompanies = [
    {
      name: "Builders Guard Insurance",
      address: "789 Construction Way, Hartford, CT 06103",
      phone: "(800) 555-4321",
      website: "www.buildersguardinsurance.com",
      email: "claims@buildersguardinsurance.com",
      rating: "A (Excellent)"
    },
    {
      name: "ProjectShield Insurance Company",
      address: "456 Development Blvd, Chicago, IL 60601",
      phone: "(800) 777-5432",
      website: "www.projectshieldinsurance.com",
      email: "claims@projectshieldinsurance.com",
      rating: "A+ (Superior)"
    },
    {
      name: "Construction Risk Specialists",
      address: "123 Builder's Plaza, Dallas, TX 75201",
      phone: "(800) 888-9876",
      website: "www.constructionriskspecialists.com",
      email: "claims@constructionriskspecialists.com",
      rating: "A (Excellent)"
    }
  ];
  
  const insuranceCompany = insuranceCompanies[Math.floor(Math.random() * insuranceCompanies.length)];
  
  // Generate agent information
  const agents = [
    {
      name: "Thomas Reynolds",
      company: "Reynolds Construction Insurance",
      address: "555 Builder Street, Suite 300, Boston, MA 02110",
      phone: "(617) 555-7890",
      email: "treynolds@reynoldsins.com",
      license: "BK-345678"
    },
    {
      name: "Sarah Johnson",
      company: "Project Insurance Solutions",
      address: "888 Development Lane, Suite 400, Boston, MA 02108",
      phone: "(617) 555-3456",
      email: "sjohnson@projectinsurance.com",
      license: "BK-567123"
    },
    {
      name: "David Washington",
      company: "Builder's Risk Partners",
      address: "777 Construction Plaza, Suite 250, Boston, MA 02116",
      phone: "(617) 555-8901",
      email: "dwashington@buildersriskpartners.com",
      license: "BK-890123"
    }
  ];
  
  const agent = agents[Math.floor(Math.random() * agents.length)];
  
  // Generate contractor information (if not specified in loan data)
  const contractors = [
    {
      name: "Prestige Construction Group",
      address: "123 Builder's Avenue, Boston, MA 02110",
      phone: "(617) 555-2468",
      license: "GC-987654"
    },
    {
      name: "Elite Development & Construction",
      address: "456 Contractor Lane, Boston, MA 02108",
      phone: "(617) 555-1357",
      license: "GC-876543"
    },
    {
      name: "Cornerstone Builders Inc.",
      address: "789 Construction Boulevard, Boston, MA 02116",
      phone: "(617) 555-9753",
      license: "GC-765432"
    }
  ];
  
  const contractor = contractors[Math.floor(Math.random() * contractors.length)];
  
  const content = `
    <div class="document">
      <div class="letterhead">
        <div class="letterhead-logo">
          ${insuranceCompany.name.toUpperCase()}
        </div>
        <div class="letterhead-contact">
          ${insuranceCompany.address}<br>
          ${insuranceCompany.phone}<br>
          ${insuranceCompany.website}<br>
          Rating: ${insuranceCompany.rating}
        </div>
      </div>
      
      <div class="document-header">
        <div class="document-title">Builder's Risk Insurance Policy</div>
        <div class="document-subtitle">Policy Number: ${policyNumber}</div>
      </div>
      
      <div class="policy-stamp">BUILDER'S RISK DECLARATIONS</div>
      
      <div class="document-section">
        <div class="section-title">Policy Information</div>
        <table class="info-table">
          <tr>
            <th>Named Insured:</th>
            <td>${loanData.entityName || loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Mailing Address:</th>
            <td>${loanData.borrowerAddress || "Same as Project Address"}</td>
          </tr>
          <tr>
            <th>Policy Period:</th>
            <td>From: ${policyStartDate} To: ${policyEndDate} (12:01 AM Standard Time)</td>
          </tr>
          <tr>
            <th>Policy Type:</th>
            <td>Builder's Risk - All Risk Form</td>
          </tr>
          <tr>
            <th>Project Type:</th>
            <td>${loanData.loanPurpose && loanData.loanPurpose.includes("renovation") ? "Renovation" : 
                  loanData.loanPurpose && loanData.loanPurpose.includes("construction") ? "New Construction" : 
                  "Building Renovation/Construction"}</td>
          </tr>
          <tr>
            <th>Construction Type:</th>
            <td>${loanData.propertyType.includes("commercial") ? "Non-Combustible/Masonry" : 
                  loanData.propertyType.includes("multi_family") ? "Joisted Masonry" : "Frame"}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Project Information</div>
        <table class="info-table">
          <tr>
            <th>Project Location:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Project Description:</th>
            <td>${loanData.loanPurpose && loanData.loanPurpose.includes("renovation") ? 
                  "Complete renovation of existing " + loanData.propertyType.replace(/_/g, " ") + " property" : 
                  loanData.loanPurpose && loanData.loanPurpose.includes("construction") ? 
                  "New construction of " + loanData.propertyType.replace(/_/g, " ") + " property" : 
                  "Building renovation/construction project"}</td>
          </tr>
          <tr>
            <th>Project Value:</th>
            <td>${formatCurrency(projectValue)}</td>
          </tr>
          <tr>
            <th>Construction Cost:</th>
            <td>${formatCurrency(constructionCost)}</td>
          </tr>
          <tr>
            <th>Estimated Completion:</th>
            <td>${policyEndDate}</td>
          </tr>
          <tr>
            <th>Square Footage:</th>
            <td>${loanData.squareFootage ? loanData.squareFootage.toLocaleString() + " sq ft" : "Not Provided"}</td>
          </tr>
          <tr>
            <th>Number of Stories:</th>
            <td>${loanData.propertyType.includes("single_family") ? "1-2" : 
                  loanData.propertyType.includes("multi_family") ? "2-4" : 
                  loanData.propertyType.includes("multi_family_5plus") ? "5+" : "1-3"}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Contractor Information</div>
        <table class="info-table">
          <tr>
            <th>General Contractor:</th>
            <td>${contractor.name}</td>
          </tr>
          <tr>
            <th>Contractor Address:</th>
            <td>${contractor.address}</td>
          </tr>
          <tr>
            <th>Contractor Phone:</th>
            <td>${contractor.phone}</td>
          </tr>
          <tr>
            <th>Contractor License:</th>
            <td>${contractor.license}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Coverage Summary</div>
        <table class="coverage-table">
          <tr>
            <th>Coverage</th>
            <th>Limit</th>
            <th>Deductible</th>
          </tr>
          <tr>
            <td>Covered Property (Hard Costs)</td>
            <td>${formatCurrency(basicCoverage)}</td>
            <td>${formatCurrency(standardDeductible)}</td>
          </tr>
          <tr>
            <td>Extended Coverage (Soft Costs)</td>
            <td>${formatCurrency(extendedCoverage)}</td>
            <td>${formatCurrency(standardDeductible)}</td>
          </tr>
          <tr>
            <td>Property in Transit</td>
            <td>${formatCurrency(transitCoverage)}</td>
            <td>${formatCurrency(standardDeductible)}</td>
          </tr>
          <tr>
            <td>Temporary Structures</td>
            <td>${formatCurrency(tempStructuresCoverage)}</td>
            <td>${formatCurrency(standardDeductible)}</td>
          </tr>
          <tr>
            <td>Debris Removal</td>
            <td>${formatCurrency(debrisCoverage)}</td>
            <td>${formatCurrency(standardDeductible)}</td>
          </tr>
          <tr>
            <td>Water Damage</td>
            <td>Included in Covered Property</td>
            <td>${formatCurrency(waterDeductible)}</td>
          </tr>
          <tr>
            <td>Wind/Hail Damage</td>
            <td>Included in Covered Property</td>
            <td>${formatCurrency(windDeductible)} or ${Math.round(constructionCost * 0.02)}% of value</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Premium Details</div>
        <table class="info-table">
          <tr>
            <th>Base Premium:</th>
            <td>${formatCurrency(totalPremium)}</td>
          </tr>
          <tr>
            <th>Tax (${(taxRate * 100).toFixed(2)}%):</th>
            <td>${formatCurrency(taxes)}</td>
          </tr>
          <tr>
            <th>Policy Fee:</th>
            <td>${formatCurrency(policyFee)}</td>
          </tr>
          <tr class="highlight">
            <th>Total Premium:</th>
            <td>${formatCurrency(totalWithFees)}</td>
          </tr>
          <tr>
            <th>Payment Terms:</th>
            <td>Premium is fully earned at policy inception</td>
          </tr>
        </table>
        
        <div class="notice">
          <p><strong>Note:</strong> This policy does not automatically extend beyond the expiration date. If the project is not completed by the expiration date, you must request an extension prior to expiration.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Policy Provisions & Exclusions</div>
        <div class="subsection-title">Covered Causes of Loss:</div>
        <p>This policy provides "all-risk" coverage for direct physical loss or damage to covered property, subject to the exclusions and limitations in the policy.</p>
        
        <div class="subsection-title">Key Exclusions:</div>
        <ul>
          <li>Earthquake, unless endorsement is added</li>
          <li>Flood, unless endorsement is added</li>
          <li>Acts of terrorism, unless endorsed</li>
          <li>Employee theft and dishonesty</li>
          <li>Mechanical breakdown</li>
          <li>Design error or faulty workmanship (consequences of faulty workmanship may be covered)</li>
          <li>Normal wear and tear, deterioration</li>
          <li>Delay, loss of market, loss of use</li>
          <li>Mold and fungus (limited coverage may apply)</li>
        </ul>
        
        <div class="subsection-title">Policy Conditions:</div>
        <ul>
          <li>Monthly reporting of increases in project value may be required</li>
          <li>Site security measures must be maintained at all times</li>
          <li>Fire protection requirements must be met</li>
          <li>All work must be performed in accordance with building codes</li>
          <li>Proper storage of materials and equipment is required</li>
        </ul>
      </div>
      
      <div class="document-section">
        <div class="section-title">Endorsements & Special Conditions</div>
        <table class="coverage-table">
          <tr>
            <th>Endorsement</th>
            <th>Description</th>
            <th>Status</th>
          </tr>
          <tr>
            <td>Testing Coverage</td>
            <td>Coverage for damage during testing of systems</td>
            <td>Included</td>
          </tr>
          <tr>
            <td>Permission to Occupy</td>
            <td>Allows partial occupancy during construction</td>
            <td>Included</td>
          </tr>
          <tr>
            <td>Scaffolding & Formwork</td>
            <td>Coverage for temporary structures</td>
            <td>Included</td>
          </tr>
          <tr>
            <td>Ordinance or Law</td>
            <td>Coverage for increased costs due to building codes</td>
            <td>Included</td>
          </tr>
          <tr>
            <td>Expediting Expenses</td>
            <td>Coverage for additional expenses to expedite repair</td>
            <td>Included</td>
          </tr>
          <tr>
            <td>Earthquake</td>
            <td>Coverage for earthquake damage</td>
            <td>Excluded</td>
          </tr>
          <tr>
            <td>Flood</td>
            <td>Coverage for flood damage</td>
            <td>Excluded</td>
          </tr>
        </table>
        
        <div class="warning">
          <p><strong>Important Notice:</strong> Separate policies or endorsements may be required for flood or earthquake coverage. Consult with your agent about these additional coverages.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Mortgagee / Loss Payee</div>
        <table class="info-table">
          <tr>
            <th>Mortgagee:</th>
            <td>Harrington Capital Partners<br>
                123 Financial Plaza, Suite 400<br>
                Boston, MA 02110<br>
                Loan #: ${loanData.id}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Claims Information</div>
        <p>In the event of loss or damage to covered property:</p>
        <ol>
          <li>Protect the property from further damage</li>
          <li>Contact your agent or call our claims department at ${insuranceCompany.phone}</li>
          <li>Submit a written notice of claim within 48 hours</li>
          <li>Document all damage with photographs</li>
          <li>Prepare an inventory of damaged property</li>
          <li>Cooperate with our claims adjuster during the investigation</li>
        </ol>
        <div class="highlight">
          <p>Claims should be reported as soon as possible after discovery of damage.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Producer / Agent Information</div>
        <table class="info-table">
          <tr>
            <th>Agent:</th>
            <td>${agent.name}</td>
          </tr>
          <tr>
            <th>Agency:</th>
            <td>${agent.company}</td>
          </tr>
          <tr>
            <th>Address:</th>
            <td>${agent.address}</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>${agent.phone}</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>${agent.email}</td>
          </tr>
          <tr>
            <th>License #:</th>
            <td>${agent.license}</td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <p>This policy is subject to all terms, conditions, limitations, and exclusions contained in the policy form and endorsements.</p>
        <div style="margin-top: 20px;">
          <div class="signature-line"></div>
          <p>Authorized Representative</p>
        </div>
        <p>Issue Date: ${currentDate}</p>
      </div>
      
      <div class="footer">
        <p>THIS DECLARATIONS PAGE, TOGETHER WITH THE BUILDER'S RISK POLICY FORM AND ENDORSEMENTS, COMPLETES THE POLICY.</p>
        <p>Policy Number: ${policyNumber} | Insured: ${loanData.entityName || loanData.borrowerName} | Project: ${loanData.propertyAddress}</p>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Builder's Risk Policy Declarations - ${loanData.borrowerName}`, content);
};

/**
 * General Liability Insurance Policy Template
 * Generates a comprehensive liability insurance policy for real estate owners/investors
 */
export const getLiabilityInsurancePolicyTemplate = (loanData: LoanData): string => {
  const currentDate = formatDate();
  const policyNumber = `LIP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Calculate policy period (1 year)
  const policyStartDate = currentDate;
  const policyEndDate = getFutureDate(365);
  
  // Calculate insurance amounts based on property type and value
  const propertyValue = loanData.propertyValue || loanData.purchasePrice || (loanData.loanAmount * (100 / loanData.ltv));
  
  // Set coverage limits based on property type
  let generalLiabilityPerOccurrence = 0;
  let generalLiabilityAggregate = 0;
  let productsCompletedOperations = 0;
  let personalAdvertisingInjury = 0;
  let medicalExpense = 0;
  let damageToRentedPremises = 0;
  
  // Adjust coverage limits based on property type and value
  if (loanData.propertyType.includes("commercial")) {
    generalLiabilityPerOccurrence = 1000000;
    generalLiabilityAggregate = 2000000;
    productsCompletedOperations = 2000000;
    personalAdvertisingInjury = 1000000;
    medicalExpense = 10000;
    damageToRentedPremises = 300000;
  } else if (loanData.propertyType.includes("multi_family_5plus")) {
    generalLiabilityPerOccurrence = 1000000;
    generalLiabilityAggregate = 2000000;
    productsCompletedOperations = 2000000;
    personalAdvertisingInjury = 1000000;
    medicalExpense = 5000;
    damageToRentedPremises = 100000;
  } else {
    // Single family or small multi-family
    generalLiabilityPerOccurrence = 500000;
    generalLiabilityAggregate = 1000000;
    productsCompletedOperations = 1000000;
    personalAdvertisingInjury = 500000;
    medicalExpense = 5000;
    damageToRentedPremises = 50000;
  }
  
  // For high-value properties, increase limits
  if (propertyValue > 2000000) {
    generalLiabilityPerOccurrence *= 2;
    generalLiabilityAggregate *= 2;
    productsCompletedOperations *= 2;
    personalAdvertisingInjury *= 2;
    damageToRentedPremises *= 2;
  }
  
  // Optional coverages
  const hasNonownedAutoLiability = Math.random() > 0.5;
  const hasEmployeeBenefitsLiability = loanData.propertyType.includes("commercial") || Math.random() > 0.7;
  const hasEmploymentPracticesLiability = loanData.propertyType.includes("commercial") || Math.random() > 0.8;
  
  // Calculate premium based on coverage limits and property type
  const baseRatePerThousand = loanData.propertyType.includes("commercial") ? 1.5 : 
                              loanData.propertyType.includes("multi_family_5plus") ? 1.2 :
                              loanData.propertyType.includes("multi_family") ? 0.9 : 0.6;
  
  const exposureBasis = Math.max(propertyValue / 1000, 100); // Minimum $100k exposure base
  const basePremium = Math.round(exposureBasis * baseRatePerThousand);
  
  // Additional premium for optional coverages
  const nonownedAutoPremium = hasNonownedAutoLiability ? 250 : 0;
  const employeeBenefitsPremium = hasEmployeeBenefitsLiability ? 350 : 0;
  const employmentPracticesPremium = hasEmploymentPracticesLiability ? 500 : 0;
  
  // Calculating taxes and fees
  const totalBasePremium = basePremium + nonownedAutoPremium + employeeBenefitsPremium + employmentPracticesPremium;
  const stateTax = Math.round(totalBasePremium * 0.02); // 2% state tax
  const policyFee = 150;
  const stampingFee = Math.round(totalBasePremium * 0.003); // 0.3% stamping fee
  
  const totalAnnualPremium = totalBasePremium + stateTax + policyFee + stampingFee;
  
  // Generate insurance company information
  const insuranceCompanies = [
    {
      name: "Guardian Liability Insurance",
      address: "789 Protection Way, Hartford, CT 06103",
      phone: "(800) 555-9876",
      website: "www.guardianliabilityins.com",
      email: "claims@guardianliabilityins.com",
      rating: "A+ (Superior)"
    },
    {
      name: "Landmark Commercial Insurance",
      address: "456 Assurance Blvd, Chicago, IL 60601",
      phone: "(800) 777-3456",
      website: "www.landmarkcommercialins.com",
      email: "claims@landmarkcommercial.com",
      rating: "A (Excellent)"
    },
    {
      name: "Superior Risk Solutions",
      address: "123 Coverage Plaza, Boston, MA 02110",
      phone: "(800) 888-1234",
      website: "www.superiorrisksolutions.com",
      email: "claims@superiorrisksolutions.com",
      rating: "A++ (Superior)"
    }
  ];
  
  const insuranceCompany = insuranceCompanies[Math.floor(Math.random() * insuranceCompanies.length)];
  
  // Generate agent information
  const agents = [
    {
      name: "Robert Williams",
      company: "Williams Insurance Agency",
      address: "555 Broker Street, Suite 200, Boston, MA 02110",
      phone: "(617) 555-2345",
      email: "rwilliams@williamsinsurance.com",
      license: "BK-789456"
    },
    {
      name: "Jennifer Martinez",
      company: "Premier Insurance Solutions",
      address: "888 Coverage Lane, Suite 300, Boston, MA 02108",
      phone: "(617) 555-8765",
      email: "jmartinez@premierinsurance.com",
      license: "BK-456123"
    },
    {
      name: "Michael Chen",
      company: "Guardian Insurance Services",
      address: "777 Protection Plaza, Suite 150, Boston, MA 02116",
      phone: "(617) 555-9876",
      email: "mchen@guardianinsurance.com",
      license: "BK-123987"
    }
  ];
  
  const agent = agents[Math.floor(Math.random() * agents.length)];
  
  const content = `
    <div class="document">
      <div class="letterhead">
        <div class="letterhead-logo">
          ${insuranceCompany.name.toUpperCase()}
        </div>
        <div class="letterhead-contact">
          ${insuranceCompany.address}<br>
          ${insuranceCompany.phone}<br>
          ${insuranceCompany.website}<br>
          Rating: ${insuranceCompany.rating}
        </div>
      </div>
      
      <div class="document-header">
        <div class="document-title">Commercial General Liability Insurance</div>
        <div class="document-subtitle">Policy Number: ${policyNumber}</div>
      </div>
      
      <div class="policy-stamp">DECLARATIONS PAGE</div>
      
      <div class="document-section">
        <div class="section-title">Named Insured & Mailing Address</div>
        <table class="info-table">
          <tr>
            <th>Named Insured:</th>
            <td>${loanData.entityName || loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Form of Business:</th>
            <td>${loanData.entityName ? "Corporation/LLC" : "Individual"}</td>
          </tr>
          <tr>
            <th>Mailing Address:</th>
            <td>${loanData.borrowerAddress || "Same as Location Address"}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Policy Information</div>
        <table class="info-table">
          <tr>
            <th>Policy Period:</th>
            <td>From: ${policyStartDate} To: ${policyEndDate} (12:01 AM Standard Time at the address of the Named Insured)</td>
          </tr>
          <tr>
            <th>Policy Type:</th>
            <td>Commercial General Liability</td>
          </tr>
          <tr>
            <th>Business Description:</th>
            <td>${loanData.propertyType.includes("commercial") ? "Commercial Real Estate Owner/Lessor" : 
                  "Residential Real Estate Owner/Lessor"}</td>
          </tr>
          <tr>
            <th>Policy Forms:</th>
            <td>CG 00 01 04 13 - Commercial General Liability Coverage Form<br>
                IL 00 17 11 98 - Common Policy Conditions<br>
                IL 00 21 09 08 - Nuclear Energy Liability Exclusion Endorsement</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Insured Location(s)</div>
        <table class="info-table">
          <tr>
            <th>Location 1:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Property Type:</th>
            <td>${loanData.propertyType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</td>
          </tr>
          <tr>
            <th>Square Footage:</th>
            <td>${loanData.squareFootage ? loanData.squareFootage.toLocaleString() + " sq ft" : "Not Provided"}</td>
          </tr>
          <tr>
            <th>Year Built:</th>
            <td>${loanData.yearBuilt || "Not Provided"}</td>
          </tr>
          <tr>
            <th>Construction Type:</th>
            <td>${loanData.propertyType.includes("commercial") ? "Masonry Non-Combustible" : "Frame"}</td>
          </tr>
          <tr>
            <th>Protection Class:</th>
            <td>Class ${Math.floor(Math.random() * 5) + 1}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Limits of Insurance</div>
        <table class="coverage-table">
          <tr>
            <th>Coverage</th>
            <th>Limits</th>
          </tr>
          <tr>
            <td>General Aggregate Limit</td>
            <td>${formatCurrency(generalLiabilityAggregate)}</td>
          </tr>
          <tr>
            <td>Products-Completed Operations Aggregate</td>
            <td>${formatCurrency(productsCompletedOperations)}</td>
          </tr>
          <tr>
            <td>Each Occurrence</td>
            <td>${formatCurrency(generalLiabilityPerOccurrence)}</td>
          </tr>
          <tr>
            <td>Personal & Advertising Injury</td>
            <td>${formatCurrency(personalAdvertisingInjury)}</td>
          </tr>
          <tr>
            <td>Damage to Premises Rented to You</td>
            <td>${formatCurrency(damageToRentedPremises)}</td>
          </tr>
          <tr>
            <td>Medical Expense (Any One Person)</td>
            <td>${formatCurrency(medicalExpense)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Optional Coverages</div>
        <table class="coverage-table">
          <tr>
            <th>Coverage</th>
            <th>Limits</th>
            <th>Included</th>
          </tr>
          <tr>
            <td>Hired & Non-Owned Auto Liability</td>
            <td>${hasNonownedAutoLiability ? formatCurrency(generalLiabilityPerOccurrence) : "N/A"}</td>
            <td>${hasNonownedAutoLiability ? "Yes" : "No"}</td>
          </tr>
          <tr>
            <td>Employee Benefits Liability</td>
            <td>${hasEmployeeBenefitsLiability ? formatCurrency(generalLiabilityPerOccurrence) + " Each Employee<br>" + formatCurrency(generalLiabilityAggregate) + " Aggregate" : "N/A"}</td>
            <td>${hasEmployeeBenefitsLiability ? "Yes" : "No"}</td>
          </tr>
          <tr>
            <td>Employment Practices Liability</td>
            <td>${hasEmploymentPracticesLiability ? formatCurrency(generalLiabilityPerOccurrence) + " Each Claim<br>" + formatCurrency(generalLiabilityAggregate) + " Aggregate" : "N/A"}</td>
            <td>${hasEmploymentPracticesLiability ? "Yes" : "No"}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Policy Endorsements</div>
        <table class="coverage-table">
          <tr>
            <th>Form Number</th>
            <th>Description</th>
          </tr>
          <tr>
            <td>CG 20 10 04 13</td>
            <td>Additional Insured - Owners, Lessees or Contractors</td>
          </tr>
          <tr>
            <td>CG 20 26 04 13</td>
            <td>Additional Insured - Designated Person or Organization</td>
          </tr>
          <tr>
            <td>CG 21 44 04 17</td>
            <td>Limitation of Coverage to Designated Premises or Project</td>
          </tr>
          <tr>
            <td>CG 21 47 12 07</td>
            <td>Employment-Related Practices Exclusion</td>
          </tr>
          <tr>
            <td>CG 21 49 09 99</td>
            <td>Total Pollution Exclusion Endorsement</td>
          </tr>
          <tr>
            <td>CG 21 67 12 04</td>
            <td>Fungi or Bacteria Exclusion</td>
          </tr>
          <tr>
            <td>CG 21 73 01 15</td>
            <td>Exclusion of Certified Acts of Terrorism</td>
          </tr>
          <tr>
            <td>IL 09 85 01 15</td>
            <td>Disclosure Pursuant to Terrorism Risk Insurance Act</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Additional Insureds</div>
        <table class="info-table">
          <tr>
            <th>Mortgagee/Lender:</th>
            <td>Harrington Capital Partners<br>
                123 Financial Plaza, Suite 400<br>
                Boston, MA 02110<br>
                Loan #: ${loanData.id}<br>
                Form: CG 20 26 04 13</td>
          </tr>
          <tr>
            <th>Other Additional Insureds:</th>
            <td>As required by written contract or agreement</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Premium Summary</div>
        <table class="info-table">
          <tr>
            <th>Base Premium:</th>
            <td>${formatCurrency(basePremium)}</td>
          </tr>
          ${hasNonownedAutoLiability ? `
          <tr>
            <th>Hired & Non-Owned Auto Liability:</th>
            <td>${formatCurrency(nonownedAutoPremium)}</td>
          </tr>` : ''}
          ${hasEmployeeBenefitsLiability ? `
          <tr>
            <th>Employee Benefits Liability:</th>
            <td>${formatCurrency(employeeBenefitsPremium)}</td>
          </tr>` : ''}
          ${hasEmploymentPracticesLiability ? `
          <tr>
            <th>Employment Practices Liability:</th>
            <td>${formatCurrency(employmentPracticesPremium)}</td>
          </tr>` : ''}
          <tr>
            <th>State Tax (2%):</th>
            <td>${formatCurrency(stateTax)}</td>
          </tr>
          <tr>
            <th>Policy Fee:</th>
            <td>${formatCurrency(policyFee)}</td>
          </tr>
          <tr>
            <th>Stamping Fee (0.3%):</th>
            <td>${formatCurrency(stampingFee)}</td>
          </tr>
          <tr class="highlight">
            <th>Total Annual Premium:</th>
            <td>${formatCurrency(totalAnnualPremium)}</td>
          </tr>
          <tr>
            <th>Payment Schedule:</th>
            <td>Pay in Full or Installment Plan Available (25% down + 9 monthly payments)</td>
          </tr>
        </table>
        
        <div class="notice">
          <p><strong>Premium Audit:</strong> The premium shown is subject to audit at policy expiration.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Important Policy Provisions</div>
        <div class="subsection-title">Duty to Defend:</div>
        <p>This policy includes the insurer's duty to defend the insured against any suit seeking damages for bodily injury, property damage, or personal and advertising injury covered by this policy.</p>
        
        <div class="subsection-title">Key Exclusions:</div>
        <ul>
          <li>Expected or intended injury</li>
          <li>Contractual liability (with exceptions)</li>
          <li>Liquor liability</li>
          <li>Workers' compensation and similar laws</li>
          <li>Pollution</li>
          <li>Aircraft, auto, or watercraft</li>
          <li>Mobile equipment</li>
          <li>War</li>
          <li>Damage to your product or work</li>
          <li>Electronic data</li>
          <li>Distribution of material in violation of statutes</li>
          <li>Employment-related practices</li>
          <li>Fungi or bacteria</li>
          <li>Certified acts of terrorism</li>
        </ul>
        
        <div class="warning">
          <p><strong>This is a summary only.</strong> Refer to the policy for complete coverage details, including additional exclusions, conditions, and limitations not listed here.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Claims Reporting Information</div>
        <p>Report all claims as soon as possible to:</p>
        <p>
          <strong>Claims Department</strong><br>
          Phone: ${insuranceCompany.phone} (24/7 Claims Hotline)<br>
          Email: ${insuranceCompany.email}<br>
          Online: ${insuranceCompany.website}/claims
        </p>
        <div class="highlight">
          <p>You must report all claims or potential claims immediately. Failure to promptly report claims may jeopardize coverage.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Producer / Agent Information</div>
        <table class="info-table">
          <tr>
            <th>Agent:</th>
            <td>${agent.name}</td>
          </tr>
          <tr>
            <th>Agency:</th>
            <td>${agent.company}</td>
          </tr>
          <tr>
            <th>Address:</th>
            <td>${agent.address}</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>${agent.phone}</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>${agent.email}</td>
          </tr>
          <tr>
            <th>License #:</th>
            <td>${agent.license}</td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <p>In witness whereof, the insurer has caused this policy to be executed and attested.</p>
        <div style="margin-top: 20px;">
          <div class="signature-line"></div>
          <p>Authorized Representative</p>
        </div>
        <p>Issue Date: ${currentDate}</p>
      </div>
      
      <div class="footer">
        <p>THIS DECLARATIONS PAGE, TOGETHER WITH THE COMMON POLICY CONDITIONS, COVERAGE FORM(S) AND ENDORSEMENTS, COMPLETES THE ABOVE NUMBERED POLICY.</p>
        <p>Policy Number: ${policyNumber} | Insured: ${loanData.entityName || loanData.borrowerName} | Effective: ${policyStartDate}</p>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Flood Insurance Policy Declarations - ${loanData.borrowerName}`, content);
};
