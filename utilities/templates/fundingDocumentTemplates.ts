import { LoanDetails } from '../types/loanTypes';
import { LoanData } from '../loanGenerator';
import { documentStyleService } from '../documentStyleService';
/**
 * Document templates for various funding-related documents used in hard money lending
 */

// Helper functions for consistent formatting
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

// Get a future date based on months from now
const getFutureDate = (monthsFromNow: number): string => {
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + monthsFromNow);
  return futureDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Adapter function to convert LoanData to LoanDetails
const adaptLoanDataToLoanDetails = (loanData: LoanData): LoanDetails => {
  // Extract city, state, and zip from the propertyAddress if possible
  const addressParts = loanData.propertyAddress.split(', ');
  let city = 'N/A';
  let state = 'N/A';
  let zip = 'N/A';
  
  if (addressParts.length >= 2) {
    // Assuming format like "123 Main St, Anytown, CA 12345"
    city = addressParts[1];
    if (addressParts.length >= 3) {
      // Try to extract state and zip from the last part
      const stateZipParts = addressParts[2].split(' ');
      state = stateZipParts[0] || 'N/A';
      zip = stateZipParts[1] || 'N/A';
    }
  }

  return {
    propertyAddress: {
      street: addressParts[0] || loanData.propertyAddress,
      city: city,
      state: state,
      zipCode: zip
    },
    borrowerName: loanData.borrowerName,
    loanAmount: loanData.loanAmount,
    lenderName: 'Harrington Capital Partners',
    closingDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    propertyType: loanData.propertyType || 'Residential',
    loanNumber: loanData.id,
    interestRate: loanData.interestRate,
    originationFee: loanData.originationFee || 0.02,
    loanTerm: loanData.loanTerm || 12,
  };
};

/**
 * Generates a Final Title Policy document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Final Title Policy document
 */
