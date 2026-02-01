"""
Process Tracker Router

POST /api/process/track - Get step-by-step process explanation

Note: Steps are generic and explanatory, not tied to real-time systems.
The goal is user understanding, not live tracking.
"""
from fastapi import APIRouter, HTTPException

from app.models.schemas import ProcessTrackRequest, ProcessTrackResponse
from app.ai.process_tracker import track_process

router = APIRouter()


@router.post("/track", response_model=ProcessTrackResponse)
async def track_application_process(request: ProcessTrackRequest):
    """
    Get step-by-step explanation of a government process.
    
    This is for user understanding, not real-time tracking.
    Returns generic, explanatory steps with estimated timelines.
    """
    if not request.process_type or not request.process_type.strip():
        raise HTTPException(
            status_code=400,
            detail="Process type is required"
        )
    
    result = await track_process(
        process_type=request.process_type,
        details=request.details
    )
    
    return result
