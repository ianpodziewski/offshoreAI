"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrokerPriceOpinionTemplate = exports.getAppraisalReportTemplate = void 0;
var documentStyleService_1 = require("../documentStyleService");
/**
 * Valuation Templates
 * Returns HTML strings for valuation-related document types
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
// Base style for the document
var baseStyle = "\n<style>\n  .document {\n    font-family: 'Arial', sans-serif;\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 20px;\n    color: #333;\n  }\n  .document-header {\n    text-align: center;\n    margin-bottom: 30px;\n  }\n  .document-title {\n    font-size: 24px;\n    font-weight: bold;\n    margin-bottom: 5px;\n    text-transform: uppercase;\n  }\n  .document-subtitle {\n    font-size: 16px;\n    margin-bottom: 20px;\n  }\n  .document-section {\n    margin-bottom: 30px;\n  }\n  .section-title {\n    font-size: 18px;\n    font-weight: bold;\n    margin-bottom: 15px;\n    padding-bottom: 5px;\n    border-bottom: 1px solid #ddd;\n  }\n  .subsection-title {\n    font-size: 16px;\n    font-weight: bold;\n    margin: 10px 0;\n  }\n  .info-table {\n    width: 100%;\n    border-collapse: collapse;\n    margin-bottom: 20px;\n  }\n  .info-table th, .info-table td {\n    padding: 8px 10px;\n    text-align: left;\n    border-bottom: 1px solid #eee;\n  }\n  .info-table th {\n    width: 35%;\n    font-weight: bold;\n    background-color: #f5f5f5;\n  }\n  .signature-section {\n    margin-top: 50px;\n    page-break-inside: avoid;\n  }\n  .signature-line {\n    border-top: 1px solid #000;\n    width: 50%;\n    margin-top: 40px;\n    margin-bottom: 5px;\n  }\n  .grid-container {\n    display: grid;\n    grid-template-columns: repeat(2, 1fr);\n    gap: 20px;\n    margin-bottom: 20px;\n  }\n  .grid-item {\n    background-color: #f9f9f9;\n    padding: 15px;\n    border-radius: 4px;\n  }\n  .comparable-container {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n    gap: 15px;\n    margin-bottom: 20px;\n  }\n  .comparable-item {\n    background-color: #f5f5f5;\n    padding: 15px;\n    border-radius: 4px;\n  }\n  .value-conclusion {\n    background-color: #e9ecef;\n    padding: 20px;\n    border-radius: 4px;\n    margin: 20px 0;\n  }\n  .certification-box {\n    background-color: #f8f9fa;\n    padding: 20px;\n    border: 1px solid #dee2e6;\n    border-radius: 4px;\n    margin: 20px 0;\n  }\n</style>";
/**
 * Appraisal Report Template
 * Simulates a professional real estate appraisal report
 */
