import React from 'react';
import { LoanData } from '@/utilities/loanGenerator';

// Precise US map state coordinates
const US_STATES_COORDINATES: Record<string, [number, number]> = {
  AL: [-86.8287, 32.7794], WA: [-120.4472, 47.3826], AK: [-152.2782, 64.0685],
  AZ: [-111.6602, 34.2744], CA: [-119.4696, 37.1841], CO: [-105.5478, 38.9972],
  CT: [-72.7273, 41.6219], DE: [-75.5050, 38.9896], FL: [-82.4497, 28.6305],
  GA: [-83.4426, 32.6415], HI: [-156.3737, 20.2927], ID: [-114.6130, 44.3509],
  IL: [-89.1965, 40.0417], IN: [-86.2816, 39.8942], IA: [-93.4960, 42.0751],
  KS: [-98.3804, 38.4937], KY: [-85.3021, 37.5347], LA: [-91.9968, 31.0689],
  ME: [-69.2428, 45.3695], MD: [-76.4922, 38.9784], MA: [-71.8083, 42.2596],
  MI: [-85.4102, 44.3467], MN: [-94.3053, 46.2807], MS: [-89.6678, 32.7364],
  MO: [-92.4580, 38.3566], MT: [-109.6333, 47.0527], NE: [-99.7951, 41.5378],
  NV: [-116.6312, 39.3289], NH: [-71.5811, 43.6805], NJ: [-74.6728, 40.1907],
  NM: [-106.1126, 34.4071], NY: [-75.5268, 42.9538], NC: [-79.3877, 35.5557],
  ND: [-100.4659, 47.4501], OH: [-82.7937, 40.2862], OK: [-97.4943, 35.5889],
  OR: [-120.5583, 43.9336], PA: [-77.7996, 40.8781], RI: [-71.5562, 41.6762],
  SC: [-80.8964, 33.9169], SD: [-100.2263, 44.4443], TN: [-86.3505, 35.8580],
  TX: [-99.3312, 31.4757], UT: [-111.6703, 39.3055], VT: [-72.6658, 44.0687],
  VA: [-78.8537, 37.5215], WV: [-80.6227, 38.6409], WI: [-89.9941, 44.6243],
  WY: [-107.5512, 42.9957]
};

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
  if (loanAmount > 500000) return 12;
  if (loanAmount > 250000) return 9;
  if (loanAmount > 100000) return 6;
  return 4;
};

// State code extraction
const extractStateCode = (address: string): string | null => {
  const stateCodeMatch = address.match(/\b([A-Z]{2})\b/);
  return stateCodeMatch ? stateCodeMatch[1] : null;
};

// Map projection function
const projectCoordinates = (lon: number, lat: number) => {
  // Albers USA projection parameters
  const parallels = [29.5, 45.5];
  const originLon = -96;
  const originLat = 37.5;
  
  // Convert to radians
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const lon_rad = toRad(lon);
  const lat_rad = toRad(lat);
  const origin_lon = toRad(originLon);
  const origin_lat = toRad(originLat);
  const lat1 = toRad(parallels[0]);
  const lat2 = toRad(parallels[1]);
  
  // Projection calculations
  const n = 0.5 * (Math.sin(lat1) + Math.sin(lat2));
  const C = Math.cos(lat1) ** 2 + 2 * n * Math.sin(lat1);
  const rho = Math.sqrt(C - 2 * n * Math.sin(lat_rad)) / n;
  const theta = n * (lon_rad - origin_lon);
  
  // Scale and translate
  const x = 600 + rho * Math.sin(theta);
  const y = 300 - rho * Math.cos(theta);
  
  return [x, y];
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
      viewBox="0 0 800 500" 
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full"
    >
      {/* Background */}
      <rect x="0" y="0" width="800" height="500" fill="#f0f0f0" />
      
      {/* US Outline */}
      <path 
        d="M300,100 L500,100 L600,200 L700,250 L650,350 L500,400 L300,350 L200,250 Z" 
        fill="none" 
        stroke="#999" 
        strokeWidth="2" 
      />
      
      {/* Render state markers */}
      {Object.entries(loansByState).map(([stateCode, stateLoanData]) => {
        // Get state coordinates
        const [lon, lat] = US_STATES_COORDINATES[stateCode] || [0, 0];
        
        // Project coordinates
        const [x, y] = projectCoordinates(lon, lat);
        
        // Calculate total loan amount for this state
        const totalLoanAmount = stateLoanData.reduce((sum, loan) => 
          sum + (loan.loanAmount || 0), 0);
        
        // Determine marker properties
        const markerColor = getMarkerColor(stateLoanData[0].propertyType || 'other');
        const markerSize = getMarkerSize(totalLoanAmount / stateLoanData.length);
        
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
    </svg>
  );
};

export default PropertyMap;