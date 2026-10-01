from datetime import datetime
from sqlalchemy import Column, BigInteger, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    entity_type = Column(String(50), default="USER", nullable=False)
    entity_id = Column(BigInteger, nullable=True)
    insight_type = Column(String(100), nullable=False, index=True)
    prediction = Column(Text, nullable=False)
    confidence = Column(Numeric(5, 4), default=0.85, nullable=False)
    explanation = Column(Text, nullable=False)
    model_version = Column(String(50), default="v1.0-prototype", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="ai_insights")
