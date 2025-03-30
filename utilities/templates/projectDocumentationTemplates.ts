import { documentStyleService } from '../documentStyleService';
import { LoanData } from '../loanGenerator';

/**
 * Project Documentation Templates
 * Returns HTML strings for project and construction-related document types
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

// Format percentage helper
const formatPercent = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
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
  .budget-category {
    background-color: #e9ecef;
    font-weight: bold;
  }
  .budget-item {
    background-color: #f8f9fa;
  }
  .budget-total {
    background-color: #d1e7dd;
    font-weight: bold;
  }
  .budget-contingency {
    background-color: #f8d7da;
  }
  .budget-summary {
    margin-top: 30px;
    padding: 15px;
    background-color: #e2e3e5;
    border-radius: 4px;
  }
  .notes-section {
    margin-top: 20px;
    padding: 15px;
    background-color: #fff3cd;
    border-radius: 4px;
  }
  .progress-bar-container {
    width: 100%;
    background-color: #e9ecef;
    border-radius: 4px;
    margin: 5px 0;
  }
  .progress-bar {
    height: 20px;
    background-color: #0d6efd;
    border-radius: 4px;
    text-align: center;
    color: white;
    font-size: 12px;
    line-height: 20px;
  }
</style>`;

/**
 * Renovation/Construction Budget Template
 * Simulates a detailed construction budget with categories, line items, and totals
 */
const getRenovationBudgetTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  
  // Generate budget categories and items based on property type
  const generateBudgetItems = () => {
    // Base budget structure with categories and items
    const baseItems = [
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
  
  const budgetCategories = generateBudgetItems();
  
  // Calculate totals
  const directCosts = budgetCategories.reduce(
    (sum, category) => sum + category.items.reduce((s, item) => s + item.amount, 0), 
    0
  );
  
  // Contingency amount (typically 10-15% of direct costs)
  const contingencyPercent = Math.floor(Math.random() * 6) + 10; // 10-15%
  const contingencyAmount = Math.round(directCosts * (contingencyPercent / 100));
  
  // General contractor fee (typically 15-20% of direct costs)
  const gcFeePercent = Math.floor(Math.random() * 6) + 15; // 15-20%
  const gcFeeAmount = Math.round(directCosts * (gcFeePercent / 100));
  
  // Total project cost
  const totalProjectCost = directCosts + contingencyAmount + gcFeeAmount;
  
  // Determine how much of the rehab budget this represents
  const actualRehabBudget = loanData.rehabBudget || totalProjectCost;
  const budgetDifference = actualRehabBudget - totalProjectCost;
  const budgetDifferenceClass = budgetDifference >= 0 ? 'text-success' : 'text-danger';
  
  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">Renovation & Construction Budget</div>
        <div class="document-subtitle">Prepared: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <table class="info-table">
          <tr>
            <th>Project Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Property Owner:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Property Type:</th>
            <td>${loanData.propertyType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
          </tr>
          <tr>
            <th>Square Footage:</th>
            <td>${loanData.squareFootage?.toLocaleString() || 'Not Available'} SF</td>
          </tr>
          <tr>
            <th>Allocated Budget:</th>
            <td>${formatCurrency(actualRehabBudget)}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Construction Budget Breakdown</div>
        
        <table class="info-table">
          <thead>
            <tr>
              <th width="50%">Item Description</th>
              <th width="25%">Amount</th>
              <th width="25%">% of Direct Costs</th>
            </tr>
          </thead>
          <tbody>
            ${budgetCategories.map(category => `
              <tr class="budget-category">
                <td colspan="3">${category.category}</td>
              </tr>
              ${category.items.map(item => `
                <tr class="budget-item">
                  <td style="padding-left: 20px;">${item.name}</td>
                  <td>${formatCurrency(item.amount)}</td>
                  <td>${formatPercent((item.amount / directCosts) * 100)}</td>
                </tr>
              `).join('')}
            `).join('')}
            
            <tr class="budget-total">
              <td>Subtotal (Direct Costs)</td>
              <td>${formatCurrency(directCosts)}</td>
              <td>100.0%</td>
            </tr>
            
            <tr class="budget-contingency">
              <td>Contingency (${contingencyPercent}%)</td>
              <td>${formatCurrency(contingencyAmount)}</td>
              <td>${formatPercent(contingencyPercent)}</td>
            </tr>
            
            <tr>
              <td>General Contractor Fee (${gcFeePercent}%)</td>
              <td>${formatCurrency(gcFeeAmount)}</td>
              <td>${formatPercent(gcFeePercent)}</td>
            </tr>
            
            <tr class="budget-total">
              <td>Total Project Cost</td>
              <td>${formatCurrency(totalProjectCost)}</td>
              <td>${formatPercent((totalProjectCost / directCosts) * 100)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="budget-summary">
        <div class="subsection-title">Budget Summary</div>
        <p><strong>Allocated Renovation Budget:</strong> ${formatCurrency(actualRehabBudget)}</p>
        <p><strong>Total Project Cost:</strong> ${formatCurrency(totalProjectCost)}</p>
        <p><strong>Budget Difference:</strong> <span class="${budgetDifferenceClass}">${formatCurrency(budgetDifference)}</span></p>
        
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${Math.min(100, (totalProjectCost / actualRehabBudget) * 100)}%">
            ${Math.round((totalProjectCost / actualRehabBudget) * 100)}% of Budget
          </div>
        </div>
      </div>
      
      <div class="notes-section">
        <div class="subsection-title">Notes</div>
        <ul>
          <li>All costs are estimates and subject to change based on actual contractor bids and material costs.</li>
          <li>Contingency is recommended to cover unforeseen conditions and scope changes.</li>
          <li>This budget does not include financing costs, property acquisition, or holding costs.</li>
          <li>Permits and fees may vary based on local jurisdiction requirements.</li>
          <li>All work should be performed by licensed contractors where required by law.</li>
        </ul>
      </div>
      
      <div class="signature-section">
        <p><strong>Prepared By:</strong> ${['Robert Johnson, Construction Manager', 'Sarah Williams, Project Manager', 'Michael Thompson, Cost Estimator'][Math.floor(Math.random() * 3)]}</p>
        <div class="signature-line"></div>
        <div>Signature and Date</div>
        
        <div style="margin-top: 40px;">
          <div class="signature-line"></div>
          <div>Owner Approval and Date</div>
        </div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Renovation & Construction Budget - ${loanData.borrowerName}`, content);
};

/**
 * Draw Schedule Template
 * Simulates a construction draw schedule with milestones, amounts, and approval status
 */
const getDrawScheduleTemplate = (loanData: LoanData): string => {
  const formattedDate = formatDate();
  const reportNumber = `DS-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Calculate project timeline based on loan term
  const loanTermMonths = loanData.loanTerm || 12;
  const projectDuration = Math.min(loanTermMonths - 1, 8); // Project duration in months, max 8 months
  
  // Determine total construction budget
  const constructionBudget = loanData.rehabBudget || Math.round((loanData.loanAmount * 0.7) / 1000) * 1000;
  
  // Generate draw schedule with 4-6 draws
  const generateDrawSchedule = () => {
    const totalDraws = 4 + Math.floor(Math.random() * 3); // 4-6 draws
    const draws = [];
    
    // Predefined milestones
    const milestones = [
      'Initial Draw / Mobilization',
      'Foundation Complete',
      'Framing & Rough-ins Complete',
      'Drywall & Mechanical Systems',
      'Finish Work & Cabinetry',
      'Final Completion & Punch List'
    ];
    
    // Create a realistic draw schedule that adds up to 100%
    let remainingPercentage = 100;
    let elapsedDays = 0;
    const projectDurationDays = projectDuration * 30;
    
    for (let i = 0; i < totalDraws; i++) {
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
      } else {
        // Determine a realistic percentage for this draw
        let drawPercentage;
        if (i === 0) {
          // First draw is typically 10-20%
          drawPercentage = 10 + Math.floor(Math.random() * 11);
        } else {
          // Middle draws share the remaining percentage somewhat evenly
          const avgRemaining = remainingPercentage / (totalDraws - i);
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
  
  const drawSchedule = generateDrawSchedule();
  
  // Calculate approved amount
  const approvedAmount = drawSchedule
    .filter(draw => draw.status === 'Approved')
    .reduce((sum, draw) => sum + draw.amount, 0);
  
  // Calculate remaining amount
  const remainingAmount = constructionBudget - approvedAmount;
  
  // Format date from days
  const getDateFromDays = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const content = `
    <div class="document">
      <div class="document-header">
        <div class="document-title">Construction Draw Schedule</div>
        <div class="document-subtitle">Prepared: ${formattedDate}</div>
      </div>
      
      <div class="document-section">
        <table class="info-table">
          <tr>
            <th>Project Address:</th>
            <td>${loanData.propertyAddress}</td>
          </tr>
          <tr>
            <th>Borrower:</th>
            <td>${loanData.borrowerName}</td>
          </tr>
          <tr>
            <th>Loan Number:</th>
            <td>${loanData.id}</td>
          </tr>
          <tr>
            <th>Construction Budget:</th>
            <td>${formatCurrency(constructionBudget)}</td>
          </tr>
          <tr>
            <th>Project Duration:</th>
            <td>${projectDuration} months</td>
          </tr>
          <tr>
            <th>Draw Schedule ID:</th>
            <td>${reportNumber}</td>
          </tr>
        </table>
      </div>
      
      <div class="document-section">
        <div class="section-title">Draw Payment Schedule</div>
        
        <table class="info-table">
          <thead>
            <tr>
              <th width="5%">#</th>
              <th width="25%">Milestone</th>
              <th width="15%">Amount</th>
              <th width="10%">Percentage</th>
              <th width="20%">Expected Date</th>
              <th width="10%">Inspection</th>
              <th width="15%">Status</th>
            </tr>
          </thead>
          <tbody>
            ${drawSchedule.map(draw => `
              <tr class="${draw.status === 'Approved' ? 'budget-total' : draw.status === 'Rejected' ? 'budget-contingency' : ''}">
                <td>${draw.number}</td>
                <td>${draw.name}</td>
                <td>${formatCurrency(draw.amount)}</td>
                <td>${draw.percentage}%</td>
                <td>${getDateFromDays(draw.daysFromStart)}</td>
                <td>${draw.inspectionRequired ? 'Required' : 'Optional'}</td>
                <td>${draw.status}</td>
              </tr>
            `).join('')}
            
            <tr class="budget-total">
              <td colspan="2"><strong>Total</strong></td>
              <td><strong>${formatCurrency(constructionBudget)}</strong></td>
              <td><strong>100%</strong></td>
              <td colspan="3"></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="budget-summary">
        <div class="subsection-title">Funding Status</div>
        <p><strong>Total Construction Budget:</strong> ${formatCurrency(constructionBudget)}</p>
        <p><strong>Approved Draw Payments:</strong> ${formatCurrency(approvedAmount)}</p>
        <p><strong>Remaining Budget:</strong> ${formatCurrency(remainingAmount)}</p>
        
        <div class="progress-bar-container">
          <div class="progress-bar" style="width: ${Math.min(100, (approvedAmount / constructionBudget) * 100)}%">
            ${Math.round((approvedAmount / constructionBudget) * 100)}% Funded
          </div>
        </div>
      </div>
      
      <div class="document-section">
        <div class="section-title">Draw Request Procedures</div>
        <ol>
          <li><strong>Draw Request Submission:</strong> Submit draw requests at least 5 business days before funding is needed using the provided Draw Request Form.</li>
          <li><strong>Required Documentation:</strong> Each draw request must include:
            <ul>
              <li>Completed draw request form</li>
              <li>Contractor's invoice(s) for completed work</li>
              <li>Lien waivers from all contractors and suppliers</li>
              <li>Photos of completed work</li>
              <li>Updated project timeline</li>
            </ul>
          </li>
          <li><strong>Inspections:</strong> Where required, an inspection will be scheduled within 3 business days of receiving the draw request.</li>
          <li><strong>Payment:</strong> Upon approval, funds will be disbursed within 2-3 business days.</li>
          <li><strong>Retainage:</strong> 10% retainage will be held from each draw and released with the final payment upon completion of all work.</li>
        </ol>
      </div>
      
      <div class="notes-section">
        <div class="subsection-title">Important Notes</div>
        <ul>
          <li>All draw requests are subject to inspection and approval.</li>
          <li>Funds will only be released for completed work.</li>
          <li>Any change orders must be approved in advance and may require amendment to this schedule.</li>
          <li>Final draw requires certificate of occupancy or equivalent documentation where applicable.</li>
          <li>Draw schedule may be adjusted based on project progress and unforeseen conditions.</li>
        </ul>
      </div>
      
      <div class="signature-section">
        <p><strong>Lender Representative:</strong> ${loanData.underwriterName || 'John Matthews, Construction Loan Administrator'}</p>
        <div class="signature-line"></div>
        <div>Lender Signature and Date</div>
        
        <div style="margin-top: 40px;">
          <div class="signature-line"></div>
          <div>Borrower Acknowledgement and Date</div>
        </div>
        
        <div style="margin-top: 40px;">
          <div class="signature-line"></div>
          <div>General Contractor Acknowledgement and Date</div>
        </div>
      </div>
    </div>
  `;

  return documentStyleService.wrapContentWithWatermark(`Construction Draw Schedule - ${loanData.borrowerName}`, content);
};

// Export templates
export {
  getRenovationBudgetTemplate,
  getDrawScheduleTemplate
};
