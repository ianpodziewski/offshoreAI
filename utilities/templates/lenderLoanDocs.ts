import { documentStyleService } from '../documentStyleService';
import { LoanData } from '../loanGenerator';

/**
 * Lender Loan Document Templates
 * Contains templates for essential loan closing documents
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
  .checklist-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    font-size: 14px;
  }
  .checklist-table th, .checklist-table td {
    padding: 10px;
    text-align: left;
    border: 1px solid #ddd;
  }
  .checklist-table th {
    background-color: #f0f0f0;
    font-weight: bold;
  }
  .checklist-table tr:nth-child(even) {
    background-color: #f9f9f9;
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
  .status-pending {
    color: #ff9800;
    font-weight: bold;
  }
  .status-received {
    color: #4caf50;
    font-weight: bold;
  }
  .status-waived {
    color: #9e9e9e;
    font-weight: bold;
  }
  .status-exception {
    color: #f44336;
    font-weight: bold;
  }
  .status-na {
    color: #9e9e9e;
    font-style: italic;
  }
  .footer {
    margin-top: 50px;
    font-size: 12px;
    color: #666;
    border-top: 1px solid #ddd;
    padding-top: 20px;
  }
  .checkbox {
    width: 18px;
    height: 18px;
    border: 1px solid #aaa;
    display: inline-block;
    position: relative;
    margin-right: 10px;
    vertical-align: middle;
  }
  .checkbox.checked:after {
    content: "✓";
    position: absolute;
    top: -2px;
    left: 3px;
    font-size: 16px;
    font-weight: bold;
    color: #3a5a97;
  }
  .priority-high {
    background-color: #ffebee;
  }
  .priority-medium {
    background-color: #fff8e1;
  }
  .notes-field {
    padding: 10px;
    background-color: #f5f5f5;
    border-radius: 4px;
    margin-top: 5px;
    font-style: italic;
    color: #555;
  }
</style>`;

/**
 * Lender Closing Checklist Template
 * Comprehensive checklist for tracking loan closing document status
 */
