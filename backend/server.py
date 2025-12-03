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
import base64
from bson import ObjectId

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import Sentinel Hub service
try:
    from sentinel_hub_service import get_sentinel_service
    SENTINEL_HUB_AVAILABLE = True
except ImportError as e:
    logging.warning(f"Sentinel Hub service not available: {e}")
    SENTINEL_HUB_AVAILABLE = False
except Exception as e:
    logging.error(f"Error importing Sentinel Hub service: {e}")
    SENTINEL_HUB_AVAILABLE = False

# Import Blockchain Integration
try:
    from blockchain_integration import BlockchainIntegration
    blockchain = BlockchainIntegration()
    BLOCKCHAIN_AVAILABLE = blockchain.is_connected
    logging.info(f"Blockchain integration status: {'✅ Available' if BLOCKCHAIN_AVAILABLE else '❌ Not available'}")
except ImportError as e:
    logging.warning(f"Blockchain integration not available: {e}")
    BLOCKCHAIN_AVAILABLE = False
    blockchain = None
except Exception as e:
    logging.error(f"Error importing blockchain integration: {e}")
    BLOCKCHAIN_AVAILABLE = False
    blockchain = None


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
    images: List[str] = []  # Base64 data URLs for project images
    image_metadata: Optional[List[Dict[str, Any]]] = []  # Image metadata (filename, size, etc)
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
    images: Optional[List[str]] = []  # Allow images to be passed during creation

class FieldData(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    plot_id: str
    gps_coordinates: Dict[str, float]  # lat, lng, accuracy
    species: Optional[str] = None
    canopy_cover: float = 0.0
    soil_type: Optional[str] = None
    notes: Optional[str] = None
    images: List[str] = []  # Base64 data URLs
    image_metadata: Optional[List[Dict[str, Any]]] = []  # Full image metadata
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
    data_bundle_uri: str  # Data bundle identifier or URI
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

# Utility functions for image storage and CNN integration
async def store_image_as_base64(file_content: bytes, filename: str) -> dict:
    """Convert image to base64 and store metadata"""
    try:
        # Convert to base64
        base64_image = base64.b64encode(file_content).decode('utf-8')
        
        # Determine content type from filename extension
        extension = filename.lower().split('.')[-1]
        content_type_map = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp'
        }
        content_type = content_type_map.get(extension, 'image/jpeg')
        
        # Create data URL format
        data_url = f"data:{content_type};base64,{base64_image}"
        
        # Create image metadata
        image_data = {
            "id": f"img_{datetime.now(timezone.utc).timestamp()}_{filename}",
            "filename": filename,
            "data_url": data_url,
            "size": len(file_content),
            "uploaded_at": datetime.now(timezone.utc)
        }
        
        logger.info(f"Converted {filename} to base64 (size: {len(file_content)} bytes)")
        return image_data
    except Exception as e:
        logger.error(f"Error converting image to base64: {e}")
        return None

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
    
    # Convert MongoDB _id to string id for frontend
    for project in projects:
        if '_id' in project and 'id' not in project:
            project['id'] = str(project['_id'])
    
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

