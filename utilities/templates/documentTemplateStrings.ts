import { LoanData } from '../loanGenerator';
// Import entity document templates
import {
  getFormationDocumentsTemplate,
  getOperatingAgreementTemplate,
  getCertificateGoodStandingTemplate,
  getEinDocumentationTemplate,
  getResolutionToBorrowTemplate
} from './entityDocumentTemplates';

/**
 * Document template functions return HTML strings for various loan document types
 * This file centralizes all document templates to improve maintainability
 */

// Helper functions
const formatDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};

// Base document styling - shared across all documents
const baseStyle = `
  <style>
    .document {
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.5;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ddd;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    
    .document-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1e5a9a;
    }
    
    .document-title {
      font-size: 24px;
      font-weight: bold;
      color: #1e5a9a;
      margin-bottom: 5px;
    }
    
    .document-subtitle {
      font-size: 16px;
      color: #666;
    }
    
    .document-section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #1e5a9a;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 1px solid #ddd;
    }
    
    .info-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .info-table th, .info-table td {
      padding: 8px 12px;
      border: 1px solid #ddd;
      text-align: left;
    }
    
    .info-table th {
      background-color: #f5f5f5;
      font-weight: bold;
      width: 40%;
    }
    
    .signature-section {
      margin-top: 50px;
    }
    
    .signature-line {
      border-top: 1px solid #333;
      width: 60%;
      margin-top: 30px;
      margin-bottom: 5px;
    }
  </style>
`;

