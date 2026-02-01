"""
Schemes Router - Scheme Discovery & Eligibility (AI-First + Multilingual)

GET    /api/schemes           - Backward compatible (English only)
POST   /api/schemes           - Multilingual support
POST   /api/schemes/check-eligibility
GET    /api/schemes/categories
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Optional

from app.models.schemas import (
    SchemeSearchRequest,
    SchemeSearchResponse,
    EligibilityRequest,
    EligibilityResponse
)

from app.ai.scheme_ai import (
    search_schemes_smart,
    check_eligibility_smart
)

from app.utils.translator import to_english, from_english

router = APIRouter()


# -------------------------------------------------------------------
# 🔍 SCHEME SEARCH (GET - BACKWARD COMPATIBLE)
# -------------------------------------------------------------------

@router.get("", response_model=SchemeSearchResponse)
async def list_schemes_get(
    query: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Filter by category"),
    occupation: Optional[str] = Query(None, description="User's occupation"),
    income: Optional[int] = Query(None, description="User's income"),
    age: Optional[int] = Query(None, description="User's age")
):
    """
    List and search government schemes (GET - backward compatible).
    
    This endpoint is for backward compatibility with existing frontend.
    For multilingual support, use POST /api/schemes instead.
    """
    schemes, total = await search_schemes_smart(
        query=query,
        category=category,
        occupation=occupation,
        income=income,
        age=age
    )
    
    return SchemeSearchResponse(schemes=schemes, total=total)


# -------------------------------------------------------------------
# 🔍 SCHEME SEARCH (POST - MULTILINGUAL)

@router.post("", response_model=SchemeSearchResponse)
async def list_schemes(request: SchemeSearchRequest):
    """
    Discover government schemes using AI reasoning.

    - Accepts free-form user situation (any language)
    - Translates input to English
    - Uses AI to reason over schemes.json
    - Returns explanations (WHY scheme is relevant)
    - Translates output back to selected language

    This endpoint is NOT keyword-based search.
    AI is the primary decision-maker.
    """

    # 1️⃣ Translate user query → English (for AI reasoning)
    try:
        query_en = await to_english(request.query or "", request.language)
    except Exception as e:
        print(f"[Schemes] Translation to English failed: {e}")
        query_en = request.query or ""

    # 2️⃣ AI reasoning (English only)
    schemes, total = await search_schemes_smart(
        query=query_en,
        category=request.category,
        occupation=request.occupation,
        income=request.income,
        age=request.age
    )

    # 3️⃣ Prepare structured response
    response_en: Dict = {
        "schemes": schemes,
        "total": total
    }

    # 4️⃣ Translate output → selected language
    try:
        response_final = await from_english(response_en, request.language)
    except Exception as e:
        print(f"[Schemes] Translation from English failed: {e}")
        response_final = response_en  # Fallback to English

    return response_final


# -------------------------------------------------------------------
# ✅ SCHEME ELIGIBILITY CHECK (AI + EXPLANATION)
# -------------------------------------------------------------------

@router.post("/check-eligibility", response_model=EligibilityResponse)
async def check_scheme_eligibility(request: EligibilityRequest):
    """
    Check eligibility for a specific scheme.

    - Uses AI for eligibility reasoning
    - ALWAYS returns explanation (never just true/false)
    - Supports multilingual input & output
    """

    if not request.scheme_id:
        raise HTTPException(
            status_code=400,
            detail="Scheme ID is required"
        )

    # 1️⃣ Translate relevant text fields → English
    try:
        occupation_en = await to_english(request.occupation or "", request.language)
        state_en = await to_english(request.state or "", request.language)
        category_en = await to_english(request.category or "", request.language)
    except Exception as e:
        print(f"[Eligibility] Translation to English failed: {e}")
        occupation_en = request.occupation or ""
        state_en = request.state or ""
        category_en = request.category or ""

    # 2️⃣ AI eligibility reasoning (English)
    # 2️⃣ AI eligibility reasoning (English)
    result_en = await check_eligibility_smart(
        scheme_id=request.scheme_id,
        age=request.age,
        income=request.income,
        occupation=occupation_en,
        state=state_en,
        category=category_en
    )

    # 3️⃣ Translate result → selected language
    try:
        result_final = await from_english(result_en.dict(), request.language)
    except Exception as e:
        print(f"[Eligibility] Translation from English failed: {e}")
        result_final = result_en.dict()  # Fallback to English

    return result_final


# -------------------------------------------------------------------
# 📂 SCHEME CATEGORIES (STATIC, NO AI NEEDED)
# -------------------------------------------------------------------

@router.get("/categories")
async def get_categories():
    """
    Return list of scheme categories.
    This endpoint is intentionally static.
    """

    return {
        "categories": [
            "All",
            "Agriculture",
            "Education",
            "Health",
            "Environment",
            "Social Welfare",
            "Business"
        ]
    }
