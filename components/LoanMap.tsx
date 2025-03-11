"use client";

import React, { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";

// We define the prop type to match your dynamic import in EnhancedDashboard
interface LoanMapProps {
  // For each state (e.g. "California"), we store a numeric value
  stateData: Record<string, number>;
}

// Lazily import Leaflet and react-leaflet
const importLeaflet = () => import("leaflet");
const importReactLeaflet = () => import("react-leaflet");

const LoanMap: React.FC<LoanMapProps> = ({ stateData }) => {
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [GeoJSON, setGeoJSON] = useState<any>(null);

  const [isClient, setIsClient] = useState(false);

  // Holds the GeoJSON data for US states
  const [usStatesData, setUsStatesData] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Load Leaflet & React-Leaflet modules
    Promise.all([importLeaflet(), importReactLeaflet()])
      .then(([L, RL]) => {
        setMapContainer(() => RL.MapContainer);
        setTileLayer(() => RL.TileLayer);
        setGeoJSON(() => RL.GeoJSON);
      })
      .catch((error) => console.error("Failed to load Leaflet:", error));
  }, []);

  // Fetch a US states GeoJSON file from /public/us-states.geojson
  // If you prefer localStorage or an API, adjust accordingly.
  useEffect(() => {
    fetch("/us-states.geojson")
      .then((res) => res.json())
      .then((data) => setUsStatesData(data))
      .catch((err) => console.error("Failed to load geojson:", err));
  }, []);

  // A color scale function for numeric values
  // Adjust thresholds & colors as needed
  const getColor = (value: number) => {
    return value > 1_000_000
      ? "#08306b"
      : value > 500_000
      ? "#08519c"
      : value > 200_000
      ? "#2171b5"
      : value > 100_000
      ? "#4292c6"
      : value > 50_000
      ? "#6baed6"
      : value > 20_000
      ? "#9ecae1"
      : value > 10_000
      ? "#c6dbef"
      : "#deebf7";
  };

  // Style callback for each state polygon
  const styleFeature = (feature: any) => {
    // For example, "California", "Texas", etc.
    const stateName = feature.properties?.name;
    // Pull the numeric value from your stateData
    const value = stateData[stateName] ?? 0;

    return {
      fillColor: getColor(value),
      fillOpacity: 0.7,
      color: "#222", // Outline color
      weight: 1,     // Outline thickness
      dashArray: "3" // Dotted outline
    };
  };

  // Attach a popup showing the state name & your numeric value
  const onEachFeature = (feature: any, layer: any) => {
    const stateName = feature.properties?.name || "Unknown";
    const value = stateData[stateName] ?? 0;

    layer.bindPopup(
      `<div style="color: #fff; background: #333; padding: 5px; border-radius: 3px;">
         <strong>${stateName}</strong><br/>
         Value: ${value.toLocaleString()}
       </div>`
    );
  };

  if (!isClient || !MapContainer || !TileLayer || !GeoJSON) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading map...
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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* The choropleth layer (only if usStatesData is loaded) */}
        {usStatesData && (
          <GeoJSON
            data={usStatesData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default LoanMap;