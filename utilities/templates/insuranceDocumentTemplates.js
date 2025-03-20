"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLiabilityInsurancePolicyTemplate = exports.getBuildersRiskPolicyTemplate = exports.getFloodInsurancePolicyTemplate = exports.getPropertyInsurancePolicyTemplate = void 0;
var documentStyleService_1 = require("../documentStyleService");
/**
 * Insurance Document Templates
 * Contains templates for various insurance documents required for real estate loans
 */
// Format date helper
var formatDate = function () {
    return new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};
// Format currency helper
var formatCurrency = function (amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
    }).format(amount);
};
// Generate future date helper
var getFutureDate = function (days) {
    var date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
};
// Base style for the document
var baseStyle = "\n<style>\n  .document {\n    font-family: 'Arial', sans-serif;\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 20px;\n    color: #333;\n  }\n  .document-header {\n    text-align: center;\n    margin-bottom: 30px;\n  }\n  .document-title {\n    font-size: 24px;\n    font-weight: bold;\n    margin-bottom: 5px;\n    text-transform: uppercase;\n  }\n  .document-subtitle {\n    font-size: 16px;\n    margin-bottom: 20px;\n  }\n  .document-section {\n    margin-bottom: 30px;\n  }\n  .section-title {\n    font-size: 18px;\n    font-weight: bold;\n    margin-bottom: 15px;\n    padding-bottom: 5px;\n    border-bottom: 1px solid #ddd;\n  }\n  .subsection-title {\n    font-size: 16px;\n    font-weight: bold;\n    margin: 10px 0;\n  }\n  .info-table {\n    width: 100%;\n    border-collapse: collapse;\n    margin-bottom: 20px;\n  }\n  .info-table th, .info-table td {\n    padding: 8px 10px;\n    text-align: left;\n    border-bottom: 1px solid #eee;\n  }\n  .info-table th {\n    width: 35%;\n    font-weight: bold;\n    background-color: #f5f5f5;\n  }\n  .signature-section {\n    margin-top: 50px;\n    page-break-inside: avoid;\n  }\n  .signature-line {\n    border-top: 1px solid #000;\n    width: 50%;\n    margin-top: 40px;\n    margin-bottom: 5px;\n  }\n  .letterhead {\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    margin-bottom: 40px;\n    border-bottom: 2px solid #2d5ca6;\n    padding-bottom: 20px;\n  }\n  .letterhead-logo {\n    font-size: 22px;\n    font-weight: bold;\n    color: #2d5ca6;\n  }\n  .letterhead-contact {\n    font-size: 14px;\n    text-align: right;\n  }\n  .notice {\n    background-color: #f8f9fa;\n    border-left: 4px solid #2d5ca6;\n    padding: 15px;\n    margin: 20px 0;\n  }\n  .highlight {\n    background-color: #fffbd6;\n    padding: 10px;\n    border-radius: 4px;\n    margin: 10px 0;\n  }\n  .warning {\n    background-color: #fff3f3;\n    border-left: 4px solid #dc3545;\n    padding: 15px;\n    margin: 20px 0;\n  }\n  .coverage-table {\n    width: 100%;\n    border-collapse: collapse;\n    margin-bottom: 20px;\n  }\n  .coverage-table th, .coverage-table td {\n    padding: 10px;\n    text-align: left;\n    border: 1px solid #ddd;\n  }\n  .coverage-table th {\n    background-color: #f0f0f0;\n    font-weight: bold;\n  }\n  .coverage-table tr:nth-child(even) {\n    background-color: #f9f9f9;\n  }\n  .footer {\n    margin-top: 50px;\n    font-size: 12px;\n    color: #666;\n    border-top: 1px solid #ddd;\n    padding-top: 20px;\n    text-align: center;\n  }\n  .policy-stamp {\n    text-align: center;\n    border: 2px solid #2d5ca6;\n    padding: 10px;\n    margin: 20px auto;\n    width: 250px;\n    color: #2d5ca6;\n    font-weight: bold;\n    text-transform: uppercase;\n  }\n  .grid-container {\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    grid-gap: 20px;\n  }\n  @media print {\n    .document {\n      padding: 0;\n    }\n    .page-break {\n      page-break-before: always;\n    }\n  }\n</style>";
/**
 * Property Insurance Policy Template
 * Generates a comprehensive property insurance declaration page
 */
