import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';
import { projectsAPI } from '../services/api';
import { Loader2, MapPin, TreeDeciduous, Waves } from 'lucide-react';

// Fix for default markers not showing in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different ecosystem types
const mangroveIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r="12" fill="#10b981" stroke="#065f46" stroke-width="2.5"/>
      <circle cx="15" cy="15" r="5" fill="#fff"/>
    </svg>
  `),
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

const seagrassIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r="12" fill="#0284c7" stroke="#075985" stroke-width="2.5"/>
      <circle cx="15" cy="15" r="5" fill="#fff"/>
    </svg>
  `),
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

const saltMarshIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30">
      <circle cx="15" cy="15" r="12" fill="#8b5cf6" stroke="#5b21b6" stroke-width="2.5"/>
      <circle cx="15" cy="15" r="5" fill="#fff"/>
    </svg>
  `),
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

const getIconForType = (ecosystemType) => {
  const type = (ecosystemType || '').toLowerCase();
  if (type.includes('mangrove')) return mangroveIcon;
  if (type.includes('seagrass')) return seagrassIcon;
  if (type.includes('salt') || type.includes('marsh')) return saltMarshIcon;
  return mangroveIcon; // default
};

// Extract coordinates from a project's location object
const getProjectCoords = (project) => {
  const loc = project.location;
  if (!loc) return null;

  // Direct coordinates
  if (loc.coordinates?.lat && loc.coordinates?.lng) {
    return [loc.coordinates.lat, loc.coordinates.lng];
  }
  if (loc.lat && loc.lng) {
    return [loc.lat, loc.lng];
  }
  if (loc.latitude && loc.longitude) {
    return [loc.latitude, loc.longitude];
  }

  // From polygon (compute centroid)
  if (loc.polygon && loc.polygon.length > 0) {
    const lats = loc.polygon.map(p => p.lat || p.latitude || p[1]).filter(Boolean);
    const lngs = loc.polygon.map(p => p.lng || p.longitude || p[0]).filter(Boolean);
    if (lats.length > 0 && lngs.length > 0) {
      const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      return [avgLat, avgLng];
    }
  }

  return null;
};

// Extract polygon coordinates from project
const getPolygonCoords = (project) => {
  const loc = project.location;
  if (!loc?.polygon || loc.polygon.length === 0) return null;

  return loc.polygon.map(point => [
    point.lat || point.latitude || point[1],
    point.lng || point.longitude || point[0]
  ]).filter(coord => coord[0] && coord[1]);
};

export default function ProjectMap() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const center = [15.0, 77.0]; // Center of India
  const zoom = 5;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsAPI.getAll();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects for map:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Filter projects that have valid coordinates
  const mappableProjects = projects.filter(p => getProjectCoords(p) !== null);

  // Compute dynamic center if we have projects
  const mapCenter = mappableProjects.length > 0
    ? [
      mappableProjects.reduce((sum, p) => sum + getProjectCoords(p)[0], 0) / mappableProjects.length,
      mappableProjects.reduce((sum, p) => sum + getProjectCoords(p)[1], 0) / mappableProjects.length
    ]
    : center;

  // Calculate total stats from real projects
  const totalArea = projects.reduce((sum, p) => sum + (p.area_hectares || 0), 0);
  const totalCredits = projects.reduce((sum, p) => sum + (p.metrics?.credits_issued || 0), 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-slate-900">
          Project Locations
        </h3>
        <div className="text-sm text-slate-600">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </span>
          ) : (
            `${mappableProjects.length} Project${mappableProjects.length !== 1 ? 's' : ''} on Map`
          )}
        </div>
      </div>

      <div className="h-64 rounded-xl overflow-hidden border border-slate-200">
        <MapContainer
          center={mapCenter}
          zoom={mappableProjects.length > 0 ? 6 : zoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mappableProjects.map((project) => {
            const coords = getProjectCoords(project);
            const polygonCoords = getPolygonCoords(project);

            return (
              <React.Fragment key={project.id}>
                <Marker
                  position={coords}
                  icon={getIconForType(project.ecosystem_type)}
                >
                  <Popup>
                    <div className="p-2 min-w-[220px]">
                      <h4 className="font-semibold text-slate-900 mb-2 text-base">
                        {project.title}
                      </h4>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Type:</span>
                          <span className="font-medium">{project.ecosystem_type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Area:</span>
                          <span className="font-medium">{project.area_hectares} ha</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Methodology:</span>
                          <span className="font-medium">{project.methodology}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${project.status === 'monitoring' ? 'bg-green-100 text-green-800' :
                              project.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                project.status === 'in_review' ? 'bg-blue-100 text-blue-800' :
                                  project.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                            }`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Vintage:</span>
                          <span className="font-medium">{project.vintage}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
                {polygonCoords && polygonCoords.length > 2 && (
                  <Polygon
                    positions={polygonCoords}
                    pathOptions={{
                      color: project.ecosystem_type?.toLowerCase().includes('mangrove') ? '#10b981' :
                        project.ecosystem_type?.toLowerCase().includes('seagrass') ? '#0284c7' : '#8b5cf6',
                      weight: 2,
                      fillOpacity: 0.15
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Show a message if no projects have coordinates */}
          {!loading && mappableProjects.length === 0 && projects.length > 0 && (
            <Marker position={center}>
              <Popup>
                <div className="p-2 text-sm text-slate-600">
                  Projects exist but none have GPS coordinates set.
                  Add locations in Field Capture.
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-sm text-slate-600">Mangrove</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-sky-600 rounded-full"></div>
          <span className="text-sm text-slate-600">Seagrass</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-violet-500 rounded-full"></div>
          <span className="text-sm text-slate-600">Salt Marsh</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{projects.length}</div>
          <div className="text-sm text-slate-600">Total Projects</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-900">{totalArea.toFixed(0)}</div>
          <div className="text-sm text-slate-600">Total Hectares</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{totalCredits.toFixed(1)}</div>
          <div className="text-sm text-slate-600">Credits Issued</div>
        </div>
      </div>
    </div>
  );
}
