import os
import time
import base64
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, Wallet
from app.schemas.auth import UserResponse, UserUpdateRequest
from app.schemas.wallet import WalletResponse

router = APIRouter(prefix="/users", tags=["Users"])

UPLOADS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads", "avatars")
)
ADMIN_UPLOADS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "admin", "uploads", "avatars")
)
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(ADMIN_UPLOADS_DIR, exist_ok=True)


def _save_image_data(user_id: int, raw_image: str) -> str:
    """Helper to save base64 image or direct URL and return serving path."""
    if not raw_image:
        return None

    # If it's a data URI or raw base64
    if raw_image.startswith("data:image/") or ";base64," in raw_image:
        parts = raw_image.split(";base64,")
        ext = "png"
        if "jpeg" in parts[0] or "jpg" in parts[0]:
            ext = "jpg"
        elif "webp" in parts[0]:
            ext = "webp"
        
        b64_str = parts[1] if len(parts) > 1 else parts[0]
        data = base64.b64decode(b64_str)
        filename = f"user_{user_id}_{int(time.time())}.{ext}"
        
        target_path = os.path.join(UPLOADS_DIR, filename)
        with open(target_path, "wb") as f:
            f.write(data)
            
        try:
            admin_target = os.path.join(ADMIN_UPLOADS_DIR, filename)
            shutil.copyfile(target_path, admin_target)
        except Exception:
            pass

        return f"/static/uploads/avatars/{filename}"

    # If raw base64 without header but long string
    if len(raw_image) > 500 and " " not in raw_image and not raw_image.startswith("http"):
        try:
            data = base64.b64decode(raw_image)
            filename = f"user_{user_id}_{int(time.time())}.jpg"
            target_path = os.path.join(UPLOADS_DIR, filename)
            with open(target_path, "wb") as f:
                f.write(data)
            try:
                admin_target = os.path.join(ADMIN_UPLOADS_DIR, filename)
                shutil.copyfile(target_path, admin_target)
            except Exception:
                pass
            return f"/static/uploads/avatars/{filename}"
        except Exception:
            pass

    return raw_image


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
    """Update profile information and avatar of current authenticated user."""
    if request.name is not None and request.name.strip():
        current_user.name = request.name.strip()
    
    if request.email is not None:
        clean_email = request.email.strip()
        current_user.email = clean_email if clean_email else None

    if request.phone is not None and request.phone.strip():
        current_user.phone = request.phone.strip()

    incoming_image = request.avatar if request.avatar is not None else request.profile_image
    if incoming_image is not None:
        if incoming_image == "" or incoming_image == "null":
            current_user.profile_image = None
        else:
            saved_path = _save_image_data(current_user.id, incoming_image)
            if saved_path:
                current_user.profile_image = saved_path

    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/me/avatar", response_model=UserResponse)
async def upload_user_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user avatar file directly via multipart form."""
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"user_{current_user.id}_{int(time.time())}.{ext}"
    target_path = os.path.join(UPLOADS_DIR, filename)

    contents = await file.read()
    with open(target_path, "wb") as f:
        f.write(contents)

    try:
        admin_target = os.path.join(ADMIN_UPLOADS_DIR, filename)
        shutil.copyfile(target_path, admin_target)
    except Exception:
        pass

    current_user.profile_image = f"/static/uploads/avatars/{filename}"
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


from pydantic import BaseModel, Field

class UserConsentRequest(BaseModel):
    promotional_nudge_opt_in: bool = Field(..., description="Opt-in consent toggle for AI promotional nudges")


@router.patch("/{user_id}/consent")
def update_user_consent(
    user_id: int,
    consent_data: UserConsentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Responsible AI & User Privacy:
    Mobile app toggle endpoint for promotional campaign nudges.
    Allows user to opt in or opt out of AI-driven marketing notifications.
    """
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Cannot modify consent for another user.")

    from app.services.consent_service import record_user_consent
    res = record_user_consent(user_id, consent_data.promotional_nudge_opt_in)
    return {
        "status": "SUCCESS",
        "user_id": user_id,
        "promotional_nudge_opt_in": consent_data.promotional_nudge_opt_in,
        "message": "User marketing consent updated successfully.",
        "updated_at": res["updated_at"]
    }

