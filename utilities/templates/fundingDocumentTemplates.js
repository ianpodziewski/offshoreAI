"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWiringInstructionsTemplate = exports.getEscrowAgreementTemplate = exports.getFundingAuthorizationTemplate = exports.getDisbursementInstructionsTemplate = exports.getFinalTitlePolicyTemplate = exports.generateWiringInstructions = exports.generateEscrowAgreement = exports.generateFundingAuthorization = exports.generateDisbursementInstructions = exports.generateFinalTitlePolicy = void 0;
var documentStyleService_1 = require("../documentStyleService");
/**
 * Document templates for various funding-related documents used in hard money lending
 */
// Helper functions for consistent formatting
// Format date helper
var formatDate = function () {
    return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
// Format currency helper
var formatCurrency = function (amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
};
// Get a future date based on months from now
var getFutureDate = function (monthsFromNow) {
    var futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + monthsFromNow);
    return futureDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
// Adapter function to convert LoanData to LoanDetails
var adaptLoanDataToLoanDetails = function (loanData) {
    // Extract city, state, and zip from the propertyAddress if possible
    var addressParts = loanData.propertyAddress.split(', ');
    var city = 'N/A';
    var state = 'N/A';
    var zip = 'N/A';
    if (addressParts.length >= 2) {
        // Assuming format like "123 Main St, Anytown, CA 12345"
        city = addressParts[1];
        if (addressParts.length >= 3) {
            // Try to extract state and zip from the last part
            var stateZipParts = addressParts[2].split(' ');
            state = stateZipParts[0] || 'N/A';
            zip = stateZipParts[1] || 'N/A';
        }
    }
    return {
        propertyAddress: {
            street: addressParts[0] || loanData.propertyAddress,
            city: city,
            state: state,
            zipCode: zip
        },
        borrowerName: loanData.borrowerName,
        loanAmount: loanData.loanAmount,
        lenderName: 'Harrington Capital Partners',
        closingDate: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }),
        propertyType: loanData.propertyType || 'Residential',
        loanNumber: loanData.id,
        interestRate: loanData.interestRate,
        originationFee: loanData.originationFee || 0.02,
        loanTerm: loanData.loanTerm || 12,
    };
};
/**
 * Generates a Final Title Policy document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Final Title Policy document
 */
