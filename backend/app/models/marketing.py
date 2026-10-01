from datetime import datetime, date
from sqlalchemy import Column, BigInteger, String, Text, Numeric, DateTime, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class Offer(Base):
    __tablename__ = "offers"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    offer_type = Column(String(50), nullable=False)  # CASHBACK, DISCOUNT, RECHARGE_BONUS
    discount_value = Column(Numeric(10, 2), default=0.00, nullable=False)
    minimum_transaction = Column(Numeric(15, 2), default=0.00, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(20), default="ACTIVE", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    campaigns = relationship("Campaign", back_populates="offer")


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    campaign_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    offer_id = Column(BigInteger, ForeignKey("offers.id"), nullable=False)
    target_segment = Column(String(100), nullable=False)
    budget = Column(Numeric(15, 2), default=0.00, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(20), default="ACTIVE", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    offer = relationship("Offer", back_populates="campaigns")
    responses = relationship("CampaignResponse", back_populates="campaign")


class CampaignResponse(Base):
    __tablename__ = "campaign_responses"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    campaign_id = Column(BigInteger, ForeignKey("campaigns.id"), nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    viewed = Column(Boolean, default=False, nullable=False)
    clicked = Column(Boolean, default=False, nullable=False)
    accepted = Column(Boolean, default=False, nullable=False)
    converted = Column(Boolean, default=False, nullable=False)
    transaction_value = Column(Numeric(15, 2), default=0.00, nullable=False)
    responded_at = Column(DateTime, nullable=True)

    # Relationships
    campaign = relationship("Campaign", back_populates="responses")
    user = relationship("User", back_populates="campaign_responses")
