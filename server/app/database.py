from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

logger = logging.getLogger(__name__)

# --- SQL DB SETUP ---
db_url = settings.DATABASE_URL
connect_args = {}

if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

try:
    engine = create_engine(db_url, connect_args=connect_args)
    if db_url.startswith("postgresql"):
        with engine.connect() as conn:
            pass
except Exception as e:
    logger.warning(f"Failed to connect to primary database ({db_url}): {e}. Falling back to SQLite.")
    db_url = "sqlite:///./task_tracker.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- MONGODB SETUP ---
mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
mongo_db = mongo_client[settings.MONGODB_DB_NAME]

def get_mongo():
    return mongo_db
