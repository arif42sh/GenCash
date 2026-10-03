from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    ChangePinRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.api.deps import get_current_user
from app.models.user import User
from app.core.security import verify_password, get_password_hash

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


@router.post("/change-pin")
def change_pin(
    request: ChangePinRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user transaction PIN.
    Accepts 4 to 6 digit numeric PIN.
    """
    clean_old = request.old_pin.strip()
    clean_new = request.new_pin.strip()

    if not verify_password(clean_old, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current PIN is incorrect."
        )

    if not clean_new.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New PIN must consist of numbers only."
        )

    if len(clean_new) < 4 or len(clean_new) > 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New PIN must be 4 to 6 digits long."
        )

    current_user.password_hash = get_password_hash(clean_new)
    db.commit()
    return {"status": "success", "message": "PIN updated successfully."}
