"""
Translator utility for multilingual support.
Uses Azure OpenAI for translation.

IMPORTANT: This module provides graceful fallback.
If translation fails, original content is returned.
"""
from app.utils.prompts import TRANSLATE_TO_EN, TRANSLATE_FROM_EN
from app.ai.base import get_ai_client
import json


async def to_english(text: str, lang: str) -> str:
    """
    Translate text to English for AI reasoning.
    
    Args:
        text: Input text (may be in any language)
        lang: Language code (en, te, hi, etc.)
    
    Returns:
        English text (or original if translation fails/skipped)
    """
    # Skip if already English or empty
    if not text or lang == "en":
        return text or ""

    ai_client = get_ai_client()
    if not ai_client.is_configured:
        print("[Translator] AI not configured, returning original text")
        return text

    try:
        prompt = TRANSLATE_TO_EN.replace("{{text}}", text)
        result = await ai_client.generate(prompt)
        
        if result and isinstance(result, dict):
            # Try various keys that might contain the translation
            for key in ["translation", "text", "english", "result", "translated_text"]:
                if key in result and result[key]:
                    return str(result[key])
        
        print(f"[Translator] Unexpected response format: {result}")
        return text  # Fallback
        
    except Exception as e:
        print(f"[Translator] to_english error: {e}")
        return text  # Fallback to original


async def from_english(data: dict, lang: str) -> dict:
    """
    Translate dict values from English to target language.
    
    Args:
        data: Dictionary with English values
        lang: Target language code (en, te, hi, etc.)
    
    Returns:
        Dictionary with translated values (or original if fails)
    """
    # Skip if already English or empty
    if not data or lang == "en":
        return data or {}

    ai_client = get_ai_client()
    if not ai_client.is_configured:
        print("[Translator] AI not configured, returning original data")
        return data

    try:
        prompt = TRANSLATE_FROM_EN \
            .replace("{{language}}", _get_language_name(lang)) \
            .replace("{{json}}", json.dumps(data, ensure_ascii=False))

        result = await ai_client.generate(prompt)
        
        if result and isinstance(result, dict):
            return result
        
        print(f"[Translator] Unexpected response format: {result}")
        return data  # Fallback
        
    except Exception as e:
        print(f"[Translator] from_english error: {e}")
        return data  # Fallback to original


def _get_language_name(lang_code: str) -> str:
    """Convert language code to full name for better AI understanding."""
    names = {
        "en": "English",
        "te": "Telugu",
        "hi": "Hindi",
        "ta": "Tamil",
        "kn": "Kannada",
        "bn": "Bengali",
        "mr": "Marathi",
        "gu": "Gujarati"
    }
    return names.get(lang_code, lang_code)
