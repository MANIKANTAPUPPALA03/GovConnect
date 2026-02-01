"""
Life Events Assistant using AI

Orchestrates outputs from schemes, forms, and process logic.
This is a system-level feature providing guided action plans.
"""
from typing import Optional

from app.ai.base import get_ai_client
from app.utils.prompts import LIFE_EVENTS_PROMPT, get_fallback_response
from app.models.schemas import LifeEventResponse, ChecklistItem


async def analyze_life_event(
    event: str,
    details: Optional[str] = None
) -> LifeEventResponse:
    """
    Analyze a life event and provide comprehensive action plan.
    
    This orchestrates across schemes, forms, and processes to create
    a guided action plan with proper ordering.
    """
    ai_client = get_ai_client()
    
    if ai_client.is_configured:
        prompt = LIFE_EVENTS_PROMPT.format(
            event=event,
            details=details or "No additional details provided"
        )
        
        result = await ai_client.generate(prompt)
        
        if result:
            try:
                checklist = [
                    ChecklistItem(
                        title=item.get("title", ""),
                        description=item.get("description", ""),
                        priority=item.get("priority", "medium"),
                        category=item.get("category", "action"),
                        link=item.get("link")
                    )
                    for item in result.get("checklist", [])
                ]
                
                return LifeEventResponse(
                    event_name=result.get("event_name", event),
                    summary=result.get("summary", ""),
                    checklist=checklist,
                    timeline=result.get("timeline", []),
                    related_schemes=result.get("related_schemes", []),
                    required_documents=result.get("required_documents", [])
                )
            except Exception:
                pass
    
    # Fallback: Template-based life event guidance
    return _get_template_guidance(event, details)