var getPropertyInsurancePolicyTemplate = function (loanData) {
    var currentDate = formatDate();
    var policyNumber = "PIP-".concat(new Date().getFullYear(), "-").concat(Math.floor(10000 + Math.random() * 90000));
    // Calculate policy period (1 year)
    var policyStartDate = currentDate;
    var policyEndDate = getFutureDate(365);
    // Calculate insurance amounts
    var propertyValue = loanData.propertyValue || loanData.purchasePrice || (loanData.loanAmount * (100 / loanData.ltv));
    var buildingCoverage = Math.round(propertyValue * 0.9); // 90% of property value
    var contentsCoverage = Math.round(propertyValue * 0.2); // 20% of property value
    var liabilityCoverage = 1000000; // $1M liability
    var medicalCoverage = 5000; // $5K medical
    var lossOfRentsCoverage = Math.round((propertyValue * 0.08) / 12 * 6); // 6 months of estimated rental income
    // Calculate deductibles
    var standardDeductible = Math.max(1000, Math.min(5000, Math.round(propertyValue * 0.01 / 1000) * 1000));
    var windHailDeductible = standardDeductible * 2;
    var floodDeductible = standardDeductible * 2;
    var earthquakeDeductible = Math.round(propertyValue * 0.05); // 5% of property value
    // Calculate premium (simplified calculation)
    var annualPremiumRate = loanData.propertyType.includes("commercial") ? 0.008 : 0.006;
    var annualPremium = Math.round(buildingCoverage * annualPremiumRate);
    var monthlyPremium = Math.round(annualPremium / 12);
    // Generate insurance company information
    var insuranceCompanies = [
        {
            name: "Pacific Shield Insurance Group",
            address: "123 Underwriter Blvd, Hartford, CT 06103",
            phone: "(800) 555-7890",
            website: "www.pacificshieldinsurance.com",
            email: "claims@pacificshieldinsurance.com",
            rating: "A+ (Superior)"
        },
        {
            name: "Cornerstone Property & Casualty",
            address: "456 Risk Management Ave, Boston, MA 02110",
            phone: "(800) 999-8765",
            website: "www.cornerstoneproperty.com",
            email: "claims@cornerstoneproperty.com",
            rating: "A (Excellent)"
        },
        {
            name: "Liberty National Insurance Co.",
            address: "789 Protection Lane, Chicago, IL 60601",
            phone: "(800) 777-1234",
            website: "www.libertynationalins.com",
            email: "claims@libertynationalins.com",
            rating: "A++ (Superior)"
        }
    ];
    var insuranceCompany = insuranceCompanies[Math.floor(Math.random() * insuranceCompanies.length)];
    // Generate agent information
    var agents = [
        {
            name: "Robert Williams",
            company: "Williams Insurance Agency",
            address: "555 Broker Street, Suite 200, Boston, MA 02110",
            phone: "(617) 555-2345",
            email: "rwilliams@williamsinsurance.com",
            license: "BK-789456"
        },
        {
            name: "Jennifer Martinez",
            company: "Premier Insurance Solutions",
            address: "888 Coverage Lane, Suite 300, Boston, MA 02108",
            phone: "(617) 555-8765",
            email: "jmartinez@premierinsurance.com",
            license: "BK-456123"
        },
        {
            name: "Michael Chen",
            company: "Guardian Insurance Services",
            address: "777 Protection Plaza, Suite 150, Boston, MA 02116",
            phone: "(617) 555-9876",
            email: "mchen@guardianinsurance.com",
            license: "BK-123987"
        }
    ];
    var agent = agents[Math.floor(Math.random() * agents.length)];
    var content = "\n    <div class=\"document\">\n      <div class=\"letterhead\">\n        <div class=\"letterhead-logo\">\n          ".concat(insuranceCompany.name.toUpperCase(), "\n        </div>\n        <div class=\"letterhead-contact\">\n          ").concat(insuranceCompany.address, "<br>\n          ").concat(insuranceCompany.phone, "<br>\n          ").concat(insuranceCompany.website, "<br>\n          Rating: ").concat(insuranceCompany.rating, "\n        </div>\n      </div>\n      \n      <div class=\"document-header\">\n        <div class=\"document-title\">Property Insurance Policy Declarations</div>\n        <div class=\"document-subtitle\">Policy Number: ").concat(policyNumber, "</div>\n      </div>\n      \n      <div class=\"policy-stamp\">POLICY DECLARATIONS</div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Policy Information</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Named Insured:</th>\n            <td>").concat(loanData.entityName || loanData.borrowerName, "</td>\n          </tr>\n          <tr>\n            <th>Mailing Address:</th>\n            <td>").concat(loanData.borrowerAddress || "Same as Property Address", "</td>\n          </tr>\n          <tr>\n            <th>Policy Period:</th>\n            <td>From: ").concat(policyStartDate, " To: ").concat(policyEndDate, " (12:01 AM Standard Time)</td>\n          </tr>\n          <tr>\n            <th>Policy Type:</th>\n            <td>").concat(loanData.propertyType.includes("commercial") ? "Commercial Property" : "Investment Property", "</td>\n          </tr>\n          <tr>\n            <th>Annual Premium:</th>\n            <td>").concat(formatCurrency(annualPremium), "</td>\n          </tr>\n          <tr>\n            <th>Payment Schedule:</th>\n            <td>Monthly: ").concat(formatCurrency(monthlyPremium), " (Includes $5 installment fee)</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Property Information</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Insured Location:</th>\n            <td>").concat(loanData.propertyAddress, "</td>\n          </tr>\n          <tr>\n            <th>Property Type:</th>\n            <td>").concat(loanData.propertyType.replace(/_/g, " ").replace(/\b\w/g, function (l) { return l.toUpperCase(); }), "</td>\n          </tr>\n          <tr>\n            <th>Year Built:</th>\n            <td>").concat(loanData.yearBuilt || "Not Provided", "</td>\n          </tr>\n          <tr>\n            <th>Square Footage:</th>\n            <td>").concat(loanData.squareFootage ? loanData.squareFootage.toLocaleString() + " sq ft" : "Not Provided", "</td>\n          </tr>\n          <tr>\n            <th>Construction Type:</th>\n            <td>").concat(loanData.propertyType.includes("commercial") ? "Masonry Non-Combustible" : "Frame", "</td>\n          </tr>\n          <tr>\n            <th>Occupancy:</th>\n            <td>").concat(loanData.propertyType.includes("single_family") ? "Single Family Rental" :
        loanData.propertyType.includes("multi_family") ? "Multi-Family Rental" :
            "Commercial", "</td>\n          </tr>\n          <tr>\n            <th>Protection Class:</th>\n            <td>Class ").concat(Math.floor(Math.random() * 5) + 1, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Coverage Summary</div>\n        <table class=\"coverage-table\">\n          <tr>\n            <th>Coverage</th>\n            <th>Limit</th>\n            <th>Deductible</th>\n            <th>Premium</th>\n          </tr>\n          <tr>\n            <td>Building</td>\n            <td>").concat(formatCurrency(buildingCoverage), "</td>\n            <td>").concat(formatCurrency(standardDeductible), "</td>\n            <td>").concat(formatCurrency(Math.round(annualPremium * 0.7)), "</td>\n          </tr>\n          <tr>\n            <td>Business Personal Property / Contents</td>\n            <td>").concat(formatCurrency(contentsCoverage), "</td>\n            <td>").concat(formatCurrency(standardDeductible), "</td>\n            <td>").concat(formatCurrency(Math.round(annualPremium * 0.1)), "</td>\n          </tr>\n          <tr>\n            <td>Loss of Rents / Business Income</td>\n            <td>").concat(formatCurrency(lossOfRentsCoverage), " (6 months)</td>\n            <td>72 Hours</td>\n            <td>").concat(formatCurrency(Math.round(annualPremium * 0.1)), "</td>\n          </tr>\n          <tr>\n            <td>General Liability</td>\n            <td>").concat(formatCurrency(liabilityCoverage), " each occurrence<br>\n                ").concat(formatCurrency(liabilityCoverage * 2), " aggregate</td>\n            <td>None</td>\n            <td>").concat(formatCurrency(Math.round(annualPremium * 0.08)), "</td>\n          </tr>\n          <tr>\n            <td>Medical Payments</td>\n            <td>").concat(formatCurrency(medicalCoverage), " per person</td>\n            <td>None</td>\n            <td>").concat(formatCurrency(Math.round(annualPremium * 0.02)), "</td>\n          </tr>\n          <tr>\n            <td colspan=\"3\" style=\"text-align: right; font-weight: bold;\">Total Annual Premium:</td>\n            <td style=\"font-weight: bold;\">").concat(formatCurrency(annualPremium), "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Optional Coverages & Endorsements</div>\n        <table class=\"coverage-table\">\n          <tr>\n            <th>Coverage</th>\n            <th>Limit</th>\n            <th>Deductible</th>\n            <th>Included</th>\n          </tr>\n          <tr>\n            <td>Ordinance or Law</td>\n            <td>25% of Building Limit</td>\n            <td>Same as Building</td>\n            <td>Yes</td>\n          </tr>\n          <tr>\n            <td>Equipment Breakdown</td>\n            <td>Building Limit</td>\n            <td>").concat(formatCurrency(standardDeductible), "</td>\n            <td>Yes</td>\n          </tr>\n          <tr>\n            <td>Wind/Hail</td>\n            <td>Building Limit</td>\n            <td>").concat(formatCurrency(windHailDeductible), "</td>\n            <td>Yes</td>\n          </tr>\n          <tr>\n            <td>Flood</td>\n            <td>Not Covered</td>\n            <td>N/A</td>\n            <td>No</td>\n          </tr>\n          <tr>\n            <td>Earthquake</td>\n            <td>Not Covered</td>\n            <td>N/A</td>\n            <td>No</td>\n          </tr>\n        </table>\n        \n        <div class=\"notice\">\n          <p><strong>Note:</strong> Flood and Earthquake coverages are not included in this policy. Separate policies may be required for these perils.</p>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Mortgagee / Loss Payee</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Mortgagee:</th>\n            <td>Harrington Capital Partners<br>\n                123 Financial Plaza, Suite 400<br>\n                Boston, MA 02110<br>\n                Loan #: ").concat(loanData.id, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Additional Information</div>\n        <ul>\n          <li>This is a summary of your insurance coverage. Please refer to your policy for complete terms, conditions, limitations, and exclusions.</li>\n          <li>This policy is subject to minimum earned premium of 25%.</li>\n          <li>Cancellation by insured: Short rate penalty may apply.</li>\n          <li>Cancellation by company: Pro-rata return premium.</li>\n          <li>Policy forms: ").concat(policyNumber.substring(0, 3)).concat(Math.floor(Math.random() * 100), "-").concat(Math.floor(Math.random() * 900) + 100, "</li>\n        </ul>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Claims Information</div>\n        <p>To report a claim, please contact:</p>\n        <p>\n          <strong>Claims Department</strong><br>\n          Phone: ").concat(insuranceCompany.phone, " (24/7 Claims Hotline)<br>\n          Email: ").concat(insuranceCompany.email, "<br>\n          Online: ").concat(insuranceCompany.website, "/claims\n        </p>\n        <div class=\"highlight\">\n          <p>Please have your policy number available when reporting a claim.</p>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Producer / Agent Information</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Agent:</th>\n            <td>").concat(agent.name, "</td>\n          </tr>\n          <tr>\n            <th>Agency:</th>\n            <td>").concat(agent.company, "</td>\n          </tr>\n          <tr>\n            <th>Address:</th>\n            <td>").concat(agent.address, "</td>\n          </tr>\n          <tr>\n            <th>Phone:</th>\n            <td>").concat(agent.phone, "</td>\n          </tr>\n          <tr>\n            <th>Email:</th>\n            <td>").concat(agent.email, "</td>\n          </tr>\n          <tr>\n            <th>License #:</th>\n            <td>").concat(agent.license, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"signature-section\">\n        <p>Countersigned and dated at ").concat(insuranceCompany.address.split(',')[0], ":</p>\n        <div style=\"margin-top: 20px;\">\n          <div class=\"signature-line\"></div>\n          <p>Authorized Representative</p>\n        </div>\n        <p>Issue Date: ").concat(currentDate, "</p>\n      </div>\n      \n      <div class=\"footer\">\n        <p>THIS DECLARATIONS PAGE, ALONG WITH THE COMMON POLICY CONDITIONS, COVERAGE FORM(S) AND ENDORSEMENTS, COMPLETES THE POLICY.</p>\n        <p>Policy Number: ").concat(policyNumber, " | Insured: ").concat(loanData.entityName || loanData.borrowerName, " | Effective: ").concat(policyStartDate, "</p>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Property Insurance Policy Declarations - ".concat(loanData.borrowerName), content);
};
exports.getPropertyInsurancePolicyTemplate = getPropertyInsurancePolicyTemplate;
/**
 * Flood Insurance Policy Template
 * Generates a comprehensive flood insurance declaration page based on NFIP standards
 */
