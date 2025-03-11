import React from 'react';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Marker 
} from 'react-simple-maps';
import { LoanData } from '@/utilities/loanGenerator';

// GeoJSON for the US map
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Generate a pseudo-random coordinates based on property address
// In a real app, you would use a geocoding service
const generateCoordinates = (address: string, id: string): [number, number] => {
  // Simple hash function to generate deterministic but seemingly random values
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  };
  
  const addressHash = hashString(address + id);
  // Approximate bounds for continental US
  const lat = 30 + (addressHash % 1000) / 1000 * 15; // 30-45 degrees latitude
  const lng = -125 + (addressHash % 10000) / 10000 * 65; // -125 to -60 degrees longitude
  
  return [lng, lat];
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
  if (loanAmount > 500000) return 8;
  if (loanAmount > 250000) return 6;
  if (loanAmount > 100000) return 4;
  return 3;
};

interface PropertyMapProps {
  loans: LoanData[];
}

const PropertyMap: React.FC<PropertyMapProps> = ({ loans }) => {
  return (
    <ComposableMap
      projection="geoAlbersUsa"
      projectionConfig={{ scale: 1000 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Geographies geography={geoUrl}>
      {({ geographies }: { geographies: any[] }) => 
         geographies.map((geo: any) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="#EAEAEC"
              stroke="#D6D6DA"
              style={{
                default: { outline: "none" },
                hover: { outline: "none" },
                pressed: { outline: "none" },
              }}
            />
          ))
        }
      </Geographies>
      
      {loans.map((loan) => {
        if (!loan.propertyAddress) return null;
        
        const coordinates = generateCoordinates(loan.propertyAddress, loan.id);
        const markerColor = getMarkerColor(loan.propertyType || 'other');
        const markerSize = getMarkerSize(loan.loanAmount || 0);
        
        return (
          <Marker key={loan.id} coordinates={coordinates}>
            <circle 
              r={markerSize}
              fill={markerColor}
              stroke="#FFFFFF"
              strokeWidth={1}
              style={{ cursor: 'pointer' }}
            />
            <title>{loan.borrowerName}: ${loan.loanAmount?.toLocaleString()}</title>
          </Marker>
        );
      })}
    </ComposableMap>
  );
};

export default PropertyMap;