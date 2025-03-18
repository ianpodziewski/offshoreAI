import { LoanData } from '../loanGenerator';

/**
 * Compliance Documents Templates
 * Contains templates for regulatory compliance documents
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
  .warning {
    background-color: #fff3f3;
    border-left: 4px solid #dc3545;
    padding: 15px;
    margin: 20px 0;
  }
  .checkbox-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 10px;
  }
  .checkbox {
    min-width: 18px;
    height: 18px;
    border: 1px solid #aaa;
    display: inline-block;
    position: relative;
    margin-right: 10px;
    margin-top: 2px;
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
  .form-field {
    border-bottom: 1px solid #999;
    margin: 0 5px;
    padding: 0 5px;
    min-width: 100px;
    display: inline-block;
  }
  .footer {
    margin-top: 50px;
    font-size: 12px;
    color: #666;
    border-top: 1px solid #ddd;
    padding-top: 20px;
  }
  .compliance-box {
    border: 2px solid #3a5a97;
    padding: 15px;
    margin: 15px 0;
    border-radius: 5px;
  }
  .checklist {
    list-style-type: none;
    padding-left: 0;
  }
  .checklist li {
    margin-bottom: 12px;
    padding-left: 30px;
    position: relative;
  }
  .checklist li:before {
    content: "";
    position: absolute;
    left: 0;
    top: 2px;
    width: 18px;
    height: 18px;
    border: 1px solid #aaa;
    background: #fff;
  }
  .checklist li.checked:before {
    content: "✓";
    text-align: center;
    font-weight: bold;
    color: #3a5a97;
    line-height: 18px;
  }
  .grid-table {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-bottom: 20px;
  }
  .grid-item {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 5px;
  }
  .grid-item h4 {
    margin-top: 0;
    border-bottom: 1px solid #ddd;
    padding-bottom: 5px;
    margin-bottom: 10px;
  }
</style>`;

/**
 * Anti-Money Laundering (AML) Documentation Template
 * Comprehensive AML form for customer due diligence
 */
