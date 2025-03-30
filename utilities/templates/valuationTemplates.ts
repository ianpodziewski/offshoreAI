import { LoanData } from '../loanGenerator';
import { documentStyleService } from '../documentStyleService';
/**
 * Valuation Templates
 * Returns HTML strings for valuation-related document types
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
  .grid-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 20px;
  }
  .grid-item {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 4px;
  }
  .comparable-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 20px;
  }
  .comparable-item {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
  }
  .value-conclusion {
    background-color: #e9ecef;
    padding: 20px;
    border-radius: 4px;
    margin: 20px 0;
  }
  .certification-box {
    background-color: #f8f9fa;
    padding: 20px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    margin: 20px 0;
  }
</style>`;

/**
 * Appraisal Report Template
 * Simulates a professional real estate appraisal report
 */
const getAppraisalReportTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const reportNumber = `APR-${Math.floor(100000 + Math.random() * 900000)}`;
  const effectiveDate = formattedDate;
  
  // Generate random appraiser information
  const appraiserName = ['James Wilson, MAI', 'Sarah Thompson, SRA', 'Michael Roberts, AI-GRS', 'Elizabeth Chen, AI-RRS'][Math.floor(Math.random() * 4)];
  const appraisalFirm = ['Wilson & Associates', 'Thompson Appraisal Group', 'Roberts Valuation Services', 'Chen & Partners'][Math.floor(Math.random() * 4)];
  const licenseNumber = `AP${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Generate comparable sales
  const generateComparableSales = () => {
    const basePrice = loanData.propertyValue || loanData.purchasePrice || loanData.loanAmount;
    const comps = [];
    
    for (let i = 0; i < 3; i++) {
      const variance = (Math.random() - 0.5) * 0.2; // +/- 10% variance
      const price = Math.round(basePrice * (1 + variance));
      const daysAgo = Math.floor(Math.random() * 180) + 1; // Within last 6 months
      const squareFeetVariance = (Math.random() - 0.5) * 0.15; // +/- 7.5% variance
      const squareFeet = Math.round((loanData.squareFootage || 2000) * (1 + squareFeetVariance));
      
      comps.push({
        address: `${Math.floor(Math.random() * 9000) + 1000} ${['Maple', 'Oak', 'Cedar', 'Pine'][Math.floor(Math.random() * 4)]} ${['St', 'Ave', 'Dr', 'Ln'][Math.floor(Math.random() * 4)]}`,
        price,
        saleDate: new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000)).toLocaleDateString(),
        squareFeet,
        pricePerSqFt: Math.round(price / squareFeet),
        bedrooms: (loanData.bedrooms || 3) + (Math.floor(Math.random() * 3) - 1),
        bathrooms: (loanData.bathrooms || 2) + (Math.floor(Math.random() * 2) - 1),
        condition: ['Average', 'Good', 'Very Good', 'Excellent'][Math.floor(Math.random() * 4)]
      });
    }
    
    return comps;
  };
  
  const comparableSales = generateComparableSales();
  
  // Calculate final value opinion
  const finalValue = Math.round(
    comparableSales.reduce((sum, comp) => sum + comp.price, 0) / comparableSales.length
  );
  
  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">Uniform Residential Appraisal Report</div>
        <div class="document-subtitle">${appraisalFirm}</div>
      </div>
      
      <div class="document-section">
        <table class="info-table">
          <tr>
            <th>File Number:</th>
            <td>${reportNumber}</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Borrower:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Effective Date:</th>
            <td>${effectiveDate}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Subject Property Characteristics</div>
        <div class="grid-container">
          <div class="grid-item">
            <strong>Property Type:</strong> ${loanData.propertyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}<br>
            <strong>Year Built:</strong> ${loanData.yearBuilt || 'Not Available'}<br>
            <strong>Square Footage:</strong> ${loanData.squareFootage?.toLocaleString() || 'Not Available'} SF<br>
            <strong>Lot Size:</strong> ${loanData.lotSize || 'Not Available'}
          </div>
          <div class="grid-item">
            <strong>Bedrooms:</strong> ${loanData.bedrooms || 'Not Available'}<br>
            <strong>Bathrooms:</strong> ${loanData.bathrooms || 'Not Available'}<br>
            <strong>Zoning:</strong> ${loanData.zoning || 'Residential'}<br>
            <strong>Current Use:</strong> ${loanData.propertyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Neighborhood Characteristics</div>
        <div class="grid-container">
          <div class="grid-item">
            <strong>Location Type:</strong> Urban<br>
            <strong>Built Up:</strong> Over 75%<br>
            <strong>Growth Rate:</strong> Stable<br>
            <strong>Property Values:</strong> Increasing
          </div>
          <div class="grid-item">
            <strong>Neighborhood Age:</strong> ${Math.floor(Math.random() * 30 + 20)} - ${Math.floor(Math.random() * 30 + 50)} years<br>
            <strong>Price Range:</strong> ${formatCurrency(finalValue * 0.7)} - ${formatCurrency(finalValue * 1.3)}<br>
            <strong>Marketing Time:</strong> ${Math.floor(Math.random() * 90 + 30)} days<br>
            <strong>Land Use:</strong> ${Math.floor(Math.random() * 10 + 85)}% Single Family
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Comparable Sales Analysis</div>
        <div class="comparable-container">
          ${comparableSales.map((comp, index) => `
            <div class="comparable-item">
              <strong>Comparable ${index + 1}</strong><br>
              Address: ${comp.address}<br>
              Sale Price: ${formatCurrency(comp.price)}<br>
              Sale Date: ${comp.saleDate}<br>
              Square Feet: ${comp.squareFeet}<br>
              Price/SF: ${formatCurrency(comp.pricePerSqFt)}<br>
              Bed/Bath: ${comp.bedrooms}/${comp.bathrooms}<br>
              Condition: ${comp.condition}
            </div>
          `).join('')}
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Value Conclusion</div>
        <div class="value-conclusion">
          <p>Based on the direct comparison approach and after careful consideration of all relevant factors, it is my opinion that the market value of the subject property, as of ${effectiveDate}, is:</p>
          <h2 style="text-align: center; margin: 20px 0;">${formatCurrency(finalValue)}</h2>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Reconciliation and Final Comments</div>
        <p>The opinion of value is based primarily on the Sales Comparison Approach, which best reflects market behavior for this property type. The comparable sales utilized in this analysis are considered reliable indicators of value for the subject property, requiring minimal adjustments for differences in characteristics.</p>
        <p>The subject property is located in a ${['stable', 'growing', 'well-established'][Math.floor(Math.random() * 3)]} neighborhood with ${['good', 'strong', 'steady'][Math.floor(Math.random() * 3)]} market demand. The overall condition of the property is ${['average', 'good', 'very good'][Math.floor(Math.random() * 3)]} and consistent with the age and class of improvements.</p>
      </div>
      
      <div class="document-section">
        <div class="certification-box">
          <div class="subsection-title">Appraiser's Certification</div>
          <p>I certify that, to the best of my knowledge and belief:</p>
          <ul>
            <li>The statements of fact contained in this report are true and correct.</li>
            <li>The reported analyses, opinions, and conclusions are limited only by the reported assumptions and limiting conditions and are my personal, impartial, and unbiased professional analyses, opinions, and conclusions.</li>
            <li>I have no present or prospective interest in the property that is the subject of this report and no personal interest with respect to the parties involved.</li>
            <li>I have performed no services, as an appraiser or in any other capacity, regarding the property that is the subject of this report within the three-year period immediately preceding acceptance of this assignment.</li>
            <li>My engagement in this assignment was not contingent upon developing or reporting predetermined results.</li>
          </ul>
        </div>
        
        <div class="signature-section">
          <p><strong>Appraiser:</strong> ${appraiserName}</p>
          <p><strong>License #:</strong> ${licenseNumber}</p>
          <p><strong>Firm:</strong> ${appraisalFirm}</p>
          <div class="signature-line"></div>
          <div>Signature and Date</div>
        </div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Appraisal Report - ${loanData.borrowerName}`, content);
};

