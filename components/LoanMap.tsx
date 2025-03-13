"use client";

import React, { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";

// Define props to accept the aggregated state data
interface LoanMapProps {
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
  const [usStatesData, setUsStatesData] = useState<any>(null);

  // Keep track of which state the user last hovered (or clicked).
  const [hoveredState, setHoveredState] = useState<{ name: string; value: number } | null>(null);
  // Debug state is now only used internally for logging
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    Promise.all([importLeaflet(), importReactLeaflet()])
      .then(([L, RL]) => {
        setMapContainer(() => RL.MapContainer);
        setTileLayer(() => RL.TileLayer);
        setGeoJSON(() => RL.GeoJSON);
      })
      .catch((error) => {
        console.error("Failed to load Leaflet:", error);
        setDebugInfo("Failed to load Leaflet: " + error.message);
      });
  }, []);

  // Fetch your US states GeoJSON from /public/us-states.geojson
  useEffect(() => {
    fetch("/us-states.geojson")
      .then((res) => res.json())
      .then((data) => {
        setUsStatesData(data);
        setDebugInfo("GeoJSON loaded successfully");
      })
      .catch((err) => {
        console.error("Failed to load geojson:", err);
        setDebugInfo("Failed to load GeoJSON: " + err.message);
      });
  }, []);

  // Log when stateData changes
  useEffect(() => {
    console.log("State data updated:", stateData);
    // Check if we have any data
    const stateCount = Object.keys(stateData).length;
    setDebugInfo(`State data loaded: ${stateCount} states with data`);
  }, [stateData]);

  // A basic color scale function
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
      // Add highlight on hover
      className: hoveredState?.name === stateName ? "state-hover" : "",
    };
  };

  // Use onEachFeature to handle pointer events
  const onEachFeature = (feature: any, layer: any) => {
    const stateName = feature.properties?.name || "Unknown";
    const value = stateData[stateName] ?? 0;

    // Show popup info on hover
    layer.on({
      mouseover: () => {
        console.log(`Hovering over ${stateName} with value ${value}`);
        setHoveredState({ name: stateName, value });
        // Add highlight to the layer
        layer.setStyle({
          weight: 3,
          color: "#666",
          dashArray: "",
          fillOpacity: 0.9
        });
      },
      mouseout: () => {
        setHoveredState(null);
        // Reset style
        layer.setStyle({
          weight: 1,
          color: "#222",
          dashArray: "3",
          fillOpacity: 0.7
        });
      },
      click: () => {
        // Keep the state highlighted on click
        setHoveredState({ name: stateName, value });
      },
    });
  };

  if (!isClient || !MapContainer || !TileLayer || !GeoJSON) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading map...
      </div>
    );
  }

  return (
    // "relative" ensures the absolute popup is positioned relative to this container
    <div className="h-full w-full relative flex justify-center items-center">
      <div className="h-full w-full">
        <MapContainer
          center={[39.8283, -98.5795]}
          zoom={4}
          scrollWheelZoom={false}
          className="h-full w-full"
          style={{ margin: '0 auto' }}
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
      </div>

      {/* Popup in the top-right corner with improved visibility */}
      {hoveredState && (
        <div className="absolute top-4 right-4 z-[9999] bg-gray-800 text-white p-4 rounded shadow-lg border border-gray-600">
          <div className="font-bold text-lg">{hoveredState.name}</div>
          <div className="mt-1">Value: ${hoveredState.value.toLocaleString()}</div>
        </div>
      )}
    </div>
  );
};

export default LoanMap;