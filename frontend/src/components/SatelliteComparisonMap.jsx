import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.fullscreen';
import 'leaflet.fullscreen/Control.FullScreen.css';
import sentinelHubService from '../services/sentinelHub';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function SatelliteComparisonMap({ 
  coordinates, 
  polygon, 
  activeLayers = {},
  projectId = null,
  className = "" 
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const layersRef = useRef({});
  const polygonLayerRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [realImagery, setRealImagery] = useState(null);
  const [loadingImagery, setLoadingImagery] = useState(false);
  const [imageryError, setImageryError] = useState(null);

  // Default center coordinates (India coast)
  const defaultCenter = coordinates?.lng && coordinates?.lat 
    ? [coordinates.lat, coordinates.lng] 
    : [16.3, 81.8];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: true,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: 'topright'
      },
      layers: []
    });

    mapRef.current = map;

    // Listen for fullscreen changes
    map.on('enterFullscreen', () => setIsFullscreen(true));
    map.on('exitFullscreen', () => setIsFullscreen(false));

    // Add zoom control
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add scale control
    L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map);

    // Define tile layers - Multiple free satellite sources
    const tileLayers = {
      // Esri World Imagery (Free, no token needed) - Always visible base
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Esri, Maxar, Earthstar Geographics',
        maxZoom: 19
      }),

      // OpenStreetMap for reference
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
        opacity: 0
      }),

      // USGS Satellite (Free, no token)
      usgs: L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'USGS',
        maxZoom: 16,
        opacity: 0
      }),

      // Baseline layer - Using Esri World Imagery with green tint overlay
      baseline: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Baseline: Sentinel-2 (simulated)',
        maxZoom: 19,
        opacity: 0.5,
        className: 'baseline-layer'
      }),

      // Monitoring layer - Using slightly different satellite source for visual distinction
      monitoring: L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: 'Monitoring: Google Satellite (simulated as Sentinel-2)',
        maxZoom: 20,
        opacity: 0.5,
        className: 'monitoring-layer'
      })
    };

    // Add base satellite layer (always visible)
    tileLayers.satellite.addTo(map);
    
    // Add baseline and monitoring layers (controlled by toggles)
    tileLayers.baseline.addTo(map);
    tileLayers.monitoring.addTo(map);

    layersRef.current = tileLayers;

    // Add marker if coordinates provided
    if (coordinates?.lng && coordinates?.lat) {
      const marker = L.marker([coordinates.lat, coordinates.lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background: #0A6BFF; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map);
      
      markerRef.current = marker;
    }

    // Add polygon if provided
    if (polygon && polygon.length > 0) {
      const polygonCoords = polygon.map(point => [
        point.lat || point[1] || point.latitude,
        point.lng || point[0] || point.longitude
      ]).filter(coord => coord[0] && coord[1]);

      if (polygonCoords.length > 0) {
        const polygonLayer = L.polygon(polygonCoords, {
          color: '#0A6BFF',
          weight: 3,
          fillColor: '#0A6BFF',
          fillOpacity: 0.2
        }).addTo(map);

        polygonLayerRef.current = polygonLayer;

        // Fit bounds to polygon
        map.fitBounds(polygonLayer.getBounds(), { padding: [50, 50] });
      }
    }

    // Add NDVI overlay layer (simulated with green tint)
    const ndviLayer = L.tileLayer.wms('https://ows.mundialis.de/services/service?', {
      layers: 'TOPO-WMS',
      format: 'image/png',
      transparent: true,
      opacity: 0,
      attribution: 'NDVI (simulated)'
    });
    ndviLayer.addTo(map);
    layersRef.current.ndvi = ndviLayer;

    // Add change detection overlay
    const changeLayer = L.layerGroup();
    changeLayer.addTo(map);
    layersRef.current.delta = changeLayer;

    setMapLoaded(true);

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [coordinates, polygon]);

  // Load real Sentinel Hub imagery
  useEffect(() => {
    const loadRealImagery = async () => {
      if (!projectId || !polygon || polygon.length === 0) return;
      
      setLoadingImagery(true);
      setImageryError(null);
      
      try {
        const imageryData = await sentinelHubService.getProjectImagery(projectId);
        const processedData = sentinelHubService.processImageryData(imageryData);
        
        if (processedData) {
          setRealImagery(processedData);
          
          // Calculate bounds from polygon
          if (mapRef.current && polygonLayerRef.current) {
            const bounds = polygonLayerRef.current.getBounds();
            
            // Create image overlays for baseline RGB
            if (processedData.baseline.rgb) {
              const baselineRgbOverlay = L.imageOverlay(
                processedData.baseline.rgb,
                bounds,
                { opacity: 0, interactive: false }
              );
              baselineRgbOverlay.addTo(mapRef.current);
              layersRef.current.baseline_rgb = baselineRgbOverlay;
            }
            
            // Create image overlays for baseline NDVI
            if (processedData.baseline.ndvi) {
              const baselineNdviOverlay = L.imageOverlay(
                processedData.baseline.ndvi,
                bounds,
                { opacity: 0, interactive: false }
              );
              baselineNdviOverlay.addTo(mapRef.current);
              layersRef.current.baseline_ndvi = baselineNdviOverlay;
            }
            
            // Create image overlays for monitoring RGB
            if (processedData.monitoring.rgb) {
              const monitoringRgbOverlay = L.imageOverlay(
                processedData.monitoring.rgb,
                bounds,
                { opacity: 0, interactive: false }
              );
              monitoringRgbOverlay.addTo(mapRef.current);
              layersRef.current.monitoring_rgb = monitoringRgbOverlay;
            }
            
            // Create image overlays for monitoring NDVI
            if (processedData.monitoring.ndvi) {
              const monitoringNdviOverlay = L.imageOverlay(
                processedData.monitoring.ndvi,
                bounds,
                { opacity: 0, interactive: false }
              );
              monitoringNdviOverlay.addTo(mapRef.current);
              layersRef.current.monitoring_ndvi = monitoringNdviOverlay;
            }
          }
        }
      } catch (error) {
        console.error('Error loading Sentinel Hub imagery:', error);
        setImageryError(error.message || 'Failed to load satellite imagery');
      } finally {
        setLoadingImagery(false);
      }
    };
    
    loadRealImagery();
  }, [projectId, polygon, mapLoaded]);

  // Update layer visibility based on activeLayers prop
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !layersRef.current) return;

    const layers = layersRef.current;

    // Toggle baseline layer (use real imagery if available, fallback to simulated)
    if (activeLayers.baseline !== undefined) {
      const opacity = activeLayers.baseline.visible ? 0.7 : 0;
      
      // Prefer real Sentinel-2 RGB imagery
      if (layers.baseline_rgb && realImagery) {
        layers.baseline_rgb.setOpacity(opacity);
        // Hide simulated layer
        if (layers.baseline) layers.baseline.setOpacity(0);
      } else if (layers.baseline) {
        // Fallback to simulated
        layers.baseline.setOpacity(opacity);
      }
    }

    // Toggle monitoring layer (use real imagery if available, fallback to simulated)
    if (activeLayers.monitoring !== undefined) {
      const opacity = activeLayers.monitoring.visible ? 0.7 : 0;
      
      // Prefer real Sentinel-2 RGB imagery
      if (layers.monitoring_rgb && realImagery) {
        layers.monitoring_rgb.setOpacity(opacity);
        // Hide simulated layer
        if (layers.monitoring) layers.monitoring.setOpacity(0);
      } else if (layers.monitoring) {
        // Fallback to simulated
        layers.monitoring.setOpacity(opacity);
      }
    }

    // Toggle NDVI layer (use real if available)
    if (activeLayers.ndvi !== undefined) {
      const opacity = activeLayers.ndvi.visible ? 0.7 : 0;
      
      // Show either baseline or monitoring NDVI (prefer monitoring)
      if (realImagery && layers.monitoring_ndvi) {
        layers.monitoring_ndvi.setOpacity(opacity);
        if (layers.baseline_ndvi) layers.baseline_ndvi.setOpacity(0);
        if (layers.ndvi) layers.ndvi.setOpacity(0);
      } else if (realImagery && layers.baseline_ndvi) {
        layers.baseline_ndvi.setOpacity(opacity);
        if (layers.ndvi) layers.ndvi.setOpacity(0);
      } else if (layers.ndvi) {
        // Fallback to simulated
        layers.ndvi.setOpacity(opacity);
      }
    }
    if (activeLayers.ndvi !== undefined && layers.ndvi) {
      const opacity = activeLayers.ndvi.visible ? 0.6 : 0;
      layers.ndvi.setOpacity(opacity);
    }

    // Toggle delta/change layer - add visual indicators
    if (activeLayers.delta !== undefined && layers.delta) {
      layers.delta.clearLayers();
      
      if (activeLayers.delta.visible && polygon && polygon.length > 0) {
        // Add some random change detection markers for visualization
        const bounds = polygonLayerRef.current?.getBounds();
        if (bounds) {
          const centerLat = bounds.getCenter().lat;
          const centerLng = bounds.getCenter().lng;
          
          // Simulate vegetation gain areas
          const gainMarker = L.circle([centerLat + 0.002, centerLng + 0.002], {
            color: '#10B981',
            fillColor: '#10B981',
            fillOpacity: 0.5,
            radius: 100,
            weight: 2
          });
          layers.delta.addLayer(gainMarker);
          
          // Simulate stable area
          const stableMarker = L.circle([centerLat - 0.002, centerLng - 0.002], {
            color: '#F59E0B',
            fillColor: '#F59E0B',
            fillOpacity: 0.4,
            radius: 80,
            weight: 2
          });
          layers.delta.addLayer(stableMarker);
        }
      }
    }

  }, [activeLayers, mapLoaded, polygon]);

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
        // Invalidate map size after entering fullscreen
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 100);
      }).catch(err => {
        console.error('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        // Invalidate map size after exiting fullscreen
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        }, 100);
      });
    }
  };

  return (
    <div className={`relative h-full w-full ${className}`}>
      <div ref={mapContainerRef} className="h-full w-full rounded-lg" />
      
      {/* Fullscreen Toggle Button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-[1000] bg-white hover:bg-gray-50 border border-gray-300 rounded-lg p-2 shadow-lg transition-all duration-200 hover:shadow-xl"
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullscreen ? (
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        )}
      </button>
      
      {/* Layer info overlay */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs border border-gray-200">
        <div className="text-xs space-y-2">
          <div className="font-semibold text-[#0A0F1C] mb-3 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Active Layers
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-600 rounded shadow-sm"></div>
            <span className="text-[#475569] font-medium">Base: Satellite Imagery</span>
          </div>
          {activeLayers.baseline?.visible && (
            <div className="flex items-center gap-2 pl-1">
              <div className="w-3 h-3 rounded shadow-sm" style={{background: 'linear-gradient(135deg, #86efac 0%, #22c55e 100%)'}}></div>
              <span className="text-[#475569]">
                <span className="font-medium text-green-700">Baseline</span> ({activeLayers.baseline.date})
              </span>
            </div>
          )}
          {activeLayers.monitoring?.visible && (
            <div className="flex items-center gap-2 pl-1">
              <div className="w-3 h-3 rounded shadow-sm" style={{background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'}}></div>
              <span className="text-[#475569]">
                <span className="font-medium text-blue-700">Monitoring</span> ({activeLayers.monitoring.date})
              </span>
            </div>
          )}
          {activeLayers.delta?.visible && (
            <div className="flex items-center gap-2 pl-1">
              <div className="w-3 h-3 bg-gradient-to-r from-[#EF4444] via-[#F59E0B] to-[#10B981] rounded shadow-sm"></div>
              <span className="text-[#475569]">
                <span className="font-medium text-orange-700">Change Detection</span>
              </span>
            </div>
          )}
          {activeLayers.ndvi?.visible && (
            <div className="flex items-center gap-2 pl-1">
              <div className="w-3 h-3 bg-gradient-to-br from-[#84cc16] to-[#16a34a] rounded shadow-sm"></div>
              <span className="text-[#475569]">
                <span className="font-medium text-lime-700">NDVI Index</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 right-2 bg-white/95 rounded-lg px-3 py-2 text-xs shadow-md max-w-md border border-gray-200">
        {loadingImagery ? (
          <div className="flex items-center gap-2 text-blue-600">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="font-medium">Loading Sentinel-2 imagery...</span>
          </div>
        ) : imageryError ? (
          <div className="text-red-600">
            <div className="font-semibold flex items-center gap-1 mb-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Imagery Error
            </div>
            <div className="text-[10px]">{imageryError}</div>
            <div className="text-[10px] text-gray-600 mt-1">Using simulated data</div>
          </div>
        ) : realImagery ? (
          <div className="text-green-700">
            <div className="font-semibold flex items-center gap-1 mb-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Real Sentinel-2 Data
            </div>
            <div className="text-[10px] leading-relaxed text-gray-700">
              <div><strong>Baseline:</strong> {realImagery.baseline.dateRange}</div>
              <div><strong>Monitoring:</strong> {realImagery.monitoring.dateRange}</div>
              <div className="mt-1 pt-1 border-t border-gray-200 text-green-600">
                ✓ Actual satellite imagery from Sentinel Hub
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-700">
            <div className="font-semibold text-orange-600 mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Demo Mode
            </div>
            <div className="text-[10px] leading-relaxed">
              <div className="mb-1"><strong>Base:</strong> Real satellite imagery (Esri, Google)</div>
              <div className="text-orange-700"><strong>Baseline/Monitoring:</strong> Simulated temporal layers</div>
              <div className="mt-1 pt-1 border-t border-gray-200 text-gray-600">
                Add projectId prop to load real Sentinel-2 data
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
