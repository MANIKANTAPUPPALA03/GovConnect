"""
Translation Router - Real-time AI Translation using Gemini

POST /api/translate - Translates text/object to target language
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
import json

from app.ai.base import get_ai_client

router = APIRouter(prefix="/api/translate", tags=["Translation"])

# Language name mapping
LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "te": "Telugu",
    "ta": "Tamil",
    "kn": "Kannada",
    "ml": "Malayalam",
    "mr": "Marathi",
    "bn": "Bengali",
    "gu": "Gujarati",
    "pa": "Punjabi",
}

# Cache for translations to avoid repeated API calls
translation_cache: Dict[str, str] = {}


class TranslateRequest(BaseModel):
    """Request model for translation"""
    content: Any  # Can be string, dict, or list
    target_language: str  # Language code like 'hi', 'te'
    source_language: str = "en"


class TranslateResponse(BaseModel):
    """Response model for translation"""
    translated: Any
    language: str
    cached: bool = False


def get_cache_key(content: str, target: str) -> str:
    """Generate a cache key for translation"""
    return f"{target}:{hash(content)}"


@router.post("", response_model=TranslateResponse)
async def translate_content(request: TranslateRequest):
    """
    Translate content to target language using Gemini AI.
    
    - Handles strings, dicts, and lists
    - Uses caching to avoid repeated translations
    - Returns original if source == target
    """
    
    # If same language, return as-is
    if request.source_language == request.target_language:
        return TranslateResponse(
            translated=request.content,
            language=request.target_language,
            cached=True
        )
    
    # Convert content to string for translation
    if isinstance(request.content, str):
        content_str = request.content
        is_json = False
    else:
        content_str = json.dumps(request.content, ensure_ascii=False)
        is_json = True
    
    # Check cache
    cache_key = get_cache_key(content_str, request.target_language)
    if cache_key in translation_cache:
        cached_result = translation_cache[cache_key]
        if is_json:
            try:
                return TranslateResponse(
                    translated=json.loads(cached_result),
                    language=request.target_language,
                    cached=True
                )
            except:
                pass
        return TranslateResponse(
            translated=cached_result,
            language=request.target_language,
            cached=True
        )
    
    # Get target language name
    target_lang_name = LANGUAGE_NAMES.get(request.target_language, request.target_language)
    
    # Get AI client
    ai_client = get_ai_client()
    if not ai_client.is_configured:
        print("[Translation] AI not configured, returning original")
        return TranslateResponse(
            translated=request.content,
            language=request.source_language,
            cached=False
        )
    
    # Build prompt for Gemini
    prompt = f"""Translate the following content from English to {target_lang_name}.

RULES:
1. Return ONLY the translated text, nothing else
2. Keep proper nouns as-is or transliterate naturally
3. If the content is JSON, maintain the exact structure

Content:
{content_str}"""

    try:
        # Use the async generate method like translator.py does
        result = await ai_client.generate(prompt)
        
        if result and isinstance(result, dict):
            # Try to get the translation from various keys
            translated_text = None
            for key in ["translation", "text", "result", "translated", "content"]:
                if key in result and result[key]:
                    translated_text = str(result[key])
                    break
            
            if not translated_text:
                # If no known key, try to get any string value
                for v in result.values():
                    if isinstance(v, str) and v.strip():
                        translated_text = v
                        break
            
            if translated_text:
                # Cache the result
                translation_cache[cache_key] = translated_text
                
                # Parse back to original type if needed
                if is_json:
                    try:
                        return TranslateResponse(
                            translated=json.loads(translated_text),
                            language=request.target_language,
                            cached=False
                        )
                    except:
                        pass
                
                return TranslateResponse(
                    translated=translated_text,
                    language=request.target_language,
                    cached=False
                )
        
        # If result is a string directly
        if result and isinstance(result, str):
            translation_cache[cache_key] = result
            return TranslateResponse(
                translated=result,
                language=request.target_language,
                cached=False
            )
        
        print(f"[Translation] Unexpected response format: {type(result)}")
        return TranslateResponse(
            translated=request.content,
            language=request.source_language,
            cached=False
        )
        
    except Exception as e:
        import traceback
        print(f"[Translation] Error: {e}")
        print(f"[Translation] Traceback: {traceback.format_exc()}")
        return TranslateResponse(
            translated=request.content,
            language=request.source_language,
            cached=False
        )
