import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LoanData } from '@/utilities/loanGenerator';

// Workaround for Leaflet icon issues in React
const DefaultIcon = L.icon({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Color mapping for different property types
const getMarkerColor = (propertyType: string): string => {
  const colorMap: Record<string, string> = {
    single_family: 'red',
    multi_family: 'blue',
    commercial: 'green',
    land: 'purple',
    industrial: 'orange',
  };
  
  return colorMap[propertyType] || 'gray';
};

// Custom icon creator
const createMarkerIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style='background-color:${color};' class='marker-pin'></div>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42]
  });
};

// Geocoding utility (basic implementation)
const geocodeAddress = (address: string): [number, number] | null => {
  // This is a very simplistic implementation
  // In a real-world scenario, you'd use a proper geocoding service
  const defaultCoordinates: Record<string, [number, number]> = {
    'CA': [36.7783, -119.4179],  // California center
    'TX': [31.1060, -97.6475],   // Texas center
    'NY': [40.7128, -74.0060],   // New York center
    'FL': [27.6648, -81.5158],   // Florida center
    'IL': [40.0797, -89.4337],   // Illinois center
  };

  // Extract state code
  const stateMatch = address.match(/,\s*([A-Z]{2})\b/);
  if (stateMatch) {
    const state = stateMatch[1];
    return defaultCoordinates[state] || null;
  }

  return null;
};

interface LoanMapProps {
  loans: LoanData[];
}

const LoanMap: React.FC<LoanMapProps> = ({ loans }) => {
  const [mapMarkers, setMapMarkers] = useState<{
    coordinates: [number, number];
    loan: LoanData;
    color: string;
  }[]>([]);

  useEffect(() => {
    // Process loans and extract geocoordinates
    const processedMarkers = loans.reduce((acc, loan) => {
      if (!loan.propertyAddress) return acc;

      const coordinates = geocodeAddress(loan.propertyAddress);
      if (coordinates) {
        const color = getMarkerColor(loan.propertyType || 'other');
        acc.push({ coordinates, loan, color });
      }
      return acc;
    }, [] as { coordinates: [number, number]; loan: LoanData; color: string }[]);

    setMapMarkers(processedMarkers);
  }, [loans]);

  // If no valid locations found
  if (mapMarkers.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No geocodable loan locations found
      </div>
    );
  }

  return (
    <MapContainer 
      center={[39.8283, -98.5795]} // US Center
      zoom={4} 
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {mapMarkers.map((marker, index) => (
        <Marker
          key={index}
          position={marker.coordinates}
          icon={createMarkerIcon(marker.color)}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{marker.loan.borrowerName}</h3>
              <p>Property Type: {marker.loan.propertyType}</p>
              <p>Loan Amount: ${marker.loan.loanAmount?.toLocaleString()}</p>
              <p>Address: {marker.loan.propertyAddress}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LoanMap;