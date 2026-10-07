"""
GenCash Concurrency & Pessimistic Row-Locking Integration Test Suite
Validates that simultaneous withdrawal requests targeting the same wallet balance
are serialized cleanly by MySQL InnoDB `SELECT ... FOR UPDATE` row locks,
eliminating double-spend race conditions and negative overdrafts.
"""

import threading
import concurrent.futures
from decimal import Decimal
import pytest
from fastapi import HTTPException

from app.core.database import SessionLocal
from app.models.user import User, Wallet
from app.services.transaction_service import TransactionService
from app.schemas.transaction import CashOutRequest, SendMoneyRequest


def test_concurrent_withdrawal_race_condition(test_user, test_agent):
    """
    STRESS TEST: Exactly 10 concurrent threads attempt to withdraw ৳200 simultaneously
    from a wallet with an initial balance of ৳1,000.00.

    Requirements Asserted:
    1. Exactly 5 withdrawals succeed (5 x ৳200 = ৳1,000 drained).
    2. Exactly 5 withdrawals fail cleanly with HTTP 400 (Insufficient Funds).
    3. Final wallet balance in database is strictly ৳0.00 (NO negative balance / overdraft).
    4. Row-level pessimistic locking (`with_for_update`) prevents dirty reads and lost updates.
    """
    user_id = test_user.id
    agent_phone = test_agent.phone
    num_threads = 10
    withdrawal_amount = 200.0

    # Ensure clean start state
    init_db = SessionLocal()
    try:
        w = init_db.query(Wallet).filter(Wallet.user_id == user_id).first()
        w.balance = Decimal("1000.00")
        init_db.commit()
    finally:
        init_db.close()

    barrier = threading.Barrier(num_threads)
    results = []

    def execute_withdrawal(thread_id: int):
        thread_db = SessionLocal()
        try:
            # Sync all threads to hit the database at the exact same millisecond
            barrier.wait(timeout=5)

            sender = thread_db.query(User).filter(User.id == user_id).first()
            req = CashOutRequest(
                agent_phone=agent_phone,
                amount=withdrawal_amount,
                password="1234",
                waive_fee=True  # ৳200 flat deduction per withdrawal
            )

            res = TransactionService.process_cash_out(thread_db, sender=sender, request=req)
            return {"thread_id": thread_id, "status": "SUCCESS", "txn_code": res.transaction_code}
        except HTTPException as he:
            return {"thread_id": thread_id, "status": "FAIL_HTTP", "code": he.status_code, "detail": str(he.detail)}
        except Exception as ex:
            return {"thread_id": thread_id, "status": "ERROR", "error": str(ex)}
        finally:
            thread_db.close()

    # Dispatch 10 concurrent threads
    with concurrent.futures.ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = [executor.submit(execute_withdrawal, i) for i in range(num_threads)]
        for f in concurrent.futures.as_completed(futures):
            results.append(f.result())

    # Aggregate outcomes
    successful_txns = [r for r in results if r["status"] == "SUCCESS"]
    failed_txns = [r for r in results if r["status"] == "FAIL_HTTP"]
    system_errors = [r for r in results if r["status"] == "ERROR"]

    # 1. Assert exactly 5 successful withdrawals
    assert len(successful_txns) == 5, f"Expected exactly 5 successful withdrawals, got {len(successful_txns)}. Results: {results}"

    # 2. Assert exactly 5 clean HTTP 400 failures (Insufficient Funds)
    assert len(failed_txns) == 5, f"Expected exactly 5 failed withdrawals, got {len(failed_txns)}. Failures: {failed_txns}"
    for fail in failed_txns:
        assert fail["code"] == 400, f"Expected status 400 for balance exhaustion, got {fail['code']}"
        assert "Insufficient balance" in fail["detail"]

    # 3. Assert zero uncaught / internal errors
    assert len(system_errors) == 0, f"Unexpected system errors encountered during race condition test: {system_errors}"

    # 4. Verify ledger consistency and strictly ৳0.00 final balance
    verify_db = SessionLocal()
    try:
        final_wallet = verify_db.query(Wallet).filter(Wallet.user_id == user_id).first()
        final_balance = Decimal(str(final_wallet.balance))
        assert final_balance == Decimal("0.00"), f"Expected final balance to be ৳0.00, but got ৳{final_balance}"
    finally:
        verify_db.close()


def test_concurrent_transfers_no_deadlock(test_user, test_agent):
    """
    Validates atomic row-locking across multiple parties without deadlocks.
    """
    db_conn = SessionLocal()
    try:
        # Give user ৳500
        w = db_conn.query(Wallet).filter(Wallet.user_id == test_user.id).first()
        w.balance = Decimal("500.00")
        db_conn.commit()
    finally:
        db_conn.close()

    # 2 simultaneous transfers of ৳300 each (Total needed ৳600 + fees > ৳500)
    # Exactly one must succeed, the other must fail with 400
    results = []
    barrier = threading.Barrier(2)

    def transfer_worker(tid: int):
        s_db = SessionLocal()
        try:
            barrier.wait(timeout=3)
            sender = s_db.query(User).filter(User.id == test_user.id).first()
            req = SendMoneyRequest(
                receiver_phone=test_agent.phone,
                amount=300.0,
                note=f"Concurrent send {tid}",
                password="1234"
            )
            res = TransactionService.process_send_money(s_db, sender=sender, request=req)
            return {"status": "SUCCESS", "res": res}
        except HTTPException as he:
            return {"status": "FAIL", "code": he.status_code}
        finally:
            s_db.close()

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        futs = [executor.submit(transfer_worker, i) for i in range(2)]
        for f in concurrent.futures.as_completed(futs):
            results.append(f.result())

    successes = [r for r in results if r["status"] == "SUCCESS"]
    fails = [r for r in results if r["status"] == "FAIL"]

    assert len(successes) == 1, "Exactly one transfer should have succeeded"
    assert len(fails) == 1, "The second transfer should have failed due to insufficient balance"
    assert fails[0]["code"] == 400
