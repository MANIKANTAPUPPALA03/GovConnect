"""
Form Analyzer using AI

Analyzes forms and provides field-by-field guidance using Azure OpenAI.
"""
from typing import Optional, List

from app.ai.base import get_ai_client
from app.utils.prompts import FORM_ANALYSIS_PROMPT, get_fallback_response
from app.models.schemas import FormAnalysisResponse, FormField


async def analyze_form(
    form_type: Optional[str] = None,
    purpose: str = ""
) -> FormAnalysisResponse:
    """
    Analyze a form and provide filling guidance.
    
    Uses Azure OpenAI for context-aware guidance based on form type and purpose.
    """
    ai_client = get_ai_client()
    
    if ai_client.is_configured and purpose:
        prompt = FORM_ANALYSIS_PROMPT.format(
            form_type=form_type or "Unknown Form",
            purpose=purpose
        ) + "\n\nIMPORTANT: Please provide at least 8 distinct fields to fill, ensuring a comprehensive guide."
        
        result = await ai_client.generate(prompt)
        
        if result:
            try:
                fields = [
                    FormField(
                        fieldName=f.get("fieldName", f.get("field_name", "")),
                        instruction=f.get("instruction", ""),
                        example=f.get("example")
                    )
                    for f in result.get("fieldsToFill", result.get("fields_to_fill", []))
                ]
                
                return FormAnalysisResponse(
                    formType=result.get("formType", result.get("form_type", form_type or "Unknown")),
                    fieldsToFill=fields,
                    requiredDocuments=result.get("requiredDocuments", result.get("required_documents", [])),
                    warnings=result.get("warnings", [])
                )
            except Exception:
                pass
    
    # Fallback: Provide generic guidance based on form type
    return _get_template_guidance(form_type, purpose)


async def analyze_with_extracted_fields(
    extracted_fields: List[dict],
    paragraphs: List[str],
    purpose: str
) -> FormAnalysisResponse:
    """
    Generate AI guidance based on fields extracted by Document Intelligence.
    
    Args:
        extracted_fields: Fields extracted by Azure Document Intelligence
        paragraphs: Text paragraphs from the document
        purpose: User's purpose for filling the form
    """
    ai_client = get_ai_client()
    
    if not ai_client.is_configured:
        return FormAnalysisResponse(
            formType="Uploaded Form",
            fieldsToFill=[
                FormField(fieldName=f["name"], instruction="Fill this field appropriately", example=f.get("value", ""))
                for f in extracted_fields[:10]
            ],
            requiredDocuments=["Identity Proof", "Address Proof"],
            warnings=["AI guidance not available. Please fill fields carefully."]
        )
    
    # Build context from extracted data
    fields_text = "\n".join([f"- {f['name']}: {f.get('value', '(empty)')}" for f in extracted_fields[:20]])
    context_text = "\n".join(paragraphs[:5]) if paragraphs else "No additional context"
    
    prompt = f"""You are a government form filling assistant. Analyze the following form fields extracted from a document and provide guidance for filling them.

USER'S PURPOSE: {purpose}

EXTRACTED FIELDS FROM FORM:
{fields_text}

DOCUMENT CONTEXT:
{context_text}

Provide guidance in JSON format:
{{
    "formType": "detected form type",
    "fieldsToFill": [
        {{
            "fieldName": "field name",
            "instruction": "how to fill this field",
            "example": "example value"
        }}
    ],
    "requiredDocuments": ["list of documents needed"],
    "warnings": ["important things to note"]
}}

IMPORTANT:
1. Identify at least 8-10 fields that the user needs to fill. This is critical.
2. If the extracted fields are few, infer standard fields required for this type of form (e.g., Applicant Name, Address, Date, Signature, Aadhar No, Mobile No).
3. Provide clear, actionable instructions for each field.
4. Ensure the guidance is specific to the user's purpose: "{purpose}".
"""

    result = await ai_client.generate(prompt)
    
    if result:
        try:
            fields = [
                FormField(
                    fieldName=f.get("fieldName", f.get("field_name", "")),
                    instruction=f.get("instruction", ""),
                    example=f.get("example")
                )
                for f in result.get("fieldsToFill", result.get("fields_to_fill", []))
            ]
            
            return FormAnalysisResponse(
                formType=result.get("formType", result.get("form_type", "Uploaded Form")),
                fieldsToFill=fields,
                requiredDocuments=result.get("requiredDocuments", result.get("required_documents", [])),
                warnings=result.get("warnings", [])
            )
        except Exception as e:
            print(f"[Form Analyzer] Error parsing AI response: {e}")
    
    # Fallback response
    return FormAnalysisResponse(
        formType="Uploaded Form",
        fieldsToFill=[
            FormField(fieldName=f["name"], instruction="Fill this field based on your documents", example=f.get("value", ""))
            for f in extracted_fields[:10]
        ],
        requiredDocuments=["Identity Proof", "Address Proof"],
        warnings=["Could not generate detailed guidance. Please fill fields carefully."]
    )


