from pydantic_settings import BaseSettings
from typing import List
from pathlib import Path

# Get absolute path to .env file
ENV_FILE_PATH = Path(__file__).parent.parent.parent / ".env"

class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_TITLE: str = "FastAPI AI Service"
    APP_DESCRIPTION: str = "AI Service API"
    API_VERSION: str = "v1"
    DEBUG: bool = True
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "sqlite:///./test.db"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-this"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:5000"]
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # AI Configuration
    GROQ_API_KEY: str = ""
    
    class Config:
        env_file = str(ENV_FILE_PATH)
        case_sensitive = True

settings = Settings()

# ===== DEBUG LOGGING =====
import sys
import os

print(f"\n{'='*70}", file=sys.stderr)
print(f"[SETTINGS LOADER - DEBUG]", file=sys.stderr)
print(f"{'='*70}", file=sys.stderr)
print(f"1. ENV_FILE_PATH calculated: {ENV_FILE_PATH}", file=sys.stderr)
print(f"2. ENV_FILE_PATH.exists(): {ENV_FILE_PATH.exists()}", file=sys.stderr)
print(f"3. Current working directory: {os.getcwd()}", file=sys.stderr)

if ENV_FILE_PATH.exists():
    with open(ENV_FILE_PATH, 'r', encoding='utf-8') as f:
        env_lines = f.readlines()
    print(f"4. .env file has {len(env_lines)} lines", file=sys.stderr)
    for i, line in enumerate(env_lines):
        if 'GROQ_API_KEY' in line:
            print(f"5. Line {i+1}: {line.strip()}", file=sys.stderr)

print(f"\n6. settings.GROQ_API_KEY value:", file=sys.stderr)
print(f"   - Length: {len(settings.GROQ_API_KEY)}", file=sys.stderr)
print(f"   - First 20 chars: {settings.GROQ_API_KEY[:20] if settings.GROQ_API_KEY else 'EMPTY'}", file=sys.stderr)
print(f"   - Is empty: {not settings.GROQ_API_KEY}", file=sys.stderr)
print(f"   - Starts with gsk_: {settings.GROQ_API_KEY.startswith('gsk_') if settings.GROQ_API_KEY else False}", file=sys.stderr)
print(f"{'='*70}\n", file=sys.stderr)
