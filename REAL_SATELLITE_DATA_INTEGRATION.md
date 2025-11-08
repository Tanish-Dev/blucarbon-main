# Real Satellite Data Integration Guide

## Current Status ⚠️

**The current implementation uses SIMULATED temporal satellite data:**
- ✅ **Base Layer**: Real satellite imagery (Esri World Imagery, Google Satellite)
- ⚠️ **Baseline/Monitoring Layers**: Same tiles with CSS color filters to simulate different time periods
- ⚠️ **NDVI/Change Detection**: Calculated from simulated data, not actual satellite measurements

## Why Real Satellite Data is Needed

For production carbon credit validation, you need:
1. **Temporal Analysis**: Compare actual satellite images from different dates
2. **Spectral Bands**: Access to NIR, Red, Green bands for NDVI/SAVI calculations
3. **SAR Data**: Sentinel-1 for cloud-penetrating biomass estimation
4. **Multispectral**: Sentinel-2 for vegetation health and carbon sequestration

## Integration Options

### Option 1: Google Earth Engine (Recommended for Free Tier)

**Pros:**
- ✅ Free for non-commercial research/education
- ✅ Massive satellite data catalog (Landsat, Sentinel-1/2, MODIS)
- ✅ Server-side processing (no data download needed)
- ✅ Built-in NDVI, EVI, SAVI calculations

**Cons:**
- ❌ Requires approval (1-2 days)
- ❌ Python/JavaScript API learning curve
- ❌ Rate limits on free tier

**Implementation Steps:**

1. **Sign up for Earth Engine**: https://earthengine.google.com/signup/

2. **Install Earth Engine Python API**:
```bash
cd backend
pip install earthengine-api
```

3. **Authenticate**:
```bash
earthengine authenticate
```