export const getLenderClosingChecklistTemplate = (loanData: LoanData): string => {
  const currentDate = formatDate();
  const checklistId = `CL-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const closingDate = getFutureDate(Math.floor(Math.random() * 10) + 20); // Random closing date 20-30 days in future
  
  // Generate random dates for document status tracking
  const getRandomPastDate = (): string => {
    const daysAgo = Math.floor(Math.random() * 14) + 1;
    return getFutureDate(-daysAgo);
  };
  
  // Generate random document statuses
  const getDocumentStatus = (): { status: string, date: string, notes: string } => {
    const statuses = ['Received', 'Pending', 'Waived', 'Exception', 'N/A'];
    const randomIndex = Math.floor(Math.random() * 100);
    
    if (randomIndex < 60) {
      return { 
        status: 'Received', 
        date: getRandomPastDate(),
        notes: Math.random() > 0.7 ? 'Document verified and accepted.' : ''
      };
    } else if (randomIndex < 85) {
      return { 
        status: 'Pending', 
        date: '',
        notes: Math.random() > 0.5 ? 'Requested from borrower on ' + getRandomPastDate() + '.' : ''
      };
    } else if (randomIndex < 92) {
      return { 
        status: 'Waived', 
        date: getRandomPastDate(),
        notes: 'Requirement waived by underwriting.'
      };
    } else if (randomIndex < 98) {
      return { 
        status: 'Exception', 
        date: getRandomPastDate(),
        notes: 'Document incomplete. Additional information requested.'
      };
    } else {
      return { 
        status: 'N/A', 
        date: '',
        notes: 'Not applicable for this loan type.'
      };
    }
  };
  
  // Generate loan officers and closing staff
  const loanOfficers = [
    { name: 'Jennifer Martinez', title: 'Senior Loan Officer', phone: '(555) 123-4567', email: 'jmartinez@harringtoncapital.com' },
    { name: 'Michael Thompson', title: 'VP of Lending', phone: '(555) 987-6543', email: 'mthompson@harringtoncapital.com' },
    { name: 'Sarah Johnson', title: 'Mortgage Loan Officer', phone: '(555) 234-5678', email: 'sjohnson@harringtoncapital.com' }
  ];
  
  const closingAgents = [
    { name: 'Robert Davis', title: 'Closing Coordinator', phone: '(555) 345-6789', email: 'rdavis@harringtoncapital.com' },
    { name: 'Emily Wilson', title: 'Senior Closing Specialist', phone: '(555) 456-7890', email: 'ewilson@harringtoncapital.com' },
    { name: 'Thomas Rodriguez', title: 'Closing Department Manager', phone: '(555) 567-8901', email: 'trodriguez@harringtoncapital.com' }
  ];
  
  const loanOfficer = loanOfficers[Math.floor(Math.random() * loanOfficers.length)];
  const closingAgent = closingAgents[Math.floor(Math.random() * closingAgents.length)];
  
  // Create document categories with status
  const borrowerDocumentsStatus = [
    { name: 'Loan Application (1003)', priority: 'High', ...getDocumentStatus() },
    { name: 'Borrower Authorization Form', priority: 'High', ...getDocumentStatus() },
    { name: 'Photo ID / Driver\'s License', priority: 'High', ...getDocumentStatus() },
    { name: 'Personal Financial Statement', priority: 'High', ...getDocumentStatus() },
    { name: 'Credit Report Authorization', priority: 'High', ...getDocumentStatus() },
    { name: 'Personal Tax Returns (2 years)', priority: 'High', ...getDocumentStatus() },
    { name: 'Business Tax Returns (2 years)', priority: 'Medium', ...getDocumentStatus() },
    { name: 'Bank Statements (3 months)', priority: 'High', ...getDocumentStatus() },
    { name: 'Proof of Insurance Coverage', priority: 'High', ...getDocumentStatus() },
    { name: 'Entity Documentation (if applicable)', priority: 'Medium', ...getDocumentStatus() },
    { name: 'Schedule of Real Estate Owned', priority: 'Medium', ...getDocumentStatus() },
    { name: 'Explanation Letters (if applicable)', priority: 'Medium', ...getDocumentStatus() }
  ];
  
  const propertyDocumentsStatus = [
    { name: 'Purchase Agreement/Contract (if purchase)', priority: 'High', ...getDocumentStatus() },
    { name: 'Preliminary Title Report', priority: 'High', ...getDocumentStatus() },
    { name: 'Property Appraisal', priority: 'High', ...getDocumentStatus() },
    { name: 'Environmental Report', priority: 'Medium', ...getDocumentStatus() },
    { name: 'Property Insurance Declaration', priority: 'High', ...getDocumentStatus() },
    { name: 'Flood Certification', priority: 'High', ...getDocumentStatus() },
    { name: 'Leases (for income property)', priority: 'Medium', ...getDocumentStatus() },
    { name: 'Rent Roll (for income property)', priority: 'Medium', ...getDocumentStatus() },
    { name: 'Property Management Agreement', priority: 'Medium', ...getDocumentStatus() },
    { name: 'Property Tax Bill', priority: 'Medium', ...getDocumentStatus() },
    { name: 'Construction Budget (if applicable)', priority: 'Medium', ...getDocumentStatus() },
    { name: 'Property Photos', priority: 'Medium', ...getDocumentStatus() }
  ];
  
  const lenderDocumentsStatus = [
    { name: 'Term Sheet/Commitment Letter', priority: 'High', ...getDocumentStatus() },
    { name: 'Rate Lock Agreement', priority: 'High', ...getDocumentStatus() },
    { name: 'Loan Estimate', priority: 'High', ...getDocumentStatus() },
    { name: 'Fee Disclosure', priority: 'High', ...getDocumentStatus() },
    { name: 'Closing Disclosure', priority: 'High', ...getDocumentStatus() },
    { name: 'Promissory Note', priority: 'High', ...getDocumentStatus() },
    { name: 'Deed of Trust/Mortgage', priority: 'High', ...getDocumentStatus() },
    { name: 'Loan Agreement', priority: 'High', ...getDocumentStatus() },
    { name: 'Assignment of Leases and Rents', priority: 'High', ...getDocumentStatus() },
    { name: 'Personal Guarantee (if applicable)', priority: 'High', ...getDocumentStatus() },
    { name: 'UCC Financing Statement', priority: 'Medium', ...getDocumentStatus() },
    { name: 'Escrow Instructions', priority: 'High', ...getDocumentStatus() },
    { name: 'Final Underwriting Approval', priority: 'High', ...getDocumentStatus() }
  ];
  
  const closingRequirementsStatus = [
    { name: 'Clear Title Commitment', priority: 'High', ...getDocumentStatus() },
    { name: 'Final Inspection/Approval', priority: 'High', ...getDocumentStatus() },
    { name: 'Wire Transfer Instructions', priority: 'High', ...getDocumentStatus() },
    { name: 'Settlement Statement', priority: 'High', ...getDocumentStatus() },
    { name: 'Disbursement Authorization', priority: 'High', ...getDocumentStatus() },
    { name: 'Truth-in-Lending Disclosure', priority: 'High', ...getDocumentStatus() },
    { name: 'Compliance Certification', priority: 'Medium', ...getDocumentStatus() },
    { name: 'Post-Closing Requirements List', priority: 'Medium', ...getDocumentStatus() }
  ];
  
  // Render document status row
  const renderDocumentRow = (doc: { name: string, priority: string, status: string, date: string, notes: string }) => {
    const priorityClass = doc.priority === 'High' ? 'priority-high' : (doc.priority === 'Medium' ? 'priority-medium' : '');
    const statusClass = `status-${doc.status.toLowerCase()}`;
    
    return `
      <tr class="${priorityClass}">
        <td>${doc.name}</td>
        <td>${doc.priority}</td>
        <td class="${statusClass}">${doc.status}</td>
        <td>${doc.date}</td>
        <td>${doc.notes ? `<div class="notes-field">${doc.notes}</div>` : ''}</td>
      </tr>
    `;
  };
  
  // Generate document sections
  const borrowerDocumentsSection = borrowerDocumentsStatus.map(renderDocumentRow).join('');
  const propertyDocumentsSection = propertyDocumentsStatus.map(renderDocumentRow).join('');
  const lenderDocumentsSection = lenderDocumentsStatus.map(renderDocumentRow).join('');
  const closingRequirementsSection = closingRequirementsStatus.map(renderDocumentRow).join('');
  
  // Calculate completion percentages
  const calculateCompletion = (docs: { status: string }[]): number => {
    const completed = docs.filter(doc => doc.status === 'Received' || doc.status === 'Waived' || doc.status === 'N/A').length;
    return Math.round((completed / docs.length) * 100);
  };
  
  const borrowerCompletion = calculateCompletion(borrowerDocumentsStatus);
  const propertyCompletion = calculateCompletion(propertyDocumentsStatus);
  const lenderCompletion = calculateCompletion(lenderDocumentsStatus);
  const closingCompletion = calculateCompletion(closingRequirementsStatus);
  
  const totalDocuments = borrowerDocumentsStatus.length + propertyDocumentsStatus.length + 
                         lenderDocumentsStatus.length + closingRequirementsStatus.length;
  const totalCompleted = borrowerDocumentsStatus.filter(doc => doc.status === 'Received' || doc.status === 'Waived' || doc.status === 'N/A').length +
                         propertyDocumentsStatus.filter(doc => doc.status === 'Received' || doc.status === 'Waived' || doc.status === 'N/A').length +
                         lenderDocumentsStatus.filter(doc => doc.status === 'Received' || doc.status === 'Waived' || doc.status === 'N/A').length +
                         closingRequirementsStatus.filter(doc => doc.status === 'Received' || doc.status === 'Waived' || doc.status === 'N/A').length;
  
  const totalCompletionPercentage = Math.round((totalCompleted / totalDocuments) * 100);
  
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
        <div class="document-title">Loan Closing Checklist</div>
        <div class="document-subtitle">Checklist ID: ${checklistId}</div>
      </div>
      
      <div class="document-section">
        <table class="info-table">
          <tr>
            <th>Date Prepared:</th>
            <td>${currentDate}</td>
          </tr>
          <tr>
            <th>Projected Closing Date:</th>
            <td>${closingDate}</td>
          </tr>
          <tr>
            <th>Borrower:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Loan Number:</th>
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
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
          </tr>
          <tr>
            <th>Loan Officer:</th>
            <td>${loanOfficer.name} (${loanOfficer.phone})</td>
          </tr>
          <tr>
            <th>Closing Coordinator:</th>
            <td>${closingAgent.name} (${closingAgent.phone})</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Closing Status Summary</div>
        <table class="info-table">
          <tr>
            <th>Overall Completion:</th>
            <td>
              <div style="background: #eee; height: 20px; width: 100%; border-radius: 10px; overflow: hidden;">
                <div style="background: #3a5a97; height: 20px; width: ${totalCompletionPercentage}%;"></div>
              </div>
              <div style="text-align: center; margin-top: 5px;">${totalCompletionPercentage}% Complete</div>
            </td>
          </tr>
          <tr>
            <th>Borrower Documentation:</th>
            <td>${borrowerCompletion}% Complete</td>
          </tr>
          <tr>
            <th>Property Documentation:</th>
            <td>${propertyCompletion}% Complete</td>
          </tr>
          <tr>
            <th>Lender Documentation:</th>
            <td>${lenderCompletion}% Complete</td>
          </tr>
          <tr>
            <th>Closing Requirements:</th>
            <td>${closingCompletion}% Complete</td>
          </tr>
        </table>
        
        <div class="notice">
          <p><strong>Checklist Legend:</strong></p>
          <p>
            <span class="status-received">Received</span> - Document has been received and verified<br>
            <span class="status-pending">Pending</span> - Document has been requested but not yet received<br>
            <span class="status-waived">Waived</span> - Requirement has been waived for this transaction<br>
            <span class="status-exception">Exception</span> - Document has issues that need resolution<br>
            <span class="status-na">N/A</span> - Not applicable for this loan type
          </p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Borrower Documentation</div>
        <table class="checklist-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${borrowerDocumentsSection}
          </tbody>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Property Documentation</div>
        <table class="checklist-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${propertyDocumentsSection}
          </tbody>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Lender Documentation</div>
        <table class="checklist-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${lenderDocumentsSection}
          </tbody>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Closing Requirements</div>
        <table class="checklist-table">
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${closingRequirementsSection}
          </tbody>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Additional Notes & Requirements</div>
        <p>The following items require special attention before closing:</p>
        <ul>
          <li>All high priority items must be received and cleared at least 72 hours prior to closing.</li>
          <li>Property insurance must list Harrington Capital Partners as mortgagee/loss payee.</li>
          <li>All title exceptions must be reviewed and approved by legal department.</li>
          <li>Closing funds must be received via wire transfer 24 hours before closing.</li>
          <li>Any changes to loan terms will require updated disclosures and may delay closing.</li>
        </ul>
        
        <div class="notice">
          <p><strong>Important:</strong> This checklist is a dynamic document and will be updated as documents are received and processed. Please refer to the most recent version for current status.</p>
        </div>
      </div>
      
      <div class="signature-section">
        <p>Prepared by:</p>
        <div class="signature-line"></div>
        <p>${closingAgent.name}, ${closingAgent.title}<br>${closingAgent.email}</p>
        
        <div style="margin-top: 30px;">
          <p>Last Updated: ${currentDate}</p>
        </div>
      </div>
      
      <div class="footer">
        <p>This checklist is for internal use by Harrington Capital Partners and authorized representatives only. This document does not constitute a commitment to lend.</p>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Loan Closing Checklist - ${loanData.borrowerName}`, content);
};

