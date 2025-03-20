"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreliminaryTitleReportTemplate = exports.getPurchaseContractTemplate = void 0;
var documentStyleService_1 = require("../documentStyleService");
/**
 * Property Information Templates
 * Returns HTML strings for property-related document types
 */
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
// Generate future date
var getFutureDate = function (daysInFuture) {
    var date = new Date();
    date.setDate(date.getDate() + daysInFuture);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
// Generate a random array of additional contract provisions
var getRandomProvisions = function () {
    var allProvisions = [
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
    var shuffled = __spreadArray([], allProvisions, true).sort(function () { return 0.5 - Math.random(); });
    return shuffled.slice(0, 4 + Math.floor(Math.random() * 4));
};
// Base style for the document
var baseStyle = "\n<style>\n  .document {\n    font-family: 'Arial', sans-serif;\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 20px;\n    color: #333;\n  }\n  .document-header {\n    text-align: center;\n    margin-bottom: 30px;\n  }\n  .document-title {\n    font-size: 24px;\n    font-weight: bold;\n    margin-bottom: 5px;\n    text-transform: uppercase;\n  }\n  .document-subtitle {\n    font-size: 16px;\n    margin-bottom: 20px;\n  }\n  .document-section {\n    margin-bottom: 30px;\n  }\n  .section-title {\n    font-size: 18px;\n    font-weight: bold;\n    margin-bottom: 15px;\n    padding-bottom: 5px;\n    border-bottom: 1px solid #ddd;\n  }\n  .subsection-title {\n    font-size: 16px;\n    font-weight: bold;\n    margin: 10px 0;\n  }\n  .info-table {\n    width: 100%;\n    border-collapse: collapse;\n    margin-bottom: 20px;\n  }\n  .info-table th, .info-table td {\n    padding: 8px 10px;\n    text-align: left;\n    border-bottom: 1px solid #eee;\n  }\n  .info-table th {\n    width: 35%;\n    font-weight: bold;\n    background-color: #f5f5f5;\n  }\n  .signature-section {\n    margin-top: 50px;\n    page-break-inside: avoid;\n  }\n  .signature-line {\n    border-top: 1px solid #000;\n    width: 50%;\n    margin-top: 40px;\n    margin-bottom: 5px;\n  }\n  p {\n    line-height: 1.5;\n    margin-bottom: 15px;\n  }\n  ul, ol {\n    margin-bottom: 15px;\n  }\n  li {\n    margin-bottom: 5px;\n  }\n  .clause {\n    margin-bottom: 15px;\n    padding-left: 15px;\n  }\n  .clause-title {\n    font-weight: bold;\n    margin-bottom: 5px;\n  }\n  .provision {\n    padding: 8px;\n    margin-bottom: 5px;\n    background-color: #f9f9f9;\n    border-radius: 4px;\n  }\n  .parties {\n    display: flex;\n    justify-content: space-between;\n    margin-bottom: 20px;\n  }\n  .party-box {\n    width: 48%;\n    padding: 15px;\n    background-color: #f5f5f5;\n    border-radius: 4px;\n  }\n  .signature-container {\n    display: flex;\n    justify-content: space-between;\n    margin-top: 50px;\n  }\n  .signature-box {\n    width: 45%;\n  }\n  .date-box {\n    margin-top: 10px;\n    font-size: 14px;\n  }\n  .initials-section {\n    display: flex;\n    justify-content: flex-end;\n    margin-top: -10px;\n    margin-bottom: 20px;\n  }\n  .initials-box {\n    width: 100px;\n    text-align: center;\n  }\n  .initials-line {\n    border-top: 1px solid #000;\n    width: 80px;\n    margin-bottom: 5px;\n  }\n  .fine-print {\n    font-size: 12px;\n    color: #666;\n  }\n</style>";
/**
 * Purchase Contract Template
 * Simulates a real estate purchase agreement between buyer and seller
 */
var getPurchaseContractTemplate = function (loanData) {
    var _a;
    var formattedDate = formatDate();
    var closingDate = getFutureDate(45); // 45 days in the future
    var inspectionDate = getFutureDate(14); // 14 days in the future
    var randomProvisions = getRandomProvisions();
    // Generate seller information (could be expanded to use more loanData if available)
    var sellerName = "".concat(['John & Mary', 'Robert & Susan', 'William & Elizabeth', 'James & Patricia'][Math.floor(Math.random() * 4)], " ").concat(['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'][Math.floor(Math.random() * 8)]);
    // Property price calculation
    var propertyPrice = loanData.propertyValue || loanData.loanAmount * (100 / (70 + Math.floor(Math.random() * 15)));
    var earnestMoney = Math.round(propertyPrice * 0.03);
    var downPayment = Math.round(propertyPrice * 0.2) - earnestMoney;
    var content = "\n    <div class=\"document\">\n      <div class=\"document-header\">\n        <div class=\"document-title\">Real Estate Purchase Contract</div>\n        <div class=\"document-subtitle\">Date: ".concat(formattedDate, "</div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"parties\">\n          <div class=\"party-box\">\n            <div class=\"subsection-title\">Buyer:</div>\n            <p>\n              <strong>").concat(loanData.borrowerName, "</strong><br>\n              ").concat(loanData.borrowerAddress || 'Current Address: 123 Main Street, Anytown, USA 12345', "<br>\n              Phone: (555) 123-4567<br>\n              Email: ").concat(loanData.borrowerName.toLowerCase().replace(/\s/g, '.'), "@email.com\n            </p>\n          </div>\n          <div class=\"party-box\">\n            <div class=\"subsection-title\">Seller:</div>\n            <p>\n              <strong>").concat(sellerName, "</strong><br>\n              ").concat(loanData.propertyAddress, "<br>\n              Phone: (555) 987-6543<br>\n              Email: ").concat(sellerName.toLowerCase().split('&')[0].trim().replace(/\s/g, '.'), "@email.com\n            </p>\n          </div>\n        </div>\n        \n        <p>THIS AGREEMENT made on ").concat(formattedDate, " between <strong>").concat(sellerName, "</strong> (hereinafter called \"Seller\") and <strong>").concat(loanData.borrowerName, "</strong> (hereinafter called \"Buyer\").</p>\n        \n        <p>WITNESSETH: That Seller and Buyer, for the consideration herein mentioned, agree as follows:</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">1. Property Description</div>\n        <p>The Seller agrees to sell and the Buyer agrees to buy the property located at:</p>\n        <div class=\"provision\">\n          <strong>").concat(loanData.propertyAddress, "</strong><br>\n          Legal Description: Lot ").concat(Math.floor(Math.random() * 50) + 1, ", Block ").concat(Math.floor(Math.random() * 20) + 1, ", ").concat(loanData.propertyAddress.split(',')[0], " Subdivision, according to the plat thereof, recorded in Plat Book ").concat(Math.floor(Math.random() * 100) + 1, ", Page ").concat(Math.floor(Math.random() * 100) + 1, ", of the Public Records of ").concat(((_a = loanData.propertyAddress.split(',')[1]) === null || _a === void 0 ? void 0 : _a.trim()) || 'County', ".\n        </div>\n        \n        <p>Together with all fixtures and improvements thereon and all appurtenances thereto, including but not limited to: built-in appliances, ceiling fans, light fixtures, window treatments, attached floor coverings, television antennas, satellite dishes, mailboxes, permanently installed outdoor cooking equipment, all landscaping, and all security systems (collectively the \"Property\").</p>\n        \n        <div class=\"initials-section\">\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Buyer's Initials</div>\n          </div>\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Seller's Initials</div>\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">2. Purchase Price and Financing</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Purchase Price:</th>\n            <td>").concat(formatCurrency(propertyPrice), "</td>\n          </tr>\n          <tr>\n            <th>Earnest Money Deposit:</th>\n            <td>").concat(formatCurrency(earnestMoney), "</td>\n          </tr>\n          <tr>\n            <th>Additional Deposit Due:</th>\n            <td>").concat(formatCurrency(downPayment), " due within 7 days of acceptance</td>\n          </tr>\n          <tr>\n            <th>New Mortgage Financing:</th>\n            <td>").concat(formatCurrency(loanData.loanAmount), "</td>\n          </tr>\n          <tr>\n            <th>Closing Costs Paid by Seller:</th>\n            <td>").concat(formatCurrency(Math.round(propertyPrice * 0.02)), "</td>\n          </tr>\n          <tr>\n            <th>Balance Due at Closing:</th>\n            <td>").concat(formatCurrency(propertyPrice - earnestMoney - downPayment), "</td>\n          </tr>\n        </table>\n        \n        <div class=\"clause\">\n          <div class=\"clause-title\">Financing Contingency:</div>\n          <p>This contract is contingent upon Buyer obtaining mortgage financing for ").concat(formatCurrency(loanData.loanAmount), " at a rate not to exceed ").concat(loanData.interestRate + 0.5, "% for a term of ").concat(loanData.loanTerm, " months. Buyer agrees to make a good faith application for mortgage financing within 5 days of the effective date of this Contract and to proceed diligently to obtain such financing.</p>\n        </div>\n        \n        <div class=\"initials-section\">\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Buyer's Initials</div>\n          </div>\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Seller's Initials</div>\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">3. Closing Date and Possession</div>\n        <div class=\"clause\">\n          <p>The closing of this sale shall be held at the offices of a title company of Buyer's choosing on or before <strong>").concat(closingDate, "</strong>, or within 5 days of loan approval, whichever is later.</p>\n          <p>Possession of the Property shall be delivered to Buyer at closing.</p>\n          <p>The Seller shall deliver the Property in the same condition as it was on the date of acceptance, ordinary wear and tear excepted, and shall maintain the landscaping and grounds prior to closing.</p>\n        </div>\n        \n        <div class=\"initials-section\">\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Buyer's Initials</div>\n          </div>\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Seller's Initials</div>\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">4. Inspections and Due Diligence</div>\n        <div class=\"clause\">\n          <p>Buyer shall have until <strong>").concat(inspectionDate, "</strong> (the \"Inspection Period\") to have the Property inspected by one or more properly licensed or otherwise qualified professionals to determine if there are any defects in the following:</p>\n          <ul>\n            <li>Roof and structural components</li>\n            <li>Electrical, plumbing, heating, and air conditioning systems</li>\n            <li>Built-in appliances</li>\n            <li>Foundation</li>\n            <li>Presence of toxic or hazardous substances</li>\n            <li>Presence of termites or other wood-destroying organisms</li>\n          </ul>\n          <p>If the inspections reveal any defects in the above items, Buyer shall notify Seller in writing of such defects before the expiration of the Inspection Period. Buyer's failure to notify Seller within the Inspection Period shall constitute a waiver of Buyer's right to request repairs or credits.</p>\n        </div>\n        \n        <div class=\"initials-section\">\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Buyer's Initials</div>\n          </div>\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Seller's Initials</div>\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">5. Title and Survey</div>\n        <div class=\"clause\">\n          <p>Within 15 days from the effective date, Seller shall furnish to Buyer a commitment for title insurance policy, including legible copies of all documents constituting exceptions to the title commitment.</p>\n          <p>Buyer may, at Buyer's expense, obtain a boundary survey of the Property. If the survey shows a material encroachment on the Property or that improvements located on the Property encroach on the lands of others, such encroachments shall constitute a title defect.</p>\n          <p>Seller shall convey marketable title to the Property by warranty deed free of claims, liens, easements and encumbrances of record or known to Seller, but subject to property taxes for the year of closing; zoning and land use restrictions; deed restrictions and homeowner association restrictions; existing utility easements; and other customary exceptions to title.</p>\n        </div>\n        \n        <div class=\"initials-section\">\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Buyer's Initials</div>\n          </div>\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Seller's Initials</div>\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">6. Additional Provisions</div>\n        ").concat(randomProvisions.map(function (provision) { return "<div class=\"provision\">".concat(provision, "</div>"); }).join(''), "\n        \n        <div class=\"initials-section\">\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Buyer's Initials</div>\n          </div>\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Seller's Initials</div>\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">7. Default</div>\n        <div class=\"clause\">\n          <p>If Buyer defaults under this Contract, all deposits paid by Buyer may be retained by Seller as agreed upon liquidated damages, consideration for the execution of this Contract, and in full settlement of any claims.</p>\n          <p>If Seller defaults under this Contract, Buyer may either: (a) seek specific performance or (b) terminate the Contract and receive a full refund of all deposits paid.</p>\n        </div>\n        \n        <div class=\"initials-section\">\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Buyer's Initials</div>\n          </div>\n          <div class=\"initials-box\">\n            <div class=\"initials-line\"></div>\n            <div>Seller's Initials</div>\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"fine-print\">\n          <p>This is a legally binding contract. If not understood, seek the advice of an attorney before signing. This is intended to be a legally binding contract. All terms and conditions apply. Changes must be made in writing with signatures from all parties.</p>\n        </div>\n        \n        <div class=\"signature-container\">\n          <div class=\"signature-box\">\n            <div class=\"signature-line\"></div>\n            <div>").concat(loanData.borrowerName, "</div>\n            <div class=\"date-box\">Date: _______________</div>\n          </div>\n          <div class=\"signature-box\">\n            <div class=\"signature-line\"></div>\n            <div>").concat(sellerName, "</div>\n            <div class=\"date-box\">Date: _______________</div>\n          </div>\n        </div>\n      </div>\n      \n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Purchase Contract - ".concat(loanData.borrowerName), content);
};
exports.getPurchaseContractTemplate = getPurchaseContractTemplate;
/**
 * Preliminary Title Report Template
 * Simulates a title company's preliminary report on property ownership and encumbrances
 */