var generateFinalTitlePolicy = function (loanDetails) {
    var propertyAddress = loanDetails.propertyAddress, borrowerName = loanDetails.borrowerName, loanAmount = loanDetails.loanAmount, lenderName = loanDetails.lenderName, closingDate = loanDetails.closingDate, propertyType = loanDetails.propertyType, loanNumber = loanDetails.loanNumber;
    var currentDate = formatDate();
    var policyAmount = loanAmount * 1.1; // 110% of loan amount
    var policyNumber = "FTP-".concat(loanNumber, "-").concat(new Date().getFullYear());
    // Generate title insurance company information
    var titleCompanies = [
        'Fidelity National Title Insurance Company',
        'First American Title Insurance Company',
        'Old Republic National Title Insurance Company',
        'Stewart Title Guaranty Company'
    ];
    var titleCompany = titleCompanies[Math.floor(Math.random() * titleCompanies.length)];
    var titleCompanyState = ['California', 'Delaware', 'New York', 'Texas'][Math.floor(Math.random() * 4)];
    var content = "\n    <div class=\"document\">\n      <div class=\"document-header\">\n        <div class=\"document-title\">Final Title Insurance Policy</div>\n        <div class=\"document-subtitle\">Date: ".concat(currentDate, "</div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"info-table-container\">\n          <table class=\"info-table\">\n            <tr>\n              <th>Policy Number:</th>\n              <td>").concat(policyNumber, "</td>\n            </tr>\n            <tr>\n              <th>Date of Policy:</th>\n              <td>").concat(currentDate, "</td>\n            </tr>\n            <tr>\n              <th>Policy Amount:</th>\n              <td>").concat(formatCurrency(policyAmount), "</td>\n            </tr>\n            <tr>\n              <th>Insured:</th>\n              <td>").concat(lenderName, "</td>\n            </tr>\n            <tr>\n              <th>Borrower:</th>\n              <td>").concat(borrowerName, "</td>\n            </tr>\n            <tr>\n              <th>Property Address:</th>\n              <td>").concat(propertyAddress.street, ", ").concat(propertyAddress.city, ", ").concat(propertyAddress.state, " ").concat(propertyAddress.zipCode, "</td>\n            </tr>\n            <tr>\n              <th>Property Type:</th>\n              <td>").concat(propertyType, "</td>\n            </tr>\n            <tr>\n              <th>Loan Closing Date:</th>\n              <td>").concat(closingDate, "</td>\n            </tr>\n            <tr>\n              <th>Loan Amount:</th>\n              <td>").concat(formatCurrency(loanAmount), "</td>\n            </tr>\n          </table>\n        </div>\n        \n        <p>This Final Title Insurance Policy (\"Policy\") is issued by ").concat(titleCompany, ", a corporation organized and existing under the laws of the State of ").concat(titleCompanyState, ", herein called the \"Company.\"</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Coverage Statement</div>\n        <p>Subject to the exclusions from coverage, the exceptions from coverage contained in Schedule B, and the conditions and stipulations, ").concat(titleCompany, ", a ").concat(titleCompanyState, " corporation, herein called the Company, insures, as of the Date of Policy shown above, against loss or damage, not exceeding the Amount of Insurance stated above, sustained or incurred by the insured by reason of:</p>\n        \n        <ol>\n          <li>Title to the estate or interest described in Schedule A being vested other than as stated therein;</li>\n          <li>Any defect in or lien or encumbrance on the title;</li>\n          <li>Unmarketability of the title;</li>\n          <li>Lack of right of access to and from the land;</li>\n          <li>The invalidity or unenforceability of the lien of the insured mortgage upon the title;</li>\n          <li>The priority of any lien or encumbrance over the lien of the insured mortgage;</li>\n          <li>Lack of priority of the lien of the insured mortgage over any statutory lien for services, labor, or material arising from an improvement or work related to the land which is contracted for or commenced prior to Date of Policy;</li>\n          <li>The invalidity or unenforceability of any assignment of the insured mortgage, provided the assignment is shown in Schedule A, or the failure of the assignment shown in Schedule A to vest title to the insured mortgage in the named insured assignee free and clear of all liens.</li>\n        </ol>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Schedule A</div>\n        <p>The estate or interest in the land which is encumbered by the insured mortgage is <strong>Fee Simple</strong>.</p>\n        <p>Title to the estate or interest in the land is vested in: <strong>").concat(borrowerName, "</strong></p>\n        <p>The insured mortgage and assignments thereof, if any, are described as follows:</p>\n        <p>Deed of Trust executed by ").concat(borrowerName, " to secure a note in the original principal amount of ").concat(formatCurrency(loanAmount), ", dated ").concat(closingDate, ", in favor of ").concat(lenderName, ".</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Schedule B</div>\n        <p>This policy does not insure against loss or damage by reason of the following:</p>\n        \n        <ol>\n          <li>Property taxes for the current fiscal year, and subsequent years, not yet due and payable.</li>\n          <li>Easements, restrictions, and conditions of record.</li>\n          <li>Any facts, rights, interests, or claims that are not shown by the public records but that could be ascertained by an inspection of the land or by making inquiry of persons in possession of the land.</li>\n          <li>Any encroachment, encumbrance, violation, variation, or adverse circumstance affecting the title that would be disclosed by an accurate and complete land survey of the land.</li>\n        </ol>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Witness</div>\n        <p>IN WITNESS WHEREOF, ").concat(titleCompany, " has caused this policy to be signed and sealed as of the Date of Policy shown above.</p>\n        \n        <div class=\"signature-section\">\n          <div class=\"signature-line\"></div>\n          <div>").concat(titleCompany, "</div>\n          <div>Authorized Signatory</div>\n        </div>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Final Title Policy - ".concat(loanDetails.borrowerName), content);
};
exports.generateFinalTitlePolicy = generateFinalTitlePolicy;
/**
 * Generates Disbursement Instructions document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Disbursement Instructions document
 */
