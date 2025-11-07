# Interactive Polygon Map Feature

## Overview
The Create New Project page now includes an interactive map with polygon plotting capabilities, allowing users to precisely define their project area boundaries using Google Earth satellite imagery.

## Features

### 1. **Interactive Map Editor**
- **Satellite View**: Uses Google satellite tiles for accurate terrain visualization
- **Street View**: Alternative OpenStreetMap view for reference
- **Toggle between views**: Easy switching between satellite and street maps

### 2. **Polygon Drawing**
- Click "Start Drawing" to begin plotting vertices
- Click on the map to add boundary points
- Visual feedback with blue markers and connecting lines
- Polygon automatically closes when 3+ vertices are plotted
- Real-time area calculation in hectares

### 3. **Map Controls**
- **Start Drawing**: Enable polygon plotting mode
- **Finish Drawing**: Complete the polygon and exit drawing mode
- **Undo**: Remove the last added vertex
- **Clear All**: Reset all vertices (with confirmation)
- **My Location**: Center map on user's current GPS location

### 4. **Auto-Calculations**
- **Area Calculation**: Automatically calculates polygon area in hectares using the Shoelace formula
- **Center Point**: GPS coordinates of the polygon center are auto-calculated
- **Vertex Count**: Displays the number of plotted points

### 5. **Data Integration**
- Polygon vertices are saved with the project data
- Center coordinates are stored as the project's primary GPS location
- All data is included in the project submission to the backend

## Usage

### For Users
1. Navigate to "Create New Project" page
2. Fill in Project Information (Step 1)
3. In the Location section (Step 2):
   - Click "Start Drawing" to begin
   - Click on the map to mark each corner/vertex of your project area
   - Use satellite view for accurate boundary identification
   - Click "Finish Drawing" when complete
4. Review the calculated area and center coordinates
5. Continue to Field Data and Review steps

### For Developers

#### Component Location
- Main Component: `/frontend/src/components/PolygonMapEditor.jsx`
- Integration: `/frontend/src/pages/FieldCapture.jsx` (Step 2)

#### Data Structure
```javascript
formData: {
  polygonVertices: [[lat1, lng1], [lat2, lng2], ...], // Array of [latitude, longitude] pairs
  gps: {
    latitude: "centerLat",  // Auto-calculated center point
    longitude: "centerLng", // Auto-calculated center point
    address: "user-entered address"
  }
}
```

#### API Integration
The polygon vertices are sent to the backend as:
```javascript
location: {
  lat: centerLatitude,
  lng: centerLongitude,
  address: projectAddress,
  polygon_vertices: [[lat1, lng1], [lat2, lng2], ...]
}
```

## Technical Details

### Dependencies
- `react-leaflet`: ^5.0.0 - React components for Leaflet maps
- `leaflet`: ^1.9.4 - Interactive map library
- Google Satellite Tiles - Accessed via third-party proxy

### Area Calculation Algorithm
Uses the Shoelace formula (also known as the Surveyor's formula):
1. Projects lat/lng coordinates to approximate meters
2. Applies the Shoelace formula to calculate polygon area
3. Converts result to hectares (1 hectare = 10,000 m²)

### Map Tiles
- **Satellite**: `https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}`
- **Streets**: OpenStreetMap tiles

## Benefits

1. **Accuracy**: Visual satellite imagery helps users accurately identify project boundaries
2. **Ease of Use**: Intuitive point-and-click interface
3. **Automation**: Automatic area and center point calculations reduce manual work
4. **Data Quality**: Precise polygon data improves field capture and verification
5. **Integration**: Seamlessly integrates with existing project creation workflow

## Future Enhancements

Potential improvements for future versions:
- Import/export polygon data (GeoJSON, KML)
- Edit existing vertices (drag-and-drop)
- Multiple polygon support for non-contiguous areas
- Distance measurement tools
- Coordinate system conversion
- Offline map tile caching
- Integration with device GPS for automatic boundary walking
- Polygon validation (self-intersection detection)

## Browser Compatibility
- Modern browsers with ES6+ support
- GPS/location services required for "My Location" feature
- Tested on Chrome, Firefox, Safari, and Edge

## Notes
- Requires active internet connection for map tiles
- Google satellite tiles accessed via third-party proxy
- Area calculations are approximate based on spherical Earth model
- GPS accuracy depends on device capabilities