@api_router.post("/projects/{project_id}/upload-images")
async def upload_project_images(
    project_id: str,
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Upload images directly to a project"""
    
    # Get project
    project_dict = await db.projects.find_one({"id": project_id})
    if not project_dict:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project = Project(**project_dict)
    
    # Check permissions
    if current_user.role == UserRole.USER and project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    uploaded_images = []
    
    for file in files:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
        
        # Read file content
        content = await file.read()
        
        # Store image as base64
        image_data = await store_image_as_base64(content, file.filename)
        if image_data:
            uploaded_images.append(image_data)
    
    # Get existing images
    existing_images = project.images if isinstance(project.images, list) else []
    existing_metadata = project.image_metadata if isinstance(project.image_metadata, list) else []
    
    # Update project with images
    update_data = {
        "images": existing_images + [img["data_url"] for img in uploaded_images],
        "image_metadata": existing_metadata + uploaded_images,
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": update_data}
    )
    
    return {
        "message": f"Uploaded {len(uploaded_images)} images successfully",
        "images": uploaded_images
    }

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
    
    uploaded_images = []
    analysis_results = []
    
    for file in files:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an image")
        
        # Read file content
        content = await file.read()
        
        # Store image as base64
        image_data = await store_image_as_base64(content, file.filename)
        if image_data:
            uploaded_images.append(image_data)
            
            # Analyze image credibility (mock)
            analysis = await mock_analyze_image_credibility(content)
            analysis_results.append({
                "image_id": image_data["id"],
                "filename": file.filename,
                **analysis
            })
    
    # Calculate overall credibility score
    if analysis_results:
        avg_credibility = sum(r["credibility_score"] for r in analysis_results) / len(analysis_results)
    else:
        avg_credibility = 0.0
    
    # Get existing images
    existing_images = field_data_obj.images if isinstance(field_data_obj.images, list) else []
    
    # Update field data with images and analysis
    update_data = {
        "images": existing_images + [img["data_url"] for img in uploaded_images],
        "image_metadata": uploaded_images,
        "credibility_score": avg_credibility,
        "analysis_results": analysis_results
    }
    
    await db.field_data.update_one(
        {"id": field_data_id},
        {"$set": update_data}
    )
    
    return {
        "message": f"Uploaded {len(uploaded_images)} images successfully",
        "images": uploaded_images,
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

# Validation endpoints for dMRV Studio
@api_router.get("/validation/queue", response_model=List[Project])
async def get_validation_queue(
    current_user: User = Depends(require_role([UserRole.VALIDATOR, UserRole.ADMIN]))
):
    """Get projects in validation queue (in_review status)"""
    projects = await db.projects.find({"status": ProjectStatus.IN_REVIEW}).to_list(1000)
    return [Project(**project) for project in projects]

@api_router.put("/validation/projects/{project_id}/approve")
async def approve_project(
    project_id: str,
    notes: Optional[str] = None,
    current_user: User = Depends(require_role([UserRole.VALIDATOR, UserRole.ADMIN]))
):
    """Approve a project and move it to monitoring phase"""
    project_dict = await db.projects.find_one({"id": project_id})
    if not project_dict:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update project status
    update_data = {
        "status": ProjectStatus.MONITORING,
        "validator_id": current_user.id,
        "updated_at": datetime.now(timezone.utc)
    }
    
    if notes:
        update_data["validation_notes"] = notes
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": update_data}
    )
    
    logger.info(f"Project {project_id} approved by validator {current_user.id}")
    
    updated_project_dict = await db.projects.find_one({"id": project_id})
    return {
        "message": "Project approved successfully",
        "project": Project(**updated_project_dict)
    }

@api_router.put("/validation/projects/{project_id}/reject")
async def reject_project(
    project_id: str,
    notes: str,
    current_user: User = Depends(require_role([UserRole.VALIDATOR, UserRole.ADMIN]))
):
    """Reject a project with validation notes"""
    project_dict = await db.projects.find_one({"id": project_id})
    if not project_dict:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update project status
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {
            "status": ProjectStatus.REJECTED,
            "validator_id": current_user.id,
            "validation_notes": notes,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    logger.info(f"Project {project_id} rejected by validator {current_user.id}")
    
    updated_project_dict = await db.projects.find_one({"id": project_id})
    return {
        "message": "Project rejected",
        "project": Project(**updated_project_dict)
    }

@api_router.post("/validation/projects/{project_id}/mrv-report")
async def generate_mrv_report(
    project_id: str,
    analysis_data: Dict[str, Any],
    current_user: User = Depends(require_role([UserRole.VALIDATOR, UserRole.ADMIN]))
):
    """Generate MRV report with analysis data and hash, then store on blockchain"""
    project_dict = await db.projects.find_one({"id": project_id})
    if not project_dict:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Generate MRV hash
    data_string = json.dumps({
        "project_id": project_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "validator_id": current_user.id,
        **analysis_data
    }, sort_keys=True)
    
    mrv_hash = hashlib.sha256(data_string.encode()).hexdigest()
    mrv_hash_hex = f"0x{mrv_hash}"
    
    # Store report data in database
    report = {
        "id": str(uuid.uuid4()),
        "project_id": project_id,
        "validator_id": current_user.id,
        "analysis_data": analysis_data,
        "mrv_hash": mrv_hash_hex,
        "created_at": datetime.now(timezone.utc),
        "blockchain_status": "pending"
    }
    
    await db.mrv_reports.insert_one(report)
    
    # Update project with MRV hash
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {
            "mrv_hash": mrv_hash_hex,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    logger.info(f"MRV report generated for project {project_id} with hash {mrv_hash}")
    
    # Store on blockchain
    blockchain_result = None
    if BLOCKCHAIN_AVAILABLE and blockchain:
        try:
            logger.info(f"📤 Attempting to store MRV hash on blockchain for project {project_id}")
            
            # Prepare metadata for blockchain
            metadata = {
                "project_id": project_id,
                "project_title": project_dict.get("title", ""),
                "validator_id": current_user.id,
                "validator_email": current_user.email,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "analysis_summary": {
                    "co2_absorbed": analysis_data.get("co2", 0),
                    "area_change": analysis_data.get("areaChange", 0),
                    "biomass_increase": analysis_data.get("biomass", 0),
                    "confidence": analysis_data.get("confidence", 0)
                }
            }
            
            blockchain_result = await blockchain.store_mrv_hash(
                project_id=project_id,
                mrv_hash=mrv_hash_hex,
                metadata=metadata
            )
            
            if blockchain_result:
                logger.info(f"✅ MRV hash stored on blockchain: {blockchain_result.get('transaction_hash')}")
                
                # Update report with blockchain info
                await db.mrv_reports.update_one(
                    {"id": report["id"]},
                    {"$set": {
                        "blockchain_status": "confirmed",
                        "blockchain_tx_hash": blockchain_result.get("transaction_hash"),
                        "blockchain_block": blockchain_result.get("block_number"),
                        "blockchain_explorer_url": blockchain_result.get("explorer_url")
                    }}
                )
                
                # Also update project
                await db.projects.update_one(
                    {"id": project_id},
                    {"$set": {
                        "blockchain_tx_hash": blockchain_result.get("transaction_hash"),
                        "blockchain_verified": True
                    }}
                )
                
                report["blockchain_tx_hash"] = blockchain_result.get("transaction_hash")
                report["blockchain_explorer_url"] = blockchain_result.get("explorer_url")
            else:
                logger.warning(f"⚠️ Failed to store MRV hash on blockchain for project {project_id}")
                await db.mrv_reports.update_one(
                    {"id": report["id"]},
                    {"$set": {"blockchain_status": "failed"}}
                )
        except Exception as e:
            logger.error(f"❌ Error storing MRV hash on blockchain: {e}")
            await db.mrv_reports.update_one(
                {"id": report["id"]},
                {"$set": {
                    "blockchain_status": "failed",
                    "blockchain_error": str(e)
                }}
            )
    else:
        logger.warning("⚠️ Blockchain not available - MRV hash stored in database only")
        await db.mrv_reports.update_one(
            {"id": report["id"]},
            {"$set": {"blockchain_status": "blockchain_unavailable"}}
        )
    
    response = {
        "message": "MRV report generated successfully",
        "mrv_hash": mrv_hash_hex,
        "report": report,
        "blockchain_available": BLOCKCHAIN_AVAILABLE
    }
    
    if blockchain_result:
        response["blockchain"] = blockchain_result
    
    return response

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

# ============================================
# SENTINEL HUB SATELLITE IMAGERY ENDPOINTS
# ============================================

@api_router.get("/satellite/imagery/{project_id}")
async def get_satellite_imagery(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get real Sentinel-2 satellite imagery for a project
    Returns baseline and monitoring imagery with NDVI
    """
    if not SENTINEL_HUB_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="Sentinel Hub service is not available. Please check server logs."
        )
    
    try:
        # Get project
        project = await db.projects.find_one({"_id": ObjectId(project_id)})
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get polygon coordinates
        polygon = project.get('location', {}).get('polygon', [])
        if not polygon:
            raise HTTPException(status_code=400, detail="Project has no polygon defined")
        
        # Get dates
        baseline_date = project.get('baseline_date', '2023-01-15')
        monitoring_date = project.get('monitoring_date', '2024-01-15')
        
        # Get Sentinel Hub service
        sentinel = get_sentinel_service()
        
        # Fetch temporal comparison
        result = sentinel.compare_temporal_imagery(
            polygon=polygon,
            baseline_date=baseline_date,
            monitoring_date=monitoring_date
        )
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logging.error(f"Error fetching satellite imagery: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch satellite imagery")

@api_router.post("/satellite/custom-imagery")
async def get_custom_imagery(
    data: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Get custom satellite imagery for any polygon and date
    
    Request body:
    {
        "polygon": [{"lat": 16.3, "lng": 81.8}, ...],
        "date": "2024-01-15",
        "type": "rgb" or "ndvi",
        "cloud_coverage": 20
    }
    """
    if not SENTINEL_HUB_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="Sentinel Hub service is not available. Please check server logs."
        )
    
    try:
        polygon = data.get('polygon')
        date = data.get('date')
        imagery_type = data.get('type', 'rgb')
        cloud_coverage = data.get('cloud_coverage', 20)
        
        if not polygon or not date:
            raise HTTPException(status_code=400, detail="polygon and date are required")
        
        sentinel = get_sentinel_service()
        
        if imagery_type == 'ndvi':
            result = sentinel.get_sentinel2_ndvi(polygon, date, cloud_coverage)
        else:
            result = sentinel.get_sentinel2_true_color(polygon, date, cloud_coverage)
        
        return result
        
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logging.error(f"Error fetching custom imagery: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch custom imagery")

# ============================================

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