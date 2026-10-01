from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, Wallet
from app.schemas.auth import UserResponse, UserUpdateRequest
from app.schemas.wallet import WalletResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def read_user_me(current_user: User = Depends(get_current_user)):
    """Return profile of the current authenticated user."""
    return UserResponse.model_validate(current_user)


@router.put("/me", response_model=UserResponse)
def update_user_me(
    request: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile information of current authenticated user."""
    if request.name:
        current_user.name = request.name.strip()
    if request.email:
        current_user.email = request.email.strip()
    if request.profile_image:
        current_user.profile_image = request.profile_image

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.get("/me/wallet", response_model=WalletResponse)
def read_user_wallet(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return wallet information, balance, currency, and status."""
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found for this user.")
    return WalletResponse.model_validate(wallet)