4. **Create Backend Endpoint** (`backend/satellite_service.py`):
```python
import ee
from datetime import datetime, timedelta

# Initialize Earth Engine
ee.Initialize()

def get_sentinel2_imagery(polygon_coords, baseline_date, monitoring_date):
    """
    Fetch Sentinel-2 imagery for baseline and monitoring periods
    """
    # Convert polygon to Earth Engine geometry
    polygon = ee.Geometry.Polygon(polygon_coords)
    
    # Define date ranges (±30 days for cloud-free composites)
    baseline_start = (datetime.fromisoformat(baseline_date) - timedelta(days=30)).isoformat()
    baseline_end = (datetime.fromisoformat(baseline_date) + timedelta(days=30)).isoformat()
    
    monitoring_start = (datetime.fromisoformat(monitoring_date) - timedelta(days=30)).isoformat()
    monitoring_end = (datetime.fromisoformat(monitoring_date) + timedelta(days=30)).isoformat()
    
    # Fetch Sentinel-2 collections
    baseline_collection = (ee.ImageCollection('COPERNICUS/S2_SR')
        .filterBounds(polygon)
        .filterDate(baseline_start, baseline_end)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
        .median()  # Cloud-free composite
        .clip(polygon))
    
    monitoring_collection = (ee.ImageCollection('COPERNICUS/S2_SR')
        .filterBounds(polygon)
        .filterDate(monitoring_start, monitoring_end)
        .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
        .median()
        .clip(polygon))
    
    # Calculate NDVI
    def calculate_ndvi(image):
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
        return image.addBands(ndvi)
    
    baseline_ndvi = calculate_ndvi(baseline_collection)
    monitoring_ndvi = calculate_ndvi(monitoring_collection)
    
    # Get tile URLs for display
    baseline_url = baseline_ndvi.getMapId({
        'bands': ['B4', 'B3', 'B2'],
        'min': 0,
        'max': 3000
    })
    
    monitoring_url = monitoring_ndvi.getMapId({
        'bands': ['B4', 'B3', 'B2'],
        'min': 0,
        'max': 3000
    })
    
    ndvi_baseline_url = baseline_ndvi.getMapId({
        'bands': ['NDVI'],
        'min': 0,
        'max': 1,
        'palette': ['red', 'yellow', 'green']
    })
    
    ndvi_monitoring_url = monitoring_ndvi.getMapId({
        'bands': ['NDVI'],
        'min': 0,
        'max': 1,
        'palette': ['red', 'yellow', 'green']
    })
    
    # Calculate change statistics
    ndvi_change = monitoring_ndvi.select('NDVI').subtract(baseline_ndvi.select('NDVI'))
    stats = ndvi_change.reduceRegion(
        reducer=ee.Reducer.mean().combine(ee.Reducer.stdDev(), '', True),
        geometry=polygon,
        scale=10
    ).getInfo()
    
    return {
        'baseline_tile_url': baseline_url['tile_fetcher'].url_format,
        'monitoring_tile_url': monitoring_url['tile_fetcher'].url_format,
        'ndvi_baseline_url': ndvi_baseline_url['tile_fetcher'].url_format,
        'ndvi_monitoring_url': ndvi_monitoring_url['tile_fetcher'].url_format,
        'ndvi_change_mean': stats.get('NDVI_mean', 0),
        'ndvi_change_stddev': stats.get('NDVI_stdDev', 0)
    }

def get_sentinel1_sar(polygon_coords, baseline_date, monitoring_date):
    """
    Fetch Sentinel-1 SAR data for biomass estimation
    """
    polygon = ee.Geometry.Polygon(polygon_coords)
    
    baseline_start = (datetime.fromisoformat(baseline_date) - timedelta(days=30)).isoformat()
    baseline_end = (datetime.fromisoformat(baseline_date) + timedelta(days=30)).isoformat()
    
    # Sentinel-1 SAR
    sar_baseline = (ee.ImageCollection('COPERNICUS/S1_GRD')
        .filterBounds(polygon)
        .filterDate(baseline_start, baseline_end)
        .filter(ee.Filter.eq('instrumentMode', 'IW'))
        .select(['VV', 'VH'])
        .median()
        .clip(polygon))
    
    # Calculate VV/VH ratio (biomass proxy)
    vv_vh_ratio = sar_baseline.select('VV').divide(sar_baseline.select('VH')).rename('VV_VH_ratio')
    
    stats = vv_vh_ratio.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=polygon,
        scale=10
    ).getInfo()
    
    return {
        'biomass_proxy': stats.get('VV_VH_ratio', 0)
    }
```

5. **Add FastAPI Endpoint** (`backend/server.py`):
```python
from satellite_service import get_sentinel2_imagery, get_sentinel1_sar

@app.get("/api/satellite/imagery/{project_id}")
async def get_satellite_imagery(project_id: str):
    project = await db.projects.find_one({"_id": ObjectId(project_id)})
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    polygon_coords = [[coord['lng'], coord['lat']] for coord in project['location']['polygon']]
    
    sentinel2_data = get_sentinel2_imagery(
        polygon_coords,
        project.get('baseline_date', '2023-01-15'),
        project.get('monitoring_date', '2024-01-15')
    )
    
    sentinel1_data = get_sentinel1_sar(
        polygon_coords,
        project.get('baseline_date', '2023-01-15'),
        project.get('monitoring_date', '2024-01-15')
    )
    
    return {
        **sentinel2_data,
        **sentinel1_data
    }
```

6. **Update Frontend Map** (`frontend/src/components/SatelliteComparisonMap.jsx`):
```javascript
useEffect(() => {
  const loadRealSatelliteData = async () => {
    if (!selectedProjectId) return;
    
    const response = await fetch(`/api/satellite/imagery/${selectedProjectId}`);
    const data = await response.json();
    
    // Add real Sentinel-2 baseline layer
    const baselineLayer = L.tileLayer(data.baseline_tile_url, {
      attribution: 'Sentinel-2 (Google Earth Engine)',
      maxZoom: 13
    });
    
    // Add real Sentinel-2 monitoring layer
    const monitoringLayer = L.tileLayer(data.monitoring_tile_url, {
      attribution: 'Sentinel-2 (Google Earth Engine)',
      maxZoom: 13
    });
    
    // Add NDVI layers
    const ndviBaselineLayer = L.tileLayer(data.ndvi_baseline_url, {
      opacity: 0.7
    });
    
    const ndviMonitoringLayer = L.tileLayer(data.ndvi_monitoring_url, {
      opacity: 0.7
    });
    
    // Update layer references
    layersRef.current = {
      ...layersRef.current,
      baseline: baselineLayer,
      monitoring: monitoringLayer,
      ndvi_baseline: ndviBaselineLayer,
      ndvi_monitoring: ndviMonitoringLayer
    };
  };
  
  loadRealSatelliteData();
}, [selectedProjectId]);
```