/**
 * Promissory Note Template
 * Comprehensive legally-formatted promissory note for real estate loans
 */
export const getPromissoryNoteTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const noteId = `PN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Calculate maturity date
  const maturityDate = getFutureDate(loanData.loanTerm * 30); // Approximating months to days
  
  // Calculate payment amounts
  const monthlyInterestRate = loanData.interestRate / 100 / 12;
  let monthlyPayment = 0;
  
  if (loanData.loanType.includes('interest_only')) {
    // Interest only payment
    monthlyPayment = loanData.loanAmount * monthlyInterestRate;
  } else {
    // Amortizing payment (principal + interest)
    const termInMonths = loanData.loanTerm;
    monthlyPayment = loanData.loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termInMonths)) / 
                     (Math.pow(1 + monthlyInterestRate, termInMonths) - 1);
  }
  
  // Format the payment amount
  const formattedMonthlyPayment = formatCurrency(Math.round(monthlyPayment * 100) / 100);
  
  // Default rate (typically 5% higher than note rate)
  const defaultRate = (loanData.interestRate + 5).toFixed(2);
  
  // Prepayment penalty
  const prepaymentPenaltyMonths = Math.min(loanData.loanTerm, 36); // Up to 36 months but not longer than loan term
  const prepaymentPenaltyPercent = 2; // 2% of outstanding principal
  
  // Late payment fee
  const latePaymentFeePercent = 5;
  const latePaymentFeeMinimum = 100;
  const latePaymentGracePeriod = 10; // 10 days
  
  // Default payment day if not provided in loanData
  const paymentDay = '1st';
  
  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">Promissory Note</div>
        <div class="document-subtitle">Note #: ${noteId}</div>
      </div>
      
      <div class="document-section">
        <table class="info-table">
          <tr>
            <th>Loan Date:</th>
            <td>${formattedDate}</td>
          </tr>
          <tr>
            <th>Borrower:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Borrower Address:</th>
            <td>${loanData.borrowerAddress || 'ADDRESS NOT PROVIDED'}</td>
          </tr>
          <tr>
            <th>Lender:</th>
            <td>Harrington Capital Partners</td>
          </tr>
          <tr>
            <th>Lender Address:</th>
            <td>123 Financial Plaza, Suite 400, Boston, MA 02110</td>
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
            <th>Interest Rate:</th>
            <td>${loanData.interestRate}% per annum</td>
          </tr>
          <tr>
            <th>Maturity Date:</th>
            <td>${maturityDate}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">1. BORROWER'S PROMISE TO PAY</div>
        <p>FOR VALUE RECEIVED, the undersigned ("Borrower") promises to pay to the order of Harrington Capital Partners, or its successors and/or assigns ("Lender"), the principal sum of ${formatCurrency(loanData.loanAmount)} U.S. Dollars, with interest at the rate of ${loanData.interestRate}% per annum on the unpaid principal balance from the Loan Date shown above, until paid in full.</p>
        
        <div class="subsection-title">1.1 Principal and Interest</div>
        <p>Borrower shall make monthly payments of principal and interest in the amount of ${formattedMonthlyPayment}, payable on the ${paymentDay} day of each month, beginning on ${getFutureDate(30)} and continuing until the Maturity Date of ${maturityDate}, at which time all outstanding principal and accrued interest shall be due and payable in full.</p>
        
        <div class="subsection-title">1.2 Application of Payments</div>
        <p>Unless applicable law provides otherwise, all payments received by Lender under this Note shall be applied: first, to any late charges and other fees due under this Note; second, to accrued interest; and third, to principal.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">2. LOAN CHARGES</div>
        <p>If any law that sets maximum loan charges is finally interpreted so that the interest or other loan charges collected or to be collected in connection with this loan exceed the permitted limits, then: (a) any such loan charge shall be reduced by the amount necessary to reduce the charge to the permitted limit; and (b) any sums already collected from Borrower which exceeded permitted limits will be refunded to Borrower. Lender may choose to make this refund by reducing the principal owed under this Note or by making a direct payment to Borrower.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">3. BORROWER'S RIGHT TO PREPAY</div>
        <p>Borrower has the right to make payments of principal at any time before they are due. A payment of principal only is known as a "prepayment." When Borrower makes a prepayment, Borrower will notify Lender in writing that the payment is being made.</p>
        
        <div class="subsection-title">3.1 Prepayment Penalty</div>
        <p>If within the first ${prepaymentPenaltyMonths} months after the Loan Date, Borrower makes any prepayments in any twelve-month period that in total exceed 20% of the original principal amount of this Note, Borrower shall pay a prepayment penalty in an amount equal to ${prepaymentPenaltyPercent}% of the amount of the prepayment which exceeds 20% of the original principal amount of this Note.</p>
        
        <div class="subsection-title">3.2 No Penalty After Initial Period</div>
        <p>After the first ${prepaymentPenaltyMonths} months from the Loan Date, Borrower may make prepayments without paying a prepayment penalty.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">4. LOAN ASSUMPTION</div>
        <p>This Note is not assumable without the prior written consent of Lender, which consent may be withheld in Lender's sole discretion.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">5. LATE CHARGE; DEFAULT INTEREST</div>
        
        <div class="subsection-title">5.1 Late Charge</div>
        <p>If any payment required by this Note is not received by Lender within ${latePaymentGracePeriod} days after such payment is due, a late charge of the greater of ${formatCurrency(latePaymentFeeMinimum)} or ${latePaymentFeePercent}% of the overdue payment shall be due and payable to Lender.</p>
        
        <div class="subsection-title">5.2 Default Interest</div>
        <p>Upon the occurrence of an Event of Default (as defined below), the unpaid principal balance of this Note shall bear interest at the rate of ${defaultRate}% per annum (the "Default Rate") from the date of such default until the default is cured.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">6. EVENTS OF DEFAULT</div>
        <p>Each of the following shall constitute an "Event of Default" under this Note:</p>
        <ol type="a">
          <li>Borrower fails to pay any installment payment or other amount due under this Note when due and such failure continues for a period of ${latePaymentGracePeriod} days after the due date.</li>
          <li>Borrower fails to comply with any covenant, agreement, or condition contained in this Note, the Security Instrument, or any other loan document, and such failure continues for a period of 30 days after notice thereof from Lender.</li>
          <li>Any representation or warranty made by Borrower in connection with this Note or any related loan document proves to be false or misleading in any material respect.</li>
          <li>Borrower becomes insolvent, makes an assignment for the benefit of creditors, files a petition in bankruptcy, or has a receiver, trustee, or custodian appointed for all or a substantial part of Borrower's assets.</li>
          <li>Any proceeding is commenced against Borrower under any bankruptcy or insolvency law and such proceeding is not dismissed within 60 days.</li>
          <li>The Property or any part thereof is taken by condemnation or similar proceeding, or is materially damaged, and Borrower fails to restore the Property in accordance with the Security Instrument.</li>
          <li>The Property or any interest therein is sold, transferred, or encumbered without Lender's prior written consent, if required by the Security Instrument.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">7. LENDER'S RIGHTS UPON DEFAULT</div>
        <p>Upon the occurrence of an Event of Default, Lender may, at its option, declare the entire unpaid principal balance of this Note, together with accrued interest and all other amounts due hereunder, immediately due and payable in full, and exercise any and all remedies provided in the Security Instrument or any other loan document, or available at law or in equity.</p>
        
        <div class="subsection-title">7.1 No Waiver by Lender</div>
        <p>Lender's failure to exercise any right or remedy upon an Event of Default shall not constitute a waiver of the right to exercise such right or remedy upon a subsequent Event of Default.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">8. GIVING OF NOTICES</div>
        <p>All notices required under this Note shall be in writing and shall be deemed given when delivered personally, when deposited with a nationally recognized overnight courier service, or 3 business days after being mailed by U.S. registered or certified mail, return receipt requested, with postage prepaid, addressed to the respective parties at their addresses shown above, or at such other addresses as either party may designate by written notice to the other.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">9. SECURITY</div>
        <p>This Note is secured by a Security Instrument of even date herewith (the "Security Instrument"), encumbering the real property described therein (the "Property"). The Security Instrument is a ${loanData.loanType.includes('construction') ? 'Construction Deed of Trust' : 'Deed of Trust'} on the Property.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">10. MISCELLANEOUS PROVISIONS</div>
        
        <div class="subsection-title">10.1 Joint and Several Liability</div>
        <p>If more than one person signs this Note, each person is fully and personally obligated to keep all of the promises made in this Note, including the promise to pay the full amount owed. Any person who is a guarantor, surety, or endorser of this Note is also obligated to do these things. Any person who takes over these obligations, including the obligations of a guarantor, surety, or endorser of this Note, is also obligated to keep all of the promises made in this Note. Lender may enforce its rights under this Note against each person individually or against all signatories together.</p>
        
        <div class="subsection-title">10.2 Waivers</div>
        <p>Borrower and any other person who has obligations under this Note waive the rights of presentment and notice of dishonor. "Presentment" means the right to require Lender to demand payment of amounts due. "Notice of dishonor" means the right to require Lender to give notice to other persons that amounts due have not been paid.</p>
        
        <div class="subsection-title">10.3 Governing Law</div>
        <p>This Note shall be governed by and construed in accordance with the laws of the state where the Property is located, without regard to its conflicts of law principles.</p>
      </div>
      
      <div class="signature-section">
        <p>IN WITNESS WHEREOF, Borrower has executed this Promissory Note as of the date first written above.</p>
        
        <div style="margin-top: 60px;">
          <div class="signature-line"></div>
          <p>${loanData.borrowerName} - Borrower</p>
        </div>
        
        <div style="margin-top: 40px;">
          <div class="signature-line"></div>
          <p>Co-Borrower (if applicable)</p>
        </div>
      </div>
      
      <div style="margin-top: 40px; text-align: center; font-size: 12px;">
        <p>Page 1 of 1</p>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Promissory Note - ${loanData.borrowerName}`, content);
};

