from datetime import datetime
from sqlalchemy import Column, BigInteger, String, Numeric, DateTime, ForeignKey, Boolean, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class UserStatus(str):
    ACTIVE = "ACTIVE"
    BLOCKED = "BLOCKED"


class WalletStatus(str):
    ACTIVE = "ACTIVE"
    FROZEN = "FROZEN"


class AdminRole(str):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    ANALYST = "ANALYST"


class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(150), nullable=True, index=True)
    password_hash = Column(String(255), nullable=False)
    profile_image = Column(Text, nullable=True)
    status = Column(String(20), default="ACTIVE", nullable=False)
    nid_number = Column(String(30), nullable=True, index=True)
    dob = Column(String(20), nullable=True)
    kyc_status = Column(String(20), default="VERIFIED", nullable=False)
    kyc_rejection_reason = Column(String(255), nullable=True)
    kyc_verified_at = Column(DateTime, nullable=True)
    failed_pin_attempts = Column(BigInteger, default=0, nullable=False)
    is_agent = Column(Boolean, default=False, nullable=False)
    outlet_name = Column(String(150), nullable=True)
    agent_code = Column(String(30), nullable=True, index=True)
    thana = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    commission_earned = Column(Numeric(15, 2), default=0.00, nullable=False)
    minimum_float = Column(Numeric(15, 2), default=10000.00, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    wallet = relationship("Wallet", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sent_transactions = relationship("Transaction", foreign_keys="Transaction.sender_id", back_populates="sender")
    received_transactions = relationship("Transaction", foreign_keys="Transaction.receiver_id", back_populates="receiver")
    ai_insights = relationship("AIInsight", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    campaign_responses = relationship("CampaignResponse", back_populates="user")


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    balance = Column(Numeric(15, 2), default=5000.00, nullable=False)
    currency = Column(String(5), default="BDT", nullable=False)
    status = Column(String(20), default="ACTIVE", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="wallet")


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), default="ADMIN", nullable=False)
    status = Column(String(20), default="ACTIVE", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    audit_logs = relationship("AuditLog", back_populates="admin")
