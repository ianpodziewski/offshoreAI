import React, { useMemo } from 'react';
import { LoanData } from '@/utilities/loanGenerator';

// Comprehensive US states mapping
const US_STATES_DATA = [
  { code: 'AL', x: 700, y: 400, name: 'Alabama' },
  { code: 'AK', x: 200, y: 500, name: 'Alaska' },
  { code: 'AZ', x: 250, y: 350, name: 'Arizona' },
  { code: 'AR', x: 500, y: 380, name: 'Arkansas' },
  { code: 'CA', x: 150, y: 300, name: 'California' },
  { code: 'CO', x: 350, y: 300, name: 'Colorado' },
  { code: 'CT', x: 850, y: 200, name: 'Connecticut' },
  { code: 'DE', x: 820, y: 250, name: 'Delaware' },
  { code: 'FL', x: 750, y: 480, name: 'Florida' },
  { code: 'GA', x: 700, y: 400, name: 'Georgia' },
  { code: 'HI', x: 300, y: 500, name: 'Hawaii' },
  { code: 'ID', x: 250, y: 200, name: 'Idaho' },
  { code: 'IL', x: 550, y: 300, name: 'Illinois' },
  { code: 'IN', x: 600, y: 300, name: 'Indiana' },
  { code: 'IA', x: 450, y: 250, name: 'Iowa' },
  { code: 'KS', x: 400, y: 350, name: 'Kansas' },
  { code: 'KY', x: 650, y: 350, name: 'Kentucky' },
  { code: 'LA', x: 550, y: 450, name: 'Louisiana' },
  { code: 'ME', x: 900, y: 150, name: 'Maine' },
  { code: 'MD', x: 800, y: 250, name: 'Maryland' },
  { code: 'MA', x: 850, y: 200, name: 'Massachusetts' },
  { code: 'MI', x: 600, y: 250, name: 'Michigan' },
  { code: 'MN', x: 450, y: 200, name: 'Minnesota' },
  { code: 'MS', x: 600, y: 430, name: 'Mississippi' },
  { code: 'MO', x: 500, y: 350, name: 'Missouri' },
  { code: 'MT', x: 300, y: 200, name: 'Montana' },
  { code: 'NE', x: 400, y: 300, name: 'Nebraska' },
  { code: 'NV', x: 200, y: 300, name: 'Nevada' },
  { code: 'NH', x: 850, y: 180, name: 'New Hampshire' },
  { code: 'NJ', x: 830, y: 250, name: 'New Jersey' },
  { code: 'NM', x: 350, y: 400, name: 'New Mexico' },
  { code: 'NY', x: 800, y: 200, name: 'New York' },
  { code: 'NC', x: 750, y: 350, name: 'North Carolina' },
  { code: 'ND', x: 400, y: 200, name: 'North Dakota' },
  { code: 'OH', x: 650, y: 300, name: 'Ohio' },
  { code: 'OK', x: 450, y: 400, name: 'Oklahoma' },
  { code: 'OR', x: 150, y: 200, name: 'Oregon' },
  { code: 'PA', x: 750, y: 250, name: 'Pennsylvania' },
  { code: 'RI', x: 850, y: 220, name: 'Rhode Island' },
  { code: 'SC', x: 750, y: 400, name: 'South Carolina' },
  { code: 'SD', x: 400, y: 250, name: 'South Dakota' },
  { code: 'TN', x: 650, y: 380, name: 'Tennessee' },
  { code: 'TX', x: 400, y: 450, name: 'Texas' },
  { code: 'UT', x: 300, y: 300, name: 'Utah' },
  { code: 'VT', x: 850, y: 180, name: 'Vermont' },
  { code: 'VA', x: 750, y: 300, name: 'Virginia' },
  { code: 'WA', x: 150, y: 150, name: 'Washington' },
  { code: 'WV', x: 700, y: 320, name: 'West Virginia' },
  { code: 'WI', x: 500, y: 250, name: 'Wisconsin' },
  { code: 'WY', x: 350, y: 250, name: 'Wyoming' }
];

