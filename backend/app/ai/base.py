"""
Base AI Client for GovConnect (Groq)

Uses Groq for fast open-model inference with JSON validation.
"""

import json
import re
from typing import Optional
from groq import Groq

from app.config import get_settings


class AIClient:
    """Client for interacting with Groq API."""

    def __init__(self):
        settings = get_settings()
        self.api_key = getattr(settings, "groq_api_key", None)

        self.client = None

        if self.api_key:
            self.client = Groq(api_key=self.api_key)

        # Default model (agent may upgrade after inspection)
        self.model_name = "llama-3.1-8b-instant"

    @property
    def is_configured(self) -> bool:
        """Check if AI is properly configured."""
        return self.client is not None and bool(self.api_key)

    async def generate(self, prompt: str) -> Optional[dict]:
        """
        Generate response from AI and parse as JSON.

        Returns None if AI is not configured or fails.
        """
        if not self.is_configured:
            return None

        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a strict JSON generator. "
                            "You MUST return only valid JSON. "
                            "No markdown, no explanations, no extra text."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.1,
            )

            if response and response.choices:
                text = response.choices[0].message.content
                return self._parse_json_response(text)

            return None

        except Exception as e:
            print(f"[AI Error] {e}")
            return None

    def _parse_json_response(self, text: str) -> Optional[dict]:
        """Extract and parse JSON from AI response."""
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        json_patterns = [
            r"```json\s*([\s\S]*?)\s*```",
            r"```\s*([\s\S]*?)\s*```",
            r"\{[\s\S]*\}",
        ]

        for pattern in json_patterns:
            match = re.search(pattern, text)
            if match:
                try:
                    json_str = match.group(1) if "```" in pattern else match.group(0)
                    return json.loads(json_str)
                except (json.JSONDecodeError, IndexError):
                    continue

        return None


# Global AI client instance
_ai_client: Optional[AIClient] = None


def get_ai_client() -> AIClient:
    """Get or create AI client instance."""
    global _ai_client
    if _ai_client is None:
        _ai_client = AIClient()

    settings = get_settings()

    # Reinitialize if key changed
    if _ai_client.api_key != getattr(settings, "groq_api_key", None):
        _ai_client = AIClient()

    return _ai_client


def reset_ai_client():
    """Reset the AI client to reinitialize with new settings."""
    global _ai_client
    _ai_client = None
