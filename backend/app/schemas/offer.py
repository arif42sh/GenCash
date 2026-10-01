from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class OfferResponse(BaseModel):
    id: int
    title: str
    description: str
    offer_type: str
    discount_value: float
    minimum_transaction: float
    start_date: date
    end_date: date
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
