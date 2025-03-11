import React from 'react';
import { LoanData } from '@/utilities/loanGenerator';

interface StateMapProps {
  loans: LoanData[];
}

const StateMap: React.FC<StateMapProps> = ({ loans }) => {
  // Count loans by state
  const loansByState: Record<string, number> = {};
  
  // Extract state from address and count loans
  loans.forEach(loan => {
    if (!loan.propertyAddress) return;
    
    // Try to extract state from address (assuming format ends with state code)
    // This is a simple approach - in a real app, you'd use proper address parsing
    const addressParts = loan.propertyAddress.split(',');
    const lastPart = addressParts[addressParts.length - 1]?.trim() || '';
    
    // Extract the state code (assumed to be 2 letters)
    // Looking for patterns like "NY" or "FL" in the address
    const stateMatch = lastPart.match(/([A-Z]{2})/);
    const state = stateMatch ? stateMatch[1] : 'Other';
    
    // Increment the count for this state
    loansByState[state] = (loansByState[state] || 0) + 1;
  });
  
  // Get color intensity based on loan count
  const getStateColor = (stateCode: string): string => {
    const count = loansByState[stateCode] || 0;
    
    if (count === 0) return "#f2f2f2"; // Light gray for no loans
    if (count === 1) return "#c6dbef"; // Light blue for one loan
    if (count === 2) return "#9ecae1"; // Lighter medium blue
    if (count <= 3) return "#6baed6"; // Medium blue
    if (count <= 5) return "#4292c6"; // Darker medium blue
    if (count <= 8) return "#2171b5"; // Dark blue
    return "#084594"; // Very dark blue for many loans
  };

  // Simplified state data
  // Each object has a state code, name, and SVG path
  const states = [
    {
      code: "AL",
      name: "Alabama",
      path: "M550,350 L560,350 L570,370 L550,390 L545,370 Z"
    },
    {
      code: "AK",
      name: "Alaska",
      path: "M120,450 L160,450 L160,480 L120,480 Z"
    },
    {
      code: "AZ",
      name: "Arizona",
      path: "M150,300 L170,300 L200,320 L200,350 L150,320 Z"
    },
    {
      code: "AR",
      name: "Arkansas",
      path: "M470,320 L500,320 L500,350 L470,350 Z"
    },
    {
      code: "CA",
      name: "California",
      path: "M100,200 L120,200 L150,280 L130,320 L100,260 Z"
    },
    {
      code: "CO",
      name: "Colorado",
      path: "M250,250 L300,250 L300,290 L250,290 Z"
    },
    {
      code: "CT",
      name: "Connecticut",
      path: "M700,230 L715,230 L715,240 L700,240 Z"
    },
    {
      code: "DE",
      name: "Delaware",
      path: "M670,260 L675,260 L675,270 L670,270 Z"
    },
    {
      code: "FL",
      name: "Florida",
      path: "M570,380 L600,370 L630,380 L635,400 L600,430 L570,400 Z"
    },
    {
      code: "GA",
      name: "Georgia",
      path: "M580,340 L610,340 L610,380 L580,380 L570,360 Z"
    },
    {
      code: "HI",
      name: "Hawaii",
      path: "M180,450 L220,450 L220,480 L180,480 Z"
    },
    {
      code: "ID",
      name: "Idaho",
      path: "M150,150 L160,120 L200,150 L180,220 L150,180 Z"
    },
    {
      code: "IL",
      name: "Illinois",
      path: "M500,240 L510,220 L520,240 L520,290 L500,290 Z"
    },
    {
      code: "IN",
      name: "Indiana",
      path: "M520,240 L550,240 L550,290 L520,290 Z"
    },
    {
      code: "IA",
      name: "Iowa",
      path: "M450,220 L510,220 L500,240 L450,240 Z"
    },
    {
      code: "KS",
      name: "Kansas",
      path: "M360,280 L430,280 L430,310 L360,310 Z"
    },
    {
      code: "KY",
      name: "Kentucky",
      path: "M520,290 L590,280 L580,310 L520,310 Z"
    },
    {
      code: "LA",
      name: "Louisiana",
      path: "M470,350 L490,350 L510,370 L510,390 L470,390 Z"
    },
    {
      code: "ME",
      name: "Maine",
      path: "M735,170 L745,180 L740,200 L720,200 L730,190 Z"
    },
    {
      code: "MD",
      name: "Maryland",
      path: "M640,260 L670,260 L670,270 L640,270 Z"
    },
    {
      code: "MA",
      name: "Massachusetts",
      path: "M700,220 L730,220 L730,230 L700,230 Z"
    },
    {
      code: "MI",
      name: "Michigan",
      path: "M510,180 L550,180 L540,220 L560,220 L550,240 L520,240 L510,220 Z"
    },
    {
      code: "MN",
      name: "Minnesota",
      path: "M450,170 L470,150 L510,180 L450,200 Z"
    },
    {
      code: "MS",
      name: "Mississippi",
      path: "M490,350 L510,350 L510,390 L500,410 L490,410 Z"
    },
    {
      code: "MO",
      name: "Missouri",
      path: "M450,280 L520,280 L520,320 L450,320 Z"
    },
    {
      code: "MT",
      name: "Montana",
      path: "M180,120 L270,130 L270,180 L180,180 Z"
    },
    {
      code: "NE",
      name: "Nebraska",
      path: "M350,240 L430,240 L450,260 L350,260 Z"
    },
    {
      code: "NV",
      name: "Nevada",
      path: "M130,190 L150,180 L180,220 L160,280 L140,240 Z"
    },
    {
      code: "NH",
      name: "New Hampshire",
      path: "M715,190 L725,200 L725,220 L710,220 L710,210 Z"
    },
    {
      code: "NJ",
      name: "New Jersey",
      path: "M680,240 L685,250 L685,260 L675,270 L675,250 Z"
    },
    {
      code: "NM",
      name: "New Mexico",
      path: "M230,300 L280,300 L280,350 L230,350 Z"
    },
    {
      code: "NY",
      name: "New York",
      path: "M640,220 L700,210 L710,220 L680,240 L640,240 Z"
    },
    {
      code: "NC",
      name: "North Carolina",
      path: "M580,300 L650,290 L650,310 L620,320 L580,310 Z"
    },
    {
      code: "ND",
      name: "North Dakota",
      path: "M370,150 L430,150 L430,180 L370,180 Z"
    },
    {
      code: "OH",
      name: "Ohio",
      path: "M550,240 L580,240 L590,280 L550,290 Z"
    },
    {
      code: "OK",
      name: "Oklahoma",
      path: "M360,310 L430,310 L470,320 L470,350 L360,350 Z"
    },
    {
      code: "OR",
      name: "Oregon",
      path: "M100,150 L180,150 L180,190 L120,190 Z"
    },
    {
      code: "PA",
      name: "Pennsylvania",
      path: "M580,240 L640,240 L640,270 L580,270 Z"
    },
    {
      code: "RI",
      name: "Rhode Island",
      path: "M715,230 L722,230 L722,238 L715,238 Z"
    },
    {
      code: "SC",
      name: "South Carolina",
      path: "M580,310 L620,320 L630,340 L610,340 L580,320 Z"
    },
    {
      code: "SD",
      name: "South Dakota",
      path: "M370,180 L430,180 L430,230 L370,230 Z"
    },
    {
      code: "TN",
      name: "Tennessee",
      path: "M490,310 L580,310 L580,330 L490,330 Z"
    },
    {
      code: "TX",
      name: "Texas",
      path: "M300,320 L370,320 L390,350 L410,380 L410,420 L350,440 L300,410 L290,370 Z"
    },
    {
      code: "UT",
      name: "Utah",
      path: "M180,220 L230,220 L230,280 L180,280 Z"
    },
    {
      code: "VT",
      name: "Vermont",
      path: "M690,200 L710,200 L710,220 L690,220 Z"
    },
    {
      code: "VA",
      name: "Virginia",
      path: "M580,270 L640,270 L650,290 L580,300 Z"
    },
    {
      code: "WA",
      name: "Washington",
      path: "M120,100 L180,100 L180,150 L100,150 Z"
    },
    {
      code: "WV",
      name: "West Virginia",
      path: "M590,270 L640,270 L620,290 L580,280 Z"
    },
    {
      code: "WI",
      name: "Wisconsin",
      path: "M480,180 L510,180 L520,240 L480,230 Z"
    },
    {
      code: "WY",
      name: "Wyoming",
      path: "M230,180 L300,180 L300,230 L230,230 Z"
    }
  ];

  // Legend data
  const legendItems = [
    { color: "#f2f2f2", label: "No loans" },
    { color: "#c6dbef", label: "1 loan" },
    { color: "#9ecae1", label: "2 loans" },
    { color: "#6baed6", label: "3 loans" },
    { color: "#4292c6", label: "4-5 loans" },
    { color: "#2171b5", label: "6-8 loans" },
    { color: "#084594", label: "9+ loans" }
  ];

  return (
    <div className="w-full h-full relative">
      <svg 
        viewBox="0 0 800 500" 
        className="w-full h-full"
        style={{ maxHeight: "100%" }}
      >
        {/* Render each state */}
        {states.map((state) => (
          <g key={state.code}>
            <path
              d={state.path}
              fill={getStateColor(state.code)}
              stroke="#fff"
              strokeWidth="1"
            >
              <title>{state.name}: {loansByState[state.code] || 0} loan(s)</title>
            </path>
            <text
              x={state.code === "AK" ? 140 : state.code === "HI" ? 200 : parseInt(state.path.split(" ")[1]) + 5}
              y={state.code === "AK" ? 465 : state.code === "HI" ? 465 : parseInt(state.path.split(" ")[2]) + 5}
              fontSize="8"
              fill="#333"
              textAnchor="middle"
            >
              {state.code}
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-80 p-2 rounded-md shadow-sm">
        <p className="text-xs font-medium mb-1">Loans per state</p>
        <div className="flex flex-col">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center text-xs">
              <div 
                className="w-3 h-3 mr-1" 
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StateMap;