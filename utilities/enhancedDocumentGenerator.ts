// utilities/enhancedDocumentGenerator.ts
import { LoanData } from './loanGenerator';

// Format a currency value
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

// Format a date value
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

// Calculate monthly payment
const calculateMonthlyPayment = (principal: number, rate: number, term: number): number => {
  const monthlyRate = rate / 100 / 12;
  const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, term) / (Math.pow(1 + monthlyRate, term) - 1);
  return Math.round(monthlyPayment);
};

// Generate a more realistic Promissory Note
export function generatePromissoryNote(loan: LoanData): string {
  const monthlyPayment = calculateMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanTerm);
  
  return `
    <div class="document legal-document promissory-note">
      <style>
        .document {
          font-family: 'Times New Roman', Times, serif;
          line-height: 1.5;
          color: #333;
          max-width: 100%;
          margin: 0 auto;
          padding: 1rem;
          position: relative;
          background-color: white;
        }
        
        .document-header {
          margin-bottom: 2rem;
          border-bottom: 2px solid #333;
          padding-bottom: 1rem;
          text-align: center;
        }
        
        h1 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          font-weight: bold;
        }
        
        .document-date {
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        
        .document-body p {
          margin-bottom: 1rem;
          text-align: justify;
        }
        
        h3 {
          font-size: 1.1rem;
          font-weight: bold;
          margin: 1.5rem 0 0.75rem;
          border-bottom: 1px solid #ccc;
          padding-bottom: 0.25rem;
        }
        
        .amount-paragraph {
          text-align: center;
          font-weight: bold;
          font-size: 1.1rem;
          margin: 1.5rem 0;
          border: 1px solid #ccc;
          padding: 0.5rem;
          background-color: #f9f9f9;
        }
        
        .property-address {
          margin: 1rem 0;
          font-weight: bold;
          text-align: center;
          border: 1px solid #eee;
          padding: 0.5rem;
          background-color: #f5f5f5;
        }
        
        .document-signature {
          margin-top: 3rem;
        }
        
        .signature-line {
          border-bottom: 1px solid #333;
          padding-bottom: 0.25rem;
          margin-bottom: 0.25rem;
          width: 250px;
        }
        
        .signature-name {
          font-weight: bold;
        }
        
        .document-footer {
          margin-top: 4rem;
          position: relative;
          text-align: center;
          font-size: 0.8rem;
          color: #777;
        }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 3rem;
          color: rgba(255, 0, 0, 0.1);
          transform: rotate(-45deg);
          pointer-events: none;
          z-index: 1;
        }
      </style>
      
      <div class="document-header">
        <h1>PROMISSORY NOTE</h1>
        <div class="document-id">Loan #: HML-${loan.id.substring(0, 8)}</div>
        <div class="document-date">Date: ${formatDate(loan.dateCreated)}</div>
      </div>
      
      <div class="document-body">
        <p class="amount-paragraph">
          <span class="label">LOAN AMOUNT:</span> <span class="value">${formatCurrency(loan.loanAmount)}</span>
        </p>
        
        <p>
          FOR VALUE RECEIVED, the undersigned, <strong>${loan.borrowerName}</strong> ("Borrower"), 
          having an address at ${loan.propertyAddress.split(',')[0]}, hereby promises to pay to the order of 
          <strong>DOCULENDAI FINANCIAL SERVICES, LLC</strong> ("Lender"), having a mailing address at 
          123 Finance Avenue, Atlanta, GA 30301, or at such other place as the holder hereof may designate in writing, 
          the principal sum of <strong>${formatCurrency(loan.loanAmount)}</strong>, with interest on the unpaid principal balance 
          from the date of this Note, until paid, at an interest rate of <strong>${loan.interestRate}%</strong> per annum.
        </p>
        
        <h3>1. PAYMENT TERMS</h3>
        <p>
          Payments shall be made in ${loan.loanTerm} monthly installments of ${formatCurrency(monthlyPayment)} 
          beginning on the 1st day of ${new Date(new Date(loan.dateCreated).setMonth(new Date(loan.dateCreated).getMonth() + 1)).toLocaleString('en-us', { month: 'long', year: 'numeric' })}, 
          and continuing on the 1st day of each month thereafter until ${new Date(new Date(loan.dateCreated).setMonth(new Date(loan.dateCreated).getMonth() + loan.loanTerm)).toLocaleString('en-us', { month: 'long', day: 'numeric', year: 'numeric' })}, 
          when the entire balance of principal and interest shall be due and payable in full.
        </p>
        
        <h3>2. PROPERTY</h3>
        <p>
          This Note is secured by a Deed of Trust of even date herewith, encumbering the real property 
          commonly known as:
        </p>
        <p class="property-address">
          ${loan.propertyAddress}
        </p>
        
        <h3>3. PREPAYMENT</h3>
        <p>
          Borrower may prepay this Note in whole or in part at any time without penalty. Any partial prepayment 
          shall be applied against the principal amount outstanding and shall not postpone the due date of any 
          subsequent monthly installments or change the amount of such installments.
        </p>
        
        <h3>4. DEFAULT</h3>
        <p>
          If any payment obligation under this Note is not paid when due, the entire unpaid principal balance 
          shall at once become due and payable at the option of the holder hereof, without notice or demand.
        </p>
        
        <h3>5. LATE CHARGE</h3>
        <p>
          A late charge of 5% of the payment amount shall be assessed for any payment received more than 10 days 
          after the due date.
        </p>
      </div>
      
      <div class="document-signature">
        <p>IN WITNESS WHEREOF, Borrower has executed this Note on the day and year first above written.</p>
        
        <div class="signature-section">
          <div class="signature-line">____________________________</div>
          <div class="signature-name">${loan.borrowerName}, Borrower</div>
        </div>
      </div>
      
      <div class="document-footer">
        <div class="watermark">SAMPLE - NOT FOR LEGAL USE</div>
        <div class="page-number">Page 1 of 1</div>
      </div>
    </div>
  `;
}

