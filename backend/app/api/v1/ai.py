from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.ai import AIInsight
from app.services.ai_service import AIService
from app.schemas.ai import (
    AIInsightResponse,
    AIRecommendationResponse,
    AIFeedbackRequest,
)

router = APIRouter(prefix="/ai", tags=["AI Intelligence"])


@router.get("/insights", response_model=List[AIInsightResponse])
def get_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-generated explainable insights tailored for the authenticated customer.
    """
    insights = (
        db.query(AIInsight)
        .filter(AIInsight.user_id == current_user.id)
        .order_by(AIInsight.created_at.desc())
        .limit(10)
        .all()
    )
    return [AIInsightResponse.model_validate(i) for i in insights]


@router.get("/recommendations", response_model=AIRecommendationResponse)
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get composite AI recommendation package with spending forecasts and next-best actions.
    """
    return AIService.get_user_intelligence(db=db, user_id=current_user.id)


@router.post("/feedback", status_code=status.HTTP_200_OK)
def submit_ai_feedback(
    request: AIFeedbackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit feedback loop data (ACCEPTED/DISMISSED) on an AI insight to close the intelligence loop.
    """
    return AIService.record_feedback(db=db, user_id=current_user.id, request=request)