/**
 * Broker Price Opinion Template
 * Simulates a professional BPO report with market analysis
 */
const getBrokerPriceOpinionTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const reportNumber = `BPO-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Generate random broker information
  const brokerName = ['Jennifer Martinez, CRB', 'Thomas Anderson, GRI', 'Rachel Williams, ABR', 'Daniel Lee, CRS'][Math.floor(Math.random() * 4)];
  const brokerageFirm = ['Martinez Real Estate Group', 'Anderson & Associates', 'Williams Realty Partners', 'Lee Property Advisors'][Math.floor(Math.random() * 4)];
  const licenseNumber = `BR${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Generate market conditions
  const marketConditions = {
    averageDaysOnMarket: Math.floor(Math.random() * 45) + 15,
    inventoryMonths: Number((Math.random() * 4 + 1).toFixed(1)),
    priceChange: Number((Math.random() * 8 - 2).toFixed(1)),
    marketTrend: ['Increasing', 'Stable', 'Slightly Increasing', 'Slightly Decreasing'][Math.floor(Math.random() * 4)]
  };
  
  // Generate value opinions
  const asIsValue = loanData.propertyValue || loanData.purchasePrice || loanData.loanAmount;
  const quickSaleValue = Math.round(asIsValue * 0.9);
  const afterRepairValue = loanData.afterRepairValue || Math.round(asIsValue * 1.3);
  
  // Generate repair recommendations
  const repairItems = [
    { item: 'Interior Paint', cost: Math.round((Math.random() * 3000 + 2000) / 100) * 100 },
    { item: 'Flooring Replacement', cost: Math.round((Math.random() * 5000 + 3000) / 100) * 100 },
    { item: 'Kitchen Updates', cost: Math.round((Math.random() * 15000 + 5000) / 100) * 100 },
    { item: 'Bathroom Renovation', cost: Math.round((Math.random() * 10000 + 5000) / 100) * 100 },
    { item: 'Exterior Paint', cost: Math.round((Math.random() * 6000 + 4000) / 100) * 100 }
  ];
  
  const totalRepairCost = repairItems.reduce((sum, item) => sum + item.cost, 0);
  
  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">Broker Price Opinion</div>
        <div class="document-subtitle">${brokerageFirm}</div>
      </div>
      
      <div class="document-section">
        <table class="info-table">
          <tr>
            <th>BPO Reference Number:</th>
            <td>${reportNumber}</td>
          </tr>
          <tr>
            <th>Property Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Client:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Report Date:</th>
            <td>${formattedDate}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Property Overview</div>
        <div class="grid-container">
          <div class="grid-item">
            <strong>Property Type:</strong> ${loanData.propertyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}<br>
            <strong>Year Built:</strong> ${loanData.yearBuilt || 'Not Available'}<br>
            <strong>Square Footage:</strong> ${loanData.squareFootage?.toLocaleString() || 'Not Available'} SF<br>
            <strong>Lot Size:</strong> ${loanData.lotSize || 'Not Available'}
          </div>
          <div class="grid-item">
            <strong>Bedrooms:</strong> ${loanData.bedrooms || 'Not Available'}<br>
            <strong>Bathrooms:</strong> ${loanData.bathrooms || 'Not Available'}<br>
            <strong>Parking:</strong> ${['2 Car Garage', 'Attached Garage', 'Carport', 'Street Parking'][Math.floor(Math.random() * 4)]}<br>
            <strong>Overall Condition:</strong> ${['Fair', 'Average', 'Good', 'Excellent'][Math.floor(Math.random() * 4)]}
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Market Analysis</div>
        <div class="grid-container">
          <div class="grid-item">
            <strong>Average Days on Market:</strong> ${marketConditions.averageDaysOnMarket} days<br>
            <strong>Inventory Supply:</strong> ${marketConditions.inventoryMonths} months<br>
            <strong>Price Trend (YoY):</strong> ${marketConditions.priceChange}%<br>
            <strong>Market Direction:</strong> ${marketConditions.marketTrend}
          </div>
          <div class="grid-item">
            <strong>Typical Marketing Time:</strong> ${Math.floor(marketConditions.averageDaysOnMarket * 1.2)} days<br>
            <strong>Buyer's/Seller's Market:</strong> ${marketConditions.inventoryMonths < 6 ? "Seller's" : "Buyer's"} Market<br>
            <strong>Demand Level:</strong> ${['Strong', 'Moderate', 'Average', 'Below Average'][Math.floor(Math.random() * 4)]}<br>
            <strong>Competition Level:</strong> ${['High', 'Moderate', 'Low'][Math.floor(Math.random() * 3)]}
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Value Opinions</div>
        <div class="value-conclusion">
          <table class="info-table">
            <tr>
              <th>As-Is Market Value:</th>
              <td>${formatCurrency(asIsValue)}</td>
            </tr>
            <tr>
              <th>Quick Sale Value:</th>
              <td>${formatCurrency(quickSaleValue)}</td>
            </tr>
            <tr>
              <th>After Repair Value:</th>
              <td>${formatCurrency(afterRepairValue)}</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Recommended Repairs and Improvements</div>
        <table class="info-table">
          ${repairItems.map(item => `
            <tr>
              <th>${item.item}:</th>
              <td>${formatCurrency(item.cost)}</td>
            </tr>
          `).join('')}
          <tr>
            <th>Total Estimated Repair Cost:</th>
            <td>${formatCurrency(totalRepairCost)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Marketing Recommendations</div>
        <p>Based on current market conditions and property characteristics, the following marketing strategy is recommended:</p>
        <ul>
          <li>List price recommendation: ${formatCurrency(Math.round(asIsValue * 1.02))}</li>
          <li>Suggested marketing time: ${marketConditions.averageDaysOnMarket + 15} days</li>
          <li>Target buyer profile: ${['First-time homebuyer', 'Move-up buyer', 'Investor', 'Luxury buyer'][Math.floor(Math.random() * 4)]}</li>
          <li>Recommended improvements before listing: ${repairItems.slice(0, 2).map(item => item.item.toLowerCase()).join(' and ')}</li>
        </ul>
      </div>
      
      <div class="document-section">
        <div class="certification-box">
          <div class="subsection-title">Broker's Certification</div>
          <p>I certify that:</p>
          <ul>
            <li>The statements of fact contained in this report are true and correct to the best of my knowledge.</li>
            <li>The reported analyses, opinions, and conclusions are limited only by the reported assumptions and limiting conditions.</li>
            <li>I have no present or prospective interest in the property that is the subject of this report.</li>
            <li>I have no bias with respect to the property that is the subject of this report or to the parties involved.</li>
            <li>My engagement in this assignment was not contingent upon developing or reporting predetermined results.</li>
          </ul>
        </div>
        
        <div class="signature-section">
          <p><strong>Broker:</strong> ${brokerName}</p>
          <p><strong>License #:</strong> ${licenseNumber}</p>
          <p><strong>Firm:</strong> ${brokerageFirm}</p>
          <div class="signature-line"></div>
          <div>Signature and Date</div>
        </div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Broker Price Opinion - ${loanData.borrowerName}`, content);
};

// Export templates
export {
  getAppraisalReportTemplate,
  getBrokerPriceOpinionTemplate
};
