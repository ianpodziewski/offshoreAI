"use client";

import React, { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";

// Lazily import Leaflet and react-leaflet
const importLeaflet = () => import("leaflet");
const importReactLeaflet = () => import("react-leaflet");

const LoanMap: React.FC = () => {
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [GeoJSON, setGeoJSON] = useState<any>(null);

  const [isClient, setIsClient] = useState(false);

  // Sample data for a US states geojson file
  // If you have your own dataset, you can fetch it or store it in localStorage.
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

  // Example: fetch a US states GeoJSON file
  // (Replace this path or load from localStorage if desired.)
  useEffect(() => {
    fetch("/path/to/us-states.geojson")
      .then((res) => res.json())
      .then((data) => setUsStatesData(data))
      .catch((err) => console.error("Failed to load geojson:", err));
  }, []);

  // Choropleth color function - different shades of blue
  // Adjust thresholds & colors as needed
  const getColor = (value: number) => {
    return value > 1000
      ? "#08306b"
      : value > 500
      ? "#08519c"
      : value > 200
      ? "#2171b5"
      : value > 100
      ? "#4292c6"
      : value > 50
      ? "#6baed6"
      : value > 20
      ? "#9ecae1"
      : value > 10
      ? "#c6dbef"
      : "#deebf7";
  };

  // Leaflet style callback for each feature in the geojson
  // Suppose each state has a "density" property
  const styleFeature = (feature: any) => {
    const density = feature.properties?.density || 0;
    return {
      fillColor: getColor(density),
      fillOpacity: 0.7,
      color: "#222", // Outline color
      weight: 1,     // Outline thickness
      dashArray: "3" // Dotted outline
    };
  };

  // Optional: onEachFeature to bind popups or event handlers
  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties) {
      layer.bindPopup(
        `<div style="color: #fff; background: #333; padding: 5px; border-radius: 3px;">
           <strong>${feature.properties.name}</strong><br/>
           Density: ${feature.properties.density ?? "N/A"}
         </div>`
      );
    }
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
        {/* Dark-themed tile layer */}
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