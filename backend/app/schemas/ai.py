from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class AIInsightResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    entity_type: str
    insight_type: str
    prediction: str
    confidence: float
    explanation: str
    model_version: str
    created_at: datetime

    class Config:
        from_attributes = True


class AIRecommendationItem(BaseModel):
    id: str
    category: str
    title: str
    description: str
    action_type: str
    action_payload: Optional[Dict[str, Any]] = None
    confidence: float
    reason: str


class AIRecommendationResponse(BaseModel):
    user_id: int
    total_insights: int
    primary_insight: Optional[AIInsightResponse] = None
    recommendations: List[AIRecommendationItem] = []
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class AIFeedbackRequest(BaseModel):
    insight_id: int
    action_taken: str = Field(..., example="ACCEPTED")  # ACCEPTED, DISMISSED, CLICKED
    feedback_score: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None
