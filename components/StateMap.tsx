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

  // Improved state data with more accurate paths
  const states = [
    {
      code: "AL",
      name: "Alabama",
      path: "M550,350 L570,350 L585,380 L570,400 L550,390 L540,370 Z"
    },
    {
      code: "AK",
      name: "Alaska",
      path: "M120,450 L160,450 L160,480 L120,480 Z"
    },
    {
      code: "AZ",
      name: "Arizona",
      path: "M150,280 L190,280 L215,320 L215,350 L170,350 L150,320 Z"
    },
    {
      code: "AR",
      name: "Arkansas",
      path: "M470,310 L510,310 L510,350 L470,350 Z"
    },
    {
      code: "CA",
      name: "California",
      path: "M100,200 L130,200 L160,270 L140,320 L100,260 Z"
    },
    {
      code: "CO",
      name: "Colorado",
      path: "M250,250 L320,250 L320,300 L250,300 Z"
    },
    {
      code: "CT",
      name: "Connecticut",
      path: "M700,220 L715,220 L715,235 L700,235 Z"
    },
    {
      code: "DE",
      name: "Delaware",
      path: "M670,260 L675,260 L675,270 L670,270 Z"
    },
    {
      code: "FL",
      name: "Florida",
      path: "M570,380 L610,370 L640,380 L645,400 L610,430 L570,400 Z"
    },
    {
      code: "GA",
      name: "Georgia",
      path: "M580,340 L610,340 L620,380 L585,380 L570,360 Z"
    },
    {
      code: "HI",
      name: "Hawaii",
      path: "M180,450 L220,450 L220,480 L180,480 Z"
    },
    {
      code: "ID",
      name: "Idaho",
      path: "M150,150 L170,120 L210,150 L190,220 L160,180 Z"
    },
    {
      code: "IL",
      name: "Illinois",
      path: "M510,240 L520,220 L530,240 L530,290 L510,290 Z"
    },
    {
      code: "IN",
      name: "Indiana",
      path: "M530,240 L560,240 L560,290 L530,290 Z"
    },
    {
      code: "IA",
      name: "Iowa",
      path: "M450,220 L510,220 L510,240 L450,240 Z"
    },
    {
      code: "KS",
      name: "Kansas",
      path: "M360,280 L430,280 L430,310 L360,310 Z"
    },
    {
      code: "KY",
      name: "Kentucky",
      path: "M530,290 L600,280 L590,310 L530,310 Z"
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
      path: "M700,220 L730,220 L730,235 L700,235 Z"
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
      path: "M450,280 L510,280 L510,320 L450,320 Z"
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
      path: "M130,190 L160,180 L190,220 L175,270 L150,240 Z"
    },
    {
      code: "NH",
      name: "New Hampshire",
      path: "M715,190 L725,200 L725,220 L710,220 L710,210 Z"
    },
    {
      code: "NJ",
      name: "New Jersey",
      path: "M680,240 L690,250 L690,260 L675,270 L675,250 Z"
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
      path: "M560,240 L590,240 L600,280 L560,290 Z"
    },
    {
      code: "OK",
      name: "Oklahoma",
      path: "M360,310 L430,310 L470,320 L470,350 L360,350 Z"
    },
    {
      code: "OR",
      name: "Oregon",
      path: "M100,150 L180,150 L180,190 L130,190 Z"
    },
    {
      code: "PA",
      name: "Pennsylvania",
      path: "M590,240 L640,240 L640,270 L590,270 Z"
    },
    {
      code: "RI",
      name: "Rhode Island",
      path: "M715,230 L722,230 L722,238 L715,238 Z"
    },
    {
      code: "SC",
      name: "South Carolina",
      path: "M580,310 L620,320 L635,340 L610,340 L580,325 Z"
    },
    {
      code: "SD",
      name: "South Dakota",
      path: "M370,180 L430,180 L430,230 L370,230 Z"
    },
    {
      code: "TN",
      name: "Tennessee",
      path: "M500,310 L590,310 L590,330 L500,330 Z"
    },
    {
      code: "TX",
      name: "Texas",
      path: "M300,320 L370,320 L400,350 L420,380 L420,420 L350,440 L300,410 L290,370 Z"
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
      path: "M590,270 L640,270 L650,290 L590,300 Z"
    },
    {
      code: "WA",
      name: "Washington",
      path: "M120,100 L180,100 L180,150 L120,150 Z"
    },
    {
      code: "WV",
      name: "West Virginia",
      path: "M600,270 L640,270 L620,290 L590,280 Z"
    },
    {
      code: "WI",
      name: "Wisconsin",
      path: "M490,180 L520,180 L530,240 L490,230 Z"
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
        {/* Background */}
        <rect x="0" y="0" width="800" height="500" fill="#f9f9f9" />
        
        {/* Render each state */}
        {states.map((state) => (
          <g key={state.code}>
            <path
              d={state.path}
              fill={getStateColor(state.code)}
              stroke="#fff"
              strokeWidth="2"
              strokeLinejoin="round"
              style={{ 
                filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.1))",
                transition: "fill 0.3s ease"
              }}
            >
              <title>{state.name}: {loansByState[state.code] || 0} loan(s)</title>
            </path>
            <text
              x={state.code === "AK" ? 140 : state.code === "HI" ? 200 : parseInt(state.path.split(" ")[1]) + 15}
              y={state.code === "AK" ? 465 : state.code === "HI" ? 465 : parseInt(state.path.split(" ")[2]) + 15}
              fontSize="10"
              fontWeight="bold"
              fill="#333"
              textAnchor="middle"
              style={{ pointerEvents: "none" }}
            >
              {state.code}
            </text>
          </g>
        ))}
        
        {/* US outline */}
        <path
          d="M100,100 L180,100 L210,150 L450,150 L510,180 L640,210 L750,200 L740,240 L640,270 L650,290 L640,380 L500,430 L300,410 L100,260 Z"
          fill="none"
          stroke="#ddd"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: "none" }}
        />
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-3 rounded-md shadow-lg border border-gray-200">
        <p className="text-xs font-medium mb-2">Loans per state</p>
        <div className="flex flex-col space-y-1">
          {legendItems.map((item, index) => (
            <div key={index} className="flex items-center text-xs">
              <div 
                className="w-4 h-4 mr-2 rounded-sm border border-gray-300" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StateMap;