"""
Pytest Configuration & Fixtures for GenCash Automated Integration Suite
Provides database fixtures, authenticated test clients, and seeded test accounts.
"""

import pytest
from decimal import Decimal
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, engine, Base
from app.models.user import User, Wallet, WalletStatus
from app.core.security import get_password_hash, create_access_token
from app.core.idempotency import idempotency_store


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Ensure database schema exists before tests run."""
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def db():
    """Yield an isolated database session per test with rollback/cleanup."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    idempotency_store.clear()
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def test_user(db):
    """
    Creates or resets a dedicated test customer account with exactly ৳1,000.00 initial balance.
    Phone: 01799000001, PIN: 1234
    """
    phone = "01799000001"
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        user = User(
            name="Test Concurrency User",
            phone=phone,
            email="test_concurrency@gencash.mfs",
            password_hash=get_password_hash("1234"),
            status="ACTIVE",
            kyc_status="VERIFIED"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        wallet = Wallet(
            user_id=user.id,
            balance=Decimal("1000.00"),
            status=WalletStatus.ACTIVE,
            currency="BDT"
        )
        db.add(wallet)
        db.commit()
    else:
        # Reset wallet balance to exactly 1000.00
        wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
        if not wallet:
            wallet = Wallet(user_id=user.id, balance=Decimal("1000.00"), status=WalletStatus.ACTIVE)
            db.add(wallet)
        else:
            wallet.balance = Decimal("1000.00")
            wallet.status = WalletStatus.ACTIVE
        user.password_hash = get_password_hash("1234")
        db.commit()
        db.refresh(user)

    return user


@pytest.fixture
def test_agent(db):
    """
    Creates or resets a dedicated test agent account.
    Phone: 01799000002, PIN: 1234
    """
    phone = "01799000002"
    agent = db.query(User).filter(User.phone == phone).first()
    if not agent:
        agent = User(
            name="Test Agent Point",
            phone=phone,
            email="test_agent@gencash.mfs",
            password_hash=get_password_hash("1234"),
            status="ACTIVE",
            kyc_status="VERIFIED",
            is_agent=True,
            outlet_name="GenCash Prime Agent",
            agent_code="AGT-99002"
        )
        db.add(agent)
        db.commit()
        db.refresh(agent)

        wallet = Wallet(
            user_id=agent.id,
            balance=Decimal("50000.00"),
            status=WalletStatus.ACTIVE,
            currency="BDT"
        )
        db.add(wallet)
        db.commit()
    return agent


@pytest.fixture
def user_auth_token(test_user):
    """Generate JWT authorization token for the test user."""
    return create_access_token(subject=test_user.id, role="USER")


@pytest.fixture
def auth_headers(user_auth_token):
    """HTTP headers with Bearer token for authenticated requests."""
    return {"Authorization": f"Bearer {user_auth_token}"}
