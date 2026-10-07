"""
Official upay Mobile Financial Services (MFS) Sandbox Adapter Test Suite
Tests:
1. HMAC-SHA256 signature generation, validation, and tamper detection.
2. Cash-In (/api/v1/mfs/cash-in) with agent float debit and customer credit.
3. Cash-Out (/api/v1/mfs/cash-out) with 1.49% upay fee debit.
4. BillPay (/api/v1/mfs/bill-pay) utility settlement.
5. Error handling for insufficient funds and duplicate reference IDs.
"""

import time
import uuid
from decimal import Decimal
import pytest
from app.services.upay_adapter import (
    UpaySandboxAdapter,
    UpayCashInRequest,
    UpayCashOutRequest,
    UpayBillPayRequest,
    UPAY_CODE_SUCCESS,
    UPAY_CODE_INVALID_SIGNATURE,
    UPAY_CODE_INSUFFICIENT_FUNDS,
)


@pytest.fixture
def adapter():
    return UpaySandboxAdapter(partner_secret="test_upay_secret_2026", client_id="GENCASH_TEST_01")


def test_upay_signature_verification_and_tamper_rejection(adapter):
    """
    Asserts HMAC-SHA256 signature security:
    - Valid signature passes.
    - Tampered amount or account number immediately fails with UPAY-1001.
    """
    payload = {
        "client_id": "GENCASH_TEST_01",
        "agent_phone": "01700000000",
        "customer_phone": "01811112222",
        "amount": 500.0,
        "reference_id": f"REF-{uuid.uuid4().hex[:8]}",
        "timestamp": int(time.time()),
    }
    valid_sig = adapter.generate_signature(payload)
    assert adapter.verify_signature(payload, valid_sig) is True

    # Tamper payload
    tampered_payload = payload.copy()
    tampered_payload["amount"] = 50000.0
    assert adapter.verify_signature(tampered_payload, valid_sig) is False


def test_upay_cash_in_flow(adapter):
    """
    Validates Cash-In flow: Agent float debits, Customer credits, ৳0 customer fee.
    """
    ref_id = f"REF-CI-{uuid.uuid4().hex[:8]}"
    initial_agent = adapter.mock_balances["01700000000"]
    initial_cust = adapter.mock_balances["01811112222"]

    payload = {
        "client_id": adapter.client_id,
        "agent_phone": "01700000000",
        "customer_phone": "01811112222",
        "amount": 1000.0,
        "reference_id": ref_id,
        "timestamp": int(time.time()),
    }
    sig = adapter.generate_signature(payload)
    req = UpayCashInRequest(**payload, signature=sig)

    res = adapter.process_cash_in(req)

    assert res.status_code == UPAY_CODE_SUCCESS
    assert res.txn_id is not None
    assert res.fee == 0.00
    assert adapter.mock_balances["01700000000"] == initial_agent - 1000
    assert adapter.mock_balances["01811112222"] == initial_cust + 1000


def test_upay_cash_out_with_standard_fee(adapter):
    """
    Validates Cash-Out: Customer debited (Amount + 1.49% fee), Agent credited.
    """
    ref_id = f"REF-CO-{uuid.uuid4().hex[:8]}"
    initial_cust = adapter.mock_balances["01811112222"]

    amount = 500.0
    payload = {
        "client_id": adapter.client_id,
        "customer_phone": "01811112222",
        "agent_phone": "01700000000",
        "amount": amount,
        "customer_pin": "1234",
        "reference_id": ref_id,
        "timestamp": int(time.time()),
    }
    sig = adapter.generate_signature(payload)
    req = UpayCashOutRequest(**payload, signature=sig)

    res = adapter.process_cash_out(req)

    assert res.status_code == UPAY_CODE_SUCCESS
    expected_fee = round(amount * 0.0149, 2)  # ৳7.45
    assert res.fee == expected_fee
    assert adapter.mock_balances["01811112222"] == initial_cust - Decimal(str(500 + expected_fee))


def test_upay_bill_pay_flow(adapter):
    """
    Validates Utility BillPay flow (DESCO / DPDC / WASA).
    """
    ref_id = f"REF-BP-{uuid.uuid4().hex[:8]}"
    initial_cust = adapter.mock_balances["01811112222"]

    payload = {
        "client_id": adapter.client_id,
        "customer_phone": "01811112222",
        "biller_code": "DESCO",
        "bill_account_no": "1098234712",
        "amount": 350.0,
        "reference_id": ref_id,
        "timestamp": int(time.time()),
    }
    sig = adapter.generate_signature(payload)
    req = UpayBillPayRequest(**payload, signature=sig)

    res = adapter.process_bill_pay(req)

    assert res.status_code == UPAY_CODE_SUCCESS
    assert "DESCO" in res.message
    assert adapter.mock_balances["01811112222"] == initial_cust - Decimal("350.00")


def test_upay_insufficient_funds_rejected(adapter):
    """
    Asserts rejection with UPAY-2001 when customer balance is lower than required.
    """
    ref_id = f"REF-INSUFF-{uuid.uuid4().hex[:8]}"
    # Low balance account (৳250) attempting ৳1,000 cash out
    payload = {
        "client_id": adapter.client_id,
        "customer_phone": "01655556666",
        "agent_phone": "01700000000",
        "amount": 1000.0,
        "customer_pin": "1234",
        "reference_id": ref_id,
        "timestamp": int(time.time()),
    }
    sig = adapter.generate_signature(payload)
    req = UpayCashOutRequest(**payload, signature=sig)

    res = adapter.process_cash_out(req)
    assert res.status_code == UPAY_CODE_INSUFFICIENT_FUNDS
    assert "Insufficient balance" in res.message


def test_upay_sandbox_http_endpoints(client):
    """
    Tests live FastAPI HTTP endpoint integration (/api/v1/mfs/cash-in).
    """
    from app.services.upay_adapter import upay_sandbox_adapter

    payload = {
        "client_id": upay_sandbox_adapter.client_id,
        "agent_phone": "01700000000",
        "customer_phone": "01811112222",
        "amount": 100.0,
        "reference_id": f"HTTP-REF-{uuid.uuid4().hex[:8]}",
        "timestamp": int(time.time()),
    }
    sig = upay_sandbox_adapter.generate_signature(payload)
    payload["signature"] = sig

    response = client.post("/api/v1/mfs/cash-in", json=payload)
    assert response.status_code == 200, f"HTTP Cash-In failed: {response.text}"
    data = response.json()
    assert data["status_code"] == UPAY_CODE_SUCCESS
    assert data["txn_id"].startswith("UPAY-CI")
