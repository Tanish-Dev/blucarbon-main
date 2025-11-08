/**
 * Sentinel Satellite Data Integration Guide
 * 
 * This file provides integration methods for accessing real Sentinel-1 and Sentinel-2
 * satellite imagery for the DMRV Studio validation platform.
 */

/**
 * OPTION 1: Google Earth Engine (GEE)
 * Recommended for production use
 * Free tier available with registration
 */

// Example GEE API call for Sentinel-2
const getSentinel2ImageryGEE = async (coordinates, startDate, endDate) => {
  // Requires: @google/earthengine package
  // const ee = require('@google/earthengine');
  
  /*
  ee.Initialize();
  
  const point = ee.Geometry.Point([coordinates.lng, coordinates.lat]);
  const collection = ee.ImageCollection('COPERNICUS/S2_SR')
    .filterBounds(point)
    .filterDate(startDate, endDate)
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10));
  
  const image = collection.median();
  const mapId = image.getMapId({
    bands: ['B4', 'B3', 'B2'],
    min: 0,
    max: 3000
  });
  
  return mapId.urlFormat;
  */
  
  return 'https://earthengine.googleapis.com/v1alpha/{path}';
};

/**
 * OPTION 2: Sentinel Hub API
 * Paid service with excellent quality and reliability
 * URL: https://www.sentinel-hub.com/
 */

const getSentinel2ImageryHub = async (bbox, date, instanceId, layerId = 'TRUE-COLOR') => {
  const baseUrl = 'https://services.sentinel-hub.com/ogc/wms';
  
  const params = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetMap',
    LAYERS: layerId,
    BBOX: bbox.join(','),
    WIDTH: '512',
    HEIGHT: '512',
    FORMAT: 'image/jpeg',
    TIME: date,
    MAXCC: '20', // Max cloud coverage %
  });
  
  return `${baseUrl}/${instanceId}?${params.toString()}`;
};

/**
 * OPTION 3: NASA GIBS (Global Imagery Browse Services)
 * Free, no registration required
 * URL: https://earthdata.nasa.gov/eosdis/science-system-description/eosdis-components/gibs
 */

const getGIBSTileUrl = (layer = 'MODIS_Terra_CorrectedReflectance_TrueColor', date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layer}/default/${dateStr}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
};

/**
 * OPTION 4: Planet Labs API
 * High-resolution commercial imagery
 * Paid service
 */

const getPlanetImagery = async (coordinates, date, apiKey) => {
  const response = await fetch('https://api.planet.com/data/v1/quick-search', {
    method: 'POST',
    headers: {
      'Authorization': `api-key ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filter: {
        type: 'AndFilter',
        config: [
          {
            type: 'GeometryFilter',
            field_name: 'geometry',
            config: {
              type: 'Point',
              coordinates: [coordinates.lng, coordinates.lat]
            }
          },
          {
            type: 'DateRangeFilter',
            field_name: 'acquired',
            config: {
              gte: date,
              lte: date
            }
          }
        ]
      }
    })
  });
  
  return response.json();
};

/**
 * NDVI Calculation from Sentinel-2
 * Formula: NDVI = (NIR - RED) / (NIR + RED)
 * 
 * Sentinel-2 Bands:
 * - B4 (Red): 665 nm
 * - B8 (NIR): 842 nm
 */

const calculateNDVI = (redBand, nirBand) => {
  // This would be done server-side or using GEE
  // Example pseudocode:
  // const ndvi = (nirBand - redBand) / (nirBand + redBand);
  // return ndvi;
  
  return {
    formula: '(B8 - B4) / (B8 + B4)',
    bands: {
      red: 'B4',
      nir: 'B8'
    }
  };
};

/**
 * Change Detection Algorithm
 * Compares two time periods to detect vegetation changes
 */

const detectChanges = (baselineNDVI, monitoringNDVI, threshold = 0.1) => {
  // This would analyze pixel-by-pixel differences
  // Positive values indicate vegetation gain
  // Negative values indicate vegetation loss
  
  return {
    change: 'monitoringNDVI - baselineNDVI',
    threshold,
    interpretation: {
      gain: '> 0.1',
      loss: '< -0.1',
      stable: '-0.1 to 0.1'
    }
  };
};

/**
 * RECOMMENDED IMPLEMENTATION FOR PRODUCTION:
 * 
 * 1. Backend Integration (Python):
 *    - Use Google Earth Engine Python API
 *    - Process imagery server-side
 *    - Cache results in database
 *    - Serve processed tiles to frontend
 * 
 * 2. Example Backend Endpoint:
 *    POST /api/validation/projects/{project_id}/satellite-analysis
 *    {
 *      "baseline_date": "2023-01-15",
 *      "monitoring_date": "2024-01-15",
 *      "analysis_type": "ndvi_change"
 *    }
 * 
 * 3. Frontend Integration:
 *    - Receive tile URLs from backend
 *    - Display in Mapbox as raster layers
 *    - Toggle between different analysis layers
 */

// Example integration function for your backend
export const requestSatelliteAnalysis = async (projectId, analysisConfig) => {
  const response = await fetch(`/api/validation/projects/${projectId}/satellite-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    },
    body: JSON.stringify(analysisConfig)
  });
  
  return response.json();
};

// Example response structure:
/*
{
  "analysis_id": "abc123",
  "baseline_tile_url": "https://your-cdn.com/tiles/baseline/{z}/{x}/{y}.png",
  "monitoring_tile_url": "https://your-cdn.com/tiles/monitoring/{z}/{x}/{y}.png",
  "ndvi_tile_url": "https://your-cdn.com/tiles/ndvi/{z}/{x}/{y}.png",
  "change_detection": {
    "gain_hectares": 12.4,
    "loss_hectares": 1.2,
    "net_change": 11.2,
    "confidence": 0.85
  },
  "metadata": {
    "cloud_coverage": 2.3,
    "data_quality": "high",
    "processing_date": "2024-01-20T10:30:00Z"
  }
}
*/

/**
 * FREE TIER RESOURCES:
 * 
 * 1. Google Earth Engine:
 *    - Sign up: https://earthengine.google.com/signup/
 *    - Free for research and education
 *    - Generous quota for commercial use
 * 
 * 2. Copernicus Data Space:
 *    - https://dataspace.copernicus.eu/
 *    - Free access to Sentinel data
 *    - Registration required
 * 
 * 3. AWS Open Data:
 *    - https://registry.opendata.aws/sentinel-2/
 *    - Free Sentinel-2 data
 *    - You pay for AWS compute/storage
 */

// Mapbox token note
export const MAPBOX_SETUP = {
  note: "Get free Mapbox token at https://account.mapbox.com/",
  free_tier: "50,000 map loads per month",
  setup: "Add REACT_APP_MAPBOX_TOKEN to .env file"
};

export default {
  getSentinel2ImageryGEE,
  getSentinel2ImageryHub,
  getGIBSTileUrl,
  getPlanetImagery,
  calculateNDVI,
  detectChanges,
  requestSatelliteAnalysis,
  MAPBOX_SETUP
};
