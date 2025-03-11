import React, { useState, useEffect } from 'react';
import { LoanData } from '@/utilities/loanGenerator';

// Exact coordinate system for US states
const US_STATES_COORDINATES: Record<string, [number, number]> = {
  AL: [32.7794, -86.8287],
  AK: [64.0685, -152.2782],
  AZ: [34.2744, -111.6602],
  AR: [34.8938, -92.4426],
  CA: [37.1841, -119.4696],
  CO: [38.9972, -105.5478],
  CT: [41.6219, -72.7273],
  DE: [38.9896, -75.5050],
  FL: [28.6305, -82.4497],
  GA: [32.6415, -83.4426],
  HI: [20.2927, -156.3737],
  ID: [44.3509, -114.6130],
  IL: [40.0417, -89.1965],
  IN: [39.8942, -86.2816],
  IA: [42.0751, -93.4960],
  KS: [38.4937, -98.3804],
  KY: [37.5347, -85.3021],
  LA: [31.0689, -91.9968],
  ME: [45.3695, -69.2428],
  MD: [38.9784, -76.4922],
  MA: [42.2596, -71.8083],
  MI: [44.3467, -85.4102],
  MN: [46.2807, -94.3053],
  MS: [32.7364, -89.6678],
  MO: [38.3566, -92.4580],
  MT: [47.0527, -109.6333],
  NE: [41.5378, -99.7951],
  NV: [39.3289, -116.6312],
  NH: [43.6805, -71.5811],
  NJ: [40.1907, -74.6728],
  NM: [34.4071, -106.1126],
  NY: [42.9538, -75.5268],
  NC: [35.5557, -79.3877],
  ND: [47.4501, -100.4659],
  OH: [40.2862, -82.7937],
  OK: [35.5889, -97.4943],
  OR: [43.9336, -120.5583],
  PA: [40.8781, -77.7996],
  RI: [41.6762, -71.5562],
  SC: [33.9169, -80.8964],
  SD: [44.4443, -100.2263],
  TN: [35.8580, -86.3505],
  TX: [31.4757, -99.3312],
  UT: [39.3055, -111.6703],
  VT: [44.0687, -72.6658],
  VA: [37.5215, -78.8537],
  WA: [47.3826, -120.4472],
  WV: [38.6409, -80.6227],
  WI: [44.6243, -89.9941],
  WY: [42.9957, -107.5512]
};

// Property type to color mapping
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

// Loan type to marker size mapping
const getMarkerSize = (loanAmount: number): number => {
  if (loanAmount > 500000) return 12;
  if (loanAmount > 250000) return 9;
  if (loanAmount > 100000) return 6;
  return 4;
};

// Extract state code from property address
const extractStateCode = (address: string): string | null => {
  // Look for 2-letter state code in address
  const stateCodeMatch = address.match(/\b([A-Z]{2})\b/);
  return stateCodeMatch ? stateCodeMatch[1] : null;
};

interface PropertyMapProps {
  loans: LoanData[];
}

const PropertyMap: React.FC<PropertyMapProps> = ({ loans }) => {
  // Group loans by state
  const loansByState: Record<string, LoanData[]> = {};
  
  loans.forEach(loan => {
    if (!loan.propertyAddress) return;
    
    const stateCode = extractStateCode(loan.propertyAddress);
    if (stateCode) {
      if (!loansByState[stateCode]) {
        loansByState[stateCode] = [];
      }
      loansByState[stateCode].push(loan);
    }
  });

  return (
    <svg 
      viewBox="0 0 1000 600" 
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    >
      {/* US Background */}
      <rect x="0" y="0" width="1000" height="600" fill="#f0f0f0" />
      
      {/* Render state markers */}
      {Object.entries(loansByState).map(([stateCode, stateLoanData]) => {
        // Get state coordinates
        const [lat, lng] = US_STATES_COORDINATES[stateCode] || [0, 0];
        
        // Calculate total loan amount for this state
        const totalLoanAmount = stateLoanData.reduce((sum, loan) => 
          sum + (loan.loanAmount || 0), 0);
        
        // Determine marker properties
        const markerColor = getMarkerColor(stateLoanData[0].propertyType || 'other');
        const markerSize = getMarkerSize(totalLoanAmount / stateLoanData.length);
        
        // Convert lat/lng to SVG coordinates
        const x = (lng + 130) * 7; // Adjust for US map projection
        const y = (50 - lat) * 10; // Invert latitude
        
        return (
          <g key={stateCode}>
            <circle
              cx={x}
              cy={y}
              r={markerSize}
              fill={markerColor}
              fillOpacity={0.7}
              stroke="#FFFFFF"
              strokeWidth={2}
            >
              <title>
                {stateCode}: {stateLoanData.length} loans
                (Total: ${totalLoanAmount.toLocaleString()})
              </title>
            </circle>
            <text
              x={x}
              y={y}
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
      
      {/* Optional: US Outline */}
      <path
        d="M100,100 L180,100 L210,150 L450,150 L510,180 L640,210 L750,200 L740,240 L640,270 L650,290 L640,380 L500,430 L300,410 L100,260 Z"
        fill="none"
        stroke="#999"
        strokeWidth="2"
      />
    </svg>
  );
};

export default PropertyMap;