---

### Option 2: Sentinel Hub (Paid but Powerful)

**Pricing:**
- Free trial: 10,000 requests
- Production: €0.01 - €0.04 per km²

**Pros:**
- ✅ Simple REST API
- ✅ Pre-processed data (ready to use)
- ✅ Custom scripts for indices
- ✅ High-resolution (10m)

**Implementation:**
```javascript
// Frontend fetch real Sentinel-2 data
const getSentinelHubImagery = async (bbox, date) => {
  const response = await fetch('https://services.sentinel-hub.com/ogc/wms/YOUR-INSTANCE-ID', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR-TOKEN'
    },
    body: JSON.stringify({
      bbox: bbox,
      time: `${date}/${date}`,
      layers: 'TRUE-COLOR',
      width: 512,
      height: 512,
      format: 'image/png'
    })
  });
  
  return response.blob();
};
```

---

### Option 3: NASA GIBS (Free, Global Coverage)

**Pros:**
- ✅ Completely free
- ✅ No API key required
- ✅ MODIS, VIIRS, Landsat data

**Cons:**
- ❌ Lower resolution (250m-1km)
- ❌ Limited to certain products
- ❌ No custom processing

**Implementation:**
```javascript
// Add NASA GIBS MODIS NDVI layer
const modisNDVI = L.tileLayer(
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/{time}/{tilematrixset}/{z}/{y}/{x}.png',
  {
    time: '2024-01-15', // Date
    tilematrixset: 'GoogleMapsCompatible_Level9',
    format: 'image/png',
    tileSize: 256
  }
);
```

---

## Recommended Implementation Path

### Phase 1: Proof of Concept (Current)
- ✅ Use simulated layers with filters
- ✅ Build UI/UX for layer toggling
- ✅ Implement validation workflow

### Phase 2: Real Data Integration (Next)
1. Apply for Google Earth Engine access (Free)
2. Implement backend Earth Engine service
3. Create `/api/satellite/imagery` endpoint
4. Update frontend to consume real tile URLs
5. Test with 1-2 projects

### Phase 3: Production Scale
1. Optimize Earth Engine queries (caching)
2. Add Sentinel-1 SAR for biomass
3. Implement time-series analysis
4. Calculate actual NDVI, SAVI, EVI
5. Generate PDF reports with real satellite screenshots

---

## Cost Comparison

| Service | Free Tier | Cost Beyond Free | Best For |
|---------|-----------|------------------|----------|
| Google Earth Engine | Yes (research) | Contact sales | Development, MVP |
| Sentinel Hub | 10k requests | €0.01-0.04/km² | Production |
| NASA GIBS | Unlimited | $0 | Low-res monitoring |
| Planet Labs | Trial | $$ | High-res commercial |

---

## Next Steps

1. **Apply for Google Earth Engine**: https://earthengine.google.com/signup/
2. **Test with sample project**: Use the code above to fetch Sentinel-2 data for one project
3. **Replace simulated layers**: Update `SatelliteComparisonMap.jsx` to use real tile URLs
4. **Validate calculations**: Compare simulated vs real NDVI/biomass values

---

## Questions?

Contact:
- Google Earth Engine Support: https://groups.google.com/g/google-earth-engine-developers
- Sentinel Hub Docs: https://docs.sentinel-hub.com/