var generateDisbursementInstructions = function (loanDetails) {
    var propertyAddress = loanDetails.propertyAddress, borrowerName = loanDetails.borrowerName, loanAmount = loanDetails.loanAmount, lenderName = loanDetails.lenderName, closingDate = loanDetails.closingDate, loanNumber = loanDetails.loanNumber, interestRate = loanDetails.interestRate, originationFee = loanDetails.originationFee, loanTerm = loanDetails.loanTerm;
    var currentDate = formatDate();
    // Calculate fees
    var origFeePercent = originationFee || 2; // Default to 2% if not provided
    var origFeeAmount = loanAmount * (origFeePercent / 100);
    var titleFees = 1200;
    var escrowFees = 850;
    var appraisalFee = 700;
    var documentPreparationFee = 450;
    var wireTransferFee = 35;
    var recordingFees = 125;
    var totalFees = origFeeAmount + titleFees + escrowFees + appraisalFee +
        documentPreparationFee + wireTransferFee + recordingFees;
    var netProceedsToClosing = loanAmount - totalFees;
    var content = "\n    <div class=\"document\">\n      <div class=\"document-header\">\n        <div class=\"document-title\">Disbursement Instructions</div>\n        <div class=\"document-subtitle\">Date: ".concat(currentDate, "</div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"info-table-container\">\n          <table class=\"info-table\">\n            <tr>\n              <th>Loan Number:</th>\n              <td>").concat(loanNumber, "</td>\n            </tr>\n            <tr>\n              <th>Closing Date:</th>\n              <td>").concat(closingDate, "</td>\n            </tr>\n            <tr>\n              <th>Borrower:</th>\n              <td>").concat(borrowerName, "</td>\n            </tr>\n            <tr>\n              <th>Property Address:</th>\n              <td>").concat(propertyAddress.street, ", ").concat(propertyAddress.city, ", ").concat(propertyAddress.state, " ").concat(propertyAddress.zipCode, "</td>\n            </tr>\n            <tr>\n              <th>Lender:</th>\n              <td>").concat(lenderName, "</td>\n            </tr>\n          </table>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Loan Information</div>\n        <div class=\"info-table-container\">\n          <table class=\"info-table\">\n            <tr>\n              <th>Loan Amount:</th>\n              <td>").concat(formatCurrency(loanAmount), "</td>\n            </tr>\n            <tr>\n              <th>Interest Rate:</th>\n              <td>").concat(interestRate, "%</td>\n            </tr>\n            <tr>\n              <th>Loan Term:</th>\n              <td>").concat(loanTerm, " months</td>\n            </tr>\n            <tr>\n              <th>Origination Fee:</th>\n              <td>").concat(origFeePercent, "% (").concat(formatCurrency(origFeeAmount), ")</td>\n            </tr>\n          </table>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Disbursement Schedule</div>\n        <p class=\"subsection-title\">From Loan Proceeds:</p>\n        \n        <div class=\"info-table-container\">\n          <table class=\"info-table\">\n            <tr>\n              <th colspan=\"2\">1. Fees Due to Lender:</th>\n            </tr>\n            <tr>\n              <td style=\"padding-left: 20px;\">a. Origination Fee:</td>\n              <td>").concat(formatCurrency(origFeeAmount), "</td>\n            </tr>\n            <tr>\n              <td style=\"padding-left: 20px;\">b. Document Preparation Fee:</td>\n              <td>").concat(formatCurrency(documentPreparationFee), "</td>\n            </tr>\n            <tr>\n              <th colspan=\"2\">2. Third-Party Fees:</th>\n            </tr>\n            <tr>\n              <td style=\"padding-left: 20px;\">a. Title Insurance Premium:</td>\n              <td>").concat(formatCurrency(titleFees), "</td>\n            </tr>\n            <tr>\n              <td style=\"padding-left: 20px;\">b. Escrow/Closing Fee:</td>\n              <td>").concat(formatCurrency(escrowFees), "</td>\n            </tr>\n            <tr>\n              <td style=\"padding-left: 20px;\">c. Appraisal Fee:</td>\n              <td>").concat(formatCurrency(appraisalFee), "</td>\n            </tr>\n            <tr>\n              <td style=\"padding-left: 20px;\">d. Recording Fees:</td>\n              <td>").concat(formatCurrency(recordingFees), "</td>\n            </tr>\n            <tr>\n              <td style=\"padding-left: 20px;\">e. Wire Transfer Fee:</td>\n              <td>").concat(formatCurrency(wireTransferFee), "</td>\n            </tr>\n            <tr class=\"total-row\">\n              <th>TOTAL FEES:</th>\n              <td>").concat(formatCurrency(totalFees), "</td>\n            </tr>\n            <tr class=\"total-row\">\n              <th>NET LOAN PROCEEDS TO CLOSING:</th>\n              <td>").concat(formatCurrency(netProceedsToClosing), "</td>\n            </tr>\n            <tr>\n              <th>HOLDBACK RESERVES (if applicable):</th>\n              <td>").concat(formatCurrency(0), "</td>\n            </tr>\n          </table>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Instructions to Title/Escrow</div>\n        <ol>\n          <li>Please disburse the funds as indicated above.</li>\n          <li>The net proceeds should be disbursed to the borrower after all fees are paid and all conditions for funding have been satisfied.</li>\n          <li>Do not release any funds until the Deed of Trust/Mortgage has been properly recorded.</li>\n          <li>Verify that all outstanding liens, if any, have been paid in full or subordinated as required.</li>\n          <li>Ensure that the title insurance policy is issued without delay following closing and recording.</li>\n        </ol>\n        \n        <div class=\"highlight-box\">\n          <p>These disbursement instructions are approved and authorized:</p>\n        </div>\n        \n        <div class=\"signature-section\">\n          <div class=\"signature-line\"></div>\n          <div>").concat(borrowerName, ", Borrower</div>\n          <div>Date: ").concat(closingDate, "</div>\n          \n          <div style=\"margin-top: 30px;\">\n            <div class=\"signature-line\"></div>\n            <div>Authorized Representative for ").concat(lenderName, "</div>\n            <div>Date: ").concat(closingDate, "</div>\n          </div>\n          \n          <div style=\"margin-top: 30px;\">\n            <div class=\"signature-line\"></div>\n            <div>Escrow Officer</div>\n            <div>Date: ").concat(closingDate, "</div>\n          </div>\n        </div>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Disbursement Instructions - ".concat(loanDetails.borrowerName), content);
};
exports.generateDisbursementInstructions = generateDisbursementInstructions;
/**
 * Generates a Funding Authorization document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Funding Authorization document
 */
