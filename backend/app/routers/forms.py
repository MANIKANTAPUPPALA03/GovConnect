"""
Forms Router - Form Analysis & Guidance

GET /api/forms - List available forms
GET /api/forms/{form_id} - Get form details
GET /api/forms/{form_id}/download - Download form PDF
POST /api/forms/upload - Upload and analyze custom form
POST /api/forms/{form_id}/analyze - Analyze pre-configured form
"""
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from typing import Optional

from app.models.schemas import FormsListResponse, FormAnalysisResponse, Form as FormModel
from app.ai.form_analyzer import analyze_form, analyze_with_extracted_fields
from app.ai.document_analyzer import get_document_analyzer

router = APIRouter()

# Path to forms data and PDF files
DATA_PATH = Path(__file__).parent.parent / "data" / "forms.json"
FORMS_DIR = Path(__file__).parent.parent.parent / "application"


def load_forms() -> list[dict]:
    """Load forms from JSON file."""
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("", response_model=FormsListResponse)
async def list_forms():
    """List all available government forms."""
    forms_data = load_forms()
    forms = [
        FormModel(
            id=f["id"],
            name=f["name"],
            description=f["description"],
            category=f["category"],
            processingTime=f["processingTime"]
        )
        for f in forms_data
    ]
    return FormsListResponse(forms=forms)


@router.get("/categories")
async def get_categories():
    """Get all form categories."""
    forms_data = load_forms()
    categories = list(set(f["category"] for f in forms_data))
    return {"categories": sorted(categories)}


@router.get("/{form_id}")
async def get_form_details(form_id: str):
    """Get details for a specific form."""
    forms_data = load_forms()
    form = next((f for f in forms_data if f["id"] == form_id), None)
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    return form


@router.get("/{form_id}/download")
async def download_form(form_id: str, inline: bool = True):
    """Download the PDF file for a specific form."""
    forms_data = load_forms()
    form = next((f for f in forms_data if f["id"] == form_id), None)
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    if "file" not in form:
        raise HTTPException(status_code=404, detail="Form file not available")
    
    # Check directory
    file_path = FORMS_DIR / form["file"]
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Form file not found on disk")
    
    return FileResponse(
        path=str(file_path),
        filename=form["file"],
        media_type="application/pdf",
        content_disposition_type="inline" if inline else "attachment"
    )


@router.post("/upload")
async def upload_and_analyze_form(
    file: UploadFile = File(..., description="PDF or image of the form"),
    purpose: str = Form(..., description="Purpose for filling this form"),
    language: str = Form("en", description="Language for guidance")
):
    """
    Upload a form and get AI-powered filling guidance.
    
    1. Extracts text using document analyzer (Google or local)
    2. Generates filling guidance using Groq AI
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    # Validate file type
    allowed_types = [".pdf", ".jpg", ".jpeg", ".png"]
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Read file content
    file_bytes = await file.read()
    
    # Analyze with document analyzer
    doc_analyzer = get_document_analyzer()
    doc_result = await doc_analyzer.analyze_document(file_bytes)
    
    if not doc_result.get("success"):
        # Fallback: use filename as hint for template-based guidance
        form_type = Path(file.filename).stem.replace("_", " ").replace("-", " ")
        result = await analyze_form(form_type=form_type, purpose=purpose)
        return {
            "analysis_method": "template",
            "form_type": form_type,
            "guidance": result.model_dump(),
            "extracted_fields": []
        }
    
    # Get AI guidance based on extracted fields
    guidance = await analyze_with_extracted_fields(
        extracted_fields=doc_result.get("fields", []),
        paragraphs=doc_result.get("paragraphs", []),
        purpose=purpose
    )
    
    return {
        "analysis_method": "document_intelligence",
        "page_count": doc_result.get("page_count", 0),
        "extracted_fields": doc_result.get("fields", []),
        "tables": doc_result.get("tables", []),
        "guidance": guidance.model_dump(by_alias=True)
    }


@router.post("/{form_id}/analyze")
async def analyze_preconfigured_form(
    form_id: str,
    purpose: str = Form(..., description="Purpose for filling this form"),
    language: str = Form("en", description="Language for guidance")
):
    """
    Analyze a pre-configured form and get AI-powered filling guidance.
    """
    forms_data = load_forms()
    form = next((f for f in forms_data if f["id"] == form_id), None)
    
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    
    # Check if we have the PDF file
    file_path = FORMS_DIR / form.get("file", "")
    
    if file_path.exists():
        # Read and analyze with Document Intelligence
        with open(file_path, "rb") as f:
            file_bytes = f.read()
        
        doc_analyzer = get_document_analyzer()
        doc_result = await doc_analyzer.analyze_document(file_bytes)
        
        if doc_result.get("success"):
            guidance = await analyze_with_extracted_fields(
                extracted_fields=doc_result.get("fields", []),
                paragraphs=doc_result.get("paragraphs", []),
                purpose=purpose
            )
            
            return {
                "form": form,
                "analysis_method": "document_intelligence",
                "extracted_fields": doc_result.get("fields", []),
                "guidance": guidance.model_dump(by_alias=True)
            }
    
    # Fallback to template-based guidance
    result = await analyze_form(form_type=form["name"], purpose=purpose)
    return {
        "form": form,
        "analysis_method": "template",
        "guidance": result.model_dump(by_alias=True)
    }
