from datetime import datetime
from sqlalchemy import Column, BigInteger, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class MerchantCategory(Base):
    __tablename__ = "merchant_categories"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True, default="storefront")
    status = Column(String(20), default="ACTIVE", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    merchants = relationship("Merchant", back_populates="category")


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    merchant_name = Column(String(150), nullable=False, index=True)
    category_id = Column(BigInteger, ForeignKey("merchant_categories.id"), nullable=False)
    phone = Column(String(20), nullable=False, unique=True)
    location = Column(String(150), nullable=False)
    latitude = Column(Numeric(10, 6), nullable=True)
    longitude = Column(Numeric(10, 6), nullable=True)
    status = Column(String(20), default="ACTIVE", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    category = relationship("MerchantCategory", back_populates="merchants")
    transactions = relationship("Transaction", back_populates="merchant")
