import { LoanData } from '../loanGenerator';

/**
 * Credit Report Template functions
 * Returns HTML string for credit report document
 */

// Define interfaces for type safety
interface CreditAccount {
  accountType: string;
  creditor: string;
  accountNumber: string;
  openingDate: string;
  creditLimit: number;
  balance: number;
  paymentStatus: string;
  paymentHistory: string[];
}

interface CreditInquiry {
  date: string;
  creditor: string;
  inquiryType: string;
}

// Format date helper
const formatDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format specific date with month/year
const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
};

// Generate random credit account data
const generateCreditAccounts = (count: number, creditScore: number): CreditAccount[] => {
  const accountTypes = ['Credit Card', 'Auto Loan', 'Mortgage', 'Personal Loan', 'Student Loan', 'Retail Card'];
  const creditors = ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Capital One', 'Discover', 'Citibank', 'American Express', 'US Bank', 'TD Bank', 'PNC Bank'];
  
  // Better payment history for higher credit scores
  const getPaymentHistory = (score: number): string[] => {
    if (score > 750) return Array(24).fill('OK');
    if (score > 700) {
      const history = Array(24).fill('OK');
      history[Math.floor(Math.random() * 24)] = '30';
      return history;
    }
    if (score > 650) {
      const history = Array(24).fill('OK');
      history[Math.floor(Math.random() * 24)] = '30';
      history[Math.floor(Math.random() * 24)] = '30';
      return history;
    }
    // Lower scores
    const history = Array(24).fill('OK');
    history[Math.floor(Math.random() * 24)] = '30';
    history[Math.floor(Math.random() * 24)] = '60';
    history[Math.floor(Math.random() * 12)] = '90';
    return history;
  };

  const accounts: CreditAccount[] = [];
  for (let i = 0; i < count; i++) {
    // Generate random opening date 1-15 years ago
    const openingDate = new Date();
    openingDate.setFullYear(openingDate.getFullYear() - (1 + Math.floor(Math.random() * 15)));
    
    // Generate appropriate limits/balances based on account type
    const accountType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
    let creditLimit = 0;
    let balance = 0;
    
    switch (accountType) {
      case 'Credit Card':
      case 'Retail Card':
        creditLimit = Math.floor((1 + Math.random() * 2) * 10000);
        balance = Math.floor(Math.random() * 0.7 * creditLimit);
        break;
      case 'Auto Loan':
        creditLimit = Math.floor((2 + Math.random() * 3) * 10000);
        balance = Math.floor((0.3 + Math.random() * 0.7) * creditLimit);
        break;
      case 'Personal Loan':
        creditLimit = Math.floor((1 + Math.random() * 2) * 10000);
        balance = Math.floor((0.5 + Math.random() * 0.5) * creditLimit);
        break;
      case 'Student Loan':
        creditLimit = Math.floor((3 + Math.random() * 4) * 10000);
        balance = Math.floor((0.6 + Math.random() * 0.4) * creditLimit);
        break;
      case 'Mortgage':
        creditLimit = Math.floor((15 + Math.random() * 35) * 10000);
        balance = Math.floor((0.7 + Math.random() * 0.3) * creditLimit);
        break;
    }
    
    accounts.push({
      accountType,
      creditor: creditors[Math.floor(Math.random() * creditors.length)],
      accountNumber: `xxxx-xxxx-xxxx-${Math.floor(1000 + Math.random() * 9000)}`,
      openingDate: formatMonthYear(openingDate),
      creditLimit,
      balance,
      paymentStatus: creditScore > 680 ? 'Current' : Math.random() > 0.8 ? '30 Days Past Due' : 'Current',
      paymentHistory: getPaymentHistory(creditScore)
    });
  }
  
  return accounts;
};

