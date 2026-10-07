"""
GenCash Enterprise Security & Configuration Module
==================================================
Author: Principal Application Security Engineer & Responsible AI Architect
System: GenCash Enterprise MFS Platform (Dimension 7: Responsible AI & Security)

Zero-Fallback Secret Enforcement:
- Strictly prohibits hardcoded default secrets for JWT and sensitive credentials.
- Requires explicit production environment variables (via .env or environment).
- Enforces immediate startup termination (RuntimeError) upon missing or weak placeholder keys.
"""

import os
import sys
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator

PROHIBITED_SECRETS = {
    "secret", "default", "changeme", "password", "admin",
    "123456", "your-secure-jwt-secret-key-placeholder",
    "your_production_jwt_secret_here", "gencash_secret"
}


class Settings(BaseSettings):
    PROJECT_NAME: str = "GenCash"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"
    API_V1_STR: str = "/api"

    # ZERO FALLBACK SECRET: Must be explicitly supplied via environment or .env file!
    # No hardcoded default permitted!
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # MySQL Configuration
    DB_USER: str = "root"
    DB_PASSWORD: str = ""
    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_NAME: str = "gencash_db"
    USE_SQLITE_FALLBACK: bool = True

    # Financial / Business Rules
    DEMO_INITIAL_WALLET_BALANCE: float = 5000.00
    DEFAULT_CURRENCY: str = "BDT"
    DEFAULT_FEE_SEND_MONEY: float = 5.00
    DEFAULT_FEE_CASH_OUT_PERCENT: float = 1.85  # 1.85%

    # Rate Limiting Configuration
    RATE_LIMIT_AUTH_PER_MINUTE: str = "5/minute"
    RATE_LIMIT_API_PER_MINUTE: str = "60/minute"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    @field_validator("SECRET_KEY")
    @classmethod
    def validate_zero_fallback_secret(cls, v: str) -> str:
        """Enforces cryptographic secret strength and rejects any default or placeholder keys."""
        if not v or not v.strip():
            raise RuntimeError(
                "FATAL SECURITY VIOLATION: Zero-fallback secret enforcement triggered! "
                "SECRET_KEY is empty. Application startup aborted."
            )
        cleaned = v.strip().lower()
        if cleaned in PROHIBITED_SECRETS:
            raise RuntimeError(
                f"FATAL SECURITY VIOLATION: Insecure or placeholder SECRET_KEY detected ('{v}'). "
                f"Production deployment strictly forbids default secrets. Application startup aborted."
            )
        if len(v.strip()) < 32:
            raise RuntimeError(
                f"FATAL SECURITY VIOLATION: SECRET_KEY length ({len(v.strip())} chars) is insufficient. "
                f"Cryptographic standard requires at least 32 characters (256-bit entropy). Startup aborted."
            )
        return v.strip()

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        if self.DB_PASSWORD:
            return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        return f"mysql+pymysql://{self.DB_USER}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

    @property
    def MYSQL_SERVER_URI(self) -> str:
        if self.DB_PASSWORD:
            return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/?charset=utf8mb4"
        return f"mysql+pymysql://{self.DB_USER}@{self.DB_HOST}:{self.DB_PORT}/?charset=utf8mb4"

    class Config:
        case_sensitive = True
        env_file = (
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
            ".env"
        )
        extra = "allow"


# Instantiate settings with validation enforcement
try:
    settings = Settings()
except Exception as exc:
    print(f"\n❌ [SECURITY STARTUP ERROR] {exc}\n", file=sys.stderr)
    raise
