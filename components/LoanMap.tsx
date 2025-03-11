"use client";

import React, { useState, useEffect } from "react";
import { LoanData } from "@/utilities/loanGenerator";
import "leaflet/dist/leaflet.css";

const importLeaflet = () => import("leaflet");
const importReactLeaflet = () => import("react-leaflet");

const LoanMap: React.FC<{ loans: LoanData[] }> = ({ loans }) => {
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [Popup, setPopup] = useState<any>(null);
  const [icon, setIcon] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    Promise.all([
      importLeaflet(),
      importReactLeaflet()
    ]).then(([L, ReactLeaflet]) => {
      const DefaultIcon = L.icon({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      setMapContainer(() => ReactLeaflet.MapContainer);
      setTileLayer(() => ReactLeaflet.TileLayer);
      setMarker(() => ReactLeaflet.Marker);
      setPopup(() => ReactLeaflet.Popup);
      setIcon(() => DefaultIcon);
    })
    .catch(error => console.error("Failed to load Leaflet:", error));
  }, []);

  const geocodeAddress = (address: string): [number, number] | null => {
    const defaultCoordinates: Record<string, [number, number]> = {
      CA: [36.7783, -119.4179],
      TX: [31.1060, -97.6475],
      NY: [40.7128, -74.0060],
      FL: [27.6648, -81.5158],
      IL: [40.0797, -89.4337]
    };

    const stateMatch = address.match(/,\s*([A-Z]{2})\b/);
    if (stateMatch) {
      return defaultCoordinates[stateMatch[1]] || null;
    }
    return null;
  };

  const processMarkers = () => {
    return loans.reduce((acc, loan) => {
      if (!loan.propertyAddress) return acc;
      const coordinates = geocodeAddress(loan.propertyAddress);
      if (coordinates) {
        acc.push({ coordinates, loan });
      }
      return acc;
    }, [] as { coordinates: [number, number]; loan: LoanData }[]);
  };

  if (!isClient || !MapContainer || !TileLayer || !Marker || !Popup) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading map...
      </div>
    );
  }

  const mapMarkers = processMarkers();
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
        center={[39.8283, -98.5795]}
        zoom={4}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        {/* Dark-themed tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          // <-- changed
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {mapMarkers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.coordinates}
            icon={icon}
          >
            <Popup>
              {/* Dark popup styling */}
              <div className="bg-gray-800 text-white p-2 rounded">
                <h3 className="font-bold">
                  {marker.loan.borrowerName}
                </h3>
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