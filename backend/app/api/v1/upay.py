"""
Official upay Mobile Financial Services (MFS) Sandbox Router
Exposes official API endpoints adhering to Bangladesh Bank and upay Open API specs:
- POST /api/v1/mfs/cash-in
- POST /api/v1/mfs/cash-out
- POST /api/v1/mfs/bill-pay
"""

from fastapi import APIRouter, HTTPException, status
from app.services.upay_adapter import (
    upay_sandbox_adapter,
    UpayCashInRequest,
    UpayCashOutRequest,
    UpayBillPayRequest,
    UpayResponse,
    UPAY_CODE_SUCCESS,
)

router = APIRouter(prefix="/mfs", tags=["upay MFS Sandbox Gateway"])


@router.post("/cash-in", response_model=UpayResponse, status_code=status.HTTP_200_OK)
def upay_cash_in(request: UpayCashInRequest):
    """
    upay Agent Cash-In Endpoint:
    Funds customer mobile wallet from authorized agent float.
    Requires HMAC-SHA256 signature verification.
    """
    res = upay_sandbox_adapter.process_cash_in(request)
    if res.status_code != UPAY_CODE_SUCCESS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=res.dict())
    return res


@router.post("/cash-out", response_model=UpayResponse, status_code=status.HTTP_200_OK)
def upay_cash_out(request: UpayCashOutRequest):
    """
    upay Customer Cash-Out Endpoint:
    Debits customer mobile wallet and credits agent float.
    Applies standard 1.49% upay cash-out fee.
    """
    res = upay_sandbox_adapter.process_cash_out(request)
    if res.status_code != UPAY_CODE_SUCCESS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=res.dict())
    return res


@router.post("/bill-pay", response_model=UpayResponse, status_code=status.HTTP_200_OK)
def upay_bill_pay(request: UpayBillPayRequest):
    """
    upay Utility BillPay Endpoint:
    Real-time utility bill settlement (DESCO, DPDC, TITAS, WASA).
    """
    res = upay_sandbox_adapter.process_bill_pay(request)
    if res.status_code != UPAY_CODE_SUCCESS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=res.dict())
    return res


@router.get("/balance/{phone}", status_code=status.HTTP_200_OK)
def get_sandbox_balance(phone: str):
    """
    Query current sandbox balance for testing and verification.
    """
    bal = upay_sandbox_adapter.mock_balances.get(phone)
    if bal is None:
        raise HTTPException(status_code=404, detail=f"Phone {phone} not found in upay sandbox ledger")
    return {"phone": phone, "balance": float(bal), "currency": "BDT"}
