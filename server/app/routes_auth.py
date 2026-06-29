from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import secrets
from app import schemas, crud_mongo, auth
from app.database import get_mongo

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: schemas.UserCreate, mongo_db = Depends(get_mongo)):
    db_user = await crud_mongo.get_user_by_email(mongo_db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email is already registered")
    return await crud_mongo.create_user(mongo_db, user=user)

@router.post("/login", response_model=schemas.Token)
async def login_user(form_data: OAuth2PasswordRequestForm = Depends(), mongo_db = Depends(get_mongo)):
    user = await crud_mongo.get_user_by_email(mongo_db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user["email"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login/json", response_model=schemas.Token)
async def login_user_json(login_data: schemas.UserLogin, mongo_db = Depends(get_mongo)):
    user = await crud_mongo.get_user_by_email(mongo_db, email=login_data.email)
    if not user or not auth.verify_password(login_data.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    access_token = auth.create_access_token(data={"sub": user["email"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/google", response_model=schemas.Token)
async def google_auth(g_data: schemas.GoogleAuthRequest, mongo_db = Depends(get_mongo)):
    email = g_data.email or "google_user@example.com"
    full_name = g_data.full_name or "Google User"
    
    user = await crud_mongo.get_user_by_email(mongo_db, email=email)
    if not user:
        random_pwd = secrets.token_urlsafe(16)
        user = await crud_mongo.create_user(mongo_db, user=schemas.UserCreate(
            email=email,
            full_name=full_name,
            password=random_pwd
        ))
    
    access_token = auth.create_access_token(data={"sub": user["email"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=schemas.UserResponse)
async def read_current_user(current_user = Depends(auth.get_current_user)):
    return current_user
