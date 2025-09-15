from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict, Any, Union
from jose import JWTError, jwt
from pathlib import Path
from dotenv import load_dotenv
import os
import uuid
import logging
import hashlib
import json
import tempfile
from enum import Enum
import aiofiles

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configuration
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-secret-key-here-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL') or os.environ.get('MONGODB_URI')
if not mongo_url:
    raise ValueError("MONGO_URL or MONGODB_URI environment variable is required")

client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'carbon_credit_db')
db = client[db_name]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create FastAPI app
app = FastAPI(title="Carbon Credit Management API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    USER = "user"
    VALIDATOR = "validator"

class ProjectStatus(str, Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    MONITORING = "monitoring"
    ISSUED = "issued"
    REJECTED = "rejected"

class CreditStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    ISSUED = "issued"
    RETIRED = "retired"
    CANCELLED = "cancelled"

# Database Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    username: str
    full_name: str
    role: UserRole = UserRole.USER
    blockchain_address: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str
    role: UserRole = UserRole.USER
    blockchain_address: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class ProjectMetrics(BaseModel):
    hectares_monitored: float = 0.0
    credits_issued: float = 0.0
    credits_retired: float = 0.0
    biomass_estimate: float = 0.0

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    methodology: str  # VM0033, VM0007, CDM, etc.
    ecosystem_type: str  # Mangrove, Seagrass, Salt Marsh
    location: Dict[str, Any]  # GPS coordinates, address, etc.
    area_hectares: float
    status: ProjectStatus = ProjectStatus.DRAFT
    vintage: str  # Year
    owner_id: str
    validator_id: Optional[str] = None
    metrics: ProjectMetrics = Field(default_factory=ProjectMetrics)
    blockchain_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    title: str
    description: str
    methodology: str
    ecosystem_type: str
    location: Dict[str, Any]
    area_hectares: float
    vintage: str

class FieldData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    plot_id: str
    gps_coordinates: Dict[str, float]  # lat, lng, accuracy
    species: Optional[str] = None
    canopy_cover: float = 0.0
    soil_type: Optional[str] = None
    notes: Optional[str] = None
    images: List[str] = []  # IPFS hashes
    measurements: Optional[str] = None
    credibility_score: Optional[float] = None  # From CNN analysis
    analysis_results: Optional[List[Dict[str, Any]]] = None
    collector_id: str
    validated: bool = False
    validator_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FieldDataCreate(BaseModel):
    project_id: str
    plot_id: str
    gps_coordinates: Dict[str, float]
    species: Optional[str] = None
    canopy_cover: float = 0.0
    soil_type: Optional[str] = None
    notes: Optional[str] = None
    measurements: Optional[str] = None

class CreditMetadata(BaseModel):
    mrv_hash: str
    data_bundle_uri: str  # IPFS URI
    uncertainty_class: str
    verification_standard: str
    project_id: str

class Credit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    amount: float  # tCO2e
    vintage: str
    methodology: str
    status: CreditStatus = CreditStatus.DRAFT
    metadata: CreditMetadata
    blockchain_tx_hash: Optional[str] = None
    blockchain_token_id: Optional[str] = None
    issued_to: Optional[str] = None
    retired_by: Optional[str] = None
    retired_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreditCreate(BaseModel):
    project_id: str
    amount: float
    vintage: str
    methodology: str
    metadata: CreditMetadata

# Authentication utilities
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user_dict = await db.users.find_one({"username": username})
    if user_dict is None:
        raise credentials_exception
    return User(**user_dict)

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def require_role(required_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker

# Utility functions for IPFS and CNN integration
async def mock_upload_to_ipfs(file_content: bytes, filename: str) -> str:
    """Mock IPFS upload - replace with actual IPFS integration"""
    file_hash = hashlib.sha256(file_content).hexdigest()[:20]
    logger.info(f"Mock uploaded {filename} to IPFS: {file_hash}")
    return f"Qm{file_hash}"

async def mock_analyze_image_credibility(image_content: bytes) -> dict:
    """Mock CNN analysis - replace with actual CNN model integration"""
    return {
        "credibility_score": 0.85,
        "confidence": 0.92,
        "analysis": {
            "image_quality": "good",
            "vegetation_detected": True,
            "anomalies_detected": False,
            "environmental_consistency": True
        },
        "recommendations": [
            "Image quality is good for analysis",
            "Vegetation patterns consistent with reported ecosystem type"
        ]
    }

# Authentication endpoints
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"$or": [{"email": user_data.email}, {"username": user_data.username}]})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        role=user_data.role,
        blockchain_address=user_data.blockchain_address
    )
    
    # Save to database
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user_dict = await db.users.find_one({"username": user_credentials.username})
    if not user_dict or not verify_password(user_credentials.password, user_dict["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = User(**{k: v for k, v in user_dict.items() if k != "password"})
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

# Project Management endpoints
@api_router.post("/projects", response_model=Project)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_active_user)
):
    project = Project(
        **project_data.dict(),
        owner_id=current_user.id
    )
    
    await db.projects.insert_one(project.dict())
    return project

