from datetime import datetime
from enum import Enum
from sqlalchemy import Column, BigInteger, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class TransactionType(str, Enum):
    SEND_MONEY = "SEND_MONEY"
    CASH_OUT = "CASH_OUT"
    ADD_MONEY = "ADD_MONEY"
    RECHARGE = "RECHARGE"
    MERCHANT_PAYMENT = "MERCHANT_PAYMENT"
    BILL_PAYMENT = "BILL_PAYMENT"
    RECEIVE_MONEY = "RECEIVE_MONEY"


class TransactionStatus(str, Enum):
    COMPLETED = "COMPLETED"
    PENDING = "PENDING"
    FAILED = "FAILED"
    REVERSED = "REVERSED"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    transaction_code = Column(String(50), unique=True, index=True, nullable=False)
    sender_id = Column(BigInteger, ForeignKey("users.id"), nullable=True, index=True)
    receiver_id = Column(BigInteger, ForeignKey("users.id"), nullable=True, index=True)
    merchant_id = Column(BigInteger, ForeignKey("merchants.id"), nullable=True, index=True)
    
    amount = Column(Numeric(15, 2), nullable=False)
    fee = Column(Numeric(15, 2), default=0.00, nullable=False)
    transaction_type = Column(String(30), nullable=False, index=True)
    status = Column(String(20), default=TransactionStatus.COMPLETED.value, nullable=False, index=True)
    
    # Context / Metadata
    recipient_phone = Column(String(20), nullable=True)
    operator = Column(String(50), nullable=True)  # For RECHARGE
    note = Column(String(255), nullable=True)
    location = Column(String(150), nullable=True)
    device_id = Column(String(100), nullable=True)
    
    transaction_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_transactions")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_transactions")
    merchant = relationship("Merchant", back_populates="transactions")
