"""
GenCash Idempotency Validation Engine Test Suite
Tests distributed idempotency guarantees via X-Idempotency-Key:
1. Replay with identical key & payload returns cached HTTP response with zero duplicate ledger records.
2. Balance is debited exactly once, not twice.
3. Payload mismatch detection on key reuse returns 422 Unprocessable Entity.
"""

import uuid
from decimal import Decimal
import pytest
from app.core.database import SessionLocal
from app.models.user import Wallet
from app.models.transaction import Transaction


def test_idempotency_duplicate_request_replayed_without_double_debit(client, test_user, test_agent, auth_headers):
    """
    Simulates network retry / duplicate POST request with the same X-Idempotency-Key.
    Asserts:
    - First request executes transaction and debits balance.
    - Second request returns cached response (HTTP 201/200) with identical payload.
    - User balance is debited ONLY ONCE.
    - Exactly ONE transaction record exists in the database for this operation.
    """
    idempotency_key = f"IDEM-TEST-{uuid.uuid4().hex}"
    req_headers = {
        **auth_headers,
        "X-Idempotency-Key": idempotency_key,
        "Content-Type": "application/json"
    }

    # Reset balance to ৳2,000.00
    db = SessionLocal()
    try:
        w = db.query(Wallet).filter(Wallet.user_id == test_user.id).first()
        w.balance = Decimal("2000.00")
        db.commit()
    finally:
        db.close()

    payload = {
        "agent_phone": test_agent.phone,
        "amount": 250.0,
        "password": "1234",
        "waive_fee": True
    }

    # First request: should execute normally
    res1 = client.post("/api/transactions/cashout", json=payload, headers=req_headers)
    assert res1.status_code == 201, f"First request failed: {res1.text}"
    body1 = res1.json()
    txn_code1 = body1.get("transaction_code")
    assert txn_code1 is not None

    # Check balance after first request (2000 - 250 = 1750)
    db = SessionLocal()
    try:
        w = db.query(Wallet).filter(Wallet.user_id == test_user.id).first()
        bal_after_first = Decimal(str(w.balance))
        assert bal_after_first == Decimal("1750.00"), f"Expected 1750.00, got {bal_after_first}"
    finally:
        db.close()

    # Second request: Network retry with the EXACT SAME X-Idempotency-Key and payload
    res2 = client.post("/api/transactions/cashout", json=payload, headers=req_headers)
    assert res2.status_code == 201, f"Second idempotent request failed: {res2.text}"
    assert res2.headers.get("X-Cache-Lookup") == "HIT-IDEMPOTENT-REPLAY"
    body2 = res2.json()

    # Assert response payload is identical to the first response
    assert body2["transaction_code"] == txn_code1
    assert body2["amount"] == 250.0

    # Assert balance has NOT been deducted again (still strictly ৳1,750.00)
    db = SessionLocal()
    try:
        w = db.query(Wallet).filter(Wallet.user_id == test_user.id).first()
        bal_after_second = Decimal(str(w.balance))
        assert bal_after_second == Decimal("1750.00"), f"Balance double debited! Found: {bal_after_second}"

        # Assert exactly ONE transaction record exists in DB for this code
        txns = db.query(Transaction).filter(Transaction.transaction_code == txn_code1).all()
        assert len(txns) == 1, f"Expected 1 transaction record in DB, found {len(txns)}"
    finally:
        db.close()


def test_idempotency_payload_mismatch_rejected(client, test_user, test_agent, auth_headers):
    """
    Asserts that reusing an existing X-Idempotency-Key with a conflicting/tampered payload
    is rejected with HTTP 422 Unprocessable Entity.
    """
    idempotency_key = f"IDEM-MISMATCH-{uuid.uuid4().hex}"
    req_headers = {
        **auth_headers,
        "X-Idempotency-Key": idempotency_key,
        "Content-Type": "application/json"
    }

    payload_a = {
        "agent_phone": test_agent.phone,
        "amount": 100.0,
        "password": "1234",
        "waive_fee": True
    }
    # Initial request
    res_a = client.post("/api/transactions/cashout", json=payload_a, headers=req_headers)
    assert res_a.status_code == 201

    # Tampered request reusing the same key with different amount
    payload_b = {
        "agent_phone": test_agent.phone,
        "amount": 999.0,  # Changed amount
        "password": "1234",
        "waive_fee": True
    }
    res_b = client.post("/api/transactions/cashout", json=payload_b, headers=req_headers)
    assert res_b.status_code == 422, f"Expected 422 for payload mismatch, got {res_b.status_code}"
    assert "Idempotency-Key already used with different payload" in res_b.text