// Generate a Deed of Trust document
export function generateDeedOfTrust(loan: LoanData): string {
  return `
    <div class="document legal-document deed-of-trust">
      <style>
        .document {
          font-family: 'Times New Roman', Times, serif;
          line-height: 1.5;
          color: #333;
          max-width: 100%;
          margin: 0 auto;
          padding: 1rem;
          position: relative;
          background-color: white;
        }
        
        .document-header {
          margin-bottom: 2rem;
          border-bottom: 2px solid #333;
          padding-bottom: 1rem;
          text-align: center;
        }
        
        h1 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          font-weight: bold;
        }
        
        .document-date {
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        
        .document-body p {
          margin-bottom: 1rem;
          text-align: justify;
        }
        
        h3 {
          font-size: 1.1rem;
          font-weight: bold;
          margin: 1.5rem 0 0.75rem;
          text-transform: uppercase;
        }
        
        .property-description {
          margin: 1rem;
          padding: 1rem;
          border: 1px solid #ccc;
          background-color: #f9f9f9;
        }
        
        ol {
          margin-left: 2rem;
          margin-bottom: 1rem;
        }
        
        ol li {
          margin-bottom: 0.5rem;
        }
        
        .document-signature {
          margin-top: 3rem;
        }
        
        .signature-line {
          border-bottom: 1px solid #333;
          padding-bottom: 0.25rem;
          margin-bottom: 0.25rem;
          width: 250px;
        }
        
        .signature-name {
          font-weight: bold;
        }
        
        .document-footer {
          margin-top: 4rem;
          position: relative;
          text-align: center;
          font-size: 0.8rem;
          color: #777;
        }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 3rem;
          color: rgba(255, 0, 0, 0.1);
          transform: rotate(-45deg);
          pointer-events: none;
          z-index: 1;
        }
      </style>
      
      <div class="document-header">
        <h1>DEED OF TRUST</h1>
        <div class="document-id">Loan #: HML-${loan.id.substring(0, 8)}</div>
        <div class="document-date">Date: ${formatDate(loan.dateCreated)}</div>
      </div>
      
      <div class="document-body">
        <p>
          THIS DEED OF TRUST is made this ${new Date(loan.dateCreated).getDate()} day of 
          ${new Date(loan.dateCreated).toLocaleString('en-us', { month: 'long' })}, 
          ${new Date(loan.dateCreated).getFullYear()}, by and between 
          <strong>${loan.borrowerName}</strong> (hereinafter referred to as "Borrower"), and 
          <strong>TRUST SECURITY TITLE COMPANY</strong>, as Trustee, for the benefit of 
          <strong>DOCULENDAI FINANCIAL SERVICES, LLC</strong>, as Beneficiary.
        </p>
        
        <h3>WITNESSETH:</h3>
        <p>
          THAT BORROWER, in consideration of the indebtedness herein recited and the trust herein created, 
          irrevocably grants and conveys to Trustee, in trust, with power of sale, the following described property 
          located in the County of ${loan.propertyAddress.split(',')[1]?.trim().split(' ')[0] || 'County'}, 
          State of ${loan.propertyAddress.split(',')[2]?.trim().split(' ')[0] || 'State'}:
        </p>
        
        <div class="property-description">
          <p>${loan.propertyAddress}</p>
          <p>Property Type: ${loan.propertyType.replace('_', ' ')}</p>
          <p>Legal Description: [Legal Description to be inserted here]</p>
        </div>
        
        <h3>TO SECURE:</h3>
        <p>
          Payment of the indebtedness evidenced by a promissory note of even date herewith in the principal sum of 
          ${formatCurrency(loan.loanAmount)}, made by Borrower, payable to the order of Beneficiary, 
          with final payment due on ${new Date(new Date(loan.dateCreated).setMonth(new Date(loan.dateCreated).getMonth() + loan.loanTerm)).toLocaleString('en-us', { month: 'long', day: 'numeric', year: 'numeric' })}, 
          and to secure payment of all such further sums as may hereafter be loaned or advanced by the Beneficiary herein to the Borrower herein.
        </p>
        
        <h3>BORROWER COVENANTS:</h3>
        <p>
          Borrower covenants and agrees to:
        </p>
        <ol>
          <li>Keep the property in good condition and repair;</li>
          <li>Maintain hazard insurance against loss by fire and other hazards;</li>
          <li>Pay all taxes and assessments on the property;</li>
          <li>Defend any action or proceeding purporting to affect the security hereof or the rights or powers of Beneficiary or Trustee.</li>
        </ol>
      </div>
      
      <div class="document-signature">
        <p>IN WITNESS WHEREOF, Borrower has executed this Deed of Trust on the day and year first above written.</p>
        
        <div class="signature-section">
          <div class="signature-line">____________________________</div>
          <div class="signature-name">${loan.borrowerName}, Borrower</div>
        </div>
      </div>
      
      <div class="document-footer">
        <div class="watermark">SAMPLE - NOT FOR LEGAL USE</div>
        <div class="page-number">Page 1 of 3</div>
      </div>
    </div>
  `;
}