// Color and size mapping functions
const getMarkerColor = (propertyType: string): string => {
  const colorMap: Record<string, string> = {
    single_family: '#FF6347',    // Tomato red
    multi_family: '#4682B4',     // Steel blue
    commercial: '#9370DB',       // Medium purple
    land: '#3CB371',             // Medium sea green
    industrial: '#FF8C00',       // Dark orange
  };
  
  return colorMap[propertyType] || '#888888'; // Default gray
};

const getMarkerSize = (loanAmount: number): number => {
  if (loanAmount > 500000) return 15;
  if (loanAmount > 250000) return 12;
  if (loanAmount > 100000) return 9;
  return 6;
};

// State code extraction
const extractStateCode = (address: string): string | null => {
  // More robust state code extraction
  const stateCodeMatch = address.match(/,\s*([A-Z]{2})\b/);
  return stateCodeMatch ? stateCodeMatch[1] : null;
};

interface PropertyMapProps {
  loans: LoanData[];
}

const PropertyMap: React.FC<PropertyMapProps> = ({ loans }) => {
  // Memoize loan grouping to prevent unnecessary recalculations
  const loansByState = useMemo(() => {
    const stateLoans: Record<string, LoanData[]> = {};
    
    loans.forEach(loan => {
      if (!loan.propertyAddress) return;
      
      const stateCode = extractStateCode(loan.propertyAddress);
      if (stateCode) {
        if (!stateLoans[stateCode]) {
          stateLoans[stateCode] = [];
        }
        stateLoans[stateCode].push(loan);
      }
    });
    
    return stateLoans;
  }, [loans]);

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    >
      {/* Background */}
      <rect x="0" y="0" width="1000" height="600" fill="#f9f9f9" />
      
      {/* US Outline */}
      <path 
        d="M100,100 L900,100 L900,500 L100,500 Z" 
        fill="none" 
        stroke="#e0e0e0" 
        strokeWidth="3" 
      />
      
      {/* Render state markers */}
      {US_STATES_DATA.map((state) => {
        const stateLoanData = loansByState[state.code] || [];
        
        // If no loans for this state, skip
        if (stateLoanData.length === 0) return null;
        
        // Calculate total loan amount for this state
        const totalLoanAmount = stateLoanData.reduce((sum, loan) => 
          sum + (loan.loanAmount || 0), 0);
        
        // Determine marker properties
        const markerColor = getMarkerColor(stateLoanData[0].propertyType || 'other');
        const markerSize = getMarkerSize(totalLoanAmount / stateLoanData.length);
        
        return (
          <g key={state.code}>
            <circle
              cx={state.x}
              cy={state.y}
              r={markerSize}
              fill={markerColor}
              fillOpacity={0.7}
              stroke="#FFFFFF"
              strokeWidth={2}
            >
              <title>
                {state.name}: {stateLoanData.length} loans
                (Total: ${totalLoanAmount.toLocaleString()})
              </title>
            </circle>
            <text
              x={state.x}
              y={state.y}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize="10"
              fontWeight="bold"
              fill="white"
            >
              {stateLoanData.length}
            </text>
          </g>
        );
      })}
      
      {/* Legend */}
      <g transform="translate(800, 50)">
        <text x="0" y="0" fontSize="12" fontWeight="bold">Loan Markers</text>
        {[
          { color: '#FF6347', label: 'Single Family' },
          { color: '#4682B4', label: 'Multi Family' },
          { color: '#9370DB', label: 'Commercial' },
          { color: '#3CB371', label: 'Land' },
          { color: '#FF8C00', label: 'Industrial' }
        ].map((item, index) => (
          <g key={item.label} transform={`translate(0, ${20 * (index + 1)})`}>
            <circle 
              cx="0" 
              cy="0" 
              r="5" 
              fill={item.color} 
              fillOpacity={0.7}
              stroke="#FFFFFF"
              strokeWidth={1}
            />
            <text 
              x="15" 
              y="5" 
              fontSize="10"
            >
              {item.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};

export default PropertyMap;