var getPreliminaryTitleReportTemplate = function (loanData) {
    var _a, _b;
    var formattedDate = formatDate();
    var reportNumber = "TR-".concat(Math.floor(100000 + Math.random() * 900000));
    var effectiveDate = formattedDate;
    var reportDate = formattedDate;
    // Generate property legal description
    var lot = Math.floor(Math.random() * 50) + 1;
    var block = Math.floor(Math.random() * 20) + 1;
    var subdivision = loanData.propertyAddress.split(',')[0];
    var county = ((_a = loanData.propertyAddress.split(',')[1]) === null || _a === void 0 ? void 0 : _a.trim().split(' ')[0]) || 'County';
    var state = ((_b = loanData.propertyAddress.split(',')[2]) === null || _b === void 0 ? void 0 : _b.trim().split(' ')[0]) || 'State';
    // Generate random property vesting (based on entity type if available)
    var vestingType = loanData.entityType || (Math.random() > 0.5 ? 'individual' : 'joint');
    var vesting = '';
    if (loanData.entityName) {
        vesting = "".concat(loanData.entityName, ", a ").concat(loanData.entityType || 'Limited Liability Company');
    }
    else if (vestingType === 'joint') {
        // Assume borrower name has first and last name
        var nameParts = loanData.borrowerName.split(' ');
        if (nameParts.length >= 2) {
            var lastName = nameParts[nameParts.length - 1];
            var firstName = nameParts[0];
            vesting = "".concat(loanData.borrowerName, " and Jane ").concat(lastName, ", husband and wife, as joint tenants");
        }
        else {
            vesting = "".concat(loanData.borrowerName, " and Jane Doe, as joint tenants");
        }
    }
    else {
        vesting = "".concat(loanData.borrowerName, ", a single person");
    }
    // Generate random encumbrances and exceptions
    var generateRandomEncumbrances = function () {
        var possibleEncumbrances = [
            "Deed of Trust recorded ".concat(new Date(new Date().setMonth(new Date().getMonth() - Math.floor(Math.random() * 24))).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), " as Instrument No. ").concat(Math.floor(1000000 + Math.random() * 9000000), ", in favor of ").concat(['First National Bank', 'Oceanside Mortgage Company', 'Capital Trust Lenders', 'Heritage Bank & Trust'][Math.floor(Math.random() * 4)], ", securing a note for ").concat(formatCurrency(Math.floor((50000 + Math.random() * 150000) / 1000) * 1000), "."),
            "Easement for public utilities recorded in Book ".concat(Math.floor(1000 + Math.random() * 9000), ", Page ").concat(Math.floor(100 + Math.random() * 900), "."),
            "Covenants, conditions and restrictions recorded in Book ".concat(Math.floor(1000 + Math.random() * 9000), ", Page ").concat(Math.floor(100 + Math.random() * 900), ", but omitting any covenant or restriction based on race, color, religion, sex, handicap, familial status, or national origin."),
            "Mineral rights reserved in deed recorded ".concat(new Date(new Date().setFullYear(new Date().getFullYear() - Math.floor(20 + Math.random() * 50))).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), "."),
            "Homeowner's Association Declaration recorded in Book ".concat(Math.floor(1000 + Math.random() * 9000), ", Page ").concat(Math.floor(100 + Math.random() * 900), "."),
            "Survey exceptions as shown on ALTA survey prepared by ".concat(['Acme Surveying', 'Precision Land Surveys, Inc.', 'Landmark Survey Group', 'Atlas Boundary Consultants'][Math.floor(Math.random() * 4)], ", dated ").concat(new Date(new Date().setMonth(new Date().getMonth() - Math.floor(1 + Math.random() * 6))).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), "."),
            "Unpaid property taxes for the fiscal year ".concat(new Date().getFullYear(), "-").concat(new Date().getFullYear() + 1, " in the amount of ").concat(formatCurrency(Math.floor((1000 + Math.random() * 5000) / 100) * 100), "."),
            "Rights of tenants in possession under unrecorded leases.",
            "Water rights, claims or title to water, whether or not shown by the public records.",
            "Encroachments, overlaps, boundary line disputes, and any other matters which would be disclosed by an accurate survey and inspection of the premises."
        ];
        // Select a random number of encumbrances (2-5)
        var count = 2 + Math.floor(Math.random() * 4);
        var shuffled = __spreadArray([], possibleEncumbrances, true).sort(function () { return 0.5 - Math.random(); });
        return shuffled.slice(0, count);
    };
    var encumbrances = generateRandomEncumbrances();
    // Random title company
    var titleCompany = ['First American Title Insurance Company', 'Fidelity National Title', 'Old Republic Title', 'Stewart Title Guaranty Company', 'Chicago Title Insurance Company'][Math.floor(Math.random() * 5)];
    // Assessor's Parcel Number (APN)
    var apn = "".concat(Math.floor(100 + Math.random() * 900), "-").concat(Math.floor(100 + Math.random() * 900), "-").concat(Math.floor(10 + Math.random() * 90));
    var content = "\n    <div class=\"document\">\n      <div class=\"document-header\">\n        <div class=\"document-title\">Preliminary Title Report</div>\n        <div class=\"document-subtitle\">".concat(titleCompany, "</div>\n      </div>\n      \n      <div class=\"document-section\">\n        <table class=\"info-table\">\n          <tr>\n            <th>Order Number:</th>\n            <td>").concat(reportNumber, "</td>\n          </tr>\n          <tr>\n            <th>Report Date:</th>\n            <td>").concat(reportDate, "</td>\n          </tr>\n          <tr>\n            <th>Effective Date:</th>\n            <td>").concat(effectiveDate, " at 7:30 AM</td>\n          </tr>\n          <tr>\n            <th>Property Address:</th>\n            <td>").concat(loanData.propertyAddress, "</td>\n          </tr>\n          <tr>\n            <th>Assessor's Parcel Number:</th>\n            <td>").concat(apn, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <p>At the request of ").concat(loanData.borrowerName, ", this report is issued for the purpose of facilitating the issuance of a policy of title insurance and no liability is assumed hereby.</p>\n        \n        <p>Our examination of the record title to the real property described below, conducted through ").concat(effectiveDate, " at 7:30 AM, reveals that the title to said real property is vested in:</p>\n        \n        <div class=\"provision\">\n          <strong>").concat(vesting, "</strong>\n        </div>\n        \n        <p>Subject to the exceptions shown in Schedule B and to the terms, conditions and provisions of this report.</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Schedule A \u2013 Legal Description</div>\n        <p>The land referred to herein is situated in the County of ").concat(county, ", State of ").concat(state, ", and is described as follows:</p>\n        \n        <div class=\"provision\">\n          Lot ").concat(lot, ", Block ").concat(block, ", ").concat(subdivision, " Subdivision, according to the plat thereof, recorded in Plat Book ").concat(Math.floor(Math.random() * 100) + 1, ", Page ").concat(Math.floor(Math.random() * 100) + 1, ", of the Public Records of ").concat(county, " County, ").concat(state, ".\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Schedule B \u2013 Exceptions</div>\n        <p>At the date hereof, exceptions to coverage in addition to the printed Exceptions and Exclusions in the policy form would be as follows:</p>\n        \n        <ol>\n          <li>General and special taxes and assessments for the fiscal year ").concat(new Date().getFullYear(), "-").concat(new Date().getFullYear() + 1, ", a lien not yet due or payable.</li>\n          \n          <li>Supplemental taxes that may be assessed due to a change in ownership or completion of new construction occurring prior to date of policy.</li>\n          \n          ").concat(encumbrances.map(function (item, index) { return "<li>".concat(item, "</li>"); }).join(''), "\n        </ol>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Notes and Requirements</div>\n        \n        <div class=\"subsection-title\">Notes:</div>\n        <ol>\n          <li>Property taxes for the current fiscal year are PAID/OPEN, and are as follows:\n            <div class=\"fine-print\">\n              <div>1st Installment: ").concat(formatCurrency(Math.floor((1000 + Math.random() * 3000) / 100) * 100), " DUE: December 10, ").concat(new Date().getFullYear(), "</div>\n              <div>2nd Installment: ").concat(formatCurrency(Math.floor((1000 + Math.random() * 3000) / 100) * 100), " DUE: April 10, ").concat(new Date().getFullYear() + 1, "</div>\n              <div>Exemption: ").concat(formatCurrency(Math.floor(Math.random() * 7000) / 100 * 100), "</div>\n            </div>\n          </li>\n          \n          <li>The property address and/or assessor's parcel number shown above are for informational purposes only and are not guaranteed to be accurate or complete.</li>\n          \n          <li>There were no open deeds of trust found of record. If you should have knowledge of any outstanding obligation, please contact the Title Department immediately for further review prior to closing.</li>\n          \n          <li>For informational purposes: the property appears to be a single-family residence based on tax assessor records.</li>\n        </ol>\n        \n        <div class=\"subsection-title\">Requirements:</div>\n        <ol>\n          <li>This Company will require a Statement of Information from all parties in order to complete this report, provide title insurance coverage, and close this transaction. The appropriate Statement of Information forms are attached.</li>\n          \n          <li>The Company will require a copy of the Articles of Organization, Operating Agreement, and a current list of members for ").concat(loanData.entityName || 'the borrowing entity', " in order to confirm who is authorized to sign documents on behalf of the limited liability company.</li>\n          \n          <li>In order to close this transaction, this Company will require recordation of a deed from the current owner(s) to the proposed insured. Please provide the proper deed for recordation.</li>\n          \n          <li>Based on the information provided, we require an ALTA survey be ordered. A survey endorsement will be issued upon receipt and approval of the survey.</li>\n        </ol>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Closing Information</div>\n        <p>According to the public records, there has been no conveyance of the land within a period of ").concat(Math.floor(1 + Math.random() * 5), " years prior to the date of this report, except as follows:</p>\n        \n        <div class=\"provision\">\n          Grant Deed from ").concat(['Robert & Susan Johnson', 'William & Patricia Davis', 'Thomas & Jennifer Brown', 'Michael & Elizabeth Miller'][Math.floor(Math.random() * 4)], " to ").concat(vesting, " recorded ").concat(new Date(new Date().setMonth(new Date().getMonth() - Math.floor(6 + Math.random() * 24))).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), " as Instrument No. ").concat(Math.floor(1000000 + Math.random() * 9000000), ".\n        </div>\n        \n        <p>The contemplated transaction is a ").concat(loanData.loanPurpose === 'purchase' ? 'purchase' : 'refinance', " for a total consideration of ").concat(formatCurrency(loanData.loanAmount), ".</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"fine-print\">\n          <p>NOTICE: This is a PRO-FORMA Report. It does not reflect the present state of the Title and is not a commitment to insure the estate or interest as shown herein. Any agreements to insure pursuant to this Pro-Forma Report will only become effective when all requirements to issue the policy have been satisfied.</p>\n          \n          <p>Prior to the issuance of any policy of title insurance, ").concat(titleCompany, " requires evidence of compliance with all conditions precedent in any pending transactions. This preliminary report is not a written representation as to the condition of title and may not list all liens, defects, and encumbrances affecting title to the land.</p>\n        </div>\n        \n        <div class=\"signature-section\">\n          <p>").concat(titleCompany, "</p>\n          <div class=\"signature-line\"></div>\n          <div>By: ").concat(['John A. Thompson', 'Sarah B. Reynolds', 'Michael C. Anderson', 'Elizabeth D. Wilson'][Math.floor(Math.random() * 4)], ", Authorized Signatory</div>\n        </div>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Preliminary Title Report - ".concat(loanData.borrowerName), content);
};
exports.getPreliminaryTitleReportTemplate = getPreliminaryTitleReportTemplate;
