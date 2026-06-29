from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import mongo_db
from app.routes import router
from app.routes_auth import router as auth_router
from app import crud_mongo, schemas

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure robust CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    try:
        admin_user = await crud_mongo.get_user_by_email(mongo_db, "admin@tasktracker.com")
        if not admin_user:
            await crud_mongo.create_user(mongo_db, schemas.UserCreate(
                email="admin@tasktracker.com",
                full_name="System Administrator",
                password="admin123"
            ))
            print("Default MongoDB Admin user initialized: admin@tasktracker.com")
    except Exception as e:
        print(f"MongoDB Startup Seeder note: {e}")

# Include API Routers under root and under API_V1_STR for maximum compatibility
app.include_router(auth_router)
app.include_router(auth_router, prefix=settings.API_V1_STR)

app.include_router(router)
app.include_router(router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Task Tracker API (MongoDB Edition)",
        "documentation": "/docs",
        "redoc": "/redoc"
    }
