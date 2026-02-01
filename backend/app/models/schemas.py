"""
Pydantic models for API request/response schemas.
All AI responses must conform to these schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


# ============ Intent Classification ============

class IntentType(str, Enum):
    """Possible intent types from user input."""
    SCHEME = "scheme"
    FORM = "form"
    PROCESS = "process"
    COMPLAINT = "complaint"
    SERVICE_LOCATOR = "service_locator"
    LIFE_EVENT = "life_event"


class IntentRequest(BaseModel):
    """Request for intent classification."""
    text: str = Field(..., description="User's natural language input", min_length=1)


class IntentResponse(BaseModel):
    """Response from intent classification."""
    intent: IntentType
    entities: dict = Field(default_factory=dict, description="Extracted entities from input")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


# ============ Schemes ============

class SchemeSearchRequest(BaseModel):
    """Request for searching schemes."""
    query: Optional[str] = None
    category: Optional[str] = None
    occupation: Optional[str] = None
    income: Optional[int] = None
    age: Optional[int] = None
    state: Optional[str] = None
    language: str = "en"  # Language code: en, te, hi, etc.


class Scheme(BaseModel):
    """Individual scheme data."""
    id: str
    name: str
    category: str
    description: str
    benefit: str
    eligibility: list[str] = Field(default_factory=list)
    documents: list[str] = Field(default_factory=list)
    relevance_reason: Optional[str] = None


class SchemeSearchResponse(BaseModel):
    """Response containing list of schemes."""
    schemes: list[Scheme]
    total: int = 0


class EligibilityRequest(BaseModel):
    """Request for checking scheme eligibility."""
    scheme_id: str = Field(..., alias="schemeId")
    age: Optional[int] = None
    income: Optional[int] = None
    category: Optional[str] = None
    state: Optional[str] = None
    occupation: Optional[str] = None
    language: str = "en"  # Language code: en, te, hi, etc.
    
    class Config:
        populate_by_name = True


class EligibilityResponse(BaseModel):
    """Response with eligibility determination."""
    eligible: bool
    confidence: int = Field(ge=0, le=100)
    explanation: str = Field(..., description="Human-readable explanation of eligibility (formerly reason)")
    missing_requirements: Optional[list[str]] = Field(default_factory=list, description="Criteria not yet verified or missing")
    warnings: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)


# ============ Forms ============

class Form(BaseModel):
    """Individual form data."""
    id: str
    name: str
    description: str
    category: str
    processing_time: str = Field(alias="processingTime")
    
    class Config:
        populate_by_name = True


class FormsListResponse(BaseModel):
    """Response containing list of forms."""
    forms: list[Form]


class FormField(BaseModel):
    """Individual form field guidance."""
    field_name: str = Field(alias="fieldName")
    instruction: str
    example: Optional[str] = None
    
    class Config:
        populate_by_name = True


class FormAnalysisResponse(BaseModel):
    """Response from form analysis."""
    form_type: str = Field(alias="formType")
    fields_to_fill: list[FormField] = Field(alias="fieldsToFill")
    required_documents: list[str] = Field(alias="requiredDocuments")
    warnings: list[str] = Field(default_factory=list)
    
    class Config:
        populate_by_name = True


# ============ Process Tracker ============

class ProcessStep(BaseModel):
    """Individual step in a process."""
    step_number: int
    title: str
    description: str
    estimated_time: Optional[str] = None
    documents_needed: list[str] = Field(default_factory=list)


class ProcessTrackRequest(BaseModel):
    """Request for process tracking."""
    process_type: str = Field(alias="processType")
    details: Optional[str] = None
    
    class Config:
        populate_by_name = True


class ProcessTrackResponse(BaseModel):
    """Response with process steps."""
    process_name: str
    steps: list[ProcessStep]
    estimated_total_time: str
    tips: list[str] = Field(default_factory=list)


# ============ Service Locator ============

class ServiceCenter(BaseModel):
    """Individual service center."""
    name: str
    type: str
    address: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance: Optional[float] = Field(default=None, description="Distance in km from search location")
    phone: Optional[str] = None
    timings: Optional[str] = None
    services: list[str] = Field(default_factory=list)


class ServiceLocatorResponse(BaseModel):
    """Response with nearby services."""
    services: list[ServiceCenter]
    total: int = 0


# ============ Life Events ============

class LifeEventRequest(BaseModel):
    """Request for life event assistance."""
    event: str
    details: Optional[str] = None


class ChecklistItem(BaseModel):
    """Individual checklist item."""
    title: str
    description: str
    priority: str = Field(default="medium")  # high, medium, low
    category: str  # scheme, form, document, action
    link: Optional[str] = None


class LifeEventResponse(BaseModel):
    """Response with life event guidance."""
    event_name: str
    summary: str
    checklist: list[ChecklistItem]
    timeline: list[dict] = Field(default_factory=list)
    related_schemes: list[str] = Field(default_factory=list)
    required_documents: list[str] = Field(default_factory=list)


# ============ Complaints ============

class ComplaintRequest(BaseModel):
    """Request for complaint generation."""
    sector: str
    description: str
    attachments: Optional[list[str]] = None


class ComplaintResponse(BaseModel):
    """Response with generated complaint."""
    subject: str
    body: str
    suggested_department: str = Field(alias="suggestedDepartment")
    official_portal: Optional[str] = Field(default=None, alias="officialPortal")
    tracking_tips: list[str] = Field(default_factory=list, alias="trackingTips")
    estimated_resolution_time: Optional[str] = Field(default=None, alias="estimatedResolutionTime")
    
    class Config:
        populate_by_name = True