var getFloodInsurancePolicyTemplate = function (loanData) {
    var currentDate = formatDate();
    var policyNumber = "FIP-".concat(new Date().getFullYear(), "-").concat(Math.floor(10000 + Math.random() * 90000));
    // Calculate policy period (1 year)
    var policyStartDate = currentDate;
    var policyEndDate = getFutureDate(365);
    // Calculate insurance amounts
    var propertyValue = loanData.propertyValue || loanData.purchasePrice || (loanData.loanAmount * (100 / loanData.ltv));
    var buildingCoverage = Math.min(500000, Math.round(propertyValue * 0.8)); // NFIP limit is $500K for commercial
    var contentsCoverage = Math.min(100000, Math.round(propertyValue * 0.2)); // NFIP limit is $100K for contents
    // Calculate deductibles and premiums
    var buildingDeductible = 5000; // Standard NFIP deductible
    var contentsDeductible = 5000; // Standard NFIP deductible
    // Determine flood zone (simplified)
    var floodZones = ['X', 'A', 'AE', 'AH', 'AO', 'V', 'VE'];
    var floodZone = loanData.floodZone || floodZones[Math.floor(Math.random() * floodZones.length)];
    // Calculate premium based on flood zone (simplified)
    var isHighRiskZone = ['A', 'AE', 'AH', 'AO', 'V', 'VE'].includes(floodZone);
    var annualPremium = 0;
    if (isHighRiskZone) {
        annualPremium = Math.round(buildingCoverage * 0.007); // 0.7% for high-risk zones
    }
    else {
        annualPremium = Math.round(buildingCoverage * 0.003); // 0.3% for moderate to low-risk zones
    }
    // Calculate ICC premium (Increased Cost of Compliance)
    var iccPremium = isHighRiskZone ? 75 : 6;
    // Calculate total premium
    var totalPremium = annualPremium + iccPremium;
    var federalPolicyFee = 25;
    var reserveFundAssessment = Math.round(totalPremium * 0.18); // 18% of premium
    var hfiaaAssessment = isHighRiskZone ? Math.round(totalPremium * 0.15) : 25; // 15% of premium for high-risk
    var totalWithFees = totalPremium + federalPolicyFee + reserveFundAssessment + hfiaaAssessment;
    // Community information (simplified)
    var communityNumber = "".concat(loanData.state || 'MA').concat(Math.floor(1000 + Math.random() * 9000));
    // Replacement Cost Value calculation
    var replacementCost = Math.round(propertyValue * 1.2); // 120% of property value
    // Generate insurance company information
    // For flood insurance, we'll use "NFIP Direct" or servicing companies
    var floodInsurers = [
        {
            name: "NFIP Direct",
            address: "P.O. Box 2965, Shawnee Mission, KS 66201",
            phone: "(800) 638-6620",
            website: "www.fema.gov/nfip",
            email: "info@nfipdirect.fema.gov"
        },
        {
            name: "Wright Flood Insurance Services",
            address: "801 94th Avenue North, St. Petersburg, FL 33702",
            phone: "(866) 373-5663",
            website: "www.wrightflood.com",
            email: "floodcustomercare@weareflood.com"
        },
        {
            name: "Selective Flood",
            address: "40 Wantage Avenue, Branchville, NJ 07890",
            phone: "(877) 348-0552",
            website: "www.selectiveflood.com",
            email: "floodcustomerservice@selective.com"
        }
    ];
    var insurer = floodInsurers[Math.floor(Math.random() * floodInsurers.length)];
    // Generate agent information
    var agents = [
        {
            name: "Robert Williams",
            company: "Williams Insurance Agency",
            address: "555 Broker Street, Suite 200, Boston, MA 02110",
            phone: "(617) 555-2345",
            email: "rwilliams@williamsinsurance.com",
            license: "BK-789456"
        },
        {
            name: "Jennifer Martinez",
            company: "Premier Insurance Solutions",
            address: "888 Coverage Lane, Suite 300, Boston, MA 02108",
            phone: "(617) 555-8765",
            email: "jmartinez@premierinsurance.com",
            license: "BK-456123"
        },
        {
            name: "Michael Chen",
            company: "Guardian Insurance Services",
            address: "777 Protection Plaza, Suite 150, Boston, MA 02116",
            phone: "(617) 555-9876",
            email: "mchen@guardianinsurance.com",
            license: "BK-123987"
        }
    ];
    var agent = agents[Math.floor(Math.random() * agents.length)];
    var content = "\n    <div class=\"document\">\n      <div class=\"letterhead\">\n        <div class=\"letterhead-logo\">\n          ".concat(insurer.name.toUpperCase(), "\n        </div>\n        <div class=\"letterhead-contact\">\n          ").concat(insurer.address, "<br>\n          ").concat(insurer.phone, "<br>\n          ").concat(insurer.website, "<br>\n          FEMA/NFIP Approved Provider\n        </div>\n      </div>\n      \n      <div class=\"document-header\">\n        <div class=\"document-title\">Flood Insurance Policy Declarations</div>\n        <div class=\"document-subtitle\">Policy Number: ").concat(policyNumber, "</div>\n      </div>\n      \n      <div class=\"policy-stamp\">FLOOD INSURANCE DECLARATIONS</div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Policy Information</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Named Insured:</th>\n            <td>").concat(loanData.entityName || loanData.borrowerName, "</td>\n          </tr>\n          <tr>\n            <th>Mailing Address:</th>\n            <td>").concat(loanData.borrowerAddress || "Same as Property Address", "</td>\n          </tr>\n          <tr>\n            <th>Policy Period:</th>\n            <td>From: ").concat(policyStartDate, " To: ").concat(policyEndDate, " (12:01 AM Standard Time)</td>\n          </tr>\n          <tr>\n            <th>Policy Form:</th>\n            <td>").concat(loanData.propertyType.includes("commercial") ? "General Property Form" : "Standard Flood Insurance Policy", "</td>\n          </tr>\n          <tr>\n            <th>Community Number:</th>\n            <td>").concat(communityNumber, "</td>\n          </tr>\n          <tr>\n            <th>Flood Zone:</th>\n            <td>").concat(floodZone).concat(isHighRiskZone ? " (High Risk)" : " (Moderate/Low Risk)", "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Property Information</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Insured Location:</th>\n            <td>").concat(loanData.propertyAddress, "</td>\n          </tr>\n          <tr>\n            <th>Property Type:</th>\n            <td>").concat(loanData.propertyType.replace(/_/g, " ").replace(/\b\w/g, function (l) { return l.toUpperCase(); }), "</td>\n          </tr>\n          <tr>\n            <th>Building Occupancy:</th>\n            <td>").concat(loanData.propertyType.includes("commercial") ? "Non-Residential" : "Other Residential", "</td>\n          </tr>\n          <tr>\n            <th>Number of Floors:</th>\n            <td>").concat(loanData.propertyType.includes("single_family") ? "1-2" :
        loanData.propertyType.includes("multi_family") ? "2-4" :
            loanData.propertyType.includes("multi_family_5plus") ? "5+" : "1-2", "</td>\n          </tr>\n          <tr>\n            <th>Building Description:</th>\n            <td>").concat(loanData.propertyType.includes("single_family") ? "Single Family" :
        loanData.propertyType.includes("multi_family") ? "Multi-Family" :
            "Non-Residential Building", "</td>\n          </tr>\n          <tr>\n            <th>Replacement Cost Value:</th>\n            <td>").concat(formatCurrency(replacementCost), "</td>\n          </tr>\n          <tr>\n            <th>Base Flood Elevation:</th>\n            <td>").concat(isHighRiskZone ? Math.floor(Math.random() * 20) + 5 + " feet" : "N/A", "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Coverage Summary</div>\n        <table class=\"coverage-table\">\n          <tr>\n            <th>Coverage</th>\n            <th>Limit</th>\n            <th>Deductible</th>\n            <th>Premium</th>\n          </tr>\n          <tr>\n            <td>Building Coverage</td>\n            <td>").concat(formatCurrency(buildingCoverage), "</td>\n            <td>").concat(formatCurrency(buildingDeductible), "</td>\n            <td>").concat(formatCurrency(annualPremium), "</td>\n          </tr>\n          <tr>\n            <td>Contents Coverage</td>\n            <td>").concat(formatCurrency(contentsCoverage), "</td>\n            <td>").concat(formatCurrency(contentsDeductible), "</td>\n            <td>").concat(formatCurrency(0), "</td>\n          </tr>\n          <tr>\n            <td>Increased Cost of Compliance (ICC)</td>\n            <td>").concat(formatCurrency(30000), "</td>\n            <td>N/A</td>\n            <td>").concat(formatCurrency(iccPremium), "</td>\n          </tr>\n          <tr>\n            <td colspan=\"3\">Subtotal</td>\n            <td>").concat(formatCurrency(totalPremium), "</td>\n          </tr>\n          <tr>\n            <td colspan=\"3\">Federal Policy Fee</td>\n            <td>").concat(formatCurrency(federalPolicyFee), "</td>\n          </tr>\n          <tr>\n            <td colspan=\"3\">Reserve Fund Assessment (18%)</td>\n            <td>").concat(formatCurrency(reserveFundAssessment), "</td>\n          </tr>\n          <tr>\n            <td colspan=\"3\">HFIAA Surcharge</td>\n            <td>").concat(formatCurrency(hfiaaAssessment), "</td>\n          </tr>\n          <tr>\n            <td colspan=\"3\" style=\"text-align: right; font-weight: bold;\">Total Annual Premium:</td>\n            <td style=\"font-weight: bold;\">").concat(formatCurrency(totalWithFees), "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Additional Information</div>\n        <ul>\n          <li>This policy meets the federal mandatory purchase requirement for properties in high-risk flood zones.</li>\n          <li>30-day waiting period may apply to new policies unless for loan closing or map revision.</li>\n          <li>Coverage is subject to the terms and conditions of the Standard Flood Insurance Policy.</li>\n          <li>This policy does not provide coverage for damage to land, landscaping, decks, fences, or swimming pools.</li>\n          <li>Some items in basements and below-lowest-elevated-floor have limited or no coverage.</li>\n        </ul>\n        \n        <div class=\"warning\">\n          <p><strong>Important Notice:</strong> This policy provides coverage on a replacement cost basis only if the insured property is your principal residence and the building is insured to at least 80% of its replacement cost.</p>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Mortgagee / Loss Payee</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>First Mortgagee:</th>\n            <td>Harrington Capital Partners<br>\n                123 Financial Plaza, Suite 400<br>\n                Boston, MA 02110<br>\n                Loan #: ").concat(loanData.id, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Claims Information</div>\n        <p>In the event of flood damage, contact your agent or insurer immediately. To file a claim:</p>\n        <ol>\n          <li>Call ").concat(insurer.phone, " or visit ").concat(insurer.website, "</li>\n          <li>Have your policy number and contact information ready</li>\n          <li>Take photos of all damaged property before removing or disposing of items</li>\n          <li>Create a detailed inventory of all damaged property</li>\n        </ol>\n        <div class=\"highlight\">\n          <p>Claims should be reported as soon as possible, but no later than 60 days after the date of loss.</p>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Producer / Agent Information</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Agent:</th>\n            <td>").concat(agent.name, "</td>\n          </tr>\n          <tr>\n            <th>Agency:</th>\n            <td>").concat(agent.company, "</td>\n          </tr>\n          <tr>\n            <th>Address:</th>\n            <td>").concat(agent.address, "</td>\n          </tr>\n          <tr>\n            <th>Phone:</th>\n            <td>").concat(agent.phone, "</td>\n          </tr>\n          <tr>\n            <th>Email:</th>\n            <td>").concat(agent.email, "</td>\n          </tr>\n          <tr>\n            <th>License #:</th>\n            <td>").concat(agent.license, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"signature-section\">\n        <p>This policy is issued pursuant to the National Flood Insurance Act of 1968, as amended, and applicable Federal Regulations.</p>\n        <div style=\"margin-top: 20px;\">\n          <div class=\"signature-line\"></div>\n          <p>Authorized Representative</p>\n        </div>\n        <p>Issue Date: ").concat(currentDate, "</p>\n      </div>\n      \n      <div class=\"footer\">\n        <p>THIS DECLARATIONS PAGE IS NOT A COMPLETE POLICY DOCUMENT. PLEASE REFER TO THE STANDARD FLOOD INSURANCE POLICY FOR COMPLETE TERMS AND CONDITIONS.</p>\n        <p>Policy Number: ").concat(policyNumber, " | Insured: ").concat(loanData.entityName || loanData.borrowerName, " | Effective: ").concat(policyStartDate, "</p>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Flood Insurance Policy Declarations - ".concat(loanData.borrowerName), content);
};
exports.getFloodInsurancePolicyTemplate = getFloodInsurancePolicyTemplate;
/**
 * Builder's Risk Policy Template
 * Generates a comprehensive builder's risk insurance policy for construction/renovation projects
 */