export const generateFinalTitlePolicy = (loanDetails: LoanDetails): string => {
  const {
    propertyAddress,
    borrowerName,
    loanAmount,
    lenderName,
    closingDate,
    propertyType,
    loanNumber,
  } = loanDetails;

  const currentDate = formatDate();
  const policyAmount = loanAmount * 1.1; // 110% of loan amount
  const policyNumber = `FTP-${loanNumber}-${new Date().getFullYear()}`;
  
  // Generate title insurance company information
  const titleCompanies = [
    'Fidelity National Title Insurance Company',
    'First American Title Insurance Company',
    'Old Republic National Title Insurance Company',
    'Stewart Title Guaranty Company'
  ];
  
  const titleCompany = titleCompanies[Math.floor(Math.random() * titleCompanies.length)];
  const titleCompanyState = ['California', 'Delaware', 'New York', 'Texas'][Math.floor(Math.random() * 4)];

  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">Final Title Insurance Policy</div>
        <div class="document-subtitle">Date: ${currentDate}</div>
      </div>
      
      <div class="document-section">
        <div class="info-table-container">
          <table class="info-table">
            <tr>
              <th>Policy Number:</th>
              <td>${policyNumber}</td>
            </tr>
            <tr>
              <th>Date of Policy:</th>
              <td>${currentDate}</td>
            </tr>
            <tr>
              <th>Policy Amount:</th>
              <td>${formatCurrency(policyAmount)}</td>
            </tr>
            <tr>
              <th>Insured:</th>
              <td>${lenderName}</td>
            </tr>
            <tr>
              <th>Borrower:</th>
              <td>${borrowerName}</td>
            </tr>
            <tr>
              <th>Property Address:</th>
              <td>${propertyAddress.street}, ${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</td>
            </tr>
            <tr>
              <th>Property Type:</th>
              <td>${propertyType}</td>
            </tr>
            <tr>
              <th>Loan Closing Date:</th>
              <td>${closingDate}</td>
            </tr>
            <tr>
              <th>Loan Amount:</th>
              <td>${formatCurrency(loanAmount)}</td>
            </tr>
          </table>
        </div>
        
        <p>This Final Title Insurance Policy ("Policy") is issued by ${titleCompany}, a corporation organized and existing under the laws of the State of ${titleCompanyState}, herein called the "Company."</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Coverage Statement</div>
        <p>Subject to the exclusions from coverage, the exceptions from coverage contained in Schedule B, and the conditions and stipulations, ${titleCompany}, a ${titleCompanyState} corporation, herein called the Company, insures, as of the Date of Policy shown above, against loss or damage, not exceeding the Amount of Insurance stated above, sustained or incurred by the insured by reason of:</p>
        
        <ol>
          <li>Title to the estate or interest described in Schedule A being vested other than as stated therein;</li>
          <li>Any defect in or lien or encumbrance on the title;</li>
          <li>Unmarketability of the title;</li>
          <li>Lack of right of access to and from the land;</li>
          <li>The invalidity or unenforceability of the lien of the insured mortgage upon the title;</li>
          <li>The priority of any lien or encumbrance over the lien of the insured mortgage;</li>
          <li>Lack of priority of the lien of the insured mortgage over any statutory lien for services, labor, or material arising from an improvement or work related to the land which is contracted for or commenced prior to Date of Policy;</li>
          <li>The invalidity or unenforceability of any assignment of the insured mortgage, provided the assignment is shown in Schedule A, or the failure of the assignment shown in Schedule A to vest title to the insured mortgage in the named insured assignee free and clear of all liens.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">Schedule A</div>
        <p>The estate or interest in the land which is encumbered by the insured mortgage is <strong>Fee Simple</strong>.</p>
        <p>Title to the estate or interest in the land is vested in: <strong>${borrowerName}</strong></p>
        <p>The insured mortgage and assignments thereof, if any, are described as follows:</p>
        <p>Deed of Trust executed by ${borrowerName} to secure a note in the original principal amount of ${formatCurrency(loanAmount)}, dated ${closingDate}, in favor of ${lenderName}.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Schedule B</div>
        <p>This policy does not insure against loss or damage by reason of the following:</p>
        
        <ol>
          <li>Property taxes for the current fiscal year, and subsequent years, not yet due and payable.</li>
          <li>Easements, restrictions, and conditions of record.</li>
          <li>Any facts, rights, interests, or claims that are not shown by the public records but that could be ascertained by an inspection of the land or by making inquiry of persons in possession of the land.</li>
          <li>Any encroachment, encumbrance, violation, variation, or adverse circumstance affecting the title that would be disclosed by an accurate and complete land survey of the land.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">Witness</div>
        <p>IN WITNESS WHEREOF, ${titleCompany} has caused this policy to be signed and sealed as of the Date of Policy shown above.</p>
        
        <div class="signature-section">
          <div class="signature-line"></div>
          <div>${titleCompany}</div>
          <div>Authorized Signatory</div>
        </div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Final Title Policy - ${loanDetails.borrowerName}`, content);
};

/**
 * Generates Disbursement Instructions document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Disbursement Instructions document
 */
export const generateDisbursementInstructions = (loanDetails: LoanDetails): string => {
  const {
    propertyAddress,
    borrowerName,
    loanAmount,
    lenderName,
    closingDate,
    loanNumber,
    interestRate,
    originationFee,
    loanTerm,
  } = loanDetails;

  const currentDate = formatDate();

  // Calculate fees
  const origFeePercent = originationFee || 2; // Default to 2% if not provided
  const origFeeAmount = loanAmount * (origFeePercent / 100);
  const titleFees = 1200;
  const escrowFees = 850;
  const appraisalFee = 700;
  const documentPreparationFee = 450;
  const wireTransferFee = 35;
  const recordingFees = 125;
  
  const totalFees = origFeeAmount + titleFees + escrowFees + appraisalFee + 
                    documentPreparationFee + wireTransferFee + recordingFees;
  
  const netProceedsToClosing = loanAmount - totalFees;

  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">Disbursement Instructions</div>
        <div class="document-subtitle">Date: ${currentDate}</div>
      </div>
      
      <div class="document-section">
        <div class="info-table-container">
          <table class="info-table">
            <tr>
              <th>Loan Number:</th>
              <td>${loanNumber}</td>
            </tr>
            <tr>
              <th>Closing Date:</th>
              <td>${closingDate}</td>
            </tr>
            <tr>
              <th>Borrower:</th>
              <td>${borrowerName}</td>
            </tr>
            <tr>
              <th>Property Address:</th>
              <td>${propertyAddress.street}, ${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</td>
            </tr>
            <tr>
              <th>Lender:</th>
              <td>${lenderName}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Loan Information</div>
        <div class="info-table-container">
          <table class="info-table">
            <tr>
              <th>Loan Amount:</th>
              <td>${formatCurrency(loanAmount)}</td>
            </tr>
            <tr>
              <th>Interest Rate:</th>
              <td>${interestRate}%</td>
            </tr>
            <tr>
              <th>Loan Term:</th>
              <td>${loanTerm} months</td>
            </tr>
            <tr>
              <th>Origination Fee:</th>
              <td>${origFeePercent}% (${formatCurrency(origFeeAmount)})</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Disbursement Schedule</div>
        <p class="subsection-title">From Loan Proceeds:</p>
        
        <div class="info-table-container">
          <table class="info-table">
            <tr>
              <th colspan="2">1. Fees Due to Lender:</th>
            </tr>
            <tr>
              <td style="padding-left: 20px;">a. Origination Fee:</td>
              <td>${formatCurrency(origFeeAmount)}</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">b. Document Preparation Fee:</td>
              <td>${formatCurrency(documentPreparationFee)}</td>
            </tr>
            <tr>
              <th colspan="2">2. Third-Party Fees:</th>
            </tr>
            <tr>
              <td style="padding-left: 20px;">a. Title Insurance Premium:</td>
              <td>${formatCurrency(titleFees)}</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">b. Escrow/Closing Fee:</td>
              <td>${formatCurrency(escrowFees)}</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">c. Appraisal Fee:</td>
              <td>${formatCurrency(appraisalFee)}</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">d. Recording Fees:</td>
              <td>${formatCurrency(recordingFees)}</td>
            </tr>
            <tr>
              <td style="padding-left: 20px;">e. Wire Transfer Fee:</td>
              <td>${formatCurrency(wireTransferFee)}</td>
            </tr>
            <tr class="total-row">
              <th>TOTAL FEES:</th>
              <td>${formatCurrency(totalFees)}</td>
            </tr>
            <tr class="total-row">
              <th>NET LOAN PROCEEDS TO CLOSING:</th>
              <td>${formatCurrency(netProceedsToClosing)}</td>
            </tr>
            <tr>
              <th>HOLDBACK RESERVES (if applicable):</th>
              <td>${formatCurrency(0)}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Instructions to Title/Escrow</div>
        <ol>
          <li>Please disburse the funds as indicated above.</li>
          <li>The net proceeds should be disbursed to the borrower after all fees are paid and all conditions for funding have been satisfied.</li>
          <li>Do not release any funds until the Deed of Trust/Mortgage has been properly recorded.</li>
          <li>Verify that all outstanding liens, if any, have been paid in full or subordinated as required.</li>
          <li>Ensure that the title insurance policy is issued without delay following closing and recording.</li>
        </ol>
        
        <div class="highlight-box">
          <p>These disbursement instructions are approved and authorized:</p>
        </div>
        
        <div class="signature-section">
          <div class="signature-line"></div>
          <div>${borrowerName}, Borrower</div>
          <div>Date: ${closingDate}</div>
          
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <div>Authorized Representative for ${lenderName}</div>
            <div>Date: ${closingDate}</div>
          </div>
          
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <div>Escrow Officer</div>
            <div>Date: ${closingDate}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Disbursement Instructions - ${loanDetails.borrowerName}`, content);
};

