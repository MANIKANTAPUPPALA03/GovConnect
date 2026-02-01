"""
Scheme Matcher using AI

Matches users to relevant schemes and explains eligibility.
"""
import json
from pathlib import Path
from typing import Optional

from app.ai.base import get_ai_client
from app.utils.prompts import (
    SCHEME_ELIGIBILITY_PROMPT, 
    SCHEME_SEARCH_PROMPT,
    get_fallback_response
)
from app.models.schemas import EligibilityResponse, Scheme


def load_schemes() -> list[dict]:
    """Load schemes from JSON file."""
    data_path = Path(__file__).parent.parent / "data" / "schemes.json"
    with open(data_path, "r", encoding="utf-8") as f:
        return json.load(f)


async def check_eligibility(
    scheme_id: str,
    age: Optional[int] = None,
    income: Optional[int] = None,
    occupation: Optional[str] = None,
    state: Optional[str] = None,
    category: Optional[str] = None
) -> EligibilityResponse:
    """
    Check if user is eligible for a scheme using AI reasoning.
    
    Returns a response with human-readable explanation.
    """
    # Find the scheme
    schemes = load_schemes()
    scheme = next((s for s in schemes if s["id"] == scheme_id), None)
    
    if not scheme:
        return EligibilityResponse(
            eligible=False,
            confidence=0,
            reason="Scheme not found. Please check the scheme ID and try again.",
            warnings=["Invalid scheme ID"],
            recommendations=["Browse available schemes to find the correct one"]
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
            try:
                return EligibilityResponse(
                    eligible=result.get("eligible", False),
                    confidence=result.get("confidence", 50),
                    reason=result.get("reason", "Unable to determine eligibility."),
                    warnings=result.get("warnings", []),
                    recommendations=result.get("recommendations", [])
                )
            except Exception:
                pass
    
    # Fallback: Basic rule-based eligibility
    return _rule_based_eligibility(scheme, age, income, occupation)


def _rule_based_eligibility(
    scheme: dict,
    age: Optional[int],
    income: Optional[int],
    occupation: Optional[str]
) -> EligibilityResponse:
    """Fallback rule-based eligibility check."""
    
    scheme_name = scheme["name"]
    eligibility = scheme.get("eligibility", [])
    
    # Basic matching logic
    is_eligible = True
    reasons = []
    warnings = []
    recommendations = []
    
    eligibility_text = " ".join(eligibility).lower()
    
    # Check occupation relevance
    if occupation:
        if "farmer" in eligibility_text and occupation.lower() == "farmer":
            reasons.append(f"Your occupation as a {occupation} matches the scheme requirements.")
        elif "farmer" in eligibility_text and occupation.lower() != "farmer":
            is_eligible = False
            reasons.append(f"This scheme is primarily for farmers, but you indicated your occupation as {occupation}.")
    
    if not reasons:
        reasons.append(f"Based on the available information, you may be eligible for {scheme_name}.")
        warnings.append("Please verify all eligibility criteria on the official portal.")
    
    recommendations.append("Gather all required documents before applying")
    recommendations.append(f"Check the official {scheme_name} website for latest updates")
    
    return EligibilityResponse(
        eligible=is_eligible,
        confidence=60 if is_eligible else 40,
        reason=" ".join(reasons),
        warnings=warnings,
        recommendations=recommendations
    )


async def search_schemes(
    query: Optional[str] = None,
    category: Optional[str] = None,
    occupation: Optional[str] = None,
    income: Optional[int] = None,
    age: Optional[int] = None
) -> tuple[list[Scheme], int]:
    """
    Search and recommend schemes based on user profile.
    Uses AI to explain relevance of each scheme.
    """
    schemes = load_schemes()
    
    # Filter by category if provided
    if category and category != "All":
        schemes = [s for s in schemes if s["category"].lower() == category.lower()]
    
    # Convert to Scheme models
    scheme_models = []
    for s in schemes:
        scheme_models.append(Scheme(
            id=s["id"],
            name=s["name"],
            category=s["category"],
            description=s["description"],
            benefit=s["benefit"],
            eligibility=s.get("eligibility", []),
            documents=s.get("documents", []),
            relevance_reason=None
        ))
    
    # If we have a query and AI is configured, get relevance reasons
    ai_client = get_ai_client()
    if query and ai_client.is_configured:
        schemes_list = "\n".join([f"- ID: {s.id}, Name: {s.name}, Category: {s.category}" for s in scheme_models])
        
        prompt = SCHEME_SEARCH_PROMPT.format(
            query=query,
            occupation=occupation or "Not specified",
            income=income or "Not specified",
            age=age or "Not specified",
            state="Not specified",
            schemes_list=schemes_list
        )
        
        result = await ai_client.generate(prompt)
        
        if result:
            relevance_reasons = result.get("relevance_reasons", {})
            for scheme in scheme_models:
                if scheme.id in relevance_reasons:
                    scheme.relevance_reason = relevance_reasons[scheme.id]
    
    return scheme_models, len(scheme_models)
