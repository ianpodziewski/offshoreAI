"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDrawScheduleTemplate = exports.getRenovationBudgetTemplate = void 0;
var documentStyleService_1 = require("../documentStyleService");
/**
 * Project Documentation Templates
 * Returns HTML strings for project and construction-related document types
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
// Format percentage helper
var formatPercent = function (value) {
    return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(value / 100);
};
// Base style for the document
var baseStyle = "\n<style>\n  .document {\n    font-family: 'Arial', sans-serif;\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 20px;\n    color: #333;\n  }\n  .document-header {\n    text-align: center;\n    margin-bottom: 30px;\n  }\n  .document-title {\n    font-size: 24px;\n    font-weight: bold;\n    margin-bottom: 5px;\n    text-transform: uppercase;\n  }\n  .document-subtitle {\n    font-size: 16px;\n    margin-bottom: 20px;\n  }\n  .document-section {\n    margin-bottom: 30px;\n  }\n  .section-title {\n    font-size: 18px;\n    font-weight: bold;\n    margin-bottom: 15px;\n    padding-bottom: 5px;\n    border-bottom: 1px solid #ddd;\n  }\n  .subsection-title {\n    font-size: 16px;\n    font-weight: bold;\n    margin: 10px 0;\n  }\n  .info-table {\n    width: 100%;\n    border-collapse: collapse;\n    margin-bottom: 20px;\n  }\n  .info-table th, .info-table td {\n    padding: 8px 10px;\n    text-align: left;\n    border-bottom: 1px solid #eee;\n  }\n  .info-table th {\n    font-weight: bold;\n    background-color: #f5f5f5;\n  }\n  .signature-section {\n    margin-top: 50px;\n    page-break-inside: avoid;\n  }\n  .signature-line {\n    border-top: 1px solid #000;\n    width: 50%;\n    margin-top: 40px;\n    margin-bottom: 5px;\n  }\n  .budget-category {\n    background-color: #e9ecef;\n    font-weight: bold;\n  }\n  .budget-item {\n    background-color: #f8f9fa;\n  }\n  .budget-total {\n    background-color: #d1e7dd;\n    font-weight: bold;\n  }\n  .budget-contingency {\n    background-color: #f8d7da;\n  }\n  .budget-summary {\n    margin-top: 30px;\n    padding: 15px;\n    background-color: #e2e3e5;\n    border-radius: 4px;\n  }\n  .notes-section {\n    margin-top: 20px;\n    padding: 15px;\n    background-color: #fff3cd;\n    border-radius: 4px;\n  }\n  .progress-bar-container {\n    width: 100%;\n    background-color: #e9ecef;\n    border-radius: 4px;\n    margin: 5px 0;\n  }\n  .progress-bar {\n    height: 20px;\n    background-color: #0d6efd;\n    border-radius: 4px;\n    text-align: center;\n    color: white;\n    font-size: 12px;\n    line-height: 20px;\n  }\n</style>";
/**
 * Renovation/Construction Budget Template
 * Simulates a detailed construction budget with categories, line items, and totals
 */