// Document Template Functions
export const getLoanApplicationTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">LOAN APPLICATION</div>
        <div class="document-subtitle">Application Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Borrower Information</div>
        <table class="info-table">
          <tr>
            <th>Borrower Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>${loanData.borrowerName.replace(' ', '.').toLowerCase()}@example.com</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>(555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}</td>
          </tr>
          <tr>
            <th>Address:</th>
            <td>${loanData.borrowerAddress || '123 Main St, Anytown, CA 90210'}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Loan Details</div>
        <table class="info-table">
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.replace(/_/g, ' ').toUpperCase()}</td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Interest Rate:</th>
            <td>${loanData.interestRate}%</td>
          </tr>
          <tr>
            <th>Loan Term:</th>
            <td>${loanData.loanTerm} months</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Property Information</div>
        <table class="info-table">
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Property Type:</th>
            <td>${loanData.propertyType.replace(/_/g, ' ')}</td>
          </tr>
          <tr>
            <th>Purchase Price:</th>
            <td>${formatCurrency(loanData.purchasePrice)}</td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <p>I certify that the information provided in this application is true and correct to the best of my knowledge.</p>
        <div class="signature-line"></div>
        <div>${loanData.borrowerName}, Borrower</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getPhotoIdTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">PHOTO ID</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Loan Details</div>
        <table class="info-table">
          <tr>
            <th>Borrower:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Loan ID:</th>
            <td>${loanData.id || 'DEMO-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)}</td>
          </tr>
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.toUpperCase()}</td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
        </table>
      </div>
    </div>
  `;
};

// Additional document templates can be exported here
// For example:
export const getCreditAuthorizationTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">CREDIT AUTHORIZATION</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <p>I/We authorize DocuLendAI, or its assigns, to obtain verification of any information necessary, including but not limited to the following:</p>
        
        <ul style="margin-left: 20px; margin-bottom: 20px;">
          <li>My employment history and earnings, including future, past, and present</li>
          <li>My bank accounts, stock holdings, and any other asset balances</li>
          <li>My liability accounts including credit cards, loans, and mortgages</li>
          <li>My credit history through a consumer credit report</li>
        </ul>
        
        <p>This information will be used for loan qualification purposes only and will be kept confidential.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Borrower Information</div>
        <table class="info-table">
          <tr>
            <th>Borrower Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Social Security #:</th>
            <td>XXX-XX-${Math.floor(1000 + Math.random() * 9000)}</td>
          </tr>
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.replace(/_/g, ' ').toUpperCase()}</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <p>By signing below, I authorize the verification of the information provided on this form.</p>
        <div class="signature-line"></div>
        <div>${loanData.borrowerName}, Borrower</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

// Other templates can be added here
// This file would contain all document templates following the same pattern

// Export other document template functions
// Each function should follow the pattern of taking a LoanData object and returning a string

export const getPromissoryNoteTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  // Template implementation for promissory note
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">PROMISSORY NOTE</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <p>
          FOR VALUE RECEIVED, the undersigned, <strong>${loanData.borrowerName}</strong> ("Borrower"), 
          hereby promises to pay to the order of DocuLendAI, or any subsequent holder hereof 
          ("Lender"), the principal sum of <strong>${formatCurrency(loanData.loanAmount)}</strong>, with interest 
          on the unpaid principal balance from the date of this Note, until paid, at an interest rate of 
          <strong>${loanData.interestRate}%</strong> per annum.
        </p>
        
        <div class="section-title">Loan Information</div>
        <table class="info-table">
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.toUpperCase()}<br>
            </td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Interest Rate:</th>
            <td>${loanData.interestRate}%</td>
          </tr>
          <tr>
            <th>Loan Term:</th>
            <td>${loanData.loanTerm} months (${loanData.loanTerm / 12} years)</td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <p>IN WITNESS WHEREOF, Borrower has executed this Promissory Note as of the date first written above.</p>
        <div class="signature-line"></div>
        <div>${loanData.borrowerName}, Borrower</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getDeedOfTrustTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">DEED OF TRUST</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <p>
          THIS DEED OF TRUST ("Security Instrument") is made on ${formattedDate}. 
          The grantor is <strong>${loanData.borrowerName}</strong> ("Borrower"). 
          The trustee is LEGAL TRUST SERVICES, INC., a California Corporation ("Trustee"). 
          The beneficiary is DocuLendAI ("Lender").
        </p>
        
        <p>
          Borrower owes Lender the principal sum of <strong>${formatCurrency(loanData.loanAmount)}</strong> 
          ("Note"). This debt is evidenced by Borrower's note dated ${formattedDate} 
          and extensions and modifications of the note.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Property Description</div>
        <p>
          This Security Instrument secures to Lender: (a) the repayment of the debt evidenced by the Note, with interest, 
          and all renewals, extensions and modifications of the Note; and (b) the performance of Borrower's covenants 
          and agreements under this Security Instrument and the Note.
        </p>
        <p>
          For this purpose, Borrower irrevocably grants and conveys to Trustee, in trust, with power of sale, the following 
          described property located in the County of COUNTY, State of STATE:
        </p>
        <p style="padding: 10px; border: 1px solid #ddd; background-color: #f9f9f9; margin: 10px 0;">
          Property Address: ${loanData.propertyAddress}<br>
          Property Type: ${loanData.propertyType.replace(/_/g, ' ')}<br>
          Legal Description: [Legal description to be attached as Exhibit A]
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Terms and Conditions</div>
        <p>
          1. <strong>Payment of Principal and Interest.</strong> Borrower shall promptly pay when due the principal of and interest on the 
          debt evidenced by the Note and any prepayment and late charges due under the Note.
        </p>
        <p>
          2. <strong>Application of Payments.</strong> All payments accepted and applied by Lender shall be applied in the following order of 
          priority: (a) interest due under the Note; (b) principal due under the Note; (c) amounts due for escrow items under Section 3.
        </p>
        <p>
          3. <strong>Property Insurance.</strong> Borrower shall keep the improvements now existing or hereafter erected on the Property insured 
          against loss by fire, hazards included within the term "extended coverage," and any other hazards for which Lender requires insurance.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Security Details</div>
        <table class="info-table">
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Interest Rate:</th>
            <td>${loanData.interestRate}%</td>
          </tr>
          <tr>
            <th>Loan Term:</th>
            <td>${loanData.loanTerm} months</td>
          </tr>
          <tr>
            <th>Maturity Date:</th>
            <td>${loanData.maturityDate || 'To be determined'}</td>
          </tr>
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.replace(/_/g, ' ').toUpperCase()}</td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <p>BY SIGNING BELOW, Borrower accepts and agrees to the terms and covenants contained in this Security Instrument.</p>
        <div class="signature-line"></div>
        <div>${loanData.borrowerName}, Borrower</div>
        <div class="signature-line"></div>
        <div>Trustee</div>
        <div class="signature-line"></div>
        <div>Lender</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getClosingDisclosureTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">CLOSING DISCLOSURE</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Transaction Information</div>
        <table class="info-table">
          <tr>
            <th>Loan ID:</th>
            <td>${loanData.id}</td>
          </tr>
          <tr>
            <th>Closing Date:</th>
            <td>${formattedDate}</td>
          </tr>
          <tr>
            <th>Disbursement Date:</th>
            <td>${formattedDate}</td>
          </tr>
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.replace(/_/g, ' ').toUpperCase()}</td>
          </tr>
          <tr>
            <th>Loan Term:</th>
            <td>${loanData.loanTerm} months</td>
          </tr>
          <tr>
            <th>Purpose:</th>
            <td>${loanData.loanType === 'fix_and_flip' ? 'Property Rehabilitation and Resale' : 
                loanData.loanType === 'rental_brrrr' ? 'Property Acquisition and Rental' : 
                loanData.loanType === 'bridge' ? 'Bridge Financing' : 
                loanData.loanType === 'construction' ? 'Construction Financing' : 
                'Commercial Real Estate Investment'}</td>
          </tr>
          <tr>
            <th>Product:</th>
            <td>Fixed Rate Hard Money Loan</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Loan Terms</div>
        <table class="info-table">
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Interest Rate:</th>
            <td>${loanData.interestRate}%</td>
          </tr>
          <tr>
            <th>Monthly Principal & Interest:</th>
            <td>${formatCurrency((loanData.loanAmount * (loanData.interestRate/100/12)) + (loanData.loanAmount/loanData.loanTerm))}</td>
          </tr>
          <tr>
            <th>Prepayment Penalty:</th>
            <td>${loanData.prepaymentPenalty || 'None'}</td>
          </tr>
          <tr>
            <th>Balloon Payment:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Projected Payments</div>
        <table class="info-table">
          <tr>
            <th>Payment Calculation:</th>
            <td>Interest-Only Payments</td>
          </tr>
          <tr>
            <th>Monthly Interest Payment:</th>
            <td>${formatCurrency(loanData.loanAmount * (loanData.interestRate/100/12))}</td>
          </tr>
          <tr>
            <th>Monthly Principal Payment:</th>
            <td>$0.00</td>
          </tr>
          <tr>
            <th>Balloon Payment Due:</th>
            <td>${formatCurrency(loanData.loanAmount)} (at maturity)</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Closing Cost Details</div>
        <table class="info-table">
          <tr>
            <th>Origination Fee (${loanData.originationFee}%):</th>
            <td>${formatCurrency(loanData.loanAmount * (loanData.originationFee/100))}</td>
          </tr>
          <tr>
            <th>Underwriting Fee:</th>
            <td>${formatCurrency(1500)}</td>
          </tr>
          <tr>
            <th>Processing Fee:</th>
            <td>${formatCurrency(500)}</td>
          </tr>
          <tr>
            <th>Document Preparation:</th>
            <td>${formatCurrency(750)}</td>
          </tr>
          <tr>
            <th>Title Insurance:</th>
            <td>${formatCurrency(loanData.loanAmount * 0.0035)}</td>
          </tr>
          <tr>
            <th>Appraisal Fee:</th>
            <td>${formatCurrency(750)}</td>
          </tr>
          <tr>
            <th>Recording Fees:</th>
            <td>${formatCurrency(250)}</td>
          </tr>
          <tr>
            <th>Total Closing Costs:</th>
            <td><strong>${formatCurrency((loanData.loanAmount * (loanData.originationFee/100)) + 1500 + 500 + 750 + (loanData.loanAmount * 0.0035) + 750 + 250)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Total Cash to Close</div>
        <table class="info-table">
          <tr>
            <th>Total Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Total Closing Costs:</th>
            <td>${formatCurrency((loanData.loanAmount * (loanData.originationFee/100)) + 1500 + 500 + 750 + (loanData.loanAmount * 0.0035) + 750 + 250)}</td>
          </tr>
          <tr>
            <th>Initial Interest Reserve (3 months):</th>
            <td>${formatCurrency(loanData.loanAmount * (loanData.interestRate/100/12) * 3)}</td>
          </tr>
          <tr>
            <th>Net Proceeds to Borrower:</th>
            <td><strong>${formatCurrency(loanData.loanAmount - ((loanData.loanAmount * (loanData.originationFee/100)) + 1500 + 500 + 750 + (loanData.loanAmount * 0.0035) + 750 + 250) - (loanData.loanAmount * (loanData.interestRate/100/12) * 3))}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <p>By signing, you acknowledge receipt of this Closing Disclosure and confirm its accuracy.</p>
        <div class="signature-line"></div>
        <div>${loanData.borrowerName}, Borrower</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getPropertyAppraisalTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">PROPERTY APPRAISAL REPORT</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Subject Property</div>
        <table class="info-table">
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>City:</th>
            <td>${loanData.city || 'Not Specified'}</td>
          </tr>
          <tr>
            <th>State/Zip:</th>
            <td>${loanData.state || 'XX'} ${loanData.zipCode || '00000'}</td>
          </tr>
          <tr>
            <th>County:</th>
            <td>${loanData.county || 'Not Specified'}</td>
          </tr>
          <tr>
            <th>Property Type:</th>
            <td>${loanData.propertyType.replace(/_/g, ' ')}</td>
          </tr>
          <tr>
            <th>Legal Description:</th>
            <td>Lot XX, Block XX, SUBDIVISION NAME, according to the map or plat thereof as recorded in Plat Book XX, Page XX</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Property Characteristics</div>
        <table class="info-table">
          <tr>
            <th>Year Built:</th>
            <td>${loanData.yearBuilt || 'Not Available'}</td>
          </tr>
          <tr>
            <th>Square Footage:</th>
            <td>${loanData.squareFootage ? loanData.squareFootage.toLocaleString() + ' sq. ft.' : 'Not Available'}</td>
          </tr>
          <tr>
            <th>Lot Size:</th>
            <td>${loanData.lotSize || 'Not Available'}</td>
          </tr>
          <tr>
            <th>Bedrooms:</th>
            <td>${loanData.bedrooms || 'N/A'}</td>
          </tr>
          <tr>
            <th>Bathrooms:</th>
            <td>${loanData.bathrooms || 'N/A'}</td>
          </tr>
          <tr>
            <th>Zoning Classification:</th>
            <td>${loanData.zoning || 'Not Specified'}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Valuation Information</div>
        <table class="info-table">
          <tr>
            <th>Appraisal Purpose:</th>
            <td>To determine market value for lending purposes</td>
          </tr>
          <tr>
            <th>Appraisal Approach:</th>
            <td>Sales Comparison Approach</td>
          </tr>
          <tr>
            <th>Current As-Is Value:</th>
            <td>${formatCurrency(loanData.purchasePrice)}</td>
          </tr>
          <tr>
            <th>After Repair Value (ARV):</th>
            <td>${formatCurrency(loanData.afterRepairValue)}</td>
          </tr>
          <tr>
            <th>Purchase Price:</th>
            <td>${formatCurrency(loanData.purchasePrice)}</td>
          </tr>
          <tr>
            <th>Rehabilitation Budget:</th>
            <td>${formatCurrency(loanData.rehabBudget)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Comparable Properties Analysis</div>
        <table class="info-table">
          <tr>
            <th>Comparable #1 Address:</th>
            <td>123 Nearby Street</td>
          </tr>
          <tr>
            <th>Sale Date:</th>
            <td>${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
          </tr>
          <tr>
            <th>Sale Price:</th>
            <td>${formatCurrency(loanData.purchasePrice * (Math.random() * 0.2 + 0.9))}</td>
          </tr>
          <tr>
            <th>Comparable #2 Address:</th>
            <td>456 Similar Avenue</td>
          </tr>
          <tr>
            <th>Sale Date:</th>
            <td>${new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
          </tr>
          <tr>
            <th>Sale Price:</th>
            <td>${formatCurrency(loanData.purchasePrice * (Math.random() * 0.2 + 0.9))}</td>
          </tr>
          <tr>
            <th>Comparable #3 Address:</th>
            <td>789 Equivalent Boulevard</td>
          </tr>
          <tr>
            <th>Sale Date:</th>
            <td>${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}</td>
          </tr>
          <tr>
            <th>Sale Price:</th>
            <td>${formatCurrency(loanData.purchasePrice * (Math.random() * 0.2 + 0.9))}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Appraiser's Notes</div>
        <p>
          This property ${loanData.loanType === 'fix_and_flip' || loanData.loanType === 'rental_brrrr' ? 
            'needs significant rehabilitation to achieve its potential market value. The After Repair Value (ARV) is contingent on completing all proposed renovations according to plan.' : 
            'is in generally good condition with typical market appreciation expected over the loan term.'} 
          The local real estate market is currently ${Math.random() > 0.5 ? 'experiencing moderate growth with stable demand.' : 'strong with increasing property values.'}
        </p>
        <p>
          The subject property is located in a ${Math.random() > 0.5 ? 'well-established neighborhood with good access to amenities and transportation.' : 'developing area with improving infrastructure and services.'}
          Overall, the property ${loanData.loanType === 'fix_and_flip' ? 'presents a good opportunity for rehabilitation and resale' : 
            loanData.loanType === 'rental_brrrr' ? 'has good potential as a rental investment after repairs' : 
            'is suitable for the intended purpose and loan type.'} 
        </p>
      </div>
      
      <div class="signature-section">
        <p>This appraisal report is prepared for lending purposes and is subject to the stated assumptions and limiting conditions.</p>
        <div class="signature-line"></div>
        <div>Michael Anderson, Certified Appraiser</div>
        <div>License #: AP-12345</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getTermSheetTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">TERM SHEET</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Lender Information</div>
        <table class="info-table">
          <tr>
            <th>Lender:</th>
            <td>DocuLendAI</td>
          </tr>
          <tr>
            <th>Address:</th>
            <td>123 Finance Ave, Suite 400, Los Angeles, CA 90001</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>(800) 555-1234</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>loans@doculendai.com</td>
          </tr>
          <tr>
            <th>Contact Person:</th>
            <td>${loanData.underwriterName || 'John Smith, Senior Loan Officer'}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Borrower Information</div>
        <table class="info-table">
          <tr>
            <th>Borrower Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Entity Name:</th>
            <td>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}</td>
          </tr>
          <tr>
            <th>Address:</th>
            <td>${loanData.borrowerAddress || 'Not Provided'}</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>${loanData.borrowerPhone || 'Not Provided'}</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>${loanData.borrowerEmail}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Loan Structure</div>
        <table class="info-table">
          <tr>
            <th>Loan Purpose:</th>
            <td>${loanData.loanType === 'fix_and_flip' ? 'Acquisition and Rehabilitation for Resale' : 
                loanData.loanType === 'rental_brrrr' ? 'Buy, Rehab, Rent, Refinance, Repeat Strategy' : 
                loanData.loanType === 'bridge' ? 'Bridge Financing' : 
                loanData.loanType === 'construction' ? 'Construction Financing' : 
                'Commercial Real Estate Investment'}</td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Interest Rate:</th>
            <td>${loanData.interestRate}% fixed</td>
          </tr>
          <tr>
            <th>Loan Term:</th>
            <td>${loanData.loanTerm} months</td>
          </tr>
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.replace(/_/g, ' ').toUpperCase()}</td>
          </tr>
          <tr>
            <th>Amortization:</th>
            <td>Interest-Only with Balloon Payment at Maturity</td>
          </tr>
          <tr>
            <th>Payment Schedule:</th>
            <td>Monthly Interest Payments</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Property Information</div>
        <table class="info-table">
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Property Type:</th>
            <td>${loanData.propertyType.replace(/_/g, ' ')}</td>
          </tr>
          <tr>
            <th>Purchase Price:</th>
            <td>${formatCurrency(loanData.purchasePrice)}</td>
          </tr>
          <tr>
            <th>Rehabilitation Budget:</th>
            <td>${formatCurrency(loanData.rehabBudget)}</td>
          </tr>
          <tr>
            <th>After Repair Value (ARV):</th>
            <td>${formatCurrency(loanData.afterRepairValue)}</td>
          </tr>
          <tr>
            <th>Loan-to-Value (LTV):</th>
            <td>${loanData.ltv}%</td>
          </tr>
          <tr>
            <th>Loan-to-ARV:</th>
            <td>${loanData.arv_ltv}%</td>
          </tr>
          <tr>
            <th>Exit Strategy:</th>
            <td>${loanData.exitStrategy.replace(/_/g, ' ').toUpperCase()}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Fees and Costs</div>
        <table class="info-table">
          <tr>
            <th>Origination Fee:</th>
            <td>${loanData.originationFee}% (${formatCurrency(loanData.loanAmount * (loanData.originationFee/100))})</td>
          </tr>
          <tr>
            <th>Underwriting Fee:</th>
            <td>${formatCurrency(1500)}</td>
          </tr>
          <tr>
            <th>Processing Fee:</th>
            <td>${formatCurrency(500)}</td>
          </tr>
          <tr>
            <th>Document Preparation:</th>
            <td>${formatCurrency(750)}</td>
          </tr>
          <tr>
            <th>Prepayment Penalty:</th>
            <td>${loanData.prepaymentPenalty || 'None for loans held more than 3 months'}</td>
          </tr>
          <tr>
            <th>Extension Option:</th>
            <td>${loanData.extensionOptions || '6-month extension available for 1% fee'}</td>
          </tr>
          <tr>
            <th>Default Interest Rate:</th>
            <td>${loanData.interestRate + 5}%</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Closing and Funding Conditions</div>
        <ol style="margin-left: 20px;">
          <li>Clean title report with lender's title policy</li>
          <li>Hazard insurance naming lender as loss payee</li>
          <li>Verification of borrower identity and entity formation documents</li>
          <li>Property inspection and approval</li>
          <li>${loanData.loanType === 'fix_and_flip' || loanData.loanType === 'rental_brrrr' ? 'Detailed scope of work for rehabilitation' : 'Final property appraisal'}</li>
          <li>Verification of cash reserves for ${loanData.cashReserves || 6} months of payments</li>
          <li>Execution of all loan documents</li>
        </ol>
      </div>
      
      <div class="document-section">
        <p><strong>This Term Sheet is non-binding and for discussion purposes only. It does not constitute a commitment to lend.</strong></p>
        <p>The terms outlined herein are subject to change based on final underwriting, property inspection, and appraisal. This Term Sheet expires in 14 days.</p>
      </div>
      
      <div class="signature-section">
        <p>Acknowledged and Agreed:</p>
        <div class="signature-line"></div>
        <div>${loanData.borrowerName}, Borrower</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
        <div class="signature-line"></div>
        <div>Lender Representative</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getPersonalGuaranteeTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">PERSONAL GUARANTEE</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <p>
          FOR VALUE RECEIVED, and to induce DocuLendAI, LLC ("Lender") to make a loan to 
          ${loanData.entityName || `${loanData.borrowerName} Properties LLC`} ("Borrower"), 
          the undersigned, <strong>${loanData.borrowerName}</strong> ("Guarantor"), irrevocably, absolutely, 
          and unconditionally guarantees to Lender the full and prompt payment and performance of all obligations 
          of Borrower to Lender arising out of or relating to the loan in the principal amount of 
          <strong>${formatCurrency(loanData.loanAmount)}</strong> ("Loan"), evidenced by that certain Promissory Note 
          of even date herewith (the "Note"), as well as any and all other documents executed by Borrower 
          in connection with the Loan (collectively, the "Loan Documents").
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Terms and Conditions</div>
        <p>
          <strong>1. Nature of Guarantee.</strong> This is a guarantee of payment and performance and not of collection. 
          Lender shall not be required to pursue any remedies it may have against Borrower or any collateral for the Loan 
          before seeking payment from Guarantor of any of the guaranteed obligations.
        </p>
        <p>
          <strong>2. Duration.</strong> This Guarantee shall remain in full force and effect until all obligations under the Loan 
          Documents have been satisfied in full. This Guarantee shall bind Guarantor's heirs, successors, and assigns, and shall 
          inure to the benefit of Lender's successors and assigns.
        </p>
        <p>
          <strong>3. Guarantor's Representations.</strong> Guarantor represents and warrants that this Guarantee has been duly 
          executed and delivered and constitutes Guarantor's valid and legally binding obligation enforceable in accordance 
          with its terms.
        </p>
        <p>
          <strong>4. Lender's Rights.</strong> Lender may, without notice to Guarantor and without affecting Guarantor's 
          obligations hereunder: (a) renew, extend, accelerate, or otherwise change the terms of the Loan Documents; 
          (b) take and hold collateral for this Guarantee or the Loan Documents; and (c) release or substitute any other guarantor.
        </p>
        <p>
          <strong>5. Waiver.</strong> Guarantor waives: (a) presentment, demand, protest, notice of acceptance, notice of dishonor, 
          notice of nonpayment, and any other notice with respect to the Loan and this Guarantee; (b) any right to require Lender 
          to proceed against Borrower; (c) any right to require Lender to proceed against or exhaust any security held from Borrower; 
          (d) any right to require Lender to pursue any remedy in Lender's power; and (e) any defense arising by reason of any 
          disability or other defense of Borrower.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Loan Information</div>
        <table class="info-table">
          <tr>
            <th>Borrower:</th>
            <td>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}</td>
          </tr>
          <tr>
            <th>Guarantor:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Interest Rate:</th>
            <td>${loanData.interestRate}%</td>
          </tr>
          <tr>
            <th>Loan Term:</th>
            <td>${loanData.loanTerm} months</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <p><strong>Entire Agreement.</strong> This Guarantee constitutes the entire agreement between Guarantor and Lender 
        with respect to the subject matter hereof and supersedes all prior negotiations or agreements, whether oral or written. 
        This Guarantee may not be amended except by a writing signed by Guarantor and Lender.</p>
      </div>
      
      <div class="signature-section">
        <p>IN WITNESS WHEREOF, Guarantor has executed this Personal Guarantee as of the date first written above.</p>
        <div class="signature-line"></div>
        <div>${loanData.borrowerName}, Guarantor</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getAssignmentRentsLeasesTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">ASSIGNMENT OF RENTS AND LEASES</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <p>
          THIS ASSIGNMENT OF RENTS AND LEASES (this "Assignment") is made as of ${formattedDate}, by 
          <strong>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}</strong> ("Assignor") 
          in favor of <strong>DocuLendAI, LLC</strong> ("Assignee").
        </p>
        
        <p>
          <strong>RECITALS:</strong> Assignor is the owner of certain real property located at 
          <strong>${loanData.propertyAddress}</strong> (the "Property"). Assignor has executed a Note in favor of Assignee in 
          the principal amount of <strong>${formatCurrency(loanData.loanAmount)}</strong> (the "Note"), which is secured by a 
          Deed of Trust/Mortgage (the "Security Instrument") encumbering the Property. As additional security for the Note, 
          Assignor desires to assign to Assignee all of Assignor's right, title and interest in and to all current and future 
          leases and rents from the Property.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Agreement</div>
        <p>
          <strong>1. Assignment of Leases and Rents.</strong> Assignor hereby assigns, transfers, and sets over to Assignee all of 
          Assignor's right, title and interest in and to:
        </p>
        <ol style="margin-left: 20px;">
          <li>Any and all leases, subleases, licenses, concessions, or other agreements (written or oral) now existing or 
          hereafter entered into and affecting the use, enjoyment, or occupancy of the Property, including any extensions, 
          renewals, modifications, or substitutions thereof (collectively, the "Leases"); and</li>
          <li>All rents, issues, profits, and other income or proceeds derived from the Property, including, without limitation, 
          all rents, fees, charges, accounts, or other payments for the use or occupancy of the Property or any portion thereof, 
          whether now due, past due, or to become due, together with all rental and security deposits (collectively, the "Rents").</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">Terms and Conditions</div>
        <p>
          <strong>2. Purpose of Assignment.</strong> This Assignment is made for the purpose of securing:
        </p>
        <ol style="margin-left: 20px; margin-bottom: 20px;">
          <li>The payment of the indebtedness evidenced by the Note, including any extensions, modifications, or renewals thereof;</li>
          <li>The performance of all terms, covenants, and conditions contained in the Note, the Security Instrument, and any other 
          loan documents executed in connection with the loan (collectively, the "Loan Documents"); and</li>
          <li>Any other indebtedness or obligations of Assignor to Assignee now existing or hereafter arising.</li>
        </ol>
        
        <p>
          <strong>3. Present Assignment.</strong> This Assignment is intended to be an absolute, unconditional, and presently effective 
          assignment, not merely a pledge of security or assignment as additional security. Notwithstanding the foregoing, until 
          the occurrence of an Event of Default (as defined in the Loan Documents), Assignor shall have a license to collect, but 
          not more than one month prior to accrual, all Rents from the Property.
        </p>
        
        <p>
          <strong>4. Assignor's Covenants.</strong> Assignor hereby covenants with Assignee that Assignor:
        </p>
        <ol style="margin-left: 20px; margin-bottom: 20px;">
          <li>Will faithfully abide by, perform, and discharge each and every obligation, covenant, and agreement of the Leases 
          to be performed by the landlord or lessor thereunder;</li>
          <li>Will enforce or secure the performance of each and every obligation, covenant, and agreement of the Leases to be 
          performed by the tenants thereunder;</li>
          <li>Will not collect any Rents more than one month in advance;</li>
          <li>Will not execute any other assignment of the Leases or Rents;</li>
          <li>Will not modify or terminate any Lease or accept a surrender thereof without the prior written consent of Assignee;</li>
          <li>Will not waive or release any tenant from any obligations or conditions to be performed by such tenant under its Lease.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">Property Information</div>
        <table class="info-table">
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Property Type:</th>
            <td>${loanData.propertyType.replace(/_/g, ' ')}</td>
          </tr>
          <tr>
            <th>Owner (Assignor):</th>
            <td>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}</td>
          </tr>
          <tr>
            <th>Lender (Assignee):</th>
            <td>DocuLendAI, LLC</td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <p>
          <strong>5. Events of Default.</strong> Upon the occurrence of an Event of Default, Assignee shall have the right, at 
          its option, to revoke the license granted to Assignor hereunder and to exercise any or all of the rights and remedies 
          contained herein or in the Loan Documents, including the right to take possession of the Property and to manage and 
          operate the same, to collect all Rents, to apply the same to the payment of the Loan, and to remove and replace the 
          managing agent with or without cause.
        </p>
        <p>
          <strong>6. Termination of Assignment.</strong> Upon payment in full of the indebtedness secured hereby, this Assignment 
          shall become null and void, and all rights, titles, and interests conveyed to Assignee under this Assignment shall 
          terminate and shall revert to Assignor.
        </p>
      </div>
      
      <div class="signature-section">
        <p>IN WITNESS WHEREOF, Assignor has executed this Assignment of Rents and Leases as of the date first written above.</p>
        <div class="signature-line"></div>
        <div>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}, Assignor</div>
        <div class="signature-line"></div>
        <div>By: ${loanData.borrowerName}, Authorized Signatory</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getSecurityAgreementTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">SECURITY AGREEMENT</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <p>
          THIS SECURITY AGREEMENT (this "Agreement") is made as of ${formattedDate}, by and between 
          <strong>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}</strong> ("Debtor") and 
          <strong>DocuLendAI, LLC</strong> ("Secured Party").
        </p>
        
        <p>
          <strong>RECITALS:</strong> Secured Party has agreed to make a loan to Debtor in the principal amount of 
          <strong>${formatCurrency(loanData.loanAmount)}</strong>, which loan is evidenced by a Promissory Note of even date 
          herewith (the "Note"). Debtor has agreed to grant to Secured Party a security interest in certain personal property as 
          collateral for the Loan. In consideration of the mutual covenants and promises contained herein, the parties agree as follows:
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Grant of Security Interest</div>
        <p>
          <strong>1. Security Interest.</strong> Debtor hereby grants to Secured Party a security interest in all of Debtor's right, 
          title, and interest in and to the following property (collectively, the "Collateral"), whether now owned or hereafter acquired:
        </p>
        <ol style="margin-left: 20px; margin-bottom: 20px;">
          <li>All fixtures, equipment, and personal property of every kind and nature whatsoever now or hereafter located on or used 
          in connection with the real property located at <strong>${loanData.propertyAddress}</strong> (the "Property");</li>
          <li>All building materials, fixtures, equipment, and supplies of any nature whatsoever owned by Debtor, now or hereafter 
          delivered to the Property and intended to be installed therein;</li>
          <li>All licenses, permits, approvals, and agreements related to the Property;</li>
          <li>All leases, rents, issues, and profits arising from the Property;</li>
          <li>All proceeds of insurance on the Property;</li>
          <li>All awards or payments, including interest thereon, resulting from condemnation proceedings or the exercise of the 
          right of eminent domain;</li>
          <li>All proceeds of any of the above-described property.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">Obligations Secured</div>
        <p>
          <strong>2. Obligations Secured.</strong> This Agreement secures the following (collectively, the "Obligations"):
        </p>
        <ol style="margin-left: 20px; margin-bottom: 20px;">
          <li>Payment of all indebtedness evidenced by the Note;</li>
          <li>Performance of all obligations of Debtor contained in any loan document, including the Note, the Deed of Trust/Mortgage, 
          and this Agreement (collectively, the "Loan Documents");</li>
          <li>Payment of all sums that may be advanced in the future by Secured Party to Debtor;</li>
          <li>Payment of all amendments, modifications, extensions, and renewals of any of the Obligations.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">Representations and Warranties</div>
        <p>
          <strong>3. Debtor's Representations.</strong> Debtor represents and warrants to Secured Party that:
        </p>
        <ol style="margin-left: 20px; margin-bottom: 20px;">
          <li>Debtor is the sole owner of the Collateral and has the right to grant the security interest created by this Agreement;</li>
          <li>No other security interest, lien, charge, or encumbrance exists against the Collateral;</li>
          <li>No financing statement covering the Collateral is on file in any public office;</li>
          <li>The Collateral is used or purchased for use primarily in business operations.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">Debtor's Covenants</div>
        <p>
          <strong>4. Covenants.</strong> Debtor covenants and agrees with Secured Party that Debtor will:
        </p>
        <ol style="margin-left: 20px; margin-bottom: 20px;">
          <li>Pay and perform all Obligations secured by this Agreement in accordance with their terms;</li>
          <li>Defend the Collateral against the claims and demands of all persons other than Secured Party;</li>
          <li>Keep the Collateral free from all liens and security interests except that granted to Secured Party;</li>
          <li>Keep the Collateral in good condition and repair;</li>
          <li>Insure the Collateral against risks, casualties, and hazards as Secured Party may require;</li>
          <li>Pay all taxes, assessments, and other charges levied or assessed against the Collateral;</li>
          <li>Permit Secured Party to inspect the Collateral at any reasonable time;</li>
          <li>Not sell, transfer, lease, or otherwise dispose of the Collateral without the prior written consent of Secured Party;</li>
          <li>Execute and deliver such documents as Secured Party deems necessary to create, perfect, and continue the security 
          interest contemplated by this Agreement.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">Default and Remedies</div>
        <p>
          <strong>5. Events of Default.</strong> The occurrence of any of the following shall constitute an "Event of Default" under this Agreement:
        </p>
        <ol style="margin-left: 20px; margin-bottom: 20px;">
          <li>Debtor fails to pay or perform any Obligation when due;</li>
          <li>Any representation or warranty made by Debtor in this Agreement or any other Loan Document is materially false or misleading;</li>
          <li>Debtor fails to observe or perform any covenant or agreement contained in this Agreement;</li>
          <li>The Collateral is substantially damaged, destroyed, or taken by condemnation;</li>
          <li>Debtor becomes insolvent, makes an assignment for the benefit of creditors, or a receiver or trustee is appointed for Debtor;</li>
          <li>Any proceeding is commenced by or against Debtor under any bankruptcy or insolvency law.</li>
        </ol>
        
        <p>
          <strong>6. Remedies.</strong> Upon the occurrence of an Event of Default:
        </p>
        <ol style="margin-left: 20px; margin-bottom: 20px;">
          <li>Secured Party may declare all Obligations secured hereby immediately due and payable;</li>
          <li>Secured Party may exercise all rights and remedies available under the Uniform Commercial Code or other applicable law;</li>
          <li>Secured Party may require Debtor to assemble the Collateral and make it available to Secured Party at a place designated by Secured Party;</li>
          <li>Secured Party may enter the Property and take possession of the Collateral;</li>
          <li>Secured Party may sell, lease, or otherwise dispose of the Collateral in a commercially reasonable manner.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">Property Information</div>
        <table class="info-table">
          <tr>
            <th>Debtor:</th>
            <td>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}</td>
          </tr>
          <tr>
            <th>Secured Party:</th>
            <td>DocuLendAI, LLC</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.replace(/_/g, ' ').toUpperCase()}</td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <p>IN WITNESS WHEREOF, Debtor has executed this Security Agreement as of the date first written above.</p>
        <div class="signature-line"></div>
        <div>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}, Debtor</div>
        <div class="signature-line"></div>
        <div>By: ${loanData.borrowerName}, Authorized Signatory</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getDrawRequestTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">CONSTRUCTION DRAW REQUEST</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Project Information</div>
        <table class="info-table">
          <tr>
            <th>Project Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Borrower:</th>
            <td>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}</td>
          </tr>
          <tr>
            <th>Borrower Contact:</th>
            <td>${loanData.borrowerName} | ${loanData.borrowerEmail} | ${loanData.borrowerPhone || 'N/A'}</td>
          </tr>
          <tr>
            <th>Loan Number:</th>
            <td>${loanData.id}</td>
          </tr>
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.replace(/_/g, ' ').toUpperCase()}</td>
          </tr>
          <tr>
            <th>Total Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Total Rehab Budget:</th>
            <td>${formatCurrency(loanData.rehabBudget)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Draw Request Details</div>
        <table class="info-table">
          <tr>
            <th>Draw Request Number:</th>
            <td># _______________</td>
          </tr>
          <tr>
            <th>Date of Request:</th>
            <td>${formattedDate}</td>
          </tr>
          <tr>
            <th>Amount Requested:</th>
            <td>$ _______________</td>
          </tr>
          <tr>
            <th>Previous Draws to Date:</th>
            <td>$ _______________</td>
          </tr>
          <tr>
            <th>Remaining Funds After This Draw:</th>
            <td>$ _______________</td>
          </tr>
          <tr>
            <th>Percentage of Project Complete:</th>
            <td>_______________% complete</td>
          </tr>
          <tr>
            <th>Estimated Completion Date:</th>
            <td>_______________</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Work Completed (For This Draw Request)</div>
        <table class="info-table">
          <tr>
            <th style="width: 40%;">Category</th>
            <th style="width: 30%;">Amount Budgeted</th>
            <th style="width: 30%;">Amount Requested</th>
          </tr>
          <tr>
            <td>Demolition</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <td>Foundation/Structural</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <td>Framing/Carpentry</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <td>Roofing</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <td>Electrical</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <td>Plumbing</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <td>HVAC</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <td>Drywall/Insulation</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <td>Flooring/Tile</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <td>Cabinets/Countertops</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <td>Appliances</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <td>Painting</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <td>Landscaping/Exterior</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <td>Other (specify): _______________</td>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
          <tr>
            <th>TOTAL</th>
            <td>$ _______________</td>
            <td>$ _______________</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Required Documentation</div>
        <p>Please check all items that are attached with this draw request:</p>
        <table class="info-table">
          <tr>
            <td style="width: 10%;">□</td>
            <td>Contractor invoices for work completed</td>
          </tr>
          <tr>
            <td>□</td>
            <td>Material receipts for purchases</td>
          </tr>
          <tr>
            <td>□</td>
            <td>Lien waivers from contractors and suppliers</td>
          </tr>
          <tr>
            <td>□</td>
            <td>Inspection report from lender's inspector</td>
          </tr>
          <tr>
            <td>□</td>
            <td>Applicable permits obtained</td>
          </tr>
          <tr>
            <td>□</td>
            <td>Building inspector approvals</td>
          </tr>
          <tr>
            <td>□</td>
            <td>Progress photographs</td>
          </tr>
          <tr>
            <td>□</td>
            <td>Updated project timeline</td>
          </tr>
          <tr>
            <td>□</td>
            <td>Change orders (if applicable)</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Certification</div>
        <p>
          I/We certify that all information provided in this draw request is true and correct. The work described above has been 
          completed according to the approved plans and specifications. I/We understand that funds will be disbursed only after 
          lender's inspection and approval.
        </p>
        <p>
          I/We further acknowledge that any misrepresentation or false statement made in this draw request may result in default 
          under the loan documents and may constitute fraud.
        </p>
      </div>
      
      <div class="signature-section">
        <div class="signature-line"></div>
        <div>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}</div>
        <div style="margin-top: 10px;">By: ${loanData.borrowerName}, Authorized Signatory</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
        
        <div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p><strong>FOR LENDER USE ONLY</strong></p>
          <table class="info-table">
            <tr>
              <th>Inspection Date:</th>
              <td>_______________</td>
            </tr>
            <tr>
              <th>Inspector Name:</th>
              <td>_______________</td>
            </tr>
            <tr>
              <th>Amount Approved:</th>
              <td>$ _______________</td>
            </tr>
            <tr>
              <th>Approved By:</th>
              <td>_______________</td>
            </tr>
            <tr>
              <th>Date:</th>
              <td>_______________</td>
            </tr>
            <tr>
              <th>Notes:</th>
              <td>________________________________________________________________</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  `;
};

