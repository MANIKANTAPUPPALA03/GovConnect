"""
Base AI Client for GovConnect

Provides interface to Azure OpenAI API with JSON validation.
Uses Azure OpenAI for enterprise-grade performance and compliance.
"""
import json
import re
from typing import Optional
from openai import AzureOpenAI

from app.config import get_settings


class AIClient:
    """Client for interacting with Azure OpenAI API."""
    
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.azure_openai_api_key
        self.endpoint = settings.azure_openai_endpoint
        self.deployment_name = settings.azure_deployment_name
        self.api_version = settings.azure_api_version
        
        self.client = None
        
        if self.api_key and self.endpoint:
            self.client = AzureOpenAI(
                api_key=self.api_key,
                azure_endpoint=self.endpoint,
                api_version=self.api_version
            )
    
    @property
    def is_configured(self) -> bool:
        """Check if AI is properly configured."""
        return self.client is not None and bool(self.api_key) and bool(self.endpoint)
    
    async def generate(self, prompt: str) -> Optional[dict]:
        """
        Generate response from AI and parse as JSON.
        
        Returns None if AI is not configured or fails.
        """
        if not self.is_configured:
            return None
        
        try:
            response = self.client.chat.completions.create(
                model=self.deployment_name,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that always responds with valid JSON only. No markdown, no explanations, just JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.1,
                response_format={"type": "json_object"}
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
            r'```json\s*([\s\S]*?)\s*```',
            r'```\s*([\s\S]*?)\s*```',
            r'\{[\s\S]*\}'
        ]
        
        for pattern in json_patterns:
            match = re.search(pattern, text)
            if match:
                try:
                    json_str = match.group(1) if '```' in pattern else match.group(0)
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
    # Check if critical settings changed
    if (_ai_client.api_key != settings.azure_openai_api_key or 
        _ai_client.endpoint != settings.azure_openai_endpoint):
        _ai_client = AIClient()
        
    return _ai_client


def reset_ai_client():
    """Reset the AI client to reinitialize with new settings."""
    global _ai_client
    _ai_client = None