var getRenovationBudgetTemplate = function (loanData) {
    var _a;
    var formattedDate = formatDate();
    // Generate budget categories and items based on property type
    var generateBudgetItems = function () {
        // Base budget structure with categories and items
        var baseItems = [
            {
                category: 'Pre-Construction',
                items: [
                    { name: 'Architectural Plans', amount: Math.round((Math.random() * 5000 + 2000) / 100) * 100 },
                    { name: 'Engineering', amount: Math.round((Math.random() * 3000 + 1000) / 100) * 100 },
                    { name: 'Permits & Fees', amount: Math.round((Math.random() * 4000 + 2000) / 100) * 100 },
                    { name: 'Survey', amount: Math.round((Math.random() * 1500 + 500) / 100) * 100 }
                ]
            },
            {
                category: 'Site Work',
                items: [
                    { name: 'Demolition', amount: Math.round((Math.random() * 8000 + 2000) / 100) * 100 },
                    { name: 'Foundation', amount: Math.round((Math.random() * 15000 + 5000) / 100) * 100 },
                    { name: 'Grading & Excavation', amount: Math.round((Math.random() * 6000 + 2000) / 100) * 100 },
                    { name: 'Landscaping', amount: Math.round((Math.random() * 10000 + 3000) / 100) * 100 }
                ]
            },
            {
                category: 'Exterior',
                items: [
                    { name: 'Roofing', amount: Math.round((Math.random() * 12000 + 8000) / 100) * 100 },
                    { name: 'Siding/Exterior Finishes', amount: Math.round((Math.random() * 15000 + 10000) / 100) * 100 },
                    { name: 'Windows & Doors', amount: Math.round((Math.random() * 20000 + 10000) / 100) * 100 },
                    { name: 'Garage/Carport', amount: Math.round((Math.random() * 8000 + 4000) / 100) * 100 }
                ]
            },
            {
                category: 'Interior',
                items: [
                    { name: 'Drywall & Insulation', amount: Math.round((Math.random() * 15000 + 5000) / 100) * 100 },
                    { name: 'Flooring', amount: Math.round((Math.random() * 25000 + 10000) / 100) * 100 },
                    { name: 'Interior Doors & Trim', amount: Math.round((Math.random() * 10000 + 5000) / 100) * 100 },
                    { name: 'Paint & Finishes', amount: Math.round((Math.random() * 12000 + 8000) / 100) * 100 },
                    { name: 'Cabinetry & Countertops', amount: Math.round((Math.random() * 30000 + 15000) / 100) * 100 }
                ]
            },
            {
                category: 'Mechanical Systems',
                items: [
                    { name: 'Electrical', amount: Math.round((Math.random() * 20000 + 10000) / 100) * 100 },
                    { name: 'Plumbing', amount: Math.round((Math.random() * 18000 + 12000) / 100) * 100 },
                    { name: 'HVAC', amount: Math.round((Math.random() * 15000 + 10000) / 100) * 100 }
                ]
            },
            {
                category: 'Specialty Rooms',
                items: [
                    { name: 'Kitchen Renovation', amount: Math.round((Math.random() * 35000 + 20000) / 100) * 100 },
                    { name: 'Bathroom Renovation', amount: Math.round((Math.random() * 25000 + 15000) / 100) * 100 }
                ]
            },
            {
                category: 'Miscellaneous',
                items: [
                    { name: 'Appliances', amount: Math.round((Math.random() * 12000 + 8000) / 100) * 100 },
                    { name: 'Cleanup', amount: Math.round((Math.random() * 3000 + 1000) / 100) * 100 },
                    { name: 'Temporary Utilities', amount: Math.round((Math.random() * 2000 + 1000) / 100) * 100 }
                ]
            }
        ];
        // Adjust based on property type
        if (loanData.propertyType === 'multi_family_2_4' || loanData.propertyType === 'multi_family_5plus') {
            baseItems.push({
                category: 'Multi-Family Specific',
                items: [
                    { name: 'Unit Separation/Fire Walls', amount: Math.round((Math.random() * 20000 + 15000) / 100) * 100 },
                    { name: 'Common Area Improvements', amount: Math.round((Math.random() * 15000 + 10000) / 100) * 100 },
                    { name: 'Security Systems', amount: Math.round((Math.random() * 8000 + 5000) / 100) * 100 }
                ]
            });
        }
        // Check for commercial-type properties
        if (['mixed_use', 'retail', 'office', 'industrial', 'self_storage', 'hotel_motel'].includes(loanData.propertyType)) {
            baseItems.push({
                category: 'Commercial Specific',
                items: [
                    { name: 'Storefront/Facade', amount: Math.round((Math.random() * 30000 + 20000) / 100) * 100 },
                    { name: 'ADA Compliance', amount: Math.round((Math.random() * 15000 + 10000) / 100) * 100 },
                    { name: 'Signage', amount: Math.round((Math.random() * 8000 + 5000) / 100) * 100 },
                    { name: 'Parking Lot', amount: Math.round((Math.random() * 25000 + 15000) / 100) * 100 }
                ]
            });
        }
        return baseItems;
    };
    var budgetCategories = generateBudgetItems();
    // Calculate totals
    var directCosts = budgetCategories.reduce(function (sum, category) { return sum + category.items.reduce(function (s, item) { return s + item.amount; }, 0); }, 0);
    // Contingency amount (typically 10-15% of direct costs)
    var contingencyPercent = Math.floor(Math.random() * 6) + 10; // 10-15%
    var contingencyAmount = Math.round(directCosts * (contingencyPercent / 100));
    // General contractor fee (typically 15-20% of direct costs)
    var gcFeePercent = Math.floor(Math.random() * 6) + 15; // 15-20%
    var gcFeeAmount = Math.round(directCosts * (gcFeePercent / 100));
    // Total project cost
    var totalProjectCost = directCosts + contingencyAmount + gcFeeAmount;
    // Determine how much of the rehab budget this represents
    var actualRehabBudget = loanData.rehabBudget || totalProjectCost;
    var budgetDifference = actualRehabBudget - totalProjectCost;
    var budgetDifferenceClass = budgetDifference >= 0 ? 'text-success' : 'text-danger';
    var content = "\n    <div class=\"document\">\n      <div class=\"document-header\">\n        <div class=\"document-title\">Renovation & Construction Budget</div>\n        <div class=\"document-subtitle\">Prepared: ".concat(formattedDate, "</div>\n      </div>\n      \n      <div class=\"document-section\">\n        <table class=\"info-table\">\n          <tr>\n            <th>Project Address:</th>\n            <td>").concat(loanData.propertyAddress, "</td>\n          </tr>\n          <tr>\n            <th>Property Owner:</th>\n            <td>").concat(loanData.borrowerName, "</td>\n          </tr>\n          <tr>\n            <th>Property Type:</th>\n            <td>").concat(loanData.propertyType.replace(/_/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); }), "</td>\n          </tr>\n          <tr>\n            <th>Square Footage:</th>\n            <td>").concat(((_a = loanData.squareFootage) === null || _a === void 0 ? void 0 : _a.toLocaleString()) || 'Not Available', " SF</td>\n          </tr>\n          <tr>\n            <th>Allocated Budget:</th>\n            <td>").concat(formatCurrency(actualRehabBudget), "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Construction Budget Breakdown</div>\n        \n        <table class=\"info-table\">\n          <thead>\n            <tr>\n              <th width=\"50%\">Item Description</th>\n              <th width=\"25%\">Amount</th>\n              <th width=\"25%\">% of Direct Costs</th>\n            </tr>\n          </thead>\n          <tbody>\n            ").concat(budgetCategories.map(function (category) { return "\n              <tr class=\"budget-category\">\n                <td colspan=\"3\">".concat(category.category, "</td>\n              </tr>\n              ").concat(category.items.map(function (item) { return "\n                <tr class=\"budget-item\">\n                  <td style=\"padding-left: 20px;\">".concat(item.name, "</td>\n                  <td>").concat(formatCurrency(item.amount), "</td>\n                  <td>").concat(formatPercent((item.amount / directCosts) * 100), "</td>\n                </tr>\n              "); }).join(''), "\n            "); }).join(''), "\n            \n            <tr class=\"budget-total\">\n              <td>Subtotal (Direct Costs)</td>\n              <td>").concat(formatCurrency(directCosts), "</td>\n              <td>100.0%</td>\n            </tr>\n            \n            <tr class=\"budget-contingency\">\n              <td>Contingency (").concat(contingencyPercent, "%)</td>\n              <td>").concat(formatCurrency(contingencyAmount), "</td>\n              <td>").concat(formatPercent(contingencyPercent), "</td>\n            </tr>\n            \n            <tr>\n              <td>General Contractor Fee (").concat(gcFeePercent, "%)</td>\n              <td>").concat(formatCurrency(gcFeeAmount), "</td>\n              <td>").concat(formatPercent(gcFeePercent), "</td>\n            </tr>\n            \n            <tr class=\"budget-total\">\n              <td>Total Project Cost</td>\n              <td>").concat(formatCurrency(totalProjectCost), "</td>\n              <td>").concat(formatPercent((totalProjectCost / directCosts) * 100), "</td>\n            </tr>\n          </tbody>\n        </table>\n      </div>\n      \n      <div class=\"budget-summary\">\n        <div class=\"subsection-title\">Budget Summary</div>\n        <p><strong>Allocated Renovation Budget:</strong> ").concat(formatCurrency(actualRehabBudget), "</p>\n        <p><strong>Total Project Cost:</strong> ").concat(formatCurrency(totalProjectCost), "</p>\n        <p><strong>Budget Difference:</strong> <span class=\"").concat(budgetDifferenceClass, "\">").concat(formatCurrency(budgetDifference), "</span></p>\n        \n        <div class=\"progress-bar-container\">\n          <div class=\"progress-bar\" style=\"width: ").concat(Math.min(100, (totalProjectCost / actualRehabBudget) * 100), "%\">\n            ").concat(Math.round((totalProjectCost / actualRehabBudget) * 100), "% of Budget\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"notes-section\">\n        <div class=\"subsection-title\">Notes</div>\n        <ul>\n          <li>All costs are estimates and subject to change based on actual contractor bids and material costs.</li>\n          <li>Contingency is recommended to cover unforeseen conditions and scope changes.</li>\n          <li>This budget does not include financing costs, property acquisition, or holding costs.</li>\n          <li>Permits and fees may vary based on local jurisdiction requirements.</li>\n          <li>All work should be performed by licensed contractors where required by law.</li>\n        </ul>\n      </div>\n      \n      <div class=\"signature-section\">\n        <p><strong>Prepared By:</strong> ").concat(['Robert Johnson, Construction Manager', 'Sarah Williams, Project Manager', 'Michael Thompson, Cost Estimator'][Math.floor(Math.random() * 3)], "</p>\n        <div class=\"signature-line\"></div>\n        <div>Signature and Date</div>\n        \n        <div style=\"margin-top: 40px;\">\n          <div class=\"signature-line\"></div>\n          <div>Owner Approval and Date</div>\n        </div>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Renovation & Construction Budget - ".concat(loanData.borrowerName), content);
};
exports.getRenovationBudgetTemplate = getRenovationBudgetTemplate;
/**
 * Draw Schedule Template
 * Simulates a construction draw schedule with milestones, amounts, and approval status
 */