// Generate a Closing Disclosure document
export function generateClosingDisclosure(loan: LoanData): string {
  // Calculate payments
  const monthlyPayment = calculateMonthlyPayment(loan.loanAmount, loan.interestRate, loan.loanTerm);
  const originationAmount = (loan.originationFee / 100) * loan.loanAmount;
  
  return `
    <div class="document closing-disclosure">
      <style>
        .document {
          font-family: 'Arial', sans-serif;
          line-height: 1.5;
          color: #333;
          max-width: 100%;
          margin: 0 auto;
          padding: 1rem;
          position: relative;
          background-color: white;
        }
        
        .document-header {
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #333;
          padding-bottom: 1rem;
          text-align: center;
        }
        
        h1 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          font-weight: bold;
        }
        
        h3 {
          font-size: 1.1rem;
          font-weight: bold;
          margin: 1.5rem 0 0.75rem;
          background-color: #f2f2f2;
          padding: 0.5rem;
          border-left: 4px solid #333;
        }
        
        .section {
          margin-bottom: 2rem;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 0.5rem;
        }
        
        th {
          background-color: #f2f2f2;
          text-align: left;
          font-weight: bold;
        }
        
        .disclosure-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .disclosure-field .label {
          font-weight: bold;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        
        .disclosure-field .value {
          padding: 0.35rem;
          border: 1px solid #ddd;
          background-color: #f9f9f9;
          min-height: 1.5rem;
        }
        
        .total {
          font-weight: bold;
          background-color: #f9f9f9;
        }
        
        .document-signature {
          margin-top: 3rem;
        }
        
        .signature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-gap: 2rem;
        }
        
        .signature-line {
          border-bottom: 1px solid #333;
          padding-bottom: 0.25rem;
          margin-bottom: 0.25rem;
          width: 100%;
        }
        
        .signature-name {
          font-weight: bold;
        }
        
        .signature-date {
          margin-top: 0.25rem;
          font-size: 0.9rem;
        }
        
        .document-footer {
          margin-top: 4rem;
          position: relative;
          text-align: center;
          font-size: 0.8rem;
          color: #777;
        }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 3rem;
          color: rgba(255, 0, 0, 0.1);
          transform: rotate(-45deg);
          pointer-events: none;
          z-index: 1;
        }
      </style>
      
      <div class="document-header">
        <h1>CLOSING DISCLOSURE</h1>
        <div class="document-id">Loan #: HML-${loan.id.substring(0, 8)}</div>
        <div class="document-date">Date: ${formatDate(loan.dateCreated)}</div>
      </div>
      
      <div class="document-body">
        <div class="section">
          <h3>LOAN INFORMATION</h3>
          <div class="disclosure-grid">
            <div class="disclosure-field">
              <div class="label">Loan Amount:</div>
              <div class="value">${formatCurrency(loan.loanAmount)}</div>
            </div>
            <div class="disclosure-field">
              <div class="label">Loan Term:</div>
              <div class="value">${loan.loanTerm} months</div>
            </div>
            <div class="disclosure-field">
              <div class="label">Loan Type:</div>
              <div class="value">${loan.loanType.replace('_', ' ').toUpperCase()}</div>
            </div>
            <div class="disclosure-field">
              <div class="label">Interest Rate:</div>
              <div class="value">${loan.interestRate}%</div>
            </div>
            <div class="disclosure-field">
              <div class="label">Monthly Payment:</div>
              <div class="value">${formatCurrency(monthlyPayment)}</div>
            </div>
            <div class="disclosure-field">
              <div class="label">Prepayment Penalty:</div>
              <div class="value">No</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>PROJECTED PAYMENTS</h3>
          <table>
            <thead>
              <tr>
                <th>Payment Calculation</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Principal & Interest</td>
                <td>${formatCurrency(monthlyPayment)}</td>
              </tr>
              <tr>
                <td>Estimated Escrow (Taxes, Insurance, etc.)</td>
                <td>Not Included</td>
              </tr>
              <tr>
                <td class="total">Estimated Total Monthly Payment</td>
                <td class="total">${formatCurrency(monthlyPayment)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h3>CLOSING COST DETAILS</h3>
          <table>
            <thead>
              <tr>
                <th>Fee Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Loan Origination Fee (${loan.originationFee}%)</td>
                <td>${formatCurrency(originationAmount)}</td>
              </tr>
              <tr>
                <td>Appraisal Fee</td>
                <td>${formatCurrency(500)}</td>
              </tr>
              <tr>
                <td>Credit Report Fee</td>
                <td>${formatCurrency(40)}</td>
              </tr>
              <tr>
                <td>Flood Certification Fee</td>
                <td>${formatCurrency(25)}</td>
              </tr>
              <tr>
                <td>Title Services and Lender's Title Insurance</td>
                <td>${formatCurrency(1200)}</td>
              </tr>
              <tr>
                <td>Document Preparation Fee</td>
                <td>${formatCurrency(250)}</td>
              </tr>
              <tr>
                <td>Recording Fees</td>
                <td>${formatCurrency(125)}</td>
              </tr>
              <tr>
                <td class="total">Total Closing Costs</td>
                <td class="total">${formatCurrency(originationAmount + 2140)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h3>ADDITIONAL INFORMATION</h3>
          <p>
            This Closing Disclosure is being provided as a sample for a hard money loan. In an actual transaction,
            additional disclosures would be required under federal and state law. The sample is for illustrative
            purposes only and is not intended to be used for a real transaction.
          </p>
        </div>
      </div>
      
      <div class="document-signature">
        <p>By signing below, you acknowledge receipt of this Closing Disclosure.</p>
        
        <div class="signature-grid">
          <div class="signature-section">
            <div class="signature-line">____________________________</div>
            <div class="signature-name">${loan.borrowerName}, Borrower</div>
            <div class="signature-date">Date: __________________</div>
          </div>
          
          <div class="signature-section">
            <div class="signature-line">____________________________</div>
            <div class="signature-name">Lender Representative</div>
            <div class="signature-date">Date: __________________</div>
          </div>
        </div>
      </div>
      
      <div class="document-footer">
        <div class="watermark">SAMPLE - NOT FOR LEGAL USE</div>
        <div class="page-number">Page 1 of 3</div>
      </div>
    </div>
  `;
}