// Generate random inquiries
const generateInquiries = (count: number): CreditInquiry[] => {
  const inquiryTypes = ['Auto Loan', 'Credit Card', 'Mortgage', 'Personal Loan', 'Apartment Rental'];
  const creditors = ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Capital One', 'Discover', 'Citibank', 'CarMax Auto Finance', 'Toyota Financial', 'Rocket Mortgage', 'SoFi'];
  
  const inquiries: CreditInquiry[] = [];
  for (let i = 0; i < count; i++) {
    // Random date within last 2 years
    const inquiryDate = new Date();
    inquiryDate.setDate(inquiryDate.getDate() - Math.floor(Math.random() * 730));
    
    inquiries.push({
      date: inquiryDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      creditor: creditors[Math.floor(Math.random() * creditors.length)],
      inquiryType: inquiryTypes[Math.floor(Math.random() * inquiryTypes.length)]
    });
  }
  
  // Sort by date (newest first)
  return inquiries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
    font-weight: bold;
    background-color: #f5f5f5;
  }
  .summary-box {
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    padding: 15px;
    margin-bottom: 20px;
    border-radius: 4px;
  }
  .score-container {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }
  .score-circle {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: conic-gradient(
      #4CAF50 0% calc((var(--score) - 300) / 550 * 100%),
      #f5f5f5 calc((var(--score) - 300) / 550 * 100%) 100%
    );
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 20px;
  }
  .score-circle::before {
    content: "";
    width: 90px;
    height: 90px;
    background: white;
    border-radius: 50%;
    position: absolute;
  }
  .score-value {
    position: relative;
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }
  .score-details {
    flex: 1;
  }
  .score-range {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    font-size: 12px;
    color: #666;
  }
  .score-category {
    font-weight: bold;
    margin-bottom: 5px;
    font-size: 18px;
  }
  .payment-history {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 10px;
  }
  .payment-month {
    width: 25px;
    height: 25px;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 2px;
    border-radius: 4px;
  }
  .payment-ok {
    background-color: #4CAF50;
    color: white;
  }
  .payment-30 {
    background-color: #FFC107;
    color: black;
  }
  .payment-60 {
    background-color: #FF9800;
    color: white;
  }
  .payment-90 {
    background-color: #F44336;
    color: white;
  }
  .credit-factors {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .factor-box {
    width: 48%;
    background-color: #f9f9f9;
    border: 1px solid #eee;
    padding: 12px;
    margin-bottom: 15px;
    border-radius: 4px;
  }
  .factor-title {
    font-weight: bold;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
  }
  .factor-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 8px;
    display: inline-block;
  }
  .indicator-excellent {
    background-color: #4CAF50;
  }
  .indicator-good {
    background-color: #8BC34A;
  }
  .indicator-fair {
    background-color: #FFC107;
  }
  .indicator-poor {
    background-color: #F44336;
  }
  .account-section {
    margin-bottom: 25px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #ddd;
  }
  .account-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .account-name {
    font-weight: bold;
  }
  .balance-bar {
    height: 8px;
    background-color: #e0e0e0;
    margin: 5px 0 10px 0;
    border-radius: 4px;
    overflow: hidden;
  }
  .balance-fill {
    height: 100%;
    background-color: #4CAF50;
    border-radius: 4px;
  }
  .legal-disclaimer {
    font-size: 12px;
    color: #666;
    font-style: italic;
    margin-top: 30px;
  }
  /* Add responsive design */
  @media (max-width: 600px) {
    .factor-box {
      width: 100%;
    }
  }
