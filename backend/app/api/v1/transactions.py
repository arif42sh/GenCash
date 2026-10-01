from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.transaction import Transaction
from app.services.transaction_service import TransactionService
from app.schemas.transaction import (
    SendMoneyRequest,
    CashOutRequest,
    MobileRechargeRequest,
    MerchantPaymentRequest,
    AddMoneyRequest,
    TransactionResponse,
    TransactionListResponse,
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/send", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def send_money(
    request: SendMoneyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulated Send Money from current user to another registered GenCash phone number.
    Debits sender and credits recipient atomically with standard fee.
    """
    return TransactionService.process_send_money(db, sender=current_user, request=request)


@router.post("/cashout", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def cash_out(
    request: CashOutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulated Cash Out at an agent point.
    Calculates 1.85% agent service fee and deducts from user wallet.
    """
    return TransactionService.process_cash_out(db, sender=current_user, request=request)


@router.post("/recharge", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def mobile_recharge(
    request: MobileRechargeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulated Mobile Recharge (GP, Robi, Banglalink, Airtel, Teletalk).
    """
    return TransactionService.process_mobile_recharge(db, sender=current_user, request=request)


@router.post("/payment", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def merchant_payment(
    request: MerchantPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulated Merchant Payment (Scan QR / Enter Merchant Number).
    """
    return TransactionService.process_merchant_payment(db, sender=current_user, request=request)


@router.post("/add-money", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def add_money(
    request: AddMoneyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Simulate Adding Money from bank account or debit/credit card to GenCash wallet.
    """
    return TransactionService.process_add_money(db, user=current_user, request=request)


@router.get("", response_model=TransactionListResponse)
def list_transactions(
    type: Optional[str] = Query(None, description="Filter by type: SEND_MONEY, RECHARGE, CASH_OUT, MERCHANT_PAYMENT, ADD_MONEY"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get paginated transaction history for the authenticated user with status and directional indicator.
    """
    total, txns = TransactionService.get_user_transactions(
        db=db,
        user_id=current_user.id,
        transaction_type=type,
        limit=limit,
        offset=offset
    )
    return TransactionListResponse(total=total, transactions=txns)


@router.get("/{id}", response_model=TransactionResponse)
def get_transaction_details(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed breakdown of a single transaction by ID.
    """
    txn = db.query(Transaction).filter(
        Transaction.id == id,
        (Transaction.sender_id == current_user.id) | (Transaction.receiver_id == current_user.id)
    ).first()

    if not txn:
        raise HTTPException(status_code=404, detail="Transaction record not found or access denied.")

    return TransactionService._format_transaction(txn, current_user_id=current_user.id)
