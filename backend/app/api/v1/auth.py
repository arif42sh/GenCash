from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new customer account.
    Automatically creates a digital wallet initialized with simulated demo balance (৳5,000).
    """
    user = AuthService.register_user(db, request)
    return AuthService.create_user_token(user)


@router.post("/login", response_model=TokenResponse)
def login(request: UserLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate customer with mobile number and password/PIN.
    Returns JWT bearer token.
    """
    user = AuthService.authenticate_user(db, request.phone, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid mobile phone number or PIN/password."
        )
    return AuthService.create_user_token(user)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """
    Invalidate current session on client.
    """
    return {"status": "success", "message": "Successfully logged out."}


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get profile details for authenticated user.
    """
    return UserResponse.model_validate(current_user)