@api_router.get("/projects", response_model=List[Project])
async def get_projects(
    status: Optional[ProjectStatus] = None,
    ecosystem_type: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    query = {}
    
    # Users can only see their own projects unless they're admin/validator
    if current_user.role == UserRole.USER:
        query["owner_id"] = current_user.id
    
    if status:
        query["status"] = status
    if ecosystem_type:
        query["ecosystem_type"] = ecosystem_type
    
    projects = await db.projects.find(query).to_list(1000)
    return [Project(**project) for project in projects]

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_active_user)
):
    project_dict = await db.projects.find_one({"id": project_id})
    if not project_dict:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = Project(**project_dict)
    # Check permissions
    if current_user.role == UserRole.USER and project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this project")
    
    return project

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_active_user)
):
    project_dict = await db.projects.find_one({"id": project_id})
    if not project_dict:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = Project(**project_dict)
    # Check permissions
    if current_user.role == UserRole.USER and project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    
    # Update project
    update_data = project_data.dict()
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": update_data}
    )
    
    # Return updated project
    updated_project_dict = await db.projects.find_one({"id": project_id})
    return Project(**updated_project_dict)

@api_router.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.USER]))
):
    project_dict = await db.projects.find_one({"id": project_id})
    if not project_dict:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = Project(**project_dict)
    # Check permissions
    if current_user.role == UserRole.USER and project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    
    await db.projects.delete_one({"id": project_id})
    return {"message": "Project deleted successfully"}