var generateFundingAuthorization = function (loanDetails) {
    var propertyAddress = loanDetails.propertyAddress, borrowerName = loanDetails.borrowerName, loanAmount = loanDetails.loanAmount, lenderName = loanDetails.lenderName, closingDate = loanDetails.closingDate, loanNumber = loanDetails.loanNumber, propertyType = loanDetails.propertyType, interestRate = loanDetails.interestRate, loanTerm = loanDetails.loanTerm;
    var currentDate = formatDate();
    var authorizationNumber = "FA-".concat(loanNumber);
    var expirationDate = getFutureDate(0.5); // 15 days from now
    // Generate funding manager information
    var fundingManagers = [
        { name: 'Rebecca Wilson', phone: '(212) 555-3456', email: 'rwilson@harringtoncapital.com' },
        { name: 'Anthony Parker', phone: '(212) 555-4567', email: 'aparker@harringtoncapital.com' },
        { name: 'Michelle Rodriguez', phone: '(212) 555-5678', email: 'mrodriguez@harringtoncapital.com' }
    ];
    var fundingManager = fundingManagers[Math.floor(Math.random() * fundingManagers.length)];
    var content = "\n    <div class=\"document\">\n      <div class=\"document-header\">\n        <div class=\"document-title\">Funding Authorization</div>\n        <div class=\"document-subtitle\">Date: ".concat(currentDate, "</div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"info-table-container\">\n          <table class=\"info-table\">\n            <tr>\n              <th>Authorization Number:</th>\n              <td>").concat(authorizationNumber, "</td>\n            </tr>\n            <tr>\n              <th>To:</th>\n              <td>[TITLE/ESCROW COMPANY]</td>\n            </tr>\n            <tr>\n              <th>RE:</th>\n              <td>Loan Funding Authorization for Loan #").concat(loanNumber, "</td>\n            </tr>\n          </table>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Loan Information</div>\n        <div class=\"info-table-container\">\n          <table class=\"info-table\">\n            <tr>\n              <th>Borrower(s):</th>\n              <td>").concat(borrowerName, "</td>\n            </tr>\n            <tr>\n              <th>Property Address:</th>\n              <td>").concat(propertyAddress.street, ", ").concat(propertyAddress.city, ", ").concat(propertyAddress.state, " ").concat(propertyAddress.zipCode, "</td>\n            </tr>\n            <tr>\n              <th>Property Type:</th>\n              <td>").concat(propertyType, "</td>\n            </tr>\n            <tr>\n              <th>Loan Amount:</th>\n              <td>").concat(formatCurrency(loanAmount), "</td>\n            </tr>\n            <tr>\n              <th>Interest Rate:</th>\n              <td>").concat(interestRate, "%</td>\n            </tr>\n            <tr>\n              <th>Loan Term:</th>\n              <td>").concat(loanTerm, " months</td>\n            </tr>\n            <tr>\n              <th>Scheduled Closing Date:</th>\n              <td>").concat(closingDate, "</td>\n            </tr>\n            <tr>\n              <th>Lender:</th>\n              <td>").concat(lenderName, "</td>\n            </tr>\n          </table>\n        </div>\n        \n        <p>This document serves as formal authorization to fund the above-referenced loan. The undersigned, as an authorized representative of ").concat(lenderName, " (\"Lender\"), hereby authorizes the funding of the above-referenced loan subject to the following conditions being met:</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Funding Conditions</div>\n        \n        <ol>\n          <li>\n            <strong>Receipt and approval of properly executed loan documents, including but not limited to:</strong>\n            <ul>\n              <li>Promissory Note</li>\n              <li>Deed of Trust/Mortgage</li>\n              <li>Closing Disclosure/Settlement Statement</li>\n              <li>Disbursement Instructions</li>\n              <li>Escrow Instructions</li>\n              <li>Borrower's Affidavit</li>\n              <li>Insurance Verification (with Lender listed as mortgagee/loss payee)</li>\n              <li>All applicable riders and addenda</li>\n            </ul>\n          </li>\n          <li>Confirmation that the title insurance policy will be issued with no exceptions other than those approved by Lender in writing.</li>\n          <li>Verification that all property taxes are current.</li>\n          <li>Confirmation that hazard insurance is in place with appropriate coverage amounts and with Lender properly listed as mortgagee/loss payee.</li>\n          <li>Verification that all required inspections have been completed and approved.</li>\n          <li>Confirmation that all existing liens and encumbrances have been paid off or subordinated as required.</li>\n          <li>Receipt of a clear final inspection report (if applicable).</li>\n          <li>All conditions listed in the Loan Commitment Letter have been satisfied.</li>\n        </ol>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Authorization</div>\n        <div class=\"highlight-box\">\n          <p>Upon satisfaction of all conditions listed above, the Lender hereby authorizes the disbursement of loan funds in the amount of ").concat(formatCurrency(loanAmount), " in accordance with the Disbursement Instructions provided separately.</p>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Expiration</div>\n        <div class=\"warning-box\">\n          <p>This Funding Authorization expires if funding does not occur by the close of business on ").concat(expirationDate, ". Any funding after this date requires a new authorization from Lender.</p>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Approval</div>\n        <p>Authorized and Approved:</p>\n        \n        <div class=\"signature-section\">\n          <div class=\"signature-line\"></div>\n          <div>Authorized Representative for ").concat(lenderName, "</div>\n          <div>Title: [TITLE]</div>\n          <div>Date: ").concat(currentDate, "</div>\n          \n          <div style=\"margin-top: 30px;\">\n            <div class=\"signature-line\"></div>\n            <div>Funding Department Approval</div>\n            <div>Date: ").concat(currentDate, "</div>\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Contact Information</div>\n        <p>For questions regarding this Funding Authorization, please contact:</p>\n        \n        <div class=\"info-table-container\">\n          <table class=\"info-table\">\n            <tr>\n              <th>Name:</th>\n              <td>").concat(fundingManager.name, "</td>\n            </tr>\n            <tr>\n              <th>Phone:</th>\n              <td>").concat(fundingManager.phone, "</td>\n            </tr>\n            <tr>\n              <th>Email:</th>\n              <td>").concat(fundingManager.email, "</td>\n            </tr>\n          </table>\n        </div>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Funding Authorization - ".concat(loanDetails.borrowerName), content);
};
exports.generateFundingAuthorization = generateFundingAuthorization;
/**
 * Generates an Escrow Agreement document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Escrow Agreement document
 */