var getDrawScheduleTemplate = function (loanData) {
    var formattedDate = formatDate();
    var reportNumber = "DS-".concat(Math.floor(100000 + Math.random() * 900000));
    // Calculate project timeline based on loan term
    var loanTermMonths = loanData.loanTerm || 12;
    var projectDuration = Math.min(loanTermMonths - 1, 8); // Project duration in months, max 8 months
    // Determine total construction budget
    var constructionBudget = loanData.rehabBudget || Math.round((loanData.loanAmount * 0.7) / 1000) * 1000;
    // Generate draw schedule with 4-6 draws
    var generateDrawSchedule = function () {
        var totalDraws = 4 + Math.floor(Math.random() * 3); // 4-6 draws
        var draws = [];
        // Predefined milestones
        var milestones = [
            'Initial Draw / Mobilization',
            'Foundation Complete',
            'Framing & Rough-ins Complete',
            'Drywall & Mechanical Systems',
            'Finish Work & Cabinetry',
            'Final Completion & Punch List'
        ];
        // Create a realistic draw schedule that adds up to 100%
        var remainingPercentage = 100;
        var elapsedDays = 0;
        var projectDurationDays = projectDuration * 30;
        for (var i = 0; i < totalDraws; i++) {
            // For the last draw
            if (i === totalDraws - 1) {
                draws.push({
                    number: i + 1,
                    name: milestones[i],
                    percentage: remainingPercentage,
                    amount: Math.round((constructionBudget * remainingPercentage) / 100),
                    daysFromStart: projectDurationDays,
                    inspectionRequired: true,
                    status: 'Pending'
                });
            }
            else {
                // Determine a realistic percentage for this draw
                var drawPercentage = void 0;
                if (i === 0) {
                    // First draw is typically 10-20%
                    drawPercentage = 10 + Math.floor(Math.random() * 11);
                }
                else {
                    // Middle draws share the remaining percentage somewhat evenly
                    var avgRemaining = remainingPercentage / (totalDraws - i);
                    drawPercentage = Math.floor(avgRemaining * (0.7 + Math.random() * 0.6));
                    // Ensure we don't allocate too much
                    drawPercentage = Math.min(drawPercentage, remainingPercentage - 10);
                }
                // Calculate days from start for this milestone
                elapsedDays += Math.floor((projectDurationDays / totalDraws) * (0.8 + Math.random() * 0.4));
                elapsedDays = Math.min(elapsedDays, projectDurationDays - 10);
                // Create the draw object
                draws.push({
                    number: i + 1,
                    name: milestones[i],
                    percentage: drawPercentage,
                    amount: Math.round((constructionBudget * drawPercentage) / 100),
                    daysFromStart: elapsedDays,
                    inspectionRequired: i > 0, // First draw might not require inspection
                    status: i === 0 ? 'Approved' : 'Pending'
                });
                remainingPercentage -= drawPercentage;
            }
        }
        return draws;
    };
    var drawSchedule = generateDrawSchedule();
    // Calculate approved amount
    var approvedAmount = drawSchedule
        .filter(function (draw) { return draw.status === 'Approved'; })
        .reduce(function (sum, draw) { return sum + draw.amount; }, 0);
    // Calculate remaining amount
    var remainingAmount = constructionBudget - approvedAmount;
    // Format date from days
    var getDateFromDays = function (days) {
        var date = new Date();
        date.setDate(date.getDate() + days);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    var content = "\n    <div class=\"document\">\n      <div class=\"document-header\">\n        <div class=\"document-title\">Construction Draw Schedule</div>\n        <div class=\"document-subtitle\">Prepared: ".concat(formattedDate, "</div>\n      </div>\n      \n      <div class=\"document-section\">\n        <table class=\"info-table\">\n          <tr>\n            <th>Project Address:</th>\n            <td>").concat(loanData.propertyAddress, "</td>\n          </tr>\n          <tr>\n            <th>Borrower:</th>\n            <td>").concat(loanData.borrowerName, "</td>\n          </tr>\n          <tr>\n            <th>Loan Number:</th>\n            <td>").concat(loanData.id, "</td>\n          </tr>\n          <tr>\n            <th>Construction Budget:</th>\n            <td>").concat(formatCurrency(constructionBudget), "</td>\n          </tr>\n          <tr>\n            <th>Project Duration:</th>\n            <td>").concat(projectDuration, " months</td>\n          </tr>\n          <tr>\n            <th>Draw Schedule ID:</th>\n            <td>").concat(reportNumber, "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Draw Payment Schedule</div>\n        \n        <table class=\"info-table\">\n          <thead>\n            <tr>\n              <th width=\"5%\">#</th>\n              <th width=\"25%\">Milestone</th>\n              <th width=\"15%\">Amount</th>\n              <th width=\"10%\">Percentage</th>\n              <th width=\"20%\">Expected Date</th>\n              <th width=\"10%\">Inspection</th>\n              <th width=\"15%\">Status</th>\n            </tr>\n          </thead>\n          <tbody>\n            ").concat(drawSchedule.map(function (draw) { return "\n              <tr class=\"".concat(draw.status === 'Approved' ? 'budget-total' : draw.status === 'Rejected' ? 'budget-contingency' : '', "\">\n                <td>").concat(draw.number, "</td>\n                <td>").concat(draw.name, "</td>\n                <td>").concat(formatCurrency(draw.amount), "</td>\n                <td>").concat(draw.percentage, "%</td>\n                <td>").concat(getDateFromDays(draw.daysFromStart), "</td>\n                <td>").concat(draw.inspectionRequired ? 'Required' : 'Optional', "</td>\n                <td>").concat(draw.status, "</td>\n              </tr>\n            "); }).join(''), "\n            \n            <tr class=\"budget-total\">\n              <td colspan=\"2\"><strong>Total</strong></td>\n              <td><strong>").concat(formatCurrency(constructionBudget), "</strong></td>\n              <td><strong>100%</strong></td>\n              <td colspan=\"3\"></td>\n            </tr>\n          </tbody>\n        </table>\n      </div>\n      \n      <div class=\"budget-summary\">\n        <div class=\"subsection-title\">Funding Status</div>\n        <p><strong>Total Construction Budget:</strong> ").concat(formatCurrency(constructionBudget), "</p>\n        <p><strong>Approved Draw Payments:</strong> ").concat(formatCurrency(approvedAmount), "</p>\n        <p><strong>Remaining Budget:</strong> ").concat(formatCurrency(remainingAmount), "</p>\n        \n        <div class=\"progress-bar-container\">\n          <div class=\"progress-bar\" style=\"width: ").concat(Math.min(100, (approvedAmount / constructionBudget) * 100), "%\">\n            ").concat(Math.round((approvedAmount / constructionBudget) * 100), "% Funded\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Draw Request Procedures</div>\n        <ol>\n          <li><strong>Draw Request Submission:</strong> Submit draw requests at least 5 business days before funding is needed using the provided Draw Request Form.</li>\n          <li><strong>Required Documentation:</strong> Each draw request must include:\n            <ul>\n              <li>Completed draw request form</li>\n              <li>Contractor's invoice(s) for completed work</li>\n              <li>Lien waivers from all contractors and suppliers</li>\n              <li>Photos of completed work</li>\n              <li>Updated project timeline</li>\n            </ul>\n          </li>\n          <li><strong>Inspections:</strong> Where required, an inspection will be scheduled within 3 business days of receiving the draw request.</li>\n          <li><strong>Payment:</strong> Upon approval, funds will be disbursed within 2-3 business days.</li>\n          <li><strong>Retainage:</strong> 10% retainage will be held from each draw and released with the final payment upon completion of all work.</li>\n        </ol>\n      </div>\n      \n      <div class=\"notes-section\">\n        <div class=\"subsection-title\">Important Notes</div>\n        <ul>\n          <li>All draw requests are subject to inspection and approval.</li>\n          <li>Funds will only be released for completed work.</li>\n          <li>Any change orders must be approved in advance and may require amendment to this schedule.</li>\n          <li>Final draw requires certificate of occupancy or equivalent documentation where applicable.</li>\n          <li>Draw schedule may be adjusted based on project progress and unforeseen conditions.</li>\n        </ul>\n      </div>\n      \n      <div class=\"signature-section\">\n        <p><strong>Lender Representative:</strong> ").concat(loanData.underwriterName || 'John Matthews, Construction Loan Administrator', "</p>\n        <div class=\"signature-line\"></div>\n        <div>Lender Signature and Date</div>\n        \n        <div style=\"margin-top: 40px;\">\n          <div class=\"signature-line\"></div>\n          <div>Borrower Acknowledgement and Date</div>\n        </div>\n        \n        <div style=\"margin-top: 40px;\">\n          <div class=\"signature-line\"></div>\n          <div>General Contractor Acknowledgement and Date</div>\n        </div>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Construction Draw Schedule - ".concat(loanData.borrowerName), content);
};
exports.getDrawScheduleTemplate = getDrawScheduleTemplate;
