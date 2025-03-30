import { documentStyleService } from '../documentStyleService';
import { LoanData } from '../loanGenerator';

/**
 * Pre-Closing Documents Templates
 * Returns HTML strings for pre-closing document types
 */

// Format date helper
const formatDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format currency helper
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Generate future date helper
const getFutureDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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
    border-bottom: 2px solid #3a5a97;
    padding-bottom: 20px;
  }
  .letterhead-logo {
    font-size: 24px;
    font-weight: bold;
    color: #3a5a97;
  }
  .letterhead-contact {
    font-size: 14px;
    text-align: right;
  }
  .notice {
    background-color: #f8f9fa;
    border-left: 4px solid #3a5a97;
    padding: 15px;
    margin: 20px 0;
  }
  .highlight {
    background-color: #fffbd6;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
  }
  .approval-box {
    background-color: #e8f4f8;
    border: 1px solid #cce5ff;
    border-radius: 4px;
    padding: 15px;
    margin: 20px 0;
  }
  .terms-list {
    line-height: 1.6;
  }
  .address-block {
    margin-bottom: 40px;
  }
  .footer {
    margin-top: 50px;
    font-size: 12px;
    color: #666;
    border-top: 1px solid #ddd;
    padding-top: 20px;
  }
</style>`;

/**
 * Pre-Approval Letter Template
 * Simulates a professional lender pre-approval letter for real estate financing
 */
const getPreApprovalLetterTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const expirationDate = getFutureDate(90); // Pre-approval typically valid for 90 days
  
  // Generate loan officer information
  const loanOfficers = [
    { name: 'Jennifer Martinez', title: 'Senior Loan Officer', nmls: '123456', phone: '(555) 123-4567', email: 'jmartinez@hardmoneylender.com' },
    { name: 'Michael Thompson', title: 'VP of Lending', nmls: '789012', phone: '(555) 987-6543', email: 'mthompson@hardmoneylender.com' },
    { name: 'Sarah Johnson', title: 'Mortgage Loan Officer', nmls: '345678', phone: '(555) 234-5678', email: 'sjohnson@hardmoneylender.com' }
  ];
  
  const loanOfficer = loanOfficers[Math.floor(Math.random() * loanOfficers.length)];
  
  // Determine loan amounts and terms
  const maxLoanAmount = Math.round(loanData.loanAmount * 1.1 / 1000) * 1000; // 10% higher than requested amount
  const loanTermYears = loanData.loanTerm && loanData.loanTerm >= 12 ? Math.floor(loanData.loanTerm / 12) : 1;
  
  // Generate unique pre-approval ID
  const preApprovalId = `PA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Determine property type description
  const getPropertyTypeDescription = (type: string): string => {
    switch (type) {
      case 'single_family': return 'Single Family Residence';
      case 'multi_family_2_4': return 'Multi-Family Property (2-4 units)';
      case 'multi_family_5plus': return 'Multi-Family Property (5+ units)';
      case 'mixed_use': return 'Mixed Use Property';
      case 'retail': return 'Retail Property';
      case 'office': return 'Office Property';
      case 'industrial': return 'Industrial Property';
      case 'self_storage': return 'Self Storage Facility';
      case 'hotel_motel': return 'Hotel/Motel Property';
      default: return 'Investment Property';
    }
  };
  
  const content = `
    <div class="document">
      <div class="letterhead">
        <div class="letterhead-logo">
          HARRINGTON CAPITAL PARTNERS
        </div>
        <div class="letterhead-contact">
          123 Financial Plaza, Suite 400<br>
          Boston, MA 02110<br>
          (800) 555-1234<br>
          www.harringtoncapital.com<br>
          NMLS# 87654321
        </div>
      </div>
      
      <div class="document-header">
        <div class="document-title">Pre-Approval Letter</div>
        <div class="document-subtitle">Reference #: ${preApprovalId}</div>
      </div>
      
      <div class="address-block">
        <p>${formattedDate}</p>
        <p>
          <strong>RE: Pre-Approval for ${loanData.borrowerName}</strong><br>
          ${loanData.borrowerAddress || ''}
        </p>
        
        <p>To Whom It May Concern:</p>
      </div>
      
      <div class="document-section">
        <p>This letter is to confirm that <strong>${loanData.borrowerName}</strong> has been conditionally pre-approved for a ${loanData.loanType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Loan through Harrington Capital Partners, subject to the terms and conditions outlined below.</p>
        
        <div class="approval-box">
          <div class="subsection-title">Pre-Approval Details</div>
          <table class="info-table">
            <tr>
              <th>Maximum Loan Amount:</th>
              <td>${formatCurrency(maxLoanAmount)}</td>
            </tr>
            <tr>
              <th>Loan Type:</th>
              <td>${loanData.loanType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
            </tr>
            <tr>
              <th>Maximum LTV:</th>
              <td>${loanData.ltv}%</td>
            </tr>
            <tr>
              <th>Interest Rate Range:</th>
              <td>${loanData.interestRate - 0.5}% - ${loanData.interestRate + 0.5}% (subject to change)</td>
            </tr>
            <tr>
              <th>Loan Term:</th>
              <td>${loanData.loanTerm} months (${loanTermYears} ${loanTermYears === 1 ? 'year' : 'years'})</td>
            </tr>
            <tr>
              <th>Property Type:</th>
              <td>${getPropertyTypeDescription(loanData.propertyType)}</td>
            </tr>
            <tr>
              <th>Origination Fee:</th>
              <td>${loanData.originationFee} points</td>
            </tr>
            <tr>
              <th>Expiration Date:</th>
              <td>${expirationDate}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Conditions</div>
        <p>This pre-approval is subject to, but not limited to, the following conditions:</p>
        
        <ol class="terms-list">
          <li>Verification and approval of credit, income, assets, and employment history</li>
          <li>Satisfactory property appraisal supporting the purchase price</li>
          <li>Satisfactory property inspection report</li>
          <li>Clear title report with no unacceptable encumbrances</li>
          <li>Proof of hazard insurance with Harrington Capital Partners listed as mortgagee</li>
          <li>Verification of adequate reserves (minimum ${loanData.cashReserves ? `${loanData.cashReserves} months` : '3 months'} of PITIA payments)</li>
          <li>No material change in borrower's financial situation prior to closing</li>
          <li>Final underwriting approval based on complete documentation</li>
        </ol>
        
        <div class="notice">
          <p><strong>Note:</strong> This is not a commitment to lend and does not lock in an interest rate. Specific terms and conditions will be outlined in a Loan Commitment Letter after full underwriting approval.</p>
        </div>
      </div>
      
      <div class="document-section">
        <p>The pre-approval is based on the information provided to date and is valid until <strong>${expirationDate}</strong>. Any material changes to the information provided may void this pre-approval.</p>
        
        <p>Harrington Capital Partners specializes in providing financing solutions for real estate investors. We look forward to working with you to successfully fund your real estate investment projects.</p>
        
        <div class="highlight">
          <p>If you have any questions regarding this pre-approval or need additional information, please do not hesitate to contact me directly.</p>
        </div>
      </div>
      
      <div class="signature-section">
        <p>Sincerely,</p>
        <div class="signature-line"></div>
        <p>
          ${loanOfficer.name}<br>
          ${loanOfficer.title}<br>
          NMLS# ${loanOfficer.nmls}<br>
          ${loanOfficer.phone}<br>
          ${loanOfficer.email}
        </p>
      </div>
      
      <div class="footer">
        <p>This pre-approval letter is not an official loan commitment or guarantee of financing. All loans are subject to credit approval, verification, and underwriting by Harrington Capital Partners. Equal Housing Opportunity.</p>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Pre-Approval Letter - ${loanData.borrowerName}`, content);
};