# Field Data endpoints
@api_router.post("/field-data", response_model=FieldData)
async def create_field_data(
    field_data: FieldDataCreate,
    current_user: User = Depends(get_current_active_user)
):
    """Create new field data entry"""
    # Verify project exists and user has access
    project = await db.projects.find_one({"id": field_data.project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check permissions
    if current_user.role == UserRole.USER and project["owner_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized for this project")
    
    field_data_obj = FieldData(
        **field_data.dict(),
        collector_id=current_user.id
    )
    
    await db.field_data.insert_one(field_data_obj.dict())
    return field_data_obj

@api_router.post("/field-data/{field_data_id}/upload-images")
async def upload_field_images(
    field_data_id: str,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload images for field data and analyze with CNN"""
    
    # Get field data entry
    field_data_dict = await db.field_data.find_one({"id": field_data_id})
    if not field_data_dict:
        raise HTTPException(status_code=404, detail="Field data not found")
    
    field_data_obj = FieldData(**field_data_dict)
    
    # Check permissions
    if (current_user.role == UserRole.USER and 
        field_data_obj.collector_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    uploaded_hashes = []
    analysis_results = []
    
    for file in files:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
        
        # Read file content
        content = await file.read()
        
        # Upload to IPFS (mock)
        ipfs_hash = await mock_upload_to_ipfs(content, file.filename)
        uploaded_hashes.append(ipfs_hash)
        
        # Analyze image credibility (mock)
        analysis = await mock_analyze_image_credibility(content)
        analysis_results.append({
            "image_hash": ipfs_hash,
            "filename": file.filename,
            **analysis
        })
    
    # Calculate overall credibility score
    if analysis_results:
        avg_credibility = sum(r["credibility_score"] for r in analysis_results) / len(analysis_results)
    else:
        avg_credibility = 0.0
    
    # Update field data with images and analysis
    update_data = {
        "images": field_data_obj.images + uploaded_hashes,
        "credibility_score": avg_credibility,
        "analysis_results": analysis_results
    }
    
    await db.field_data.update_one(
        {"id": field_data_id},
        {"$set": update_data}
    )
    
    return {
        "message": f"Uploaded {len(uploaded_hashes)} images successfully",
        "ipfs_hashes": uploaded_hashes,
        "credibility_score": avg_credibility,
        "analysis_results": analysis_results
    }

@api_router.get("/field-data", response_model=List[FieldData])
async def get_field_data(
    project_id: Optional[str] = None,
    validated: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get field data entries"""
    query = {}
    
    if project_id:
        # Verify project access
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if (current_user.role == UserRole.USER and 
            project["owner_id"] != current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized for this project")
        
        query["project_id"] = project_id
    
    if validated is not None:
        query["validated"] = validated
    
    # Filter by user permissions
    if current_user.role == UserRole.USER:
        query["collector_id"] = current_user.id
    
    field_data_list = await db.field_data.find(query).to_list(1000)
    return [FieldData(**data) for data in field_data_list]

@api_router.put("/field-data/{field_data_id}/validate")
async def validate_field_data(
    field_data_id: str,
    current_user: User = Depends(require_role([UserRole.VALIDATOR, UserRole.ADMIN]))
):
    """Validate field data entry (validator/admin only)"""
    field_data_dict = await db.field_data.find_one({"id": field_data_id})
    if not field_data_dict:
        raise HTTPException(status_code=404, detail="Field data not found")
    
    await db.field_data.update_one(
        {"id": field_data_id},
        {"$set": {
            "validated": True,
            "validator_id": current_user.id
        }}
    )
    
    return {"message": "Field data validated successfully"}

# Credit endpoints
@api_router.post("/credits", response_model=Credit)
async def create_credit(
    credit_data: CreditCreate,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.VALIDATOR]))
):
    """Create new carbon credit (admin/validator only)"""
    
    # Verify project exists
    project = await db.projects.find_one({"id": credit_data.project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    credit = Credit(**credit_data.dict())
    await db.credits.insert_one(credit.dict())
    
    return credit

@api_router.get("/credits", response_model=List[Credit])
async def get_credits(
    project_id: Optional[str] = None,
    status: Optional[CreditStatus] = None,
    vintage: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
):
    """Get carbon credits"""
    query = {}
    
    if project_id:
        # Check project access
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if (current_user.role == UserRole.USER and 
            project["owner_id"] != current_user.id):
            raise HTTPException(status_code=403, detail="Not authorized for this project")
        
        query["project_id"] = project_id
    
    if status:
        query["status"] = status
    if vintage:
        query["vintage"] = vintage
    
    # Filter by user permissions
    if current_user.role == UserRole.USER:
        # Get user's projects
        user_projects = await db.projects.find({"owner_id": current_user.id}).to_list(1000)
        project_ids = [p["id"] for p in user_projects]
        query["project_id"] = {"$in": project_ids}
    
    credits = await db.credits.find(query).to_list(1000)
    return [Credit(**credit) for credit in credits]

@api_router.put("/credits/{credit_id}/issue")
async def issue_credit(
    credit_id: str,
    issued_to: str,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.VALIDATOR]))
):
    """Issue credit to user (admin/validator only)"""
    credit_dict = await db.credits.find_one({"id": credit_id})
    if not credit_dict:
        raise HTTPException(status_code=404, detail="Credit not found")
    
    credit = Credit(**credit_dict)
    if credit.status != CreditStatus.PENDING:
        # Allow issuing from draft as well
        if credit.status not in [CreditStatus.DRAFT, CreditStatus.PENDING]:
            raise HTTPException(status_code=400, detail="Credit cannot be issued in current status")
    
    await db.credits.update_one(
        {"id": credit_id},
        {"$set": {
            "status": CreditStatus.ISSUED,
            "issued_to": issued_to,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    return {"message": "Credit issued successfully"}

@api_router.get("/credits/stats/summary")
async def get_credit_stats(
    current_user: User = Depends(get_current_active_user)
):
    """Get credit statistics"""
    query = {}
    
    # Filter by user permissions
    if current_user.role == UserRole.USER:
        user_projects = await db.projects.find({"owner_id": current_user.id}).to_list(1000)
        project_ids = [p["id"] for p in user_projects]
        query["project_id"] = {"$in": project_ids}
    
    # Get all credits for calculation
    credits = await db.credits.find(query).to_list(1000)
    
    stats = {
        "total_credits": len(credits),
        "issued_credits": len([c for c in credits if c["status"] == CreditStatus.ISSUED]),
        "retired_credits": len([c for c in credits if c["status"] == CreditStatus.RETIRED]),
        "pending_credits": len([c for c in credits if c["status"] == CreditStatus.PENDING]),
        "total_amount": sum(c["amount"] for c in credits),
        "issued_amount": sum(c["amount"] for c in credits if c["status"] == CreditStatus.ISSUED),
        "retired_amount": sum(c["amount"] for c in credits if c["status"] == CreditStatus.RETIRED)
    }
    
    return stats

# Blockchain integration endpoints (mock implementation)
@api_router.post("/projects/{project_id}/register-blockchain")
async def register_project_blockchain(
    project_id: str,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.VALIDATOR]))
):
    """Register project on blockchain (mock implementation)"""
    project_dict = await db.projects.find_one({"id": project_id})
    if not project_dict:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Mock blockchain registration
    mock_tx_hash = f"0x{hashlib.sha256(project_id.encode()).hexdigest()}"
    
    # Update project with blockchain hash
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"blockchain_hash": mock_tx_hash}}
    )
    
    return {
        "message": "Project registered on blockchain (mock)",
        "transaction_hash": mock_tx_hash
    }

@api_router.post("/credits/{credit_id}/issue-blockchain")
async def issue_credit_blockchain(
    credit_id: str,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.VALIDATOR]))
):
    """Issue credit on blockchain (mock implementation)"""
    credit_dict = await db.credits.find_one({"id": credit_id})
    if not credit_dict:
        raise HTTPException(status_code=404, detail="Credit not found")
    
    # Mock blockchain issuance
    mock_tx_hash = f"0x{hashlib.sha256(credit_id.encode()).hexdigest()}"
    mock_token_id = str(abs(hash(credit_id)) % 10000)
    
    # Update credit with blockchain data
    await db.credits.update_one(
        {"id": credit_id},
        {"$set": {
            "blockchain_tx_hash": mock_tx_hash,
            "blockchain_token_id": mock_token_id,
            "status": CreditStatus.ISSUED
        }}
    )
    
    return {
        "message": "Credit issued on blockchain (mock)",
        "transaction_hash": mock_tx_hash,
        "token_id": mock_token_id
    }

# Health check
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc)}

# Include the router in the main app
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Vercel handler
handler = app