var getAppraisalReportTemplate = function (loanData) {
    var _a;
    var formattedDate = formatDate();
    var reportNumber = "APR-".concat(Math.floor(100000 + Math.random() * 900000));
    var effectiveDate = formattedDate;
    // Generate random appraiser information
    var appraiserName = ['James Wilson, MAI', 'Sarah Thompson, SRA', 'Michael Roberts, AI-GRS', 'Elizabeth Chen, AI-RRS'][Math.floor(Math.random() * 4)];
    var appraisalFirm = ['Wilson & Associates', 'Thompson Appraisal Group', 'Roberts Valuation Services', 'Chen & Partners'][Math.floor(Math.random() * 4)];
    var licenseNumber = "AP".concat(Math.floor(10000 + Math.random() * 90000));
    // Generate comparable sales
    var generateComparableSales = function () {
        var basePrice = loanData.propertyValue || loanData.purchasePrice || loanData.loanAmount;
        var comps = [];
        for (var i = 0; i < 3; i++) {
            var variance = (Math.random() - 0.5) * 0.2; // +/- 10% variance
            var price = Math.round(basePrice * (1 + variance));
            var daysAgo = Math.floor(Math.random() * 180) + 1; // Within last 6 months
            var squareFeetVariance = (Math.random() - 0.5) * 0.15; // +/- 7.5% variance
            var squareFeet = Math.round((loanData.squareFootage || 2000) * (1 + squareFeetVariance));
            comps.push({
                address: "".concat(Math.floor(Math.random() * 9000) + 1000, " ").concat(['Maple', 'Oak', 'Cedar', 'Pine'][Math.floor(Math.random() * 4)], " ").concat(['St', 'Ave', 'Dr', 'Ln'][Math.floor(Math.random() * 4)]),
                price: price,
                saleDate: new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000)).toLocaleDateString(),
                squareFeet: squareFeet,
                pricePerSqFt: Math.round(price / squareFeet),
                bedrooms: (loanData.bedrooms || 3) + (Math.floor(Math.random() * 3) - 1),
                bathrooms: (loanData.bathrooms || 2) + (Math.floor(Math.random() * 2) - 1),
                condition: ['Average', 'Good', 'Very Good', 'Excellent'][Math.floor(Math.random() * 4)]
            });
        }
        return comps;
    };
    var comparableSales = generateComparableSales();
    // Calculate final value opinion
    var finalValue = Math.round(comparableSales.reduce(function (sum, comp) { return sum + comp.price; }, 0) / comparableSales.length);
    var content = "\n    <div class=\"document\">\n      <div class=\"document-header\">\n        <div class=\"document-title\">Uniform Residential Appraisal Report</div>\n        <div class=\"document-subtitle\">".concat(appraisalFirm, "</div>\n      </div>\n      \n      <div class=\"document-section\">\n        <table class=\"info-table\">\n          <tr>\n            <th>File Number:</th>\n            <td>").concat(reportNumber, "</td>\n          </tr>\n          <tr>\n            <th>Property Address:</th>\n            <td>").concat(loanData.propertyAddress, "</td>\n          </tr>\n          <tr>\n            <th>Borrower:</th>\n            <td>").concat(loanData.borrowerName, "</td>\n          </tr>\n          <tr>\n            <th>Effective Date:</th>\n            <td>").concat(effectiveDate, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Subject Property Characteristics</div>\n        <div class=\"grid-container\">\n          <div class=\"grid-item\">\n            <strong>Property Type:</strong> ").concat(loanData.propertyType.replace(/_/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); }), "<br>\n            <strong>Year Built:</strong> ").concat(loanData.yearBuilt || 'Not Available', "<br>\n            <strong>Square Footage:</strong> ").concat(((_a = loanData.squareFootage) === null || _a === void 0 ? void 0 : _a.toLocaleString()) || 'Not Available', " SF<br>\n            <strong>Lot Size:</strong> ").concat(loanData.lotSize || 'Not Available', "\n          </div>\n          <div class=\"grid-item\">\n            <strong>Bedrooms:</strong> ").concat(loanData.bedrooms || 'Not Available', "<br>\n            <strong>Bathrooms:</strong> ").concat(loanData.bathrooms || 'Not Available', "<br>\n            <strong>Zoning:</strong> ").concat(loanData.zoning || 'Residential', "<br>\n            <strong>Current Use:</strong> ").concat(loanData.propertyType.replace(/_/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); }), "\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Neighborhood Characteristics</div>\n        <div class=\"grid-container\">\n          <div class=\"grid-item\">\n            <strong>Location Type:</strong> Urban<br>\n            <strong>Built Up:</strong> Over 75%<br>\n            <strong>Growth Rate:</strong> Stable<br>\n            <strong>Property Values:</strong> Increasing\n          </div>\n          <div class=\"grid-item\">\n            <strong>Neighborhood Age:</strong> ").concat(Math.floor(Math.random() * 30 + 20), " - ").concat(Math.floor(Math.random() * 30 + 50), " years<br>\n            <strong>Price Range:</strong> ").concat(formatCurrency(finalValue * 0.7), " - ").concat(formatCurrency(finalValue * 1.3), "<br>\n            <strong>Marketing Time:</strong> ").concat(Math.floor(Math.random() * 90 + 30), " days<br>\n            <strong>Land Use:</strong> ").concat(Math.floor(Math.random() * 10 + 85), "% Single Family\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Comparable Sales Analysis</div>\n        <div class=\"comparable-container\">\n          ").concat(comparableSales.map(function (comp, index) { return "\n            <div class=\"comparable-item\">\n              <strong>Comparable ".concat(index + 1, "</strong><br>\n              Address: ").concat(comp.address, "<br>\n              Sale Price: ").concat(formatCurrency(comp.price), "<br>\n              Sale Date: ").concat(comp.saleDate, "<br>\n              Square Feet: ").concat(comp.squareFeet, "<br>\n              Price/SF: ").concat(formatCurrency(comp.pricePerSqFt), "<br>\n              Bed/Bath: ").concat(comp.bedrooms, "/").concat(comp.bathrooms, "<br>\n              Condition: ").concat(comp.condition, "\n            </div>\n          "); }).join(''), "\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Value Conclusion</div>\n        <div class=\"value-conclusion\">\n          <p>Based on the direct comparison approach and after careful consideration of all relevant factors, it is my opinion that the market value of the subject property, as of ").concat(effectiveDate, ", is:</p>\n          <h2 style=\"text-align: center; margin: 20px 0;\">").concat(formatCurrency(finalValue), "</h2>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Reconciliation and Final Comments</div>\n        <p>The opinion of value is based primarily on the Sales Comparison Approach, which best reflects market behavior for this property type. The comparable sales utilized in this analysis are considered reliable indicators of value for the subject property, requiring minimal adjustments for differences in characteristics.</p>\n        <p>The subject property is located in a ").concat(['stable', 'growing', 'well-established'][Math.floor(Math.random() * 3)], " neighborhood with ").concat(['good', 'strong', 'steady'][Math.floor(Math.random() * 3)], " market demand. The overall condition of the property is ").concat(['average', 'good', 'very good'][Math.floor(Math.random() * 3)], " and consistent with the age and class of improvements.</p>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"certification-box\">\n          <div class=\"subsection-title\">Appraiser's Certification</div>\n          <p>I certify that, to the best of my knowledge and belief:</p>\n          <ul>\n            <li>The statements of fact contained in this report are true and correct.</li>\n            <li>The reported analyses, opinions, and conclusions are limited only by the reported assumptions and limiting conditions and are my personal, impartial, and unbiased professional analyses, opinions, and conclusions.</li>\n            <li>I have no present or prospective interest in the property that is the subject of this report and no personal interest with respect to the parties involved.</li>\n            <li>I have performed no services, as an appraiser or in any other capacity, regarding the property that is the subject of this report within the three-year period immediately preceding acceptance of this assignment.</li>\n            <li>My engagement in this assignment was not contingent upon developing or reporting predetermined results.</li>\n          </ul>\n        </div>\n        \n        <div class=\"signature-section\">\n          <p><strong>Appraiser:</strong> ").concat(appraiserName, "</p>\n          <p><strong>License #:</strong> ").concat(licenseNumber, "</p>\n          <p><strong>Firm:</strong> ").concat(appraisalFirm, "</p>\n          <div class=\"signature-line\"></div>\n          <div>Signature and Date</div>\n        </div>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Appraisal Report - ".concat(loanData.borrowerName), content);
};
exports.getAppraisalReportTemplate = getAppraisalReportTemplate;
/**
 * Broker Price Opinion Template
 * Simulates a professional BPO report with market analysis
 */
