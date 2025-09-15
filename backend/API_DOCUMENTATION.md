# Carbon Credit Management API Documentation

## Overview
This is a comprehensive backend API for a Carbon Credit Management System with blockchain integration, CNN-based image analysis, and role-based access control.

## Features Implemented

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, User, Validator)
- Secure password hashing with bcrypt

### 🌱 Project Management
- CRUD operations for carbon projects
- Project status tracking (Draft, In Review, Monitoring, Issued, Rejected)
- Ecosystem type categorization (Mangrove, Seagrass, Salt Marsh)
- Location and metadata management

### 📊 Field Data Management
- GPS coordinate tracking
- Species and environmental data collection
- Image upload with IPFS integration (mock implementation)
- CNN-based credibility analysis (mock implementation)
- Field data validation workflow

### 💰 Carbon Credit Management
- Credit creation and lifecycle management
- Credit issuance and retirement
- Metadata tracking with MRV (Measurement, Reporting, Verification)
- Blockchain integration for transparency

### ⛓️ Blockchain Integration
- Solidity smart contracts for Polygon Mumbai testnet
- Project registration on blockchain
- NFT-based carbon credits
- Transaction tracking and verification

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "password": "securepassword",
  "role": "user|admin|validator",
  "blockchain_address": "0x..." (optional)
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "username",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Project Management Endpoints

#### Create Project
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Project Name",
  "description": "Project description",
  "methodology": "VM0033|VM0007|CDM",
  "ecosystem_type": "Mangrove|Seagrass|Salt Marsh",
  "location": {"lat": 16.7644, "lng": 81.6375, "country": "India"},
  "area_hectares": 150.5,
  "vintage": "2024"
}
```

#### Get Projects
```http
GET /api/projects?status=draft&ecosystem_type=Mangrove
Authorization: Bearer {token}
```

#### Get Single Project
```http
GET /api/projects/{project_id}
Authorization: Bearer {token}
```

#### Update Project
```http
PUT /api/projects/{project_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Project Name",
  ...
}
```

#### Delete Project
```http
DELETE /api/projects/{project_id}
Authorization: Bearer {token}
```

### Field Data Endpoints

#### Create Field Data
```http
POST /api/field-data
Authorization: Bearer {token}
Content-Type: application/json

{
  "project_id": "project-uuid",
  "plot_id": "MRP-001",
  "gps_coordinates": {"lat": 16.7644, "lng": 81.6375, "accuracy": 5.2},
  "species": "Rhizophora mucronata",
  "canopy_cover": 75.5,
  "soil_type": "clay|silt|sand|peat",
  "notes": "Field observations",
  "measurements": "DBH and height measurements"
}
```

#### Upload Images for Field Data
```http
POST /api/field-data/{field_data_id}/upload-images
Authorization: Bearer {token}
Content-Type: multipart/form-data

files: [image files]
```

#### Get Field Data
```http
GET /api/field-data?project_id=uuid&validated=true
Authorization: Bearer {token}
```

#### Validate Field Data (Validator/Admin only)
```http
PUT /api/field-data/{field_data_id}/validate
Authorization: Bearer {token}
```

### Credit Management Endpoints

#### Create Credit (Admin/Validator only)
```http
POST /api/credits
Authorization: Bearer {token}
Content-Type: application/json

{
  "project_id": "project-uuid",
  "amount": 1000.5,
  "vintage": "2024",
  "methodology": "VM0033",
  "metadata": {
    "mrv_hash": "hash",
    "data_bundle_uri": "ipfs://...",
    "uncertainty_class": "A",
    "verification_standard": "VCS",
    "project_id": "project-uuid"
  }
}
```

#### Get Credits
```http
GET /api/credits?project_id=uuid&status=issued&vintage=2024
Authorization: Bearer {token}
```

#### Issue Credit (Admin/Validator only)
```http
PUT /api/credits/{credit_id}/issue
Authorization: Bearer {token}
Content-Type: application/json

