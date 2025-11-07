# Data Storage Information - Polygon Vertices & Coordinates

## Overview
This document explains how the polygon vertices and location data from the interactive map are stored in MongoDB.

## Data Flow

```
User draws polygon on map
       ↓
Frontend (FieldCapture.jsx)
       ↓
API Request (projectsAPI.create)
       ↓
Backend (server.py - /api/projects endpoint)
       ↓
MongoDB (projects collection)
```

## Data Structure

### Frontend State (`formData`)
```javascript
{
  polygonVertices: [
    [lat1, lng1],  // Array of coordinate pairs
    [lat2, lng2],
    [lat3, lng3],
    // ... more vertices
  ],
  gps: {
    latitude: "centerLat",   // Auto-calculated center point
    longitude: "centerLng",  // Auto-calculated center point
    accuracy: 0              // Removed from submission
  }
}
```

### API Request Payload
```javascript
{
  title: "Project Name",
  description: "Project description",
  methodology: "VM0033",
  ecosystem_type: "Mangrove",
  vintage: "2024",
  area_hectares: 150.5,
  location: {
    lat: 16.7644,              // Center point latitude
    lng: 81.6375,              // Center point longitude
    polygon_vertices: [         // All plotted vertices
      [16.7650, 81.6370],
      [16.7640, 81.6380],
      [16.7630, 81.6375],
      [16.7645, 81.6365]
    ]
  },
  field_data: {
    species: "Avicennia marina",
    canopy_cover: 65,
    soil_type: "Clay",
    notes: "Field notes...",
    measurements: "...",
    photos_count: 3
  }
}
```

### MongoDB Document Structure
```json
{
  "_id": ObjectId("..."),
  "id": "uuid-generated-project-id",
  "title": "Project Name",
  "description": "Project description",
  "methodology": "VM0033",
  "ecosystem_type": "Mangrove",
  "vintage": "2024",
  "area_hectares": 150.5,
  "location": {
    "lat": 16.7644,
    "lng": 81.6375,
    "polygon_vertices": [
      [16.7650, 81.6370],
      [16.7640, 81.6380],
      [16.7630, 81.6375],
      [16.7645, 81.6365]
    ]
  },
  "status": "draft",
  "owner_id": "user-uuid",
  "validator_id": null,
  "metrics": {
    "hectares_monitored": 0,
    "credits_issued": 0,
    "credits_retired": 0,
    "field_data_collected": 0
  },
  "blockchain_hash": null,
  "created_at": "2025-11-07T...",
  "updated_at": "2025-11-07T..."
}
```

## Backend Model (Pydantic)

### Project Model
```python
class Project(BaseModel):
    id: str
    title: str
    description: str
    methodology: str
    ecosystem_type: str
    location: Dict[str, Any]  # Stores lat, lng, and polygon_vertices
    area_hectares: float
    status: ProjectStatus
    vintage: str
    owner_id: str
    validator_id: Optional[str]
    metrics: ProjectMetrics
    blockchain_hash: Optional[str]
    created_at: datetime
    updated_at: datetime
```

The `location` field is typed as `Dict[str, Any]`, which means it can store:
- `lat` (float): Center latitude
- `lng` (float): Center longitude  
- `polygon_vertices` (list): Array of [lat, lng] pairs

## Database Storage Confirmation

✅ **YES, the polygon vertices ARE stored in MongoDB!**

### How It Works:

1. **Frontend**: Collects polygon vertices in `formData.polygonVertices`
2. **API Call**: Sends vertices in `location.polygon_vertices`
3. **Backend**: Receives data via `ProjectCreate` model
4. **Storage**: MongoDB stores the entire `location` object including `polygon_vertices`

The backend uses:
```python
await db.projects.insert_one(project.dict())
```

This converts the entire Pydantic model (including the `location` dictionary with all its nested data) to a dictionary and stores it in MongoDB.

## Retrieving the Data

When fetching projects:
```python
@api_router.get("/projects/{project_id}")
async def get_project(project_id: str):
    project_dict = await db.projects.find_one({"id": project_id})
    return Project(**project_dict)
```

The `polygon_vertices` will be available in the response at:
```javascript
project.location.polygon_vertices
```

## Fields Removed

The following fields were removed from the UI and data submission:
- ❌ **Project Address** - Removed from Location section
- ❌ **GPS Accuracy Slider** - Removed from Location section
- ❌ **GPS Accuracy Display** - Removed from Review section

## Summary

| Field | Frontend Storage | Backend Storage | MongoDB Storage |
|-------|------------------|-----------------|-----------------|
| Polygon Vertices | `formData.polygonVertices` | `project.location.polygon_vertices` | `location.polygon_vertices` |
| Center Latitude | `formData.gps.latitude` | `project.location.lat` | `location.lat` |
| Center Longitude | `formData.gps.longitude` | `project.location.lng` | `location.lng` |
| Project Address | ~~Removed~~ | ~~Not sent~~ | ~~Not stored~~ |
| GPS Accuracy | ~~Removed~~ | ~~Not sent~~ | ~~Not stored~~ |

## Example Query

To retrieve a project with polygon data from MongoDB:

```javascript
// Frontend API call
const project = await projectsAPI.getById(projectId);

// Access polygon vertices
const vertices = project.location.polygon_vertices;
const centerLat = project.location.lat;
const centerLng = project.location.lng;

console.log(`Project has ${vertices.length} boundary points`);
console.log(`Center: ${centerLat}, ${centerLng}`);
```

## Benefits of This Storage Method

1. **Flexible Schema**: MongoDB's document model handles nested arrays naturally
2. **Complete Data**: All boundary points are preserved
3. **Easy Retrieval**: Vertices can be easily accessed and displayed on maps
4. **GeoJSON Ready**: Can be converted to GeoJSON format if needed for mapping libraries
5. **Future-Proof**: Schema can be extended (e.g., adding multiple polygons, metadata per vertex)

## GeoJSON Conversion (Optional)

If needed, the polygon can be converted to GeoJSON format:

```javascript
function toGeoJSON(vertices) {
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        vertices.map(v => [v[1], v[0]]) // GeoJSON uses [lng, lat]
      ]
    },
    properties: {}
  };
}
```
