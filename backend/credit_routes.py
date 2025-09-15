from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from .server import (
    Credit, CreditCreate, User, get_current_active_user, 
    require_role, UserRole, db, logger, CreditStatus
)
from datetime import datetime, timezone

router = APIRouter(prefix="/credits", tags=["credits"])

@router.post("/", response_model=Credit)
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

@router.get("/", response_model=List[Credit])
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

@router.get("/{credit_id}", response_model=Credit)
async def get_credit(
    credit_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get specific credit"""
    credit_dict = await db.credits.find_one({"id": credit_id})
    if not credit_dict:
        raise HTTPException(status_code=404, detail="Credit not found")
    
    credit = Credit(**credit_dict)
    
    # Check permissions
    if current_user.role == UserRole.USER:
        project = await db.projects.find_one({"id": credit.project_id})
        if not project or project["owner_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
    
    return credit

@router.put("/{credit_id}/issue")
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
        raise HTTPException(status_code=400, detail="Credit is not in pending status")
    
    # TODO: Register on blockchain here
    # blockchain_result = await register_credit_on_blockchain(credit)
    
    await db.credits.update_one(
        {"id": credit_id},
        {"$set": {
            "status": CreditStatus.ISSUED,
            "issued_to": issued_to,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    return {"message": "Credit issued successfully"}

@router.put("/{credit_id}/retire")
async def retire_credit(
    credit_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Retire credit"""
    credit_dict = await db.credits.find_one({"id": credit_id})
    if not credit_dict:
        raise HTTPException(status_code=404, detail="Credit not found")
    
    credit = Credit(**credit_dict)
    if credit.status != CreditStatus.ISSUED:
        raise HTTPException(status_code=400, detail="Credit must be issued before retirement")
    
    # Check if user owns the credit or is admin
    if (current_user.role == UserRole.USER and 
        credit.issued_to != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to retire this credit")
    
    await db.credits.update_one(
        {"id": credit_id},
        {"$set": {
            "status": CreditStatus.RETIRED,
            "retired_by": current_user.id,
            "retired_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    return {"message": "Credit retired successfully"}

@router.get("/stats/summary")
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