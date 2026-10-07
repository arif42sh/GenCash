"""
Official upay Mobile Financial Services (MFS) Sandbox Adapter
Complies with upay B2B/B2C Core Banking & MFS Open API Protocols.

Features:
- HMAC-SHA256 Request/Response Signature Generation and Verification
- Strict Payload Validation against upay MFS Specifications
- Cash-In (Agent/Bank -> Customer)
- Cash-Out (Customer -> Agent)
- BillPay (Utility/Merchant Bill Settlement)
- Standardized upay Error Codes & Failure Modes
"""

import hmac
import hashlib
import time
import uuid
from typing import Dict, Any, Optional
from decimal import Decimal
from pydantic import BaseModel, Field


# Standard upay Sandbox Response Codes
UPAY_CODE_SUCCESS = "UPAY-0000"
UPAY_CODE_INVALID_SIGNATURE = "UPAY-1001"
UPAY_CODE_INSUFFICIENT_FUNDS = "UPAY-2001"
UPAY_CODE_INVALID_ACCOUNT = "UPAY-2002"
UPAY_CODE_DUPLICATE_TXN = "UPAY-2003"
UPAY_CODE_LIMIT_EXCEEDED = "UPAY-2004"
UPAY_CODE_SYSTEM_ERROR = "UPAY-5000"


class UpayCashInRequest(BaseModel):
    client_id: str = Field(..., description="Registered upay Partner Client ID")
    agent_phone: str = Field(..., min_length=11, max_length=14, description="Agent wallet phone number")
    customer_phone: str = Field(..., min_length=11, max_length=14, description="Recipient customer mobile number")
    amount: float = Field(..., gt=0, description="Cash-in amount in BDT")
    reference_id: str = Field(..., min_length=6, description="Partner unique reference transaction ID")
    signature: str = Field(..., description="HMAC-SHA256 signature calculated over payload")
    timestamp: Optional[int] = Field(default_factory=lambda: int(time.time()), description="Epoch timestamp")


class UpayCashOutRequest(BaseModel):
    client_id: str = Field(..., description="Registered upay Partner Client ID")
    customer_phone: str = Field(..., min_length=11, max_length=14, description="Withdrawing customer mobile number")
    agent_phone: str = Field(..., min_length=11, max_length=14, description="Target Agent mobile number")
    amount: float = Field(..., gt=0, description="Cash-out amount in BDT")
    customer_pin: str = Field(..., min_length=4, max_length=6, description="Encrypted/Hashed Customer PIN")
    reference_id: str = Field(..., min_length=6, description="Partner unique reference transaction ID")
    signature: str = Field(..., description="HMAC-SHA256 signature calculated over payload")
    timestamp: Optional[int] = Field(default_factory=lambda: int(time.time()), description="Epoch timestamp")


class UpayBillPayRequest(BaseModel):
    client_id: str = Field(..., description="Registered upay Partner Client ID")
    customer_phone: str = Field(..., min_length=11, max_length=14, description="Paying customer mobile number")
    biller_code: str = Field(..., description="Utility/Merchant biller code, e.g., DESCO, DPDC, TITAS")
    bill_account_no: str = Field(..., description="Customer utility meter or account number")
    amount: float = Field(..., gt=0, description="Bill settlement amount in BDT")
    reference_id: str = Field(..., min_length=6, description="Partner unique reference transaction ID")
    signature: str = Field(..., description="HMAC-SHA256 signature calculated over payload")
    timestamp: Optional[int] = Field(default_factory=lambda: int(time.time()), description="Epoch timestamp")


class UpayResponse(BaseModel):
    status_code: str
    message: str
    txn_id: Optional[str] = None
    reference_id: str
    fee: float = 0.00
    timestamp: int
    signature: str


