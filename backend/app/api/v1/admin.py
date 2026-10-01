from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import create_access_token
from app.api.deps import get_current_admin
from app.models.user import User, Wallet, AdminUser
from app.models.transaction import Transaction
from app.models.merchant import Merchant, MerchantCategory
from app.models.marketing import Campaign, Offer
from app.models.ai import AIInsight
from app.schemas.auth import AdminLoginRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/login")
def admin_login(request: AdminLoginRequest, db: Session = Depends(get_db)):
    """Authenticate administrator."""
    admin = AuthService.authenticate_admin(db, request.email, request.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials."
        )
    token = create_access_token(subject=admin.id, role=admin.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "admin": {
            "id": admin.id,
            "name": admin.name,
            "email": admin.email,
            "role": admin.role
        }
    }


@router.get("/dashboard")
def get_dashboard_summary(
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Admin dashboard stats overview."""
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == "ACTIVE").count()
    total_transactions = db.query(Transaction).count()
    total_volume = db.query(func.sum(Transaction.amount)).scalar() or 0.0

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_transactions": total_transactions,
        "total_volume": float(total_volume),
        "total_merchants": db.query(Merchant).count(),
        "total_campaigns": db.query(Campaign).count(),
        "total_ai_insights": db.query(AIInsight).count(),
    }


@router.get("/users")
def get_admin_users(
    limit: int = 50,
    offset: int = 0,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all platform users with wallet status."""
    users = db.query(User).offset(offset).limit(limit).all()
    results = []
    for u in users:
        results.append({
            "id": u.id,
            "name": u.name,
            "phone": u.phone,
            "email": u.email,
            "status": u.status,
            "balance": float(u.wallet.balance) if u.wallet else 0.0,
            "created_at": u.created_at
        })
    return {"total": db.query(User).count(), "users": results}


@router.get("/transactions")
def get_admin_transactions(
    limit: int = 50,
    offset: int = 0,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all platform transactions."""
    txns = db.query(Transaction).order_by(Transaction.transaction_time.desc()).offset(offset).limit(limit).all()
    results = []
    for t in txns:
        results.append({
            "id": t.id,
            "transaction_code": t.transaction_code,
            "sender_phone": t.sender.phone if t.sender else None,
            "receiver_phone": t.receiver.phone if t.receiver else t.recipient_phone,
            "amount": float(t.amount),
            "fee": float(t.fee),
            "type": t.transaction_type,
            "status": t.status,
            "time": t.transaction_time
        })
    return {"total": db.query(Transaction).count(), "transactions": results}


@router.get("/merchants")
def get_merchants(
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all merchants."""
    merchants = db.query(Merchant).all()
    return [
        {
            "id": m.id,
            "name": m.merchant_name,
            "phone": m.phone,
            "location": m.location,
            "category": m.category.name if m.category else "General",
            "status": m.status
        }
        for m in merchants
    ]


@router.get("/ai-insights")
def get_all_ai_insights(
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """List all AI insights generated across users for audit and evaluation."""
    insights = db.query(AIInsight).order_by(AIInsight.created_at.desc()).limit(100).all()
    return [
        {
            "id": i.id,
            "user_id": i.user_id,
            "insight_type": i.insight_type,
            "prediction": i.prediction,
            "confidence": float(i.confidence),
            "explanation": i.explanation,
            "model_version": i.model_version,
            "created_at": i.created_at
        }
        for i in insights
    ]
