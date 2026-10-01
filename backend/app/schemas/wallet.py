from datetime import datetime
from pydantic import BaseModel


class WalletResponse(BaseModel):
    id: int
    user_id: int
    balance: float
    currency: str
    status: str
    updated_at: datetime

    class Config:
        from_attributes = True


class BalanceResponse(BaseModel):
    balance: float
    currency: str
    status: str
