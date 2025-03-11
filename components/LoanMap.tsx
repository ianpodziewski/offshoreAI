"use client";

import React, { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";

// Define props to accept the aggregated state data
interface LoanMapProps {
  stateData: Record<string, number>;
}

// Lazy-load Leaflet and react-leaflet
const importLeaflet = () => import("leaflet");
const importReactLeaflet = () => import("react-leaflet");

const LoanMap: React.FC<LoanMapProps> = ({ stateData }) => {
  const [MapContainer, setMapContainer] = useState<any>(null);
  const [TileLayer, setTileLayer] = useState<any>(null);
  const [GeoJSON, setGeoJSON] = useState<any>(null);

  const [isClient, setIsClient] = useState(false);
  const [usStatesData, setUsStatesData] = useState<any>(null);

  // Store the currently “hovered” or “active” state to show in the corner popup
  const [hoveredState, setHoveredState] = useState<{
    name: string;
    value: number;
  } | null>(null);

  useEffect(() => {
    setIsClient(true);
    Promise.all([importLeaflet(), importReactLeaflet()])
      .then(([L, RL]) => {
        setMapContainer(() => RL.MapContainer);
        setTileLayer(() => RL.TileLayer);
        setGeoJSON(() => RL.GeoJSON);
      })
      .catch((error) => console.error("Failed to load Leaflet:", error));
  }, []);

  // Fetch your US states GeoJSON from /public/us-states.geojson
  useEffect(() => {
    fetch("/us-states.geojson")
      .then((res) => res.json())
      .then((data) => setUsStatesData(data))
      .catch((err) => console.error("Failed to load geojson:", err));
  }, []);

  // Color scale for your numeric values
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

  // Style callback for the choropleth
  const styleFeature = (feature: any) => {
    const stateName = feature.properties?.name || "Unknown";
    const value = stateData[stateName] ?? 0;
    return {
      fillColor: getColor(value),
      fillOpacity: 0.7,
      color: "#222",
      weight: 1,
      dashArray: "3",
    };
  };

  // Instead of `bindPopup()`, handle hover or click events to update `hoveredState`
  const onEachFeature = (feature: any, layer: any) => {
    const stateName = feature.properties?.name || "Unknown";
    const value = stateData[stateName] ?? 0;

    // If you want "hover" style:
    layer.on({
      mouseover: () => {
        setHoveredState({ name: stateName, value });
      },
      mouseout: () => {
        setHoveredState(null);
      },
    });

    // If you prefer click events, do something like:
    // layer.on("click", () => { setHoveredState({ name: stateName, value }); });
  };

  if (!isClient || !MapContainer || !TileLayer || !GeoJSON) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading map...
      </div>
    );
  }

  return (
    // Use relative positioning so we can position the info box absolutely
    <div className="h-full w-full relative">
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
        {usStatesData && (
          <GeoJSON
            data={usStatesData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>

      {/* A custom “popup” pinned in the top-right corner */}
      {hoveredState && (
        <div className="absolute top-2 right-2 bg-gray-800 text-white p-4 rounded shadow-lg z-10">
          <div className="font-bold text-lg">{hoveredState.name}</div>
          <div className="mt-1">Value: {hoveredState.value.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
};

export default LoanMap;