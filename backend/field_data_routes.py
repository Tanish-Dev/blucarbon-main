from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
import json
from .server import (
    FieldData, FieldDataCreate, User, get_current_active_user, 
    require_role, UserRole, db, logger
)
import os
import tempfile
import numpy as np
from PIL import Image
import base64
from datetime import datetime, timezone

router = APIRouter(prefix="/field-data", tags=["field-data"])

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

async def analyze_image_credibility(image_path: str) -> dict:
    """
    Placeholder for CNN model integration
    This function will integrate with your pre-trained CNN model
    """
    try:
        # Placeholder analysis - replace with your CNN model
        # For now, return mock credibility analysis
        analysis_result = {
            "credibility_score": 0.85,  # Score between 0-1
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
        
        # TODO: Replace this with actual CNN model inference
        # model = tf.keras.models.load_model('path/to/your/cnn_model.h5')
        # preprocessed_image = preprocess_image(image_path)
        # prediction = model.predict(preprocessed_image)
        # analysis_result = process_prediction(prediction)
        
        return analysis_result
    except Exception as e:
        logger.error(f"Error analyzing image credibility: {e}")
        return {
            "credibility_score": 0.0,
            "confidence": 0.0,
            "analysis": {"error": str(e)},
            "recommendations": ["Analysis failed - manual review required"]
        }

@router.post("/", response_model=FieldData)
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

@router.post("/{field_data_id}/upload-images")
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
            
            # Save image temporarily for CNN analysis (optional)
            with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
                tmp_file.write(content)
                tmp_file_path = tmp_file.name
            
            try:
                # Analyze image credibility
                analysis = await analyze_image_credibility(tmp_file_path)
                analysis_results.append({
                    "image_id": image_data["id"],
                    "filename": file.filename,
                    **analysis
                })
            finally:
                # Clean up temporary file
                os.unlink(tmp_file_path)
    
    # Calculate overall credibility score
    if analysis_results:
        avg_credibility = np.mean([r["credibility_score"] for r in analysis_results])
    else:
        avg_credibility = 0.0
    
    # Get existing images list
    existing_images = field_data_obj.images if isinstance(field_data_obj.images, list) else []
    
    # Update field data with images and analysis
    update_data = {
        "images": existing_images + [img["data_url"] for img in uploaded_images],
        "image_metadata": uploaded_images,  # Store full metadata separately
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

@router.get("/", response_model=List[FieldData])
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

@router.get("/{field_data_id}", response_model=FieldData)
async def get_field_data_by_id(
    field_data_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get specific field data entry"""
    field_data_dict = await db.field_data.find_one({"id": field_data_id})
    if not field_data_dict:
        raise HTTPException(status_code=404, detail="Field data not found")
    
    field_data_obj = FieldData(**field_data_dict)
    
    # Check permissions
    if (current_user.role == UserRole.USER and 
        field_data_obj.collector_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return field_data_obj

@router.put("/{field_data_id}/validate")
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

@router.delete("/{field_data_id}")
async def delete_field_data(
    field_data_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete field data entry"""
    field_data_dict = await db.field_data.find_one({"id": field_data_id})
    if not field_data_dict:
        raise HTTPException(status_code=404, detail="Field data not found")
    
    field_data_obj = FieldData(**field_data_dict)
    
    # Check permissions
    if (current_user.role == UserRole.USER and 
        field_data_obj.collector_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.field_data.delete_one({"id": field_data_id})
    return {"message": "Field data deleted successfully"}