import { LoanData } from '../loanGenerator';

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
        <p>I/We authorize Atlas Hard Money Lenders, or its assigns, to obtain verification of any information necessary, including but not limited to the following:</p>
        
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
          hereby promises to pay to the order of ATLAS HARD MONEY LENDERS, or any subsequent holder hereof 
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

// Export a mapping of document types to their template functions
export const documentTemplates: { [key: string]: (loanData: LoanData) => string } = {
  loan_application: getLoanApplicationTemplate,
  photo_id: getPhotoIdTemplate,
  credit_authorization: getCreditAuthorizationTemplate,
  promissory_note: getPromissoryNoteTemplate,
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