var getBrokerPriceOpinionTemplate = function (loanData) {
    var _a;
    var formattedDate = formatDate();
    var reportNumber = "BPO-".concat(Math.floor(100000 + Math.random() * 900000));
    // Generate random broker information
    var brokerName = ['Jennifer Martinez, CRB', 'Thomas Anderson, GRI', 'Rachel Williams, ABR', 'Daniel Lee, CRS'][Math.floor(Math.random() * 4)];
    var brokerageFirm = ['Martinez Real Estate Group', 'Anderson & Associates', 'Williams Realty Partners', 'Lee Property Advisors'][Math.floor(Math.random() * 4)];
    var licenseNumber = "BR".concat(Math.floor(10000 + Math.random() * 90000));
    // Generate market conditions
    var marketConditions = {
        averageDaysOnMarket: Math.floor(Math.random() * 45) + 15,
        inventoryMonths: Number((Math.random() * 4 + 1).toFixed(1)),
        priceChange: Number((Math.random() * 8 - 2).toFixed(1)),
        marketTrend: ['Increasing', 'Stable', 'Slightly Increasing', 'Slightly Decreasing'][Math.floor(Math.random() * 4)]
    };
    // Generate value opinions
    var asIsValue = loanData.propertyValue || loanData.purchasePrice || loanData.loanAmount;
    var quickSaleValue = Math.round(asIsValue * 0.9);
    var afterRepairValue = loanData.afterRepairValue || Math.round(asIsValue * 1.3);
    // Generate repair recommendations
    var repairItems = [
        { item: 'Interior Paint', cost: Math.round((Math.random() * 3000 + 2000) / 100) * 100 },
        { item: 'Flooring Replacement', cost: Math.round((Math.random() * 5000 + 3000) / 100) * 100 },
        { item: 'Kitchen Updates', cost: Math.round((Math.random() * 15000 + 5000) / 100) * 100 },
        { item: 'Bathroom Renovation', cost: Math.round((Math.random() * 10000 + 5000) / 100) * 100 },
        { item: 'Exterior Paint', cost: Math.round((Math.random() * 6000 + 4000) / 100) * 100 }
    ];
    var totalRepairCost = repairItems.reduce(function (sum, item) { return sum + item.cost; }, 0);
    var content = "\n    <div class=\"document\">\n      <div class=\"document-header\">\n        <div class=\"document-title\">Broker Price Opinion</div>\n        <div class=\"document-subtitle\">".concat(brokerageFirm, "</div>\n      </div>\n      \n      <div class=\"document-section\">\n        <table class=\"info-table\">\n          <tr>\n            <th>BPO Reference Number:</th>\n            <td>").concat(reportNumber, "</td>\n          </tr>\n          <tr>\n            <th>Property Address:</th>\n            <td>").concat(loanData.propertyAddress, "</td>\n          </tr>\n          <tr>\n            <th>Client:</th>\n            <td>").concat(loanData.borrowerName, "</td>\n          </tr>\n          <tr>\n            <th>Report Date:</th>\n            <td>").concat(formattedDate, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Property Overview</div>\n        <div class=\"grid-container\">\n          <div class=\"grid-item\">\n            <strong>Property Type:</strong> ").concat(loanData.propertyType.replace(/_/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); }), "<br>\n            <strong>Year Built:</strong> ").concat(loanData.yearBuilt || 'Not Available', "<br>\n            <strong>Square Footage:</strong> ").concat(((_a = loanData.squareFootage) === null || _a === void 0 ? void 0 : _a.toLocaleString()) || 'Not Available', " SF<br>\n            <strong>Lot Size:</strong> ").concat(loanData.lotSize || 'Not Available', "\n          </div>\n          <div class=\"grid-item\">\n            <strong>Bedrooms:</strong> ").concat(loanData.bedrooms || 'Not Available', "<br>\n            <strong>Bathrooms:</strong> ").concat(loanData.bathrooms || 'Not Available', "<br>\n            <strong>Parking:</strong> ").concat(['2 Car Garage', 'Attached Garage', 'Carport', 'Street Parking'][Math.floor(Math.random() * 4)], "<br>\n            <strong>Overall Condition:</strong> ").concat(['Fair', 'Average', 'Good', 'Excellent'][Math.floor(Math.random() * 4)], "\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Market Analysis</div>\n        <div class=\"grid-container\">\n          <div class=\"grid-item\">\n            <strong>Average Days on Market:</strong> ").concat(marketConditions.averageDaysOnMarket, " days<br>\n            <strong>Inventory Supply:</strong> ").concat(marketConditions.inventoryMonths, " months<br>\n            <strong>Price Trend (YoY):</strong> ").concat(marketConditions.priceChange, "%<br>\n            <strong>Market Direction:</strong> ").concat(marketConditions.marketTrend, "\n          </div>\n          <div class=\"grid-item\">\n            <strong>Typical Marketing Time:</strong> ").concat(Math.floor(marketConditions.averageDaysOnMarket * 1.2), " days<br>\n            <strong>Buyer's/Seller's Market:</strong> ").concat(marketConditions.inventoryMonths < 6 ? "Seller's" : "Buyer's", " Market<br>\n            <strong>Demand Level:</strong> ").concat(['Strong', 'Moderate', 'Average', 'Below Average'][Math.floor(Math.random() * 4)], "<br>\n            <strong>Competition Level:</strong> ").concat(['High', 'Moderate', 'Low'][Math.floor(Math.random() * 3)], "\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Value Opinions</div>\n        <div class=\"value-conclusion\">\n          <table class=\"info-table\">\n            <tr>\n              <th>As-Is Market Value:</th>\n              <td>").concat(formatCurrency(asIsValue), "</td>\n            </tr>\n            <tr>\n              <th>Quick Sale Value:</th>\n              <td>").concat(formatCurrency(quickSaleValue), "</td>\n            </tr>\n            <tr>\n              <th>After Repair Value:</th>\n              <td>").concat(formatCurrency(afterRepairValue), "</td>\n            </tr>\n          </table>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Recommended Repairs and Improvements</div>\n        <table class=\"info-table\">\n          ").concat(repairItems.map(function (item) { return "\n            <tr>\n              <th>".concat(item.item, ":</th>\n              <td>").concat(formatCurrency(item.cost), "</td>\n            </tr>\n          "); }).join(''), "\n          <tr>\n            <th>Total Estimated Repair Cost:</th>\n            <td>").concat(formatCurrency(totalRepairCost), "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Marketing Recommendations</div>\n        <p>Based on current market conditions and property characteristics, the following marketing strategy is recommended:</p>\n        <ul>\n          <li>List price recommendation: ").concat(formatCurrency(Math.round(asIsValue * 1.02)), "</li>\n          <li>Suggested marketing time: ").concat(marketConditions.averageDaysOnMarket + 15, " days</li>\n          <li>Target buyer profile: ").concat(['First-time homebuyer', 'Move-up buyer', 'Investor', 'Luxury buyer'][Math.floor(Math.random() * 4)], "</li>\n          <li>Recommended improvements before listing: ").concat(repairItems.slice(0, 2).map(function (item) { return item.item.toLowerCase(); }).join(' and '), "</li>\n        </ul>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"certification-box\">\n          <div class=\"subsection-title\">Broker's Certification</div>\n          <p>I certify that:</p>\n          <ul>\n            <li>The statements of fact contained in this report are true and correct to the best of my knowledge.</li>\n            <li>The reported analyses, opinions, and conclusions are limited only by the reported assumptions and limiting conditions.</li>\n            <li>I have no present or prospective interest in the property that is the subject of this report.</li>\n            <li>I have no bias with respect to the property that is the subject of this report or to the parties involved.</li>\n            <li>My engagement in this assignment was not contingent upon developing or reporting predetermined results.</li>\n          </ul>\n        </div>\n        \n        <div class=\"signature-section\">\n          <p><strong>Broker:</strong> ").concat(brokerName, "</p>\n          <p><strong>License #:</strong> ").concat(licenseNumber, "</p>\n          <p><strong>Firm:</strong> ").concat(brokerageFirm, "</p>\n          <div class=\"signature-line\"></div>\n          <div>Signature and Date</div>\n        </div>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Broker Price Opinion - ".concat(loanData.borrowerName), content);
};
exports.getBrokerPriceOpinionTemplate = getBrokerPriceOpinionTemplate;