var getBuildersRiskPolicyTemplate = function (loanData) {
    var currentDate = formatDate();
    var policyNumber = "BRP-".concat(new Date().getFullYear(), "-").concat(Math.floor(10000 + Math.random() * 90000));
    // Calculate policy period (based on loan term or fixed duration)
    var policyStartDate = currentDate;
    var constructionDuration = 12; // Default to 12 months
    var policyEndDate = getFutureDate(constructionDuration * 30);
    // Calculate insurance amounts
    var projectValue = loanData.propertyValue || loanData.purchasePrice || (loanData.loanAmount * (100 / loanData.ltv));
    var constructionCost = Math.round(projectValue * 0.7); // Estimate construction cost as 70% of total value
    // Calculate coverage limits based on construction cost
    var basicCoverage = constructionCost; // Full value of construction
    var extendedCoverage = Math.round(constructionCost * 0.1); // 10% for extended coverage
    var debrisCoverage = Math.round(constructionCost * 0.05); // 5% for debris removal
    var transitCoverage = Math.round(constructionCost * 0.02); // 2% for materials in transit
    var tempStructuresCoverage = Math.round(constructionCost * 0.03); // 3% for temporary structures
    // Calculate deductibles
    var standardDeductible = Math.max(2500, Math.min(10000, Math.round(constructionCost * 0.005))); // 0.5% with min and max
    var waterDeductible = standardDeductible * 2; // Double for water damage
    var windDeductible = Math.round(constructionCost * 0.02); // 2% for wind/hail
    // Calculate premium (simplified calculation)
    var ratePerHundred = 0.35; // $0.35 per $100 of construction cost
    var annualPremium = Math.round((constructionCost / 100) * ratePerHundred);
    var totalPremium = Math.round(annualPremium * (constructionDuration / 12)); // Prorated for construction period
    // Add taxes and fees
    var taxRate = 0.0275; // 2.75% tax rate
    var taxes = Math.round(totalPremium * taxRate);
    var policyFee = 250;
    var totalWithFees = totalPremium + taxes + policyFee;
    // Generate insurance company information
    var insuranceCompanies = [
        {
            name: "Builders Guard Insurance",
            address: "789 Construction Way, Hartford, CT 06103",
            phone: "(800) 555-4321",
            website: "www.buildersguardinsurance.com",
            email: "claims@buildersguardinsurance.com",
            rating: "A (Excellent)"
        },
        {
            name: "ProjectShield Insurance Company",
            address: "456 Development Blvd, Chicago, IL 60601",
            phone: "(800) 777-5432",
            website: "www.projectshieldinsurance.com",
            email: "claims@projectshieldinsurance.com",
            rating: "A+ (Superior)"
        },
        {
            name: "Construction Risk Specialists",
            address: "123 Builder's Plaza, Dallas, TX 75201",
            phone: "(800) 888-9876",
            website: "www.constructionriskspecialists.com",
            email: "claims@constructionriskspecialists.com",
            rating: "A (Excellent)"
        }
    ];
    var insuranceCompany = insuranceCompanies[Math.floor(Math.random() * insuranceCompanies.length)];
    // Generate agent information
    var agents = [
        {
            name: "Thomas Reynolds",
            company: "Reynolds Construction Insurance",
            address: "555 Builder Street, Suite 300, Boston, MA 02110",
            phone: "(617) 555-7890",
            email: "treynolds@reynoldsins.com",
            license: "BK-345678"
        },
        {
            name: "Sarah Johnson",
            company: "Project Insurance Solutions",
            address: "888 Development Lane, Suite 400, Boston, MA 02108",
            phone: "(617) 555-3456",
            email: "sjohnson@projectinsurance.com",
            license: "BK-567123"
        },
        {
            name: "David Washington",
            company: "Builder's Risk Partners",
            address: "777 Construction Plaza, Suite 250, Boston, MA 02116",
            phone: "(617) 555-8901",
            email: "dwashington@buildersriskpartners.com",
            license: "BK-890123"
        }
    ];
    var agent = agents[Math.floor(Math.random() * agents.length)];
    // Generate contractor information (if not specified in loan data)
    var contractors = [
        {
            name: "Prestige Construction Group",
            address: "123 Builder's Avenue, Boston, MA 02110",
            phone: "(617) 555-2468",
            license: "GC-987654"
        },
        {
            name: "Elite Development & Construction",
            address: "456 Contractor Lane, Boston, MA 02108",
            phone: "(617) 555-1357",
            license: "GC-876543"
        },
        {
            name: "Cornerstone Builders Inc.",
            address: "789 Construction Boulevard, Boston, MA 02116",
            phone: "(617) 555-9753",
            license: "GC-765432"
        }
    ];
    var contractor = contractors[Math.floor(Math.random() * contractors.length)];
    var content = "\n    <div class=\"document\">\n      <div class=\"letterhead\">\n        <div class=\"letterhead-logo\">\n          ".concat(insuranceCompany.name.toUpperCase(), "\n        </div>\n        <div class=\"letterhead-contact\">\n          ").concat(insuranceCompany.address, "<br>\n          ").concat(insuranceCompany.phone, "<br>\n          ").concat(insuranceCompany.website, "<br>\n          Rating: ").concat(insuranceCompany.rating, "\n        </div>\n      </div>\n      \n      <div class=\"document-header\">\n        <div class=\"document-title\">Builder's Risk Insurance Policy</div>\n        <div class=\"document-subtitle\">Policy Number: ").concat(policyNumber, "</div>\n      </div>\n      \n      <div class=\"policy-stamp\">BUILDER'S RISK DECLARATIONS</div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Policy Information</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Named Insured:</th>\n            <td>").concat(loanData.entityName || loanData.borrowerName, "</td>\n          </tr>\n          <tr>\n            <th>Mailing Address:</th>\n            <td>").concat(loanData.borrowerAddress || "Same as Project Address", "</td>\n          </tr>\n          <tr>\n            <th>Policy Period:</th>\n            <td>From: ").concat(policyStartDate, " To: ").concat(policyEndDate, " (12:01 AM Standard Time)</td>\n          </tr>\n          <tr>\n            <th>Policy Type:</th>\n            <td>Builder's Risk - All Risk Form</td>\n          </tr>\n          <tr>\n            <th>Project Type:</th>\n            <td>").concat(loanData.loanPurpose && loanData.loanPurpose.includes("renovation") ? "Renovation" :
        loanData.loanPurpose && loanData.loanPurpose.includes("construction") ? "New Construction" :
            "Building Renovation/Construction", "</td>\n          </tr>\n          <tr>\n            <th>Construction Type:</th>\n            <td>").concat(loanData.propertyType.includes("commercial") ? "Non-Combustible/Masonry" :
        loanData.propertyType.includes("multi_family") ? "Joisted Masonry" : "Frame", "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Project Information</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Project Location:</th>\n            <td>").concat(loanData.propertyAddress, "</td>\n          </tr>\n          <tr>\n            <th>Project Description:</th>\n            <td>").concat(loanData.loanPurpose && loanData.loanPurpose.includes("renovation") ?
        "Complete renovation of existing " + loanData.propertyType.replace(/_/g, " ") + " property" :
        loanData.loanPurpose && loanData.loanPurpose.includes("construction") ?
            "New construction of " + loanData.propertyType.replace(/_/g, " ") + " property" :
            "Building renovation/construction project", "</td>\n          </tr>\n          <tr>\n            <th>Project Value:</th>\n            <td>").concat(formatCurrency(projectValue), "</td>\n          </tr>\n          <tr>\n            <th>Construction Cost:</th>\n            <td>").concat(formatCurrency(constructionCost), "</td>\n          </tr>\n          <tr>\n            <th>Estimated Completion:</th>\n            <td>").concat(policyEndDate, "</td>\n          </tr>\n          <tr>\n            <th>Square Footage:</th>\n            <td>").concat(loanData.squareFootage ? loanData.squareFootage.toLocaleString() + " sq ft" : "Not Provided", "</td>\n          </tr>\n          <tr>\n            <th>Number of Stories:</th>\n            <td>").concat(loanData.propertyType.includes("single_family") ? "1-2" :
        loanData.propertyType.includes("multi_family") ? "2-4" :
            loanData.propertyType.includes("multi_family_5plus") ? "5+" : "1-3", "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Contractor Information</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>General Contractor:</th>\n            <td>").concat(contractor.name, "</td>\n          </tr>\n          <tr>\n            <th>Contractor Address:</th>\n            <td>").concat(contractor.address, "</td>\n          </tr>\n          <tr>\n            <th>Contractor Phone:</th>\n            <td>").concat(contractor.phone, "</td>\n          </tr>\n          <tr>\n            <th>Contractor License:</th>\n            <td>").concat(contractor.license, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Coverage Summary</div>\n        <table class=\"coverage-table\">\n          <tr>\n            <th>Coverage</th>\n            <th>Limit</th>\n            <th>Deductible</th>\n          </tr>\n          <tr>\n            <td>Covered Property (Hard Costs)</td>\n            <td>").concat(formatCurrency(basicCoverage), "</td>\n            <td>").concat(formatCurrency(standardDeductible), "</td>\n          </tr>\n          <tr>\n            <td>Extended Coverage (Soft Costs)</td>\n            <td>").concat(formatCurrency(extendedCoverage), "</td>\n            <td>").concat(formatCurrency(standardDeductible), "</td>\n          </tr>\n          <tr>\n            <td>Property in Transit</td>\n            <td>").concat(formatCurrency(transitCoverage), "</td>\n            <td>").concat(formatCurrency(standardDeductible), "</td>\n          </tr>\n          <tr>\n            <td>Temporary Structures</td>\n            <td>").concat(formatCurrency(tempStructuresCoverage), "</td>\n            <td>").concat(formatCurrency(standardDeductible), "</td>\n          </tr>\n          <tr>\n            <td>Debris Removal</td>\n            <td>").concat(formatCurrency(debrisCoverage), "</td>\n            <td>").concat(formatCurrency(standardDeductible), "</td>\n          </tr>\n          <tr>\n            <td>Water Damage</td>\n            <td>Included in Covered Property</td>\n            <td>").concat(formatCurrency(waterDeductible), "</td>\n          </tr>\n          <tr>\n            <td>Wind/Hail Damage</td>\n            <td>Included in Covered Property</td>\n            <td>").concat(formatCurrency(windDeductible), " or ").concat(Math.round(constructionCost * 0.02), "% of value</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Premium Details</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Base Premium:</th>\n            <td>").concat(formatCurrency(totalPremium), "</td>\n          </tr>\n          <tr>\n            <th>Tax (").concat((taxRate * 100).toFixed(2), "%):</th>\n            <td>").concat(formatCurrency(taxes), "</td>\n          </tr>\n          <tr>\n            <th>Policy Fee:</th>\n            <td>").concat(formatCurrency(policyFee), "</td>\n          </tr>\n          <tr class=\"highlight\">\n            <th>Total Premium:</th>\n            <td>").concat(formatCurrency(totalWithFees), "</td>\n          </tr>\n          <tr>\n            <th>Payment Terms:</th>\n            <td>Premium is fully earned at policy inception</td>\n          </tr>\n        </table>\n        \n        <div class=\"notice\">\n          <p><strong>Note:</strong> This policy does not automatically extend beyond the expiration date. If the project is not completed by the expiration date, you must request an extension prior to expiration.</p>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Policy Provisions & Exclusions</div>\n        <div class=\"subsection-title\">Covered Causes of Loss:</div>\n        <p>This policy provides \"all-risk\" coverage for direct physical loss or damage to covered property, subject to the exclusions and limitations in the policy.</p>\n        \n        <div class=\"subsection-title\">Key Exclusions:</div>\n        <ul>\n          <li>Earthquake, unless endorsement is added</li>\n          <li>Flood, unless endorsement is added</li>\n          <li>Acts of terrorism, unless endorsed</li>\n          <li>Employee theft and dishonesty</li>\n          <li>Mechanical breakdown</li>\n          <li>Design error or faulty workmanship (consequences of faulty workmanship may be covered)</li>\n          <li>Normal wear and tear, deterioration</li>\n          <li>Delay, loss of market, loss of use</li>\n          <li>Mold and fungus (limited coverage may apply)</li>\n        </ul>\n        \n        <div class=\"subsection-title\">Policy Conditions:</div>\n        <ul>\n          <li>Monthly reporting of increases in project value may be required</li>\n          <li>Site security measures must be maintained at all times</li>\n          <li>Fire protection requirements must be met</li>\n          <li>All work must be performed in accordance with building codes</li>\n          <li>Proper storage of materials and equipment is required</li>\n        </ul>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Endorsements & Special Conditions</div>\n        <table class=\"coverage-table\">\n          <tr>\n            <th>Endorsement</th>\n            <th>Description</th>\n            <th>Status</th>\n          </tr>\n          <tr>\n            <td>Testing Coverage</td>\n            <td>Coverage for damage during testing of systems</td>\n            <td>Included</td>\n          </tr>\n          <tr>\n            <td>Permission to Occupy</td>\n            <td>Allows partial occupancy during construction</td>\n            <td>Included</td>\n          </tr>\n          <tr>\n            <td>Scaffolding & Formwork</td>\n            <td>Coverage for temporary structures</td>\n            <td>Included</td>\n          </tr>\n          <tr>\n            <td>Ordinance or Law</td>\n            <td>Coverage for increased costs due to building codes</td>\n            <td>Included</td>\n          </tr>\n          <tr>\n            <td>Expediting Expenses</td>\n            <td>Coverage for additional expenses to expedite repair</td>\n            <td>Included</td>\n          </tr>\n          <tr>\n            <td>Earthquake</td>\n            <td>Coverage for earthquake damage</td>\n            <td>Excluded</td>\n          </tr>\n          <tr>\n            <td>Flood</td>\n            <td>Coverage for flood damage</td>\n            <td>Excluded</td>\n          </tr>\n        </table>\n        \n        <div class=\"warning\">\n          <p><strong>Important Notice:</strong> Separate policies or endorsements may be required for flood or earthquake coverage. Consult with your agent about these additional coverages.</p>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Mortgagee / Loss Payee</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Mortgagee:</th>\n            <td>Harrington Capital Partners<br>\n                123 Financial Plaza, Suite 400<br>\n                Boston, MA 02110<br>\n                Loan #: ").concat(loanData.id, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Claims Information</div>\n        <p>In the event of loss or damage to covered property:</p>\n        <ol>\n          <li>Protect the property from further damage</li>\n          <li>Contact your agent or call our claims department at ").concat(insuranceCompany.phone, "</li>\n          <li>Submit a written notice of claim within 48 hours</li>\n          <li>Document all damage with photographs</li>\n          <li>Prepare an inventory of damaged property</li>\n          <li>Cooperate with our claims adjuster during the investigation</li>\n        </ol>\n        <div class=\"highlight\">\n          <p>Claims should be reported as soon as possible after discovery of damage.</p>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Producer / Agent Information</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Agent:</th>\n            <td>").concat(agent.name, "</td>\n          </tr>\n          <tr>\n            <th>Agency:</th>\n            <td>").concat(agent.company, "</td>\n          </tr>\n          <tr>\n            <th>Address:</th>\n            <td>").concat(agent.address, "</td>\n          </tr>\n          <tr>\n            <th>Phone:</th>\n            <td>").concat(agent.phone, "</td>\n          </tr>\n          <tr>\n            <th>Email:</th>\n            <td>").concat(agent.email, "</td>\n          </tr>\n          <tr>\n            <th>License #:</th>\n            <td>").concat(agent.license, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"signature-section\">\n        <p>This policy is subject to all terms, conditions, limitations, and exclusions contained in the policy form and endorsements.</p>\n        <div style=\"margin-top: 20px;\">\n          <div class=\"signature-line\"></div>\n          <p>Authorized Representative</p>\n        </div>\n        <p>Issue Date: ").concat(currentDate, "</p>\n      </div>\n      \n      <div class=\"footer\">\n        <p>THIS DECLARATIONS PAGE, TOGETHER WITH THE BUILDER'S RISK POLICY FORM AND ENDORSEMENTS, COMPLETES THE POLICY.</p>\n        <p>Policy Number: ").concat(policyNumber, " | Insured: ").concat(loanData.entityName || loanData.borrowerName, " | Project: ").concat(loanData.propertyAddress, "</p>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Builder's Risk Policy Declarations - ".concat(loanData.borrowerName), content);
};
exports.getBuildersRiskPolicyTemplate = getBuildersRiskPolicyTemplate;
/**
 * General Liability Insurance Policy Template
 * Generates a comprehensive liability insurance policy for real estate owners/investors
 */
