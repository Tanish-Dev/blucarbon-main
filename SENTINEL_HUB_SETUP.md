# Sentinel Hub Integration Setup Guide

## ✅ Integration Complete!

The Sentinel Hub integration is now ready. Follow these steps to activate it with your 30-day free trial:

---

## Step 1: Get Sentinel Hub Credentials

1. **Go to Sentinel Hub Dashboard**: https://apps.sentinel-hub.com/dashboard/

2. **Sign up or Log in** with your account

3. **Create OAuth Client**:
   - Click on "User Settings" (top right)
   - Go to "OAuth clients"
   - Click "New OAuth Client"
   - Give it a name (e.g., "BluCarbon DMRV")
   - Copy the **Client ID** and **Client Secret** (save them securely!)

4. **Get Instance ID**:
   - Go to "Configuration Utility" in the left menu
   - Click "Create new configuration"
   - Select "Sentinel-2 L2A" as the data source
   - Click "Create"
   - Copy the **Instance ID** from the URL (format: `XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`)

---

## Step 2: Configure Backend

1. **Open** `/backend/.env`

2. **Replace** the placeholder values with your actual credentials:

```properties
# Sentinel Hub Configuration
SENTINEL_CLIENT_ID="your_actual_client_id_here"
SENTINEL_CLIENT_SECRET="your_actual_client_secret_here"
SENTINEL_INSTANCE_ID="your_actual_instance_id_here"
```

**Example:**
```properties
SENTINEL_CLIENT_ID="a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6"
SENTINEL_CLIENT_SECRET="xYz123AbC456DeF789GhI012JkL345MnO678PqR901StU234VwX567"
SENTINEL_INSTANCE_ID="12345678-90ab-cdef-1234-567890abcdef"
```

---

## Step 3: Configure Frontend (Optional)

The frontend will automatically use the backend API, but if you want to configure it:

1. **Open** `/frontend/.env`

2. **Verify** these settings are present (already added):

```properties
REACT_APP_SENTINEL_CLIENT_ID=your_client_id_here
REACT_APP_SENTINEL_CLIENT_SECRET=your_client_secret_here
REACT_APP_SENTINEL_INSTANCE_ID=your_instance_id_here
```

**Note**: Frontend env vars are for reference only. The actual integration uses backend API for security.

---

## Step 4: Start the Application

1. **Start Backend**:
```bash
cd backend
python server.py
```

2. **Start Frontend** (in another terminal):
```bash
cd frontend
npm start
```

3. **Navigate to DMRV Studio**:
   - Log in as a validator
   - Open DMRV Studio
   - Select a project
   - **The map will automatically load real Sentinel-2 imagery!**

---

## What You'll See

### 🎯 When Real Imagery Loads Successfully:

- **Green checkmark** in bottom-right attribution box
- **"Real Sentinel-2 Data"** status
- **Actual date ranges** for baseline and monitoring periods
- **Real satellite images** when you toggle baseline/monitoring layers
- **Actual NDVI** calculations from NIR and Red bands

### ⚠️ While Loading:

- **Blue spinning icon** with "Loading Sentinel-2 imagery..."

### ❌ If There's an Error:

- **Red error message** with details
- **Falls back to simulated data** automatically
- Check backend console for detailed error messages

---

## How It Works

### Backend Flow:
1. Frontend requests imagery for a project via `/api/satellite/imagery/{project_id}`
2. Backend retrieves project polygon and dates from MongoDB
3. Backend authenticates with Sentinel Hub OAuth2
4. Backend requests Sentinel-2 imagery for:
   - **Baseline RGB** (True Color)
   - **Baseline NDVI** (Vegetation Index)
   - **Monitoring RGB** (True Color)
   - **Monitoring NDVI** (Vegetation Index)
5. Sentinel Hub processes the data using custom evalscripts:
   - **RGB**: `(B04, B03, B02)` with gain enhancement
   - **NDVI**: `(B08 - B04) / (B08 + B04)` with color coding
