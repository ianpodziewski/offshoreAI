import { LoanData } from '../loanGenerator';

/**
 * Property Information Templates
 * Returns HTML strings for property-related document types
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

// Generate future date
const getFutureDate = (daysInFuture: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysInFuture);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Generate a random array of additional contract provisions
const getRandomProvisions = (): string[] => {
  const allProvisions = [
    "Seller to provide home warranty for first year of ownership.",
    "Buyer permitted to conduct additional inspections prior to closing.",
    "Appliances included: refrigerator, washer, dryer, dishwasher, and microwave.",
    "Seller to make agreed-upon repairs prior to closing, not to exceed $5,000.",
    "Final walkthrough to be conducted 24-48 hours prior to closing.",
    "Buyer responsible for all transfer taxes and recording fees.",
    "Closing costs to be split equally between buyer and seller.",
    "Sale contingent upon buyer's ability to secure financing within 30 days.",
    "Earnest money to be held in escrow by title company.",
    "Property sold in 'as-is' condition.",
    "Seller to provide clear title free of all liens and encumbrances.",
    "Sale includes all existing window treatments and light fixtures.",
    "Buyer to assume responsibility for HOA fees from date of closing.",
    "Furnishings negotiable under separate bill of sale.",
    "Existing leases to be transferred to buyer at closing."
  ];
  
  // Randomly select 4-7 provisions
  const shuffled = [...allProvisions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 4 + Math.floor(Math.random() * 4));
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
  p {
    line-height: 1.5;
    margin-bottom: 15px;
  }
  ul, ol {
    margin-bottom: 15px;
  }
  li {
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
  .signature-container {
    display: flex;
    justify-content: space-between;
    margin-top: 50px;
  }
  .signature-box {
    width: 45%;
  }
  .date-box {
    margin-top: 10px;
    font-size: 14px;
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
  .fine-print {
    font-size: 12px;
    color: #666;
  }
</style>`;

/**
 * Purchase Contract Template
 * Simulates a real estate purchase agreement between buyer and seller
 */
const getPurchaseContractTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const closingDate = getFutureDate(45); // 45 days in the future
  const inspectionDate = getFutureDate(14); // 14 days in the future
  const randomProvisions = getRandomProvisions();
  
  // Generate seller information (could be expanded to use more loanData if available)
  const sellerName = `${['John & Mary', 'Robert & Susan', 'William & Elizabeth', 'James & Patricia'][Math.floor(Math.random() * 4)]} ${['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'][Math.floor(Math.random() * 8)]}`;
  
  // Property price calculation
  const propertyPrice = loanData.propertyValue || loanData.loanAmount * (100 / (70 + Math.floor(Math.random() * 15)));
  const earnestMoney = Math.round(propertyPrice * 0.03);
  const downPayment = Math.round(propertyPrice * 0.2) - earnestMoney;
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">Real Estate Purchase Contract</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="parties">
          <div class="party-box">
            <div class="subsection-title">Buyer:</div>
            <p>
              <strong>${loanData.borrowerName}</strong><br>
              ${loanData.borrowerAddress || 'Current Address: 123 Main Street, Anytown, USA 12345'}<br>
              Phone: (555) 123-4567<br>
              Email: ${loanData.borrowerName.toLowerCase().replace(/\s/g, '.')}@email.com
            </p>
          </div>
          <div class="party-box">
            <div class="subsection-title">Seller:</div>
            <p>
              <strong>${sellerName}</strong><br>
              ${loanData.propertyAddress}<br>
              Phone: (555) 987-6543<br>
              Email: ${sellerName.toLowerCase().split('&')[0].trim().replace(/\s/g, '.')}@email.com
            </p>
          </div>
        </div>
        
        <p>THIS AGREEMENT made on ${formattedDate} between <strong>${sellerName}</strong> (hereinafter called "Seller") and <strong>${loanData.borrowerName}</strong> (hereinafter called "Buyer").</p>
        
        <p>WITNESSETH: That Seller and Buyer, for the consideration herein mentioned, agree as follows:</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">1. Property Description</div>
        <p>The Seller agrees to sell and the Buyer agrees to buy the property located at:</p>
        <div class="provision">
          <strong>${loanData.propertyAddress}</strong><br>
          Legal Description: Lot ${Math.floor(Math.random() * 50) + 1}, Block ${Math.floor(Math.random() * 20) + 1}, ${loanData.propertyAddress.split(',')[0]} Subdivision, according to the plat thereof, recorded in Plat Book ${Math.floor(Math.random() * 100) + 1}, Page ${Math.floor(Math.random() * 100) + 1}, of the Public Records of ${loanData.propertyAddress.split(',')[1]?.trim() || 'County'}.
        </div>
        
        <p>Together with all fixtures and improvements thereon and all appurtenances thereto, including but not limited to: built-in appliances, ceiling fans, light fixtures, window treatments, attached floor coverings, television antennas, satellite dishes, mailboxes, permanently installed outdoor cooking equipment, all landscaping, and all security systems (collectively the "Property").</p>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Buyer's Initials</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Seller's Initials</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">2. Purchase Price and Financing</div>
        <table class="info-table">
          <tr>
            <th>Purchase Price:</th>
            <td>${formatCurrency(propertyPrice)}</td>
          </tr>
          <tr>
            <th>Earnest Money Deposit:</th>
            <td>${formatCurrency(earnestMoney)}</td>
          </tr>
          <tr>
            <th>Additional Deposit Due:</th>
            <td>${formatCurrency(downPayment)} due within 7 days of acceptance</td>
          </tr>
          <tr>
            <th>New Mortgage Financing:</th>
            <td>${formatCurrency(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Closing Costs Paid by Seller:</th>
            <td>${formatCurrency(Math.round(propertyPrice * 0.02))}</td>
          </tr>
          <tr>
            <th>Balance Due at Closing:</th>
            <td>${formatCurrency(propertyPrice - earnestMoney - downPayment)}</td>
          </tr>
        </table>
        
        <div class="clause">
          <div class="clause-title">Financing Contingency:</div>
          <p>This contract is contingent upon Buyer obtaining mortgage financing for ${formatCurrency(loanData.loanAmount)} at a rate not to exceed ${loanData.interestRate + 0.5}% for a term of ${loanData.loanTerm} months. Buyer agrees to make a good faith application for mortgage financing within 5 days of the effective date of this Contract and to proceed diligently to obtain such financing.</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Buyer's Initials</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Seller's Initials</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">3. Closing Date and Possession</div>
        <div class="clause">
          <p>The closing of this sale shall be held at the offices of a title company of Buyer's choosing on or before <strong>${closingDate}</strong>, or within 5 days of loan approval, whichever is later.</p>
          <p>Possession of the Property shall be delivered to Buyer at closing.</p>
          <p>The Seller shall deliver the Property in the same condition as it was on the date of acceptance, ordinary wear and tear excepted, and shall maintain the landscaping and grounds prior to closing.</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Buyer's Initials</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Seller's Initials</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">4. Inspections and Due Diligence</div>
        <div class="clause">
          <p>Buyer shall have until <strong>${inspectionDate}</strong> (the "Inspection Period") to have the Property inspected by one or more properly licensed or otherwise qualified professionals to determine if there are any defects in the following:</p>
          <ul>
            <li>Roof and structural components</li>
            <li>Electrical, plumbing, heating, and air conditioning systems</li>
            <li>Built-in appliances</li>
            <li>Foundation</li>
            <li>Presence of toxic or hazardous substances</li>
            <li>Presence of termites or other wood-destroying organisms</li>
          </ul>
          <p>If the inspections reveal any defects in the above items, Buyer shall notify Seller in writing of such defects before the expiration of the Inspection Period. Buyer's failure to notify Seller within the Inspection Period shall constitute a waiver of Buyer's right to request repairs or credits.</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Buyer's Initials</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Seller's Initials</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">5. Title and Survey</div>
        <div class="clause">
          <p>Within 15 days from the effective date, Seller shall furnish to Buyer a commitment for title insurance policy, including legible copies of all documents constituting exceptions to the title commitment.</p>
          <p>Buyer may, at Buyer's expense, obtain a boundary survey of the Property. If the survey shows a material encroachment on the Property or that improvements located on the Property encroach on the lands of others, such encroachments shall constitute a title defect.</p>
          <p>Seller shall convey marketable title to the Property by warranty deed free of claims, liens, easements and encumbrances of record or known to Seller, but subject to property taxes for the year of closing; zoning and land use restrictions; deed restrictions and homeowner association restrictions; existing utility easements; and other customary exceptions to title.</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Buyer's Initials</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Seller's Initials</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">6. Additional Provisions</div>
        ${randomProvisions.map(provision => `<div class="provision">${provision}</div>`).join('')}
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Buyer's Initials</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Seller's Initials</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">7. Default</div>
        <div class="clause">
          <p>If Buyer defaults under this Contract, all deposits paid by Buyer may be retained by Seller as agreed upon liquidated damages, consideration for the execution of this Contract, and in full settlement of any claims.</p>
          <p>If Seller defaults under this Contract, Buyer may either: (a) seek specific performance or (b) terminate the Contract and receive a full refund of all deposits paid.</p>
        </div>
        
        <div class="initials-section">
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Buyer's Initials</div>
          </div>
          <div class="initials-box">
            <div class="initials-line"></div>
            <div>Seller's Initials</div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="fine-print">
          <p>This is a legally binding contract. If not understood, seek the advice of an attorney before signing. This is intended to be a legally binding contract. All terms and conditions apply. Changes must be made in writing with signatures from all parties.</p>
        </div>
        
        <div class="signature-container">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div>${loanData.borrowerName}</div>
            <div class="date-box">Date: _______________</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div>${sellerName}</div>
            <div class="date-box">Date: _______________</div>
          </div>
        </div>
      </div>
      
    </div>
  `;
};

/**
 * Preliminary Title Report Template
 * Simulates a title company's preliminary report on property ownership and encumbrances
 */
const getPreliminaryTitleReportTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const reportNumber = `TR-${Math.floor(100000 + Math.random() * 900000)}`;
  const effectiveDate = formattedDate;
  const reportDate = formattedDate;
  
  // Generate property legal description
  const lot = Math.floor(Math.random() * 50) + 1;
  const block = Math.floor(Math.random() * 20) + 1;
  const subdivision = loanData.propertyAddress.split(',')[0];
  const county = loanData.propertyAddress.split(',')[1]?.trim().split(' ')[0] || 'County';
  const state = loanData.propertyAddress.split(',')[2]?.trim().split(' ')[0] || 'State';
  
  // Generate random property vesting (based on entity type if available)
  const vestingType = loanData.entityType || (Math.random() > 0.5 ? 'individual' : 'joint');
  let vesting = '';
  
  if (loanData.entityName) {
    vesting = `${loanData.entityName}, a ${loanData.entityType || 'Limited Liability Company'}`;
  } else if (vestingType === 'joint') {
    // Assume borrower name has first and last name
    const nameParts = loanData.borrowerName.split(' ');
    if (nameParts.length >= 2) {
      const lastName = nameParts[nameParts.length - 1];
      const firstName = nameParts[0];
      vesting = `${loanData.borrowerName} and Jane ${lastName}, husband and wife, as joint tenants`;
    } else {
      vesting = `${loanData.borrowerName} and Jane Doe, as joint tenants`;
    }
  } else {
    vesting = `${loanData.borrowerName}, a single person`;
  }
  
  // Generate random encumbrances and exceptions
  const generateRandomEncumbrances = (): string[] => {
    const possibleEncumbrances = [
      `Deed of Trust recorded ${new Date(new Date().setMonth(new Date().getMonth() - Math.floor(Math.random() * 24))).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})} as Instrument No. ${Math.floor(1000000 + Math.random() * 9000000)}, in favor of ${['First National Bank', 'Oceanside Mortgage Company', 'Capital Trust Lenders', 'Heritage Bank & Trust'][Math.floor(Math.random() * 4)]}, securing a note for ${formatCurrency(Math.floor((50000 + Math.random() * 150000) / 1000) * 1000)}.`,
      `Easement for public utilities recorded in Book ${Math.floor(1000 + Math.random() * 9000)}, Page ${Math.floor(100 + Math.random() * 900)}.`,
      `Covenants, conditions and restrictions recorded in Book ${Math.floor(1000 + Math.random() * 9000)}, Page ${Math.floor(100 + Math.random() * 900)}, but omitting any covenant or restriction based on race, color, religion, sex, handicap, familial status, or national origin.`,
      `Mineral rights reserved in deed recorded ${new Date(new Date().setFullYear(new Date().getFullYear() - Math.floor(20 + Math.random() * 50))).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}.`,
      `Homeowner's Association Declaration recorded in Book ${Math.floor(1000 + Math.random() * 9000)}, Page ${Math.floor(100 + Math.random() * 900)}.`,
      `Survey exceptions as shown on ALTA survey prepared by ${['Acme Surveying', 'Precision Land Surveys, Inc.', 'Landmark Survey Group', 'Atlas Boundary Consultants'][Math.floor(Math.random() * 4)]}, dated ${new Date(new Date().setMonth(new Date().getMonth() - Math.floor(1 + Math.random() * 6))).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}.`,
      `Unpaid property taxes for the fiscal year ${new Date().getFullYear()}-${new Date().getFullYear() + 1} in the amount of ${formatCurrency(Math.floor((1000 + Math.random() * 5000) / 100) * 100)}.`,
      `Rights of tenants in possession under unrecorded leases.`,
      `Water rights, claims or title to water, whether or not shown by the public records.`,
      `Encroachments, overlaps, boundary line disputes, and any other matters which would be disclosed by an accurate survey and inspection of the premises.`
    ];
    
    // Select a random number of encumbrances (2-5)
    const count = 2 + Math.floor(Math.random() * 4);
    const shuffled = [...possibleEncumbrances].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  const encumbrances = generateRandomEncumbrances();
  
  // Random title company
  const titleCompany = ['First American Title Insurance Company', 'Fidelity National Title', 'Old Republic Title', 'Stewart Title Guaranty Company', 'Chicago Title Insurance Company'][Math.floor(Math.random() * 5)];
  
  // Assessor's Parcel Number (APN)
  const apn = `${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(10 + Math.random() * 90)}`;
  
  return `${baseStyle}
    <div class="document">
      <div class="document-header">
        <div class="document-title">Preliminary Title Report</div>
        <div class="document-subtitle">${titleCompany}</div>
      </div>
      
      <div class="document-section">
        <table class="info-table">
          <tr>
            <th>Order Number:</th>
            <td>${reportNumber}</td>
          </tr>
          <tr>
            <th>Report Date:</th>
            <td>${reportDate}</td>
          </tr>
          <tr>
            <th>Effective Date:</th>
            <td>${effectiveDate} at 7:30 AM</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Assessor's Parcel Number:</th>
            <td>${apn}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <p>At the request of ${loanData.borrowerName}, this report is issued for the purpose of facilitating the issuance of a policy of title insurance and no liability is assumed hereby.</p>
        
        <p>Our examination of the record title to the real property described below, conducted through ${effectiveDate} at 7:30 AM, reveals that the title to said real property is vested in:</p>
        
        <div class="provision">
          <strong>${vesting}</strong>
        </div>
        
        <p>Subject to the exceptions shown in Schedule B and to the terms, conditions and provisions of this report.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Schedule A – Legal Description</div>
        <p>The land referred to herein is situated in the County of ${county}, State of ${state}, and is described as follows:</p>
        
        <div class="provision">
          Lot ${lot}, Block ${block}, ${subdivision} Subdivision, according to the plat thereof, recorded in Plat Book ${Math.floor(Math.random() * 100) + 1}, Page ${Math.floor(Math.random() * 100) + 1}, of the Public Records of ${county} County, ${state}.
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Schedule B – Exceptions</div>
        <p>At the date hereof, exceptions to coverage in addition to the printed Exceptions and Exclusions in the policy form would be as follows:</p>
        
        <ol>
          <li>General and special taxes and assessments for the fiscal year ${new Date().getFullYear()}-${new Date().getFullYear() + 1}, a lien not yet due or payable.</li>
          
          <li>Supplemental taxes that may be assessed due to a change in ownership or completion of new construction occurring prior to date of policy.</li>
          
          ${encumbrances.map((item, index) => `<li>${item}</li>`).join('')}
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">Notes and Requirements</div>
        
        <div class="subsection-title">Notes:</div>
        <ol>
          <li>Property taxes for the current fiscal year are PAID/OPEN, and are as follows:
            <div class="fine-print">
              <div>1st Installment: ${formatCurrency(Math.floor((1000 + Math.random() * 3000) / 100) * 100)} DUE: December 10, ${new Date().getFullYear()}</div>
              <div>2nd Installment: ${formatCurrency(Math.floor((1000 + Math.random() * 3000) / 100) * 100)} DUE: April 10, ${new Date().getFullYear() + 1}</div>
              <div>Exemption: ${formatCurrency(Math.floor(Math.random() * 7000) / 100 * 100)}</div>
            </div>
          </li>
          
          <li>The property address and/or assessor's parcel number shown above are for informational purposes only and are not guaranteed to be accurate or complete.</li>
          
          <li>There were no open deeds of trust found of record. If you should have knowledge of any outstanding obligation, please contact the Title Department immediately for further review prior to closing.</li>
          
          <li>For informational purposes: the property appears to be a single-family residence based on tax assessor records.</li>
        </ol>
        
        <div class="subsection-title">Requirements:</div>
        <ol>
          <li>This Company will require a Statement of Information from all parties in order to complete this report, provide title insurance coverage, and close this transaction. The appropriate Statement of Information forms are attached.</li>
          
          <li>The Company will require a copy of the Articles of Organization, Operating Agreement, and a current list of members for ${loanData.entityName || 'the borrowing entity'} in order to confirm who is authorized to sign documents on behalf of the limited liability company.</li>
          
          <li>In order to close this transaction, this Company will require recordation of a deed from the current owner(s) to the proposed insured. Please provide the proper deed for recordation.</li>
          
          <li>Based on the information provided, we require an ALTA survey be ordered. A survey endorsement will be issued upon receipt and approval of the survey.</li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">Closing Information</div>
        <p>According to the public records, there has been no conveyance of the land within a period of ${Math.floor(1 + Math.random() * 5)} years prior to the date of this report, except as follows:</p>
        
        <div class="provision">
          Grant Deed from ${['Robert & Susan Johnson', 'William & Patricia Davis', 'Thomas & Jennifer Brown', 'Michael & Elizabeth Miller'][Math.floor(Math.random() * 4)]} to ${vesting} recorded ${new Date(new Date().setMonth(new Date().getMonth() - Math.floor(6 + Math.random() * 24))).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})} as Instrument No. ${Math.floor(1000000 + Math.random() * 9000000)}.
        </div>
        
        <p>The contemplated transaction is a ${loanData.loanPurpose === 'purchase' ? 'purchase' : 'refinance'} for a total consideration of ${formatCurrency(loanData.loanAmount)}.</p>
      </div>
      
      <div class="document-section">
        <div class="fine-print">
          <p>NOTICE: This is a PRO-FORMA Report. It does not reflect the present state of the Title and is not a commitment to insure the estate or interest as shown herein. Any agreements to insure pursuant to this Pro-Forma Report will only become effective when all requirements to issue the policy have been satisfied.</p>
          
          <p>Prior to the issuance of any policy of title insurance, ${titleCompany} requires evidence of compliance with all conditions precedent in any pending transactions. This preliminary report is not a written representation as to the condition of title and may not list all liens, defects, and encumbrances affecting title to the land.</p>
        </div>
        
        <div class="signature-section">
          <p>${titleCompany}</p>
          <div class="signature-line"></div>
          <div>By: ${['John A. Thompson', 'Sarah B. Reynolds', 'Michael C. Anderson', 'Elizabeth D. Wilson'][Math.floor(Math.random() * 4)]}, Authorized Signatory</div>
        </div>
      </div>
    </div>
  `;
};

// Export all templates
export {
  getPurchaseContractTemplate,
  getPreliminaryTitleReportTemplate
};
