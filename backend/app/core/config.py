import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "GenCash"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "gencash_super_secret_jwt_key_ai_hackathon_2026_diu_cpc_upay"
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

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # Standard PyMySQL URI format
        if self.DB_PASSWORD:
            return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        return f"mysql+pymysql://{self.DB_USER}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"

    @property
    def MYSQL_SERVER_URI(self) -> str:
        # URI without database name to allow creating DB if it does not exist
        if self.DB_PASSWORD:
            return f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/?charset=utf8mb4"
        return f"mysql+pymysql://{self.DB_USER}@{self.DB_HOST}:{self.DB_PORT}/?charset=utf8mb4"

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"


settings = Settings()
