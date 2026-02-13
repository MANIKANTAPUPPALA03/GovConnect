"""
GovConnect Backend Configuration
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Groq API (Primary AI)
    groq_api_key: Optional[str] = None

    # Google Document AI (Primary OCR)
    google_project_id: Optional[str] = None
    google_location: Optional[str] = None
    google_processor_id: Optional[str] = None
    google_application_credentials: Optional[str] = None
    
    # Application
    app_name: str = "GovConnect API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # CORS
    cors_origins: list[str] = ["*"]
    
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
        _setup_google_credentials(_settings)
    return _settings


def _setup_google_credentials(settings: Settings):
    """
    Setup Google Credentials from JSON string in environment variable.
    
    This allows passing the entire service account JSON as a string
    in GOOGLE_SERVICE_ACCOUNT_JSON, which is useful for deployments
    where file mounting is difficult.
    """
    import json
    import tempfile
    
    # Check for service account JSON string
    service_account_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
    
    if service_account_json:
        try:
            print("[Config] Found GOOGLE_SERVICE_ACCOUNT_JSON in environment")
            
            # Parse to ensure it's valid JSON
            cred_dict = json.loads(service_account_json)
            
            # Write to a temporary file
            # We use a fixed path in /tmp (Linux) or temp dir to avoid file proliferation
            temp_dir = tempfile.gettempdir()
            cred_file_path = os.path.join(temp_dir, "govconnect_runtime_sa.json")
            
            with open(cred_file_path, "w", encoding="utf-8") as f:
                json.dump(cred_dict, f)
                
            # Set the environment variable that Google libraries look for
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = cred_file_path
            settings.google_application_credentials = cred_file_path
            
            print(f"[Config] Wrote service account to {cred_file_path} and set GOOGLE_APPLICATION_CREDENTIALS")
            
        except json.JSONDecodeError as e:
            print(f"[Config] Error parsing GOOGLE_SERVICE_ACCOUNT_JSON: {e}")
        except Exception as e:
            print(f"[Config] Error setting up Google credentials: {e}")
            
    # If no JSON string, check if GOOGLE_APPLICATION_CREDENTIALS is set directly
    elif os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        print(f"[Config] Using existing GOOGLE_APPLICATION_CREDENTIALS: {os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')}")

