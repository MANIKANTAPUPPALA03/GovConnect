"""
OCR Cache Manager for GovConnect

CRITICAL RULE: Only Google Document AI results are cached.
Local fallback results must NEVER be cached.
"""
import json
import os
from datetime import datetime
from pathlib import Path
from typing import Optional
import hashlib


# Cache directory
CACHE_DIR = Path(__file__).parent.parent / "data" / "ocr_cache"


def _ensure_cache_dir():
    """Create cache directory if it doesn't exist."""
    CACHE_DIR.mkdir(parents=True, exist_ok=True)


def _get_cache_path(document_id: str) -> Path:
    """Get path to cache file for a document."""
    return CACHE_DIR / f"{document_id}.json"


def get_document_id(file_path: str) -> str:
    """
    Generate stable document ID from file path.
    
    For prebuilt documents, this ensures consistent caching.
    """
    # Use filename as stable ID for prebuilt docs
    filename = Path(file_path).name
    return hashlib.md5(filename.encode()).hexdigest()


def get_cached_ocr(document_id: str) -> Optional[str]:
    """
    Retrieve cached OCR text if available.
    
    Args:
        document_id: Unique document identifier
        
    Returns:
        Extracted text if cached, None otherwise
    """
    try:
        cache_path = _get_cache_path(document_id)
        
        if not cache_path.exists():
            return None
        
        with open(cache_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Validate cache structure
        if not isinstance(data, dict) or 'extracted_text' not in data:
            print(f"[OCR Cache] Invalid cache format for {document_id}, ignoring")
            return None
        
        # Only return cached results from Google
        if data.get('source') != 'google':
            print(f"[OCR Cache] Cache source is not 'google', ignoring")
            return None
        
        print(f"[OCR Cache] Cache hit for {document_id}")
        return data['extracted_text']
    
    except Exception as e:
        print(f"[OCR Cache] Error reading cache for {document_id}: {e}")
        return None


def save_cached_ocr(document_id: str, text: str, source: str) -> bool:
    """
    Save OCR text to cache.
    
    CRITICAL: Only saves when source == "google"
    
    Args:
        document_id: Unique document identifier
        text: Extracted text
        source: Source of extraction ("google" or "local")
        
    Returns:
        True if saved, False otherwise
    """
    # CRITICAL ENFORCEMENT: Only cache Google results
    if source != "google":
        print(f"[OCR Cache] Skipping cache save - source is '{source}', not 'google'")
        return False
    
    try:
        _ensure_cache_dir()
        
        cache_data = {
            "document_id": document_id,
            "extracted_text": text,
            "cached_at": datetime.utcnow().isoformat(),
            "source": source
        }
        
        cache_path = _get_cache_path(document_id)
        
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)
        
        print(f"[OCR Cache] Saved cache for {document_id} (source: {source})")
        return True
    
    except Exception as e:
        print(f"[OCR Cache] Error saving cache for {document_id}: {e}")
        return False


def clear_cache(document_id: Optional[str] = None):
    """
    Clear cached OCR data.
    
    Args:
        document_id: If provided, clear specific document. Otherwise clear all.
    """
    try:
        if document_id:
            cache_path = _get_cache_path(document_id)
            if cache_path.exists():
                cache_path.unlink()
                print(f"[OCR Cache] Cleared cache for {document_id}")
        else:
            if CACHE_DIR.exists():
                for cache_file in CACHE_DIR.glob("*.json"):
                    cache_file.unlink()
                print("[OCR Cache] Cleared all cache")
    
    except Exception as e:
        print(f"[OCR Cache] Error clearing cache: {e}")