export const getAntiMoneyLaunderingDocTemplate = (loanData: LoanData): string => {
  const currentDate = formatDate();
  const documentId = `AML-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Generate risk assessment based on loan details
  const calculateRiskLevel = (): { level: string, score: number, factors: string[] } => {
    let riskScore = 0;
    const riskFactors: string[] = [];
    
    // Loan amount factors
    if (loanData.loanAmount > 1000000) {
      riskScore += 3;
      riskFactors.push("Loan amount exceeds $1,000,000");
    } else if (loanData.loanAmount > 500000) {
      riskScore += 2;
      riskFactors.push("Loan amount between $500,000 and $1,000,000");
    } else {
      riskScore += 1;
    }
    
    // Entity type factors
    if (loanData.entityType === "LLC" || loanData.entityType === "Corporation") {
      riskScore += 1;
      if (loanData.entityType === "LLC") {
        riskFactors.push("Entity structured as LLC");
      } else {
        riskFactors.push("Entity structured as Corporation");
      }
    }
    
    // Cash reserves factors
    if (loanData.cashReserves && loanData.cashReserves < 6) {
      riskScore += 1;
      riskFactors.push("Limited cash reserves (less than 6 months)");
    }
    
    // Credit score factors
    if (loanData.creditScore && loanData.creditScore < 650) {
      riskScore += 2;
      riskFactors.push("Credit score below 650");
    }
    
    // Property type factors
    if (["commercial", "mixed_use", "multi_family_5plus"].includes(loanData.propertyType)) {
      riskScore += 1;
      riskFactors.push("Commercial or large multi-family property");
    }
    
    // Loan type factors
    if (loanData.loanType === "construction") {
      riskScore += 2;
      riskFactors.push("Construction loan with multiple disbursements");
    }
    
    // Determine risk level
    let riskLevel = "Low";
    if (riskScore >= 7) {
      riskLevel = "High";
    } else if (riskScore >= 4) {
      riskLevel = "Medium";
    }
    
    return { 
      level: riskLevel, 
      score: riskScore,
      factors: riskFactors.length > 0 ? riskFactors : ["Standard transaction risk"]
    };
  };
  
  // Calculate risk assessment
  const riskAssessment = calculateRiskLevel();
  const riskLevelStyle = riskAssessment.level === "High" ? "color: #dc3545; font-weight: bold" : 
                        (riskAssessment.level === "Medium" ? "color: #fd7e14; font-weight: bold" : 
                        "color: #28a745; font-weight: bold");
  
  // Identify document requirements based on risk level
  const requiredDocuments = [
    { name: "Government-issued photo ID", required: true },
    { name: "Proof of address (utility bill, bank statement)", required: true },
    { name: "Business formation documents", required: loanData.entityType !== undefined },
    { name: "Verification of source of funds", required: true },
    { name: "Bank statements (previous 3 months)", required: true },
    { name: "Complete organizational chart (for entities)", required: loanData.entityType !== undefined },
    { name: "Certificate of Good Standing", required: loanData.entityType !== undefined },
    { name: "Personal/Business tax returns", required: true },
    { name: "Beneficial ownership certification", required: loanData.entityType !== undefined },
    { name: "Enhanced due diligence questionnaire", required: riskAssessment.level === "High" },
    { name: "Third-party verification of funds", required: riskAssessment.level === "High" },
    { name: "Letter of explanation for large deposits", required: riskAssessment.level === "High" || riskAssessment.level === "Medium" }
  ];
  
  // Generate officer information
  const complianceOfficers = [
    { name: "Patricia Alvarez", title: "BSA/AML Compliance Officer", phone: "(555) 789-0123", email: "palvarez@harringtoncapital.com" },
    { name: "Daniel Kim", title: "Sr. Compliance Manager", phone: "(555) 234-5678", email: "dkim@harringtoncapital.com" },
    { name: "Rebecca Washington", title: "Compliance Director", phone: "(555) 345-6789", email: "rwashington@harringtoncapital.com" }
  ];
  
  const complianceOfficer = complianceOfficers[Math.floor(Math.random() * complianceOfficers.length)];
  
  return `${baseStyle}
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
        <div class="document-title">Anti-Money Laundering (AML) Documentation</div>
        <div class="document-subtitle">Customer Due Diligence Form | ID: ${documentId}</div>
      </div>
      
      <div class="notice">
        <p><strong>IMPORTANT:</strong> This form is required to comply with the Bank Secrecy Act (BSA), USA PATRIOT Act, and related anti-money laundering regulations. Harrington Capital Partners is required to obtain, verify, and record information that identifies each borrower.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">1. Customer Information</div>
        <table class="info-table">
          <tr>
            <th>Borrower/Entity Name:</th>
            <td>${loanData.entityName || loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Entity Type (if applicable):</th>
            <td>${loanData.entityType || "N/A"}</td>
          </tr>
          <tr>
            <th>EIN/SSN:</th>
            <td>${loanData.ein || "To be provided separately"}</td>
          </tr>
          <tr>
            <th>Primary Contact:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Contact Phone Number:</th>
            <td>${loanData.borrowerPhone || "Not provided"}</td>
          </tr>
          <tr>
            <th>Contact Email:</th>
            <td>${loanData.borrowerEmail}</td>
          </tr>
          <tr>
            <th>Physical Address:</th>
            <td>${loanData.borrowerAddress || "To be provided"}</td>
          </tr>
          <tr>
            <th>Date of Formation/Birth:</th>
            <td>${loanData.yearEstablished ? loanData.yearEstablished.toString() : "To be provided"}</td>
          </tr>
          <tr>
            <th>State of Formation/ID Issuance:</th>
            <td>${loanData.stateOfFormation || loanData.state || "To be provided"}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">2. Transaction Information</div>
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
            <th>Property Type:</th>
            <td>${loanData.propertyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Loan Purpose:</th>
            <td>${loanData.loanPurpose || 'Real Estate Investment'}</td>
          </tr>
          <tr>
            <th>Source of Down Payment:</th>
            <td>To be provided by borrower</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">3. Beneficial Ownership Information</div>
        
        <div class="subsection-title">3.1 Individual Applicant or Control Person</div>
        <p>Please identify the natural person who directly or indirectly, through any contract, arrangement, understanding, relationship or otherwise, owns 25% or more of the equity interests of the legal entity listed above.</p>
        
        <div class="compliance-box">
          <p>For individual borrowers, please complete the following:</p>
          <table class="info-table">
            <tr>
              <th>Full Legal Name:</th>
              <td>${loanData.borrowerName}</td>
            </tr>
            <tr>
              <th>Date of Birth:</th>
              <td>__________________</td>
            </tr>
            <tr>
              <th>Address:</th>
              <td>${loanData.borrowerAddress || '__________________'}</td>
            </tr>
            <tr>
              <th>ID Type & Number:</th>
              <td>□ Driver's License  □ Passport  □ Other:_________<br>
              Number: __________________</td>
            </tr>
            <tr>
              <th>ID Issuing Authority:</th>
              <td>__________________</td>
            </tr>
            <tr>
              <th>ID Issue Date:</th>
              <td>__________________</td>
            </tr>
            <tr>
              <th>ID Expiration Date:</th>
              <td>__________________</td>
            </tr>
          </table>
        </div>
        
        <div class="subsection-title">3.2 Entity Ownership (if applicable)</div>
        <p>For entity borrowers, please identify the beneficial owners (each individual who owns 25% or more of the entity) and one individual with significant responsibility for managing the entity (e.g., CEO, Managing Member, General Partner).</p>
        
        ${loanData.entityType ? `
        <div class="compliance-box">
          <h4>Beneficial Owner 1:</h4>
          <table class="info-table">
            <tr>
              <th>Full Legal Name:</th>
              <td>__________________</td>
            </tr>
            <tr>
              <th>Title:</th>
              <td>__________________</td>
            </tr>
            <tr>
              <th>Ownership Percentage:</th>
              <td>__________________</td>
            </tr>
            <tr>
              <th>Date of Birth:</th>
              <td>__________________</td>
            </tr>
            <tr>
              <th>Address:</th>
              <td>__________________</td>
            </tr>
            <tr>
              <th>ID Information:</th>
              <td>Type: __________________ Number: __________________</td>
            </tr>
          </table>
          
          <p style="margin-top: 20px;">Additional beneficial owners should be listed on the attached Beneficial Ownership Form.</p>
        </div>
        ` : '<p>Not applicable - individual borrower</p>'}
      </div>
      
      <div class="document-section">
        <div class="section-title">4. Customer Due Diligence</div>
        <p>Please answer the following questions to the best of your knowledge:</p>
        
        <ol class="checklist">
          <li>Is the borrower or any beneficial owner a politically exposed person (PEP), a family member of a PEP, or a close associate of a PEP?
            <div style="margin-top: 5px;">
              □ Yes  □ No
              <div style="margin-top: 5px; margin-left: 20px;">
                If yes, please provide details: _______________________________________________
              </div>
            </div>
          </li>
          
          <li>Is the borrower or any beneficial owner a non-U.S. person?
            <div style="margin-top: 5px;">
              □ Yes  □ No
              <div style="margin-top: 5px; margin-left: 20px;">
                If yes, specify country of citizenship: ________________________________________
              </div>
            </div>
          </li>
          
          <li>Does the borrower or any beneficial owner have a significant presence in a high-risk jurisdiction?
            <div style="margin-top: 5px;">
              □ Yes  □ No
              <div style="margin-top: 5px; margin-left: 20px;">
                If yes, specify country: ____________________________________________________
              </div>
            </div>
          </li>
          
          <li>Does the source of down payment or equity contribution include funds from outside the United States?
            <div style="margin-top: 5px;">
              □ Yes  □ No
              <div style="margin-top: 5px; margin-left: 20px;">
                If yes, specify country: ____________________________________________________
              </div>
            </div>
          </li>
          
          <li>Is the borrower acting as an agent or nominee for another person or entity?
            <div style="margin-top: 5px;">
              □ Yes  □ No
              <div style="margin-top: 5px; margin-left: 20px;">
                If yes, please provide details: _______________________________________________
              </div>
            </div>
          </li>
          
          <li>Has the borrower or any beneficial owner been subject to any criminal investigations, indictments, or convictions?
            <div style="margin-top: 5px;">
              □ Yes  □ No
              <div style="margin-top: 5px; margin-left: 20px;">
                If yes, please provide details: _______________________________________________
              </div>
            </div>
          </li>
        </ol>
      </div>
      
      <div class="document-section">
        <div class="section-title">5. Source of Funds Verification</div>
        <p>Please indicate the source(s) of funds for this transaction:</p>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
          <div class="checkbox-item">
            <div class="checkbox"></div>
            <div>Income/Salary</div>
          </div>
          <div class="checkbox-item">
            <div class="checkbox"></div>
            <div>Sale of Property</div>
          </div>
          <div class="checkbox-item">
            <div class="checkbox"></div>
            <div>Business Proceeds</div>
          </div>
          <div class="checkbox-item">
            <div class="checkbox"></div>
            <div>Refinance</div>
          </div>
          <div class="checkbox-item">
            <div class="checkbox"></div>
            <div>Investment Income</div>
          </div>
          <div class="checkbox-item">
            <div class="checkbox"></div>
            <div>Gift</div>
          </div>
          <div class="checkbox-item">
            <div class="checkbox"></div>
            <div>Inheritance</div>
          </div>
          <div class="checkbox-item">
            <div class="checkbox"></div>
            <div>Other</div>
          </div>
        </div>
        
        <p>Please explain the source of funds in detail and provide the required documentation:</p>
        <div style="border: 1px solid #ccc; padding: 15px; min-height: 80px; margin-bottom: 15px;">
          
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">6. Risk Assessment</div>
        
        <div class="grid-table">
          <div class="grid-item">
            <h4>Risk Level</h4>
            <p style="${riskLevelStyle}">${riskAssessment.level}</p>
            <p>Score: ${riskAssessment.score}/10</p>
          </div>
          
          <div class="grid-item">
            <h4>Risk Factors</h4>
            <ul style="margin-top: 0; padding-left: 20px; font-size: 14px;">
              ${riskAssessment.factors.map(factor => `<li>${factor}</li>`).join("")}
            </ul>
          </div>
        </div>
        
        <div class="subsection-title">6.1 Required Documentation</div>
        <p>Based on the risk assessment, the following documentation is required:</p>
        
        <div style="margin: 15px 0;">
          ${requiredDocuments.map(doc => `
            <div class="checkbox-item">
              <div class="checkbox ${doc.required ? "checked" : ""}"></div>
              <div>${doc.name} ${doc.required ? '<span style="color: #dc3545;">*</span>' : "(if applicable)"}</div>
            </div>
          `).join("")}
        </div>
        
        <div class="notice">
          <p><strong>Note:</strong> Additional documentation may be requested based on further review.</p>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">7. Certification</div>
        <p>I hereby certify that the information provided above is true and accurate to the best of my knowledge. I understand that Harrington Capital Partners is required to collect this information for compliance with federal regulations, including the Bank Secrecy Act and USA PATRIOT Act. I agree to notify Harrington Capital Partners promptly of any changes to the information provided.</p>
        
        <div class="warning">
          <p><strong>IMPORTANT:</strong> Providing false or misleading information may result in denial of the loan application, termination of the business relationship, and possible criminal and/or civil penalties.</p>
        </div>
        
        <div class="signature-section">
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <p>Signature of Borrower/Authorized Representative</p>
          </div>
          
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <p>Print Name</p>
          </div>
          
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <p>Title (if signing on behalf of an entity)</p>
          </div>
          
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <p>Date</p>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">For Lender Use Only</div>
        <table class="info-table">
          <tr>
            <th>Customer Identification Verified:</th>
            <td>□ Yes  □ No  □ Waived</td>
          </tr>
          <tr>
            <th>Customer Due Diligence Completed:</th>
            <td>□ Yes  □ No  □ Additional Information Required</td>
          </tr>
          <tr>
            <th>Beneficial Ownership Verified:</th>
            <td>□ Yes  □ No  □ N/A</td>
          </tr>
          <tr>
            <th>OFAC/Sanctions Screening:</th>
            <td>□ Clear  □ Match Found (See Attached)  □ Pending</td>
          </tr>
          <tr>
            <th>Verification Method(s):</th>
            <td>
              □ Documentary  □ Non-Documentary<br>
              □ Third-Party Vendor: _________________
            </td>
          </tr>
          <tr>
            <th>Completed By:</th>
            <td>${complianceOfficer.name}, ${complianceOfficer.title}</td>
          </tr>
          <tr>
            <th>Date:</th>
            <td>${currentDate}</td>
          </tr>
          <tr>
            <th>Additional Notes:</th>
            <td style="height: 60px;"></td>
          </tr>
        </table>
      </div>
      
      <div class="footer">
        <p>This form is required by federal law and regulation. Harrington Capital Partners is committed to preventing the use of its services for criminal purposes, including money laundering and terrorist financing.</p>
        <p>Anti-Money Laundering Documentation | Page 1 of 1 | Loan #: ${loanData.id}</p>
      </div>
    </div>
  `;
};

/**
 * USA PATRIOT Act Compliance Form Template
 * Customer Identification Program (CIP) and certification
 */
export const getPatriotActComplianceTemplate = (loanData: LoanData): string => {
  const currentDate = formatDate();
  const documentId = `PAT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Generate verification methods
  const verificationMethods = [
    "Government-issued photo ID (driver's license, passport)",
    "Articles of incorporation/organization",
    "Partnership or trust agreement",
    "Secretary of State business filing",
    "Certificate of Good Standing",
    "EIN verification from IRS",
    "Credit bureau report",
    "Public database search",
    "Bank reference letter",
    "Third-party identity verification service"
  ];
  
  // Generate compliance officer information
  const complianceOfficers = [
    { name: 'Patricia Alvarez', title: 'BSA/AML Compliance Officer', phone: '(555) 789-0123', email: 'palvarez@harringtoncapital.com' },
    { name: 'Daniel Kim', title: 'Sr. Compliance Manager', phone: '(555) 234-5678', email: 'dkim@harringtoncapital.com' },
    { name: 'Rebecca Washington', title: 'Compliance Director', phone: '(555) 345-6789', email: 'rwashington@harringtoncapital.com' }
  ];
  
  const complianceOfficer = complianceOfficers[Math.floor(Math.random() * complianceOfficers.length)];
  
  return `${baseStyle}
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
        <div class="document-title">USA PATRIOT Act Compliance Form</div>
        <div class="document-subtitle">Customer Identification Program (CIP) | ID: ${documentId}</div>
      </div>
      
      <div class="notice">
        <p><strong>IMPORTANT INFORMATION:</strong> To help the government fight the funding of terrorism and money laundering activities, Federal law requires all financial institutions to obtain, verify, and record information that identifies each person who opens an account or applies for a loan. What this means for you: When you apply for a loan, we will ask for your name, address, date of birth, and other information that will allow us to identify you. We may also ask to see your driver's license or other identifying documents.</p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Section 1: Customer Information</div>
        
        <div class="subsection-title">1.1 Individual Information</div>
        <table class="info-table">
          <tr>
            <th>Full Legal Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Date of Birth:</th>
            <td>________________________</td>
          </tr>
          <tr>
            <th>SSN/TIN:</th>
            <td>________________________</td>
          </tr>
          <tr>
            <th>Current Physical Address:</th>
            <td>${loanData.borrowerAddress || '________________________'}</td>
          </tr>
          <tr>
            <th>Previous Address:</th>
            <td>________________________</td>
          </tr>
          <tr>
            <th>(If at current address less than 2 years)</th>
            <td></td>
          </tr>
          <tr>
            <th>Phone Number:</th>
            <td>${loanData.borrowerPhone || '________________________'}</td>
          </tr>
          <tr>
            <th>Email Address:</th>
            <td>${loanData.borrowerEmail}</td>
          </tr>
        </table>
        
        ${loanData.entityType ? `
        <div class="subsection-title" style="margin-top: 20px;">1.2 Entity Information (if applicable)</div>
        <table class="info-table">
          <tr>
            <th>Entity Legal Name:</th>
            <td>${loanData.entityName || '________________________'}</td>
          </tr>
          <tr>
            <th>Entity Type:</th>
            <td>${loanData.entityType}</td>
          </tr>
          <tr>
            <th>EIN/TIN:</th>
            <td>${loanData.ein || '________________________'}</td>
          </tr>
          <tr>
            <th>State of Formation:</th>
            <td>${loanData.stateOfFormation || loanData.state || '________________________'}</td>
          </tr>
          <tr>
            <th>Date of Formation:</th>
            <td>${loanData.yearEstablished ? loanData.yearEstablished.toString() : '________________________'}</td>
          </tr>
          <tr>
            <th>Principal Place of Business:</th>
            <td>${loanData.borrowerAddress || '________________________'}</td>
          </tr>
        </table>
        ` : ''}
      </div>
      
      <div class="document-section">
        <div class="section-title">Section 2: Identification Documentation</div>
        
        <div class="subsection-title">2.1 Individual Identification</div>
        <p>Please provide the following information about your government-issued identification:</p>
        
        <table class="info-table">
          <tr>
            <th>Primary ID Type:</th>
            <td>
              □ Driver's License  □ Passport  □ State ID<br>
              □ Other: ________________________
            </td>
          </tr>
          <tr>
            <th>ID Number:</th>
            <td>________________________</td>
          </tr>
          <tr>
            <th>Issuing Authority:</th>
            <td>________________________</td>
          </tr>
          <tr>
            <th>Issue Date:</th>
            <td>________________________</td>
          </tr>
          <tr>
            <th>Expiration Date:</th>
            <td>________________________</td>
          </tr>
          <tr>
            <th>Secondary ID Type:</th>
            <td>
              □ Credit Card  □ Utility Bill  □ Insurance Card<br>
              □ Other: ________________________
            </td>
          </tr>
        </table>
        
        ${loanData.entityType ? `
        <div class="subsection-title" style="margin-top: 20px;">2.2 Entity Documentation</div>
        <p>Please provide the following entity documentation:</p>
        
        <div style="margin: 15px 0;">
          <div class="checkbox-item">
            <div class="checkbox checked"></div>
            <div>Articles of Organization/Incorporation</div>
          </div>
          <div class="checkbox-item">
            <div class="checkbox checked"></div>
            <div>Operating Agreement/Bylaws</div>
          </div>
          <div class="checkbox-item">
            <div class="checkbox checked"></div>
            <div>Certificate of Good Standing (issued within last 60 days)</div>
          </div>
          <div class="checkbox-item">
            <div class="checkbox checked"></div>
            <div>EIN Assignment Letter from IRS</div>
          </div>
          <div class="checkbox-item">
            <div class="checkbox"></div>
            <div>Resolution authorizing transaction (if required)</div>
          </div>
          <div class="checkbox-item">
            <div class="checkbox checked"></div>
            <div>Beneficial Ownership Certification</div>
          </div>
        </div>
        ` : ''}
      </div>
      
      <div class="document-section">
        <div class="section-title">Section 3: Beneficial Ownership Certification</div>
        
        ${loanData.entityType ? `
        <p>In accordance with the Financial Crimes Enforcement Network (FinCEN) Customer Due Diligence Rule, financial institutions must identify and verify the identity of the beneficial owners of legal entity customers.</p>
        
        <div class="subsection-title">3.1 Control Person</div>
        <p>Please provide information for one individual with significant responsibility to control, manage, or direct the entity. This includes an executive officer or senior manager (e.g., CEO, CFO, COO, Managing Member, General Partner, President, Vice President, or Treasurer), or any other individual who regularly performs similar functions.</p>
        
        <table class="info-table">
          <tr>
            <th>Full Legal Name:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Title:</th>
            <td>________________________</td>
          </tr>
          <tr>
            <th>Date of Birth:</th>
            <td>________________________</td>
          </tr>
          <tr>
            <th>Physical Address:</th>
            <td>${loanData.borrowerAddress || '________________________'}</td>
          </tr>
          <tr>
            <th>SSN/TIN:</th>
            <td>________________________</td>
          </tr>
          <tr>
            <th>ID Type & Number:</th>
            <td>________________________</td>
          </tr>
        </table>
        
        <div class="subsection-title" style="margin-top: 20px;">3.2 Beneficial Owners</div>
        <p>Please provide information for each individual who directly or indirectly owns 25% or more of the equity interests of the legal entity.</p>
        
        <div class="compliance-box">
          <div class="checkbox-item">
            <div class="checkbox"></div>
            <div><strong>Check here if no individual owns 25% or more of the equity interests of the entity</strong></div>
          </div>
          
          <div style="margin-top: 15px;">
            <p><strong>Beneficial Owner 1:</strong></p>
            <table class="info-table">
              <tr>
                <th>Full Legal Name:</th>
                <td>________________________</td>
              </tr>
              <tr>
                <th>Ownership Percentage:</th>
                <td>________________________</td>
              </tr>
              <tr>
                <th>Date of Birth:</th>
                <td>________________________</td>
              </tr>
              <tr>
                <th>Physical Address:</th>
                <td>________________________</td>
              </tr>
              <tr>
                <th>SSN/TIN:</th>
                <td>________________________</td>
              </tr>
              <tr>
                <th>ID Type & Number:</th>
                <td>________________________</td>
              </tr>
            </table>
          </div>
          
          <p style="margin-top: 15px; font-style: italic;">Additional beneficial owners should be listed on the attached Beneficial Ownership Form.</p>
        </div>
        ` : `
        <p>Not applicable for individual borrowers.</p>
        `}
      </div>
      
      <div class="document-section">
        <div class="section-title">Section 4: OFAC/PEP Certification</div>
        <p>Please answer the following questions:</p>
        
        <div style="margin: 15px 0;">
          <div class="checkbox-item">
            <div class="checkbox"></div>
            <div>Are you, any beneficial owner, or any immediate family member a Politically Exposed Person (PEP)? A PEP is a current or former senior official in the executive, legislative, administrative, military, or judicial branch of a government (foreign or domestic), a senior official of a major political party, or a senior executive of a government-owned corporation.</div>
          </div>
          
          <div style="margin-left: 30px; margin-top: 10px; margin-bottom: 15px;">
            □ Yes  □ No
            <div style="margin-top: 5px;">
              If yes, please explain: _______________________________________________________
            </div>
          </div>
          
          <div class="checkbox-item">
            <div class="checkbox"></div>
            <div>Are you, any beneficial owner, or any immediate family member subject to sanctions administered by the Office of Foreign Assets Control (OFAC) of the U.S. Department of the Treasury?</div>
          </div>
          
          <div style="margin-left: 30px; margin-top: 10px; margin-bottom: 15px;">
            □ Yes  □ No
            <div style="margin-top: 5px;">
              If yes, please explain: _______________________________________________________
            </div>
          </div>
          
          <div class="checkbox-item">
            <div class="checkbox"></div>
            <div>Do you or any beneficial owner maintain any financial accounts, property, or other assets in countries subject to U.S. sanctions or embargoes?</div>
          </div>
          
          <div style="margin-left: 30px; margin-top: 10px;">
            □ Yes  □ No
            <div style="margin-top: 5px;">
              If yes, please explain: _______________________________________________________
            </div>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Section 5: Customer Certification</div>
        <p>I hereby certify that the information provided above is true and accurate to the best of my knowledge. I understand that Harrington Capital Partners is required to collect this information to comply with the USA PATRIOT Act and related regulations.</p>
        
        <p>I authorize Harrington Capital Partners to verify any information provided on this form through any means, including obtaining consumer reports, credit reports, or other background checks. I understand that Harrington Capital Partners may decline to proceed with this transaction based on the verification results.</p>
        
        <div class="warning">
          <p><strong>WARNING:</strong> Federal law provides that anyone who knowingly makes false statements or uses false documents in connection with this certification may be subject to civil and criminal penalties, including fines and imprisonment.</p>
        </div>
        
        <div class="signature-section">
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <p>Signature of Borrower/Authorized Representative</p>
          </div>
          
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <p>Print Name</p>
          </div>
          
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <p>Title (if signing on behalf of an entity)</p>
          </div>
          
          <div style="margin-top: 30px;">
            <div class="signature-line"></div>
            <p>Date</p>
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">For Lender Use Only</div>
        <table class="info-table">
          <tr>
            <th colspan="2">Customer Identification Program (CIP) Verification</th>
          </tr>
          <tr>
            <th>Verification Methods Used:</th>
            <td>
              ${verificationMethods.slice(0, 5).map((method, index) => `
                <div class="checkbox-item" style="margin-bottom: 5px;">
                  <div class="checkbox ${index < 2 ? 'checked' : ''}"></div>
                  <div>${method}</div>
                </div>
              `).join('')}
            </td>
          </tr>
          <tr>
            <th>Identity Verified:</th>
            <td>□ Yes  □ No  □ Exception (see notes)</td>
          </tr>
          <tr>
            <th>OFAC/Sanctions Screening:</th>
            <td>□ Clear  □ Match Found (see attached)  □ Pending Resolution</td>
          </tr>
          <tr>
            <th>Beneficial Ownership Verified:</th>
            <td>□ Yes  □ No  □ N/A (Individual or < 25% Ownership)</td>
          </tr>
          <tr>
            <th>Additional Notes:</th>
            <td style="height: 60px;"></td>
          </tr>
          <tr>
            <th>Verification Completed By:</th>
            <td>${complianceOfficer.name}</td>
          </tr>
          <tr>
            <th>Title:</th>
            <td>${complianceOfficer.title}</td>
          </tr>
          <tr>
            <th>Date:</th>
            <td>${currentDate}</td>
          </tr>
        </table>
      </div>
      
      <div class="footer">
        <p>This form must be completed for all new customers in compliance with the USA PATRIOT Act and its implementing regulations. Information collected will be maintained in accordance with our Privacy Policy.</p>
        <p>USA PATRIOT Act Compliance Form | Page 1 of 1 | Loan #: ${loanData.id}</p>
      </div>
    </div>
  `;
};
