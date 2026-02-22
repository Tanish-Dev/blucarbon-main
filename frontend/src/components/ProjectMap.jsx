import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';

// Fix for default markers not showing in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different project types
const mangroveIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25">
      <circle cx="12.5" cy="12.5" r="10" fill="#10b981" stroke="#065f46" stroke-width="2"/>
      <circle cx="12.5" cy="12.5" r="4" fill="#fff"/>
    </svg>
  `),
  iconSize: [25, 25],
  iconAnchor: [12.5, 12.5],
  popupAnchor: [0, -12.5],
});

const seagrassIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25">
      <circle cx="12.5" cy="12.5" r="10" fill="#059669" stroke="#064e3b" stroke-width="2"/>
      <circle cx="12.5" cy="12.5" r="4" fill="#fff"/>
    </svg>
  `),
  iconSize: [25, 25],
  iconAnchor: [12.5, 12.5],
  popupAnchor: [0, -12.5],
});

// Sample project data for Indian coastal areas
const activeProjects = [
  {
    id: 1,
    name: "Sundarbans Mangrove Restoration",
    type: "Mangrove",
    location: [21.9497, 88.2433], // Sundarbans, West Bengal
    carbonOffset: "1,250 tCO2/year",
    area: "45 hectares",
    status: "Active"
  },
  {
    id: 2,
    name: "Gulf of Mannar Seagrass Conservation",
    type: "Seagrass",
    location: [9.2647, 79.1350], // Gulf of Mannar, Tamil Nadu
    carbonOffset: "850 tCO2/year",
    area: "32 hectares",
    status: "Active"
  },
  {
    id: 3,
    name: "Kerala Backwaters Blue Carbon",
    type: "Mangrove",
    location: [9.4981, 76.3388], // Kerala Backwaters
    carbonOffset: "950 tCO2/year",
    area: "28 hectares",
    status: "Active"
  },
  {
    id: 4,
    name: "Chilika Lake Seagrass Project",
    type: "Seagrass",
    location: [19.7066, 85.3206], // Chilika Lake, Odisha
    carbonOffset: "720 tCO2/year",
    area: "38 hectares",
    status: "Active"
  }
];

export default function ProjectMap({ projects = [] }) {
  const center = [15.0, 77.0]; // Center of India
  const zoom = 6;

  // Use provided projects or fallback to active projects
  const displayProjects = projects.length > 0 ? projects : activeProjects;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', minHeight: '240px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {displayProjects.map((project) => {
        // Extract position from various location formats
        let position = null;
        const loc = project.location;
        if (Array.isArray(loc)) {
          position = loc; // [lat, lng] array
        } else if (loc && typeof loc === 'object') {
          const lat = loc.coordinates?.lat || loc.lat;
          const lng = loc.coordinates?.lng || loc.lng;
          if (lat && lng) position = [parseFloat(lat), parseFloat(lng)];
        }
        if (!position && project.latitude) {
          position = [project.latitude, project.longitude];
        }
        if (!position) return null;
        
        const projectType = project.ecosystem_type || project.type;
        
        return (
          <Marker
            key={project.id}
            position={position}
            icon={projectType === 'Mangrove' ? mangroveIcon : seagrassIcon}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h4 className="font-semibold text-slate-900 mb-2">
                  {project.title || project.name}
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Type:</span>
                    <span className="font-medium">{projectType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Area:</span>
                    <span className="font-medium">{project.area_hectares || project.area} hectares</span>
                  </div>
                  {project.carbonOffset && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Carbon Offset:</span>
                      <span className="font-medium text-green-600">{project.carbonOffset}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
