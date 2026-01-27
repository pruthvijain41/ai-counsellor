from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database - Supabase PostgreSQL connection string
    # Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
    database_url: str = ""
    
    # JWT Configuration
    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours
    
    # Groq AI Configuration (Llama 3.1-70B)
    groq_api_key: str = ""
    
    # HiPolabs API (No key needed - public API)
    hipolabs_api_url: str = "http://universities.hipolabs.com/search"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()
