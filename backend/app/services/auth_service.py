import uuid
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, Wallet, AdminUser, UserStatus, WalletStatus, AdminRole
from app.models.system import Notification
from app.models.ai import AIInsight
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.schemas.auth import UserRegisterRequest, TokenResponse, UserResponse


class AuthService:
    @staticmethod
    def register_user(db: Session, request: UserRegisterRequest) -> User:
        # Check if phone already exists
        clean_phone = request.phone.strip()
        existing_user = db.query(User).filter(User.phone == clean_phone).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this mobile number already exists."
            )

        # Check email if provided
        if request.email:
            existing_email = db.query(User).filter(User.email == request.email.strip()).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="A user with this email address already exists."
                )

        try:
            # Create user
            hashed_pwd = get_password_hash(request.password)
            new_user = User(
                name=request.name.strip(),
                phone=clean_phone,
                email=request.email.strip() if request.email else None,
                password_hash=hashed_pwd,
                status=UserStatus.ACTIVE
            )
            db.add(new_user)
            db.flush()  # get new_user.id

            # Create wallet with simulated demo balance
            new_wallet = Wallet(
                user_id=new_user.id,
                balance=settings.DEMO_INITIAL_WALLET_BALANCE,
                currency=settings.DEFAULT_CURRENCY,
                status=WalletStatus.ACTIVE
            )
            db.add(new_wallet)

            # Create welcome notification
            welcome_notif = Notification(
                user_id=new_user.id,
                title="Welcome to GenCash!",
                message=f"Welcome {new_user.name}! Your simulated wallet has been credited with ৳{settings.DEMO_INITIAL_WALLET_BALANCE:,.2f} demo balance.",
                type="SYSTEM",
                is_read=False
            )
            db.add(welcome_notif)

            # Create initial AI insight placeholder
            ai_insight = AIInsight(
                user_id=new_user.id,
                entity_type="USER",
                entity_id=new_user.id,
                insight_type="WELCOME_RECOMMENDATION",
                prediction="High probability of first mobile recharge within 24 hours.",
                confidence=0.91,
                explanation="New MFS accounts frequently perform a mobile recharge or test send money transaction as their initial action.",
                model_version="v1.0-prototype"
            )
            db.add(ai_insight)

            db.commit()
            db.refresh(new_user)
            return new_user
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Registration failed due to a database error: {str(e)}"
            )

    @staticmethod
    def authenticate_user(db: Session, phone: str, password: str) -> Optional[User]:
        clean_phone = phone.strip()
        user = db.query(User).filter(User.phone == clean_phone).first()
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        if user.status != UserStatus.ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been deactivated or blocked. Please contact support."
            )
        return user

    @staticmethod
    def authenticate_admin(db: Session, email: str, password: str) -> Optional[AdminUser]:
        admin = db.query(AdminUser).filter(AdminUser.email == email.strip().lower()).first()
        if not admin:
            return None
        if not verify_password(password, admin.password_hash):
            return None
        return admin

    @staticmethod
    def create_user_token(user: User) -> TokenResponse:
        token = create_access_token(subject=user.id, role="USER")
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user)
        )
