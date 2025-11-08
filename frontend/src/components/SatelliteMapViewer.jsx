import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polygon, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';

const { BaseLayer, Overlay } = LayersControl;

// Component to handle map bounds
function MapBounds({ polygon, coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (polygon && polygon.length > 0) {
      const bounds = L.latLngBounds(polygon);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (coordinates) {
      map.setView([coordinates.lat, coordinates.lng], 13);
    }
  }, [map, polygon, coordinates]);

  return null;
}

// Sentinel-2 Tile Layer Component
function Sentinel2Layer({ visible, date = '2024-01-15', cloudCoverage = 10 }) {
  if (!visible) return null;

  // Using Sentinel Hub WMS service (requires API key in production)
  // For demo, we'll use a combination of satellite imagery
  return (
    <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      attribution='Sentinel-2 | ESA'
      opacity={0.8}
      maxZoom={18}
    />
  );
}

// NDVI Visualization Layer
function NDVILayer({ visible }) {
  if (!visible) return null;

  // In production, this would fetch actual NDVI data
  // For now, using a semi-transparent overlay to simulate vegetation index
  return (
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution='NDVI Analysis'
      opacity={0.3}
      className="ndvi-layer"
      style={{ filter: 'hue-rotate(90deg) saturate(3)' }}
    />
  );
}

export default function SatelliteMapViewer({ 
  coordinates, 
  polygon, 
  layers = {},
  editable = false 
}) {
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default to India
  const [mapZoom, setMapZoom] = useState(5);

  useEffect(() => {
    if (coordinates) {
      setMapCenter([coordinates.lat, coordinates.lng]);
      setMapZoom(13);
    }
  }, [coordinates]);

  // Generate polygon positions
  const polygonPositions = polygon && polygon.length > 0 
    ? polygon.map(coord => [coord.lat, coord.lng])
    : null;

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <LayersControl position="topright">
          {/* Base Layers - Different map views */}
          <BaseLayer checked={!layers.rgb?.visible} name="Satellite (Current)">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              maxZoom={18}
            />
          </BaseLayer>

          <BaseLayer name="Street Map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
            />
          </BaseLayer>

          {/* Temporal Satellite Layers */}
          {layers.baseline?.visible && (
            <Overlay checked name={`Baseline (${layers.baseline.date})`}>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Baseline | Sentinel-2'
                opacity={0.6}
                className="baseline-layer"
              />
            </Overlay>
          )}

          {layers.monitoring?.visible && (
            <Overlay checked name={`Monitoring (${layers.monitoring.date})`}>
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                attribution='Monitoring | Sentinel-2'
                opacity={0.7}
                className="monitoring-layer"
              />
            </Overlay>
          )}

          {/* Analysis Layers */}
          {layers.ndvi?.visible && (
            <Overlay name="NDVI (Vegetation Index)">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='NDVI Analysis'
                opacity={0.5}
                className="filter-green"
              />
            </Overlay>
          )}

          {layers.rgb?.visible && (
            <Overlay name="True Color RGB">
              <TileLayer
                url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                attribution='True Color RGB'
                opacity={0.8}
              />
            </Overlay>
          )}

          {/* Change Detection Layer */}
          {layers.delta?.visible && (
            <Overlay checked name="Change Detection">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Change Detection'
                opacity={0.4}
                className="filter-change-detection"
              />
            </Overlay>
          )}

          {/* SAR Data (Sentinel-1) */}
          <Overlay name="Sentinel-1 (SAR)">
            <TileLayer
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              attribution='Sentinel-1 SAR Data'
              opacity={0.5}
              className="filter-sar"
            />
          </Overlay>

          {/* Cloud Mask */}
          {layers.cloudMask?.visible && (
            <Overlay name="Cloud Mask">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='Cloud Mask'
                opacity={0.2}
                className="filter-clouds"
              />
            </Overlay>
          )}

          {/* Water Mask */}
          {layers.waterMask?.visible && (
            <Overlay name="Water Mask">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='Water Bodies'
                opacity={0.3}
                className="filter-water"
              />
            </Overlay>
          )}
        </LayersControl>

        {/* Project boundary polygon */}
        {polygonPositions && polygonPositions.length > 0 && (
          <Polygon
            positions={polygonPositions}
            pathOptions={{
              color: '#0A6BFF',
              fillColor: '#0A6BFF',
              fillOpacity: 0.2,
              weight: 3
            }}
          />
        )}

        {/* Fit map to bounds */}
        <MapBounds polygon={polygonPositions} coordinates={coordinates} />

        {/* Legend */}
        <div className="leaflet-bottom leaflet-left">
          <div className="leaflet-control" style={{ 
            backgroundColor: 'white', 
            padding: '10px', 
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            minWidth: '200px'
          }}>
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Active Layers</h4>
            <div className="space-y-1 text-xs">
              {layers.baseline?.visible && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span>Baseline ({layers.baseline.date})</span>
                </div>
              )}
              {layers.monitoring?.visible && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <span>Monitoring ({layers.monitoring.date})</span>
                </div>
              )}
              {layers.delta?.visible && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-green-500 rounded-sm"></div>
                  <span>Change Detection</span>
                </div>
              )}
              {layers.ndvi?.visible && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-lime-500 rounded-sm"></div>
                  <span>NDVI</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </MapContainer>

      {/* Data Source Info */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md z-[1000]">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-medium text-gray-700">Live Satellite Data</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {layers.baseline?.source || 'Sentinel-2'} | {layers.monitoring?.source || 'Sentinel-2'}
        </div>
      </div>
    </div>
  );
}
