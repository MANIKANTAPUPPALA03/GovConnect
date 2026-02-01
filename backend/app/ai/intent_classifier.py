"""
Intent Classifier using AI

Classifies user input into intents and extracts entities.
This is the SINGLE routing brain of the application.
"""
from typing import Optional

from app.ai.base import get_ai_client
from app.utils.prompts import INTENT_CLASSIFICATION_PROMPT, get_fallback_response
from app.models.schemas import IntentResponse, IntentType


async def classify_intent(text: str) -> IntentResponse:
    """
    Classify user input into an intent.
    
    This endpoint is routing-only. It does NOT perform business logic.
    Frontend navigation depends entirely on this response.
    """
    ai_client = get_ai_client()
    
    # Try AI classification
    if ai_client.is_configured:
        prompt = INTENT_CLASSIFICATION_PROMPT.format(text=text)
        result = await ai_client.generate(prompt)
        
        if result:
            try:
                return IntentResponse(
                    intent=IntentType(result.get("intent", "scheme")),
                    entities=result.get("entities", {}),
                    confidence=float(result.get("confidence", 0.8))
                )
            except (ValueError, KeyError):
                pass
    
    # Fallback: Rule-based classification
    return _rule_based_classification(text)


def _rule_based_classification(text: str) -> IntentResponse:
    """Fallback rule-based intent classification."""
    text_lower = text.lower()
    
    # Keywords for each intent
    intent_keywords = {
        IntentType.SCHEME: [
            "scheme", "subsidy", "benefit", "eligible", "yojana", "pradhan mantri",
            "farmer", "pension", "loan", "scholarship", "insurance"
        ],
        IntentType.FORM: [
            "form", "certificate", "document", "apply", "fill", "application",
            "income certificate", "caste certificate", "birth", "death", "marriage"
        ],
        IntentType.PROCESS: [
            "process", "how to", "steps", "procedure", "track", "status",
            "application status", "timeline", "how long"
        ],
        IntentType.COMPLAINT: [
            "complaint", "grievance", "issue", "problem", "not working",
            "file complaint", "report", "corruption"
        ],
        IntentType.SERVICE_LOCATOR: [
            "office", "center", "near me", "nearby", "location", "where",
            "address", "find", "locate"
        ],
        IntentType.LIFE_EVENT: [
            "getting married", "marriage", "new baby", "starting business",
            "college", "admission", "retirement", "moving", "buying house"
        ]
    }
    
    # Score each intent
    scores = {}
    for intent, keywords in intent_keywords.items():
        score = sum(1 for keyword in keywords if keyword in text_lower)
        scores[intent] = score
    
    # Get highest scoring intent
    best_intent = max(scores, key=scores.get)
    best_score = scores[best_intent]
    
    # Extract basic entities
    entities = _extract_entities(text_lower)
    
    return IntentResponse(
        intent=best_intent if best_score > 0 else IntentType.SCHEME,
        entities=entities,
        confidence=min(0.3 + (best_score * 0.15), 0.9)
    )


def _extract_entities(text: str) -> dict:
    """Extract basic entities from text."""
    entities = {}
    
    # Occupation keywords
    occupations = ["farmer", "student", "teacher", "doctor", "engineer", "worker", "employee"]
    for occ in occupations:
        if occ in text:
            entities["occupation"] = occ
            break
    
    # Income patterns
    import re
    income_match = re.search(r'(?:income|earn|salary)\s*(?:of|is)?\s*(?:rs\.?|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)', text)
    if income_match:
        entities["income"] = income_match.group(1).replace(",", "")
    
    # Age patterns
    age_match = re.search(r'(?:age|aged?)\s*(?:is|of)?\s*(\d{1,3})\s*(?:years?)?', text)
    if age_match:
        entities["age"] = age_match.group(1)
    
    # Land patterns
    land_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:acre|hectare|bigha)s?', text)
    if land_match:
        entities["land"] = land_match.group(0)
    
    return entities