/**
 * Deed of Trust Template
 * Comprehensive legally-formatted deed of trust/mortgage for real estate loans
 */
export const getDeedOfTrustTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const documentId = `DOT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Calculate maturity date
  const maturityDate = getFutureDate(loanData.loanTerm * 30); // Approximating months to days
  
  // Generate trustee information
  const trustees = [
    { name: 'Commonwealth Title Company', address: '100 Legal Drive, Suite 200, Boston, MA 02110' },
    { name: 'Secure Title Services, Inc.', address: '888 Trust Avenue, Boston, MA 02114' },
    { name: 'National Fiduciary Trust', address: '555 Security Boulevard, Boston, MA 02116' }
  ];
  
  const trustee = trustees[Math.floor(Math.random() * trustees.length)];
  
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
  
  // Legal description (placeholder)
  const legalDescription = `LOT ${Math.floor(Math.random() * 100) + 1} OF BLOCK ${Math.floor(Math.random() * 50) + 1} OF ${loanData.propertyAddress.split(',')[0].toUpperCase()} SUBDIVISION, ACCORDING TO THE PLAT THEREOF RECORDED IN PLAT BOOK ${Math.floor(Math.random() * 100) + 1}, PAGE ${Math.floor(Math.random() * 200) + 1}, OF THE PUBLIC RECORDS OF ${loanData.propertyAddress.split(',').pop()?.trim().toUpperCase() || 'THE COUNTY'}, TOGETHER WITH ALL IMPROVEMENTS NOW OR HEREAFTER ERECTED ON THE PROPERTY, AND ALL EASEMENTS, APPURTENANCES, AND FIXTURES NOW OR HEREAFTER A PART OF THE PROPERTY.`;
  
  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">${loanData.loanType.includes('construction') ? 'Construction' : ''} Deed of Trust</div>
        <div class="document-subtitle">Document #: ${documentId}</div>
      </div>
      
      <div class="document-section">
        <p>THIS DEED OF TRUST ("Security Instrument") is made on ${formattedDate}. The grantor is ${loanData.borrowerName} ("Borrower"). The trustee is ${trustee.name} ("Trustee"), with an address of ${trustee.address}. The beneficiary is Harrington Capital Partners ("Lender"), with an address of 123 Financial Plaza, Suite 400, Boston, MA 02110, which is organized and existing under the laws of Massachusetts.</p>
        
        <p>Borrower owes Lender the principal sum of ${formatCurrency(loanData.loanAmount)} U.S. Dollars. This debt is evidenced by Borrower's Promissory Note dated ${formattedDate} ("Note"), which provides for monthly payments, with the full debt, if not paid earlier, due and payable on ${maturityDate} ("Maturity Date").</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">TRANSFER OF RIGHTS IN THE PROPERTY</div>
        <p>This Security Instrument secures to Lender: (i) the repayment of the debt evidenced by the Note, with interest, and all renewals, extensions, and modifications of the Note; (ii) the payment of all other sums, with interest, advanced under this Security Instrument to protect the security of this Security Instrument; and (iii) the performance of Borrower's covenants and agreements under this Security Instrument and the Note.</p>
        
        <p>For this purpose, Borrower irrevocably grants and conveys to Trustee, in trust, with power of sale, the following described property located in ${loanData.propertyAddress.split(',').pop()?.trim() || 'the County'}:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; margin: 10px 0;">
          <p><strong>Property Address:</strong> ${loanData.propertyAddress}</p>
          <p><strong>Property Type:</strong> ${getPropertyTypeDescription(loanData.propertyType)}</p>
          <p><strong>Legal Description:</strong> ${legalDescription}</p>
        </div>
        
        <p>TOGETHER WITH all the improvements now or hereafter erected on the property, and all easements, appurtenances, and fixtures now or hereafter a part of the property. All replacements and additions shall also be covered by this Security Instrument. All of the foregoing is referred to in this Security Instrument as the "Property."</p>
        
        <p>BORROWER COVENANTS that Borrower is lawfully seized of the estate hereby conveyed and has the right to grant and convey the Property and that the Property is unencumbered, except for encumbrances of record. Borrower warrants and will defend generally the title to the Property against all claims and demands, subject to any encumbrances of record.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">COVENANTS</div>
        <p>Borrower and Lender covenant and agree as follows:</p>
        
        <div class="subsection-title">1. Payment of Principal and Interest</div>
        <p>Borrower shall promptly pay when due the principal of and interest on the debt evidenced by the Note and any late charges due under the Note.</p>
        
        <div class="subsection-title">2. Funds for Taxes and Insurance</div>
        <p>Subject to applicable law or to a written waiver by Lender, Borrower shall pay to Lender on the day monthly payments are due under the Note, until the Note is paid in full, a sum ("Funds") for: (a) yearly taxes and assessments which may attain priority over this Security Instrument as a lien on the Property; (b) yearly leasehold payments or ground rents on the Property, if any; (c) yearly hazard or property insurance premiums; (d) yearly flood insurance premiums, if any; and (e) any sums payable by Borrower to Lender in accordance with this Security Instrument.</p>
        
        <div class="subsection-title">3. Application of Payments</div>
        <p>Unless applicable law provides otherwise, all payments received by Lender under the Note and Sections 1 and 2 shall be applied: first, to any late charges and other fees due under the Note; second, to interest due; third, to principal due; and fourth, to escrow items under Section 2.</p>
        
        <div class="subsection-title">4. Charges; Liens</div>
        <p>Borrower shall pay all taxes, assessments, charges, fines, and impositions attributable to the Property which can attain priority over this Security Instrument, leasehold payments or ground rents, if any, and Community Association Dues, Fees, and Assessments, if any.</p>
        
        <div class="subsection-title">5. Hazard or Property Insurance</div>
        <p>Borrower shall keep the improvements now existing or hereafter erected on the Property insured against loss by fire, hazards included within the term "extended coverage," and any other hazards including, but not limited to, earthquakes and floods, for which Lender requires insurance. This insurance shall be maintained in the amounts (including deductible levels) and for the periods that Lender requires.</p>
        
        <div class="subsection-title">6. Preservation, Maintenance, and Protection of the Property</div>
        <p>Borrower shall not destroy, damage, or impair the Property, allow the Property to deteriorate, or commit waste on the Property. Borrower shall maintain the Property in good repair and shall promptly repair the Property if damaged to avoid further deterioration or damage.</p>
        
        <div class="subsection-title">7. Inspection</div>
        <p>Lender or its agent may make reasonable entries upon and inspections of the Property. If it has reasonable cause, Lender may inspect the interior of the improvements on the Property. Lender shall give Borrower notice at the time of or prior to such an interior inspection specifying such reasonable cause.</p>
        
        <div class="subsection-title">8. Condemnation</div>
        <p>Any award of damages in connection with any condemnation or other taking of any part of the Property, or for conveyance in lieu of condemnation, are hereby assigned and shall be paid to Lender, subject to the terms of any mortgage, deed of trust, or other security agreement with a lien which has priority over this Security Instrument.</p>
        
        <div class="subsection-title">9. Borrower Not Released; Forbearance Not a Waiver</div>
        <p>Extension of the time for payment or modification of amortization of the sums secured by this Security Instrument granted by Lender to Borrower shall not operate to release the liability of Borrower. Any forbearance by Lender in exercising any right or remedy including, without limitation, Lender's acceptance of payments from third persons, entities, or successors in interest of Borrower or in amounts less than the amount then due, shall not be a waiver of or preclude the exercise of any right or remedy.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">NON-UNIFORM COVENANTS</div>
        <p>Borrower and Lender further covenant and agree as follows:</p>
        
        <div class="subsection-title">10. Acceleration; Remedies</div>
        <p>Lender shall give notice to Borrower prior to acceleration following Borrower's breach of any covenant or agreement in this Security Instrument. The notice shall specify: (a) the default; (b) the action required to cure the default; (c) a date, not less than 30 days from the date the notice is given to Borrower, by which the default must be cured; and (d) that failure to cure the default on or before the date specified in the notice may result in acceleration of the sums secured by this Security Instrument and sale of the Property. The notice shall further inform Borrower of the right to reinstate after acceleration and the right to bring a court action to assert the non-existence of a default or any other defense of Borrower to acceleration and sale.</p>
        
        <p>If the default is not cured on or before the date specified in the notice, Lender at its option may require immediate payment in full of all sums secured by this Security Instrument without further demand and may invoke the power of sale and any other remedies permitted by applicable law. Lender shall be entitled to collect all expenses incurred in pursuing the remedies provided in this Section 10, including, but not limited to, reasonable attorneys' fees and costs of title evidence.</p>
        
        <p>If Lender invokes the power of sale, Lender shall give to Borrower, the owner of the Property, and all other persons, notice of sale as required by applicable law. Trustee shall give public notice of sale by advertising, in accordance with applicable law, once a week for four consecutive weeks in a newspaper having general circulation in the county or city in which any part of the Property is located, and by such additional or any different form of advertisement the Trustee deems advisable. Trustee may sell the Property on the eighth day after the first advertisement or any day thereafter, but not later than 30 days following the last advertisement.</p>
        
        <div class="subsection-title">11. Substitute Trustee</div>
        <p>Lender, at its option, may from time to time remove Trustee and appoint a successor trustee to any Trustee appointed hereunder by an instrument recorded in the county in which this Security Instrument is recorded. Without conveyance of the Property, the successor trustee shall succeed to all the title, power, and duties conferred upon Trustee herein and by applicable law.</p>
        
        <div class="subsection-title">12. Reinstatement</div>
        <p>If Borrower meets certain conditions, Borrower shall have the right to have enforcement of this Security Instrument discontinued at any time prior to the earliest of: (a) five days before sale of the Property pursuant to any power of sale contained in this Security Instrument; (b) such other period as applicable law might specify for the termination of Borrower's right to reinstate; or (c) entry of a judgment enforcing this Security Instrument. Those conditions are that Borrower: (a) pays Lender all sums which then would be due under this Security Instrument and the Note as if no acceleration had occurred; (b) cures any default of any other covenants or agreements; (c) pays all expenses incurred in enforcing this Security Instrument, including, but not limited to, reasonable attorneys' fees, property inspection and valuation fees, and other fees incurred for the purpose of protecting Lender's interest in the Property and rights under this Security Instrument; and (d) takes such action as Lender may reasonably require to assure that Lender's interest in the Property and rights under this Security Instrument, and Borrower's obligation to pay the sums secured by this Security Instrument, shall continue unchanged.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">ADDITIONAL PROVISIONS</div>
        
        <div class="subsection-title">13. Assignment of Rents</div>
        <p>Borrower absolutely and unconditionally assigns and transfers to Lender all the rents and revenues of the Property, regardless of to whom the rents and revenues of the Property are payable. Borrower authorizes Lender or Lender's agents to collect the rents and revenues and hereby directs each tenant of the Property to pay the rents to Lender or Lender's agents. However, prior to Lender's notice to Borrower of Borrower's breach of any covenant or agreement in this Security Instrument, Borrower shall collect and receive all rents and revenues of the Property as trustee for the benefit of Lender and Borrower.</p>
        
        <div class="subsection-title">14. Future Advances</div>
        <p>Lender, at Lender's option, may make Future Advances to Borrower. Such Future Advances, with interest thereon, shall be secured by this Security Instrument when evidenced by promissory notes stating that said notes are secured hereby. At no time shall the principal amount of the indebtedness secured by this Security Instrument, not including sums advanced in accordance herewith to protect the security of this Security Instrument, exceed the original amount of the Note plus the additional sum of ${formatCurrency(loanData.loanAmount * 0.2)} U.S. Dollars.</p>
        
        <div class="subsection-title">15. Governing Law; Severability</div>
        <p>This Security Instrument shall be governed by federal law and the law of the jurisdiction in which the Property is located. All rights and obligations contained in this Security Instrument are subject to any requirements and limitations of applicable law. In the event that any provision or clause of this Security Instrument or the Note conflicts with applicable law, such conflict shall not affect other provisions of this Security Instrument or the Note which can be given effect without the conflicting provision.</p>
      </div>
      
      <div class="signature-section">
        <p>BY SIGNING BELOW, Borrower accepts and agrees to the terms and covenants contained in this Security Instrument and in any Rider executed by Borrower and recorded with it.</p>
        
        <div style="margin-top: 60px;">
          <div class="signature-line"></div>
          <p>${loanData.borrowerName} - Borrower</p>
        </div>
        
        <div style="margin-top: 40px;">
          <div class="signature-line"></div>
          <p>Co-Borrower (if applicable)</p>
        </div>
        
        <div style="margin-top: 40px;">
          <p>STATE OF _________________ )</p>
          <p>COUNTY OF _______________ ) ss.</p>
          <p>On this day personally appeared before me ${loanData.borrowerName}, to me known to be the individual described in and who executed the within and foregoing instrument, and acknowledged that he/she signed the same as his/her free and voluntary act and deed, for the uses and purposes therein mentioned.</p>
          <p>Given under my hand and official seal this _______ day of _______________, ${new Date().getFullYear()}.</p>
          
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <p>Notary Public in and for the State of _________________</p>
            <p>My commission expires: _________________</p>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 40px; text-align: center; font-size: 12px;">
        <p>Page 1 of 1</p>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Deed of Trust - ${loanData.borrowerName}`, content);
};

