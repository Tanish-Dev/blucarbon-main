# 🌊 BluCarbon - Carbon Credit Management Platform

> A comprehensive blockchain-enabled platform for blue carbon ecosystem monitoring, MRV (Measurement, Reporting, and Verification), and carbon credit management.

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.1-green.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/atlas)
[![Polygon](https://img.shields.io/badge/Blockchain-Polygon-purple.svg)](https://polygon.technology/)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Blockchain Integration](#blockchain-integration)
- [Deployment](#deployment)
- [Contributing](#contributing)

## 🌍 Overview

BluCarbon is a full-stack web application designed to revolutionize blue carbon ecosystem management. It provides tools for:

- **Blue Carbon Project Management**: Create and manage mangrove, seagrass, and salt marsh restoration projects
- **Digital MRV Studio**: Advanced satellite imagery analysis with Sentinel Hub integration for monitoring and verification
- **Field Data Collection**: Mobile-friendly GPS-enabled field data capture with image analysis
- **Carbon Credit Issuance**: Blockchain-based NFT carbon credits on Polygon network
- **Marketplace**: Trade and retire carbon credits with full transparency

The platform supports three ecosystem types:
- 🌴 **Mangrove Forests**
- 🌊 **Seagrass Meadows**
- 🧂 **Salt Marshes**

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based secure authentication
- Role-based access control (Admin, Validator, User)
- Blockchain wallet integration support

### 🌱 Project Management
- Complete project lifecycle tracking (Draft → In Review → Monitoring → Issued)
- Support for carbon methodologies (VM0033, VM0007, CDM)
- Geographic location tracking and visualization
- Project metrics dashboard

### 📡 Digital MRV Studio
- Real-time satellite imagery integration (Sentinel Hub)
- Multi-temporal analysis and comparison
- NDVI (Normalized Difference Vegetation Index) calculations
- Before/after project visualization
- Polygon-based area of interest definition

### 📊 Field Data Collection
- GPS-based plot tracking
- Species and environmental data logging
- Multi-image upload with IPFS storage
- CNN-based image credibility analysis
- Validator review workflow

### 💰 Carbon Credit Management
- NFT-based carbon credits on Polygon blockchain
- Credit vintage tracking
- Issuance and retirement workflows
- Comprehensive metadata (MRV hash, verification standards)
- Real-time statistics and reporting

### 🎯 Interactive Features
- Dashboard guided tour (React Joyride)
- Interactive polygon map editor
- Satellite imagery comparison tools
- Real-time project monitoring

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19.0.0
- **Routing**: React Router DOM 7.5.1
- **UI Components**: Radix UI (comprehensive component library)
- **Styling**: Tailwind CSS 3.4.17
- **Maps**: Leaflet 1.9.4, React Leaflet 5.0.0
- **Forms**: React Hook Form 7.56.2 with Zod validation
- **State Management**: React Context API
- **HTTP Client**: Axios 1.8.4
- **Build Tool**: CRACO 7.1.0

### Backend
- **Framework**: FastAPI 0.110.1
- **Server**: Uvicorn 0.25.0
- **Database**: MongoDB (Motor async driver)
- **Authentication**: python-jose, passlib[bcrypt]
- **Blockchain**: Web3.py 6.15.1, py-solc-x 2.0.0
- **Image Processing**: Pillow 10.2.0, NumPy 1.24.3
- **File Storage**: Boto3 (S3), aiofiles
- **Environment**: python-dotenv 1.0.1

### Blockchain
- **Network**: Polygon Mumbai Testnet
- **Smart Contracts**: Solidity (ProjectRegistry, CarbonCreditNFT, MRVRegistry)
- **Node Provider**: QuickNode
- **Wallet**: Web3 integration

### External Services
- **Satellite Imagery**: Sentinel Hub API
- **Storage**: IPFS (distributed file storage)
- **Database**: MongoDB Atlas

## 📁 Project Structure

```
blucarbon-main/
├── backend/                      # FastAPI backend server
│   ├── server.py                 # Main server application
│   ├── blockchain_integration.py # Web3 & smart contract integration
│   ├── sentinel_hub_service.py   # Satellite imagery service
│   ├── credit_routes.py          # Carbon credit API routes
│   ├── field_data_routes.py      # Field data API routes
│   ├── requirements.txt          # Python dependencies
│   ├── requirements.prod.txt     # Production dependencies
│   ├── blockchain/               # Smart contracts
│   │   ├── ProjectRegistry.sol   # Project blockchain registry
│   │   ├── CarbonCreditNFT.sol   # NFT carbon credits
│   │   └── MRVRegistry.sol       # MRV data registry
│   └── API_DOCUMENTATION.md      # Full API reference
│
├── frontend/                     # React frontend application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── ui/               # Base UI components (Radix UI)
│   │   │   ├── Layout.jsx        # Main layout wrapper
│   │   │   ├── ProjectMap.jsx    # Leaflet map component
│   │   │   ├── SatelliteMapViewer.jsx      # Sentinel Hub viewer
│   │   │   ├── SatelliteComparisonMap.jsx  # Before/after comparison
│   │   │   ├── PolygonMapEditor.jsx        # AOI polygon editor
│   │   │   └── DashboardTour.jsx           # Interactive tour
│   │   ├── pages/                # Page components
│   │   │   ├── Dashboard.jsx     # Main dashboard
│   │   │   ├── Projects.jsx      # Project listing
│   │   │   ├── ProjectDetail.jsx # Project details
│   │   │   ├── DMRVStudio.jsx    # Satellite analysis studio
│   │   │   ├── FieldCapture.jsx  # Field data collection
│   │   │   ├── Credits.jsx       # Carbon credits management
│   │   │   ├── Marketplace.jsx   # Credit marketplace
│   │   │   └── Admin.jsx         # Admin panel
│   │   ├── contexts/
│   │   │   └── AuthContext.js    # Authentication context
│   │   ├── services/
│   │   │   ├── api.js            # API client
│   │   │   ├── sentinelHub.js    # Sentinel Hub API
│   │   │   └── satelliteIntegration.js
│   │   └── styles/
│   │       ├── solvance-theme.css # Custom theme
│   │       └── map.css            # Map styling
│   ├── package.json              # Frontend dependencies
│   └── README.md                 # Frontend documentation
│
├── tests/                        # Test files
├── package.json                  # Root package configuration
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm/yarn
- **Python** 3.11+
- **MongoDB** (local or Atlas account)
- **Git**
- **Polygon Mumbai Testnet** account with test MATIC (for blockchain features)
- **Sentinel Hub** account (for satellite imagery)

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Tanish-Dev/blucarbon-main.git
cd blucarbon-main
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv_arm64

# Activate virtual environment
# On macOS/Linux:
source venv_arm64/bin/activate
# On Windows:
# venv_arm64\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
yarn install
# or: npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

#### 4. Database Setup

**Option A: MongoDB Atlas (Recommended)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URL` in backend `.env`

**Option B: Local MongoDB**
```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

### Running the Application

#### Start Backend Server
```bash
cd backend
source venv_arm64/bin/activate  # Activate virtual environment
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`  
API documentation: `http://localhost:8000/docs`

#### Start Frontend Development Server
```bash
cd frontend
yarn start  # or: npm start
```

Frontend will be available at: `http://localhost:3000`

## ⚙️ Environment Configuration

### Backend Environment Variables (`.env`)

```env
# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=carbon_credit_db

# Security
SECRET_KEY=your-super-secret-jwt-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Blockchain - Polygon Mumbai Testnet
POLYGON_RPC_URL=https://your-quicknode-endpoint.quiknode.pro/xxxxx/
PRIVATE_KEY=your-ethereum-private-key
PROJECT_REGISTRY_ADDRESS=0x...
CARBON_CREDIT_NFT_ADDRESS=0x...
MRV_REGISTRY_ADDRESS=0x...
DEFAULT_USER_ADDRESS=0x...

# Sentinel Hub
SENTINEL_HUB_CLIENT_ID=your-sentinel-hub-client-id
SENTINEL_HUB_CLIENT_SECRET=your-sentinel-hub-client-secret
SENTINEL_HUB_INSTANCE_ID=your-instance-id

# Storage
IPFS_API_URL=/ip4/127.0.0.1/tcp/5001
AWS_ACCESS_KEY_ID=your-aws-key (optional)
AWS_SECRET_ACCESS_KEY=your-aws-secret (optional)
S3_BUCKET_NAME=your-bucket-name (optional)
```

### Frontend Environment Variables (`.env`)

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_SENTINEL_HUB_INSTANCE_ID=your-instance-id
```

## 📚 API Documentation

For complete API documentation, see [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

### Quick API Reference

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

**Projects**
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `POST /api/projects/{id}/register-blockchain` - Register on blockchain

**Field Data**
- `POST /api/field-data` - Create field data
- `POST /api/field-data/{id}/upload-images` - Upload images
- `PUT /api/field-data/{id}/validate` - Validate data

**Carbon Credits**
- `GET /api/credits` - List credits
- `POST /api/credits` - Create credit
- `PUT /api/credits/{id}/issue` - Issue credit
- `POST /api/credits/{id}/issue-blockchain` - Issue on blockchain

**Health Check**
- `GET /api/health` - Service health status

## ⛓️ Blockchain Integration

### Smart Contracts

The platform uses three main smart contracts on Polygon Mumbai:

1. **ProjectRegistry.sol** - Manages blue carbon project registrations
2. **CarbonCreditNFT.sol** - ERC-721 NFTs representing carbon credits
3. **MRVRegistry.sol** - Stores MRV (Monitoring, Reporting, Verification) data

### Deploying Contracts

```bash
cd backend

# Install Solidity compiler
python -c "from solcx import install_solc; install_solc('0.8.19')"

# Deploy contracts (ensure .env is configured)
python deploy_contract.py
```

### Testing Blockchain Integration

```bash
# Test QuickNode connection
python test_quicknode.py

# Test blockchain integration
python test_blockchain.py
```

## 🌐 Deployment

### Production Deployment Options

**Frontend**: Vercel, Netlify, or GitHub Pages  
**Backend**: Railway, Render, or Fly.io  
**Database**: MongoDB Atlas  
**Blockchain**: Polygon Mainnet (migrate from Mumbai testnet)

### Quick Deploy with Railway & Vercel

#### Backend (Railway)
1. Create account at [Railway.app](https://railway.app)
2. Connect GitHub repository
3. Select `backend` folder
4. Add environment variables
5. Deploy

#### Frontend (Vercel)
1. Create account at [Vercel.com](https://vercel.com)
2. Connect GitHub repository
3. Select `frontend` folder
4. Add environment variable: `REACT_APP_API_URL`
5. Deploy

For detailed deployment instructions, see deployment guides in the repository.

## 🧪 Testing

```bash
# Backend tests
cd backend
python -m pytest tests/

# Test Sentinel Hub integration
python test_sentinel.py

# Test blockchain
python test_blockchain.py
python test_quicknode.py

# Frontend tests
cd frontend
yarn test  # or: npm test
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style
- **Frontend**: ESLint configuration included
- **Backend**: Follow PEP 8 guidelines
- **Commits**: Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team & Acknowledgments

- **Frontend**: React, Radix UI, Tailwind CSS, Leaflet
- **Backend**: FastAPI, MongoDB, Web3.py
- **Blockchain**: Polygon, Solidity
- **Satellite Data**: Sentinel Hub, ESA Copernicus
- **Contributors**: Thanks to all developers who have contributed to this project

## 📞 Support

For questions or support:
- Open an issue on GitHub
- Check documentation files in the repository
- Review API documentation at `/docs` endpoint when running backend

## 🗺️ Roadmap

- [ ] Migrate to Polygon Mainnet
- [ ] Integrate real CNN model for image analysis
- [ ] Add IPFS image storage
- [ ] Implement marketplace trading features
- [ ] Add mobile app support
- [ ] Enhanced analytics dashboard
- [ ] Multi-language support

---

**Built with 🌊 for a sustainable future**
