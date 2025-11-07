import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';
import { Button } from './ui/button';
import { Trash2, Undo, Save, MapPin, Satellite, Map as MapIcon, Search, Loader2 } from 'lucide-react';

// Import marker images
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icon for vertices
const vertexIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0A6BFF" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="8"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Component to handle map clicks and add vertices
function MapClickHandler({ onAddVertex, isDrawing }) {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onAddVertex([e.latlng.lat, e.latlng.lng]);
      }
    },
  });
  return null;
}

// Component to update map view when center/zoom changes with smooth animation
function MapViewController({ center, zoom, animate = true }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      if (animate) {
        // Smooth animated transition
        map.flyTo(center, zoom, {
          duration: 1.5, // Animation duration in seconds
          easeLinearity: 0.25
        });
      } else {
        map.setView(center, zoom);
      }
    }
  }, [center, zoom, map, animate]);
  
  return null;
}

export default function PolygonMapEditor({ 
  vertices = [], 
  onVerticesChange, 
  initialCenter = [20.5937, 78.9629], // Center of India
  initialZoom = 5,
  height = '500px'
}) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [mapType, setMapType] = useState('satellite'); // 'satellite' or 'streets'
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(initialZoom);
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [shouldAnimate, setShouldAnimate] = useState(false);

  // Calculate area of polygon in hectares using Shoelace formula
  const calculateArea = (points) => {
    if (points.length < 3) return 0;
    
    // Convert lat/lng to approximate meters using simple projection
    const toMeters = (lat, lng) => {
      const R = 6371000; // Earth's radius in meters
      const latRad = lat * Math.PI / 180;
      const lngRad = lng * Math.PI / 180;
      const x = R * lngRad * Math.cos(latRad);
      const y = R * latRad;
      return [x, y];
    };
    
    const metersPoints = points.map(p => toMeters(p[0], p[1]));
    
    // Shoelace formula
    let area = 0;
    for (let i = 0; i < metersPoints.length; i++) {
      const j = (i + 1) % metersPoints.length;
      area += metersPoints[i][0] * metersPoints[j][1];
      area -= metersPoints[j][0] * metersPoints[i][1];
    }
    
    area = Math.abs(area) / 2;
    return (area / 10000).toFixed(2); // Convert to hectares
  };

  const handleAddVertex = (latlng) => {
    onVerticesChange([...vertices, latlng]);
  };

  const handleRemoveLastVertex = () => {
    if (vertices.length > 0) {
      onVerticesChange(vertices.slice(0, -1));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all vertices?')) {
      onVerticesChange([]);
      setIsDrawing(false);
    }
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
  };

  const handleFinishDrawing = () => {
    setIsDrawing(false);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = [position.coords.latitude, position.coords.longitude];
          setShouldAnimate(true); // Enable animation for current location
          setCenter(newCenter);
          setZoom(15);
          // Reset animation flag after a delay
          setTimeout(() => setShouldAnimate(false), 2000);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');

    try {
      // Using Nominatim (OpenStreetMap) geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const newCenter = [parseFloat(result.lat), parseFloat(result.lon)];
        setShouldAnimate(true); // Enable animation for search
        setCenter(newCenter);
        setZoom(15);
        setSearchError('');
        // Reset animation flag after a delay
        setTimeout(() => setShouldAnimate(false), 2000);
      } else {
        setSearchError('Location not found. Try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const area = calculateArea(vertices);

  // Google Satellite tiles URL (via third-party proxy)
  const satelliteTileUrl = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
  
  // Google Hybrid (satellite + labels) overlay
  const labelsOnlyTileUrl = 'https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}';
  
  // OpenStreetMap tiles URL
  const streetsTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className="space-y-4">
      {/* Location Search Bar */}
      <form onSubmit={handleSearchLocation} className="w-full">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-[#65728A]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location (e.g., 'Godavari Delta, India' or 'Mumbai')"
            className="w-full h-14 pl-12 pr-24 text-base border-2 border-[#E5EAF0] rounded-xl focus:border-[#0A6BFF] focus:ring-2 focus:ring-[#0A6BFF]/20 focus:outline-none transition-all"
            disabled={isSearching}
          />
          <Button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-2 top-2 h-10 px-4 bg-[#0A6BFF] hover:bg-[#0A6BFF]/90"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>
        {searchError && (
          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {searchError}
          </p>
        )}
      </form>

      {/* Controls - Redesigned */}
      <div className="bg-white border-2 border-[#E5EAF0] rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          {/* Left: Drawing Controls */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 p-1 bg-[#F7F8FA] rounded-lg">
              {!isDrawing ? (
                <Button 
                  onClick={handleStartDrawing}
                  className="bg-[#0A6BFF] hover:bg-[#0A6BFF]/90 shadow-sm h-10"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Start Drawing
                </Button>
              ) : (
                <Button 
                  onClick={handleFinishDrawing}
                  className="bg-green-600 hover:bg-green-700 shadow-sm h-10"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Finish Drawing
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                size="icon"
                onClick={handleRemoveLastVertex}
                disabled={vertices.length === 0}
                className="h-10 w-10 border-2 border-[#E5EAF0] hover:border-[#0A6BFF] hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo last vertex"
              >
                <Undo className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline"
                size="icon"
                onClick={handleClearAll}
                disabled={vertices.length === 0}
                className="h-10 w-10 border-2 border-[#E5EAF0] hover:border-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear all vertices"
              >
                <Trash2 className="w-4 h-4" />
              </Button>

              <div className="h-6 w-px bg-[#E5EAF0] mx-1"></div>

              <Button 
                variant="outline"
                onClick={handleUseCurrentLocation}
                className="h-10 border-2 border-[#E5EAF0] hover:border-[#0A6BFF] hover:bg-blue-50"
              >
                <MapPin className="w-4 h-4 mr-2" />
                My Location
              </Button>
            </div>
          </div>

          {/* Right: Map View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#65728A] hidden md:block">View:</span>
            <div className="flex items-center gap-1 p-1 bg-[#F7F8FA] rounded-lg border border-[#E5EAF0]">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setMapType('satellite')}
                className={`h-9 px-4 transition-all ${
                  mapType === 'satellite' 
                    ? 'bg-[#0A6BFF] text-white hover:bg-[#0A6BFF]/90 shadow-sm' 
                    : 'text-[#65728A] hover:text-[#0A0F1C] hover:bg-white'
                }`}
              >
                <Satellite className="w-4 h-4 mr-2" />
                Satellite
              </Button>
              
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setMapType('streets')}
                className={`h-9 px-4 transition-all ${
                  mapType === 'streets' 
                    ? 'bg-[#0A6BFF] text-white hover:bg-[#0A6BFF]/90 shadow-sm' 
                    : 'text-[#65728A] hover:text-[#0A0F1C] hover:bg-white'
                }`}
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Streets
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Bar - Redesigned */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Status Indicators */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-[#0A6BFF]"></div>
              <span className="text-sm font-semibold text-[#0A0F1C]">Vertices:</span>
              <span className="text-sm font-bold text-[#0A6BFF]">{vertices.length}</span>
            </div>
            
            {vertices.length >= 3 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-600"></div>
                <span className="text-sm font-semibold text-[#0A0F1C]">Area:</span>
                <span className="text-sm font-bold text-green-700">{area} ha</span>
              </div>
            )}
          </div>
          
          {/* Instructions */}
          <div className="flex-1 md:ml-auto">
            {isDrawing ? (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                <span className="font-medium text-green-700">
                  Drawing Mode Active
                </span>
                <span className="text-[#65728A] hidden md:inline">
                  • Click on map to add vertices
                </span>
              </div>
            ) : (
              <div className="text-sm text-[#65728A]">
                {vertices.length === 0 ? (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Click "Start Drawing" to plot your project area
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-green-600" />
                    Area plotted successfully • You can continue editing or proceed to next step
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div 
        style={{ height }} 
        className="rounded-xl overflow-hidden border-2 border-[#E5EAF0] shadow-lg"
      >
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <MapViewController center={center} zoom={zoom} animate={shouldAnimate} />
          
          {/* Base layer - Satellite or Street */}
          <TileLayer
            attribution={
              mapType === 'satellite' 
                ? '&copy; Google' 
                : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
            url={mapType === 'satellite' ? satelliteTileUrl : streetsTileUrl}
          />
          
          {/* Labels overlay for satellite view */}
          {mapType === 'satellite' && (
            <TileLayer
              url={labelsOnlyTileUrl}
              attribution='&copy; Google'
            />
          )}
          
          <MapClickHandler onAddVertex={handleAddVertex} isDrawing={isDrawing} />
          
          {/* Draw markers for each vertex */}
          {vertices.map((vertex, index) => (
            <Marker 
              key={index} 
              position={vertex} 
              icon={vertexIcon}
            />
          ))}
          
          {/* Draw polygon if we have at least 3 vertices */}
          {vertices.length >= 3 && (
            <Polygon 
              positions={vertices}
              pathOptions={{
                color: '#0A6BFF',
                fillColor: '#0A6BFF',
                fillOpacity: 0.3,
                weight: 3
              }}
            />
          )}
          
          {/* Draw line connecting vertices if we have 2 vertices */}
          {vertices.length === 2 && (
            <Polygon 
              positions={vertices}
              pathOptions={{
                color: '#0A6BFF',
                fillOpacity: 0,
                weight: 3,
                dashArray: '10, 10'
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Vertex List - Redesigned */}
      {vertices.length > 0 && (
        <div className="bg-white border-2 border-[#E5EAF0] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-[#0A0F1C] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#0A6BFF]"></div>
              Plotted Vertices
              <span className="text-xs font-normal text-[#65728A] ml-1">
                ({vertices.length} points)
              </span>
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear All
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar">
            {vertices.map((vertex, index) => (
              <div 
                key={index} 
                className="group relative flex items-center gap-2 text-sm bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0A6BFF] text-white text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#65728A] truncate font-mono">
                    {vertex[0].toFixed(6)}, {vertex[1].toFixed(6)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
