import { LoanData } from '../loanGenerator';

/**
 * Income Document Templates
 * Returns HTML strings for income and rental property related document types
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
const getFutureDate = (months: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
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
  .clause {
    margin-bottom: 15px;
    padding-left: 15px;
  }
  .clause-title {
    font-weight: bold;
    margin-bottom: 5px;
  }
  .provision {
    padding: 8px;
    margin-bottom: 5px;
    background-color: #f9f9f9;
    border-radius: 4px;
  }
  .highlight {
    background-color: #fffbd6;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
  }
  .notice {
    background-color: #f8d7da;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
  }
  .parties {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .party-box {
    width: 48%;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 4px;
  }
  .initials-section {
    display: flex;
    justify-content: flex-end;
    margin-top: -10px;
    margin-bottom: 20px;
  }
  .initials-box {
    width: 100px;
    text-align: center;
  }
  .initials-line {
    border-top: 1px solid #000;
    width: 80px;
    margin-bottom: 5px;
  }
</style>`;

/**
 * Lease Agreement Template
 * Simulates a standard residential lease agreement
 */
const getLeaseAgreementTemplate = (loanData: LoanData): string => {
  // Generate tenant names
  const generateTenantNames = () => {
    const firstNames = ['John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'Robert', 'Jennifer'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    
    const tenant1 = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    const tenant2 = Math.random() > 0.5 ? `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}` : null;
    
    return tenant2 ? `${tenant1} and ${tenant2}` : tenant1;
  };
  
  const formattedDate = formatDate();
  const tenantNames = generateTenantNames();
  
  // Calculate rent based on property value
  const propertyValue = loanData.propertyValue || loanData.purchasePrice || loanData.loanAmount;
  const monthlyRent = Math.round((propertyValue * 0.007) / 100) * 100; // Roughly 0.7% of property value
  const securityDeposit = monthlyRent * 1.5;
  
  // Determine lease term
  const leaseStartDate = formattedDate;
  const leaseTerm = Math.floor(Math.random() * 2) + 1; // 1-2 years
  const leaseEndDate = getFutureDate(leaseTerm * 12);
  
  // Generate property features based on property type
  const getPropertyFeatures = () => {
    const baseFeatures = ['Refrigerator', 'Stove/Oven', 'Dishwasher', 'Microwave'];
    
    if (loanData.propertyType === 'single_family') {
      return [...baseFeatures, 'Washer/Dryer Hookups', 'Central A/C', 'Garage Access', 'Yard Maintenance Equipment'];
    } else if (loanData.propertyType === 'multi_family_2_4' || loanData.propertyType === 'multi_family_5plus') {
      return [...baseFeatures, 'Shared Laundry Facilities', 'Common Area Access', 'Buzzer/Intercom System'];
    } else {
      return [...baseFeatures, 'Window A/C Units', 'Parking Space'];
    }
  };
  
  const propertyFeatures = getPropertyFeatures();
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">Residential Lease Agreement</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="parties">
          <div class="party-box">
            <div class="subsection-title">Landlord:</div>
            <p>
              <strong>${loanData.borrowerName}</strong><br>
              ${loanData.borrowerAddress || '123 Owner Street, Anytown, USA 12345'}<br>
              Phone: ${loanData.borrowerPhone || '(555) 123-4567'}<br>
              Email: ${loanData.borrowerEmail}
            </p>
          </div>
          <div class="party-box">
            <div class="subsection-title">Tenant(s):</div>
            <p>
              <strong>${tenantNames}</strong><br>
              Current Address: 456 Previous St, Anytown, USA 12345<br>
              Phone: (555) 987-6543<br>
              Email: ${tenantNames.split(' ')[0].toLowerCase()}.tenant@email.com
            </p>
          </div>
        </div>
        
        <p>This Residential Lease Agreement ("Agreement") is made and entered into on <strong>${formattedDate}</strong>, by and between the Landlord and Tenant(s) referred to above. Each Tenant is jointly and severally liable for the payment of rent and performance of all other terms of this Agreement.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">1. Property</div>
        <p>Subject to the terms and conditions in this Agreement, Landlord rents to Tenant, and Tenant rents from Landlord, for residential purposes only, the premises located at:</p>
        <div class="provision">
          <strong>${loanData.propertyAddress}</strong>
        </div>
        <p>The rental unit shall be for the exclusive use and occupancy as a personal residence by the named Tenant(s) and the following minor children:</p>
        <div class="provision">
          To be listed by Tenant at time of signing
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Tenant</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Landlord</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">2. Term</div>
        <p>The term of this Agreement begins on <strong>${leaseStartDate}</strong> and ends on <strong>${leaseEndDate}</strong> (the "Initial Term"). This is a fixed-term lease with a total lease period of ${leaseTerm} ${leaseTerm === 1 ? 'year' : 'years'}.</p>
        
        <div class="clause">
          <div class="clause-title">Renewal Terms:</div>
          <p>After the Initial Term, this Agreement shall: (select one)</p>
          <p>[X] Continue on a month-to-month basis with 30 days' written notice required by either party to terminate.<br>
          [ ] Terminate, requiring the Tenant to vacate the premises.</p>
          <p>If this Agreement continues on a month-to-month basis, Landlord may increase the rent with 30 days' written notice.</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Tenant</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Landlord</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">3. Rent</div>
        <table class="info-table">
          <tr>
            <th>Monthly Rent:</th>
            <td>${formatCurrency(monthlyRent)}</td>
          </tr>
          <tr>
            <th>Payment Due Date:</th>
            <td>1st day of each month</td>
          </tr>
          <tr>
            <th>Late Fee:</th>
            <td>${formatCurrency(monthlyRent * 0.05)} (5% of monthly rent) if paid after the 5th of the month</td>
          </tr>
          <tr>
            <th>Payment Methods:</th>
            <td>Electronic transfer, check, cashier's check, or money order</td>
          </tr>
          <tr>
            <th>Payment Address:</th>
            <td>${loanData.borrowerAddress || 'To be provided by Landlord'}</td>
          </tr>
        </table>
        
        <div class="highlight">
          <p>Tenant understands that rent must be received by Landlord (or designee) on or before the due date, regardless of holidays or weekends. Tenant will not withhold or offset rent unless specifically authorized by applicable law.</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Tenant</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Landlord</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">4. Security Deposit</div>
        <p>Upon execution of this Agreement, Tenant shall pay to Landlord a security deposit in the amount of <strong>${formatCurrency(securityDeposit)}</strong>.</p>
        
        <div class="clause">
          <p>This deposit shall secure Tenant's performance of this Agreement, including but not limited to: payment of rent, repair of damages beyond normal wear and tear, cleaning costs, and key replacement.</p>
          <p>The security deposit will be held in an account at ${['First National Bank', 'Community Trust Bank', 'Heritage Savings & Loan'][Math.floor(Math.random() * 3)]}.</p>
          <p>Within ${Math.floor(Math.random() * 15) + 15} days after Tenant vacates the premises, Landlord shall return the deposit in full or deliver a written statement of deductions with any remaining balance.</p>
        </div>
        
        <div class="notice">
          <p>NOTICE: Security deposit may not be applied to last month's rent without Landlord's prior written consent.</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Tenant</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Landlord</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">5. Utilities and Services</div>
        <p>Tenant shall be responsible for payment of all utilities and services, except the following which shall be paid by Landlord:</p>
        <div class="provision">
          ${['Water and Sewer', 'Garbage Collection', 'Landscaping'][Math.floor(Math.random() * 3)]}
        </div>
        
        <p>Tenant must place utilities in their name within 3 days of the start of the lease term.</p>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Tenant</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Landlord</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">6. Property Condition and Inventory</div>
        <p>Tenant acknowledges that they have examined the premises and found them to be in good, safe, and clean condition, except as noted in the Property Condition Report to be completed at move-in.</p>
        
        <p>The following items are included with the premises:</p>
        <ul>
          ${propertyFeatures.map(item => `<li>${item}</li>`).join('')}
        </ul>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Tenant</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Landlord</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">7. Maintenance, Repairs, and Alterations</div>
        <div class="clause">
          <p>Tenant shall keep the premises clean and in good condition, promptly notify Landlord of any defects or necessary repairs, and pay for any repairs caused by Tenant's negligence or misuse.</p>
          <p>Tenant shall not make alterations to the premises without Landlord's prior written consent.</p>
          <p>Landlord shall maintain the roof, foundation, exterior walls, common areas (if any), and all plumbing, electrical, and heating systems in good working order.</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Tenant</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Landlord</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">8. Entry and Inspection</div>
        <p>Landlord or Landlord's agents may enter the premises at reasonable times to inspect, make repairs, or show the property to prospective tenants or purchasers with:</p>
        <ul>
          <li>24 hours' advance notice in writing, email, or text; or</li>
          <li>In case of emergency, abandonment, or surrender; or</li>
          <li>With Tenant's permission.</li>
        </ul>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Tenant</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Landlord</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">9. Pets</div>
        <div class="clause">
          <p>[ ] No pets are allowed, even temporarily, without Landlord's prior written consent.</p>
          <p>[X] Pets are allowed with Landlord's prior written consent and payment of a pet deposit and/or fee.</p>
          <p>Approved pets (if any): To be documented in a separate Pet Addendum</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Tenant</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Landlord</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">10. Additional Terms and Conditions</div>
        <div class="clause">
          <p>1. Tenant shall not violate any law or ordinance or create a nuisance on the premises.</p>
          <p>2. Smoking is ${Math.random() > 0.5 ? 'not permitted' : 'only permitted in designated outdoor areas'} on the premises.</p>
          <p>3. Tenant shall comply with all Homeowner's Association regulations, if applicable.</p>
          <p>4. Tenant shall maintain a minimum indoor temperature of 55°F during cold weather to prevent frozen pipes.</p>
          <p>5. If Tenant abandons or surrenders the premises, Landlord may dispose of any abandoned property as permitted by law.</p>
        </div>
        
        <div class="highlight">
          <p>The parties agree that this written Agreement, including any attached addenda, represents their entire agreement and that no oral agreements have been made.</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Tenant</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Landlord</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="highlight">
          <p>By signing below, each Tenant acknowledges having read and understood all provisions of this Agreement and agrees to comply with its terms.</p>
        </div>
        
        <div class="signature-section">
          <div class="signature-line"></div>
          <div>Tenant Signature and Date</div>
          
          <div style="margin-top: 40px;">
            <div class="signature-line"></div>
            <div>Tenant Signature and Date</div>
          </div>
          
          <div style="margin-top: 40px;">
            <div class="signature-line"></div>
            <div>Landlord Signature and Date</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

/**
 * DSCR Calculation Worksheet Template
 * Simulates a detailed Debt Service Coverage Ratio calculation for real estate investors
 */
const getDscrCalculationWorksheetTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  // Generate property income and expense data
  const propertyValue = loanData.propertyValue || loanData.purchasePrice || loanData.loanAmount;
  const monthlyRent = Math.round((propertyValue * 0.007) / 100) * 100; // Roughly 0.7% of property value
  const yearlyRent = monthlyRent * 12;
  
  // Generate other income (laundry, parking, etc.)
  const otherIncome = Math.round((monthlyRent * (Math.random() * 0.1)) / 10) * 10 * 12;
  
  // Calculate gross income
  const grossIncome = yearlyRent + otherIncome;
  
  // Calculate vacancy rate (5-8%)
  const vacancyRate = Math.floor(Math.random() * 4) + 5;
  const vacancyLoss = Math.round(grossIncome * (vacancyRate / 100));
  
  // Calculate effective gross income
  const effectiveGrossIncome = grossIncome - vacancyLoss;
  
  // Generate operating expenses
  const propertyTaxes = Math.round((propertyValue * (Math.random() * 0.015 + 0.01)) / 100) * 100;
  const insurance = Math.round((propertyValue * (Math.random() * 0.005 + 0.003)) / 100) * 100;
  const propertyManagement = Math.round(effectiveGrossIncome * (Math.random() * 0.05 + 0.08));
  const maintenance = Math.round(effectiveGrossIncome * (Math.random() * 0.05 + 0.05));
  const utilities = Math.round((Math.random() * 1200 + 600) / 100) * 100;
  const capex = Math.round(effectiveGrossIncome * (Math.random() * 0.03 + 0.05));
  const otherExpenses = Math.round((Math.random() * 1000 + 500) / 100) * 100;
  
  // Calculate total operating expenses
  const totalOperatingExpenses = propertyTaxes + insurance + propertyManagement + maintenance + utilities + capex + otherExpenses;
  
  // Calculate Net Operating Income (NOI)
  const noi = effectiveGrossIncome - totalOperatingExpenses;
  
  // Calculate annual debt service
  const annualDebtService = (loanData.monthlyPayment || Math.round((loanData.loanAmount * 0.006) / 10) * 10) * 12;
  
  // Calculate DSCR
  const dscr = noi / annualDebtService;
  const formattedDscr = dscr.toFixed(2);
  
  // Determine if DSCR is acceptable
  const dscrStatus = dscr >= 1.25 ? 'Strong' : dscr >= 1.0 ? 'Acceptable' : 'Insufficient';
  const dscrClass = dscr >= 1.25 ? 'text-success' : dscr >= 1.0 ? 'text-warning' : 'text-danger';
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">DSCR Calculation Worksheet</div>
        <div class="document-subtitle">Prepared: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <table class="info-table">
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Property Owner:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Property Type:</th>
            <td>${loanData.propertyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
          </tr>
          <tr>
            <th>Property Value:</th>
            <td>${formatCurrency(propertyValue)}</td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Loan-to-Value (LTV):</th>
            <td>${loanData.ltv}%</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">1. Property Income (Annual)</div>
        <table class="info-table">
          <tr>
            <th>Gross Rental Income:</th>
            <td>${formatCurrency(yearlyRent)} (${formatCurrency(monthlyRent)} × 12 months)</td>
          </tr>
          <tr>
            <th>Other Income:</th>
            <td>${formatCurrency(otherIncome)} (laundry, parking, storage, etc.)</td>
          </tr>
          <tr>
            <th>Gross Operating Income:</th>
            <td>${formatCurrency(grossIncome)}</td>
          </tr>
          <tr>
            <th>Vacancy & Credit Loss (${vacancyRate}%):</th>
            <td>- ${formatCurrency(vacancyLoss)}</td>
          </tr>
          <tr>
            <th>Effective Gross Income:</th>
            <td>${formatCurrency(effectiveGrossIncome)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">2. Operating Expenses (Annual)</div>
        <table class="info-table">
          <tr>
            <th>Property Taxes:</th>
            <td>${formatCurrency(propertyTaxes)}</td>
          </tr>
          <tr>
            <th>Insurance:</th>
            <td>${formatCurrency(insurance)}</td>
          </tr>
          <tr>
            <th>Property Management (${Math.round((propertyManagement / effectiveGrossIncome) * 100)}%):</th>
            <td>${formatCurrency(propertyManagement)}</td>
          </tr>
          <tr>
            <th>Repairs & Maintenance:</th>
            <td>${formatCurrency(maintenance)}</td>
          </tr>
          <tr>
            <th>Utilities:</th>
            <td>${formatCurrency(utilities)}</td>
          </tr>
          <tr>
            <th>Capital Expenditures Reserve:</th>
            <td>${formatCurrency(capex)}</td>
          </tr>
          <tr>
            <th>Other Expenses:</th>
            <td>${formatCurrency(otherExpenses)}</td>
          </tr>
          <tr style="font-weight: bold; background-color: #f5f5f5;">
            <th>Total Operating Expenses:</th>
            <td>${formatCurrency(totalOperatingExpenses)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">3. Net Operating Income (NOI)</div>
        <table class="info-table">
          <tr>
            <th>Effective Gross Income:</th>
            <td>${formatCurrency(effectiveGrossIncome)}</td>
          </tr>
          <tr>
            <th>Less: Total Operating Expenses:</th>
            <td>- ${formatCurrency(totalOperatingExpenses)}</td>
          </tr>
          <tr style="font-weight: bold; background-color: #d1e7dd;">
            <th>Net Operating Income (NOI):</th>
            <td>${formatCurrency(noi)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">4. Debt Service</div>
        <table class="info-table">
          <tr>
            <th>Monthly Loan Payment:</th>
            <td>${formatCurrency(annualDebtService / 12)}</td>
          </tr>
          <tr style="font-weight: bold; background-color: #f5f5f5;">
            <th>Annual Debt Service:</th>
            <td>${formatCurrency(annualDebtService)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">5. Debt Service Coverage Ratio (DSCR)</div>
        <table class="info-table">
          <tr>
            <th>Net Operating Income:</th>
            <td>${formatCurrency(noi)}</td>
          </tr>
          <tr>
            <th>Annual Debt Service:</th>
            <td>${formatCurrency(annualDebtService)}</td>
          </tr>
          <tr style="font-weight: bold; background-color: #e2e3e5;">
            <th>DSCR Calculation:</th>
            <td>${formatCurrency(noi)} ÷ ${formatCurrency(annualDebtService)} = <span style="color: ${dscr >= 1.25 ? 'green' : dscr >= 1.0 ? 'orange' : 'red'}">${formattedDscr}</span></td>
          </tr>
        </table>
        
        <div class="highlight" style="margin-top: 20px; background-color: ${dscr >= 1.25 ? '#d1e7dd' : dscr >= 1.0 ? '#fff3cd' : '#f8d7da'};">
          <div class="subsection-title">DSCR Status: ${dscrStatus}</div>
          <p><strong>DSCR Value:</strong> ${formattedDscr}</p>
          <p><strong>Interpretation:</strong> 
          ${dscr >= 1.25 
            ? 'Strong DSCR indicates the property generates sufficient income to cover debt payments with a comfortable margin of safety.' 
            : dscr >= 1.0 
              ? 'Acceptable DSCR indicates the property generates just enough income to cover debt payments, but has limited cushion for unexpected expenses.' 
              : 'Insufficient DSCR indicates the property does not generate enough income to cover debt payments, posing a significant risk.'
          }
          </p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">6. Financial Analysis Summary</div>
        <table class="info-table">
          <tr>
            <th>Cash Flow Before Taxes:</th>
            <td>${formatCurrency(noi - annualDebtService)}</td>
          </tr>
          <tr>
            <th>Monthly Cash Flow:</th>
            <td>${formatCurrency((noi - annualDebtService) / 12)}</td>
          </tr>
          <tr>
            <th>Cash on Cash Return:</th>
            <td>${(((noi - annualDebtService) / (propertyValue - loanData.loanAmount)) * 100).toFixed(2)}%</td>
          </tr>
          <tr>
            <th>Operating Expense Ratio:</th>
            <td>${((totalOperatingExpenses / effectiveGrossIncome) * 100).toFixed(1)}%</td>
          </tr>
          <tr>
            <th>Gross Rent Multiplier:</th>
            <td>${(propertyValue / yearlyRent).toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">7. Notes and Assumptions</div>
        <ul>
          <li>Income and expense projections are based on historical performance and market averages.</li>
          <li>Vacancy rate is estimated at ${vacancyRate}% based on local market conditions.</li>
          <li>Property management fee is calculated at ${Math.round((propertyManagement / effectiveGrossIncome) * 100)}% of effective gross income.</li>
          <li>Capital expenditure reserves are recommended at ${Math.round((capex / effectiveGrossIncome) * 100)}% of gross income for long-term maintenance.</li>
          <li>A minimum DSCR of 1.25 is typically required for investment property financing.</li>
          <li>All calculations are estimates and actual performance may vary.</li>
        </ul>
      </div>
      
      <div class="signature-section">
        <p>This DSCR calculation worksheet is for informational purposes and does not constitute a guarantee of financing approval.</p>
        <p><strong>Prepared By:</strong> ${['Robert Johnson, Underwriter', 'Sarah Williams, Loan Officer', 'Michael Thompson, Financial Analyst'][Math.floor(Math.random() * 3)]}</p>
        <div class="signature-line"></div>
        <div>Signature and Date</div>
      </div>
    </div>
  `;
};

/**
 * Property Management Agreement Template
 * Simulates a standard property management agreement for rental properties
 */
const getPropertyManagementAgreementTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  // Generate property management company information
  const managementCompanies = [
    { name: 'Elite Property Management', fee: 8 },
    { name: 'Cornerstone Real Estate Services', fee: 9 },
    { name: 'Horizon Property Solutions', fee: 10 },
    { name: 'Premier Asset Management', fee: 8.5 }
  ];
  
  const managementCompany = managementCompanies[Math.floor(Math.random() * managementCompanies.length)];
  
  // Calculate property related figures
  const propertyValue = loanData.propertyValue || loanData.purchasePrice || loanData.loanAmount;
  const monthlyRent = Math.round((propertyValue * 0.007) / 100) * 100; // Roughly 0.7% of property value
  
  // Calculate management fees
  const managementFeePercentage = managementCompany.fee;
  const monthlyManagementFee = Math.round(monthlyRent * (managementFeePercentage / 100));
  const leaseRenewalFee = monthlyRent * 0.5;
  const newTenantPlacementFee = monthlyRent;
  const maintenanceMarkupPercentage = 10;
  const maintenanceMinimumCharge = 50;
  const evictionAdminFee = 250;
  
  // Determine term
  const initialTerm = 12; // 12 months
  const agreementStartDate = formattedDate;
  const agreementEndDate = getFutureDate(initialTerm);
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">Property Management Agreement</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="parties">
          <div class="party-box">
            <div class="subsection-title">Owner:</div>
            <p>
              <strong>${loanData.borrowerName}</strong><br>
              ${loanData.borrowerAddress || '123 Owner Street, Anytown, USA 12345'}<br>
              Phone: ${loanData.borrowerPhone || '(555) 123-4567'}<br>
              Email: ${loanData.borrowerEmail}
            </p>
          </div>
          <div class="party-box">
            <div class="subsection-title">Property Manager:</div>
            <p>
              <strong>${managementCompany.name}</strong><br>
              123 Management Blvd, Suite 200<br>
              ${loanData.propertyAddress.split(',').slice(1).join(',').trim()}<br>
              Phone: (555) 987-6543<br>
              Email: info@${managementCompany.name.toLowerCase().replace(/\s+/g, '')}pm.com<br>
              License #: PM-${Math.floor(100000 + Math.random() * 900000)}
            </p>
          </div>
        </div>
        
        <p>This Property Management Agreement ("Agreement") is made and entered into on <strong>${formattedDate}</strong>, by and between the Owner and Property Manager ("Manager") identified above.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">1. Property</div>
        <p>Owner hereby employs Manager to manage, operate, and lease the following property ("Property"):</p>
        <div class="provision">
          <strong>${loanData.propertyAddress}</strong><br>
          Property Type: ${loanData.propertyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}<br>
          ${loanData.bedrooms ? `Bedrooms: ${loanData.bedrooms}` : ''}
          ${loanData.bathrooms ? ` | Bathrooms: ${loanData.bathrooms}` : ''}
          ${loanData.squareFootage ? ` | Square Footage: ${loanData.squareFootage}` : ''}
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Owner</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Manager</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">2. Term</div>
        <p>This Agreement begins on <strong>${agreementStartDate}</strong> and ends on <strong>${agreementEndDate}</strong> (the "Initial Term").</p>
        
        <div class="clause">
          <div class="clause-title">Renewal:</div>
          <p>After the Initial Term, this Agreement shall automatically renew for successive one-year periods unless either party provides written notice of non-renewal at least 30 days before the end of the current term.</p>
        </div>
        
        <div class="clause">
          <div class="clause-title">Termination:</div>
          <p>Either party may terminate this Agreement with 30 days' written notice. If Owner terminates this Agreement before the end of the Initial Term, Owner shall pay an early termination fee equal to one month's management fee.</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Owner</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Manager</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">3. Manager's Responsibilities</div>
        <p>Manager agrees to perform the following services:</p>
        <ol>
          <li><strong>Leasing Services:</strong> Advertise the Property, screen prospective tenants, execute leases on Owner's behalf, collect security deposits, and conduct move-in inspections.</li>
          
          <li><strong>Rent Collection:</strong> Collect rent and other charges from tenants, deposit funds in a trust account, and disburse funds to Owner monthly less approved expenses.</li>
          
          <li><strong>Maintenance:</strong> Arrange for necessary repairs and maintenance, with approval from Owner for expenses exceeding ${formatCurrency(500)}.</li>
          
          <li><strong>Financial Reporting:</strong> Provide monthly statements detailing income and expenses, and year-end summaries for tax purposes.</li>
          
          <li><strong>Legal Compliance:</strong> Ensure compliance with applicable landlord-tenant laws, fair housing laws, and local ordinances.</li>
          
          <li><strong>Inspections:</strong> Conduct periodic property inspections and provide written reports to Owner.</li>
          
          <li><strong>Tenant Relations:</strong> Handle tenant inquiries, complaints, and requests for maintenance.</li>
          
          <li><strong>Lease Enforcement:</strong> Enforce lease terms, including collection of late rent, lease violations, and eviction proceedings when necessary.</li>
        </ol>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Owner</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Manager</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">4. Compensation</div>
        <p>Owner agrees to pay Manager the following fees:</p>
        
        <table class="info-table">
          <tr>
            <th>Monthly Management Fee:</th>
            <td>${managementFeePercentage}% of gross monthly rent (minimum ${formatCurrency(monthlyManagementFee)})</td>
          </tr>
          <tr>
            <th>Leasing Fee (New Tenant):</th>
            <td>${formatCurrency(newTenantPlacementFee)} (equal to one month's rent)</td>
          </tr>
          <tr>
            <th>Lease Renewal Fee:</th>
            <td>${formatCurrency(leaseRenewalFee)} (equal to 50% of one month's rent)</td>
          </tr>
          <tr>
            <th>Maintenance Markup:</th>
            <td>${maintenanceMarkupPercentage}% on vendor invoices (minimum charge of ${formatCurrency(maintenanceMinimumCharge)})</td>
          </tr>
          <tr>
            <th>Eviction Administration:</th>
            <td>${formatCurrency(evictionAdminFee)} plus actual costs</td>
          </tr>
        </table>
        
        <div class="highlight">
          <p>Manager is authorized to deduct all fees and expenses from Owner's funds on hand before disbursement to Owner. If funds are insufficient, Owner agrees to remit the balance due within 15 days of notice.</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Owner</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Manager</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">5. Owner's Responsibilities</div>
        <ol>
          <li><strong>Reserve Fund:</strong> Owner shall maintain a minimum reserve fund of ${formatCurrency(monthlyRent)} for repairs and emergencies.</li>
          
          <li><strong>Insurance:</strong> Owner shall maintain property and liability insurance in the minimum amount of ${formatCurrency(propertyValue)} and name Manager as an additional insured.</li>
          
          <li><strong>Compliance:</strong> Owner shall comply with all applicable building, housing, and health codes, and maintain the Property in a habitable condition.</li>
          
          <li><strong>Hold Harmless:</strong> Owner shall indemnify and hold Manager harmless from all claims, costs, expenses, suits, and damages related to the Property that are not the result of Manager's negligence or willful misconduct.</li>
          
          <li><strong>Tax and Mortgage Payments:</strong> Owner shall remain responsible for paying all mortgage, tax, and insurance obligations.</li>
        </ol>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Owner</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Manager</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">6. Trust Accounts</div>
        <p>All funds collected by Manager shall be deposited in a trust account at ${['First National Bank', 'Community Trust Bank', 'Heritage Savings & Loan'][Math.floor(Math.random() * 3)]}. Owner acknowledges that trust accounts may be interest-bearing and that Manager may retain any interest earned.</p>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Owner</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Manager</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">7. Lead-Based Paint Disclosure</div>
        <div class="provision">
          <p>If the Property was built before 1978, Owner shall:</p>
          <p>[ ] Complete a lead-based paint disclosure form<br>
          [ ] Provide any available lead-based paint reports<br>
          [ ] Not applicable - property was built in ${loanData.yearBuilt || 'year after 1978'}</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Owner</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Manager</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">8. Additional Terms and Conditions</div>
        <div class="clause">
          <p>1. This Agreement constitutes the entire agreement between the parties and supersedes all prior agreements or understandings.</p>
          <p>2. This Agreement may only be modified in writing signed by both parties.</p>
          <p>3. This Agreement shall be governed by the laws of the state where the Property is located.</p>
          <p>4. If any provision of this Agreement is deemed invalid, the remaining provisions shall remain in effect.</p>
          <p>5. All notices shall be in writing and delivered by certified mail, email with confirmation, or hand delivery.</p>
        </div>
        
        <div class="highlight">
          <p>IN WITNESS WHEREOF, the parties hereto have executed this Agreement on the date first written above.</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Owner</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Manager</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="signature-section">
          <div class="signature-line"></div>
          <div>Owner Signature and Date</div>
          
          <div style="margin-top: 40px;">
            <div class="signature-line"></div>
            <div>Property Manager Signature and Date</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Export templates
export {
  getLeaseAgreementTemplate,
  getDscrCalculationWorksheetTemplate,
  getPropertyManagementAgreementTemplate
};
