import os
from pydantic_settings import BaseSettings
from typing import List, Union
import json

class Settings(BaseSettings):
    PROJECT_NAME: str = "Task Tracker API"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./task_tracker.db")
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "task_tracker_db")
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:5173", "http://localhost:3000", "*"]
    
    # JWT Security Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    @property
    def cors_origins_list(self) -> List[str]:
        if isinstance(self.CORS_ORIGINS, str):
            try:
                return json.loads(self.CORS_ORIGINS)
            except Exception:
                return [self.CORS_ORIGINS]
        return self.CORS_ORIGINS

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