def _get_template_guidance(form_type: Optional[str], purpose: str) -> FormAnalysisResponse:
    """Provide template-based form guidance for common form types."""
    
    templates = {
        "income-certificate": {
            "formType": "Income Certificate Application",
            "fieldsToFill": [
                {"fieldName": "Applicant Name", "instruction": "Enter full name as per Aadhaar card", "example": "Rajesh Kumar"},
                {"fieldName": "Father's Name", "instruction": "Enter father's full name", "example": "Suresh Kumar"},
                {"fieldName": "Address", "instruction": "Enter complete residential address with PIN code", "example": "123 Main Street, Delhi 110001"},
                {"fieldName": "Annual Income", "instruction": "Enter total family income from all sources", "example": "₹2,50,000"},
                {"fieldName": "Source of Income", "instruction": "Mention primary income source", "example": "Agriculture/Salary/Business"},
            ],
            "requiredDocuments": ["Aadhaar Card", "Ration Card", "Salary Slip or Income Proof", "Passport Size Photographs"],
            "warnings": ["Income declared must match with ITR if filed", "Certificate validity is typically 6 months to 1 year"]
        },
        "caste-certificate": {
            "formType": "Caste Certificate Application",
            "fieldsToFill": [
                {"fieldName": "Applicant Name", "instruction": "Enter full name as per school records", "example": "Priya Sharma"},
                {"fieldName": "Caste", "instruction": "Enter your caste/community name", "example": "As per official list"},
                {"fieldName": "Address", "instruction": "Enter permanent residential address", "example": "Village/Town, District, State"},
            ],
            "requiredDocuments": ["Aadhaar Card", "Father's Caste Certificate (if available)", "School Leaving Certificate", "Ration Card"],
            "warnings": ["Self-declaration may require affidavit", "Verification may take 15-30 days"]
        },
        "birth-certificate": {
            "formType": "Birth Certificate Application",
            "fieldsToFill": [
                {"fieldName": "Child's Name", "instruction": "Enter the name to be recorded", "example": "Baby's Full Name"},
                {"fieldName": "Date of Birth", "instruction": "Enter in DD/MM/YYYY format", "example": "15/08/2024"},
                {"fieldName": "Place of Birth", "instruction": "Hospital name or home address", "example": "Gandhi Hospital, Hyderabad"},
                {"fieldName": "Father's Name", "instruction": "Enter father's full name", "example": "Father's Full Name"},
                {"fieldName": "Mother's Name", "instruction": "Enter mother's full name", "example": "Mother's Full Name"},
            ],
            "requiredDocuments": ["Hospital Discharge Summary", "Parents' Aadhaar Cards", "Marriage Certificate"],
            "warnings": ["Must be registered within 21 days of birth for free", "Late registration may require affidavit"]
        },
        "default": {
            "formType": form_type or "Government Form",
            "fieldsToFill": [
                {"fieldName": "Full Name", "instruction": "Enter name as per government ID", "example": "John Doe"},
                {"fieldName": "Date of Birth", "instruction": "Enter in DD/MM/YYYY format", "example": "15/08/1990"},
                {"fieldName": "Address", "instruction": "Enter complete address with PIN code", "example": "Address, City, State - PIN"},
            ],
            "requiredDocuments": ["Identity Proof (Aadhaar/PAN/Voter ID)", "Address Proof", "Passport Size Photographs"],
            "warnings": ["Ensure all documents are self-attested", "Check official website for latest form version"]
        }
    }
    
    # Get template or default
    form_key = form_type.lower().replace(" ", "-") if form_type else "default"
    # Try to find a matching template
    template = templates.get(form_key)
    if not template:
        # Try partial match
        for key in templates.keys():
            if key in form_key or form_key in key:
                template = templates[key]
                break
    if not template:
        template = templates["default"]
    
    return FormAnalysisResponse(
        formType=template["formType"],
        fieldsToFill=[FormField(**f) for f in template["fieldsToFill"]],
        requiredDocuments=template["requiredDocuments"],
        warnings=template["warnings"]
    )