{
  "issued_to": "user-uuid"
}
```

#### Get Credit Statistics
```http
GET /api/credits/stats/summary
Authorization: Bearer {token}
```

### Blockchain Integration Endpoints

#### Register Project on Blockchain (Admin/Validator only)
```http
POST /api/projects/{project_id}/register-blockchain
Authorization: Bearer {token}
```

#### Issue Credit on Blockchain (Admin/Validator only)
```http
POST /api/credits/{credit_id}/issue-blockchain
Authorization: Bearer {token}
```

### Utility Endpoints

#### Health Check
```http
GET /api/health
```

## Data Models

### User
- `id`: UUID
- `email`: Email address
- `username`: Unique username
- `full_name`: Full name
- `role`: admin|user|validator
- `blockchain_address`: Ethereum address (optional)
- `is_active`: Boolean
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Project
- `id`: UUID
- `title`: Project name
- `description`: Project description
- `methodology`: Carbon methodology (VM0033, VM0007, CDM)
- `ecosystem_type`: Mangrove|Seagrass|Salt Marsh
- `location`: GPS coordinates and location data
- `area_hectares`: Project area in hectares
- `status`: draft|in_review|monitoring|issued|rejected
- `vintage`: Year of carbon credits
- `owner_id`: User ID of project owner
- `validator_id`: User ID of assigned validator
- `metrics`: Project metrics (hectares monitored, credits issued, etc.)
- `blockchain_hash`: Transaction hash from blockchain registration
- `created_at`: Timestamp
- `updated_at`: Timestamp

### FieldData
- `id`: UUID
- `project_id`: Associated project ID
- `plot_id`: Field plot identifier
- `gps_coordinates`: GPS coordinates with accuracy
- `species`: Plant species observed
- `canopy_cover`: Percentage canopy coverage
- `soil_type`: Type of soil
- `notes`: Field observations
- `images`: Array of IPFS hashes for uploaded images
- `measurements`: Additional measurements
- `credibility_score`: CNN analysis score (0-1)
- `analysis_results`: Detailed CNN analysis results
- `collector_id`: User ID who collected the data
- `validated`: Boolean validation status
- `validator_id`: User ID of validator
- `created_at`: Timestamp

### Credit
- `id`: UUID
- `project_id`: Associated project ID
- `amount`: Credit amount in tCO2e
- `vintage`: Year of credits
- `methodology`: Carbon methodology
- `status`: draft|pending|issued|retired|cancelled
- `metadata`: MRV metadata (hash, data bundle URI, uncertainty class)
- `blockchain_tx_hash`: Blockchain transaction hash
- `blockchain_token_id`: NFT token ID on blockchain
- `issued_to`: User ID of credit owner
- `retired_by`: User ID who retired the credit
- `retired_at`: Retirement timestamp
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Environment Variables

```env
# Database
MONGO_URL="mongodb://localhost:27017"
DB_NAME="carbon_credit_db"

# Security
SECRET_KEY="your-super-secret-key"
CORS_ORIGINS="*"

# Blockchain (Polygon Mumbai Testnet)
POLYGON_RPC_URL="https://rpc-mumbai.maticvigil.com"
PRIVATE_KEY="your-private-key"
PROJECT_REGISTRY_ADDRESS="deployed-contract-address"
CARBON_CREDIT_NFT_ADDRESS="deployed-contract-address"
DEFAULT_USER_ADDRESS="0x..."

# IPFS
IPFS_API_URL="/ip4/127.0.0.1/tcp/5001"
```

## Role-Based Access Control

### Admin Role
- Full access to all endpoints
- Can create, update, delete any project or credit
- Can assign validators to projects
- Can register projects on blockchain
- Can issue credits on blockchain

### Validator Role
- Can validate field data
- Can create and issue credits
- Can register projects on blockchain
- Can view projects assigned to them
- Cannot delete projects or credits

### User Role
- Can create and manage their own projects
- Can create field data for their projects
- Can upload images and field measurements
- Can view their own credits
- Cannot validate data or issue credits

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: Bcrypt for secure password storage
3. **Role-Based Authorization**: Granular permission control
4. **Input Validation**: Pydantic models for request validation
5. **CORS Protection**: Configurable cross-origin resource sharing
6. **Database Security**: MongoDB with proper connection handling

## Mock Implementations

### CNN Image Analysis
Currently implemented as a mock that returns:
- Credibility score (0-1)
- Confidence level
- Analysis results (image quality, vegetation detection, anomalies)
- Recommendations

**To integrate your CNN model:**
1. Replace `mock_analyze_image_credibility()` function
2. Load your trained model
3. Preprocess uploaded images
4. Return analysis results in the same format

### IPFS Integration
Currently implemented as a mock that generates hash-based file identifiers.

**To integrate real IPFS:**
1. Set up IPFS node
2. Configure `IPFS_API_URL` environment variable
3. Replace `mock_upload_to_ipfs()` function
4. Handle IPFS client connections and error handling

### Blockchain Integration
Smart contracts are provided but integration uses mock implementations.

**To activate blockchain integration:**
1. Deploy the provided Solidity contracts to Polygon Mumbai
2. Set contract addresses in environment variables
3. Replace mock blockchain functions with real Web3 calls
4. Handle transaction signing and confirmation

## Error Handling

The API returns standard HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Internal Server Error

Error responses follow this format:
```json
{
  "detail": "Error message description"
}
```

## Testing

The API has been tested with the following operations:
1. ✅ User registration and authentication
2. ✅ Project creation and management
3. ✅ Field data collection
4. ✅ Role-based access control
5. ✅ Health check endpoint

## Next Steps for Production

1. **Deploy Smart Contracts**: Deploy to Polygon Mumbai and update addresses
2. **Integrate CNN Model**: Replace mock with your trained model
3. **Set up IPFS**: Configure real IPFS node for image storage
4. **Add Monitoring**: Implement logging and monitoring
5. **Add Rate Limiting**: Implement API rate limiting
6. **Add Tests**: Create comprehensive test suite
7. **SSL/TLS**: Ensure HTTPS in production
8. **Database Backup**: Set up MongoDB backup strategy