/**
 * Fee Disclosure Template
 * Simulates a detailed fee disclosure document for real estate loan transactions
 */
const getFeeDisclosureTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const disclosureId = `FD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Calculate loan-related fees
  const loanAmount = loanData.loanAmount;
  const originationFeePercent = loanData.originationFee;
  const originationFeeAmount = Math.round(loanAmount * (originationFeePercent / 100));
  
  // Generate other fees
  const underwritingFee = Math.round((500 + Math.random() * 500) / 50) * 50;
  const processingFee = Math.round((300 + Math.random() * 300) / 25) * 25;
  const documentPreparationFee = Math.round((200 + Math.random() * 200) / 25) * 25;
  const creditReportFee = Math.round((50 + Math.random() * 50) / 5) * 5;
  const floodCertificationFee = 25;
  const wireTransferFee = 35;
  
  // Third-party fees
  const appraisalFee = Math.round((600 + Math.random() * 900) / 50) * 50;
  const titleSearchFee = Math.round((400 + Math.random() * 300) / 50) * 50;
  const titleInsuranceFee = Math.round(loanAmount * 0.005);
  const escrowClosingFee = Math.round((500 + Math.random() * 500) / 50) * 50;
  const recordingFees = Math.round((100 + Math.random() * 150) / 10) * 10;
  const propertyInspectionFee = Math.round((350 + Math.random() * 250) / 50) * 50;
  
  // Calculate totals
  const lenderFees = originationFeeAmount + underwritingFee + processingFee + documentPreparationFee + creditReportFee + floodCertificationFee + wireTransferFee;
  const thirdPartyFees = appraisalFee + titleSearchFee + titleInsuranceFee + escrowClosingFee + recordingFees + propertyInspectionFee;
  const totalClosingCosts = lenderFees + thirdPartyFees;
  
  // Calculate prepaid items
  const prepaidInterestDays = Math.floor(Math.random() * 20) + 10;
  const dailyInterestRate = loanData.interestRate / 365;
  const prepaidInterest = Math.round((loanAmount * (dailyInterestRate / 100) * prepaidInterestDays) / 10) * 10;
  const prepaidHazardInsurance = Math.round((loanAmount * 0.003) / 100) * 100;
  const prepaidPropertyTaxes = Math.round((loanAmount * 0.005) / 100) * 100;
  
  // Calculate totals with prepaid items
  const totalPrepaidItems = prepaidInterest + prepaidHazardInsurance + prepaidPropertyTaxes;
  const totalCashToClose = totalClosingCosts + totalPrepaidItems;
  
  const content = `
    <div class="document">
      <div class="letterhead">
        <div class="letterhead-logo">
          HARRINGTON CAPITAL PARTNERS
        </div>
        <div class="letterhead-contact">
          123 Financial Plaza, Suite 400<br>
          Boston, MA 02110<br>
          (800) 555-1234<br>
          www.harringtoncapital.com<br>
          NMLS# 87654321
        </div>
      </div>
      
      <div class="document-header">
        <div class="document-title">Loan Estimate & Fee Disclosure</div>
        <div class="document-subtitle">Reference #: ${disclosureId}</div>
      </div>
      
      <div class="document-section">
        <table class="info-table">
          <tr>
            <th>Date Prepared:</th>
            <td>${formattedDate}</td>
          </tr>
          <tr>
            <th>Borrower:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanAmount)}</td>
          </tr>
          <tr>
            <th>Interest Rate:</th>
            <td>${loanData.interestRate}% (estimated)</td>
          </tr>
          <tr>
            <th>Loan Term:</th>
            <td>${loanData.loanTerm} months</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Lender Fees</div>
        <table class="info-table">
          <tr>
            <th>Loan Origination Fee (${originationFeePercent} points):</th>
            <td>${formatCurrency(originationFeeAmount)}</td>
          </tr>
          <tr>
            <th>Underwriting Fee:</th>
            <td>${formatCurrency(underwritingFee)}</td>
          </tr>
          <tr>
            <th>Processing Fee:</th>
            <td>${formatCurrency(processingFee)}</td>
          </tr>
          <tr>
            <th>Document Preparation Fee:</th>
            <td>${formatCurrency(documentPreparationFee)}</td>
          </tr>
          <tr>
            <th>Credit Report Fee:</th>
            <td>${formatCurrency(creditReportFee)}</td>
          </tr>
          <tr>
            <th>Flood Certification Fee:</th>
            <td>${formatCurrency(floodCertificationFee)}</td>
          </tr>
          <tr>
            <th>Wire Transfer Fee:</th>
            <td>${formatCurrency(wireTransferFee)}</td>
          </tr>
          <tr style="font-weight: bold; background-color: #f5f5f5;">
            <th>Total Lender Fees:</th>
            <td>${formatCurrency(lenderFees)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Third-Party Fees</div>
        <table class="info-table">
          <tr>
            <th>Appraisal Fee:</th>
            <td>${formatCurrency(appraisalFee)}</td>
          </tr>
          <tr>
            <th>Title Search Fee:</th>
            <td>${formatCurrency(titleSearchFee)}</td>
          </tr>
          <tr>
            <th>Lender's Title Insurance:</th>
            <td>${formatCurrency(titleInsuranceFee)}</td>
          </tr>
          <tr>
            <th>Escrow/Closing Fee:</th>
            <td>${formatCurrency(escrowClosingFee)}</td>
          </tr>
          <tr>
            <th>Recording Fees:</th>
            <td>${formatCurrency(recordingFees)}</td>
          </tr>
          <tr>
            <th>Property Inspection Fee:</th>
            <td>${formatCurrency(propertyInspectionFee)}</td>
          </tr>
          <tr style="font-weight: bold; background-color: #f5f5f5;">
            <th>Total Third-Party Fees:</th>
            <td>${formatCurrency(thirdPartyFees)}</td>
          </tr>
        </table>
        
        <div class="notice">
          <p><strong>Note:</strong> Third-party fees are estimates and may vary based on actual service provider charges.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Prepaid Items</div>
        <table class="info-table">
          <tr>
            <th>Prepaid Interest (${prepaidInterestDays} days):</th>
            <td>${formatCurrency(prepaidInterest)}</td>
          </tr>
          <tr>
            <th>Prepaid Hazard Insurance (1 year):</th>
            <td>${formatCurrency(prepaidHazardInsurance)}</td>
          </tr>
          <tr>
            <th>Prepaid Property Taxes (6 months):</th>
            <td>${formatCurrency(prepaidPropertyTaxes)}</td>
          </tr>
          <tr style="font-weight: bold; background-color: #f5f5f5;">
            <th>Total Prepaid Items:</th>
            <td>${formatCurrency(totalPrepaidItems)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Cash to Close Summary</div>
        <table class="info-table">
          <tr>
            <th>Total Lender Fees:</th>
            <td>${formatCurrency(lenderFees)}</td>
          </tr>
          <tr>
            <th>Total Third-Party Fees:</th>
            <td>${formatCurrency(thirdPartyFees)}</td>
          </tr>
          <tr>
            <th>Total Closing Costs:</th>
            <td>${formatCurrency(totalClosingCosts)}</td>
          </tr>
          <tr>
            <th>Total Prepaid Items:</th>
            <td>${formatCurrency(totalPrepaidItems)}</td>
          </tr>
          <tr style="font-weight: bold; background-color: #e8f4f8;">
            <th>Total Estimated Cash to Close:</th>
            <td>${formatCurrency(totalCashToClose)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Important Information</div>
        <ol class="terms-list">
          <li>This Fee Disclosure is provided for informational purposes and is not a commitment to lend.</li>
          <li>All fees and costs are estimates and may change prior to closing based on final underwriting and third-party charges.</li>
          <li>Additional fees may apply based on unique transaction circumstances or property requirements.</li>
          <li>Prepaid items may vary based on closing date, insurance requirements, and local tax schedules.</li>
          <li>This estimate does not include potential reserve requirements that may be established at closing.</li>
          <li>The borrower is not required to use any specific title company, escrow service, or other settlement service providers identified in this disclosure.</li>
        </ol>
        
        <div class="highlight">
          <p>The actual fees charged at closing will be itemized on your final Closing Disclosure, which you will receive prior to closing.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Acknowledgment</div>
        <p>By signing below, you acknowledge that you have received and reviewed this Fee Disclosure. This acknowledgment does not constitute a loan commitment or acceptance of the estimated fees.</p>
        
        <div class="signature-section">
          <div class="signature-line"></div>
          <div>Borrower Signature and Date</div>
          
          <div style="margin-top: 40px;">
            <div class="signature-line"></div>
            <div>Co-Borrower Signature and Date (if applicable)</div>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>This Fee Disclosure is provided in compliance with applicable law. Harrington Capital Partners is an Equal Housing Opportunity Lender.</p>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Fee Disclosure - ${loanData.borrowerName}`, content);
};

/**
 * Rate Lock Agreement Template
 * Simulates a rate lock agreement for locking in interest rates during the loan process
 */
const getRateLockAgreementTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const agreementId = `RL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Calculate rate lock terms
  const lockPeriod = Math.floor(Math.random() * 3) + 1; // 1-3 months (30, 60, or 90 days)
  const lockExpirationDate = getFutureDate(lockPeriod * 30);
  
  // Determine locked rate (typically slightly higher than initial quote)
  const lockedRate = (Math.round((loanData.interestRate + 0.125) * 100) / 100).toFixed(3);
  
  // Calculate rate lock fee
  const rateLockFeePercent = lockPeriod * 0.25; // 0.25% per month
  const rateLockFeeAmount = Math.round(loanData.loanAmount * (rateLockFeePercent / 100));
  
  // Calculate rate extension terms
  const extensionFeePerDay = Math.round(loanData.loanAmount * 0.00025); // 0.025% per day
  const maxExtensionDays = 15;
  
  // Generate loan officer information
  const loanOfficers = [
    { name: 'Jennifer Martinez', title: 'Senior Loan Officer', nmls: '123456', phone: '(555) 123-4567', email: 'jmartinez@hardmoneylender.com' },
    { name: 'Michael Thompson', title: 'VP of Lending', nmls: '789012', phone: '(555) 987-6543', email: 'mthompson@hardmoneylender.com' },
    { name: 'Sarah Johnson', title: 'Mortgage Loan Officer', nmls: '345678', phone: '(555) 234-5678', email: 'sjohnson@hardmoneylender.com' }
  ];
  
  const loanOfficer = loanOfficers[Math.floor(Math.random() * loanOfficers.length)];
  
  const content = `
    <div class="document">
      <div class="letterhead">
        <div class="letterhead-logo">
          HARRINGTON CAPITAL PARTNERS
        </div>
        <div class="letterhead-contact">
          123 Financial Plaza, Suite 400<br>
          Boston, MA 02110<br>
          (800) 555-1234<br>
          www.harringtoncapital.com<br>
          NMLS# 87654321
        </div>
      </div>
      
      <div class="document-header">
        <div class="document-title">Interest Rate Lock Agreement</div>
        <div class="document-subtitle">Reference #: ${agreementId}</div>
      </div>
      
      <div class="document-section">
        <p>This Interest Rate Lock Agreement ("Agreement") is made and entered into on <strong>${formattedDate}</strong>, between <strong>Harrington Capital Partners</strong> ("Lender") and <strong>${loanData.borrowerName}</strong> ("Borrower") for the property located at <strong>${loanData.propertyAddress}</strong>.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Loan & Rate Lock Information</div>
        <table class="info-table">
          <tr>
            <th>Loan Number:</th>
            <td>${loanData.id}</td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
          </tr>
          <tr>
            <th>Loan Term:</th>
            <td>${loanData.loanTerm} months</td>
          </tr>
          <tr>
            <th>Locked Interest Rate:</th>
            <td>${lockedRate}%</td>
          </tr>
          <tr>
            <th>Origination Fee:</th>
            <td>${loanData.originationFee} points</td>
          </tr>
          <tr>
            <th>Rate Lock Period:</th>
            <td>${lockPeriod * 30} days</td>
          </tr>
          <tr>
            <th>Rate Lock Expiration Date:</th>
            <td>${lockExpirationDate}</td>
          </tr>
          <tr>
            <th>Rate Lock Fee:</th>
            <td>${formatCurrency(rateLockFeeAmount)} (${rateLockFeePercent}% of loan amount)</td>
          </tr>
        </table>
        
        <div class="approval-box">
          <div class="subsection-title">Rate Lock Confirmation</div>
          <p>This Agreement confirms that Borrower has elected to lock the interest rate for the above-referenced loan. The interest rate of <strong>${lockedRate}%</strong> will be the rate applied to the loan provided that:</p>
          <ol>
            <li>The loan closes on or before the Rate Lock Expiration Date specified above.</li>
            <li>There are no material changes to the loan application or property information.</li>
            <li>All loan conditions are satisfied prior to closing.</li>
          </ol>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Terms and Conditions</div>
        
        <div class="subsection-title">1. Rate Lock Fee</div>
        <p>A rate lock fee of ${formatCurrency(rateLockFeeAmount)} is required to secure this rate lock. This fee is:</p>
        <div class="provision">
          [X] Payable upon execution of this Agreement<br>
          [ ] Applied to closing costs if the loan closes by the expiration date<br>
          [ ] Refundable if the loan is denied by the Lender<br>
          [X] Non-refundable if the Borrower fails to close by the expiration date due to borrower-related delays
        </div>
        
        <div class="subsection-title">2. Rate Lock Expiration</div>
        <p>If the loan does not close by ${lockExpirationDate}, the locked interest rate will expire, and the loan will be subject to current market rates at the time of closing unless a rate lock extension is purchased.</p>
        
        <div class="subsection-title">3. Rate Lock Extension</div>
        <p>If needed, the Borrower may request a rate lock extension for up to ${maxExtensionDays} days beyond the original expiration date. Extensions must be requested in writing before the original rate lock expiration date.</p>
        <p>The extension fee is ${formatCurrency(extensionFeePerDay)} per day (${(extensionFeePerDay / loanData.loanAmount * 100).toFixed(3)}% of loan amount per day).</p>
        
        <div class="subsection-title">4. Market Changes</div>
        <p>After the rate lock expiration date, if the loan has not closed and no extension has been purchased, the interest rate will be determined by prevailing market rates at the time of closing.</p>
        
        <div class="subsection-title">5. Material Changes</div>
        <p>If there are material changes to the loan application, property information, or loan terms, the Lender reserves the right to modify or terminate this rate lock. Material changes include but are not limited to:</p>
        <ul class="terms-list">
          <li>Change in loan amount by more than 5%</li>
          <li>Change in property value by more than 5%</li>
          <li>Change in property type or occupancy</li>
          <li>Change in borrower's credit score, income, or debt-to-income ratio</li>
          <li>Discovery of liens, judgments, or other encumbrances affecting the property</li>
        </ul>
        
        <div class="subsection-title">6. Cancellation</div>
        <p>The Lender reserves the right to cancel this rate lock if:</p>
        <ul class="terms-list">
          <li>The loan application contains misrepresentations or inaccurate information</li>
          <li>The Borrower fails to provide requested documentation within required timeframes</li>
          <li>The property does not appraise for a sufficient value</li>
          <li>The Borrower fails to meet loan qualification requirements</li>
        </ul>
      </div>
      
      <div class="document-section">
        <div class="section-title">Acknowledgment and Agreement</div>
        <p>By signing below, the Borrower acknowledges and agrees to the terms and conditions of this Rate Lock Agreement. The Borrower understands that locking an interest rate is a commitment and that market rates may go up or down during the rate lock period without affecting the locked rate.</p>
        
        <div class="notice">
          <p><strong>Important Notice:</strong> A rate lock is not a loan commitment or guarantee of financing. All loans are subject to final underwriting approval based on the Borrower's creditworthiness, property valuation, and satisfaction of all loan conditions.</p>
        </div>
      </div>
      
      <div class="signature-section">
        <div class="signature-line"></div>
        <div>Borrower Signature and Date</div>
        
        <div style="margin-top: 40px;">
          <div class="signature-line"></div>
          <div>Co-Borrower Signature and Date (if applicable)</div>
        </div>
        
        <div style="margin-top: 40px;">
          <p>For Lender:</p>
          <div class="signature-line"></div>
          <p>
            ${loanOfficer.name}<br>
            ${loanOfficer.title}<br>
            NMLS# ${loanOfficer.nmls}
          </p>
        </div>
      </div>
      
      <div class="footer">
        <p>This Rate Lock Agreement is subject to all terms of the loan program and applicable laws and regulations. Harrington Capital Partners is an Equal Housing Opportunity Lender.</p>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Rate Lock Agreement - ${loanData.borrowerName}`, content);
};

// Export templates
export {
  getPreApprovalLetterTemplate,
  getFeeDisclosureTemplate,
  getRateLockAgreementTemplate
};
