"""
Intent Router - Home Page Intelligence

POST /api/intent

This is the SINGLE routing brain of the application.
It only classifies intent and extracts entities.
Frontend navigation depends entirely on this response.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import IntentRequest, IntentResponse
from app.ai.intent_classifier import classify_intent

router = APIRouter()


@router.post("/intent", response_model=IntentResponse)
async def get_intent(request: IntentRequest):
    """
    Classify user intent from natural language input.
    
    This endpoint is routing-only. It does NOT perform business logic.
    Returns intent type and extracted entities for frontend routing.
    """
    if not request.text or not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Text input is required"
        )
    
    result = await classify_intent(request.text)
    return result
