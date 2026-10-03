from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
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
)
from seed_data import seed_initial_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables if not exist
    Base.metadata.create_all(bind=engine)
    # Auto-seed basic seed data if empty
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()
    yield
    # Shutdown


app = FastAPI(
    title="GenCash API",
    description="AI-Powered Intelligent Digital Financial Services Platform — AI Hackathon 2026 (DIU CPC × upay)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

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
        "event": "AI Hackathon 2026 — DIU CPC × upay",
        "architecture": "INPUT -> INTELLIGENCE -> ACTION"
    }