export const getBackgroundCheckTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">BACKGROUND CHECK RESULTS</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Applicant Information</div>
        <table class="info-table">
          <tr>
            <th>Applicant Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Social Security #:</th>
            <td>XXX-XX-${Math.floor(1000 + Math.random() * 9000)}</td>
          </tr>
          <tr>
            <th>Date of Birth:</th>
            <td>XX/XX/${1950 + Math.floor(Math.random() * 40)}</td>
          </tr>
          <tr>
            <th>Current Address:</th>
            <td>${loanData.borrowerAddress || 'N/A'}</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>${loanData.borrowerEmail}</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>${loanData.borrowerPhone || 'N/A'}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Background Check Summary</div>
        <table class="info-table">
          <tr>
            <th>Report Reference #:</th>
            <td>BGC-${loanData.id.substring(0, 8)}-${Math.floor(1000 + Math.random() * 9000)}</td>
          </tr>
          <tr>
            <th>Check Performed By:</th>
            <td>DocuLendAI Compliance Department</td>
          </tr>
          <tr>
            <th>Check Completed On:</th>
            <td>${formattedDate}</td>
          </tr>
          <tr>
            <th>Verification Service:</th>
            <td>Comprehensive Background Solutions, Inc.</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Verification Results</div>
        <table class="info-table">
          <tr>
            <th style="width: 40%;">Check Type</th>
            <th style="width: 30%;">Status</th>
            <th style="width: 30%;">Notes</th>
          </tr>
          <tr>
            <td>Identity Verification</td>
            <td><span style="color: green; font-weight: bold;">VERIFIED</span></td>
            <td>Photo ID and SSN verified</td>
          </tr>
          <tr>
            <td>Credit Report</td>
            <td><span style="color: green; font-weight: bold;">REVIEWED</span></td>
            <td>Credit score: ${loanData.creditScore || 680} (${(loanData.creditScore || 680) > 700 ? 'Good' : 'Fair'})</td>
          </tr>
          <tr>
            <td>Criminal Background</td>
            <td><span style="color: green; font-weight: bold;">CLEAR</span></td>
            <td>No criminal records found</td>
          </tr>
          <tr>
            <td>OFAC Watchlist</td>
            <td><span style="color: green; font-weight: bold;">CLEAR</span></td>
            <td>No matches found</td>
          </tr>
          <tr>
            <td>Global Sanctions Check</td>
            <td><span style="color: green; font-weight: bold;">CLEAR</span></td>
            <td>No matches found</td>
          </tr>
          <tr>
            <td>Bankruptcy History</td>
            <td><span style="color: green; font-weight: bold;">CLEAR</span></td>
            <td>No bankruptcy records found</td>
          </tr>
          <tr>
            <td>Property Ownership Verification</td>
            <td><span style="color: green; font-weight: bold;">VERIFIED</span></td>
            <td>Property records confirm ownership</td>
          </tr>
          <tr>
            <td>Business Entity Verification</td>
            <td><span style="color: green; font-weight: bold;">VERIFIED</span></td>
            <td>${loanData.entityName || `${loanData.borrowerName} Properties LLC`} in good standing</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Real Estate Investment Experience</div>
        <table class="info-table">
          <tr>
            <th>Investment Properties Owned:</th>
            <td>${Math.floor(2 + Math.random() * 8)}</td>
          </tr>
          <tr>
            <th>Experience Level:</th>
            <td>${loanData.borrowerExperience || 'Intermediate (2-4 projects)'}</td>
          </tr>
          <tr>
            <th>Previous Loan Performance:</th>
            <td>No defaults or late payments reported</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Compliance Certification</div>
        <p>
          This background check was conducted in compliance with the Fair Credit Reporting Act (FCRA), 
          Equal Credit Opportunity Act (ECOA), and all applicable state and federal laws. Applicant 
          has provided written consent for this background check.
        </p>
        <p>
          This report is confidential and for the exclusive use of DocuLendAI in 
          evaluating the loan application for property at ${loanData.propertyAddress}.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Overall Risk Assessment</div>
        <table class="info-table">
          <tr>
            <th>Risk Level:</th>
            <td><span style="color: green; font-weight: bold;">LOW</span></td>
          </tr>
          <tr>
            <th>Recommendation:</th>
            <td>Proceed with loan application processing</td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <p>This report generated by DocuLendAI Compliance Department</p>
        <div class="signature-line"></div>
        <div>Compliance Officer</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getContactInformationTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">CONTACT INFORMATION SHEET</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Borrower Information</div>
        <table class="info-table">
          <tr>
            <th>Full Legal Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Email Address:</th>
            <td>${loanData.borrowerEmail}</td>
          </tr>
          <tr>
            <th>Primary Phone:</th>
            <td>${loanData.borrowerPhone || '(___) ___-____'}</td>
          </tr>
          <tr>
            <th>Alternative Phone:</th>
            <td>(___) ___-____</td>
          </tr>
          <tr>
            <th>Current Home Address:</th>
            <td>${loanData.borrowerAddress || 'N/A'}</td>
          </tr>
          <tr>
            <th>Mailing Address:</th>
            <td>${loanData.borrowerAddress || 'Same as home address'}</td>
          </tr>
          <tr>
            <th>Preferred Contact Method:</th>
            <td>□ Email   □ Phone   □ Text   □ Mail</td>
          </tr>
          <tr>
            <th>Best Time to Contact:</th>
            <td>□ Morning   □ Afternoon   □ Evening   □ Anytime</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Business Entity Information</div>
        <table class="info-table">
          <tr>
            <th>Entity Name:</th>
            <td>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}</td>
          </tr>
          <tr>
            <th>Entity Type:</th>
            <td>${loanData.entityType || 'Limited Liability Company (LLC)'}</td>
          </tr>
          <tr>
            <th>EIN:</th>
            <td>${loanData.ein || 'XX-XXXXXXX'}</td>
          </tr>
          <tr>
            <th>State of Formation:</th>
            <td>${loanData.stateOfFormation || loanData.state || 'N/A'}</td>
          </tr>
          <tr>
            <th>Business Address:</th>
            <td>${loanData.borrowerAddress || 'N/A'}</td>
          </tr>
          <tr>
            <th>Business Phone:</th>
            <td>${loanData.borrowerPhone || '(___) ___-____'}</td>
          </tr>
          <tr>
            <th>Business Website:</th>
            <td>www.___________________.com</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Emergency Contact</div>
        <table class="info-table">
          <tr>
            <th>Full Name:</th>
            <td>_______________________________</td>
          </tr>
          <tr>
            <th>Relationship:</th>
            <td>_______________________________</td>
          </tr>
          <tr>
            <th>Phone Number:</th>
            <td>_______________________________</td>
          </tr>
          <tr>
            <th>Email Address:</th>
            <td>_______________________________</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Professional Contacts</div>
        <table class="info-table">
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Attorney</th>
          </tr>
          <tr>
            <th>Name/Firm:</th>
            <td>_______________________________</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>_______________________________</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>_______________________________</td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Accountant/CPA</th>
          </tr>
          <tr>
            <th>Name/Firm:</th>
            <td>_______________________________</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>_______________________________</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>_______________________________</td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Insurance Agent</th>
          </tr>
          <tr>
            <th>Name/Agency:</th>
            <td>_______________________________</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>_______________________________</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>_______________________________</td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Property Manager (if applicable)</th>
          </tr>
          <tr>
            <th>Name/Company:</th>
            <td>_______________________________</td>
          </tr>
          <tr>
            <th>Phone:</th>
            <td>_______________________________</td>
          </tr>
          <tr>
            <th>Email:</th>
            <td>_______________________________</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Property Information</div>
        <table class="info-table">
          <tr>
            <th>Subject Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Property Type:</th>
            <td>${loanData.propertyType.replace(/_/g, ' ')}</td>
          </tr>
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.replace(/_/g, ' ')}</td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Additional Notes</div>
        <p style="min-height: 100px; border: 1px solid #ddd; padding: 10px;">
          
        </p>
      </div>
      
      <div class="document-section">
        <p>
          I certify that the information provided above is true and correct to the best of my knowledge.
          I understand that it is my responsibility to notify DocuLendAI of any changes
          to the above information during the term of my loan.
        </p>
      </div>
      
      <div class="signature-section">
        <div class="signature-line"></div>
        <div>${loanData.borrowerName}, Borrower</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getPersonalFinancialStatementTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">PERSONAL FINANCIAL STATEMENT</div>
        <div class="document-subtitle">As of ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Personal Information</div>
        <table class="info-table">
          <tr>
            <th>Applicant Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Email Address:</th>
            <td>${loanData.borrowerEmail}</td>
          </tr>
          <tr>
            <th>Phone Number:</th>
            <td>${loanData.borrowerPhone || 'N/A'}</td>
          </tr>
          <tr>
            <th>Home Address:</th>
            <td>${loanData.borrowerAddress || 'N/A'}</td>
          </tr>
          <tr>
            <th>Social Security #:</th>
            <td>XXX-XX-${Math.floor(1000 + Math.random() * 9000)}</td>
          </tr>
          <tr>
            <th>Date of Birth:</th>
            <td>XX/XX/${1950 + Math.floor(Math.random() * 40)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Assets</div>
        <table class="info-table">
          <tr>
            <th style="width: 60%;">Asset Description</th>
            <th style="width: 40%;">Value</th>
          </tr>
          <tr>
            <td>Cash & Cash Equivalents</td>
            <td>${formatCurrency(loanData.loanAmount * 0.15)}</td>
          </tr>
          <tr>
            <td>Marketable Securities</td>
            <td>${formatCurrency(loanData.loanAmount * 0.2)}</td>
          </tr>
          <tr>
            <td>Non-Marketable Securities</td>
            <td>${formatCurrency(loanData.loanAmount * 0.05)}</td>
          </tr>
          <tr>
            <td>Primary Residence</td>
            <td>${formatCurrency(loanData.loanAmount * 0.8)}</td>
          </tr>
          <tr>
            <td>Investment Real Estate (Schedule A)</td>
            <td>${formatCurrency(loanData.loanAmount * 1.5)}</td>
          </tr>
          <tr>
            <td>Partial Interest in Real Estate Equities</td>
            <td>${formatCurrency(loanData.loanAmount * 0.3)}</td>
          </tr>
          <tr>
            <td>Personal Property</td>
            <td>${formatCurrency(loanData.loanAmount * 0.15)}</td>
          </tr>
          <tr>
            <td>Vehicles</td>
            <td>${formatCurrency(loanData.loanAmount * 0.1)}</td>
          </tr>
          <tr>
            <td>Business Interests (privately held)</td>
            <td>${formatCurrency(loanData.loanAmount * 0.5)}</td>
          </tr>
          <tr>
            <td>IRA, 401K, Retirement Accounts</td>
            <td>${formatCurrency(loanData.loanAmount * 0.7)}</td>
          </tr>
          <tr>
            <td>Life Insurance Cash Value</td>
            <td>${formatCurrency(loanData.loanAmount * 0.1)}</td>
          </tr>
          <tr>
            <td>Other Assets (specify): _____________</td>
            <td>${formatCurrency(loanData.loanAmount * 0.05)}</td>
          </tr>
          <tr>
            <th>TOTAL ASSETS</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 4.6)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Liabilities</div>
        <table class="info-table">
          <tr>
            <th style="width: 40%;">Liability Description</th>
            <th style="width: 30%;">Creditor</th>
            <th style="width: 30%;">Amount</th>
          </tr>
          <tr>
            <td>Credit Card Balances</td>
            <td>Various</td>
            <td>${formatCurrency(loanData.loanAmount * 0.04)}</td>
          </tr>
          <tr>
            <td>Primary Residence Mortgage</td>
            <td>First National Bank</td>
            <td>${formatCurrency(loanData.loanAmount * 0.6)}</td>
          </tr>
          <tr>
            <td>HELOC / Second Mortgage</td>
            <td>Capital One</td>
            <td>${formatCurrency(loanData.loanAmount * 0.1)}</td>
          </tr>
          <tr>
            <td>Investment Property Loans (Schedule B)</td>
            <td>Various Lenders</td>
            <td>${formatCurrency(loanData.loanAmount * 0.95)}</td>
          </tr>
          <tr>
            <td>Auto Loans</td>
            <td>Honda Financial</td>
            <td>${formatCurrency(loanData.loanAmount * 0.07)}</td>
          </tr>
          <tr>
            <td>Student Loans</td>
            <td>Navient</td>
            <td>${formatCurrency(loanData.loanAmount * 0.05)}</td>
          </tr>
          <tr>
            <td>Business Loans (personally guaranteed)</td>
            <td>Small Business Bank</td>
            <td>${formatCurrency(loanData.loanAmount * 0.15)}</td>
          </tr>
          <tr>
            <td>Personal Loans</td>
            <td>Family Trust</td>
            <td>${formatCurrency(loanData.loanAmount * 0.08)}</td>
          </tr>
          <tr>
            <td>Other Debts (specify): _____________</td>
            <td>Various</td>
            <td>${formatCurrency(loanData.loanAmount * 0.03)}</td>
          </tr>
          <tr>
            <th colspan="2">TOTAL LIABILITIES</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 2.07)}</strong></td>
          </tr>
          <tr>
            <th colspan="2">NET WORTH (Assets minus Liabilities)</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 2.53)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Annual Income</div>
        <table class="info-table">
          <tr>
            <th style="width: 60%;">Income Source</th>
            <th style="width: 40%;">Annual Amount</th>
          </tr>
          <tr>
            <td>Salary</td>
            <td>${formatCurrency(loanData.loanAmount * 0.3)}</td>
          </tr>
          <tr>
            <td>Bonuses & Commissions</td>
            <td>${formatCurrency(loanData.loanAmount * 0.1)}</td>
          </tr>
          <tr>
            <td>Dividends & Interest</td>
            <td>${formatCurrency(loanData.loanAmount * 0.03)}</td>
          </tr>
          <tr>
            <td>Real Estate Income (Net)</td>
            <td>${formatCurrency(loanData.loanAmount * 0.15)}</td>
          </tr>
          <tr>
            <td>Business Income (Net)</td>
            <td>${formatCurrency(loanData.loanAmount * 0.25)}</td>
          </tr>
          <tr>
            <td>Other Income (specify): _____________</td>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
          </tr>
          <tr>
            <th>TOTAL ANNUAL INCOME</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.85)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Annual Expenses</div>
        <table class="info-table">
          <tr>
            <th style="width: 60%;">Expense Description</th>
            <th style="width: 40%;">Annual Amount</th>
          </tr>
          <tr>
            <td>Income & Property Taxes</td>
            <td>${formatCurrency(loanData.loanAmount * 0.12)}</td>
          </tr>
          <tr>
            <td>Mortgage/Rent Payments</td>
            <td>${formatCurrency(loanData.loanAmount * 0.1)}</td>
          </tr>
          <tr>
            <td>Loan Payments</td>
            <td>${formatCurrency(loanData.loanAmount * 0.08)}</td>
          </tr>
          <tr>
            <td>Insurance Premiums</td>
            <td>${formatCurrency(loanData.loanAmount * 0.03)}</td>
          </tr>
          <tr>
            <td>Living Expenses</td>
            <td>${formatCurrency(loanData.loanAmount * 0.09)}</td>
          </tr>
          <tr>
            <td>Other Expenses (specify): _____________</td>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
          </tr>
          <tr>
            <th>TOTAL ANNUAL EXPENSES</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.44)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Schedule A - Real Estate Owned</div>
        <table class="info-table">
          <tr>
            <th>Property Type</th>
            <th>Address</th>
            <th>Market Value</th>
            <th>Mortgage Amount</th>
            <th>Equity</th>
          </tr>
          <tr>
            <td>Single Family</td>
            <td>123 Main St, Nashville, TN</td>
            <td>${formatCurrency(loanData.loanAmount * 0.8)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.4)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.4)}</td>
          </tr>
          <tr>
            <td>Rental Property</td>
            <td>456 Oak Dr, Memphis, TN</td>
            <td>${formatCurrency(loanData.loanAmount * 0.6)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.3)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.3)}</td>
          </tr>
          <tr>
            <td>Commercial</td>
            <td>789 Business Blvd, Knoxville, TN</td>
            <td>${formatCurrency(loanData.loanAmount * 1.2)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.7)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.5)}</td>
          </tr>
          <tr>
            <td>Vacant Land</td>
            <td>101 Development Rd, Chattanooga, TN</td>
            <td>${formatCurrency(loanData.loanAmount * 0.3)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.1)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.2)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Declarations</div>
        <table class="info-table">
          <tr>
            <th style="width: 80%;">Question</th>
            <th style="width: 20%;">Answer</th>
          </tr>
          <tr>
            <td>Are you a guarantor, co-maker, or endorser for any debt of others?</td>
            <td>□ Yes □ No</td>
          </tr>
          <tr>
            <td>Are there any outstanding judgments against you?</td>
            <td>□ Yes □ No</td>
          </tr>
          <tr>
            <td>Have you been declared bankrupt within the past 7 years?</td>
            <td>□ Yes □ No</td>
          </tr>
          <tr>
            <td>Have you had property foreclosed upon or given title or deed in lieu thereof?</td>
            <td>□ Yes □ No</td>
          </tr>
          <tr>
            <td>Are you party to a lawsuit?</td>
            <td>□ Yes □ No</td>
          </tr>
          <tr>
            <td>Are you obligated to pay alimony, child support, or separate maintenance?</td>
            <td>□ Yes □ No</td>
          </tr>
          <tr>
            <td>Is any part of the down payment borrowed?</td>
            <td>□ Yes □ No</td>
          </tr>
        </table>
        <p style="margin-top: 15px; font-style: italic;">
          For any "Yes" responses, please provide explanations on a separate page.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Certification</div>
        <p>
          I certify that the information provided in this personal financial statement is true and correct. 
          The information has been furnished to DocuLendAI to obtain or maintain credit. 
          I understand that you will retain this financial statement whether or not credit is granted, and 
          I authorize you to verify this information and to obtain additional information concerning my 
          financial standing.
        </p>
        <p>
          I further certify that I have disclosed all contingent liabilities, all sources of income, and 
          all debt obligations. I understand that any willful misrepresentation of the information contained 
          herein could result in a fine and/or imprisonment under relevant provisions of the law.
        </p>
      </div>
      
      <div class="signature-section">
        <div class="signature-line"></div>
        <div>${loanData.borrowerName}, Borrower</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getPersonalTaxReturnsTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const currentYear = new Date().getFullYear();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">PERSONAL TAX RETURNS</div>
        <div class="document-subtitle">Last 2 Years | ${currentYear-2} - ${currentYear-1}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Borrower Information</div>
        <table class="info-table">
          <tr>
            <th>Borrower Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Social Security #:</th>
            <td>XXX-XX-${Math.floor(1000 + Math.random() * 9000)}</td>
          </tr>
          <tr>
            <th>Loan Reference #:</th>
            <td>${loanData.id}</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Tax Return Summary - ${currentYear-1}</div>
        <table class="info-table">
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Income</th>
          </tr>
          <tr>
            <th style="width: 60%;">Wages, Salaries, Tips (Form W-2)</th>
            <td style="width: 40%;">${formatCurrency(loanData.loanAmount * 0.25)}</td>
          </tr>
          <tr>
            <th>Interest Income</th>
            <td>${formatCurrency(loanData.loanAmount * 0.01)}</td>
          </tr>
          <tr>
            <th>Dividend Income</th>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
          </tr>
          <tr>
            <th>Business Income (Schedule C)</th>
            <td>${formatCurrency(loanData.loanAmount * 0.2)}</td>
          </tr>
          <tr>
            <th>Capital Gains/Losses (Schedule D)</th>
            <td>${formatCurrency(loanData.loanAmount * 0.05)}</td>
          </tr>
          <tr>
            <th>Rental Real Estate Income (Schedule E)</th>
            <td>${formatCurrency(loanData.loanAmount * 0.15)}</td>
          </tr>
          <tr>
            <th>Other Income</th>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
          </tr>
          <tr>
            <th>Total Income</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.7)}</strong></td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Adjustments to Income</th>
          </tr>
          <tr>
            <th>IRA Deduction</th>
            <td>${formatCurrency(loanData.loanAmount * 0.01)}</td>
          </tr>
          <tr>
            <th>Student Loan Interest</th>
            <td>${formatCurrency(loanData.loanAmount * 0.005)}</td>
          </tr>
          <tr>
            <th>Health Insurance Premiums</th>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
          </tr>
          <tr>
            <th>Other Adjustments</th>
            <td>${formatCurrency(loanData.loanAmount * 0.015)}</td>
          </tr>
          <tr>
            <th>Adjusted Gross Income (AGI)</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.65)}</strong></td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Deductions and Exemptions</th>
          </tr>
          <tr>
            <th>Standard/Itemized Deductions</th>
            <td>${formatCurrency(loanData.loanAmount * 0.12)}</td>
          </tr>
          <tr>
            <th>Qualified Business Income Deduction</th>
            <td>${formatCurrency(loanData.loanAmount * 0.04)}</td>
          </tr>
          <tr>
            <th>Taxable Income</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.49)}</strong></td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Tax and Credits</th>
          </tr>
          <tr>
            <th>Federal Income Tax</th>
            <td>${formatCurrency(loanData.loanAmount * 0.11)}</td>
          </tr>
          <tr>
            <th>Credits</th>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
          </tr>
          <tr>
            <th>Other Taxes</th>
            <td>${formatCurrency(loanData.loanAmount * 0.015)}</td>
          </tr>
          <tr>
            <th>Total Tax</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.105)}</strong></td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Payments and Refund</th>
          </tr>
          <tr>
            <th>Federal Income Tax Withheld</th>
            <td>${formatCurrency(loanData.loanAmount * 0.12)}</td>
          </tr>
          <tr>
            <th>Estimated Tax Payments</th>
            <td>${formatCurrency(loanData.loanAmount * 0.03)}</td>
          </tr>
          <tr>
            <th>Total Payments</th>
            <td>${formatCurrency(loanData.loanAmount * 0.15)}</td>
          </tr>
          <tr>
            <th>Refund / (Amount Owed)</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.045)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Tax Return Summary - ${currentYear-2}</div>
        <table class="info-table">
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Income</th>
          </tr>
          <tr>
            <th style="width: 60%;">Wages, Salaries, Tips (Form W-2)</th>
            <td style="width: 40%;">${formatCurrency(loanData.loanAmount * 0.22)}</td>
          </tr>
          <tr>
            <th>Interest Income</th>
            <td>${formatCurrency(loanData.loanAmount * 0.008)}</td>
          </tr>
          <tr>
            <th>Dividend Income</th>
            <td>${formatCurrency(loanData.loanAmount * 0.015)}</td>
          </tr>
          <tr>
            <th>Business Income (Schedule C)</th>
            <td>${formatCurrency(loanData.loanAmount * 0.18)}</td>
          </tr>
          <tr>
            <th>Capital Gains/Losses (Schedule D)</th>
            <td>${formatCurrency(loanData.loanAmount * 0.03)}</td>
          </tr>
          <tr>
            <th>Rental Real Estate Income (Schedule E)</th>
            <td>${formatCurrency(loanData.loanAmount * 0.12)}</td>
          </tr>
          <tr>
            <th>Other Income</th>
            <td>${formatCurrency(loanData.loanAmount * 0.017)}</td>
          </tr>
          <tr>
            <th>Total Income</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.59)}</strong></td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Adjustments to Income</th>
          </tr>
          <tr>
            <th>IRA Deduction</th>
            <td>${formatCurrency(loanData.loanAmount * 0.01)}</td>
          </tr>
          <tr>
            <th>Student Loan Interest</th>
            <td>${formatCurrency(loanData.loanAmount * 0.005)}</td>
          </tr>
          <tr>
            <th>Health Insurance Premiums</th>
            <td>${formatCurrency(loanData.loanAmount * 0.018)}</td>
          </tr>
          <tr>
            <th>Other Adjustments</th>
            <td>${formatCurrency(loanData.loanAmount * 0.012)}</td>
          </tr>
          <tr>
            <th>Adjusted Gross Income (AGI)</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.545)}</strong></td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Deductions and Exemptions</th>
          </tr>
          <tr>
            <th>Standard/Itemized Deductions</th>
            <td>${formatCurrency(loanData.loanAmount * 0.1)}</td>
          </tr>
          <tr>
            <th>Qualified Business Income Deduction</th>
            <td>${formatCurrency(loanData.loanAmount * 0.035)}</td>
          </tr>
          <tr>
            <th>Taxable Income</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.41)}</strong></td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Tax and Credits</th>
          </tr>
          <tr>
            <th>Federal Income Tax</th>
            <td>${formatCurrency(loanData.loanAmount * 0.09)}</td>
          </tr>
          <tr>
            <th>Credits</th>
            <td>${formatCurrency(loanData.loanAmount * 0.018)}</td>
          </tr>
          <tr>
            <th>Other Taxes</th>
            <td>${formatCurrency(loanData.loanAmount * 0.012)}</td>
          </tr>
          <tr>
            <th>Total Tax</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.084)}</strong></td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Payments and Refund</th>
          </tr>
          <tr>
            <th>Federal Income Tax Withheld</th>
            <td>${formatCurrency(loanData.loanAmount * 0.1)}</td>
          </tr>
          <tr>
            <th>Estimated Tax Payments</th>
            <td>${formatCurrency(loanData.loanAmount * 0.025)}</td>
          </tr>
          <tr>
            <th>Total Payments</th>
            <td>${formatCurrency(loanData.loanAmount * 0.125)}</td>
          </tr>
          <tr>
            <th>Refund / (Amount Owed)</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.041)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Income Trend Analysis</div>
        <table class="info-table">
          <tr>
            <th style="width: 40%;">Category</th>
            <th style="width: 30%;">${currentYear-2}</th>
            <th style="width: 30%;">${currentYear-1}</th>
          </tr>
          <tr>
            <td>Total Income</td>
            <td>${formatCurrency(loanData.loanAmount * 0.59)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.7)}</td>
          </tr>
          <tr>
            <td>Adjusted Gross Income</td>
            <td>${formatCurrency(loanData.loanAmount * 0.545)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.65)}</td>
          </tr>
          <tr>
            <td>Business Income</td>
            <td>${formatCurrency(loanData.loanAmount * 0.18)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.2)}</td>
          </tr>
          <tr>
            <td>Rental Income</td>
            <td>${formatCurrency(loanData.loanAmount * 0.12)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.15)}</td>
          </tr>
          <tr>
            <td>Effective Tax Rate</td>
            <td>14.2%</td>
            <td>16.2%</td>
          </tr>
        </table>
        <p style="margin-top: 15px; font-style: italic;">
          Note: The above summary is for reference only. The complete tax returns with all schedules and forms have been reviewed.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Verification Notes</div>
        <table class="info-table">
          <tr>
            <th>Documents Verified:</th>
            <td>
              ✓ Form 1040 with all schedules for ${currentYear-2}<br>
              ✓ Form 1040 with all schedules for ${currentYear-1}<br>
              ✓ W-2 Forms for both years<br>
              ✓ 1099 Forms for both years<br>
              ✓ Schedule C (Business Income)<br>
              ✓ Schedule E (Rental Income)
            </td>
          </tr>
          <tr>
            <th>IRS Transcripts:</th>
            <td>Received and verified against provided returns</td>
          </tr>
          <tr>
            <th>Verification Method:</th>
            <td>Form 4506-T Request for Transcript of Tax Return</td>
          </tr>
          <tr>
            <th>Verified By:</th>
            <td>DocuLendAI Underwriting Team</td>
          </tr>
          <tr>
            <th>Verification Date:</th>
            <td>${formattedDate}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Notes and Observations</div>
        <p>
          The borrower's income shows a consistent upward trend with approximately ${Math.round((0.7-0.59)/0.59*100)}% 
          increase in total income from ${currentYear-2} to ${currentYear-1}. The rental income component has 
          increased by ${Math.round((0.15-0.12)/0.12*100)}%, which indicates growing experience and involvement 
          in real estate investments.
        </p>
        <p>
          The borrower has maintained good tax compliance with no evidence of unfiled returns or significant 
          tax liabilities. The relatively stable business income demonstrates consistency in their primary 
          business activities.
        </p>
      </div>
      
      <div class="signature-section">
        <p>This summary was prepared for loan underwriting purposes only.</p>
        <div class="signature-line"></div>
        <div>Loan Officer</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getBusinessTaxReturnsTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const currentYear = new Date().getFullYear();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">BUSINESS TAX RETURNS</div>
        <div class="document-subtitle">Last 2 Years | ${currentYear-2} - ${currentYear-1}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Business Information</div>
        <table class="info-table">
          <tr>
            <th>Business Name:</th>
            <td>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}</td>
          </tr>
          <tr>
            <th>EIN:</th>
            <td>${loanData.ein || 'XX-XXXXXXX'}</td>
          </tr>
          <tr>
            <th>Business Type:</th>
            <td>${loanData.entityType || 'Limited Liability Company (LLC)'}</td>
          </tr>
          <tr>
            <th>Borrower Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Loan Reference #:</th>
            <td>${loanData.id}</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Business Income Summary - ${currentYear-1}</div>
        <table class="info-table">
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Income Statement</th>
          </tr>
          <tr>
            <th style="width: 60%;">Gross Receipts or Sales</th>
            <td style="width: 40%;">${formatCurrency(loanData.loanAmount * 1.1)}</td>
          </tr>
          <tr>
            <th>Returns and Allowances</th>
            <td>${formatCurrency(loanData.loanAmount * 0.05)}</td>
          </tr>
          <tr>
            <th>Gross Profit</th>
            <td>${formatCurrency(loanData.loanAmount * 1.05)}</td>
          </tr>
          <tr>
            <th>Cost of Goods Sold</th>
            <td>${formatCurrency(loanData.loanAmount * 0.45)}</td>
          </tr>
          <tr>
            <th>Gross Income</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.6)}</strong></td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Business Expenses</th>
          </tr>
          <tr>
            <th>Advertising</th>
            <td>${formatCurrency(loanData.loanAmount * 0.03)}</td>
          </tr>
          <tr>
            <th>Car and Truck Expenses</th>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
          </tr>
          <tr>
            <th>Commissions and Fees</th>
            <td>${formatCurrency(loanData.loanAmount * 0.04)}</td>
          </tr>
          <tr>
            <th>Depreciation</th>
            <td>${formatCurrency(loanData.loanAmount * 0.07)}</td>
          </tr>
          <tr>
            <th>Insurance</th>
            <td>${formatCurrency(loanData.loanAmount * 0.025)}</td>
          </tr>
          <tr>
            <th>Legal and Professional Services</th>
            <td>${formatCurrency(loanData.loanAmount * 0.015)}</td>
          </tr>
          <tr>
            <th>Office Expenses</th>
            <td>${formatCurrency(loanData.loanAmount * 0.01)}</td>
          </tr>
          <tr>
            <th>Rent or Lease</th>
            <td>${formatCurrency(loanData.loanAmount * 0.05)}</td>
          </tr>
          <tr>
            <th>Repairs and Maintenance</th>
            <td>${formatCurrency(loanData.loanAmount * 0.04)}</td>
          </tr>
          <tr>
            <th>Supplies</th>
            <td>${formatCurrency(loanData.loanAmount * 0.015)}</td>
          </tr>
          <tr>
            <th>Taxes and Licenses</th>
            <td>${formatCurrency(loanData.loanAmount * 0.03)}</td>
          </tr>
          <tr>
            <th>Utilities</th>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
          </tr>
          <tr>
            <th>Wages</th>
            <td>${formatCurrency(loanData.loanAmount * 0.15)}</td>
          </tr>
          <tr>
            <th>Other Expenses</th>
            <td>${formatCurrency(loanData.loanAmount * 0.025)}</td>
          </tr>
          <tr>
            <th>Total Expenses</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.48)}</strong></td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Net Income</th>
          </tr>
          <tr>
            <th>Net Profit (or Loss)</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.12)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Business Income Summary - ${currentYear-2}</div>
        <table class="info-table">
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Income Statement</th>
          </tr>
          <tr>
            <th style="width: 60%;">Gross Receipts or Sales</th>
            <td style="width: 40%;">${formatCurrency(loanData.loanAmount * 0.95)}</td>
          </tr>
          <tr>
            <th>Returns and Allowances</th>
            <td>${formatCurrency(loanData.loanAmount * 0.04)}</td>
          </tr>
          <tr>
            <th>Gross Profit</th>
            <td>${formatCurrency(loanData.loanAmount * 0.91)}</td>
          </tr>
          <tr>
            <th>Cost of Goods Sold</th>
            <td>${formatCurrency(loanData.loanAmount * 0.4)}</td>
          </tr>
          <tr>
            <th>Gross Income</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.51)}</strong></td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Business Expenses</th>
          </tr>
          <tr>
            <th>Advertising</th>
            <td>${formatCurrency(loanData.loanAmount * 0.025)}</td>
          </tr>
          <tr>
            <th>Car and Truck Expenses</th>
            <td>${formatCurrency(loanData.loanAmount * 0.018)}</td>
          </tr>
          <tr>
            <th>Commissions and Fees</th>
            <td>${formatCurrency(loanData.loanAmount * 0.035)}</td>
          </tr>
          <tr>
            <th>Depreciation</th>
            <td>${formatCurrency(loanData.loanAmount * 0.06)}</td>
          </tr>
          <tr>
            <th>Insurance</th>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
          </tr>
          <tr>
            <th>Legal and Professional Services</th>
            <td>${formatCurrency(loanData.loanAmount * 0.012)}</td>
          </tr>
          <tr>
            <th>Office Expenses</th>
            <td>${formatCurrency(loanData.loanAmount * 0.008)}</td>
          </tr>
          <tr>
            <th>Rent or Lease</th>
            <td>${formatCurrency(loanData.loanAmount * 0.045)}</td>
          </tr>
          <tr>
            <th>Repairs and Maintenance</th>
            <td>${formatCurrency(loanData.loanAmount * 0.035)}</td>
          </tr>
          <tr>
            <th>Supplies</th>
            <td>${formatCurrency(loanData.loanAmount * 0.012)}</td>
          </tr>
          <tr>
            <th>Taxes and Licenses</th>
            <td>${formatCurrency(loanData.loanAmount * 0.025)}</td>
          </tr>
          <tr>
            <th>Utilities</th>
            <td>${formatCurrency(loanData.loanAmount * 0.018)}</td>
          </tr>
          <tr>
            <th>Wages</th>
            <td>${formatCurrency(loanData.loanAmount * 0.13)}</td>
          </tr>
          <tr>
            <th>Other Expenses</th>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
          </tr>
          <tr>
            <th>Total Expenses</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.423)}</strong></td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Net Income</th>
          </tr>
          <tr>
            <th>Net Profit (or Loss)</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.087)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Balance Sheet as of ${currentYear-1} Year End</div>
        <table class="info-table">
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Assets</th>
          </tr>
          <tr>
            <th style="width: 60%;">Current Assets</th>
            <td style="width: 40%;"></td>
          </tr>
          <tr>
            <th>  - Cash</th>
            <td>${formatCurrency(loanData.loanAmount * 0.1)}</td>
          </tr>
          <tr>
            <th>  - Accounts Receivable</th>
            <td>${formatCurrency(loanData.loanAmount * 0.15)}</td>
          </tr>
          <tr>
            <th>  - Inventory</th>
            <td>${formatCurrency(loanData.loanAmount * 0.2)}</td>
          </tr>
          <tr>
            <th>  - Other Current Assets</th>
            <td>${formatCurrency(loanData.loanAmount * 0.05)}</td>
          </tr>
          <tr>
            <th>Total Current Assets</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.5)}</strong></td>
          </tr>
          <tr>
            <th>Fixed Assets</th>
            <td></td>
          </tr>
          <tr>
            <th>  - Real Estate</th>
            <td>${formatCurrency(loanData.loanAmount * 1.5)}</td>
          </tr>
          <tr>
            <th>  - Equipment</th>
            <td>${formatCurrency(loanData.loanAmount * 0.2)}</td>
          </tr>
          <tr>
            <th>  - Less: Accumulated Depreciation</th>
            <td>(${formatCurrency(loanData.loanAmount * 0.3)})</td>
          </tr>
          <tr>
            <th>Total Fixed Assets</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 1.4)}</strong></td>
          </tr>
          <tr>
            <th>Other Assets</th>
            <td>${formatCurrency(loanData.loanAmount * 0.1)}</td>
          </tr>
          <tr>
            <th>TOTAL ASSETS</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 2.0)}</strong></td>
          </tr>
          
          <tr>
            <th colspan="2" style="background-color: #f0f0f0;">Liabilities and Equity</th>
          </tr>
          <tr>
            <th>Current Liabilities</th>
            <td></td>
          </tr>
          <tr>
            <th>  - Accounts Payable</th>
            <td>${formatCurrency(loanData.loanAmount * 0.12)}</td>
          </tr>
          <tr>
            <th>  - Short-term Debt</th>
            <td>${formatCurrency(loanData.loanAmount * 0.08)}</td>
          </tr>
          <tr>
            <th>  - Other Current Liabilities</th>
            <td>${formatCurrency(loanData.loanAmount * 0.05)}</td>
          </tr>
          <tr>
            <th>Total Current Liabilities</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.25)}</strong></td>
          </tr>
          <tr>
            <th>Long-term Liabilities</th>
            <td></td>
          </tr>
          <tr>
            <th>  - Mortgage Loans</th>
            <td>${formatCurrency(loanData.loanAmount * 0.9)}</td>
          </tr>
          <tr>
            <th>  - Other Long-term Liabilities</th>
            <td>${formatCurrency(loanData.loanAmount * 0.1)}</td>
          </tr>
          <tr>
            <th>Total Long-term Liabilities</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 1.0)}</strong></td>
          </tr>
          <tr>
            <th>TOTAL LIABILITIES</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 1.25)}</strong></td>
          </tr>
          <tr>
            <th>Owner's Equity</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.75)}</strong></td>
          </tr>
          <tr>
            <th>TOTAL LIABILITIES & EQUITY</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 2.0)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Business Performance Analysis</div>
        <table class="info-table">
          <tr>
            <th style="width: 40%;">Key Metrics</th>
            <th style="width: 30%;">${currentYear-2}</th>
            <th style="width: 30%;">${currentYear-1}</th>
          </tr>
          <tr>
            <td>Gross Revenue</td>
            <td>${formatCurrency(loanData.loanAmount * 0.95)}</td>
            <td>${formatCurrency(loanData.loanAmount * 1.1)}</td>
          </tr>
          <tr>
            <td>Gross Profit Margin</td>
            <td>53.7%</td>
            <td>57.1%</td>
          </tr>
          <tr>
            <td>Net Profit Margin</td>
            <td>9.2%</td>
            <td>10.9%</td>
          </tr>
          <tr>
            <td>Revenue Growth</td>
            <td>N/A</td>
            <td>15.8%</td>
          </tr>
          <tr>
            <td>Cash Flow</td>
            <td>${formatCurrency(loanData.loanAmount * 0.13)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.18)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Document Verification</div>
        <table class="info-table">
          <tr>
            <th>Documents Verified:</th>
            <td>
              ✓ Form 1120 or 1065 for ${currentYear-2}<br>
              ✓ Form 1120 or 1065 for ${currentYear-1}<br>
              ✓ Schedule K-1 (Form 1065) for both years<br>
              ✓ Business Financial Statements<br>
              ✓ Business Bank Statements
            </td>
          </tr>
          <tr>
            <th>IRS Transcripts:</th>
            <td>Received and verified against provided returns</td>
          </tr>
          <tr>
            <th>Verification Method:</th>
            <td>Form 4506-T Request for Transcript of Tax Return</td>
          </tr>
          <tr>
            <th>Verified By:</th>
            <td>DocuLendAI Underwriting Team</td>
          </tr>
          <tr>
            <th>Verification Date:</th>
            <td>${formattedDate}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Notes and Observations</div>
        <p>
          The business shows a healthy growth trajectory with a ${Math.round((1.1-0.95)/0.95*100)}% increase in gross revenue 
          from ${currentYear-2} to ${currentYear-1}. The improvement in both gross and net profit margins indicates 
          increased operational efficiency. The business appears to be well-capitalized with a balanced 
          asset-to-liability ratio.
        </p>
        <p>
          The strong cash position and consistent growth in revenue support the borrower's ability to 
          service the proposed debt. The business has demonstrated financial stability and consistent 
          profitability over the review period.
        </p>
      </div>
      
      <div class="signature-section">
        <p>This summary was prepared for loan underwriting purposes only.</p>
        <div class="signature-line"></div>
        <div>Loan Officer</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getBankStatementsTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  // Generate month names for the last 3 months
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month1 = months[(currentMonth - 1 + 12) % 12];
  const month2 = months[(currentMonth - 2 + 12) % 12];
  const month3 = months[(currentMonth - 3 + 12) % 12];
  
  // Generate years for the last 3 months
  const year1 = currentMonth - 1 < 0 ? currentYear - 1 : currentYear;
  const year2 = currentMonth - 2 < 0 ? currentYear - 1 : currentYear;
  const year3 = currentMonth - 3 < 0 ? currentYear - 1 : currentYear;
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">BANK STATEMENTS</div>
        <div class="document-subtitle">Last 3 Months | ${month3} ${year3} - ${month1} ${year1}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Account Information</div>
        <table class="info-table">
          <tr>
            <th>Account Holder:</th>
            <td>${loanData.entityName || loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Account Type:</th>
            <td>Business Checking</td>
          </tr>
          <tr>
            <th>Bank Name:</th>
            <td>First National Bank</td>
          </tr>
          <tr>
            <th>Account Number:</th>
            <td>XXXX-XXX-${Math.floor(1000 + Math.random() * 9000)}</td>
          </tr>
          <tr>
            <th>Borrower Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Loan Reference #:</th>
            <td>${loanData.id}</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Summary of ${month1} ${year1} Statement</div>
        <table class="info-table">
          <tr>
            <th style="width: 60%;">Beginning Balance (${month1} 1, ${year1})</th>
            <td style="width: 40%;">${formatCurrency(loanData.loanAmount * 0.18)}</td>
          </tr>
          <tr>
            <th>Total Deposits and Credits (${Math.floor(8 + Math.random() * 15)} transactions)</th>
            <td>${formatCurrency(loanData.loanAmount * 0.43)}</td>
          </tr>
          <tr>
            <th>Total Withdrawals and Debits (${Math.floor(15 + Math.random() * 25)} transactions)</th>
            <td>${formatCurrency(loanData.loanAmount * 0.35)}</td>
          </tr>
          <tr>
            <th>Ending Balance (${month1} ${new Date(year1, months.indexOf(month1) + 1, 0).getDate()}, ${year1})</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.26)}</strong></td>
          </tr>
          <tr>
            <th>Average Daily Balance</th>
            <td>${formatCurrency(loanData.loanAmount * 0.22)}</td>
          </tr>
        </table>
        <p style="margin-top: 10px; font-style: italic;">
          Note: Statement shows regular business activity with consistent cash flow.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Summary of ${month2} ${year2} Statement</div>
        <table class="info-table">
          <tr>
            <th style="width: 60%;">Beginning Balance (${month2} 1, ${year2})</th>
            <td style="width: 40%;">${formatCurrency(loanData.loanAmount * 0.16)}</td>
          </tr>
          <tr>
            <th>Total Deposits and Credits (${Math.floor(8 + Math.random() * 15)} transactions)</th>
            <td>${formatCurrency(loanData.loanAmount * 0.38)}</td>
          </tr>
          <tr>
            <th>Total Withdrawals and Debits (${Math.floor(15 + Math.random() * 25)} transactions)</th>
            <td>${formatCurrency(loanData.loanAmount * 0.36)}</td>
          </tr>
          <tr>
            <th>Ending Balance (${month2} ${new Date(year2, months.indexOf(month2) + 1, 0).getDate()}, ${year2})</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.18)}</strong></td>
          </tr>
          <tr>
            <th>Average Daily Balance</th>
            <td>${formatCurrency(loanData.loanAmount * 0.17)}</td>
          </tr>
        </table>
        <p style="margin-top: 10px; font-style: italic;">
          Note: Statement shows consistent business operations with normal seasonal fluctuations.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Summary of ${month3} ${year3} Statement</div>
        <table class="info-table">
          <tr>
            <th style="width: 60%;">Beginning Balance (${month3} 1, ${year3})</th>
            <td style="width: 40%;">${formatCurrency(loanData.loanAmount * 0.13)}</td>
          </tr>
          <tr>
            <th>Total Deposits and Credits (${Math.floor(8 + Math.random() * 15)} transactions)</th>
            <td>${formatCurrency(loanData.loanAmount * 0.35)}</td>
          </tr>
          <tr>
            <th>Total Withdrawals and Debits (${Math.floor(15 + Math.random() * 25)} transactions)</th>
            <td>${formatCurrency(loanData.loanAmount * 0.32)}</td>
          </tr>
          <tr>
            <th>Ending Balance (${month3} ${new Date(year3, months.indexOf(month3) + 1, 0).getDate()}, ${year3})</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.16)}</strong></td>
          </tr>
          <tr>
            <th>Average Daily Balance</th>
            <td>${formatCurrency(loanData.loanAmount * 0.14)}</td>
          </tr>
        </table>
        <p style="margin-top: 10px; font-style: italic;">
          Note: Statement shows stable business operations with consistent cash flow.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Significant Deposits (>${formatCurrency(loanData.loanAmount * 0.05)})</div>
        <table class="info-table">
          <tr>
            <th style="width: 20%;">Date</th>
            <th style="width: 25%;">Amount</th>
            <th style="width: 55%;">Source / Description</th>
          </tr>
          <tr>
            <td>${month1} 5, ${year1}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.08)}</td>
            <td>Wire Transfer - Client Payment</td>
          </tr>
          <tr>
            <td>${month1} 15, ${year1}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.12)}</td>
            <td>ACH Credit - Property Management Income</td>
          </tr>
          <tr>
            <td>${month2} 3, ${year2}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.07)}</td>
            <td>Check Deposit - Client Payment</td>
          </tr>
          <tr>
            <td>${month2} 22, ${year2}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.09)}</td>
            <td>ACH Credit - Property Management Income</td>
          </tr>
          <tr>
            <td>${month3} 10, ${year3}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.06)}</td>
            <td>Wire Transfer - Client Payment</td>
          </tr>
          <tr>
            <td>${month3} 27, ${year3}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.11)}</td>
            <td>ACH Credit - Property Management Income</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Regular Monthly Expenses</div>
        <table class="info-table">
          <tr>
            <th style="width: 40%;">Expense Type</th>
            <th style="width: 30%;">Typical Amount</th>
            <th style="width: 30%;">Payment Method</th>
          </tr>
          <tr>
            <td>Business Mortgage/Rent</td>
            <td>${formatCurrency(loanData.loanAmount * 0.05)}</td>
            <td>ACH Debit</td>
          </tr>
          <tr>
            <td>Utilities</td>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
            <td>ACH Debit</td>
          </tr>
          <tr>
            <td>Insurance</td>
            <td>${formatCurrency(loanData.loanAmount * 0.025)}</td>
            <td>ACH Debit</td>
          </tr>
          <tr>
            <td>Payroll</td>
            <td>${formatCurrency(loanData.loanAmount * 0.14)}</td>
            <td>ACH Batch</td>
          </tr>
          <tr>
            <td>Vendor Payments</td>
            <td>${formatCurrency(loanData.loanAmount * 0.06)}</td>
            <td>Check/ACH</td>
          </tr>
          <tr>
            <td>Business Credit Card Payment</td>
            <td>${formatCurrency(loanData.loanAmount * 0.04)}</td>
            <td>ACH Debit</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Bank Statement Analysis</div>
        <table class="info-table">
          <tr>
            <th style="width: 50%;">Key Metric</th>
            <th style="width: 50%;">Analysis</th>
          </tr>
          <tr>
            <td>Deposit Consistency</td>
            <td><span style="color: green;">Strong</span> - Regular deposit patterns observed</td>
          </tr>
          <tr>
            <td>Cash Flow Trend</td>
            <td><span style="color: green;">Positive</span> - Increasing balance over 3-month period</td>
          </tr>
          <tr>
            <td>Overdrafts/NSF</td>
            <td><span style="color: green;">None</span> - No instances observed in review period</td>
          </tr>
          <tr>
            <td>Average Monthly Deposits</td>
            <td>${formatCurrency(loanData.loanAmount * 0.38)}</td>
          </tr>
          <tr>
            <td>Ending Balance Trend</td>
            <td><span style="color: green;">Increasing</span> - +${Math.round((0.26-0.16)/0.16*100)}% in last 3 months</td>
          </tr>
          <tr>
            <td>Irregular Activity</td>
            <td><span style="color: green;">None</span> - No suspicious transactions noted</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Document Verification</div>
        <table class="info-table">
          <tr>
            <th>Statements Verified:</th>
            <td>
              ✓ ${month1} ${year1} Bank Statement<br>
              ✓ ${month2} ${year2} Bank Statement<br>
              ✓ ${month3} ${year3} Bank Statement
            </td>
          </tr>
          <tr>
            <th>Verification Method:</th>
            <td>Original bank statements with all pages reviewed</td>
          </tr>
          <tr>
            <th>Verified By:</th>
            <td>DocuLendAI Underwriting Team</td>
          </tr>
          <tr>
            <th>Verification Date:</th>
            <td>${formattedDate}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Notes and Observations</div>
        <p>
          The bank statements show a healthy business operation with consistent cash flow patterns. 
          The account maintains sufficient balances to handle regular business expenses, and 
          there's evidence of a growing cash position over the three-month period. No unusual 
          activity or irregularities were identified during the review.
        </p>
        <p>
          Deposits are consistent with the reported business income, and the cash flow supports 
          the borrower's ability to service the requested loan. The absence of overdrafts or 
          insufficient funds indicates responsible financial management.
        </p>
      </div>
      
      <div class="signature-section">
        <p>This summary was prepared for loan underwriting purposes only.</p>
        <div class="signature-line"></div>
        <div>Loan Officer</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getIncomeVerificationTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const currentYear = new Date().getFullYear();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">INCOME VERIFICATION</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Borrower Information</div>
        <table class="info-table">
          <tr>
            <th>Borrower Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Business Entity:</th>
            <td>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}</td>
          </tr>
          <tr>
            <th>Loan Reference #:</th>
            <td>${loanData.id}</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Income Verification Method</div>
        <table class="info-table">
          <tr>
            <th style="width: 30%;">Verification Method</th>
            <th style="width: 70%;">Description</th>
          </tr>
          <tr>
            <td><strong>✓ Tax Returns</strong></td>
            <td>Personal and business tax returns for the past 2 years</td>
          </tr>
          <tr>
            <td><strong>✓ Bank Statements</strong></td>
            <td>3 months of business and personal bank statements</td>
          </tr>
          <tr>
            <td><strong>✓ Profit & Loss</strong></td>
            <td>Year-to-date P&L statement prepared by accountant</td>
          </tr>
          <tr>
            <td><strong>✓ Rental Income</strong></td>
            <td>Verified through lease agreements and bank deposits</td>
          </tr>
          <tr>
            <td><strong>□ W-2/1099 Forms</strong></td>
            <td>Employment income verification (if applicable)</td>
          </tr>
          <tr>
            <td><strong>□ Letter of Employment</strong></td>
            <td>Employer verification (if applicable)</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Income Analysis</div>
        <table class="info-table">
          <tr>
            <th colspan="3" style="background-color: #f0f0f0;">Annual Income Summary</th>
          </tr>
          <tr>
            <th style="width: 40%;">Income Source</th>
            <th style="width: 30%;">${currentYear-1}</th>
            <th style="width: 30%;">${currentYear-2}</th>
          </tr>
          <tr>
            <td>Employment Income</td>
            <td>${formatCurrency(loanData.loanAmount * 0.25)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.22)}</td>
          </tr>
          <tr>
            <td>Business Income (Schedule C/K-1)</td>
            <td>${formatCurrency(loanData.loanAmount * 0.2)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.18)}</td>
          </tr>
          <tr>
            <td>Real Estate Income (Schedule E)</td>
            <td>${formatCurrency(loanData.loanAmount * 0.15)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.12)}</td>
          </tr>
          <tr>
            <td>Other Investment Income</td>
            <td>${formatCurrency(loanData.loanAmount * 0.03)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.025)}</td>
          </tr>
          <tr>
            <td><strong>Total Annual Income</strong></td>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.63)}</strong></td>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.545)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Monthly Income Analysis</div>
        <table class="info-table">
          <tr>
            <th style="width: 50%;">Income Category</th>
            <th style="width: 50%;">Monthly Amount</th>
          </tr>
          <tr>
            <td>Gross Monthly Income (Based on ${currentYear-1})</td>
            <td>${formatCurrency(loanData.loanAmount * 0.63 / 12)}</td>
          </tr>
          <tr>
            <td>Less: Federal, State & Local Taxes (Est. 25%)</td>
            <td>(${formatCurrency(loanData.loanAmount * 0.63 * 0.25 / 12)})</td>
          </tr>
          <tr>
            <td>Net Monthly Income</td>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.63 * 0.75 / 12)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Debt Service Analysis</div>
        <table class="info-table">
          <tr>
            <th style="width: 60%;">Calculation</th>
            <th style="width: 40%;">Amount</th>
          </tr>
          <tr>
            <td>Net Monthly Income</td>
            <td>${formatCurrency(loanData.loanAmount * 0.63 * 0.75 / 12)}</td>
          </tr>
          <tr>
            <td>Proposed Loan Payment (P&I)</td>
            <td>${formatCurrency(loanData.loanAmount * loanData.interestRate * 0.01 / 12)}</td>
          </tr>
          <tr>
            <td>Other Monthly Debt Payments</td>
            <td>${formatCurrency(loanData.loanAmount * 0.1 / 12)}</td>
          </tr>
          <tr>
            <td>Total Monthly Debt Obligations</td>
            <td>${formatCurrency((loanData.loanAmount * loanData.interestRate * 0.01 / 12) + (loanData.loanAmount * 0.1 / 12))}</td>
          </tr>
          <tr>
            <td><strong>Debt-to-Income (DTI) Ratio</strong></td>
            <td><strong>${(((loanData.loanAmount * loanData.interestRate * 0.01 / 12) + (loanData.loanAmount * 0.1 / 12)) / (loanData.loanAmount * 0.63 * 0.75 / 12) * 100).toFixed(2)}%</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Rental Property Income</div>
        <table class="info-table">
          <tr>
            <th colspan="3" style="background-color: #f0f0f0;">Subject Property (If Applicable)</th>
          </tr>
          <tr>
            <th style="width: 50%;">Income Source</th>
            <th style="width: 25%;">Monthly Amount</th>
            <th style="width: 25%;">Annual Amount</th>
          </tr>
          <tr>
            <td>Gross Rental Income</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0083)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.1)}</td>
          </tr>
          <tr>
            <td>Less: Vacancy Factor (5%)</td>
            <td>(${formatCurrency(loanData.loanAmount * 0.0083 * 0.05)})</td>
            <td>(${formatCurrency(loanData.loanAmount * 0.1 * 0.05)})</td>
          </tr>
          <tr>
            <td>Less: Operating Expenses (35%)</td>
            <td>(${formatCurrency(loanData.loanAmount * 0.0083 * 0.35)})</td>
            <td>(${formatCurrency(loanData.loanAmount * 0.1 * 0.35)})</td>
          </tr>
          <tr>
            <td><strong>Net Operating Income (NOI)</strong></td>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.0083 * 0.6)}</strong></td>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.1 * 0.6)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Income Stability Assessment</div>
        <table class="info-table">
          <tr>
            <th style="width: 30%;">Factor</th>
            <th style="width: 20%;">Rating</th>
            <th style="width: 50%;">Notes</th>
          </tr>
          <tr>
            <td>Income Consistency</td>
            <td><span style="color: green;">Strong</span></td>
            <td>Income has shown consistent growth over past 2 years</td>
          </tr>
          <tr>
            <td>Industry Stability</td>
            <td><span style="color: green;">Stable</span></td>
            <td>Borrower's business is in established real estate sector</td>
          </tr>
          <tr>
            <td>Income Diversity</td>
            <td><span style="color: green;">Good</span></td>
            <td>Multiple income streams provide stability</td>
          </tr>
          <tr>
            <td>Business Longevity</td>
            <td><span style="color: green;">Established</span></td>
            <td>Business has been operating for ${Math.floor(3 + Math.random() * 7)} years</td>
          </tr>
          <tr>
            <td>Future Income Outlook</td>
            <td><span style="color: green;">Positive</span></td>
            <td>Consistent growth trajectory with established client base</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Documentation Verification</div>
        <table class="info-table">
          <tr>
            <th>Documents Reviewed:</th>
            <td>
              ✓ ${currentYear-2} & ${currentYear-1} Personal Tax Returns<br>
              ✓ ${currentYear-2} & ${currentYear-1} Business Tax Returns<br>
              ✓ 3 Months of Bank Statements<br>
              ✓ Year-to-Date Profit & Loss Statement<br>
              ✓ Property Rent Roll and Lease Agreements
            </td>
          </tr>
          <tr>
            <th>Verification Method:</th>
            <td>Direct document review and IRS tax transcript verification</td>
          </tr>
          <tr>
            <th>Verified By:</th>
            <td>DocuLendAI Underwriting Team</td>
          </tr>
          <tr>
            <th>Verification Date:</th>
            <td>${formattedDate}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Underwriter's Assessment</div>
        <p>
          Based on the verification of income sources, the borrower demonstrates sufficient and 
          stable income to support the proposed loan amount. The multiple income streams provide 
          added security, and the debt-to-income ratio falls within acceptable parameters for 
          this loan type.
        </p>
        <p>
          The borrower's income has shown consistent growth over the past two years, and the 
          business operations appear stable with good cash flow management. The rental income 
          component demonstrates the borrower's experience in real estate investment.
        </p>
        <p>
          <strong>Recommendation:</strong> Income verification is satisfactory for loan approval consideration.
        </p>
      </div>
      
      <div class="signature-section">
        <p>This verification was prepared for loan underwriting purposes only.</p>
        <div class="signature-line"></div>
        <div>Loan Officer</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getRealEstateScheduleTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">SCHEDULE OF REAL ESTATE OWNED</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Borrower Information</div>
        <table class="info-table">
          <tr>
            <th>Borrower Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Business Entity:</th>
            <td>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}</td>
          </tr>
          <tr>
            <th>Loan Reference #:</th>
            <td>${loanData.id}</td>
          </tr>
          <tr>
            <th>Subject Property:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Requested Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Property Portfolio Summary</div>
        <table class="info-table">
          <tr>
            <th style="width: 40%;">Portfolio Overview</th>
            <th style="width: 30%;">Count</th>
            <th style="width: 30%;">Total Value</th>
          </tr>
          <tr>
            <td>Total Properties Owned</td>
            <td>${Math.floor(3 + Math.random() * 7)}</td>
            <td>${formatCurrency(loanData.loanAmount * 3.5)}</td>
          </tr>
          <tr>
            <td>Residential Rental Properties</td>
            <td>${Math.floor(2 + Math.random() * 4)}</td>
            <td>${formatCurrency(loanData.loanAmount * 2.1)}</td>
          </tr>
          <tr>
            <td>Commercial Properties</td>
            <td>${Math.floor(1 + Math.random() * 2)}</td>
            <td>${formatCurrency(loanData.loanAmount * 1.4)}</td>
          </tr>
          <tr>
            <td>Primary Residence</td>
            <td>1</td>
            <td>${formatCurrency(loanData.loanAmount * 0.8)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Detailed Property Schedule</div>
        <table class="info-table">
          <tr>
            <th style="background-color: #f0f0f0; text-align: center;" colspan="7">Primary Residence</th>
          </tr>
          <tr>
            <th>Address</th>
            <th>Property Type</th>
            <th>Market Value</th>
            <th>Mortgage Balance</th>
            <th>Equity</th>
            <th>Monthly Payment</th>
            <th>Status</th>
          </tr>
          <tr>
            <td>123 Homeowner Lane, Nashville, TN 37203</td>
            <td>Single Family</td>
            <td>${formatCurrency(loanData.loanAmount * 0.8)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.5)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.3)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0025)}</td>
            <td>Owner Occupied</td>
          </tr>
        </table>
        
        <table class="info-table" style="margin-top: 15px;">
          <tr>
            <th style="background-color: #f0f0f0; text-align: center;" colspan="9">Investment Properties</th>
          </tr>
          <tr>
            <th>Address</th>
            <th>Property Type</th>
            <th>Market Value</th>
            <th>Mortgage Balance</th>
            <th>Equity</th>
            <th>Monthly Payment</th>
            <th>Monthly Rent</th>
            <th>Cash Flow</th>
            <th>Status</th>
          </tr>
          <tr>
            <td>456 Income Dr, Nashville, TN 37209</td>
            <td>Duplex</td>
            <td>${formatCurrency(loanData.loanAmount * 0.6)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.35)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.25)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0022)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.005)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0028)}</td>
            <td>Rented</td>
          </tr>
          <tr>
            <td>789 Cash Flow Ave, Nashville, TN 37211</td>
            <td>Single Family</td>
            <td>${formatCurrency(loanData.loanAmount * 0.45)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.2)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.25)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0013)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.004)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0027)}</td>
            <td>Rented</td>
          </tr>
          <tr>
            <td>101 Rental Rd, Memphis, TN 38103</td>
            <td>Triplex</td>
            <td>${formatCurrency(loanData.loanAmount * 0.75)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.4)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.35)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0026)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.007)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0044)}</td>
            <td>Rented</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Financial Summary</div>
        <table class="info-table">
          <tr>
            <th style="width: 40%;">Financial Summary</th>
            <th style="width: 30%;">Amount</th>
            <th style="width: 30%;">Ratio/Percentage</th>
          </tr>
          <tr>
            <td>Total Market Value</td>
            <td>${formatCurrency(loanData.loanAmount * 2.6)}</td>
            <td>100%</td>
          </tr>
          <tr>
            <td>Total Outstanding Mortgage Debt</td>
            <td>${formatCurrency(loanData.loanAmount * 1.45)}</td>
            <td>56% LTV</td>
          </tr>
          <tr>
            <td>Total Equity</td>
            <td>${formatCurrency(loanData.loanAmount * 1.15)}</td>
            <td>44% Equity</td>
          </tr>
          <tr>
            <td>Monthly Rental Income</td>
            <td>${formatCurrency(loanData.loanAmount * 0.016)}</td>
            <td>7.4% Annual Yield</td>
          </tr>
          <tr>
            <td>Monthly Mortgage Payments</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0086)}</td>
            <td>7.1% Interest (Avg.)</td>
          </tr>
          <tr>
            <td>Net Monthly Cash Flow</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0074)}</td>
            <td>3.9% Cash-on-Cash Return</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Verification Statement</div>
        <p>
          This Schedule of Real Estate Owned has been prepared based on information provided by the borrower, 
          including property deeds, mortgage statements, lease agreements, and property tax records. All 
          property values have been verified through recent appraisals, broker price opinions, or comparable 
          market analyses.
        </p>
        <p>
          The borrower has demonstrated a systematic approach to building a diversified real estate 
          portfolio with a focus on cash-flowing properties in strong rental markets. The strategy 
          includes a mix of residential multi-family properties that consistently generate positive 
          cash flow.
        </p>
      </div>
      
      <div class="signature-section">
        <p>This schedule was prepared for loan underwriting purposes only.</p>
        <div class="signature-line"></div>
        <div>Loan Officer</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