var getLiabilityInsurancePolicyTemplate = function (loanData) {
    var currentDate = formatDate();
    var policyNumber = "LIP-".concat(new Date().getFullYear(), "-").concat(Math.floor(10000 + Math.random() * 90000));
    // Calculate policy period (1 year)
    var policyStartDate = currentDate;
    var policyEndDate = getFutureDate(365);
    // Calculate insurance amounts based on property type and value
    var propertyValue = loanData.propertyValue || loanData.purchasePrice || (loanData.loanAmount * (100 / loanData.ltv));
    // Set coverage limits based on property type
    var generalLiabilityPerOccurrence = 0;
    var generalLiabilityAggregate = 0;
    var productsCompletedOperations = 0;
    var personalAdvertisingInjury = 0;
    var medicalExpense = 0;
    var damageToRentedPremises = 0;
    // Adjust coverage limits based on property type and value
    if (loanData.propertyType.includes("commercial")) {
        generalLiabilityPerOccurrence = 1000000;
        generalLiabilityAggregate = 2000000;
        productsCompletedOperations = 2000000;
        personalAdvertisingInjury = 1000000;
        medicalExpense = 10000;
        damageToRentedPremises = 300000;
    }
    else if (loanData.propertyType.includes("multi_family_5plus")) {
        generalLiabilityPerOccurrence = 1000000;
        generalLiabilityAggregate = 2000000;
        productsCompletedOperations = 2000000;
        personalAdvertisingInjury = 1000000;
        medicalExpense = 5000;
        damageToRentedPremises = 100000;
    }
    else {
        // Single family or small multi-family
        generalLiabilityPerOccurrence = 500000;
        generalLiabilityAggregate = 1000000;
        productsCompletedOperations = 1000000;
        personalAdvertisingInjury = 500000;
        medicalExpense = 5000;
        damageToRentedPremises = 50000;
    }
    // For high-value properties, increase limits
    if (propertyValue > 2000000) {
        generalLiabilityPerOccurrence *= 2;
        generalLiabilityAggregate *= 2;
        productsCompletedOperations *= 2;
        personalAdvertisingInjury *= 2;
        damageToRentedPremises *= 2;
    }
    // Optional coverages
    var hasNonownedAutoLiability = Math.random() > 0.5;
    var hasEmployeeBenefitsLiability = loanData.propertyType.includes("commercial") || Math.random() > 0.7;
    var hasEmploymentPracticesLiability = loanData.propertyType.includes("commercial") || Math.random() > 0.8;
    // Calculate premium based on coverage limits and property type
    var baseRatePerThousand = loanData.propertyType.includes("commercial") ? 1.5 :
        loanData.propertyType.includes("multi_family_5plus") ? 1.2 :
            loanData.propertyType.includes("multi_family") ? 0.9 : 0.6;
    var exposureBasis = Math.max(propertyValue / 1000, 100); // Minimum $100k exposure base
    var basePremium = Math.round(exposureBasis * baseRatePerThousand);
    // Additional premium for optional coverages
    var nonownedAutoPremium = hasNonownedAutoLiability ? 250 : 0;
    var employeeBenefitsPremium = hasEmployeeBenefitsLiability ? 350 : 0;
    var employmentPracticesPremium = hasEmploymentPracticesLiability ? 500 : 0;
    // Calculating taxes and fees
    var totalBasePremium = basePremium + nonownedAutoPremium + employeeBenefitsPremium + employmentPracticesPremium;
    var stateTax = Math.round(totalBasePremium * 0.02); // 2% state tax
    var policyFee = 150;
    var stampingFee = Math.round(totalBasePremium * 0.003); // 0.3% stamping fee
    var totalAnnualPremium = totalBasePremium + stateTax + policyFee + stampingFee;
    // Generate insurance company information
    var insuranceCompanies = [
        {
            name: "Guardian Liability Insurance",
            address: "789 Protection Way, Hartford, CT 06103",
            phone: "(800) 555-9876",
            website: "www.guardianliabilityins.com",
            email: "claims@guardianliabilityins.com",
            rating: "A+ (Superior)"
        },
        {
            name: "Landmark Commercial Insurance",
            address: "456 Assurance Blvd, Chicago, IL 60601",
            phone: "(800) 777-3456",
            website: "www.landmarkcommercialins.com",
            email: "claims@landmarkcommercial.com",
            rating: "A (Excellent)"
        },
        {
            name: "Superior Risk Solutions",
            address: "123 Coverage Plaza, Boston, MA 02110",
            phone: "(800) 888-1234",
            website: "www.superiorrisksolutions.com",
            email: "claims@superiorrisksolutions.com",
            rating: "A++ (Superior)"
        }
    ];
    var insuranceCompany = insuranceCompanies[Math.floor(Math.random() * insuranceCompanies.length)];
    // Generate agent information
    var agents = [
        {
            name: "Robert Williams",
            company: "Williams Insurance Agency",
            address: "555 Broker Street, Suite 200, Boston, MA 02110",
            phone: "(617) 555-2345",
            email: "rwilliams@williamsinsurance.com",
            license: "BK-789456"
        },
        {
            name: "Jennifer Martinez",
            company: "Premier Insurance Solutions",
            address: "888 Coverage Lane, Suite 300, Boston, MA 02108",
            phone: "(617) 555-8765",
            email: "jmartinez@premierinsurance.com",
            license: "BK-456123"
        },
        {
            name: "Michael Chen",
            company: "Guardian Insurance Services",
            address: "777 Protection Plaza, Suite 150, Boston, MA 02116",
            phone: "(617) 555-9876",
            email: "mchen@guardianinsurance.com",
            license: "BK-123987"
        }
    ];
    var agent = agents[Math.floor(Math.random() * agents.length)];
    var content = "\n    <div class=\"document\">\n      <div class=\"letterhead\">\n        <div class=\"letterhead-logo\">\n          ".concat(insuranceCompany.name.toUpperCase(), "\n        </div>\n        <div class=\"letterhead-contact\">\n          ").concat(insuranceCompany.address, "<br>\n          ").concat(insuranceCompany.phone, "<br>\n          ").concat(insuranceCompany.website, "<br>\n          Rating: ").concat(insuranceCompany.rating, "\n        </div>\n      </div>\n      \n      <div class=\"document-header\">\n        <div class=\"document-title\">Commercial General Liability Insurance</div>\n        <div class=\"document-subtitle\">Policy Number: ").concat(policyNumber, "</div>\n      </div>\n      \n      <div class=\"policy-stamp\">DECLARATIONS PAGE</div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Named Insured & Mailing Address</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Named Insured:</th>\n            <td>").concat(loanData.entityName || loanData.borrowerName, "</td>\n          </tr>\n          <tr>\n            <th>Form of Business:</th>\n            <td>").concat(loanData.entityName ? "Corporation/LLC" : "Individual", "</td>\n          </tr>\n          <tr>\n            <th>Mailing Address:</th>\n            <td>").concat(loanData.borrowerAddress || "Same as Location Address", "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Policy Information</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Policy Period:</th>\n            <td>From: ").concat(policyStartDate, " To: ").concat(policyEndDate, " (12:01 AM Standard Time at the address of the Named Insured)</td>\n          </tr>\n          <tr>\n            <th>Policy Type:</th>\n            <td>Commercial General Liability</td>\n          </tr>\n          <tr>\n            <th>Business Description:</th>\n            <td>").concat(loanData.propertyType.includes("commercial") ? "Commercial Real Estate Owner/Lessor" :
        "Residential Real Estate Owner/Lessor", "</td>\n          </tr>\n          <tr>\n            <th>Policy Forms:</th>\n            <td>CG 00 01 04 13 - Commercial General Liability Coverage Form<br>\n                IL 00 17 11 98 - Common Policy Conditions<br>\n                IL 00 21 09 08 - Nuclear Energy Liability Exclusion Endorsement</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Insured Location(s)</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Location 1:</th>\n            <td>").concat(loanData.propertyAddress, "</td>\n          </tr>\n          <tr>\n            <th>Property Type:</th>\n            <td>").concat(loanData.propertyType.replace(/_/g, " ").replace(/\b\w/g, function (l) { return l.toUpperCase(); }), "</td>\n          </tr>\n          <tr>\n            <th>Square Footage:</th>\n            <td>").concat(loanData.squareFootage ? loanData.squareFootage.toLocaleString() + " sq ft" : "Not Provided", "</td>\n          </tr>\n          <tr>\n            <th>Year Built:</th>\n            <td>").concat(loanData.yearBuilt || "Not Provided", "</td>\n          </tr>\n          <tr>\n            <th>Construction Type:</th>\n            <td>").concat(loanData.propertyType.includes("commercial") ? "Masonry Non-Combustible" : "Frame", "</td>\n          </tr>\n          <tr>\n            <th>Protection Class:</th>\n            <td>Class ").concat(Math.floor(Math.random() * 5) + 1, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Limits of Insurance</div>\n        <table class=\"coverage-table\">\n          <tr>\n            <th>Coverage</th>\n            <th>Limits</th>\n          </tr>\n          <tr>\n            <td>General Aggregate Limit</td>\n            <td>").concat(formatCurrency(generalLiabilityAggregate), "</td>\n          </tr>\n          <tr>\n            <td>Products-Completed Operations Aggregate</td>\n            <td>").concat(formatCurrency(productsCompletedOperations), "</td>\n          </tr>\n          <tr>\n            <td>Each Occurrence</td>\n            <td>").concat(formatCurrency(generalLiabilityPerOccurrence), "</td>\n          </tr>\n          <tr>\n            <td>Personal & Advertising Injury</td>\n            <td>").concat(formatCurrency(personalAdvertisingInjury), "</td>\n          </tr>\n          <tr>\n            <td>Damage to Premises Rented to You</td>\n            <td>").concat(formatCurrency(damageToRentedPremises), "</td>\n          </tr>\n          <tr>\n            <td>Medical Expense (Any One Person)</td>\n            <td>").concat(formatCurrency(medicalExpense), "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Optional Coverages</div>\n        <table class=\"coverage-table\">\n          <tr>\n            <th>Coverage</th>\n            <th>Limits</th>\n            <th>Included</th>\n          </tr>\n          <tr>\n            <td>Hired & Non-Owned Auto Liability</td>\n            <td>").concat(hasNonownedAutoLiability ? formatCurrency(generalLiabilityPerOccurrence) : "N/A", "</td>\n            <td>").concat(hasNonownedAutoLiability ? "Yes" : "No", "</td>\n          </tr>\n          <tr>\n            <td>Employee Benefits Liability</td>\n            <td>").concat(hasEmployeeBenefitsLiability ? formatCurrency(generalLiabilityPerOccurrence) + " Each Employee<br>" + formatCurrency(generalLiabilityAggregate) + " Aggregate" : "N/A", "</td>\n            <td>").concat(hasEmployeeBenefitsLiability ? "Yes" : "No", "</td>\n          </tr>\n          <tr>\n            <td>Employment Practices Liability</td>\n            <td>").concat(hasEmploymentPracticesLiability ? formatCurrency(generalLiabilityPerOccurrence) + " Each Claim<br>" + formatCurrency(generalLiabilityAggregate) + " Aggregate" : "N/A", "</td>\n            <td>").concat(hasEmploymentPracticesLiability ? "Yes" : "No", "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Policy Endorsements</div>\n        <table class=\"coverage-table\">\n          <tr>\n            <th>Form Number</th>\n            <th>Description</th>\n          </tr>\n          <tr>\n            <td>CG 20 10 04 13</td>\n            <td>Additional Insured - Owners, Lessees or Contractors</td>\n          </tr>\n          <tr>\n            <td>CG 20 26 04 13</td>\n            <td>Additional Insured - Designated Person or Organization</td>\n          </tr>\n          <tr>\n            <td>CG 21 44 04 17</td>\n            <td>Limitation of Coverage to Designated Premises or Project</td>\n          </tr>\n          <tr>\n            <td>CG 21 47 12 07</td>\n            <td>Employment-Related Practices Exclusion</td>\n          </tr>\n          <tr>\n            <td>CG 21 49 09 99</td>\n            <td>Total Pollution Exclusion Endorsement</td>\n          </tr>\n          <tr>\n            <td>CG 21 67 12 04</td>\n            <td>Fungi or Bacteria Exclusion</td>\n          </tr>\n          <tr>\n            <td>CG 21 73 01 15</td>\n            <td>Exclusion of Certified Acts of Terrorism</td>\n          </tr>\n          <tr>\n            <td>IL 09 85 01 15</td>\n            <td>Disclosure Pursuant to Terrorism Risk Insurance Act</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Additional Insureds</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Mortgagee/Lender:</th>\n            <td>Harrington Capital Partners<br>\n                123 Financial Plaza, Suite 400<br>\n                Boston, MA 02110<br>\n                Loan #: ").concat(loanData.id, "<br>\n                Form: CG 20 26 04 13</td>\n          </tr>\n          <tr>\n            <th>Other Additional Insureds:</th>\n            <td>As required by written contract or agreement</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Premium Summary</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Base Premium:</th>\n            <td>").concat(formatCurrency(basePremium), "</td>\n          </tr>\n          ").concat(hasNonownedAutoLiability ? "\n          <tr>\n            <th>Hired & Non-Owned Auto Liability:</th>\n            <td>".concat(formatCurrency(nonownedAutoPremium), "</td>\n          </tr>") : '', "\n          ").concat(hasEmployeeBenefitsLiability ? "\n          <tr>\n            <th>Employee Benefits Liability:</th>\n            <td>".concat(formatCurrency(employeeBenefitsPremium), "</td>\n          </tr>") : '', "\n          ").concat(hasEmploymentPracticesLiability ? "\n          <tr>\n            <th>Employment Practices Liability:</th>\n            <td>".concat(formatCurrency(employmentPracticesPremium), "</td>\n          </tr>") : '', "\n          <tr>\n            <th>State Tax (2%):</th>\n            <td>").concat(formatCurrency(stateTax), "</td>\n          </tr>\n          <tr>\n            <th>Policy Fee:</th>\n            <td>").concat(formatCurrency(policyFee), "</td>\n          </tr>\n          <tr>\n            <th>Stamping Fee (0.3%):</th>\n            <td>").concat(formatCurrency(stampingFee), "</td>\n          </tr>\n          <tr class=\"highlight\">\n            <th>Total Annual Premium:</th>\n            <td>").concat(formatCurrency(totalAnnualPremium), "</td>\n          </tr>\n          <tr>\n            <th>Payment Schedule:</th>\n            <td>Pay in Full or Installment Plan Available (25% down + 9 monthly payments)</td>\n          </tr>\n        </table>\n        \n        <div class=\"notice\">\n          <p><strong>Premium Audit:</strong> The premium shown is subject to audit at policy expiration.</p>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Important Policy Provisions</div>\n        <div class=\"subsection-title\">Duty to Defend:</div>\n        <p>This policy includes the insurer's duty to defend the insured against any suit seeking damages for bodily injury, property damage, or personal and advertising injury covered by this policy.</p>\n        \n        <div class=\"subsection-title\">Key Exclusions:</div>\n        <ul>\n          <li>Expected or intended injury</li>\n          <li>Contractual liability (with exceptions)</li>\n          <li>Liquor liability</li>\n          <li>Workers' compensation and similar laws</li>\n          <li>Pollution</li>\n          <li>Aircraft, auto, or watercraft</li>\n          <li>Mobile equipment</li>\n          <li>War</li>\n          <li>Damage to your product or work</li>\n          <li>Electronic data</li>\n          <li>Distribution of material in violation of statutes</li>\n          <li>Employment-related practices</li>\n          <li>Fungi or bacteria</li>\n          <li>Certified acts of terrorism</li>\n        </ul>\n        \n        <div class=\"warning\">\n          <p><strong>This is a summary only.</strong> Refer to the policy for complete coverage details, including additional exclusions, conditions, and limitations not listed here.</p>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Claims Reporting Information</div>\n        <p>Report all claims as soon as possible to:</p>\n        <p>\n          <strong>Claims Department</strong><br>\n          Phone: ").concat(insuranceCompany.phone, " (24/7 Claims Hotline)<br>\n          Email: ").concat(insuranceCompany.email, "<br>\n          Online: ").concat(insuranceCompany.website, "/claims\n        </p>\n        <div class=\"highlight\">\n          <p>You must report all claims or potential claims immediately. Failure to promptly report claims may jeopardize coverage.</p>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Producer / Agent Information</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Agent:</th>\n            <td>").concat(agent.name, "</td>\n          </tr>\n          <tr>\n            <th>Agency:</th>\n            <td>").concat(agent.company, "</td>\n          </tr>\n          <tr>\n            <th>Address:</th>\n            <td>").concat(agent.address, "</td>\n          </tr>\n          <tr>\n            <th>Phone:</th>\n            <td>").concat(agent.phone, "</td>\n          </tr>\n          <tr>\n            <th>Email:</th>\n            <td>").concat(agent.email, "</td>\n          </tr>\n          <tr>\n            <th>License #:</th>\n            <td>").concat(agent.license, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"signature-section\">\n        <p>In witness whereof, the insurer has caused this policy to be executed and attested.</p>\n        <div style=\"margin-top: 20px;\">\n          <div class=\"signature-line\"></div>\n          <p>Authorized Representative</p>\n        </div>\n        <p>Issue Date: ").concat(currentDate, "</p>\n      </div>\n      \n      <div class=\"footer\">\n        <p>THIS DECLARATIONS PAGE, TOGETHER WITH THE COMMON POLICY CONDITIONS, COVERAGE FORM(S) AND ENDORSEMENTS, COMPLETES THE ABOVE NUMBERED POLICY.</p>\n        <p>Policy Number: ").concat(policyNumber, " | Insured: ").concat(loanData.entityName || loanData.borrowerName, " | Effective: ").concat(policyStartDate, "</p>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Flood Insurance Policy Declarations - ".concat(loanData.borrowerName), content);
};
exports.getLiabilityInsurancePolicyTemplate = getLiabilityInsurancePolicyTemplate;