/**
 * Generates a Funding Authorization document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Funding Authorization document
 */
export const generateFundingAuthorization = (loanDetails: LoanDetails): string => {
  const {
    propertyAddress,
    borrowerName,
    loanAmount,
    lenderName,
    closingDate,
    loanNumber,
    propertyType,
    interestRate,
    loanTerm,
  } = loanDetails;

  const currentDate = formatDate();
  const authorizationNumber = `FA-${loanNumber}`;
  const expirationDate = getFutureDate(0.5); // 15 days from now
  
  // Generate funding manager information
  const fundingManagers = [
    { name: 'Rebecca Wilson', phone: '(212) 555-3456', email: 'rwilson@harringtoncapital.com' },
    { name: 'Anthony Parker', phone: '(212) 555-4567', email: 'aparker@harringtoncapital.com' },
    { name: 'Michelle Rodriguez', phone: '(212) 555-5678', email: 'mrodriguez@harringtoncapital.com' }
  ];
  
  const fundingManager = fundingManagers[Math.floor(Math.random() * fundingManagers.length)];

  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">Funding Authorization</div>
        <div class="document-subtitle">Date: ${currentDate}</div>
      </div>
      
      <div class="document-section">
        <div class="info-table-container">
          <table class="info-table">
            <tr>
              <th>Authorization Number:</th>
              <td>${authorizationNumber}</td>
            </tr>
            <tr>
              <th>To:</th>
              <td>[TITLE/ESCROW COMPANY]</td>
            </tr>
            <tr>
              <th>RE:</th>
              <td>Loan Funding Authorization for Loan #${loanNumber}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Loan Information</div>
        <div class="info-table-container">
          <table class="info-table">
            <tr>
              <th>Borrower(s):</th>
              <td>${borrowerName}</td>
            </tr>
            <tr>
              <th>Property Address:</th>
              <td>${propertyAddress.street}, ${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</td>
            </tr>
            <tr>
              <th>Property Type:</th>
              <td>${propertyType}</td>
            </tr>
            <tr>
              <th>Loan Amount:</th>
              <td>${formatCurrency(loanAmount)}</td>
            </tr>
            <tr>
              <th>Interest Rate:</th>
              <td>${interestRate}%</td>
            </tr>
            <tr>
              <th>Loan Term:</th>
              <td>${loanTerm} months</td>
            </tr>
            <tr>
              <th>Scheduled Closing Date:</th>
              <td>${closingDate}</td>
            </tr>
            <tr>
              <th>Lender:</th>
              <td>${lenderName}</td>
            </tr>
          </table>
        </div>
        
        <p>This document serves as formal authorization to fund the above-referenced loan. The undersigned, as an authorized representative of ${lenderName} ("Lender"), hereby authorizes the funding of the above-referenced loan subject to the following conditions being met:</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Funding Conditions</div>
        
        <ol>
          <li>
            <strong>Receipt and approval of properly executed loan documents, including but not limited to:</strong>
            <ul>
              <li>Promissory Note</li>
              <li>Deed of Trust/Mortgage</li>
              <li>Closing Disclosure/Settlement Statement</li>
              <li>Disbursement Instructions</li>
              <li>Escrow Instructions</li>
              <li>Borrower's Affidavit</li>
              <li>Insurance Verification (with Lender listed as mortgagee/loss payee)</li>
              <li>All applicable riders and addenda</li>
            </ul>
          </li>
          <li>Confirmation that the title insurance policy will be issued with no exceptions other than those approved by Lender in writing.</li>
          <li>Verification that all property taxes are current.</li>
          <li>Confirmation that hazard insurance is in place with appropriate coverage amounts and with Lender properly listed as mortgagee/loss payee.</li>
          <li>Verification that all required inspections have been completed and approved.</li>
          <li>Confirmation that all existing liens and encumbrances have been paid off or subordinated as required.</li>
          <li>Receipt of a clear final inspection report (if applicable).</li>
          <li>All conditions listed in the Loan Commitment Letter have been satisfied.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">Authorization</div>
        <div class="highlight-box">
          <p>Upon satisfaction of all conditions listed above, the Lender hereby authorizes the disbursement of loan funds in the amount of ${formatCurrency(loanAmount)} in accordance with the Disbursement Instructions provided separately.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Expiration</div>
        <div class="warning-box">
          <p>This Funding Authorization expires if funding does not occur by the close of business on ${expirationDate}. Any funding after this date requires a new authorization from Lender.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Approval</div>
        <p>Authorized and Approved:</p>
        
        <div class="signature-section">
          <div class="signature-line"></div>
          <div>Authorized Representative for ${lenderName}</div>
          <div>Title: [TITLE]</div>
          <div>Date: ${currentDate}</div>
          
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <div>Funding Department Approval</div>
            <div>Date: ${currentDate}</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Contact Information</div>
        <p>For questions regarding this Funding Authorization, please contact:</p>
        
        <div class="info-table-container">
          <table class="info-table">
            <tr>
              <th>Name:</th>
              <td>${fundingManager.name}</td>
            </tr>
            <tr>
              <th>Phone:</th>
              <td>${fundingManager.phone}</td>
            </tr>
            <tr>
              <th>Email:</th>
              <td>${fundingManager.email}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Funding Authorization - ${loanDetails.borrowerName}`, content);
};

/**
 * Generates an Escrow Agreement document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Escrow Agreement document
 */
export const generateEscrowAgreement = (loanDetails: LoanDetails): string => {
  const {
    propertyAddress,
    borrowerName,
    loanAmount,
    lenderName,
    closingDate,
    loanNumber,
    propertyType,
    interestRate,
    loanTerm,
  } = loanDetails;

  const currentDate = formatDate();

  // Calculate estimated monthly tax and insurance amounts
  const estimatedAnnualTaxes = loanAmount * 0.015; // Assuming 1.5% of loan amount annually
  const estimatedAnnualInsurance = propertyType === 'Commercial' ? loanAmount * 0.01 : loanAmount * 0.005; // 1% for commercial, 0.5% for residential
  const monthlyTaxes = estimatedAnnualTaxes / 12;
  const monthlyInsurance = estimatedAnnualInsurance / 12;
  const monthlyEscrowAmount = monthlyTaxes + monthlyInsurance;
  
  // Calculate initial escrow deposit
  const initialEscrowDeposit = monthlyEscrowAmount * 2; // Two months of reserve
  
  // Generate escrow company information
  const escrowCompanies = [
    'First American Escrow Services',
    'Fidelity National Escrow',
    'Chicago Title Escrow',
    'Old Republic Escrow'
  ];
  
  const escrowCompany = escrowCompanies[Math.floor(Math.random() * escrowCompanies.length)];

  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">Escrow Agreement</div>
        <div class="document-subtitle">Date: ${currentDate}</div>
      </div>
      
      <div class="document-section">
        <p class="centered-text">
          <strong>THIS ESCROW AGREEMENT</strong> (the "Agreement") is made and entered into on ${currentDate}, by and between:
        </p>
        
        <div class="parties">
          <div class="party-box">
            <div class="subsection-title">BORROWER:</div>
            <p>${borrowerName} (the "Borrower")</p>
          </div>
          
          <div class="party-box">
            <div class="subsection-title">LENDER:</div>
            <p>${lenderName} (the "Lender")</p>
          </div>
          
          <div class="party-box">
            <div class="subsection-title">ESCROW AGENT:</div>
            <p>${escrowCompany} (the "Escrow Agent")</p>
          </div>
        </div>
        
        <div class="info-table-container">
          <table class="info-table">
            <tr>
              <th>PROPERTY:</th>
              <td>${propertyAddress.street}, ${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</td>
            </tr>
            <tr>
              <th>LOAN NUMBER:</th>
              <td>${loanNumber}</td>
            </tr>
            <tr>
              <th>LOAN AMOUNT:</th>
              <td>${formatCurrency(loanAmount)}</td>
            </tr>
            <tr>
              <th>LOAN CLOSING DATE:</th>
              <td>${closingDate}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Recitals</div>
        
        <p><strong>WHEREAS</strong>, Borrower has obtained a loan from Lender secured by the above-referenced Property;</p>
        
        <p><strong>WHEREAS</strong>, Lender requires Borrower to maintain an escrow account for the payment of property taxes and insurance premiums;</p>
        
        <p><strong>WHEREAS</strong>, the parties desire to establish the terms and conditions governing the administration of the escrow account;</p>
        
        <p><strong>NOW, THEREFORE</strong>, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">1. Establishment of Escrow Account</div>
        <p>Lender and Borrower hereby establish an escrow account (the "Escrow Account") with Escrow Agent for the purpose of paying property taxes, hazard insurance premiums, and other charges as they become due on the Property.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">2. Initial Deposit</div>
        <p>At closing, Borrower shall deposit with Escrow Agent the sum of ${formatCurrency(initialEscrowDeposit)} as an initial deposit to the Escrow Account.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">3. Monthly Deposits</div>
        <p>Borrower agrees to pay to Lender, along with the regular monthly mortgage payment, the following amounts to be deposited into the Escrow Account:</p>
        
        <div class="info-table-container">
          <table class="info-table">
            <tr>
              <th>a. Property Taxes:</th>
              <td>${formatCurrency(monthlyTaxes)} per month</td>
            </tr>
            <tr>
              <th>b. Hazard Insurance:</th>
              <td>${formatCurrency(monthlyInsurance)} per month</td>
            </tr>
            <tr class="total-row">
              <th>Total Monthly Escrow Payment:</th>
              <td>${formatCurrency(monthlyEscrowAmount)}</td>
            </tr>
          </table>
        </div>
        
        <p>These amounts are subject to adjustment based on actual tax and insurance bills as they are received by Lender.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">4. Escrow Analysis</div>
        <p>Lender will perform an annual analysis of the Escrow Account to determine if the monthly deposits are sufficient to pay the expected disbursements for the coming year. Borrower will be notified of any adjustment to the monthly escrow payment.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">5. Payment of Escrow Items</div>
        <p>Escrow Agent shall use the funds in the Escrow Account to pay property taxes, hazard insurance premiums, and other charges when they become due. Escrow Agent shall provide Borrower with an annual statement showing all deposits to and disbursements from the Escrow Account.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">6. Insufficient Funds</div>
        <p>If at any time the funds in the Escrow Account are insufficient to pay an escrow item when due, Borrower shall, upon notice from Lender, promptly deposit the amount of the deficiency with Escrow Agent.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">7. Surplus Funds</div>
        <p>If at any time the amount of funds in the Escrow Account exceeds the amount deemed necessary by Lender to pay escrow items when due, plus any cushion permitted by applicable law, Lender shall refund the excess to Borrower.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">8. Termination</div>
        <p>This Agreement shall terminate upon the payment in full of the loan or upon the mutual agreement of the parties.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">9. Governing Law</div>
        <p>This Agreement shall be governed by and construed in accordance with the laws of the state in which the Property is located.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Signatures</div>
        <p>IN WITNESS WHEREOF, the parties have executed this Escrow Agreement as of the date first written above.</p>
        
        <div class="signature-section">
          <div class="signature-line"></div>
          <div>BORROWER: ${borrowerName}</div>
          <div>Date: ${closingDate}</div>
          
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <div>LENDER: ${lenderName}</div>
            <div>By: ________________________</div>
            <div>Title: _____________________</div>
            <div>Date: ${closingDate}</div>
          </div>
          
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <div>ESCROW AGENT: ${escrowCompany}</div>
            <div>By: ________________________</div>
            <div>Title: _____________________</div>
            <div>Date: ${closingDate}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Escrow Agreement - ${loanDetails.borrowerName}`, content);
};

