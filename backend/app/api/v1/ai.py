from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, get_optional_current_user
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


class DismissOfferRequest(BaseModel):
    offer_id: str
    category: Optional[str] = None
    reason: Optional[str] = "dismissed_by_user"


@router.post("/offers/dismiss")
def dismiss_offer(
    request: DismissOfferRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Offer Fatigue Shield: User dismisses or closes an offer.
    Records an unengaged campaign response in DB and increments fatigue score.
    """
    user_id = current_user.id if current_user else 1
    return AIService.record_offer_dismissal(db=db, user_id=user_id, offer_id=request.offer_id)


@router.get("/next-best-offers")
def get_next_best_offers(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Track 04 Next-Best-Offer API:
    Returns ML-ranked offers for this customer with conversion probabilities,
    Uplift segmentation, and natural language explainable reasons (Bengali & English).
    Supports authenticated user or guest persona fallback.
    """
    user_id = current_user.id if current_user else 1
    return AIService.get_user_next_best_offers(db=db, user_id=user_id)



@router.get("/campaigns/simulate")
def simulate_campaign(
    budget: float = 100000.0,
    audience_size: int = 50000,
    discount_value: float = 79.0
):
    """
    Track 04 Admin Campaign Simulator:
    Demonstrates 35%+ budget savings and 2.4x conversion uplift by targeting Persuadables.
    """
    return AIService.simulate_campaign(
        budget=budget,
        audience_size=audience_size,
        discount_value=discount_value
    )
