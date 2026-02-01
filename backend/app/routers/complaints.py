"""
Complaints Router

POST /api/complaints/generate - Generate formal complaint letter

Note: Generated complaints are advisory only.
The system does NOT submit to official government portals.
"""
from fastapi import APIRouter, HTTPException

from app.models.schemas import ComplaintRequest, ComplaintResponse
from app.ai.complaint_generator import generate_complaint

router = APIRouter()


@router.post("/generate", response_model=ComplaintResponse)
async def generate_complaint_letter(request: ComplaintRequest):
    """
    Generate a formal complaint letter for government grievances.
    
    IMPORTANT: This is advisory only. The system does NOT submit
    to official government portals. PDF generation is optional.
    """
    if not request.sector or not request.sector.strip():
        raise HTTPException(
            status_code=400,
            detail="Sector is required"
        )
    
    if not request.description or not request.description.strip():
        raise HTTPException(
            status_code=400,
            detail="Issue description is required"
        )
    
    result = await generate_complaint(
        sector=request.sector,
        description=request.description
    )
    
    return result


@router.get("/sectors")
async def get_complaint_sectors():
    """Get list of sectors for filing complaints."""
    return {
        "sectors": [
            {"name": "Electricity", "department": "Power Distribution Company"},
            {"name": "Water Supply", "department": "Municipal Water Department"},
            {"name": "Transport", "department": "Regional Transport Office"},
            {"name": "Education", "department": "Department of Education"},
            {"name": "Health", "department": "Department of Health"},
            {"name": "Police", "department": "Police Department"},
            {"name": "Municipal Services", "department": "Municipal Corporation"},
            {"name": "Banking", "department": "Banking Ombudsman"},
            {"name": "Telecom", "department": "TRAI"},
            {"name": "Pension", "department": "Pension Department"},
            {"name": "Railways", "department": "Indian Railways"},
            {"name": "Post", "department": "India Post"},
            {"name": "Income Tax", "department": "Income Tax Department"},
            {"name": "Other", "department": "Relevant Department"}
        ]
    }