/**
 * Generates Wiring Instructions document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Wiring Instructions document
 */
export const generateWiringInstructions = (loanDetails: LoanDetails): string => {
  const {
    propertyAddress,
    borrowerName,
    loanAmount,
    lenderName,
    closingDate,
    loanNumber,
  } = loanDetails;

  const currentDate = formatDate();

  // Calculate net amount after fees (simplified for example)
  const netLoanAmount = loanAmount * 0.97; // Assuming 3% in fees
  
  // Generate bank information
  const banks = [
    'First National Bank',
    'Meridian Trust',
    'Coastal Federal Bank',
    'Western Union Financial Services'
  ];
  
  const selectedBank = banks[Math.floor(Math.random() * banks.length)];
  const routingNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
  const accountNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
  const swiftCode = `SW${(Math.random().toString(36).substring(2, 7)).toUpperCase()}XXX`;
  
  // Generate escrow officer information
  const escrowOfficers = [
    { name: 'Michael Thompson', phone: '(555) 123-4567', email: 'mthompson@titleco.com' },
    { name: 'Jennifer Garcia', phone: '(555) 234-5678', email: 'jgarcia@titleco.com' },
    { name: 'Robert Chen', phone: '(555) 345-6789', email: 'rchen@titleco.com' }
  ];
  
  const escrowOfficer = escrowOfficers[Math.floor(Math.random() * escrowOfficers.length)];
  const escrowNumber = `EC-${Math.floor(10000 + Math.random() * 90000)}`;
  const titleCompany = 'Secured Title & Escrow Services';

  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">Wire Transfer Instructions</div>
        <div class="document-subtitle">Date: ${currentDate}</div>
      </div>
      
      <div class="document-section">
        <div class="warning-box">
          <strong>IMPORTANT:</strong> THESE WIRE INSTRUCTIONS ARE FOR THE ABOVE-REFERENCED TRANSACTION ONLY
        </div>
        
        <div class="info-table-container">
          <table class="info-table">
            <tr>
              <th>Loan Number:</th>
              <td>${loanNumber}</td>
            </tr>
            <tr>
              <th>Borrower:</th>
              <td>${borrowerName}</td>
            </tr>
            <tr>
              <th>Property Address:</th>
              <td>${propertyAddress.street}, ${propertyAddress.city}, ${propertyAddress.state} ${propertyAddress.zipCode}</td>
            </tr>
            <tr>
              <th>Closing Date:</th>
              <td>${closingDate}</td>
            </tr>
            <tr>
              <th>Amount to be Wired:</th>
              <td><strong>${formatCurrency(netLoanAmount)}</strong></td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Receiving Bank Information</div>
        <div class="info-table-container">
          <table class="info-table">
            <tr>
              <th>Bank Name:</th>
              <td>${selectedBank}</td>
            </tr>
            <tr>
              <th>Bank Address:</th>
              <td>123 Financial Center, Suite 400<br>Los Angeles, CA 90010</td>
            </tr>
            <tr>
              <th>ABA/Routing Number:</th>
              <td>${routingNumber}</td>
            </tr>
            <tr>
              <th>Swift Code (for international wires):</th>
              <td>${swiftCode}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Beneficiary Information</div>
        <div class="info-table-container">
          <table class="info-table">
            <tr>
              <th>Account Name:</th>
              <td>${titleCompany} Trust Account</td>
            </tr>
            <tr>
              <th>Account Number:</th>
              <td>${accountNumber}</td>
            </tr>
            <tr>
              <th>Reference/Note:</th>
              <td>Loan #${loanNumber}, ${borrowerName}, ${propertyAddress.street}</td>
            </tr>
            <tr>
              <th>File/Escrow Number:</th>
              <td>${escrowNumber}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Special Instructions</div>
        <ol>
          <li>Please include the loan number, borrower name, and property address in the reference section of the wire.</li>
          <li>Notify the escrow officer when wire has been sent.</li>
          <li>Due to the risk of wire fraud, please call to verify these instructions before sending any funds.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">Verification Contact</div>
        <div class="info-table-container">
          <table class="info-table">
            <tr>
              <th>Name:</th>
              <td>${escrowOfficer.name}</td>
            </tr>
            <tr>
              <th>Phone:</th>
              <td>${escrowOfficer.phone} <em>(must call this number to verify before sending)</em></td>
            </tr>
            <tr>
              <th>Email:</th>
              <td>${escrowOfficer.email}</td>
            </tr>
            <tr>
              <th>Title/Escrow Company:</th>
              <td>${titleCompany}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Wire Fraud Advisory</div>
        <div class="warning-box">
          <p><strong>WIRE FRAUD IS ON THE RISE.</strong> Before sending any wire, call the intended recipient at a number you know is valid to confirm the instructions. Additionally, note that wiring instructions are typically not changed during the course of a transaction.</p>
        </div>
        
        <p>Once the wire has been sent, please email wire confirmation to: ${escrowOfficer.email}</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Funding Authorization</div>
        <p>These wire instructions are hereby authorized by:</p>
        
        <div class="signature-section">
          <div class="signature-line"></div>
          <div>Authorized Representative for ${lenderName}</div>
          <div>Date: ${currentDate}</div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Lender Information</div>
        <p>
          ${lenderName}<br>
          123 Capital Avenue, Suite 500<br>
          New York, NY 10001<br>
          (212) 555-7890<br>
          funding@harringtoncapital.com
        </p>
        
        <div class="disclaimer">
          <p>${lenderName} is not responsible for any delay, failure of delivery, or misdirection of funds resulting from incorrect or incomplete wire instructions. The sender is responsible for confirming the accuracy of these instructions prior to sending funds.</p>
        </div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Wiring Instructions - ${loanDetails.borrowerName}`, content);
};

// Wrapper functions that adapt to LoanData
export const getFinalTitlePolicyTemplate = (loanData: LoanData): string => {
  const loanDetails = adaptLoanDataToLoanDetails(loanData);
  return generateFinalTitlePolicy(loanDetails);
};

export const getDisbursementInstructionsTemplate = (loanData: LoanData): string => {
  const loanDetails = adaptLoanDataToLoanDetails(loanData);
  return generateDisbursementInstructions(loanDetails);
};

export const getFundingAuthorizationTemplate = (loanData: LoanData): string => {
  const loanDetails = adaptLoanDataToLoanDetails(loanData);
  return generateFundingAuthorization(loanDetails);
};

export const getEscrowAgreementTemplate = (loanData: LoanData): string => {
  const loanDetails = adaptLoanDataToLoanDetails(loanData);
  return generateEscrowAgreement(loanDetails);
};

export const getWiringInstructionsTemplate = (loanData: LoanData): string => {
  const loanDetails = adaptLoanDataToLoanDetails(loanData);
  return generateWiringInstructions(loanDetails);
};
