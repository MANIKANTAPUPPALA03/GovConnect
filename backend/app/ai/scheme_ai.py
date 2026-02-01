"""
Scheme AI Module - Deep Reasoning Implementation

AI-powered scheme search with:
- Situation description parsing (not keywords)
- Entity extraction (occupation, land, income, state)
- Multilingual support (Telugu/Hindi → English internally)
- Eligibility reasoning with mandatory explanations
- Structured JSON output only
"""
import json
from pathlib import Path
from typing import Optional, List, Tuple

from app.ai.base import get_ai_client
from app.utils.prompts import (
    SCHEME_SEARCH_PROMPT,
    SCHEME_ELIGIBILITY_PROMPT,
    get_fallback_response
)
from app.models.schemas import Scheme, EligibilityResponse


def load_schemes() -> List[dict]:
    """Load schemes from JSON file."""
    data_path = Path(__file__).parent.parent / "data" / "schemes.json"
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)


async def search_schemes_smart(
    query: Optional[str] = None,
    occupation: Optional[str] = None,
    income: Optional[int] = None,
    age: Optional[int] = None,
    state: Optional[str] = None,
    category: Optional[str] = None
) -> Tuple[List[Scheme], int]:
    """
    AI-driven scheme search with deep reasoning.
    
    Flow:
    1. Load all schemes
    2. Send user situation + all schemes to AI
    3. AI extracts entities, matches schemes, and explains WHY
    4. Return ranked schemes with relevance reasons
    
    NO keyword fallback - pure AI reasoning.
    """
    all_schemes = load_schemes()
    
    # Filter by category if explicitly provided (UI dropdown filter)
    if category and category != "All":
        all_schemes = [s for s in all_schemes if s["category"].lower() == category.lower()]

    # Convert to Scheme objects with full details for AI context
    scheme_objects = [
        Scheme(
            id=s["id"],
            name=s["name"],
            category=s["category"],
            description=s["description"],
            benefit=s["benefit"],
            eligibility=s.get("eligibility", []),
            documents=s.get("documents", []),
            relevance_reason=None
        )
        for s in all_schemes
    ]
    
    # If no query provided, return all schemes (browsing mode)
    if not query:
        return scheme_objects, len(scheme_objects)

    # AI-powered search
    ai_client = get_ai_client()
    
    if not ai_client.is_configured:
        # Return all schemes if AI not configured, with a note
        for s in scheme_objects:
            s.relevance_reason = "AI service not configured - showing all schemes"
        return scheme_objects, len(scheme_objects)
    
    # Build rich context for AI with full scheme details
    schemes_context = "\n".join([
        f"ID: {s.id}\n"
        f"  Name: {s.name}\n"
        f"  Category: {s.category}\n"
        f"  Description: {s.description}\n"
        f"  Benefit: {s.benefit}\n"
        f"  Eligibility: {', '.join(s.eligibility)}\n"
        for s in scheme_objects
    ])
    
    prompt = SCHEME_SEARCH_PROMPT.format(
        query=query,
        occupation=occupation or "Not specified",
        income=income or "Not specified",
        age=age or "Not specified",
        state=state or "Not specified",
        schemes_list=schemes_context
    )
    
    result = await ai_client.generate(prompt)
    
    if result:
        # Extract AI response
        matched_schemes_data = result.get("matched_schemes", [])
        extracted_profile = result.get("extracted_profile", {})
        
        # Build lookup for relevance scores and reasons
        match_lookup = {
            m["scheme_id"]: {
                "score": m.get("relevance_score", 50),
                "reason": m.get("match_reason", "Matched by AI analysis")
            }
            for m in matched_schemes_data
        }
        
        # Filter and annotate matched schemes
        matched_schemes = []
        for s in scheme_objects:
            if s.id in match_lookup:
                s.relevance_reason = match_lookup[s.id]["reason"]
                matched_schemes.append((s, match_lookup[s.id]["score"]))
        
        # Sort by relevance score (highest first)
        matched_schemes.sort(key=lambda x: x[1], reverse=True)
        
        final_results = [s for s, score in matched_schemes]
        
        # If AI found matches, return them
        if final_results:
            return final_results, len(final_results)
        
        # If AI found no matches, this is intentional - return empty
        # (User's situation doesn't match any schemes)
        return [], 0
    
    # AI call failed - return all schemes with error note
    for s in scheme_objects:
        s.relevance_reason = "AI analysis unavailable - showing all schemes"
    return scheme_objects, len(scheme_objects)


async def check_eligibility_smart(
    scheme_id: str,
    age: Optional[int] = None,
    income: Optional[int] = None,
    occupation: Optional[str] = None,
    state: Optional[str] = None,
    category: Optional[str] = None
) -> EligibilityResponse:
    """
    Check eligibility using AI reasoning.
    Provides detailed explanation of why user is/isn't eligible.
    """
    # Get scheme details
    schemes = load_schemes()
    scheme = next((s for s in schemes if s["id"] == scheme_id), None)
    
    if not scheme:
        return EligibilityResponse(
            eligible=False,
            confidence=0,
            explanation="Scheme not found. Please verify the scheme ID and try again.",
            missing_requirements=[],
            warnings=["Invalid scheme ID provided"],
            recommendations=["Browse available schemes at /api/schemes"]
        )
        


    
    ai_client = get_ai_client()
    if ai_client.is_configured:
        prompt = SCHEME_ELIGIBILITY_PROMPT.format(
            scheme_name=scheme["name"],
            scheme_category=scheme["category"],
            eligibility_criteria=", ".join(scheme.get("eligibility", [])),
            age=age or "Not provided",
            income=income or "Not provided",
            occupation=occupation or "Not provided",
            state=state or "Not provided",
            category=category or "Not provided"
        )
        
        result = await ai_client.generate(prompt)
        
        if result:
            return EligibilityResponse(
                eligible=result.get("eligible", False),
                confidence=result.get("confidence", 0),
                explanation=result.get("explanation", result.get("reason", "Analysis complete.")),
                missing_requirements=result.get("missing_requirements", []),
                warnings=result.get("warnings", []),
                recommendations=result.get("recommendations", [])
            )
            
    # Fallback if AI unavailable
    fallback = get_fallback_response("eligibility")
    return EligibilityResponse(**fallback)
