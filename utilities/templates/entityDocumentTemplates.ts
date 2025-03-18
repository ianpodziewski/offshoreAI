import { documentStyleService } from '../documentStyleService';
import { LoanData } from '../loanGenerator';

/**
 * Entity document template functions return HTML strings for entity-related document types
 * These templates are for LLC/Corporation documentation required for loan processing
 */

// Import helper functions or define them here if needed
const formatDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Base style to be used in all templates
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
  }
  .signature-section {
    margin-top: 50px;
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
</style>
`;

/**
 * Certificate of Formation Template
 * Simulates a state-filed document that establishes an LLC or corporation
 */
const getFormationDocumentsTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const entityType = loanData.entityType || 'Limited Liability Company';
  const entityState = loanData.stateOfFormation || 'Delaware';
  
  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">CERTIFICATE OF FORMATION</div>
        <div class="document-subtitle">Filing Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <p>
          This is to certify that <strong>${loanData.entityName || loanData.borrowerName}</strong>, a ${entityType}, 
          was duly organized under the laws of the State of ${entityState} on ${formattedDate}.
        </p>
        
        <div class="section-title">Entity Information</div>
        <table class="info-table">
          <tr>
            <th>Entity Name:</th>
            <td>${loanData.entityName || loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Entity Type:</th>
            <td>${entityType}</td>
          </tr>
          <tr>
            <th>Filed in State of:</th>
            <td>${entityState}</td>
          </tr>
          <tr>
            <th>Filing Number:</th>
            <td>${Math.floor(1000000 + Math.random() * 9000000)}</td>
          </tr>
          <tr>
            <th>Registered Agent:</th>
            <td>${loanData.entityName || loanData.borrowerName} Registered Agent Services, Inc.</td>
          </tr>
          <tr>
            <th>Principal Office:</th>
            <td>${loanData.propertyAddress || '123 Business Avenue, Suite 100'}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Certification</div>
        <p>
          This certificate is issued pursuant to the provisions of the ${entityState} ${entityType === 'Limited Liability Company' ? 'Limited Liability Company Act' : 'Business Corporation Act'} 
          and is hereby executed by the Secretary of State of ${entityState}.
        </p>
      </div>
      
      <div class="signature-section">
        <p>Secretary of State:</p>
        <div class="signature-line"></div>
        <div>Secretary of State, ${entityState}</div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Certificate of Formation - ${loanData.borrowerName}`, content);
};

/**
 * Operating Agreement Template
 * Internal document governing the operations of an LLC
 */
const getOperatingAgreementTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const entityType = loanData.entityType || 'Limited Liability Company';
  const entityState = loanData.stateOfFormation || 'Delaware';
  
  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">${entityType === 'Limited Liability Company' ? 'OPERATING AGREEMENT' : 'BYLAWS'}</div>
        <div class="document-subtitle">Effective Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Article I - Organization</div>
        <p>
          This ${entityType === 'Limited Liability Company' ? 'Operating Agreement' : 'Bylaws'} (the "Agreement") is entered into as of ${formattedDate}, by and among 
          <strong>${loanData.entityName || loanData.borrowerName}</strong> (the "Company") and its Member(s).
        </p>
        
        <p>
          The Member(s) has/have formed a ${entityType} under the laws of the State of ${entityState}. 
          The Member(s) hereby adopt(s) this Agreement to set forth the rights and obligations of the Member(s) 
          and the management and operation of the Company.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Article II - Purpose</div>
        <p>
          The purpose of the Company is to engage in any lawful act or activity for which a ${entityType} 
          may be organized under the laws of the State of ${entityState}, including but not limited to real estate 
          investment, acquisition, management, and development.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Article III - Management</div>
        <p>
          The business and affairs of the Company shall be managed by the Member(s) or appointed Manager(s).
          The Member(s)/Manager(s) shall have full and complete authority, power and discretion to manage and 
          control the business, affairs and properties of the Company, to make all decisions regarding those 
          matters and to perform any and all other acts or activities customary or incident to the management 
          of the Company's business.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Article IV - Capital Contributions</div>
        <p>
          The Member(s) has/have contributed the following capital to the Company:
        </p>
        <table class="info-table">
          <tr>
            <th>Member Name</th>
            <th>Capital Contribution</th>
            <th>Ownership Percentage</th>
          </tr>
          <tr>
            <td>${loanData.borrowerName.split(' ')[0] || 'Primary'} Member</td>
            <td>$${Math.floor(10000 + Math.random() * 90000)}.00</td>
            <td>100%</td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <p>IN WITNESS WHEREOF, the undersigned has executed this Agreement as of the date first written above.</p>
        <div class="signature-line"></div>
        <div>${loanData.borrowerName.split(' ')[0] || 'Primary'} Member, ${loanData.entityName || loanData.borrowerName}</div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Operating Agreement - ${loanData.borrowerName}`, content);
};

/**
 * Certificate of Good Standing Template
 * Government-issued document confirming entity is in compliance with regulations
 */
const getCertificateGoodStandingTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const entityType = loanData.entityType || 'Limited Liability Company';
  const entityState = loanData.stateOfFormation || 'Delaware';
  
  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">CERTIFICATE OF GOOD STANDING</div>
        <div class="document-subtitle">Issue Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <p>I, the undersigned, Secretary of State of the State of ${entityState}, do hereby certify that:</p>
        
        <p style="font-size: 18px; font-weight: bold; text-align: center; margin: 20px 0;">
          ${loanData.entityName || loanData.borrowerName}
        </p>
        
        <p>
          a ${entityType} formed under the laws of the State of ${entityState}, is duly formed under the laws of this State and is 
          in good standing having filed all annual reports and paid all fees due to this State through the date of this certificate, 
          and no certificate of cancellation has been filed by or with respect to the entity.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Entity Details</div>
        <table class="info-table">
          <tr>
            <th>File Number:</th>
            <td>${Math.floor(1000000 + Math.random() * 9000000)}</td>
          </tr>
          <tr>
            <th>Formation Date:</th>
            <td>${new Date(new Date().setFullYear(new Date().getFullYear() - 2)).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</td>
          </tr>
          <tr>
            <th>Status:</th>
            <td>Active</td>
          </tr>
          <tr>
            <th>Good Standing Through:</th>
            <td>${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <p>
          This certificate reflects the status of the entity as of the date of this certificate and does not constitute 
          authorization for the entity to engage in any business exceeding the authority conferred by its organizational documents.
        </p>
      </div>
      
      <div class="signature-section">
        <p>In testimony whereof, I have hereunto set my hand and caused to be affixed the Great Seal of the State of ${entityState}.</p>
        <div style="text-align: center; margin: 30px 0;">
          [SEAL PLACEHOLDER]
        </div>
        <div class="signature-line"></div>
        <div>Secretary of State, ${entityState}</div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Certificate of Good Standing - ${loanData.borrowerName}`, content);
};

/**
 * EIN Documentation Template
 * IRS-issued Employer Identification Number confirmation
 */
const getEinDocumentationTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const entityType = loanData.entityType || 'Limited Liability Company';
  
  const content = `
    <div class="document">
      <div class="document-header">
        <div style="text-align: center; margin-bottom: 20px;">
          <strong>Internal Revenue Service</strong><br>
          Department of the Treasury
        </div>
        <div class="document-title">EMPLOYER IDENTIFICATION NUMBER ASSIGNMENT</div>
        <div class="document-subtitle">Date of Issue: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <p>
          We have assigned you an Employer Identification Number (EIN) based on the information provided on your 
          application. The EIN is issued to you for tax filing and reporting purposes only and does not authorize 
          you to accept contributions or conduct other activities.
        </p>
        
        <div class="section-title">EIN Information</div>
        <table class="info-table">
          <tr>
            <th>Employer Identification Number:</th>
            <td>${loanData.ein || 'XX-XXXXXXX'}</td>
          </tr>
          <tr>
            <th>Legal Business Name:</th>
            <td>${loanData.entityName || loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Entity Type:</th>
            <td>${entityType}</td>
          </tr>
          <tr>
            <th>Issue Date:</th>
            <td>${formattedDate}</td>
          </tr>
          <tr>
            <th>Mailing Address:</th>
            <td>${loanData.propertyAddress || '123 Business Avenue, Suite 100'}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Important Information</div>
        <p>
          The IRS has established an EIN for your business. This EIN will identify your business account on all tax documents 
          and correspondence concerning your business. Please keep this document in your permanent records.
        </p>
        
        <p>
          When filing tax documents, please refer to the specific form instructions for required information. 
          Please refer to this EIN on all of your federal tax forms and communications.
        </p>
      </div>
      
      <div class="signature-section">
        <p>Sincerely,</p>
        <div class="signature-line"></div>
        <div>Department of the Treasury, Internal Revenue Service</div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`EIN Documentation - ${loanData.borrowerName}`, content);
};

/**
 * Resolution to Borrow Template
 * Internal corporate authorization to borrow funds
 */
const getResolutionToBorrowTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const entityType = loanData.entityType || 'Limited Liability Company';
  
  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">RESOLUTION TO BORROW</div>
        <div class="document-subtitle">Date: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <p style="text-align: center; font-weight: bold;">
          RESOLUTION OF THE ${entityType === 'Limited Liability Company' ? 'MEMBER(S)' : 'BOARD OF DIRECTORS'} OF<br>
          ${loanData.entityName || loanData.borrowerName}
        </p>
        
        <p>
          The undersigned, being all of the ${entityType === 'Limited Liability Company' ? 'Member(s)' : 'Director(s)'} of 
          ${loanData.entityName || loanData.borrowerName} (the "Company"), a ${entityType}, hereby adopt the following resolution:
        </p>
        
        <p>
          <strong>RESOLVED</strong>, that the Company is hereby authorized to borrow the sum of 
          ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
          }).format(loanData.loanAmount)} from the Lender on the terms and conditions set forth in the loan documents 
          which have been reviewed by the ${entityType === 'Limited Liability Company' ? 'Member(s)' : 'Board of Directors'}.
        </p>
        
        <p>
          <strong>FURTHER RESOLVED</strong>, that any ${entityType === 'Limited Liability Company' ? 'Member' : 'Officer'} of the Company is authorized to execute and 
          deliver any and all documents necessary to effectuate the borrowing on behalf of the Company, including 
          but not limited to the promissory note, mortgage/deed of trust, and any other loan documents required by the Lender.
        </p>
        
        <p>
          <strong>FURTHER RESOLVED</strong>, that any actions taken by the ${entityType === 'Limited Liability Company' ? 'Member(s)' : 'Officer(s)'} of the Company 
          consistent with these resolutions prior to the date of these resolutions are hereby ratified and confirmed.
        </p>
      </div>
      
      <div class="document-section">
        <div class="section-title">Loan Details</div>
        <table class="info-table">
          <tr>
            <th>Lender:</th>
            <td>DocuLendAI Lending LLC</td>
          </tr>
          <tr>
            <th>Loan Amount:</th>
            <td>${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 2
            }).format(loanData.loanAmount)}</td>
          </tr>
          <tr>
            <th>Interest Rate:</th>
            <td>${loanData.interestRate}%</td>
          </tr>
          <tr>
            <th>Term:</th>
            <td>${loanData.loanTerm} months</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
        </table>
      </div>
      
      <div class="signature-section">
        <p>This resolution is adopted by the ${entityType === 'Limited Liability Company' ? 'Member(s)' : 'Board of Directors'} of the Company on ${formattedDate}.</p>
        <div class="signature-line"></div>
        <div>${loanData.borrowerName.split(' ')[0] || 'Authorized'} ${entityType === 'Limited Liability Company' ? 'Member' : 'Director'}, ${loanData.entityName || loanData.borrowerName}</div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Resolution to Borrow - ${loanData.borrowerName}`, content);
};

// Export all templates
export {
  getFormationDocumentsTemplate,
  getOperatingAgreementTemplate,
  getCertificateGoodStandingTemplate,
  getEinDocumentationTemplate,
  getResolutionToBorrowTemplate
}; 