def _get_template_guidance(event: str, details: Optional[str]) -> LifeEventResponse:
    """Provide template-based life event guidance."""
    
    event_lower = event.lower()
    
    # Life event templates
    templates = {
        "marriage": {
            "event_name": "Getting Married",
            "summary": "Congratulations on your upcoming marriage! Here's a comprehensive checklist of government-related tasks you need to complete. Plan ahead as some documents take time to process.",
            "checklist": [
                {"title": "Register Marriage", "description": "Register your marriage at the local registrar's office within 30 days", "priority": "high", "category": "form", "link": "/forms"},
                {"title": "Update Aadhaar Card", "description": "Update name/address on Aadhaar after marriage if needed", "priority": "high", "category": "document", "link": None},
                {"title": "Update Bank Records", "description": "Update name/nominee details in bank accounts", "priority": "medium", "category": "action", "link": None},
                {"title": "Update PAN Card", "description": "Update name on PAN card if changed after marriage", "priority": "medium", "category": "document", "link": None},
                {"title": "Update Passport", "description": "Apply for name/spouse endorsement on passport", "priority": "medium", "category": "form", "link": "/forms"},
                {"title": "Check Joint Tax Benefits", "description": "Explore tax benefits available for married couples", "priority": "low", "category": "scheme", "link": "/schemes"},
            ],
            "timeline": [
                {"phase": "Before Marriage", "duration": "1-2 months", "actions": ["Gather required documents", "Book marriage registration appointment"]},
                {"phase": "After Marriage", "duration": "0-30 days", "actions": ["Complete marriage registration", "Obtain marriage certificate"]},
                {"phase": "Post Registration", "duration": "1-3 months", "actions": ["Update all identity documents", "Update bank and insurance records"]}
            ],
            "related_schemes": ["Pradhan Mantri Awas Yojana (for housing)", "Sukanya Samriddhi Yojana (for daughter)"],
            "required_documents": ["Birth certificates of both parties", "Address proof", "Passport size photographs", "Witnesses with ID proof"]
        },
        "baby": {
            "event_name": "Having a Baby",
            "summary": "Congratulations on your new addition to the family! Here are the essential government tasks and benefits available for new parents.",
            "checklist": [
                {"title": "Birth Registration", "description": "Register birth within 21 days at local municipal office", "priority": "high", "category": "form", "link": "/forms"},
                {"title": "Birth Certificate", "description": "Obtain birth certificate from registrar", "priority": "high", "category": "document", "link": None},
                {"title": "Aadhaar for Baby", "description": "Apply for Aadhaar card for child (optional but recommended)", "priority": "medium", "category": "document", "link": None},
                {"title": "Add Child to Ration Card", "description": "Update ration card to include new family member", "priority": "medium", "category": "action", "link": None},
                {"title": "Maternity Benefits", "description": "Check eligibility for Pradhan Mantri Matru Vandana Yojana (₹5,000 benefit)", "priority": "high", "category": "scheme", "link": "/schemes"},
                {"title": "Sukanya Samriddhi Account", "description": "Open savings account if baby is a girl", "priority": "medium", "category": "scheme", "link": "/schemes"},
            ],
            "timeline": [
                {"phase": "At Birth", "duration": "0-21 days", "actions": ["Register birth", "Apply for birth certificate"]},
                {"phase": "First Month", "duration": "1 month", "actions": ["Apply for maternity benefits", "Update ration card"]},
                {"phase": "First Year", "duration": "12 months", "actions": ["Get Aadhaar for child", "Open Sukanya Samriddhi account (if girl)"]}
            ],
            "related_schemes": ["Pradhan Mantri Matru Vandana Yojana", "Sukanya Samriddhi Yojana", "Ayushman Bharat"],
            "required_documents": ["Hospital birth record", "Parents' identity proof", "Marriage certificate", "Address proof"]
        },
        "farming": {
            "event_name": "Starting Farming",
            "summary": "Starting your farming journey? Here are the government schemes and registrations that can help support your agricultural activities.",
            "checklist": [
                {"title": "PM-KISAN Registration", "description": "Register for ₹6,000 annual income support for farmers", "priority": "high", "category": "scheme", "link": "/schemes"},
                {"title": "Kisan Credit Card", "description": "Apply for subsidized agricultural credit", "priority": "high", "category": "scheme", "link": "/schemes"},
                {"title": "Soil Health Card", "description": "Get soil tested and receive recommendations", "priority": "medium", "category": "action", "link": None},
                {"title": "Crop Insurance", "description": "Enroll in Pradhan Mantri Fasal Bima Yojana", "priority": "high", "category": "scheme", "link": "/schemes"},
                {"title": "Irrigation Subsidy", "description": "Check eligibility for drip/sprinkler irrigation subsidy", "priority": "medium", "category": "scheme", "link": "/schemes"},
                {"title": "Farmer ID", "description": "Register on farmer portal for digital services", "priority": "medium", "category": "document", "link": None},
            ],
            "timeline": [
                {"phase": "Initial Setup", "duration": "1-2 months", "actions": ["Register for PM-KISAN", "Apply for Kisan Credit Card"]},
                {"phase": "Before Sowing", "duration": "Before season", "actions": ["Get crop insurance", "Soil testing"]},
                {"phase": "Ongoing", "duration": "Continuous", "actions": ["Check for new subsidies", "Attend Kisan training programs"]}
            ],
            "related_schemes": ["PM-KISAN", "Kisan Credit Card", "PM Fasal Bima Yojana", "Soil Health Card Scheme"],
            "required_documents": ["Land records (Khatauni/Khasra)", "Aadhaar card", "Bank account details", "Passport photographs"]
        },
        "default": {
            "event_name": event,
            "summary": f"Here's a general guide for navigating government services related to '{event}'. For more specific guidance, please provide additional details about your situation.",
            "checklist": [
                {"title": "Identify Required Documents", "description": "List all government documents that may need updating", "priority": "high", "category": "action", "link": None},
                {"title": "Check Relevant Schemes", "description": "Browse available government schemes that may apply to your situation", "priority": "medium", "category": "scheme", "link": "/schemes"},
                {"title": "Visit Local Office", "description": "Contact your local government office for specific guidance", "priority": "medium", "category": "action", "link": "/service-locator"},
            ],
            "timeline": [],
            "related_schemes": [],
            "required_documents": ["Aadhaar Card", "Address Proof", "Identity Proof"]
        }
    }
    
    # Match event to template
    template = templates.get("default")
    for key in templates:
        if key in event_lower:
            template = templates[key]
            break
    
    # Build response
    checklist = [ChecklistItem(**item) for item in template["checklist"]]
    
    return LifeEventResponse(
        event_name=template["event_name"],
        summary=template["summary"],
        checklist=checklist,
        timeline=template["timeline"],
        related_schemes=template["related_schemes"],
        required_documents=template["required_documents"]
    )
