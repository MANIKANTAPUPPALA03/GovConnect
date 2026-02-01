"""
Process Tracker using AI

Generates step-by-step process explanations.
For user understanding, not live tracking.
"""
from typing import Optional

from app.ai.base import get_ai_client
from app.utils.prompts import PROCESS_TRACKER_PROMPT, get_fallback_response
from app.models.schemas import ProcessTrackResponse, ProcessStep


async def track_process(
    process_type: str,
    details: Optional[str] = None
) -> ProcessTrackResponse:
    """
    Generate step-by-step process explanation.
    
    Note: This is for user understanding, not real-time tracking.
    Steps are generic and explanatory.
    """
    ai_client = get_ai_client()
    
    if ai_client.is_configured:
        prompt = PROCESS_TRACKER_PROMPT.format(
            process_type=process_type,
            details=details or "Standard application"
        )
        
        result = await ai_client.generate(prompt)
        
        if result:
            try:
                steps = [
                    ProcessStep(
                        step_number=s.get("step_number", i+1),
                        title=s.get("title", ""),
                        description=s.get("description", ""),
                        estimated_time=s.get("estimated_time"),
                        documents_needed=s.get("documents_needed", [])
                    )
                    for i, s in enumerate(result.get("steps", []))
                ]
                
                return ProcessTrackResponse(
                    process_name=result.get("process_name", process_type),
                    steps=steps,
                    estimated_total_time=result.get("estimated_total_time", "Varies"),
                    tips=result.get("tips", [])
                )
            except Exception:
                pass
    
    # Fallback: Template-based process
    return _get_template_process(process_type)


def _get_template_process(process_type: str) -> ProcessTrackResponse:
    """Provide template-based process steps."""
    
    process_lower = process_type.lower()
    
    # Process templates
    templates = {
        "income certificate": {
            "process_name": "Income Certificate Application",
            "steps": [
                {"step_number": 1, "title": "Gather Required Documents", "description": "Collect all necessary documents including Aadhaar card, ration card, salary slips or income proof, and passport photos.", "estimated_time": "1-2 days", "documents_needed": ["Aadhaar Card", "Ration Card", "Income Proof"]},
                {"step_number": 2, "title": "Fill Application Form", "description": "Download and fill the income certificate application form from the state e-district portal or collect from Tehsil office.", "estimated_time": "30 minutes", "documents_needed": ["Application Form"]},
                {"step_number": 3, "title": "Submit Application", "description": "Submit the application along with all documents at the Tehsildar office or through e-district portal.", "estimated_time": "1-2 hours", "documents_needed": []},
                {"step_number": 4, "title": "Verification", "description": "Revenue department official may conduct field verification of your income sources.", "estimated_time": "3-7 days", "documents_needed": []},
                {"step_number": 5, "title": "Collect Certificate", "description": "Collect the income certificate from the Tehsil office or download from portal after approval.", "estimated_time": "Same day", "documents_needed": ["Application receipt"]},
            ],
            "estimated_total_time": "7-15 working days",
            "tips": [
                "Apply online through e-district portal for faster processing",
                "Keep photocopies of all submitted documents",
                "Ensure income declared matches with ITR if filed",
                "Certificate is typically valid for 6 months to 1 year"
            ]
        },
        "passport": {
            "process_name": "Passport Application",
            "steps": [
                {"step_number": 1, "title": "Register on Passport Seva Portal", "description": "Create an account on passportindia.gov.in if not already registered.", "estimated_time": "15 minutes", "documents_needed": []},
                {"step_number": 2, "title": "Fill Online Application", "description": "Fill the passport application form online and save the Application Reference Number (ARN).", "estimated_time": "30-45 minutes", "documents_needed": []},
                {"step_number": 3, "title": "Pay Fee and Schedule Appointment", "description": "Pay the applicable fee and book an appointment at the nearest Passport Seva Kendra.", "estimated_time": "15 minutes", "documents_needed": []},
                {"step_number": 4, "title": "Visit PSK", "description": "Visit Passport Seva Kendra on appointment date with all original documents and self-attested photocopies.", "estimated_time": "2-3 hours", "documents_needed": ["Aadhaar Card", "Birth Certificate", "Address Proof", "Photographs"]},
                {"step_number": 5, "title": "Police Verification", "description": "Police verification will be conducted at your residential address (may happen before or after PSK visit).", "estimated_time": "7-14 days", "documents_needed": []},
                {"step_number": 6, "title": "Passport Dispatch", "description": "After all verifications, passport will be printed and dispatched via Speed Post.", "estimated_time": "7-10 days", "documents_needed": []},
            ],
            "estimated_total_time": "15-45 days (Normal) / 7-15 days (Tatkaal)",
            "tips": [
                "Ensure all documents are self-attested",
                "Reach PSK 15 minutes before appointment",
                "Keep Aadhaar linked to correct address for faster verification",
                "Track status using Application Reference Number"
            ]
        },
        "default": {
            "process_name": process_type,
            "steps": [
                {"step_number": 1, "title": "Gather Requirements", "description": "Identify and collect all required documents for your application.", "estimated_time": "1-2 days", "documents_needed": ["Identity Proof", "Address Proof"]},
                {"step_number": 2, "title": "Fill Application", "description": "Complete the application form either online or offline as applicable.", "estimated_time": "30-60 minutes", "documents_needed": []},
                {"step_number": 3, "title": "Submit Application", "description": "Submit the application along with supporting documents to the concerned department.", "estimated_time": "1-2 hours", "documents_needed": []},
                {"step_number": 4, "title": "Processing", "description": "Wait for the department to process your application. Keep track of application status.", "estimated_time": "Varies", "documents_needed": []},
                {"step_number": 5, "title": "Receive Output", "description": "Collect the certificate/document once processing is complete.", "estimated_time": "1 day", "documents_needed": ["Application receipt"]},
            ],
            "estimated_total_time": "Varies by service",
            "tips": [
                "Keep copies of all submitted documents",
                "Note down application/reference number",
                "Check official website for accurate processing times"
            ]
        }
    }
    
    # Match process to template
    template = templates.get("default")
    for key in templates:
        if key in process_lower:
            template = templates[key]
            break
    
    steps = [ProcessStep(**s) for s in template["steps"]]
    
    return ProcessTrackResponse(
        process_name=template["process_name"],
        steps=steps,
        estimated_total_time=template["estimated_total_time"],
        tips=template["tips"]
    )
