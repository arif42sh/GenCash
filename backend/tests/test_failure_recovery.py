"""
GenCash Failure Recovery & Atomic Rollback Integration Test Suite
Validates ACID transactional guarantees under simulated runtime faults:
- Mid-transfer database exception triggers immediate rollback.
- User balances are preserved with 100% precision.
- Zero orphaned or partial ledger entries created.
"""

from decimal import Decimal
from unittest.mock import patch
import pytest
from fastapi import HTTPException

from app.core.database import SessionLocal
from app.models.user import User, Wallet
from app.models.transaction import Transaction
from app.services.transaction_service import TransactionService
from app.schemas.transaction import SendMoneyRequest, CashOutRequest


def test_atomic_rollback_on_database_commit_failure(test_user, test_agent):
    """
    FAULT INJECTION TEST:
    Simulates a sudden database disconnect or constraint failure right when `db.commit()` is called.
    Asserts:
    - Transaction raises HTTPException (500).
    - Database triggers an immediate ROLLBACK.
    - Sender balance is NOT deducted.
    - Receiver balance is NOT credited.
    - Zero orphaned transaction records exist in the database.
    """
    db = SessionLocal()
    try:
        sender = db.query(User).filter(User.id == test_user.id).first()
        receiver = db.query(User).filter(User.id == test_agent.id).first()

        sender_wallet = db.query(Wallet).filter(Wallet.user_id == sender.id).first()
        receiver_wallet = db.query(Wallet).filter(Wallet.user_id == receiver.id).first()

        sender_initial_bal = Decimal("1500.00")
        receiver_initial_bal = Decimal("5000.00")

        sender_wallet.balance = sender_initial_bal
        receiver_wallet.balance = receiver_initial_bal
        db.commit()

        transfer_amount = 300.0
        req = SendMoneyRequest(
            receiver_phone=receiver.phone,
            amount=transfer_amount,
            note="Crash Simulation Test",
            password="1234"
        )

        # Inject simulated database commit failure
        with patch.object(db, "commit", side_effect=RuntimeError("Simulated DB connection dropped during commit")):
            with pytest.raises(HTTPException) as exc_info:
                TransactionService.process_send_money(db, sender=sender, request=req)

            assert exc_info.value.status_code == 500
            assert "Transaction failed" in str(exc_info.value.detail)

    finally:
        db.close()

    # Verify atomic rollback in a fresh, isolated database session
    verify_db = SessionLocal()
    try:
        s_w = verify_db.query(Wallet).filter(Wallet.user_id == test_user.id).first()
        r_w = verify_db.query(Wallet).filter(Wallet.user_id == test_agent.id).first()

        # Sender balance must remain completely untouched
        assert Decimal(str(s_w.balance)) == sender_initial_bal, (
            f"Sender balance leaked! Expected {sender_initial_bal}, got {s_w.balance}"
        )

        # Receiver balance must remain completely untouched
        assert Decimal(str(r_w.balance)) == receiver_initial_bal, (
            f"Receiver balance altered! Expected {receiver_initial_bal}, got {r_w.balance}"
        )

        # Ensure no orphaned transaction with note 'Crash Simulation Test' was written
        orphaned_txn = verify_db.query(Transaction).filter(
            Transaction.sender_id == test_user.id,
            Transaction.note == "Crash Simulation Test"
        ).first()
        assert orphaned_txn is None, "Orphaned transaction record was improperly committed!"
    finally:
        verify_db.close()


def test_atomic_rollback_on_cash_out_notification_failure(test_user, test_agent):
    """
    FAULT INJECTION TEST:
    Simulates runtime exception during notification construction before commit.
    Asserts wallet balance remains intact with zero partial mutation.
    """
    db = SessionLocal()
    try:
        sender = db.query(User).filter(User.id == test_user.id).first()
        w = db.query(Wallet).filter(Wallet.user_id == sender.id).first()
        w.balance = Decimal("800.00")
        db.commit()

        initial_balance = Decimal("800.00")
        req = CashOutRequest(
            agent_phone=test_agent.phone,
            amount=200.0,
            password="1234",
            waive_fee=True
        )

        # Inject exception during db.add when Notification is added
        original_add = db.add

        def faulty_add(obj):
            if obj.__class__.__name__ == "Notification":
                raise RuntimeError("Notification subsystem timeout")
            return original_add(obj)

        with patch.object(db, "add", side_effect=faulty_add):
            with pytest.raises(HTTPException) as exc:
                TransactionService.process_cash_out(db, sender=sender, request=req)
            assert exc.value.status_code == 500

    finally:
        db.close()

    # Verify balance is restored
    verify_db = SessionLocal()
    try:
        w = verify_db.query(Wallet).filter(Wallet.user_id == test_user.id).first()
        assert Decimal(str(w.balance)) == initial_balance
    finally:
        verify_db.close()
