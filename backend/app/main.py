"""
GovConnect Backend - FastAPI Application Entry Point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import intent, schemes, forms, process, locator, life_events, complaints, translate

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-powered government services assistant API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(intent.router, prefix="/api", tags=["Intent"])
app.include_router(schemes.router, prefix="/api/schemes", tags=["Schemes"])
app.include_router(forms.router, prefix="/api/forms", tags=["Forms"])
app.include_router(process.router, prefix="/api/process", tags=["Process Tracker"])
app.include_router(locator.router, prefix="/api/locator", tags=["Service Locator"])
app.include_router(life_events.router, prefix="/api/life-events", tags=["Life Events"])
app.include_router(complaints.router, prefix="/api/complaints", tags=["Complaints"])
app.include_router(translate.router, tags=["Translation"])


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "debug_info": "v2-cors-fix"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "services": {
            "api": "operational",
            "ai": "operational" if settings.azure_openai_api_key else "not_configured",
        }
    }
