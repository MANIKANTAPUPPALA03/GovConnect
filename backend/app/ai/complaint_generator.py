"""
Complaint Generator using AI

Generates formal complaint letters for government grievances.
Advisory only - does NOT submit to official portals.
"""
from app.ai.base import get_ai_client
from app.utils.prompts import COMPLAINT_GENERATION_PROMPT, get_fallback_response
from app.models.schemas import ComplaintResponse


async def generate_complaint(
    sector: str,
    description: str
) -> ComplaintResponse:
    """
    Generate a formal complaint letter.
    
    Note: This is advisory only. The system does NOT submit to official portals.
    """
    ai_client = get_ai_client()
    
    if ai_client.is_configured:
        prompt = COMPLAINT_GENERATION_PROMPT.format(
            sector=sector,
            description=description
        )
        
        result = await ai_client.generate(prompt)
        
        if result:
            try:
                return ComplaintResponse(
                    subject=result.get("subject", f"Complaint Regarding {sector} Issue"),
                    body=result.get("body", ""),
                    suggestedDepartment=result.get("suggestedDepartment", result.get("suggested_department", f"Department of {sector}")),
                    officialPortal=result.get("officialPortal", result.get("official_portal", "https://pgportal.gov.in/")),
                    trackingTips=result.get("trackingTips", result.get("tracking_tips", [])),
                    estimatedResolutionTime=result.get("estimatedResolutionTime", result.get("estimated_resolution_time", "15-30 days"))
                )
            except Exception:
                pass
    
    # Fallback: Template-based complaint
    return _generate_template_complaint(sector, description)


def _generate_template_complaint(sector: str, description: str) -> ComplaintResponse:
    """Generate template-based complaint letter."""
    
    subject = f"Formal Complaint Regarding {sector} Service Issue"
    
    body = f"""Respected Sir/Madam,

I am writing to bring to your immediate attention a serious issue regarding {sector.lower()} services that requires urgent intervention.

{description}

Despite my best efforts to resolve this matter through regular channels, the issue remains unresolved. This has caused significant inconvenience and hardship.

I kindly request you to:
1. Look into this matter on priority basis
2. Take appropriate corrective action
3. Inform me about the steps being taken to resolve this issue

I have attached relevant supporting documents for your reference. I trust that you will give this matter your prompt attention and ensure a satisfactory resolution.

Thank you for your time and consideration.

Yours faithfully,
[Your Name]
[Your Address]
[Contact Number]
[Email Address]
[Date]

Attachments:
- [List any supporting documents]"""

    # Department suggestions based on sector
    department_map = {
        "electricity": "State Electricity Regulatory Commission / Power Distribution Company",
        "water": "Municipal Water Supply Department",
        "transport": "Regional Transport Office",
        "education": "Department of Education",
        "health": "Department of Health and Family Welfare",
        "police": "Police Commissioner's Office / SP Office",
        "municipal": "Municipal Corporation",
        "banking": "Banking Ombudsman / RBI",
        "telecom": "Telecom Regulatory Authority of India (TRAI)",
        "pension": "Department of Pension and Pensioners' Welfare"
    }
    
    suggested_dept = department_map.get(sector.lower(), f"Department of {sector}")
    
    return ComplaintResponse(
        subject=subject,
        body=body,
        suggestedDepartment=suggested_dept,
        officialPortal="https://pgportal.gov.in/",
        trackingTips=[
            "Save your complaint reference number for future tracking",
            "Take a screenshot or printout of the submitted complaint",
            "Check status regularly on the grievance portal",
            "Follow up after 7 working days if no response received",
            "You can escalate to higher authorities if not resolved within 30 days"
        ],
        estimatedResolutionTime="15-30 days"
    )
