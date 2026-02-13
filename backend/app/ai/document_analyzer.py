"""
Smart Document Analyzer for GovConnect

ORCHESTRATES:
1. Cache lookup (for prebuilt documents)
2. Google Document AI (primary OCR)
3. Local fallback (pdfplumber/PyPDF2)

CRITICAL CACHING RULE:
- ONLY Google Document AI results are cached
- Local fallback results are NEVER cached
"""
from typing import Optional
from pathlib import Path

from app.ai.ocr_cache_manager import (
    get_cached_ocr,
    save_cached_ocr,
    get_document_id
)
from app.ai.google_document_ai import extract_text_from_document
from app.ai.local_ocr_fallback import extract_text_locally


class DocumentAnalyzer:
    """Smart document analyzer with caching and fallback."""
    
    def __init__(self):
        pass
    
    @property
    def is_configured(self) -> bool:
        """
        Document analyzer is ALWAYS configured (uses fallback).
        This maintains backward compatibility with existing code.
        """
        return True
    
    async def analyze_document(
        self, 
        file_bytes: bytes, 
        file_type: str = "application/pdf",
        is_prebuilt: bool = False,
        file_path: Optional[str] = None
    ) -> dict:
        """
        Analyze a document and extract text.
        
        FLOW FOR PREBUILT DOCUMENTS:
        1. Check cache first
        2. Try Google OCR (cache result)
        3. Fallback to local (NO caching)
        
        FLOW FOR UPLOADS:
        1. Try Google OCR (no permanent caching)
        2. Fallback to local
        
        Args:
            file_bytes: Document content
            file_type: MIME type (currently only PDF supported)
            is_prebuilt: Whether this is a prebuilt document (cacheable)
            file_path: Path to prebuilt document (for cache ID)
            
        Returns:
            Dictionary with extracted text and metadata
        """
        # For prebuilt documents, try cache first
        if is_prebuilt and file_path:
            document_id = get_document_id(file_path)
            
            # Check cache
            cached_text = get_cached_ocr(document_id)
            if cached_text:
                print(f"[Document Analyzer] Using cached text for {file_path}")
                return {
                    "success": True,
                    "text": cached_text,
                    "source": "cache",
                    "page_count": len(cached_text.split('\n\n'))  # Rough estimate
                }
        
        # Try Google Document AI
        google_text, google_success = await extract_text_from_document(file_bytes)
        
        if google_success and google_text:
            print("[Document Analyzer] Google OCR successful")
            
            # Cache ONLY if prebuilt document
            if is_prebuilt and file_path:
                document_id = get_document_id(file_path)
                save_cached_ocr(document_id, google_text, source="google")
            
            return {
                "success": True,
                "text": google_text,
                "source": "google",
                "page_count": len(google_text.split('\n\n'))
            }
        
        # Fallback to local extraction
        print("[Document Analyzer] Falling back to local OCR")
        local_text = await extract_text_locally(file_bytes)
        
        # CRITICAL: NEVER cache local results
        # Even for prebuilt documents, local results are too low quality
        
        if local_text:
            print(f"[Document Analyzer] Local OCR extracted {len(local_text)} chars")
            return {
                "success": True,
                "text": local_text,
                "source": "local",
                "warning": "Low confidence extraction - Google Document AI recommended",
                "page_count": len(local_text.split('\n\n'))
            }
        
        # No text extracted
        print("[Document Analyzer] No text could be extracted")
        return {
            "success": False,
            "text": "",
            "source": "none",
            "error": "Unable to extract text from document",
            "page_count": 0
        }
    
    async def analyze_document_legacy(self, file_bytes: bytes) -> dict:
        """
        Legacy interface for backward compatibility.
        
        This maintains compatibility with existing code that used
        the old document intelligence interface.
        """
        result = await self.analyze_document(file_bytes)
        
        # Transform to legacy format
        return {
            "success": result["success"],
            "fields": [],  # Legacy format had field extraction
            "paragraphs": [result["text"]] if result["text"] else [],
            "tables": [],
            "page_count": result.get("page_count", 0)
        }


# Global instance
_doc_analyzer: Optional[DocumentAnalyzer] = None


def get_document_analyzer() -> DocumentAnalyzer:
    """Get or create Document Analyzer instance."""
    global _doc_analyzer
    if _doc_analyzer is None:
        _doc_analyzer = DocumentAnalyzer()
    return _doc_analyzer