// Generate a Property Appraisal document
export function generatePropertyAppraisal(loan: LoanData): string {
  // Calculate some realistic appraisal metrics
  const pricePerSqFt = Math.floor(Math.random() * 50) + 100; // $100-150 per sq ft
  const sqFt = Math.floor(loan.purchasePrice / pricePerSqFt);
  
  // Generate some random comparable sales
  const comps = [];
  for (let i = 0; i < 3; i++) {
    const variance = (Math.random() * 0.2) - 0.1; // -10% to +10%
    comps.push({
      address: generateRandomAddress(loan.propertyAddress),
      price: Math.round(loan.purchasePrice * (1 + variance)),
      sqFt: Math.round(sqFt * (1 + (Math.random() * 0.2 - 0.1))),
      bedBath: `${Math.floor(Math.random() * 2) + 3}/${Math.floor(Math.random() * 2) + 2}`,
      saleDate: formatDate(new Date(Date.now() - (Math.random() * 180 * 24 * 60 * 60 * 1000)).toISOString())
    });
  }
  
  return `
    <div class="document appraisal-report">
      <style>
        .document {
          font-family: 'Arial', sans-serif;
          line-height: 1.5;
          color: #333;
          max-width: 100%;
          margin: 0 auto;
          padding: 1rem;
          position: relative;
          background-color: white;
        }
        
        .document-header {
          margin-bottom: 1.5rem;
          border-bottom: 2px solid #333;
          padding-bottom: 1rem;
          text-align: center;
        }
        
        h1 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          font-weight: bold;
        }
        
        h3 {
          font-size: 1.1rem;
          font-weight: bold;
          margin: 1.5rem 0 0.75rem;
          background-color: #f2f2f2;
          padding: 0.5rem;
          border-left: 4px solid #333;
        }
        
        .section {
          margin-bottom: 2rem;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .form-field .label {
          font-weight: bold;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        
        .form-field .value {
          padding: 0.35rem;
          border: 1px solid #ddd;
          background-color: #f9f9f9;
          min-height: 1.5rem;
        }
        
        .value-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        
        th, td {
          border: 1px solid #ddd;
          padding: 0.5rem;
        }
        
        th {
          background-color: #f2f2f2;
          text-align: left;
          font-weight: bold;
        }
        
        .document-signature {
          margin-top: 3rem;
        }
        
        .signature-line {
          border-bottom: 1px solid #333;
          padding-bottom: 0.25rem;
          margin-bottom: 0.25rem;
          width: 250px;
        }
        
        .signature-name {
          font-weight: bold;
        }
        
        .signature-license {
          font-size: 0.9rem;
          color: #555;
        }
        
        .document-footer {
          margin-top: 4rem;
          position: relative;
          text-align: center;
          font-size: 0.8rem;
          color: #777;
        }
        
        .watermark {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 3rem;
          color: rgba(255, 0, 0, 0.1);
          transform: rotate(-45deg);
          pointer-events: none;
          z-index: 1;
        }
      </style>
      
      <div class="document-header">
        <h1>PROPERTY APPRAISAL REPORT</h1>
        <div class="document-id">Appraisal #: AP-${loan.id.substring(0, 8)}</div>
        <div class="document-date">Date: ${formatDate(loan.dateCreated)}</div>
      </div>
      
      <div class="document-body">
        <div class="section">
          <h3>SUBJECT PROPERTY INFORMATION</h3>
          <div class="form-grid">
            <div class="form-field">
              <div class="label">Property Address:</div>
              <div class="value">${loan.propertyAddress}</div>
            </div>
            <div class="form-field">
              <div class="label">Property Type:</div>
              <div class="value">${loan.propertyType.replace('_', ' ').toUpperCase()}</div>
            </div>
            <div class="form-field">
              <div class="label">Year Built:</div>
              <div class="value">${Math.floor(Math.random() * 70) + 1950}</div>
            </div>
            <div class="form-field">
              <div class="label">Gross Living Area:</div>
              <div class="value">${sqFt.toLocaleString()} sq. ft.</div>
            </div>
            <div class="form-field">
              <div class="label">Lot Size:</div>
              <div class="value">${(Math.random() * 0.5 + 0.1).toFixed(2)} acres</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>VALUATION SUMMARY</h3>
          <div class="value-grid">
            <div class="form-field">
              <div class="label">Current As-Is Value:</div>
              <div class="value">${formatCurrency(loan.purchasePrice)}</div>
            </div>
            <div class="form-field">
              <div class="label">After Repair Value (ARV):</div>
              <div class="value">${formatCurrency(loan.afterRepairValue)}</div>
            </div>
            <div class="form-field">
              <div class="label">Price Per Square Foot:</div>
              <div class="value">${formatCurrency(pricePerSqFt)}/sq. ft.</div>
            </div>
            <div class="form-field">
              <div class="label">Estimated Rehab Cost:</div>
              <div class="value">${formatCurrency(loan.rehabBudget)}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h3>COMPARABLE SALES</h3>
          <table>
            <thead>
              <tr>
                <th>Address</th>
                <th>Sale Price</th>
                <th>Size</th>
                <th>Bed/Bath</th>
                <th>Sale Date</th>
                <th>Price/Sq.Ft.</th>
              </tr>
            </thead>
            <tbody>
              ${comps.map(comp => `
                <tr>
                  <td>${comp.address}</td>
                  <td>${formatCurrency(comp.price)}</td>
                  <td>${comp.sqFt.toLocaleString()} sq.ft.</td>
                  <td>${comp.bedBath}</td>
                  <td>${comp.saleDate}</td>
                  <td>${formatCurrency(Math.round(comp.price / comp.sqFt))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <h3>APPRAISER'S CERTIFICATION</h3>
          <p>
            I certify that, to the best of my knowledge and belief: The statements of fact contained
            in this report are true and correct. The reported analyses, opinions, and conclusions are
            limited only by the reported assumptions and limiting conditions and are my personal,
            impartial, and unbiased professional analyses, opinions, and conclusions.
          </p>
        </div>
      </div>
      
      <div class="document-signature">
        <div class="signature-section">
          <div class="signature-line">____________________________</div>
          <div class="signature-name">Thomas J. Anderson, MAI, SRA</div>
          <div class="signature-license">License #: AP12345</div>
        </div>
      </div>
      
      <div class="document-footer">
        <div class="watermark">SAMPLE - NOT FOR LEGAL USE</div>
        <div class="page-number">Page 1 of 5</div>
      </div>
    </div>
  `;
}

// Helper function to generate a random address near the original
function generateRandomAddress(baseAddress: string): string {
  const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd', 'Elm St', 'Washington Ave'];
  const street = streets[Math.floor(Math.random() * streets.length)];
  const number = Math.floor(Math.random() * 9000) + 1000;
  
  // Extract city and state from base address
  const parts = baseAddress.split(',');
  if (parts.length >= 2) {
    return `${number} ${street}, ${parts[1]}, ${parts[2] || ''}`;
  }
  
  return `${number} ${street}`;
}