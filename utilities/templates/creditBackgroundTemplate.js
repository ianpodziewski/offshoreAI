"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreditReportTemplate = void 0;
var documentStyleService_1 = require("../documentStyleService");
// Format date helper
var formatDate = function () {
    return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
// Format specific date with month/year
var formatMonthYear = function (date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
    });
};
// Generate random credit account data
var generateCreditAccounts = function (count, creditScore) {
    var accountTypes = ['Credit Card', 'Auto Loan', 'Mortgage', 'Personal Loan', 'Student Loan', 'Retail Card'];
    var creditors = ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Capital One', 'Discover', 'Citibank', 'American Express', 'US Bank', 'TD Bank', 'PNC Bank'];
    // Better payment history for higher credit scores
    var getPaymentHistory = function (score) {
        if (score > 750)
            return Array(24).fill('OK');
        if (score > 700) {
            var history_1 = Array(24).fill('OK');
            history_1[Math.floor(Math.random() * 24)] = '30';
            return history_1;
        }
        if (score > 650) {
            var history_2 = Array(24).fill('OK');
            history_2[Math.floor(Math.random() * 24)] = '30';
            history_2[Math.floor(Math.random() * 24)] = '30';
            return history_2;
        }
        // Lower scores
        var history = Array(24).fill('OK');
        history[Math.floor(Math.random() * 24)] = '30';
        history[Math.floor(Math.random() * 24)] = '60';
        history[Math.floor(Math.random() * 12)] = '90';
        return history;
    };
    var accounts = [];
    for (var i = 0; i < count; i++) {
        // Generate random opening date 1-15 years ago
        var openingDate = new Date();
        openingDate.setFullYear(openingDate.getFullYear() - (1 + Math.floor(Math.random() * 15)));
        // Generate appropriate limits/balances based on account type
        var accountType = accountTypes[Math.floor(Math.random() * accountTypes.length)];
        var creditLimit = 0;
        var balance = 0;
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
            accountType: accountType,
            creditor: creditors[Math.floor(Math.random() * creditors.length)],
            accountNumber: "xxxx-xxxx-xxxx-".concat(Math.floor(1000 + Math.random() * 9000)),
            openingDate: formatMonthYear(openingDate),
            creditLimit: creditLimit,
            balance: balance,
            paymentStatus: creditScore > 680 ? 'Current' : Math.random() > 0.8 ? '30 Days Past Due' : 'Current',
            paymentHistory: getPaymentHistory(creditScore)
        });
    }
    return accounts;
};
// Generate random inquiries
var generateInquiries = function (count) {
    var inquiryTypes = ['Auto Loan', 'Credit Card', 'Mortgage', 'Personal Loan', 'Apartment Rental'];
    var creditors = ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Capital One', 'Discover', 'Citibank', 'CarMax Auto Finance', 'Toyota Financial', 'Rocket Mortgage', 'SoFi'];
    var inquiries = [];
    for (var i = 0; i < count; i++) {
        // Random date within last 2 years
        var inquiryDate = new Date();
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
    return inquiries.sort(function (a, b) { return new Date(b.date).getTime() - new Date(a.date).getTime(); });
};
// Base style for the document
var baseStyle = "\n<style>\n  .document {\n    font-family: 'Arial', sans-serif;\n    max-width: 800px;\n    margin: 0 auto;\n    padding: 20px;\n    color: #333;\n  }\n  .document-header {\n    text-align: center;\n    margin-bottom: 30px;\n  }\n  .document-title {\n    font-size: 24px;\n    font-weight: bold;\n    margin-bottom: 5px;\n    text-transform: uppercase;\n  }\n  .document-subtitle {\n    font-size: 16px;\n    margin-bottom: 20px;\n  }\n  .document-section {\n    margin-bottom: 30px;\n  }\n  .section-title {\n    font-size: 18px;\n    font-weight: bold;\n    margin-bottom: 15px;\n    padding-bottom: 5px;\n    border-bottom: 1px solid #ddd;\n  }\n  .subsection-title {\n    font-size: 16px;\n    font-weight: bold;\n    margin: 10px 0;\n  }\n  .info-table {\n    width: 100%;\n    border-collapse: collapse;\n    margin-bottom: 20px;\n  }\n  .info-table th, .info-table td {\n    padding: 8px 10px;\n    text-align: left;\n    border-bottom: 1px solid #eee;\n  }\n  .info-table th {\n    font-weight: bold;\n    background-color: #f5f5f5;\n  }\n  .summary-box {\n    background-color: #f5f5f5;\n    border: 1px solid #ddd;\n    padding: 15px;\n    margin-bottom: 20px;\n    border-radius: 4px;\n  }\n  .score-container {\n    display: flex;\n    align-items: center;\n    margin-bottom: 15px;\n  }\n  .score-circle {\n    width: 120px;\n    height: 120px;\n    border-radius: 50%;\n    background: conic-gradient(\n      #4CAF50 0% calc((var(--score) - 300) / 550 * 100%),\n      #f5f5f5 calc((var(--score) - 300) / 550 * 100%) 100%\n    );\n    position: relative;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    margin-right: 20px;\n  }\n  .score-circle::before {\n    content: \"\";\n    width: 90px;\n    height: 90px;\n    background: white;\n    border-radius: 50%;\n    position: absolute;\n  }\n  .score-value {\n    position: relative;\n    font-size: 24px;\n    font-weight: bold;\n    color: #333;\n  }\n  .score-details {\n    flex: 1;\n  }\n  .score-range {\n    display: flex;\n    justify-content: space-between;\n    margin-top: 5px;\n    font-size: 12px;\n    color: #666;\n  }\n  .score-category {\n    font-weight: bold;\n    margin-bottom: 5px;\n    font-size: 18px;\n  }\n  .payment-history {\n    display: flex;\n    flex-wrap: wrap;\n    margin-bottom: 10px;\n  }\n  .payment-month {\n    width: 25px;\n    height: 25px;\n    font-size: 10px;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    margin: 2px;\n    border-radius: 4px;\n  }\n  .payment-ok {\n    background-color: #4CAF50;\n    color: white;\n  }\n  .payment-30 {\n    background-color: #FFC107;\n    color: black;\n  }\n  .payment-60 {\n    background-color: #FF9800;\n    color: white;\n  }\n  .payment-90 {\n    background-color: #F44336;\n    color: white;\n  }\n  .credit-factors {\n    display: flex;\n    flex-wrap: wrap;\n    justify-content: space-between;\n    margin-bottom: 20px;\n  }\n  .factor-box {\n    width: 48%;\n    background-color: #f9f9f9;\n    border: 1px solid #eee;\n    padding: 12px;\n    margin-bottom: 15px;\n    border-radius: 4px;\n  }\n  .factor-title {\n    font-weight: bold;\n    margin-bottom: 5px;\n    display: flex;\n    align-items: center;\n  }\n  .factor-indicator {\n    width: 10px;\n    height: 10px;\n    border-radius: 50%;\n    margin-right: 8px;\n    display: inline-block;\n  }\n  .indicator-excellent {\n    background-color: #4CAF50;\n  }\n  .indicator-good {\n    background-color: #8BC34A;\n  }\n  .indicator-fair {\n    background-color: #FFC107;\n  }\n  .indicator-poor {\n    background-color: #F44336;\n  }\n  .account-section {\n    margin-bottom: 25px;\n    padding-bottom: 10px;\n    border-bottom: 1px dashed #ddd;\n  }\n  .account-header {\n    display: flex;\n    justify-content: space-between;\n    margin-bottom: 10px;\n  }\n  .account-name {\n    font-weight: bold;\n  }\n  .balance-bar {\n    height: 8px;\n    background-color: #e0e0e0;\n    margin: 5px 0 10px 0;\n    border-radius: 4px;\n    overflow: hidden;\n  }\n  .balance-fill {\n    height: 100%;\n    background-color: #4CAF50;\n    border-radius: 4px;\n  }\n  .legal-disclaimer {\n    font-size: 12px;\n    color: #666;\n    font-style: italic;\n    margin-top: 30px;\n  }\n  /* Add responsive design */\n  @media (max-width: 600px) {\n    .factor-box {\n      width: 100%;\n    }\n  }\n</style>";
/**
 * Credit Report Template
 * Provides a comprehensive credit report with score, accounts, inquiries, and factors
 */
var getCreditReportTemplate = function (loanData) {
    var formattedDate = formatDate();
    var creditScore = loanData.creditScore || Math.floor(Math.random() * (850 - 650) + 650);
    // Determine credit score category
    var scoreCategory = '';
    var scoreColor = '';
    if (creditScore >= 800) {
        scoreCategory = 'Exceptional';
        scoreColor = '#4CAF50';
    }
    else if (creditScore >= 740) {
        scoreCategory = 'Very Good';
        scoreColor = '#8BC34A';
    }
    else if (creditScore >= 670) {
        scoreCategory = 'Good';
        scoreColor = '#FFC107';
    }
    else if (creditScore >= 580) {
        scoreCategory = 'Fair';
        scoreColor = '#FF9800';
    }
    else {
        scoreCategory = 'Poor';
        scoreColor = '#F44336';
    }
    // Generate credit accounts based on credit score
    var accountCount = 7 + Math.floor(Math.random() * 6); // 7-12 accounts
    var accounts = generateCreditAccounts(accountCount, creditScore);
    // Calculate totals
    var totalBalance = accounts.reduce(function (sum, account) { return sum + account.balance; }, 0);
    var totalCreditLimit = accounts.reduce(function (sum, account) { return sum + account.creditLimit; }, 0);
    var utilizationRate = Math.round((totalBalance / totalCreditLimit) * 100);
    // Generate inquiries
    var inquiryCount = Math.floor(Math.random() * 4) + 1; // 1-4 inquiries
    var inquiries = generateInquiries(inquiryCount);
    // Credit account age calculation
    var oldestAccount = Math.max.apply(Math, accounts.map(function (a) {
        var year = parseInt(a.openingDate.split(' ')[1]);
        var month = new Date(Date.parse(a.openingDate.split(' ')[0] + ' 1, 2000')).getMonth();
        var currentYear = new Date().getFullYear();
        var currentMonth = new Date().getMonth();
        return (currentYear - year) * 12 + (currentMonth - month);
    }));
    var averageAccountAge = Math.round(accounts.reduce(function (sum, a) {
        var year = parseInt(a.openingDate.split(' ')[1]);
        var month = new Date(Date.parse(a.openingDate.split(' ')[0] + ' 1, 2000')).getMonth();
        var currentYear = new Date().getFullYear();
        var currentMonth = new Date().getMonth();
        return sum + (currentYear - year) * 12 + (currentMonth - month);
    }, 0) / accounts.length);
    var content = "\n    <div class=\"document\">\n      <div class=\"document-header\">\n        <div class=\"document-title\">Credit Report</div>\n        <div class=\"document-subtitle\">Generated on: ".concat(formattedDate, "</div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Consumer Information</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Name:</th>\n            <td>").concat(loanData.borrowerName, "</td>\n          </tr>\n          <tr>\n            <th>Address:</th>\n            <td>").concat(loanData.borrowerAddress || '123 Main Street, Anytown, USA 12345', "</td>\n          </tr>\n          <tr>\n            <th>Social Security Number:</th>\n            <td>XXX-XX-").concat(Math.floor(1000 + Math.random() * 9000), "</td>\n          </tr>\n          <tr>\n            <th>Date of Birth:</th>\n            <td>XX/XX/").concat(1950 + Math.floor(Math.random() * 40), "</td>\n          </tr>\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Credit Score Summary</div>\n        <div class=\"summary-box\">\n          <div class=\"score-container\">\n            <div class=\"score-circle\" style=\"--score: ").concat(creditScore, "\">\n              <div class=\"score-value\">").concat(creditScore, "</div>\n            </div>\n            <div class=\"score-details\">\n              <div class=\"score-category\" style=\"color: ").concat(scoreColor, "\">").concat(scoreCategory, "</div>\n              <p>Your score is ").concat(creditScore > 720 ? 'above' : creditScore > 670 ? 'near' : 'below', " the U.S. average of 714.</p>\n              <div class=\"score-range\">\n                <span>300</span>\n                <span>850</span>\n              </div>\n            </div>\n          </div>\n        </div>\n        \n        <div class=\"credit-factors\">\n          <div class=\"factor-box\">\n            <div class=\"factor-title\">\n              <span class=\"factor-indicator ").concat(utilizationRate < 30 ? 'indicator-excellent' : utilizationRate < 50 ? 'indicator-good' : utilizationRate < 70 ? 'indicator-fair' : 'indicator-poor', "\"></span>\n              Credit Utilization\n            </div>\n            <p>").concat(utilizationRate, "% of available credit used</p>\n          </div>\n          <div class=\"factor-box\">\n            <div class=\"factor-title\">\n              <span class=\"factor-indicator ").concat(creditScore > 720 ? 'indicator-excellent' : creditScore > 670 ? 'indicator-good' : 'indicator-fair', "\"></span>\n              Payment History\n            </div>\n            <p>").concat(Math.round(accounts.reduce(function (sum, a) { return sum + a.paymentHistory.filter(function (p) { return p === 'OK'; }).length; }, 0) / (accounts.length * 24) * 100), "% on-time payments</p>\n          </div>\n          <div class=\"factor-box\">\n            <div class=\"factor-title\">\n              <span class=\"factor-indicator ").concat(averageAccountAge > 84 ? 'indicator-excellent' : averageAccountAge > 48 ? 'indicator-good' : averageAccountAge > 24 ? 'indicator-fair' : 'indicator-poor', "\"></span>\n              Credit Age\n            </div>\n            <p>Average: ").concat(Math.floor(averageAccountAge / 12), " years, ").concat(averageAccountAge % 12, " months</p>\n          </div>\n          <div class=\"factor-box\">\n            <div class=\"factor-title\">\n              <span class=\"factor-indicator ").concat(inquiries.length <= 2 ? 'indicator-excellent' : inquiries.length <= 4 ? 'indicator-good' : 'indicator-fair', "\"></span>\n              Recent Inquiries\n            </div>\n            <p>").concat(inquiries.length, " in the last 2 years</p>\n          </div>\n        </div>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Accounts Summary</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Total Accounts</th>\n            <th>Total Balance</th>\n            <th>Available Credit</th>\n            <th>Utilization Rate</th>\n          </tr>\n          <tr>\n            <td>").concat(accounts.length, "</td>\n            <td>$").concat(totalBalance.toLocaleString(), "</td>\n            <td>$").concat((totalCreditLimit - totalBalance).toLocaleString(), "</td>\n            <td>").concat(utilizationRate, "%</td>\n          </tr>\n        </table>\n        \n        <div class=\"subsection-title\">Account Types</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Type</th>\n            <th>Count</th>\n            <th>Total Balance</th>\n          </tr>\n          ").concat(Array.from(new Set(accounts.map(function (a) { return a.accountType; }))).map(function (type) {
        var typeAccounts = accounts.filter(function (a) { return a.accountType === type; });
        var typeBalance = typeAccounts.reduce(function (sum, a) { return sum + a.balance; }, 0);
        return "<tr>\n              <td>".concat(type, "</td>\n              <td>").concat(typeAccounts.length, "</td>\n              <td>$").concat(typeBalance.toLocaleString(), "</td>\n            </tr>");
    }).join(''), "\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Account Details</div>\n        ").concat(accounts.map(function (account) {
        var utilizationPercent = Math.round((account.balance / account.creditLimit) * 100);
        return "\n            <div class=\"account-section\">\n              <div class=\"account-header\">\n                <div class=\"account-name\">".concat(account.creditor, " - ").concat(account.accountType, "</div>\n                <div>").concat(account.paymentStatus, "</div>\n              </div>\n              <table class=\"info-table\">\n                <tr>\n                  <th>Account Number</th>\n                  <td>").concat(account.accountNumber, "</td>\n                </tr>\n                <tr>\n                  <th>Date Opened</th>\n                  <td>").concat(account.openingDate, "</td>\n                </tr>\n                <tr>\n                  <th>Credit Limit</th>\n                  <td>$").concat(account.creditLimit.toLocaleString(), "</td>\n                </tr>\n                <tr>\n                  <th>Current Balance</th>\n                  <td>$").concat(account.balance.toLocaleString(), "</td>\n                </tr>\n                <tr>\n                  <th>Utilization</th>\n                  <td>").concat(utilizationPercent, "%</td>\n                </tr>\n              </table>\n              <div class=\"balance-bar\">\n                <div class=\"balance-fill\" style=\"width: ").concat(utilizationPercent, "%\"></div>\n              </div>\n              <div class=\"subsection-title\">Payment History (Last 24 Months)</div>\n              <div class=\"payment-history\">\n                ").concat(account.paymentHistory.map(function (status, index) {
            var statusClass = status === 'OK' ? 'payment-ok' :
                status === '30' ? 'payment-30' :
                    status === '60' ? 'payment-60' : 'payment-90';
            return "<div class=\"payment-month ".concat(statusClass, "\">").concat(status, "</div>");
        }).join(''), "\n              </div>\n            </div>\n          ");
    }).join(''), "\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Credit Inquiries (Last 2 Years)</div>\n        <table class=\"info-table\">\n          <tr>\n            <th>Date</th>\n            <th>Creditor</th>\n            <th>Type</th>\n          </tr>\n          ").concat(inquiries.map(function (inquiry) {
        return "<tr>\n              <td>".concat(inquiry.date, "</td>\n              <td>").concat(inquiry.creditor, "</td>\n              <td>").concat(inquiry.inquiryType, "</td>\n            </tr>");
    }).join(''), "\n        </table>\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Public Records</div>\n        ").concat(creditScore < 650 ? "\n          <table class=\"info-table\">\n            <tr>\n              <th>Type</th>\n              <th>Date Filed</th>\n              <th>Amount</th>\n              <th>Status</th>\n            </tr>\n            <tr>\n              <td>Civil Judgment</td>\n              <td>".concat(new Date(new Date().setFullYear(new Date().getFullYear() - 3)).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }), "</td>\n              <td>$").concat((Math.floor(Math.random() * 5) + 1) * 1000, "</td>\n              <td>Satisfied</td>\n            </tr>\n          </table>\n        ") : "\n          <p>No public records found on your credit report.</p>\n        ", "\n      </div>\n      \n      <div class=\"document-section\">\n        <div class=\"section-title\">Recommendations</div>\n        <ul>\n          ").concat(utilizationRate > 30 ? "<li>Consider paying down balances to reduce your credit utilization below 30%.</li>" : '', "\n          ").concat(accounts.some(function (a) { return a.paymentHistory.some(function (p) { return p !== 'OK'; }); }) ? "<li>Continue making all payments on time to improve your payment history.</li>" : '', "\n          ").concat(inquiries.length > 3 ? "<li>Limit new credit applications to avoid multiple hard inquiries in a short period.</li>" : '', "\n          ").concat(accounts.length < 5 ? "<li>Consider a diverse mix of credit accounts to strengthen your credit profile.</li>" : '', "\n          <li>Regularly monitor your credit report for any inaccuracies or signs of fraud.</li>\n          <li>Keep older accounts open to maintain a longer credit history.</li>\n        </ul>\n      </div>\n      \n      <div class=\"legal-disclaimer\">\n        <p>This credit report is being provided for loan application purposes only. The information contained in this report is based on data gathered from various sources and may not be completely accurate or up to date. You have the right to dispute any information you believe to be inaccurate. This report is not an official credit bureau report, and the credit score shown may differ from scores used by actual lenders.</p>\n      </div>\n    </div>\n  ");
    return documentStyleService_1.documentStyleService.wrapContentWithWatermark("Credit Report - ".concat(loanData.borrowerName), content);
};
exports.getCreditReportTemplate = getCreditReportTemplate;