/**
 * Loan Agreement Template
 * Comprehensive loan agreement that details all loan terms and conditions
 */
export const getLoanAgreementTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const agreementId = `LA-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Calculate maturity date
  const maturityDate = getFutureDate(loanData.loanTerm * 30); // Approximating months to days
  
  // Generate reporting requirements based on loan size
  const getReportingFrequency = (): string => {
    if (loanData.loanAmount >= 5000000) {
      return 'Monthly';
    } else if (loanData.loanAmount >= 1000000) {
      return 'Quarterly';
    } else {
      return 'Semi-Annually';
    }
  };
  
  // Determine covenant requirements based on loan type and size
  const getDSCRCovenant = (): string => {
    if (loanData.loanType.includes('bridge') || loanData.loanType.includes('construction')) {
      return 'N/A during initial loan term; 1.25x required upon stabilization';
    } else if (loanData.loanType.includes('rental')) {
      return '1.20x';
    } else {
      return '1.15x';
    }
  };
  
  const getLTVCovenant = (): string => {
    return `${loanData.ltv}%`;
  };
  
  // Format the reporting requirements
  const reportingFrequency = getReportingFrequency();
  const dscrCovenant = getDSCRCovenant();
  const ltvCovenant = getLTVCovenant();
  
  // Determine if reserves are required
  const isReservesRequired = loanData.loanAmount > 1000000 || loanData.loanType.includes('rental');
  const reserveAmount = isReservesRequired ? 
    Math.round((loanData.loanAmount * 0.03) / 1000) * 1000 : 0; // 3% of loan amount rounded to nearest thousand
  
  // Generate loan officer information
  const loanOfficers = [
    { name: 'Jennifer Martinez', title: 'Senior Loan Officer', phone: '(555) 123-4567', email: 'jmartinez@harringtoncapital.com' },
    { name: 'Michael Thompson', title: 'VP of Lending', phone: '(555) 987-6543', email: 'mthompson@harringtoncapital.com' },
    { name: 'Sarah Johnson', title: 'Mortgage Loan Officer', phone: '(555) 234-5678', email: 'sjohnson@harringtoncapital.com' }
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
        <div class="document-title">Loan Agreement</div>
        <div class="document-subtitle">Agreement ID: ${agreementId}</div>
      </div>
      
      <div class="document-section">
        <p>THIS LOAN AGREEMENT (the "Agreement") is made and entered into on ${formattedDate}, by and between <strong>Harrington Capital Partners</strong>, a Massachusetts limited liability company with its principal place of business at 123 Financial Plaza, Suite 400, Boston, MA 02110 (the "Lender"), and <strong>${loanData.borrowerName}</strong>, with an address of ${loanData.borrowerAddress || '[ADDRESS TO BE PROVIDED]'} (the "Borrower").</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">1. LOAN INFORMATION</div>
        <table class="info-table">
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Loan Type:</th>
            <td>${loanData.loanType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
          </tr>
          <tr>
            <th>Interest Rate:</th>
            <td>${loanData.interestRate}% per annum</td>
          </tr>
          <tr>
            <th>Loan Term:</th>
            <td>${loanData.loanTerm} months</td>
          </tr>
          <tr>
            <th>Maturity Date:</th>
            <td>${maturityDate}</td>
          </tr>
          <tr>
            <th>Purpose of Loan:</th>
            <td>${loanData.loanPurpose || 'Real Estate Investment Financing'}</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Loan-to-Value Ratio:</th>
            <td>${loanData.ltv}%</td>
          </tr>
          <tr>
            <th>Origination Fee:</th>
            <td>${loanData.originationFee}% of Loan Amount (${formatCurrency(loanData.loanAmount * loanData.originationFee / 100)})</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">2. DEFINITIONS</div>
        <p>For the purposes of this Agreement, the following terms shall have the following meanings:</p>
        <ol type="a" class="terms-list">
          <li>"Borrower" means the borrower identified above and any co-signers, guarantors, successors, and assigns.</li>
          <li>"Business Day" means any day other than Saturday, Sunday, or a day on which commercial banks in Boston, Massachusetts are authorized or required to close.</li>
          <li>"Closing Date" means the date upon which the Loan is funded to Borrower.</li>
          <li>"Collateral" means the Property and all other assets pledged as security for the Loan.</li>
          <li>"Default" means any event which, with notice or the passage of time, would constitute an Event of Default.</li>
          <li>"Event of Default" has the meaning set forth in Section 8 of this Agreement.</li>
          <li>"Loan Documents" means this Agreement, the Note, the Security Instrument, and all other documents and instruments evidencing, securing, or relating to the Loan.</li>
          <li>"Note" means the Promissory Note of even date herewith executed by Borrower in favor of Lender.</li>
          <li>"Property" means the real property located at ${loanData.propertyAddress}, together with all improvements, fixtures, and appurtenances.</li>
          <li>"Security Instrument" means the Deed of Trust or Mortgage of even date herewith encumbering the Property.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">3. LOAN AND TERMS OF PAYMENT</div>
        
        <div class="subsection-title">3.1 Promise to Pay</div>
        <p>Borrower promises to pay Lender the principal amount of ${formatCurrency(loanData.loanAmount)}, or so much thereof as may be outstanding, together with interest on the unpaid principal balance at the rate set forth above.</p>
        
        <div class="subsection-title">3.2 Payment Schedule</div>
        <p>Borrower shall make payments in accordance with the terms of the Note. The Note provides for monthly payments of principal and interest based on a ${loanData.loanTerm}-month term. All outstanding principal and accrued interest shall be due and payable in full on the Maturity Date.</p>
        
        <div class="subsection-title">3.3 Prepayment</div>
        <p>Borrower may prepay the Loan in whole or in part at any time, subject to any prepayment premium or penalty set forth in the Note.</p>
        
        <div class="subsection-title">3.4 Fees and Expenses</div>
        <p>Borrower shall pay all fees and expenses associated with the Loan, including but not limited to:</p>
        <ol type="a" class="terms-list">
          <li>Origination Fee: ${loanData.originationFee}% of the Loan Amount, payable at closing.</li>
          <li>Processing and Underwriting Fee: ${formatCurrency(Math.min(5000, loanData.loanAmount * 0.005))}, payable at closing.</li>
          <li>Document Preparation Fee: ${formatCurrency(895)}, payable at closing.</li>
          <li>Third-Party Fees: All third-party fees, including but not limited to appraisal fees, environmental assessment fees, title insurance premiums, recording fees, and attorney's fees.</li>
          <li>Late Payment Fee: As specified in the Note.</li>
          <li>Default Interest: As specified in the Note.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">4. COLLATERAL</div>
        <p>As security for the Loan, Borrower grants to Lender a security interest in the following Collateral:</p>
        <ol type="a" class="terms-list">
          <li>A first-position lien on the Property, as evidenced by the Security Instrument.</li>
          <li>An assignment of all leases and rents related to the Property.</li>
          <li>A security interest in all fixtures and personal property used in connection with the Property.</li>
          ${loanData.loanType.includes('rental') ? '<li>A pledge of all reserve and escrow accounts established in connection with the Loan.</li>' : ''}
          ${loanData.loanType.includes('construction') ? '<li>A collateral assignment of all construction contracts, architect\'s agreements, and related documents.</li>' : ''}
        </ol>
        
        <div class="notice">
          <p><strong>Notice:</strong> The Collateral secures all obligations of Borrower under this Agreement and all other Loan Documents.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">5. CONDITIONS PRECEDENT TO FUNDING</div>
        <p>The obligation of Lender to make the Loan is subject to the satisfaction of all of the following conditions precedent:</p>
        <ol type="a" class="terms-list">
          <li>Lender's receipt and approval of the appraisal of the Property.</li>
          <li>Lender's receipt and approval of a title insurance commitment and related documents.</li>
          <li>Lender's receipt and approval of all organizational documents of Borrower (if Borrower is an entity).</li>
          <li>Lender's receipt and approval of evidence of all required insurance coverage.</li>
          <li>Lender's receipt and approval of the survey of the Property (if required by Lender).</li>
          <li>Lender's receipt and approval of all environmental reports and assessments required by Lender.</li>
          <li>Execution and delivery of all Loan Documents by Borrower and any other required parties.</li>
          <li>Payment of all fees and expenses required to be paid by Borrower at closing.</li>
          <li>No material adverse change in Borrower's financial condition or the condition of the Property.</li>
          <li>No Default or Event of Default exists.</li>
          ${loanData.loanType.includes('purchase') ? '<li>Evidence of the purchase contract for the Property and verification of Borrower\'s down payment funds.</li>' : ''}
          ${loanData.loanType.includes('construction') ? '<li>Lender\'s receipt and approval of the construction budget, plans, specifications, and construction schedule.</li>' : ''}
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">6. REPRESENTATIONS AND WARRANTIES</div>
        <p>Borrower represents and warrants to Lender as follows:</p>
        <ol type="a" class="terms-list">
          <li>Borrower has full power and authority to enter into this Agreement and the other Loan Documents and to incur the obligations provided for herein and therein.</li>
          <li>The execution, delivery, and performance of this Agreement and the other Loan Documents do not violate any law, any order of any court or governmental agency, or any agreement to which Borrower is a party or by which Borrower or any of its property is bound.</li>
          <li>All financial statements and other information provided to Lender are true, complete, and correct in all material respects and fairly represent Borrower's financial condition as of the date thereof.</li>
          <li>Borrower has good and marketable title to the Property, subject only to encumbrances approved by Lender.</li>
          <li>The Property complies with all applicable zoning, building, and environmental laws and regulations.</li>
          <li>There are no actions, suits, or proceedings pending or, to the knowledge of Borrower, threatened against or affecting Borrower or the Property that could have a material adverse effect on Borrower's ability to perform its obligations under the Loan Documents.</li>
          <li>Borrower is not in default under any agreement with Lender.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">7. COVENANTS</div>
        
        <div class="subsection-title">7.1 Affirmative Covenants</div>
        <p>Borrower covenants and agrees that, so long as any amount remains outstanding under the Loan, Borrower shall:</p>
        <ol type="a" class="terms-list">
          <li>Pay when due all amounts owing to Lender under the Loan Documents.</li>
          <li>Maintain the Property in good condition and repair.</li>
          <li>Maintain all required insurance coverage, including hazard insurance, liability insurance, and such other insurance as Lender may require.</li>
          <li>Pay when due all taxes, assessments, and other charges relating to the Property.</li>
          <li>Comply with all applicable laws, regulations, and ordinances affecting the Property.</li>
          <li>Permit Lender and its agents to inspect the Property at reasonable times upon reasonable notice.</li>
          <li>Provide Lender with financial statements and reports as follows:
            <ul>
              <li>Personal financial statements: Annually within 90 days after the end of each calendar year.</li>
              <li>Property operating statements: ${reportingFrequency} within 30 days after the end of each reporting period.</li>
              <li>Rent rolls (for income-producing property): ${reportingFrequency} within 30 days after the end of each reporting period.</li>
              <li>Tax returns: Annually within 30 days after filing.</li>
            </ul>
          </li>
          <li>Maintain a debt service coverage ratio of at least ${dscrCovenant} (calculated as net operating income divided by debt service).</li>
          <li>Maintain a loan-to-value ratio not exceeding ${ltvCovenant}.</li>
          ${isReservesRequired ? `<li>Maintain reserves in the amount of at least ${formatCurrency(reserveAmount)} for repairs, replacements, and other property-related expenses.</li>` : ''}
        </ol>
        
        <div class="subsection-title">7.2 Negative Covenants</div>
        <p>Borrower covenants and agrees that, so long as any amount remains outstanding under the Loan, Borrower shall not, without Lender's prior written consent:</p>
        <ol type="a" class="terms-list">
          <li>Sell, transfer, or convey the Property or any interest therein.</li>
          <li>Create, incur, or suffer to exist any additional lien or encumbrance on the Property.</li>
          <li>Make any material alterations to the Property that would decrease its value.</li>
          <li>Change the use of the Property from its current use.</li>
          <li>Enter into any lease of all or any portion of the Property that does not comply with market terms or that would interfere with Lender's rights.</li>
          <li>Amend, modify, or terminate any material lease without Lender's consent.</li>
          ${loanData.loanType.includes('construction') ? '<li>Make any material changes to the approved construction plans, specifications, or budget.</li>' : ''}
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">8. EVENTS OF DEFAULT</div>
        <p>Each of the following shall constitute an Event of Default under this Agreement:</p>
        <ol type="a" class="terms-list">
          <li>Borrower fails to make any payment when due under any of the Loan Documents and such failure continues for more than 10 days after the due date.</li>
          <li>Borrower fails to perform or observe any covenant or agreement contained in any of the Loan Documents (other than a payment obligation) and such failure continues for 30 days after written notice from Lender.</li>
          <li>Any representation or warranty made by Borrower in any of the Loan Documents proves to have been false or misleading in any material respect when made.</li>
          <li>Borrower becomes insolvent, makes an assignment for the benefit of creditors, or files a petition in bankruptcy.</li>
          <li>A receiver, trustee, or custodian is appointed for all or any substantial part of Borrower's assets.</li>
          <li>Any proceeding is commenced against Borrower under any bankruptcy or insolvency law and such proceeding is not dismissed within 60 days.</li>
          <li>The Property or any part thereof is taken by condemnation or similar proceeding, or is materially damaged, and such taking or damage materially impairs the value of the Property as security for the Loan.</li>
          <li>The Property or any interest therein is sold, transferred, or encumbered without Lender's prior written consent.</li>
          <li>Borrower defaults under any other agreement with Lender.</li>
          <li>A default occurs under any other loan or security agreement affecting the Property.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">9. REMEDIES</div>
        <p>Upon the occurrence of an Event of Default, Lender may exercise any one or more of the following remedies:</p>
        <ol type="a" class="terms-list">
          <li>Declare the entire unpaid principal balance of the Loan, together with accrued interest and all other amounts due under the Loan Documents, immediately due and payable in full.</li>
          <li>Exercise all rights and remedies available under the Security Instrument, including foreclosure.</li>
          <li>Exercise all rights and remedies available under the Uniform Commercial Code or other applicable law.</li>
          <li>Apply for the appointment of a receiver for the Property.</li>
          <li>Take possession of the Property and complete construction (in the case of a construction loan).</li>
          <li>Exercise the assignment of rents and leases and collect all rents and profits from the Property.</li>
          <li>Pursue any other remedy available at law or in equity.</li>
        </ol>
        <p>Lender's rights and remedies under this Agreement and the other Loan Documents are cumulative and may be exercised singularly or concurrently.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">10. MISCELLANEOUS</div>
        
        <div class="subsection-title">10.1 Notices</div>
        <p>All notices required under this Agreement shall be in writing and shall be deemed given when delivered personally, when deposited with a nationally recognized overnight courier service, or 3 business days after being mailed by U.S. registered or certified mail, return receipt requested, with postage prepaid, addressed to the respective parties at their addresses shown above, or at such other addresses as either party may designate by written notice to the other.</p>
        
        <div class="subsection-title">10.2 Amendments</div>
        <p>This Agreement may not be amended or modified except by a written instrument executed by Borrower and Lender.</p>
        
        <div class="subsection-title">10.3 Governing Law</div>
        <p>This Agreement shall be governed by and construed in accordance with the laws of the state where the Property is located, without regard to its conflicts of law principles.</p>
        
        <div class="subsection-title">10.4 Severability</div>
        <p>If any provision of this Agreement is held to be invalid or unenforceable, such provision shall be deemed modified to the extent necessary to make it valid and enforceable, or if such modification is not practicable, such provision shall be deemed deleted from this Agreement, and the other provisions of this Agreement shall remain in full force and effect.</p>
        
        <div class="subsection-title">10.5 Assignment</div>
        <p>Borrower may not assign this Agreement or any rights under it without Lender's prior written consent. Lender may assign this Agreement and the other Loan Documents without Borrower's consent.</p>
        
        <div class="subsection-title">10.6 Counterparts</div>
        <p>This Agreement may be executed in any number of counterparts, each of which shall be deemed an original, but all of which together shall constitute one and the same instrument.</p>
        
        <div class="subsection-title">10.7 Time of Essence</div>
        <p>Time is of the essence with respect to all provisions of this Agreement.</p>
      </div>
      
      <div class="signature-section">
        <p>IN WITNESS WHEREOF, the parties have executed this Loan Agreement as of the date first written above.</p>
        
        <div style="margin-top: 60px; display: flex; justify-content: space-between;">
          <div style="width: 45%;">
            <p><strong>BORROWER:</strong></p>
            <div class="signature-line"></div>
            <p>${loanData.borrowerName}</p>
          </div>
          
          <div style="width: 45%;">
            <p><strong>LENDER:</strong></p>
            <p>Harrington Capital Partners</p>
            <div class="signature-line"></div>
            <p>By: ${loanOfficer.name}</p>
            <p>Title: ${loanOfficer.title}</p>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>Loan Agreement - Page 1 of 1 | Loan #: ${loanData.id} | Property: ${loanData.propertyAddress}</p>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Loan Agreement - ${loanData.borrowerName}`, content);
};