6. Backend returns base64-encoded images
7. Frontend displays them as image overlays on the map

### Data Processing:
- **Date Range**: ±15 days from specified date for cloud-free composite
- **Cloud Coverage**: Maximum 20% cloud coverage
- **Resolution**: 10m per pixel (Sentinel-2)
- **Bands Used**:
  - **B04**: Red (660nm)
  - **B03**: Green (560nm)
  - **B02**: Blue (490nm)
  - **B08**: NIR (842nm)

---

## Troubleshooting

### Error: "Sentinel Hub credentials not configured"
**Solution**: Make sure you've set all three environment variables in `/backend/.env`

### Error: "Failed to fetch satellite imagery"
**Solutions**:
1. Check your Sentinel Hub account is active
2. Verify your free trial hasn't expired
3. Check the project has a valid polygon defined
4. Check backend console for detailed error messages

### Error: "Authentication failed"
**Solutions**:
1. Verify Client ID and Secret are correct
2. Make sure Instance ID is from the correct configuration
3. Try creating a new OAuth client

### Map shows "Demo Mode" instead of real data
**Solutions**:
1. Check that `projectId` prop is being passed to `SatelliteComparisonMap`
2. Verify backend is running and accessible
3. Check browser console for API errors
4. Verify project exists in MongoDB with polygon data

---

## API Endpoints

### Get Project Imagery
```
GET /api/satellite/imagery/{project_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "baseline": {
    "date": "2023-01-15",
    "rgb": {
      "success": true,
      "image": "data:image/png;base64,...",
      "date_range": "2023-01-01 to 2023-01-30",
      "bbox": [81.7, 16.2, 81.9, 16.4]
    },
    "ndvi": {
      "success": true,
      "image": "data:image/png;base64,...",
      "date_range": "2023-01-01 to 2023-01-30",
      "bbox": [81.7, 16.2, 81.9, 16.4]
    }
  },
  "monitoring": {
    "date": "2024-01-15",
    "rgb": {...},
    "ndvi": {...}
  },
  "change_detected": true
}
```

### Get Custom Imagery
```
POST /api/satellite/custom-imagery
Authorization: Bearer <token>
Content-Type: application/json

{
  "polygon": [{"lat": 16.3, "lng": 81.8}, ...],
  "date": "2024-01-15",
  "type": "rgb",  // or "ndvi"
  "cloud_coverage": 20
}
```

---

## Sentinel Hub Limits (Free Trial)

- **Duration**: 30 days
- **Processing Units**: Limited (varies by account)
- **Requests**: Rate limited
- **Best Practice**: Cache imagery results in MongoDB after first fetch

---

## Next Steps After Free Trial

1. **Upgrade to Paid Plan**: €0.01 - €0.04 per km² (very affordable for carbon projects)
2. **Switch to Google Earth Engine**: Free for research/non-profit
3. **Implement Caching**: Store processed images in MongoDB to reduce API calls

---

## Code Locations

| File | Purpose |
|------|---------|
| `/backend/sentinel_hub_service.py` | Sentinel Hub API integration |
| `/backend/server.py` | API endpoints for satellite imagery |
| `/frontend/src/services/sentinelHub.js` | Frontend service to fetch imagery |
| `/frontend/src/components/SatelliteComparisonMap.jsx` | Map component with real imagery display |
| `/backend/.env` | Backend credentials (KEEP SECRET!) |
| `/frontend/.env` | Frontend configuration |

---

## Support

- **Sentinel Hub Docs**: https://docs.sentinel-hub.com/
- **Sentinel Hub Forum**: https://forum.sentinel-hub.com/
- **API Reference**: https://docs.sentinel-hub.com/api/latest/

---

## 🎉 You're All Set!

Once you add your credentials, the DMRV Studio will automatically:
- ✅ Load real Sentinel-2 imagery
- ✅ Calculate actual NDVI values
- ✅ Compare baseline vs monitoring periods
- ✅ Provide accurate carbon credit validation data

**Enjoy your 30-day free trial! 🛰️**
