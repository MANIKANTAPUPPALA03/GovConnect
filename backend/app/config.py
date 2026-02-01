"""
GovConnect Backend Configuration
"""
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Azure OpenAI Settings
    azure_openai_api_key: str = ""
    azure_openai_endpoint: str = ""
    azure_deployment_name: str = "gpt-4.1-mini"
    azure_api_version: str = "2024-08-01-preview"
    
    # Azure Document Intelligence Settings
    doc_intelligence_endpoint: str = ""
    doc_intelligence_key: str = ""
    
    # Application
    app_name: str = "GovConnect API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # CORS
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


# Cache the settings instance but allow recreation
_settings: Settings = None


def get_settings() -> Settings:
    """Get settings instance, recreating if necessary."""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
