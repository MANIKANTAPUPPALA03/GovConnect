"""
Google Document AI Integration for GovConnect

Primary OCR service with high-quality text extraction.
Only Google results are cached permanently.
"""
from typing import Optional, Tuple
from app.config import get_settings


# Google Document AI SDK may not be installed (optional dependency)
try:
    from google.cloud import documentai_v1 as documentai
    from google.api_core.client_options import ClientOptions
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False
    print("[Google OCR] google-cloud-documentai not installed, Google OCR disabled")


class GoogleDocumentAI:
    """Client for Google Document AI."""
    
    def __init__(self):
        self.settings = get_settings()
        self.client = None
        self.processor_name = None
        
        # Only initialize if configured
        if self._is_configured():
            try:
                self._initialize_client()
            except Exception as e:
                print(f"[Google OCR] Initialization failed: {e}")
    
    def _is_configured(self) -> bool:
        """Check if Google Document AI is configured."""
        if not GOOGLE_AVAILABLE:
            return False
        
        return bool(
            self.settings.google_project_id and
            self.settings.google_location and
            self.settings.google_processor_id
        )
    
    def _initialize_client(self):
        """Initialize Google Document AI client."""
        opts = ClientOptions(
            api_endpoint=f"{self.settings.google_location}-documentai.googleapis.com"
        )
        
        self.client = documentai.DocumentProcessorServiceClient(client_options=opts)
        
        self.processor_name = self.client.processor_path(
            self.settings.google_project_id,
            self.settings.google_location,
            self.settings.google_processor_id
        )
        
        print(f"[Google OCR] Initialized for project {self.settings.google_project_id}")
    
    @property
    def is_configured(self) -> bool:
        """Check if client is ready."""
        return self.client is not None and self.processor_name is not None


async def extract_text_from_document(file_bytes: bytes) -> Tuple[str, bool]:
    """
    Extract text using Google Document AI.
    
    Args:
        file_bytes: Document content as bytes
        
    Returns:
        Tuple of (extracted_text, success_flag)
        - If successful: (text, True)
        - If failed: ("", False)
    """
    google_ai = GoogleDocumentAI()
    
    if not google_ai.is_configured:
        print("[Google OCR] Not configured, cannot extract")
        return "", False
    
    try:
        # Prepare request
        raw_document = documentai.RawDocument(
            content=file_bytes,
            mime_type="application/pdf"
        )
        
        request = documentai.ProcessRequest(
            name=google_ai.processor_name,
            raw_document=raw_document
        )
        
        # Process document
        print("[Google OCR] Sending document to Google Document AI")
        result = google_ai.client.process_document(request=request)
        
        # Extract text
        text = result.document.text
        
        if text and len(text.strip()) > 10:
            print(f"[Google OCR] Successfully extracted {len(text)} chars")
            return text, True
        else:
            print("[Google OCR] No meaningful text extracted")
            return "", False
    
    except Exception as e:
        print(f"[Google OCR] Extraction failed: {e}")
        return "", False


# Global instance (lazy initialization)
_google_ai: Optional[GoogleDocumentAI] = None


def get_google_ai() -> GoogleDocumentAI:
    """Get or create Google Document AI instance."""
    global _google_ai
    if _google_ai is None:
        _google_ai = GoogleDocumentAI()
    return _google_ai
