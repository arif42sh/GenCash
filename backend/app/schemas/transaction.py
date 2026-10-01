from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.transaction import TransactionType, TransactionStatus


class SendMoneyRequest(BaseModel):
    receiver_phone: str = Field(..., example="01812345678")
    amount: float = Field(..., gt=0, example=500.0)
    note: Optional[str] = Field(None, max_length=255, example="Dinner share")
    password: str = Field(..., min_length=4, description="User PIN for transaction authorization")


class CashOutRequest(BaseModel):
    agent_phone: str = Field(..., example="01912345678")
    amount: float = Field(..., gt=0, example=1000.0)
    password: str = Field(..., min_length=4, description="User PIN for Cash Out")


class MobileRechargeRequest(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=15, example="01700000000")
    operator: str = Field(..., example="Grameenphone")
    amount: float = Field(..., gt=0, example=50.0)
    recharge_type: Optional[str] = Field("PREPAID", example="PREPAID")


class MerchantPaymentRequest(BaseModel):
    merchant_id: Optional[int] = None
    merchant_phone: Optional[str] = Field(None, example="01612345678")
    amount: float = Field(..., gt=0, example=350.0)
    note: Optional[str] = Field(None, example="Grocery purchase")
    password: str = Field(..., min_length=4, description="User PIN for payment")


class AddMoneyRequest(BaseModel):
    amount: float = Field(..., gt=0, example=2000.0)
    source_bank_or_card: str = Field("Simulated Bank Transfer", example="City Bank Visa")


class TransactionResponse(BaseModel):
    id: int
    transaction_code: str
    sender_id: Optional[int] = None
    sender_name: Optional[str] = None
    sender_phone: Optional[str] = None
    receiver_id: Optional[int] = None
    receiver_name: Optional[str] = None
    receiver_phone: Optional[str] = None
    merchant_id: Optional[int] = None
    merchant_name: Optional[str] = None
    amount: float
    fee: float
    total_deducted_or_credited: float
    direction: str
    transaction_type: str
    status: str
    operator: Optional[str] = None
    note: Optional[str] = None
    location: Optional[str] = None
    transaction_time: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionListResponse(BaseModel):
    total: int
    transactions: List[TransactionResponse]
