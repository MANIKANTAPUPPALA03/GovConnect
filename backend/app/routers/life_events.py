"""
Life Events Router

POST /api/life-events - Get comprehensive action plan for life events

This is a system-level feature that orchestrates across schemes, forms, and processes.
Not a simple recommendation list, but a guided action plan with ordering.
"""
from fastapi import APIRouter, HTTPException

from app.models.schemas import LifeEventRequest, LifeEventResponse
from app.ai.life_events_assistant import analyze_life_event

router = APIRouter()


@router.post("", response_model=LifeEventResponse)
async def handle_life_event(request: LifeEventRequest):
    """
    Analyze a life event and provide comprehensive action plan.
    
    This orchestrates outputs from schemes, forms, and process logic.
    Returns a guided action plan with proper ordering and priorities.
    """
    if not request.event or not request.event.strip():
        raise HTTPException(
            status_code=400,
            detail="Life event description is required"
        )
    
    result = await analyze_life_event(
        event=request.event,
        details=request.details
    )
    
    return result


@router.get("/suggestions")
async def get_life_event_suggestions():
    """Get list of common life events for suggestions."""
    return {
        "suggestions": [
            {
                "event": "Getting Married",
                "description": "Marriage registration, document updates, benefits"
            },
            {
                "event": "Having a Baby",
                "description": "Birth registration, maternity benefits, child schemes"
            },
            {
                "event": "Starting Farming",
                "description": "Farmer registration, subsidies, crop insurance"
            },
            {
                "event": "College Admission",
                "description": "Scholarships, education loans, certificates"
            },
            {
                "event": "Starting a Business",
                "description": "Registration, licenses, MUDRA loans"
            },
            {
                "event": "Buying a House",
                "description": "Housing schemes, property registration, loans"
            },
            {
                "event": "Retirement",
                "description": "Pension schemes, senior citizen benefits"
            },
            {
                "event": "Job Loss",
                "description": "Unemployment benefits, skill training, job search"
            }
        ]
    }
