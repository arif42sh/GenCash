from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.marketing import Offer
from app.schemas.offer import OfferResponse

router = APIRouter(prefix="/offers", tags=["Offers"])


@router.get("/popup/active", response_model=Optional[OfferResponse])
def get_active_popup_offer(db: Session = Depends(get_db)):
    """Retrieve the currently active app-launch pop-up campaign offer."""
    offer = (
        db.query(Offer)
        .filter(Offer.status == "ACTIVE", Offer.is_popup_banner == True)
        .order_by(Offer.created_at.desc())
        .first()
    )
    if not offer:
        offer = (
            db.query(Offer)
            .filter(Offer.status == "ACTIVE", Offer.banner_image_url.isnot(None))
            .order_by(Offer.created_at.desc())
            .first()
        )
    if not offer:
        return None
    return OfferResponse.model_validate(offer)


@router.get("", response_model=List[OfferResponse])
def get_active_offers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all currently active promotional offers and discounts."""
    offers = db.query(Offer).filter(Offer.status == "ACTIVE").all()
    return [OfferResponse.model_validate(o) for o in offers]


@router.get("/{id}", response_model=OfferResponse)
def get_offer(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve details of a single offer."""
    offer = db.query(Offer).filter(Offer.id == id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found.")
    return OfferResponse.model_validate(offer)
