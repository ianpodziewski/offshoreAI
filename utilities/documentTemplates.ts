// utilities/documentTemplates.ts
import { LoanData } from './loanGenerator';

// Generate HTML for a promissory note
export function generatePromissoryNote(loan: LoanData): string {
  return `
    <div class="document promissory-note">
      <div class="document-header">
        <h1>PROMISSORY NOTE</h1>
        <div class="document-date">${new Date(loan.dateCreated).toLocaleDateString()}</div>
      </div>
      
      <div class="document-body">
        <p>
          FOR VALUE RECEIVED, the undersigned, <strong>${loan.borrowerName}</strong> ("Borrower"), 
          hereby promises to pay to the order of LENDER FINANCIAL, the principal sum of 
          <strong>$${loan.loanAmount.toLocaleString()}</strong> with interest on the unpaid principal balance 
          from the date of this Note, until paid, at an interest rate of <strong>${loan.interestRate}%</strong> per annum.
        </p>
        
        <p>
          Property Address: ${loan.propertyAddress}<br>
          Loan Type: ${loan.loanType.toUpperCase()}<br>
          Loan Term: ${loan.loanTerm / 12} years
        </p>
      </div>
      
      <div class="document-signature">
        <div class="signature-line">____________________________</div>
        <div class="signature-name">${loan.borrowerName}, Borrower</div>
      </div>
    </div>
  `;
}

// Generate HTML for a deed of trust
export function generateDeedOfTrust(loan: LoanData): string {
  return `
    <div class="document deed-of-trust">
      <div class="document-header">
        <h1>DEED OF TRUST</h1>
        <div class="document-date">${new Date(loan.dateCreated).toLocaleDateString()}</div>
      </div>
      
      <div class="document-body">
        <p>
          THIS DEED OF TRUST is made this ${new Date(loan.dateCreated).getDate()} day of 
          ${new Date(loan.dateCreated).toLocaleString('en-us', { month: 'long' })}, 
          ${new Date(loan.dateCreated).getFullYear()}, between 
          <strong>${loan.borrowerName}</strong> ("Borrower"), and LENDER FINANCIAL ("Lender").
        </p>
        
        <p>
          THE PROPERTY. Borrower irrevocably grants and conveys to Trustee, in trust, with power of sale, 
          the following described property located in the County of ${loan.propertyAddress.split(',')[1]?.trim().split(' ')[0] || 'County'}, 
          State of ${loan.propertyAddress.split(',')[2]?.trim().split(' ')[0] || 'State'}:
        </p>
        
        <div class="property-description">
          ${loan.propertyAddress}<br>
          Property Type: ${loan.propertyType.replace('_', ' ')}
        </div>
      </div>
    </div>
  `;
}

// Generate more document templates for other types...
export function generateClosingDisclosure(loan: LoanData): string {
  return `
    <div class="document closing-disclosure">
      <div class="document-header">
        <h1>CLOSING DISCLOSURE</h1>
        <div class="document-date">${new Date(loan.dateCreated).toLocaleDateString()}</div>
      </div>
      
      <table class="disclosure-table">
        <tr>
          <th colspan="2">Loan Information</th>
        </tr>
        <tr>
          <td>Loan Term</td>
          <td>${loan.loanTerm / 12} years</td>
        </tr>
        <tr>
          <td>Loan Purpose</td>
          <td>Purchase</td>
        </tr>
        <tr>
          <td>Loan Product</td>
          <td>${loan.loanType.toUpperCase()}</td>
        </tr>
        <tr>
          <td>Loan Type</td>
          <td>Fixed Rate</td>
        </tr>
        <tr>
          <th colspan="2">Loan Terms</th>
        </tr>
        <tr>
          <td>Loan Amount</td>
          <td>$${loan.loanAmount.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Interest Rate</td>
          <td>${loan.interestRate}%</td>
        </tr>
        <tr>
          <td>Monthly Principal & Interest</td>
          <td>$${calculateMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanTerm).toLocaleString()}</td>
        </tr>
      </table>
    </div>
  `;
}

// Helper function to calculate monthly payment
function calculateMonthlyPayment(principal: number, rate: number, term: number): number {
  const monthlyRate = rate / 100 / 12;
  const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, term) / (Math.pow(1 + monthlyRate, term) - 1);
  return Math.round(monthlyPayment);
}