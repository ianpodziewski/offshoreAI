"use client";

import React, { useState, useEffect } from 'react';
import { LoanData } from '@/utilities/loanGenerator';

// Import CSS directly at the top of the file
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet to prevent SSR issues
const importLeaflet = () => import('leaflet');
const importReactLeaflet = () => import('react-leaflet');

const LoanMap: React.FC<{ loans: LoanData[] }> = ({ loans }) => {
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [Popup, setPopup] = useState<any>(null);
  const [icon, setIcon] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure this only runs on the client
    setIsClient(true);

    // Dynamically import Leaflet and React Leaflet
    Promise.all([
      importLeaflet(),
      importReactLeaflet()
    ]).then(([L, ReactLeaflet]) => {
      // Create default icon
      const DefaultIcon = L.icon({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Set Leaflet components
      setMapContainer(() => ReactLeaflet.MapContainer);
      setTileLayer(() => ReactLeaflet.TileLayer);
      setMarker(() => ReactLeaflet.Marker);
      setPopup(() => ReactLeaflet.Popup);
      setIcon(() => DefaultIcon);
    }).catch(error => {
      console.error("Failed to load Leaflet:", error);
    });
  }, []);

  // Geocoding utility
  const geocodeAddress = (address: string): [number, number] | null => {
    const defaultCoordinates: Record<string, [number, number]> = {
      'CA': [36.7783, -119.4179],
      'TX': [31.1060, -97.6475],
      'NY': [40.7128, -74.0060],
      'FL': [27.6648, -81.5158],
      'IL': [40.0797, -89.4337]
    };

    const stateMatch = address.match(/,\s*([A-Z]{2})\b/);
    if (stateMatch) {
      const state = stateMatch[1];
      return defaultCoordinates[state] || null;
    }

    return null;
  };

  // Process markers
  const processMarkers = () => {
    return loans.reduce((acc, loan) => {
      if (!loan.propertyAddress) return acc;

      const coordinates = geocodeAddress(loan.propertyAddress);
      if (coordinates) {
        acc.push({ 
          coordinates, 
          loan, 
          color: loan.propertyType || 'other' 
        });
      }
      return acc;
    }, [] as { coordinates: [number, number]; loan: LoanData; color: string }[]);
  };

  // If not client-side or components not loaded, return null
  if (!isClient || !MapContainer || !TileLayer || !Marker || !Popup) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading map...
      </div>
    );
  }

  const mapMarkers = processMarkers();

  // If no markers, show a message
  if (mapMarkers.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        No geocodable loan locations found
      </div>
    );
  }

  return (
    <div className="h-full w-full">
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
            icon={icon}
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
    </div>
  );
};

export default LoanMap;