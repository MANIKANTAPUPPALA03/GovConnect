"""
Local OCR Fallback for GovConnect

Provides best-effort text extraction from PDFs using local libraries.
Results are LOW CONFIDENCE and must not be cached permanently.
"""
import io
from typing import Optional
import pdfplumber
import PyPDF2


async def extract_text_locally(file_bytes: bytes) -> str:
    """
    Extract text from PDF using local libraries.
    
    Priority:
    1. pdfplumber (best quality)
    2. PyPDF2 (fallback)
    3. Empty string (safe return)
    
    Args:
        file_bytes: PDF file content as bytes
        
    Returns:
        Extracted text (may be empty or low quality)
    """
    print("[Local OCR] Attempting local text extraction")
    
    # Try pdfplumber first (better quality)
    try:
        text = _extract_with_pdfplumber(file_bytes)
        if text and len(text.strip()) > 10:
            print(f"[Local OCR] pdfplumber extracted {len(text)} chars")
            return text
    except Exception as e:
        print(f"[Local OCR] pdfplumber failed: {e}")
    
    # Fallback to PyPDF2
    try:
        text = _extract_with_pypdf2(file_bytes)
        if text and len(text.strip()) > 10:
            print(f"[Local OCR] PyPDF2 extracted {len(text)} chars")
            return text
    except Exception as e:
        print(f"[Local OCR] PyPDF2 failed: {e}")
    
    # Safe empty return
    print("[Local OCR] No text extracted, returning empty")
    return ""


def _extract_with_pdfplumber(file_bytes: bytes) -> str:
    """Extract text using pdfplumber."""
    file_obj = io.BytesIO(file_bytes)
    text_parts = []
    
    with pdfplumber.open(file_obj) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    
    return "\n\n".join(text_parts)


def _extract_with_pypdf2(file_bytes: bytes) -> str:
    """Extract text using PyPDF2."""
    file_obj = io.BytesIO(file_bytes)
    pdf_reader = PyPDF2.PdfReader(file_obj)
    text_parts = []
    
    for page in pdf_reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)
    
    return "\n\n".join(text_parts)