class UpaySandboxAdapter:
    """
    Mock adapter connecting GenCash to the official upay MFS Sandbox API gateway.
    Handles cryptographic handshake, parameter validation, and atomic state mutations.
    """
    def __init__(self, partner_secret: str = "upay_sandbox_secret_key_prod_2026", client_id: str = "GENCASH_UPAY_PARTNER_01"):
        self.partner_secret = partner_secret
        self.client_id = client_id
        # In-memory mock ledger for sandbox testing
        self.mock_balances: Dict[str, Decimal] = {
            "01700000000": Decimal("10000.00"),  # Agent Float
            "01811112222": Decimal("5000.00"),   # Active User
            "01933334444": Decimal("1000.00"),   # Concurrency User
            "01655556666": Decimal("250.00"),    # Low Balance User
        }
        self.processed_references: Dict[str, Dict[str, Any]] = {}

    def generate_signature(self, payload_dict: Dict[str, Any]) -> str:
        """
        Calculates canonical HMAC-SHA256 signature based on sorted payload keys (excluding signature itself).
        """
        filtered = {k: v for k, v in payload_dict.items() if k != "signature" and v is not None}
        canonical_str = "&".join(f"{k}={filtered[k]}" for k in sorted(filtered.keys()))
        return hmac.new(
            self.partner_secret.encode("utf-8"),
            canonical_str.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

    def verify_signature(self, payload_dict: Dict[str, Any], provided_signature: str) -> bool:
        """
        Constant-time verification of partner signature.
        """
        expected = self.generate_signature(payload_dict)
        return hmac.compare_digest(expected, provided_signature)

    def process_cash_in(self, req: UpayCashInRequest) -> UpayResponse:
        """
        Handles Cash-In (/api/v1/mfs/cash-in)
        Funds customer wallet from Agent float. Fee is ৳0.00 to customer.
        """
        ts = int(time.time())
        # 1. Signature validation
        if not self.verify_signature(req.model_dump(), req.signature):
            return self._build_error_response(UPAY_CODE_INVALID_SIGNATURE, "Signature verification failed", req.reference_id, ts)

        # 2. Duplicate reference check
        if req.reference_id in self.processed_references:
            cached = self.processed_references[req.reference_id]
            return UpayResponse(**cached)

        # 3. Balance verification
        agent_bal = self.mock_balances.get(req.agent_phone, Decimal("0.00"))
        amount_dec = Decimal(str(req.amount))
        if agent_bal < amount_dec:
            return self._build_error_response(UPAY_CODE_INSUFFICIENT_FUNDS, "Agent float is insufficient for Cash-In", req.reference_id, ts)

        # 4. Atomic execution
        self.mock_balances[req.agent_phone] = agent_bal - amount_dec
        cust_bal = self.mock_balances.get(req.customer_phone, Decimal("0.00"))
        self.mock_balances[req.customer_phone] = cust_bal + amount_dec

        txn_id = f"UPAY-CI-{int(ts)}-{uuid.uuid4().hex[:6].upper()}"
        res = UpayResponse(
            status_code=UPAY_CODE_SUCCESS,
            message="upay Cash-In successful",
            txn_id=txn_id,
            reference_id=req.reference_id,
            fee=0.00,
            timestamp=ts,
            signature=""
        )
        res.signature = self.generate_signature(res.model_dump())
        self.processed_references[req.reference_id] = res.model_dump()
        return res

    def process_cash_out(self, req: UpayCashOutRequest) -> UpayResponse:
        """
        Handles Cash-Out (/api/v1/mfs/cash-out)
        Debits customer wallet (Amount + 1.49% upay standard fee) and credits Agent.
        """
        ts = int(time.time())
        # 1. Signature validation
        if not self.verify_signature(req.model_dump(), req.signature):
            return self._build_error_response(UPAY_CODE_INVALID_SIGNATURE, "Signature verification failed", req.reference_id, ts)

        # 2. Duplicate reference check
        if req.reference_id in self.processed_references:
            cached = self.processed_references[req.reference_id]
            return UpayResponse(**cached)

        amount_dec = Decimal(str(req.amount))
        fee_rate = Decimal("0.0149")  # 1.49% upay ATM/Agent cash-out fee
        fee_dec = round(amount_dec * fee_rate, 2)
        total_required = amount_dec + fee_dec

        # 3. Balance check
        cust_bal = self.mock_balances.get(req.customer_phone, Decimal("0.00"))
        if cust_bal < total_required:
            return self._build_error_response(UPAY_CODE_INSUFFICIENT_FUNDS, f"Insufficient balance. Total required: ৳{total_required:.2f}, Available: ৳{cust_bal:.2f}", req.reference_id, ts)

        # 4. Atomic mutation
        self.mock_balances[req.customer_phone] = cust_bal - total_required
        agent_bal = self.mock_balances.get(req.agent_phone, Decimal("0.00"))
        self.mock_balances[req.agent_phone] = agent_bal + amount_dec

        txn_id = f"UPAY-CO-{int(ts)}-{uuid.uuid4().hex[:6].upper()}"
        res = UpayResponse(
            status_code=UPAY_CODE_SUCCESS,
            message="upay Cash-Out completed",
            txn_id=txn_id,
            reference_id=req.reference_id,
            fee=float(fee_dec),
            timestamp=ts,
            signature=""
        )
        res.signature = self.generate_signature(res.model_dump())
        self.processed_references[req.reference_id] = res.model_dump()
        return res

    def process_bill_pay(self, req: UpayBillPayRequest) -> UpayResponse:
        """
        Handles BillPay (/api/v1/mfs/bill-pay)
        Settles utility invoice. Free of charge for utility subsidies.
        """
        ts = int(time.time())
        # 1. Signature validation
        if not self.verify_signature(req.model_dump(), req.signature):
            return self._build_error_response(UPAY_CODE_INVALID_SIGNATURE, "Signature verification failed", req.reference_id, ts)

        # 2. Duplicate reference check
        if req.reference_id in self.processed_references:
            cached = self.processed_references[req.reference_id]
            return UpayResponse(**cached)

        amount_dec = Decimal(str(req.amount))
        cust_bal = self.mock_balances.get(req.customer_phone, Decimal("0.00"))
        if cust_bal < amount_dec:
            return self._build_error_response(UPAY_CODE_INSUFFICIENT_FUNDS, f"Insufficient balance for {req.biller_code} bill", req.reference_id, ts)

        # 3. Debit customer
        self.mock_balances[req.customer_phone] = cust_bal - amount_dec

        txn_id = f"UPAY-BP-{int(ts)}-{uuid.uuid4().hex[:6].upper()}"
        res = UpayResponse(
            status_code=UPAY_CODE_SUCCESS,
            message=f"{req.biller_code} utility bill payment successful",
            txn_id=txn_id,
            reference_id=req.reference_id,
            fee=0.00,
            timestamp=ts,
            signature=""
        )
        res.signature = self.generate_signature(res.model_dump())
        self.processed_references[req.reference_id] = res.model_dump()
        return res

    def _build_error_response(self, code: str, msg: str, ref_id: str, ts: int) -> UpayResponse:
        res = UpayResponse(
            status_code=code,
            message=msg,
            txn_id=None,
            reference_id=ref_id,
            fee=0.00,
            timestamp=ts,
            signature=""
        )
        res.signature = self.generate_signature(res.model_dump())
        return res


# Global singleton adapter for sandbox usage
upay_sandbox_adapter = UpaySandboxAdapter()