var generateEscrowAgreement = function (loanDetails) {
    var propertyAddress = loanDetails.propertyAddress, borrowerName = loanDetails.borrowerName, loanAmount = loanDetails.loanAmount, lenderName = loanDetails.lenderName, closingDate = loanDetails.closingDate, loanNumber = loanDetails.loanNumber, propertyType = loanDetails.propertyType, interestRate = loanDetails.interestRate, loanTerm = loanDetails.loanTerm;
    var currentDate = formatDate();
    // Calculate estimated monthly tax and insurance amounts
    var estimatedAnnualTaxes = loanAmount * 0.015; // Assuming 1.5% of loan amount annually
    var estimatedAnnualInsurance = propertyType === 'Commercial' ? loanAmount * 0.01 : loanAmount * 0.005; // 1% for commercial, 0.5% for residential
    var monthlyTaxes = estimatedAnnualTaxes / 12;
    var monthlyInsurance = estimatedAnnualInsurance / 12;
    var monthlyEscrowAmount = monthlyTaxes + monthlyInsurance;
    // Calculate initial escrow deposit
    var initialEscrowDeposit = monthlyEscrowAmount * 2; // Two months of reserve
    // Generate escrow company information
    var escrowCompanies = [
        'First American Escrow Services',
        'Fidelity National Escrow',
        'Chicago Title Escrow',
        'Old Republic Escrow'
    ];
    var escrowCompany = escrowCompanies[Math.floor(Math.random() * escrowCompanies.length)];
    var content = "\n    <div class=\"document\">\n      <div class=\"document-header\">\n        <div class=\"document-title\">Escrow Agreement</div>\n        <div class=\"document-subtitle\">Date: ".concat(currentDate, "</div>\n      </div>\n      \n      <div class=\"document-section\">\n        <p class=\"centered-text\">\n          <strong>THIS ESCROW AGREEMENT</strong> (the \"Agreement\") is made and entered into on ").concat(currentDate, ", by and between:\n        </p>\n        \n        <div class=\"parties\">\n          <div class=\"party-box\">\n            <div class=\"subsection-title\">BORROWER:</div>\n            <p>").concat(borrowerName, " (the \"Borrower\")</p>\n          </div>\n          \n          <div class=\"party-box\">\n            <div class=\"subsection-title\">LENDER:</div>\n            <p>").concat(lenderName, " (the \"Lender\")</p>\n          </div>\n          \n          <div class=\"party-box\">\n            <div class=\"subsection-title\">ESCROW AGENT:</div>\n            <p>").concat(escrowCompany, " (the \"Escrow Agent\")</p>\n          </div>\n        </div>\n        \n        <div class=\"info-table-container\">\n          <table class=\"info-table\">\n            <tr>\n              <th>PROPERTY:</th>\n              <td>").concat(propertyAddress.street, ", ").concat(propertyAddress.city, ", ").concat(propertyAddress.state, " ").concat(propertyAddress.zipCode, "</td>\n            </tr>\n            <tr>\n              <th>LOAN NUMBER:</th>\n              <td>").concat(loanNumber, "</td>\n            </tr>\n            <tr>\n              <th>LOAN AMOUNT:</th>\n              <td>").concat(formatCurrency(loanAmount), "</td>\n            </tr>\n            <tr>\n              <th>LOAN CLOSING DATE:</th>\n              <td>").concat(closingDate, "</td>\n            </tr>\n          </table>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Recitals</div>\n        \n        <p><strong>WHEREAS</strong>, Borrower has obtained a loan from Lender secured by the above-referenced Property;</p>\n        \n        <p><strong>WHEREAS</strong>, Lender requires Borrower to maintain an escrow account for the payment of property taxes and insurance premiums;</p>\n        \n        <p><strong>WHEREAS</strong>, the parties desire to establish the terms and conditions governing the administration of the escrow account;</p>\n        \n        <p><strong>NOW, THEREFORE</strong>, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">1. Establishment of Escrow Account</div>\n        <p>Lender and Borrower hereby establish an escrow account (the \"Escrow Account\") with Escrow Agent for the purpose of paying property taxes, hazard insurance premiums, and other charges as they become due on the Property.</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">2. Initial Deposit</div>\n        <p>At closing, Borrower shall deposit with Escrow Agent the sum of ").concat(formatCurrency(initialEscrowDeposit), " as an initial deposit to the Escrow Account.</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">3. Monthly Deposits</div>\n        <p>Borrower agrees to pay to Lender, along with the regular monthly mortgage payment, the following amounts to be deposited into the Escrow Account:</p>\n        \n        <div class=\"info-table-container\">\n          <table class=\"info-table\">\n            <tr>\n              <th>a. Property Taxes:</th>\n              <td>").concat(formatCurrency(monthlyTaxes), " per month</td>\n            </tr>\n            <tr>\n              <th>b. Hazard Insurance:</th>\n              <td>").concat(formatCurrency(monthlyInsurance), " per month</td>\n            </tr>\n            <tr class=\"total-row\">\n              <th>Total Monthly Escrow Payment:</th>\n              <td>").concat(formatCurrency(monthlyEscrowAmount), "</td>\n            </tr>\n          </table>\n        </div>\n        \n        <p>These amounts are subject to adjustment based on actual tax and insurance bills as they are received by Lender.</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">4. Escrow Analysis</div>\n        <p>Lender will perform an annual analysis of the Escrow Account to determine if the monthly deposits are sufficient to pay the expected disbursements for the coming year. Borrower will be notified of any adjustment to the monthly escrow payment.</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">5. Payment of Escrow Items</div>\n        <p>Escrow Agent shall use the funds in the Escrow Account to pay property taxes, hazard insurance premiums, and other charges when they become due. Escrow Agent shall provide Borrower with an annual statement showing all deposits to and disbursements from the Escrow Account.</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">6. Insufficient Funds</div>\n        <p>If at any time the funds in the Escrow Account are insufficient to pay an escrow item when due, Borrower shall, upon notice from Lender, promptly deposit the amount of the deficiency with Escrow Agent.</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">7. Surplus Funds</div>\n        <p>If at any time the amount of funds in the Escrow Account exceeds the amount deemed necessary by Lender to pay escrow items when due, plus any cushion permitted by applicable law, Lender shall refund the excess to Borrower.</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">8. Termination</div>\n        <p>This Agreement shall terminate upon the payment in full of the loan or upon the mutual agreement of the parties.</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">9. Governing Law</div>\n        <p>This Agreement shall be governed by and construed in accordance with the laws of the state in which the Property is located.</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Signatures</div>\n        <p>IN WITNESS WHEREOF, the parties have executed this Escrow Agreement as of the date first written above.</p>\n        \n        <div class=\"signature-section\">\n          <div class=\"signature-line\"></div>\n          <div>BORROWER: ").concat(borrowerName, "</div>\n          <div>Date: ").concat(closingDate, "</div>\n          \n          <div style=\"margin-top: 30px;\">\n            <div class=\"signature-line\"></div>\n            <div>LENDER: ").concat(lenderName, "</div>\n            <div>By: ________________________</div>\n            <div>Title: _____________________</div>\n            <div>Date: ").concat(closingDate, "</div>\n          </div>\n          \n          <div style=\"margin-top: 30px;\">\n            <div class=\"signature-line\"></div>\n            <div>ESCROW AGENT: ").concat(escrowCompany, "</div>\n            <div>By: ________________________</div>\n            <div>Title: _____________________</div>\n            <div>Date: ").concat(closingDate, "</div>\n          </div>\n        </div>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Escrow Agreement - ".concat(loanDetails.borrowerName), content);
};
exports.generateEscrowAgreement = generateEscrowAgreement;
/**
 * Generates Wiring Instructions document based on loan details
 * @param loanDetails The loan details object containing property and borrower information
 * @returns Formatted string representing the Wiring Instructions document
 */
var generateWiringInstructions = function (loanDetails) {
    var propertyAddress = loanDetails.propertyAddress, borrowerName = loanDetails.borrowerName, loanAmount = loanDetails.loanAmount, lenderName = loanDetails.lenderName, closingDate = loanDetails.closingDate, loanNumber = loanDetails.loanNumber;
    var currentDate = formatDate();
    // Calculate net amount after fees (simplified for example)
    var netLoanAmount = loanAmount * 0.97; // Assuming 3% in fees
    // Generate bank information
    var banks = [
        'First National Bank',
        'Meridian Trust',
        'Coastal Federal Bank',
        'Western Union Financial Services'
    ];
    var selectedBank = banks[Math.floor(Math.random() * banks.length)];
    var routingNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
    var accountNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
    var swiftCode = "SW".concat((Math.random().toString(36).substring(2, 7)).toUpperCase(), "XXX");
    // Generate escrow officer information
    var escrowOfficers = [
        { name: 'Michael Thompson', phone: '(555) 123-4567', email: 'mthompson@titleco.com' },
        { name: 'Jennifer Garcia', phone: '(555) 234-5678', email: 'jgarcia@titleco.com' },
        { name: 'Robert Chen', phone: '(555) 345-6789', email: 'rchen@titleco.com' }
    ];
    var escrowOfficer = escrowOfficers[Math.floor(Math.random() * escrowOfficers.length)];
    var escrowNumber = "EC-".concat(Math.floor(10000 + Math.random() * 90000));
    var titleCompany = 'Secured Title & Escrow Services';
    var content = "\n    <div class=\"document\">\n      <div class=\"document-header\">\n        <div class=\"document-title\">Wire Transfer Instructions</div>\n        <div class=\"document-subtitle\">Date: ".concat(currentDate, "</div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"warning-box\">\n          <strong>IMPORTANT:</strong> THESE WIRE INSTRUCTIONS ARE FOR THE ABOVE-REFERENCED TRANSACTION ONLY\n        </div>\n        \n        <div class=\"info-table-container\">\n          <table class=\"info-table\">\n            <tr>\n              <th>Loan Number:</th>\n              <td>").concat(loanNumber, "</td>\n            </tr>\n            <tr>\n              <th>Borrower:</th>\n              <td>").concat(borrowerName, "</td>\n            </tr>\n            <tr>\n              <th>Property Address:</th>\n              <td>").concat(propertyAddress.street, ", ").concat(propertyAddress.city, ", ").concat(propertyAddress.state, " ").concat(propertyAddress.zipCode, "</td>\n            </tr>\n            <tr>\n              <th>Closing Date:</th>\n              <td>").concat(closingDate, "</td>\n            </tr>\n            <tr>\n              <th>Amount to be Wired:</th>\n              <td><strong>").concat(formatCurrency(netLoanAmount), "</strong></td>\n            </tr>\n          </table>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Receiving Bank Information</div>\n        <div class=\"info-table-container\">\n          <table class=\"info-table\">\n            <tr>\n              <th>Bank Name:</th>\n              <td>").concat(selectedBank, "</td>\n            </tr>\n            <tr>\n              <th>Bank Address:</th>\n              <td>123 Financial Center, Suite 400<br>Los Angeles, CA 90010</td>\n            </tr>\n            <tr>\n              <th>ABA/Routing Number:</th>\n              <td>").concat(routingNumber, "</td>\n            </tr>\n            <tr>\n              <th>Swift Code (for international wires):</th>\n              <td>").concat(swiftCode, "</td>\n            </tr>\n          </table>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Beneficiary Information</div>\n        <div class=\"info-table-container\">\n          <table class=\"info-table\">\n            <tr>\n              <th>Account Name:</th>\n              <td>").concat(titleCompany, " Trust Account</td>\n            </tr>\n            <tr>\n              <th>Account Number:</th>\n              <td>").concat(accountNumber, "</td>\n            </tr>\n            <tr>\n              <th>Reference/Note:</th>\n              <td>Loan #").concat(loanNumber, ", ").concat(borrowerName, ", ").concat(propertyAddress.street, "</td>\n            </tr>\n            <tr>\n              <th>File/Escrow Number:</th>\n              <td>").concat(escrowNumber, "</td>\n            </tr>\n          </table>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Special Instructions</div>\n        <ol>\n          <li>Please include the loan number, borrower name, and property address in the reference section of the wire.</li>\n          <li>Notify the escrow officer when wire has been sent.</li>\n          <li>Due to the risk of wire fraud, please call to verify these instructions before sending any funds.</li>\n        </ol>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Verification Contact</div>\n        <div class=\"info-table-container\">\n          <table class=\"info-table\">\n            <tr>\n              <th>Name:</th>\n              <td>").concat(escrowOfficer.name, "</td>\n            </tr>\n            <tr>\n              <th>Phone:</th>\n              <td>").concat(escrowOfficer.phone, " <em>(must call this number to verify before sending)</em></td>\n            </tr>\n            <tr>\n              <th>Email:</th>\n              <td>").concat(escrowOfficer.email, "</td>\n            </tr>\n            <tr>\n              <th>Title/Escrow Company:</th>\n              <td>").concat(titleCompany, "</td>\n            </tr>\n          </table>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Wire Fraud Advisory</div>\n        <div class=\"warning-box\">\n          <p><strong>WIRE FRAUD IS ON THE RISE.</strong> Before sending any wire, call the intended recipient at a number you know is valid to confirm the instructions. Additionally, note that wiring instructions are typically not changed during the course of a transaction.</p>\n        </div>\n        \n        <p>Once the wire has been sent, please email wire confirmation to: ").concat(escrowOfficer.email, "</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Funding Authorization</div>\n        <p>These wire instructions are hereby authorized by:</p>\n        \n        <div class=\"signature-section\">\n          <div class=\"signature-line\"></div>\n          <div>Authorized Representative for ").concat(lenderName, "</div>\n          <div>Date: ").concat(currentDate, "</div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Lender Information</div>\n        <p>\n          ").concat(lenderName, "<br>\n          123 Capital Avenue, Suite 500<br>\n          New York, NY 10001<br>\n          (212) 555-7890<br>\n          funding@harringtoncapital.com\n        </p>\n        \n        <div class=\"disclaimer\">\n          <p>").concat(lenderName, " is not responsible for any delay, failure of delivery, or misdirection of funds resulting from incorrect or incomplete wire instructions. The sender is responsible for confirming the accuracy of these instructions prior to sending funds.</p>\n        </div>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Wiring Instructions - ".concat(loanDetails.borrowerName), content);
};
exports.generateWiringInstructions = generateWiringInstructions;
// Wrapper functions that adapt to LoanData
var getFinalTitlePolicyTemplate = function (loanData) {
    var loanDetails = adaptLoanDataToLoanDetails(loanData);
    return (0, exports.generateFinalTitlePolicy)(loanDetails);
};
exports.getFinalTitlePolicyTemplate = getFinalTitlePolicyTemplate;
var getDisbursementInstructionsTemplate = function (loanData) {
    var loanDetails = adaptLoanDataToLoanDetails(loanData);
    return (0, exports.generateDisbursementInstructions)(loanDetails);
};
exports.getDisbursementInstructionsTemplate = getDisbursementInstructionsTemplate;
var getFundingAuthorizationTemplate = function (loanData) {
    var loanDetails = adaptLoanDataToLoanDetails(loanData);
    return (0, exports.generateFundingAuthorization)(loanDetails);
};
exports.getFundingAuthorizationTemplate = getFundingAuthorizationTemplate;
var getEscrowAgreementTemplate = function (loanData) {
    var loanDetails = adaptLoanDataToLoanDetails(loanData);
    return (0, exports.generateEscrowAgreement)(loanDetails);
};
exports.getEscrowAgreementTemplate = getEscrowAgreementTemplate;
var getWiringInstructionsTemplate = function (loanData) {
    var loanDetails = adaptLoanDataToLoanDetails(loanData);
    return (0, exports.generateWiringInstructions)(loanDetails);
};
exports.getWiringInstructionsTemplate = getWiringInstructionsTemplate;
