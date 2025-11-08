# Quick Start Guide: Testing DMRV Studio

## Prerequisites
1. Backend server running on the configured URL
2. MongoDB database accessible
3. Frontend development server running

## Step-by-Step Testing Guide

### 1. Create Test Data

First, you need projects in "in_review" status. You can either:

**Option A: Use Field Capture to Create a Project**
1. Go to Field Capture page
2. Create a new project with all required fields
3. Submit the project
4. Manually update the project status in MongoDB to `in_review`:

```javascript
// In MongoDB
db.projects.updateOne(
  { id: "your-project-id" },
  { $set: { status: "in_review" } }
)
```

**Option B: Create Test Project via API**
```bash
curl -X POST http://your-backend-url/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Mangrove Restoration Project",
    "description": "Restoring coastal mangrove ecosystem",
    "methodology": "VM0033",
    "ecosystem_type": "Mangrove",
    "location": {
      "coordinates": { "lat": 16.3, "lng": 81.8 },
      "address": "Godavari Estuary, India"
    },
    "area_hectares": 125,
    "vintage": "2024"
  }'
```

Then update status:
```bash
curl -X PUT http://your-backend-url/api/projects/{project_id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    ...projectData,
    "status": "in_review"
  }'
```

### 2. Create or Login as Validator

You need a user account with `validator` role:

**Create Validator Account:**
```bash
curl -X POST http://your-backend-url/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "validator@example.com",
    "username": "validator1",
    "full_name": "Test Validator",
    "password": "securepassword123",
    "role": "validator"
  }'
```

Or update existing user's role in MongoDB:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "validator" } }
)
```

### 3. Access DMRV Studio

1. **Login** with validator credentials
2. **Navigate** to DMRV Studio from the sidebar menu
3. You should see the **Validation Queue** with your test project(s)

### 4. Test the Validation Workflow

#### A. Review Project in Queue
- **Search**: Try searching for project name
- **Filter**: Test different status filters
- **Click** on a project card to open validation dashboard

#### B. Validation Dashboard
1. **Left Panel - Layers**:
   - Toggle Baseline layer ON/OFF
   - Toggle Monitoring layer ON/OFF
   - Toggle Change Detection layer
   - Toggle NDVI layer
   - Toggle RGB layer
   - Toggle UAV data
   - Toggle Water and Cloud masks

2. **Center Panel - Map**:
   - View should update based on layer toggles
   - See project location and boundaries
   - Observe change visualization

3. **Right Panel - Analysis**:
   - **Wait for analysis** to complete (auto-runs on load)
   - **Review metrics**:
     - Extent Delta (area change)
     - Biomass Increase
     - CO₂ Absorbed
     - NDVI Change
     - Carbon Stock
     - Confidence Score
     - Uncertainty Class
   - **View Biomass Trend** chart
   - **Check Quality Indicators**
   - **Add validation notes** in text area

4. **Re-analyze**:
   - Click "Re-analyze" button to recalculate metrics

#### C. Generate MRV Report
1. Click **"Preview Report"** button
2. Review the report modal:
   - Project header with badges
   - Key results (CO₂, Area, Confidence)
   - Analysis summary
   - Technical sections
   - **MRV Hash** (cryptographic hash)
   - Your validation notes
3. Test buttons:
   - Download PDF (note: not implemented yet)
   - Publish & Hash

#### D. Make Validation Decision
1. **To Approve**:
   - Add any notes (optional)
   - Click "Approve Project" button
   - Project status → `monitoring`
   - Toast notification confirms
   - Return to queue

2. **To Reject**:
   - Add rejection notes (important!)
   - Click "Reject Project" button
   - Project status → `rejected`
   - Toast notification confirms
   - Return to queue

### 5. Verify Results

**Check in Queue:**
- Approved projects should disappear from "In Review" filter
- Filter by "Monitoring" to see approved projects
- Filter by "Rejected" to see rejected projects

**Check in Database:**
```javascript
// View updated project
db.projects.findOne({ id: "your-project-id" })

// Should show:
// - status: "monitoring" or "rejected"
// - validator_id: "your-validator-id"
// - validation_notes: "your notes"
// - mrv_hash: "0x..." (if report was generated)

// View MRV report (if generated)
db.mrv_reports.findOne({ project_id: "your-project-id" })
```

### 6. Test API Endpoints Directly

```bash
# Get validation queue
curl http://your-backend-url/api/validation/queue \
  -H "Authorization: Bearer YOUR_VALIDATOR_TOKEN"

# Approve project
curl -X PUT http://your-backend-url/api/validation/projects/{project_id}/approve \
  -H "Authorization: Bearer YOUR_VALIDATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Project looks good!"}'

# Reject project
curl -X PUT http://your-backend-url/api/validation/projects/{project_id}/reject \
  -H "Authorization: Bearer YOUR_VALIDATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Insufficient data quality"}'

# Generate MRV report
curl -X POST http://your-backend-url/api/validation/projects/{project_id}/mrv-report \
  -H "Authorization: Bearer YOUR_VALIDATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "biomass": 8.5,
    "co2": 245.6,
    "areaChange": 12.3,
    "confidence": 0.85,
    "ndvi": 0.25,
    "carbonStock": 1250.5
  }'
```

## Expected Behaviors

✅ **Queue View**:
- Shows all `in_review` projects
- Search filters work correctly
- Status filter works
- Project cards display all info
- Click navigates to validation dashboard

✅ **Validation Dashboard**:
- Auto-runs analysis on load
- Layer toggles work
- Metrics display calculated values
- Re-analyze recalculates values
- Notes can be entered
- Approve/Reject buttons work
- Returns to queue after action

✅ **MRV Report**:
- Shows all analysis data
- Generates unique hash
- Includes validator notes
- Preview modal works
- Close button works

✅ **Backend**:
- Projects update status correctly
- Validator ID recorded
- Notes saved
- MRV reports stored
- Hashes generated properly

## Common Issues & Solutions

**Issue: No projects in queue**
- Solution: Ensure projects have `status: "in_review"` in database

**Issue: Not authorized**
- Solution: Ensure user has `role: "validator"` or `"admin"`

**Issue: Analysis not running**
- Solution: Check browser console for errors, ensure project has `area_hectares`

**Issue: Can't approve/reject**
- Solution: Check network tab for API errors, verify token is valid

**Issue: Map not showing**
- Solution: Ensure project has `location.coordinates` data

## Next Steps After Testing

Once basic testing is complete:

1. **Integrate real satellite data APIs**
2. **Implement actual analysis algorithms**
3. **Add PDF generation**
4. **Connect to blockchain**
5. **Add notification system**
6. **Implement automated tests**

## Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs
3. Verify MongoDB data
4. Review API responses in Network tab
5. Ensure all environment variables are set correctly

Happy testing! 🚀
