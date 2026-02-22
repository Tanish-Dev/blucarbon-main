import React, { useState, useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';
import { Button } from './ui/button';
import { Trash2, Undo, Save, MapPin, Search } from 'lucide-react';

// Import marker images for the fix
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Global Leaflet fix for marker icons
if (typeof L !== 'undefined' && L.Icon && L.Icon.Default) {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
}

const vertexIcon = typeof L !== 'undefined' ? L.divIcon({
  className: 'custom-vertex-icon',
  html: `<div style="width: 12px; height: 12px; background-color: #0A6BFF; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
}) : null;

export default function PolygonMapEditor({ 
  vertices = [], 
  onVerticesChange, 
  initialCenter = [20.5937, 78.9629], 
  initialZoom = 5,
  height = '500px',
  center = null
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polygonRef = useRef(null);
  const polylineRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [mapType, setMapType] = useState('satellite');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current).setView(initialCenter, initialZoom);
    mapRef.current = map;

    // Add base layers
    const satellite = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      attribution: 'Google'
    });
    const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'OpenStreetMap'
    });
    const labels = L.tileLayer('https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}', {
      zIndex: 1000
    });

    map.satelliteLayer = satellite;
    map.streetsLayer = streets;
    map.labelsLayer = labels;

    if (mapType === 'satellite') {
      satellite.addTo(map);
      labels.addTo(map);
    } else {
      streets.addTo(map);
    }

    // Handle clicks
    map.on('click', (e) => {
      // Use a ref for isDrawing to avoid stale closure issues
      // But for simplicity in this version, we'll check it via state/prop if needed
    });

    return () => {
      map.remove();
    };
  }, []); // Run once

  // Center map when center prop changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !center) return;
    map.flyTo(center, 15);
  }, [center]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (mapType === 'satellite') {
      if (map.streetsLayer) map.streetsLayer.remove();
      if (map.satelliteLayer) map.satelliteLayer.addTo(map);
      if (map.labelsLayer) map.labelsLayer.addTo(map);
    } else {
      if (map.satelliteLayer) map.satelliteLayer.remove();
      if (map.labelsLayer) map.labelsLayer.remove();
      if (map.streetsLayer) map.streetsLayer.addTo(map);
    }
  }, [mapType]);

  // Handle vertex drawing clicks
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const onClick = (e) => {
      if (isDrawing) {
        onVerticesChange([...vertices, [e.latlng.lat, e.latlng.lng]]);
      }
    };

    map.on('click', onClick);
    return () => map.off('click', onClick);
  }, [isDrawing, onVerticesChange]);

  // Sync state with Leaflet objects (Markers, Polygons)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    vertices.forEach((v, i) => {
      const marker = L.marker(v, { icon: vertexIcon }).addTo(map);
      markersRef.current.push(marker);
    });

    // Update polygon
    if (polygonRef.current) polygonRef.current.remove();
    if (polylineRef.current) polylineRef.current.remove();

    if (vertices.length >= 3) {
      polygonRef.current = L.polygon(vertices, { color: '#0A6BFF' }).addTo(map);
    } else if (vertices.length === 2) {
      polylineRef.current = L.polyline(vertices, { color: '#0A6BFF', dashArray: '5,5' }).addTo(map);
    }
  }, [vertices]);

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        mapRef.current.flyTo([parseFloat(result.lat), parseFloat(result.lon)], 15);
      }
    } catch (e) {} finally { setIsSearching(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <form onSubmit={handleSearchLocation} className="flex-1 relative">
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 border rounded-lg"
            placeholder="Search location..."
          />
        </form>
        <Button onClick={() => setIsDrawing(!isDrawing)} variant={isDrawing ? "default" : "outline"}>
          {isDrawing ? "Finish Drawing" : "Start Drawing"}
        </Button>
        <Button variant="outline" onClick={() => onVerticesChange(vertices.slice(0, -1))} disabled={vertices.length === 0}>Undo</Button>
        <Button variant="outline" onClick={() => onVerticesChange([])} disabled={vertices.length === 0}>Clear</Button>
      </div>
      
      <div className="flex gap-2 justify-end">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          <Button variant={mapType === 'satellite' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMapType('satellite')}>Satellite</Button>
          <Button variant={mapType === 'streets' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMapType('streets')}>Streets</Button>
        </div>
      </div>

      <div ref={mapContainerRef} style={{ height }} className="rounded-xl border shadow-sm z-0" />
      
      {vertices.length >= 3 && (
        <div className="mt-2 text-sm font-medium text-blue-600">
          Selected Area: Defined by {vertices.length} points
        </div>
      )}
    </div>
  );
}