export const getDebtScheduleTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">DEBT SCHEDULE</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Borrower Information</div>
        <table class="info-table">
          <tr>
            <th>Borrower Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Business Entity:</th>
            <td>${loanData.entityName || `${loanData.borrowerName} Properties LLC`}</td>
          </tr>
          <tr>
            <th>Loan Reference #:</th>
            <td>${loanData.id}</td>
          </tr>
          <tr>
            <th>Subject Property:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Requested Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Personal Debt Summary</div>
        <table class="info-table">
          <tr>
            <th style="width: 40%;">Debt Category</th>
            <th style="width: 30%;">Total Balance</th>
            <th style="width: 30%;">Monthly Payment</th>
          </tr>
          <tr>
            <td>Mortgage Loans (Primary Residence)</td>
            <td>${formatCurrency(loanData.loanAmount * 0.5)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0025)}</td>
          </tr>
          <tr>
            <td>Auto Loans</td>
            <td>${formatCurrency(loanData.loanAmount * 0.06)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0015)}</td>
          </tr>
          <tr>
            <td>Credit Cards</td>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0008)}</td>
          </tr>
          <tr>
            <td>Student Loans</td>
            <td>${formatCurrency(loanData.loanAmount * 0.04)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0004)}</td>
          </tr>
          <tr>
            <td>Personal Loans</td>
            <td>${formatCurrency(loanData.loanAmount * 0.01)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0003)}</td>
          </tr>
          <tr>
            <th>Total Personal Debt</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.63)}</strong></td>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.0055)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Business Debt Summary</div>
        <table class="info-table">
          <tr>
            <th style="width: 40%;">Debt Category</th>
            <th style="width: 30%;">Total Balance</th>
            <th style="width: 30%;">Monthly Payment</th>
          </tr>
          <tr>
            <td>Mortgage Loans (Investment Properties)</td>
            <td>${formatCurrency(loanData.loanAmount * 0.95)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0061)}</td>
          </tr>
          <tr>
            <td>Business Lines of Credit</td>
            <td>${formatCurrency(loanData.loanAmount * 0.03)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0004)}</td>
          </tr>
          <tr>
            <td>Equipment Loans</td>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0006)}</td>
          </tr>
          <tr>
            <td>Business Credit Cards</td>
            <td>${formatCurrency(loanData.loanAmount * 0.015)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0005)}</td>
          </tr>
          <tr>
            <th>Total Business Debt</th>
            <td><strong>${formatCurrency(loanData.loanAmount * 1.015)}</strong></td>
            <td><strong>${formatCurrency(loanData.loanAmount * 0.0076)}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Detailed Personal Debt Schedule</div>
        <table class="info-table">
          <tr>
            <th>Creditor</th>
            <th>Account Type</th>
            <th>Original Amount</th>
            <th>Current Balance</th>
            <th>Interest Rate</th>
            <th>Monthly Payment</th>
            <th>Maturity Date</th>
            <th>Collateral</th>
          </tr>
          <tr>
            <td>First National Bank</td>
            <td>Primary Mortgage</td>
            <td>${formatCurrency(loanData.loanAmount * 0.6)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.5)}</td>
            <td>3.75%</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0025)}</td>
            <td>06/2048</td>
            <td>Primary Residence</td>
          </tr>
          <tr>
            <td>Capital Auto Finance</td>
            <td>Auto Loan</td>
            <td>${formatCurrency(loanData.loanAmount * 0.08)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.04)}</td>
            <td>4.25%</td>
            <td>${formatCurrency(loanData.loanAmount * 0.001)}</td>
            <td>03/2025</td>
            <td>2021 Tesla Model Y</td>
          </tr>
          <tr>
            <td>Freedom Auto</td>
            <td>Auto Loan</td>
            <td>${formatCurrency(loanData.loanAmount * 0.03)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
            <td>4.50%</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0005)}</td>
            <td>11/2026</td>
            <td>2022 Ford F-150</td>
          </tr>
          <tr>
            <td>US Bank</td>
            <td>Credit Card</td>
            <td>N/A</td>
            <td>${formatCurrency(loanData.loanAmount * 0.01)}</td>
            <td>16.99%</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0004)}</td>
            <td>Revolving</td>
            <td>Unsecured</td>
          </tr>
          <tr>
            <td>CitiBank</td>
            <td>Credit Card</td>
            <td>N/A</td>
            <td>${formatCurrency(loanData.loanAmount * 0.01)}</td>
            <td>15.75%</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0004)}</td>
            <td>Revolving</td>
            <td>Unsecured</td>
          </tr>
          <tr>
            <td>Federal Student Aid</td>
            <td>Student Loan</td>
            <td>${formatCurrency(loanData.loanAmount * 0.06)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.04)}</td>
            <td>4.25%</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0004)}</td>
            <td>05/2029</td>
            <td>Unsecured</td>
          </tr>
          <tr>
            <td>Family Trust</td>
            <td>Personal Loan</td>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.01)}</td>
            <td>3.00%</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0003)}</td>
            <td>12/2024</td>
            <td>Unsecured</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Detailed Business Debt Schedule</div>
        <table class="info-table">
          <tr>
            <th>Creditor</th>
            <th>Account Type</th>
            <th>Property/Purpose</th>
            <th>Original Amount</th>
            <th>Current Balance</th>
            <th>Interest Rate</th>
            <th>Monthly Payment</th>
            <th>Maturity Date</th>
          </tr>
          <tr>
            <td>Evergreen Lending</td>
            <td>Investment Mortgage</td>
            <td>456 Income Dr, Nashville</td>
            <td>${formatCurrency(loanData.loanAmount * 0.4)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.35)}</td>
            <td>5.75%</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0022)}</td>
            <td>05/2037</td>
          </tr>
          <tr>
            <td>Property Finance Group</td>
            <td>Investment Mortgage</td>
            <td>789 Cash Flow Ave, Nashville</td>
            <td>${formatCurrency(loanData.loanAmount * 0.25)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.2)}</td>
            <td>5.25%</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0013)}</td>
            <td>03/2039</td>
          </tr>
          <tr>
            <td>Commercial Bank</td>
            <td>Investment Mortgage</td>
            <td>101 Rental Rd, Memphis</td>
            <td>${formatCurrency(loanData.loanAmount * 0.45)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.4)}</td>
            <td>6.00%</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0026)}</td>
            <td>08/2042</td>
          </tr>
          <tr>
            <td>Enterprise Bank</td>
            <td>Business LOC</td>
            <td>Working Capital</td>
            <td>${formatCurrency(loanData.loanAmount * 0.05)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.03)}</td>
            <td>7.25%</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0004)}</td>
            <td>Revolving</td>
          </tr>
          <tr>
            <td>Equipment Financers LLC</td>
            <td>Equipment Loan</td>
            <td>Construction Equipment</td>
            <td>${formatCurrency(loanData.loanAmount * 0.03)}</td>
            <td>${formatCurrency(loanData.loanAmount * 0.02)}</td>
            <td>6.50%</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0006)}</td>
            <td>10/2024</td>
          </tr>
          <tr>
            <td>Capital Business Card</td>
            <td>Business Credit Card</td>
            <td>Business Expenses</td>
            <td>N/A</td>
            <td>${formatCurrency(loanData.loanAmount * 0.015)}</td>
            <td>14.99%</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0005)}</td>
            <td>Revolving</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Debt Analysis</div>
        <table class="info-table">
          <tr>
            <th style="width: 60%;">Debt Metrics</th>
            <th style="width: 40%;">Value</th>
          </tr>
          <tr>
            <td>Total Debt (Personal & Business)</td>
            <td>${formatCurrency(loanData.loanAmount * 1.645)}</td>
          </tr>
          <tr>
            <td>Total Monthly Debt Payments</td>
            <td>${formatCurrency(loanData.loanAmount * 0.0131)}</td>
          </tr>
          <tr>
            <td>Debt-to-Income Ratio (DTI)</td>
            <td>${Math.round(loanData.loanAmount * 0.0131 / (loanData.loanAmount * 0.63 / 12) * 100)}%</td>
          </tr>
          <tr>
            <td>Business Debt Service Coverage Ratio (DSCR)</td>
            <td>${((loanData.loanAmount * 0.016) / (loanData.loanAmount * 0.0076)).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Weighted Average Interest Rate (Business Debt)</td>
            <td>5.68%</td>
          </tr>
          <tr>
            <td>Weighted Average Interest Rate (Personal Debt)</td>
            <td>4.12%</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Credit Profile</div>
        <table class="info-table">
          <tr>
            <th style="width: 50%;">Credit Information</th>
            <th style="width: 50%;">Details</th>
          </tr>
          <tr>
            <td>Credit Score (FICO)</td>
            <td>${loanData.creditScore || 745}</td>
          </tr>
          <tr>
            <td>Payment History</td>
            <td><span style="color: green;">Excellent</span> - No late payments in past 24 months</td>
          </tr>
          <tr>
            <td>Credit Utilization Ratio</td>
            <td>16% (Healthy range, below 30%)</td>
          </tr>
          <tr>
            <td>Number of Open Accounts</td>
            <td>12 (4 Personal, 8 Business)</td>
          </tr>
          <tr>
            <td>Derogatory Marks</td>
            <td>None</td>
          </tr>
          <tr>
            <td>Bankruptcies/Foreclosures</td>
            <td>None</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Proposed New Debt Impact</div>
        <table class="info-table">
          <tr>
            <th style="width: 50%;">Impact Analysis</th>
            <th style="width: 50%;">Post-Financing</th>
          </tr>
          <tr>
            <td>New Loan Amount</td>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <td>Estimated Monthly Payment</td>
            <td>${formatCurrency(loanData.loanAmount * loanData.interestRate / 100 / 12)}</td>
          </tr>
          <tr>
            <td>New Total Monthly Debt Payments</td>
            <td>${formatCurrency((loanData.loanAmount * 0.0131) + (loanData.loanAmount * loanData.interestRate / 100 / 12))}</td>
          </tr>
          <tr>
            <td>New Debt-to-Income Ratio</td>
            <td>${Math.round(((loanData.loanAmount * 0.0131) + (loanData.loanAmount * loanData.interestRate / 100 / 12)) / (loanData.loanAmount * 0.63 / 12) * 100)}%</td>
          </tr>
          <tr>
            <td>New DSCR (Business)</td>
            <td>${((loanData.loanAmount * 0.016) / ((loanData.loanAmount * 0.0076) + (loanData.loanAmount * loanData.interestRate / 100 / 12))).toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Underwriter's Comments</div>
        <p>
          The borrower demonstrates responsible debt management with a healthy mix of personal and 
          business debts. All accounts are current with no delinquencies, and the payment history is 
          excellent. The debt-to-income ratio is within acceptable parameters, and the business debt 
          is well-structured with property-secured loans comprising the majority of the debt.
        </p>
        <p>
          The proposed new loan would increase total monthly debt obligations but remains within 
          acceptable parameters based on the borrower's income and cash flow. The debt service coverage 
          ratio for the investment properties provides adequate cushion for debt servicing.
        </p>
      </div>
      
      <div class="signature-section">
        <p>This debt schedule was prepared for loan underwriting purposes only.</p>
        <div class="signature-line"></div>
        <div>Loan Officer</div>
        <div style="margin-top: 10px;">Date: ${formattedDate}</div>
      </div>
    </div>
  `;
};

// Credit Explanation Letters Template
const getCreditExplanationLettersTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  // Helper function to format a specific date
  const formatSpecificDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Helper function to format month and year (e.g., "January 2023")
  const formatMonthYear = (date: Date): string => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };
  
  // Get last 4 digits of SSN (safely)
  const lastFourSSN = '1234'; // Default value
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">CREDIT EXPLANATION LETTERS</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Borrower Information</div>
        <table class="info-table">
          <tr>
            <th>Borrower Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Social Security #:</th>
            <td>XXX-XX-${lastFourSSN}</td>
          </tr>
          <tr>
            <th>Loan Reference #:</th>
            <td>${loanData.id}</td>
          </tr>
          <tr>
            <th>Subject Property:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Requested Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Credit Summary</div>
        <table class="info-table">
          <tr>
            <th style="width: 40%;">Current Credit Score:</th>
            <td>${loanData.creditScore || '720'}</td>
          </tr>
          <tr>
            <th>Credit Report Date:</th>
            <td>${formatSpecificDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))}</td>
          </tr>
          <tr>
            <th>Overall Credit History:</th>
            <td>${(loanData.creditScore && loanData.creditScore > 700) ? 'Good' : 'Fair'} - ${Math.floor(Math.random() * 10) + 15} years of history</td>
          </tr>
          <tr>
            <th>Number of Credit Accounts:</th>
            <td>${Math.floor(Math.random() * 10) + 10}</td>
          </tr>
          <tr>
            <th>Credit Utilization:</th>
            <td>${Math.floor(Math.random() * 20) + 10}%</td>
          </tr>
          <tr>
            <th>Recent Credit Inquiries:</th>
            <td>4 inquiries in the last 12 months</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Explanation for Credit Inquiry #1</div>
        <div class="letter">
          <p>${formattedDate}</p>
          <p>To Whom It May Concern:</p>
          <p>I am writing to explain the credit inquiry from ABC Auto Finance that appeared on my credit report on ${formatSpecificDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000))}.</p>
          <p>This inquiry was the result of shopping for an auto loan for a new vehicle. I was comparing rates between several lenders within a 14-day period to secure the best financing terms. As permitted under the FCRA, these multiple inquiries for the same purpose within a short timeframe should be treated as a single inquiry for scoring purposes.</p>
          <p>I ultimately selected XYZ Bank for the auto loan with favorable terms. The vehicle purchase was completed on ${formatSpecificDate(new Date(Date.now() - 55 * 24 * 60 * 60 * 1000))}.</p>
          <p>Please contact me if you require any additional information.</p>
          <p>Sincerely,</p>
          <p>${loanData.borrowerName}</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Explanation for Credit Inquiry #2</div>
        <div class="letter">
          <p>${formattedDate}</p>
          <p>To Whom It May Concern:</p>
          <p>I am writing regarding the credit inquiry from HomeGoods Credit Services that appeared on my credit report on ${formatSpecificDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000))}.</p>
          <p>This inquiry occurred when I was purchasing new furniture for my home. I was offered a store financing promotion with 0% interest for 12 months, which I accepted. The account was opened with a limit of $5,000, and I have been making regular on-time payments since opening the account.</p>
          <p>The current balance on this account is $3,200, and I am on track to pay off the balance before the promotional period ends.</p>
          <p>Please contact me if you require any additional information.</p>
          <p>Sincerely,</p>
          <p>${loanData.borrowerName}</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Explanation for Credit Inquiry #3</div>
        <div class="letter">
          <p>${formattedDate}</p>
          <p>To Whom It May Concern:</p>
          <p>I am writing to explain the credit inquiry from LendingTree that appeared on my credit report on ${formatSpecificDate(new Date(Date.now() - 120 * 24 * 60 * 60 * 1000))}.</p>
          <p>This inquiry was made when I was researching refinancing options for my primary residence. I did not proceed with any loan applications after the initial rate check, as I determined it was not the right time to refinance. No new accounts were opened as a result of this inquiry.</p>
          <p>Please contact me if you require any additional information.</p>
          <p>Sincerely,</p>
          <p>${loanData.borrowerName}</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Explanation for Late Payment</div>
        <div class="letter">
          <p>${formattedDate}</p>
          <p>To Whom It May Concern:</p>
          <p>I am writing to explain the 30-day late payment on my Capital One credit card account ending in 5678 that occurred in ${formatMonthYear(new Date(Date.now() - 180 * 24 * 60 * 60 * 1000))}.</p>
          <p>This late payment was due to exceptional circumstances. I was traveling internationally for business and experienced issues accessing my online banking platform due to regional restrictions. Additionally, I did not receive the paper statement as it was misdelivered by the postal service.</p>
          <p>As soon as I became aware of the missed payment, I immediately paid the full amount due plus the late fee. I contacted Capital One to explain the situation, and they agreed to waive the late fee as a courtesy.</p>
          <p>Prior to this incident and since then, I have maintained a perfect payment history with all creditors. This was an isolated incident due to extraordinary circumstances and not indicative of my overall payment behavior.</p>
          <p>I have implemented additional safeguards to prevent such occurrences in the future, including setting up automatic payments and email alerts for all my accounts.</p>
          <p>Please contact me if you require any additional information.</p>
          <p>Sincerely,</p>
          <p>${loanData.borrowerName}</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Underwriter's Notes</div>
        <div class="notes-box">
          <p><strong>Credit Summary Analysis:</strong> Borrower has a strong overall credit profile with a score of ${loanData.creditScore || '720'} and ${Math.floor(Math.random() * 10) + 15} years of credit history. The explanations provided for the recent inquiries are reasonable and consistent with normal consumer behavior when shopping for auto loans and other financing.</p>
          <p><strong>Late Payment Assessment:</strong> The single 30-day late payment on the Capital One account appears to be an isolated incident with valid extenuating circumstances. The borrower has otherwise maintained a clean payment history before and after this occurrence.</p>
          <p><strong>Recommendation:</strong> Based on the explanations provided and the borrower's overall credit profile, the credit concerns have been adequately addressed. The credit inquiries were for legitimate purposes and should not negatively impact the loan decision. The single late payment is mitigated by the exceptional circumstances and the borrower's otherwise clean credit history.</p>
        </div>
      </div>
    </div>
  `;
};

// Export a mapping of document types to their template functions
export const documentTemplates: Record<string, (loanData: LoanData) => string> = {
  loan_application: getLoanApplicationTemplate,
  photo_id: getPhotoIdTemplate,
  credit_authorization: getCreditAuthorizationTemplate,
  promissory_note: getPromissoryNoteTemplate,
  deed_of_trust: getDeedOfTrustTemplate,
  closing_disclosure: getClosingDisclosureTemplate,
  property_appraisal: getPropertyAppraisalTemplate,
  term_sheet: getTermSheetTemplate,
  personal_guarantee: getPersonalGuaranteeTemplate,
  assignment_rents_leases: getAssignmentRentsLeasesTemplate,
  security_agreement: getSecurityAgreementTemplate,
  draw_requests: getDrawRequestTemplate,
  background_check: getBackgroundCheckTemplate,
  contact_information: getContactInformationTemplate,
  financial_statement: getPersonalFinancialStatementTemplate,
  personal_tax_returns: getPersonalTaxReturnsTemplate,
  business_tax_returns: getBusinessTaxReturnsTemplate,
  bank_statements: getBankStatementsTemplate,
  income_verification: getIncomeVerificationTemplate,
  real_estate_schedule: getRealEstateScheduleTemplate,
  debt_schedule: getDebtScheduleTemplate,
  credit_explanation: getCreditExplanationLettersTemplate,
  // Entity documentation templates
  formation_documents: getFormationDocumentsTemplate,
  operating_agreement: getOperatingAgreementTemplate,
  certificate_good_standing: getCertificateGoodStandingTemplate,
  ein_documentation: getEinDocumentationTemplate,
  resolution_to_borrow: getResolutionToBorrowTemplate,
  // Add other document types and their corresponding template functions here
};

// This function provides a convenient way to get the right template
export const getDocumentTemplate = (docType: string, loanData: LoanData): string => {
  console.log('Document template requested for type:', docType);
  
  const templateFunction = documentTemplates[docType];
  if (templateFunction) {
    console.log('Found template function for:', docType);
    return templateFunction(loanData);
  } else {
    console.log('No template found for:', docType, 'Using fallback template');
    // Fallback for unknown document types
    return `${baseStyle}
      <div class="document">
        <div class="document-header">
          <div class="document-title">${docType.toUpperCase().replace(/_/g, ' ')}</div>
          <div class="document-subtitle">Date: ${formatDate()}</div>
        </div>
        <div class="document-section">
          <p>Document template for "${docType}" not implemented yet.</p>
        </div>
      </div>
    `;
  }
}; 