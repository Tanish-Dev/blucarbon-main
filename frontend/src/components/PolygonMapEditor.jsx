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

// Component to update map view when center/zoom changes
function MapViewController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
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
          setCenter(newCenter);
          setZoom(15);
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
        setCenter(newCenter);
        setZoom(15);
        setSearchError('');
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

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-[#F7F8FA] p-4 rounded-xl border border-[#E5EAF0]">
        <div className="flex flex-wrap gap-2">
          {!isDrawing ? (
            <Button 
              onClick={handleStartDrawing}
              className="bg-[#0A6BFF] hover:bg-[#0A6BFF]/90"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Start Drawing
            </Button>
          ) : (
            <Button 
              onClick={handleFinishDrawing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Finish Drawing
            </Button>
          )}
          
          <Button 
            variant="outline"
            onClick={handleRemoveLastVertex}
            disabled={vertices.length === 0}
            className="border-[#E5EAF0]"
          >
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleClearAll}
            disabled={vertices.length === 0}
            className="border-[#E5EAF0] hover:border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>

          <Button 
            variant="outline"
            onClick={handleUseCurrentLocation}
            className="border-[#E5EAF0]"
          >
            <MapPin className="w-4 h-4 mr-2" />
            My Location
          </Button>
        </div>

        <div className="flex gap-2">
          <Button 
            variant={mapType === 'satellite' ? 'default' : 'outline'}
            onClick={() => setMapType('satellite')}
            className={mapType === 'satellite' ? 'bg-[#0A6BFF]' : 'border-[#E5EAF0]'}
          >
            <Satellite className="w-4 h-4 mr-2" />
            Satellite
          </Button>
          
          <Button 
            variant={mapType === 'streets' ? 'default' : 'outline'}
            onClick={() => setMapType('streets')}
            className={mapType === 'streets' ? 'bg-[#0A6BFF]' : 'border-[#E5EAF0]'}
          >
            <MapIcon className="w-4 h-4 mr-2" />
            Streets
          </Button>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#0A0F1C]">Vertices:</span>
          <span className="text-sm text-[#65728A]">{vertices.length}</span>
        </div>
        
        {vertices.length >= 3 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#0A0F1C]">Area:</span>
            <span className="text-sm text-[#65728A]">{area} hectares</span>
          </div>
        )}
        
        <div className="text-sm text-[#65728A] ml-auto">
          {isDrawing ? (
            <span className="text-green-600 font-medium">
              Click on map to add vertices • Click "Finish Drawing" when done
            </span>
          ) : (
            <span>
              Click "Start Drawing" to plot your area
            </span>
          )}
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
          <MapViewController center={center} zoom={zoom} />
          
          <TileLayer
            attribution={
              mapType === 'satellite' 
                ? '&copy; Google' 
                : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
            url={mapType === 'satellite' ? satelliteTileUrl : streetsTileUrl}
          />
          
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

      {/* Vertex List */}
      {vertices.length > 0 && (
        <div className="bg-[#F7F8FA] rounded-xl p-4 border border-[#E5EAF0]">
          <h4 className="font-semibold text-[#0A0F1C] mb-3">Plotted Vertices</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
            {vertices.map((vertex, index) => (
              <div key={index} className="text-sm bg-white p-2 rounded border border-[#E5EAF0]">
                <span className="font-medium text-[#0A6BFF]">Point {index + 1}:</span>{' '}
                <span className="text-[#65728A]">
                  {vertex[0].toFixed(6)}, {vertex[1].toFixed(6)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
