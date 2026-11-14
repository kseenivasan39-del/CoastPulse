import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "COASTPULSE"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Host & Port binding: Local services bind strictly to localhost by default
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    # CORS configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # Database: PostgreSQL with asyncpg is the primary production target.
    # SQLite with aiosqlite is default for local development unless DATABASE_URL is set in environment.
    DATABASE_URL: str = Field(
        default="sqlite+aiosqlite:///./coastpulse_dev.db",
        description="Database connection URL (PostgreSQL in production, SQLite for local development)"
    )

    # Authentication & Security
    SECRET_KEY: str = Field(
        default="cp_insecure_dev_secret_key_change_in_production_32bytes_min",
        description="JWT signature secret key"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    RESET_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour
    PASSWORD_HASH_ROUNDS: int = 12

    # Rate Limiting
    RATE_LIMIT_DEFAULT: str = "100/minute"
    RATE_LIMIT_AUTH: str = "10/minute"

    # Redis for distributed job queue (optional fallback to background tasks)
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI Grounding (Gemini)
    GEMINI_API_KEY: str = Field(default="")
    GEMINI_MODEL: str = "gemini-3.1-pro-preview"

    # NASA Earthdata Authentication (Optional credentials for live HDF5 science granules)
    EARTHDATA_USERNAME: str = Field(default="")
    EARTHDATA_PASSWORD: str = Field(default="")
    EARTHDATA_TOKEN: str = Field(default="")

    # Initial Study Area Focus: Nagapattinam District, Tamil Nadu, India
    DEFAULT_AOI_ID: str = "AOI_NAGAPATTINAM_01"
    DEFAULT_AOI_NAME: str = "Nagapattinam District Coastal Delta"
    DEFAULT_STATE: str = "Tamil Nadu, India"
    AOI_BBOX_MIN_LON: float = 79.6
    AOI_BBOX_MIN_LAT: float = 10.2
    AOI_BBOX_MAX_LON: float = 80.1
    AOI_BBOX_MAX_LAT: float = 11.4

    # Security & Storage Limits
    MAX_UPLOAD_SIZE_MB: int = 500
    DATA_DIR: str = "./data"
    PROCESSED_DIR: str = "./data/processed"

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="allow"
    )


settings = Settings()
