from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal, check_and_add_offer_columns
import app.models  # load all models
from app.api.v1 import (
    auth,
    users,
    wallet,
    transactions,
    offers,
    ai,
    notifications,
    admin,
    predict,
)
from seed_data import seed_initial_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if not exist
    Base.metadata.create_all(bind=engine)
    check_and_add_offer_columns()
    # Auto-seed basic seed data if empty
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    
    # Pre-warm active production ML model in memory for zero-latency inference
    try:
        from app.api.v1.predict import get_active_inference_model
        get_active_inference_model()
    except Exception as e:
        print("Model pre-warm warning:", e)

    yield
    # Shutdown


app = FastAPI(
    title="GenCash API",
    description="Next-Generation Intelligent Digital Financial Services (MFS) Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# SlowAPI Rate Limiting Middleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, default_limits=[settings.RATE_LIMIT_API_PER_MINUTE])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration for Mobile App (Expo) and Web Panel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(wallet.router, prefix=settings.API_V1_STR)
app.include_router(transactions.router, prefix=settings.API_V1_STR)
app.include_router(offers.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(predict.router, prefix=settings.API_V1_STR)
app.include_router(predict.router)  # Direct /v1/predict/uplift-nbo SLA microservice endpoint


import os
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

# Mount static folder if exists
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/admin", include_in_schema=False)
def serve_admin_portal():
    """GenCash Platform Admin & Growth Intelligence Command Center"""
    html_path = os.path.join(static_dir, "admin.html")
    if os.path.exists(html_path):
        return FileResponse(html_path)
    return FileResponse(os.path.join(static_dir, "campaign_simulator.html"))


@app.get("/simulator", include_in_schema=False)
def serve_campaign_simulator():
    """Admin Growth & Campaign Intelligence Simulator (Track 04)"""
    html_path = os.path.join(static_dir, "campaign_simulator.html")
    if os.path.exists(html_path):
        return FileResponse(html_path)
    return {"error": "Simulator dashboard not found"}


@app.get("/")
def root():
    return {
        "project": "GenCash - AI-Powered MFS Platform",
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "admin": "/admin",
        "simulator": "/simulator",
        "edition": "Enterprise Production Edition",
        "architecture": "INPUT -> INTELLIGENCE -> ACTION"
    }