</style>`;

/**
 * Credit Report Template
 * Provides a comprehensive credit report with score, accounts, inquiries, and factors
 */
export const getCreditReportTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const creditScore = loanData.creditScore || Math.floor(Math.random() * (850 - 650) + 650);
  
  // Determine credit score category
  let scoreCategory = '';
  let scoreColor = '';
  
  if (creditScore >= 800) {
    scoreCategory = 'Exceptional';
    scoreColor = '#4CAF50';
  } else if (creditScore >= 740) {
    scoreCategory = 'Very Good';
    scoreColor = '#8BC34A';
  } else if (creditScore >= 670) {
    scoreCategory = 'Good';
    scoreColor = '#FFC107';
  } else if (creditScore >= 580) {
    scoreCategory = 'Fair';
    scoreColor = '#FF9800';
  } else {
    scoreCategory = 'Poor';
    scoreColor = '#F44336';
  }
  
  // Generate credit accounts based on credit score
  const accountCount = 7 + Math.floor(Math.random() * 6); // 7-12 accounts
  const accounts = generateCreditAccounts(accountCount, creditScore);
  
  // Calculate totals
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const totalCreditLimit = accounts.reduce((sum, account) => sum + account.creditLimit, 0);
  const utilizationRate = Math.round((totalBalance / totalCreditLimit) * 100);
  
  // Generate inquiries
  const inquiryCount = Math.floor(Math.random() * 4) + 1; // 1-4 inquiries
  const inquiries = generateInquiries(inquiryCount);
  
  // Credit account age calculation
  const oldestAccount = Math.max(...accounts.map(a => {
    const year = parseInt(a.openingDate.split(' ')[1]);
    const month = new Date(Date.parse(a.openingDate.split(' ')[0] + ' 1, 2000')).getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    return (currentYear - year) * 12 + (currentMonth - month);
  }));
  const averageAccountAge = Math.round(accounts.reduce((sum, a) => {
    const year = parseInt(a.openingDate.split(' ')[1]);
    const month = new Date(Date.parse(a.openingDate.split(' ')[0] + ' 1, 2000')).getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    return sum + (currentYear - year) * 12 + (currentMonth - month);
  }, 0) / accounts.length);
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">Credit Report</div>
        <div class="document-subtitle">Generated on: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Consumer Information</div>
        <table class="info-table">
          <tr>
            <th>Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Address:</th>
            <td>${loanData.borrowerAddress || '123 Main Street, Anytown, USA 12345'}</td>
          </tr>
          <tr>
            <th>Social Security Number:</th>
            <td>XXX-XX-${Math.floor(1000 + Math.random() * 9000)}</td>
          </tr>
          <tr>
            <th>Date of Birth:</th>
            <td>XX/XX/${1950 + Math.floor(Math.random() * 40)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Credit Score Summary</div>
        <div class="summary-box">
          <div class="score-container">
            <div class="score-circle" style="--score: ${creditScore}">
              <div class="score-value">${creditScore}</div>
            </div>
            <div class="score-details">
              <div class="score-category" style="color: ${scoreColor}">${scoreCategory}</div>
              <p>Your score is ${creditScore > 720 ? 'above' : creditScore > 670 ? 'near' : 'below'} the U.S. average of 714.</p>
              <div class="score-range">
                <span>300</span>
                <span>850</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="credit-factors">
          <div class="factor-box">
            <div class="factor-title">
              <span class="factor-indicator ${utilizationRate < 30 ? 'indicator-excellent' : utilizationRate < 50 ? 'indicator-good' : utilizationRate < 70 ? 'indicator-fair' : 'indicator-poor'}"></span>
              Credit Utilization
            </div>
            <p>${utilizationRate}% of available credit used</p>
          </div>
          <div class="factor-box">
            <div class="factor-title">
              <span class="factor-indicator ${creditScore > 720 ? 'indicator-excellent' : creditScore > 670 ? 'indicator-good' : 'indicator-fair'}"></span>
              Payment History
            </div>
            <p>${Math.round(accounts.reduce((sum, a) => sum + a.paymentHistory.filter(p => p === 'OK').length, 0) / (accounts.length * 24) * 100)}% on-time payments</p>
          </div>
          <div class="factor-box">
            <div class="factor-title">
              <span class="factor-indicator ${averageAccountAge > 84 ? 'indicator-excellent' : averageAccountAge > 48 ? 'indicator-good' : averageAccountAge > 24 ? 'indicator-fair' : 'indicator-poor'}"></span>
              Credit Age
            </div>
            <p>Average: ${Math.floor(averageAccountAge / 12)} years, ${averageAccountAge % 12} months</p>
          </div>
          <div class="factor-box">
            <div class="factor-title">
              <span class="factor-indicator ${inquiries.length <= 2 ? 'indicator-excellent' : inquiries.length <= 4 ? 'indicator-good' : 'indicator-fair'}"></span>
              Recent Inquiries
            </div>
            <p>${inquiries.length} in the last 2 years</p>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Accounts Summary</div>
        <table class="info-table">
          <tr>
            <th>Total Accounts</th>
            <th>Total Balance</th>
            <th>Available Credit</th>
            <th>Utilization Rate</th>
          </tr>
          <tr>
            <td>${accounts.length}</td>
            <td>$${totalBalance.toLocaleString()}</td>
            <td>$${(totalCreditLimit - totalBalance).toLocaleString()}</td>
            <td>${utilizationRate}%</td>
          </tr>
        </table>
        
        <div class="subsection-title">Account Types</div>
        <table class="info-table">
          <tr>
            <th>Type</th>
            <th>Count</th>
            <th>Total Balance</th>
          </tr>
          ${Array.from(new Set(accounts.map(a => a.accountType))).map(type => {
            const typeAccounts = accounts.filter(a => a.accountType === type);
            const typeBalance = typeAccounts.reduce((sum, a) => sum + a.balance, 0);
            return `<tr>
              <td>${type}</td>
              <td>${typeAccounts.length}</td>
              <td>$${typeBalance.toLocaleString()}</td>
            </tr>`;
          }).join('')}
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Account Details</div>
        ${accounts.map(account => {
          const utilizationPercent = Math.round((account.balance / account.creditLimit) * 100);
          return `
            <div class="account-section">
              <div class="account-header">
                <div class="account-name">${account.creditor} - ${account.accountType}</div>
                <div>${account.paymentStatus}</div>
              </div>
              <table class="info-table">
                <tr>
                  <th>Account Number</th>
                  <td>${account.accountNumber}</td>
                </tr>
                <tr>
                  <th>Date Opened</th>
                  <td>${account.openingDate}</td>
                </tr>
                <tr>
                  <th>Credit Limit</th>
                  <td>$${account.creditLimit.toLocaleString()}</td>
                </tr>
                <tr>
                  <th>Current Balance</th>
                  <td>$${account.balance.toLocaleString()}</td>
                </tr>
                <tr>
                  <th>Utilization</th>
                  <td>${utilizationPercent}%</td>
                </tr>
              </table>
              <div class="balance-bar">
                <div class="balance-fill" style="width: ${utilizationPercent}%"></div>
              </div>
              <div class="subsection-title">Payment History (Last 24 Months)</div>
              <div class="payment-history">
                ${account.paymentHistory.map((status, index) => {
                  const statusClass = status === 'OK' ? 'payment-ok' : 
                                      status === '30' ? 'payment-30' : 
                                      status === '60' ? 'payment-60' : 'payment-90';
                  return `<div class="payment-month ${statusClass}">${status}</div>`;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <div class="document-section">
        <div class="section-title">Credit Inquiries (Last 2 Years)</div>
        <table class="info-table">
          <tr>
            <th>Date</th>
            <th>Creditor</th>
            <th>Type</th>
          </tr>
          ${inquiries.map(inquiry => {
            return `<tr>
              <td>${inquiry.date}</td>
              <td>${inquiry.creditor}</td>
              <td>${inquiry.inquiryType}</td>
            </tr>`;
          }).join('')}
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Public Records</div>
        ${creditScore < 650 ? `
          <table class="info-table">
            <tr>
              <th>Type</th>
              <th>Date Filed</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
            <tr>
              <td>Civil Judgment</td>
              <td>${new Date(new Date().setFullYear(new Date().getFullYear() - 3)).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</td>
              <td>$${(Math.floor(Math.random() * 5) + 1) * 1000}</td>
              <td>Satisfied</td>
            </tr>
          </table>
        ` : `
          <p>No public records found on your credit report.</p>
        `}
      </div>
      
      <div class="document-section">
        <div class="section-title">Recommendations</div>
        <ul>
          ${utilizationRate > 30 ? `<li>Consider paying down balances to reduce your credit utilization below 30%.</li>` : ''}
          ${accounts.some(a => a.paymentHistory.some(p => p !== 'OK')) ? `<li>Continue making all payments on time to improve your payment history.</li>` : ''}
          ${inquiries.length > 3 ? `<li>Limit new credit applications to avoid multiple hard inquiries in a short period.</li>` : ''}
          ${accounts.length < 5 ? `<li>Consider a diverse mix of credit accounts to strengthen your credit profile.</li>` : ''}
          <li>Regularly monitor your credit report for any inaccuracies or signs of fraud.</li>
          <li>Keep older accounts open to maintain a longer credit history.</li>
        </ul>
      </div>
      
      <div class="legal-disclaimer">
        <p>This credit report is being provided for loan application purposes only. The information contained in this report is based on data gathered from various sources and may not be completely accurate or up to date. You have the right to dispute any information you believe to be inaccurate. This report is not an official credit bureau report, and the credit score shown may differ from scores used by actual lenders.</p>
      </div>
    </div>
  `;
};
