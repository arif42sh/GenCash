"""
GenCash Real-Time Causal Uplift & Next-Best-Offer (NBO) Inference Microservice
=============================================================================
Author: Principal MLOps & Distributed Systems Architect
System: GenCash Enterprise MFS Platform (Dimension 6: Scalability & Integration)

Features:
1. High-throughput, sub-10ms real-time scoring of Two-Model (T-Learner) CATE uplift.
2. In-memory hot-cached model artifact loaded directly from MFSModelRegistry.
3. Sub-2ms real-time feature vector retrieval from StreamingFeaturePipeline.
4. Explainable causal segmentation (Persuadables, Sure Things, Lost Causes, Sleeping Dogs).
5. SLA compliance tracking (< 28ms target SLA for 1,000 RPS sustained load).
"""

import time
import os
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Response, status
from app.ml.model_registry import model_registry
from app.ml.streaming_feature_pipeline import streaming_pipeline
from app.services.consent_service import is_user_opted_in, log_model_decision

router = APIRouter(tags=["Production Model Inference"])

# Cached model singleton in microservice memory for zero-disk-I/O scoring
_CACHED_MODEL = None
_CACHED_VERSION = None
_CACHED_CHECKSUM = None


def get_active_inference_model():
    """Retrieves or hot-reloads the active production causal model."""
    global _CACHED_MODEL, _CACHED_VERSION, _CACHED_CHECKSUM
    meta = model_registry.get_active_metadata()
    if not meta:
        raise RuntimeError("No active production model found in registry.")

    if _CACHED_MODEL is None or _CACHED_VERSION != meta["version"]:
        model, loaded_meta = model_registry.load_production_model()
        _CACHED_MODEL = model
        _CACHED_VERSION = loaded_meta["version"]
        _CACHED_CHECKSUM = loaded_meta["sha256_checksum"]
    
    return _CACHED_MODEL, _CACHED_VERSION, _CACHED_CHECKSUM, meta["features"]


class MFSInferenceRequest(BaseModel):
    user_id: int = Field(default=1042, description="Target MFS Wallet Customer ID")
    wallet_balance: Optional[float] = Field(default=None, description="Real-time balance override")
    channel: Optional[str] = Field(default="android_app", description="Initiating channel")
    candidate_offers: Optional[List[str]] = Field(
        default=["UPAY_CASHBACK_10", "GP_DATA_BONUS_20", "BILL_DISCOUNT_5", "MERCHANT_GROCERY_15"],
        description="Candidate campaign offer identifiers"
    )


class OfferRecommendation(BaseModel):
    offer_id: str
    offer_name: str
    predicted_cate_uplift: float
    treatment_conversion_prob: float
    control_conversion_prob: float
    segment: str
    expected_incremental_gmv_bdt: float
    recommendation_priority: int
    explainability: str


class MFSInferenceResponse(BaseModel):
    user_id: int
    model_version: str
    model_sha256: str
    segment: str
    primary_uplift_score: float
    ranked_offers: List[OfferRecommendation]
    inference_latency_ms: float
    sla_compliant: bool  # True if < 28ms target


OFFER_METADATA = {
    "UPAY_CASHBACK_10": {
        "name": "upay 10% Cash-In Incentive",
        "base_lift_multiplier": 1.15,
        "avg_gmv": 1500.0,
        "persuadable_reason": "High incremental lift: Customer responds strongly to direct cash rewards."
    },
    "GP_DATA_BONUS_20": {
        "name": "Grameenphone 20GB Recharge Super-Pack",
        "base_lift_multiplier": 1.08,
        "avg_gmv": 450.0,
        "persuadable_reason": "High recharge propensity with significant mobile data affinity."
    },
    "BILL_DISCOUNT_5": {
        "name": "DESCO / DPDC ৳50 Utility Bill Waiver",
        "base_lift_multiplier": 0.95,
        "avg_gmv": 2200.0,
        "persuadable_reason": "Bill cycle due date approaching; targeted discount triggers early settlement."
    },
    "MERCHANT_GROCERY_15": {
        "name": "Shwapno & Meena Bazar 15% QR Checkout",
        "base_lift_multiplier": 1.22,
        "avg_gmv": 1850.0,
        "persuadable_reason": "Active retail shopper profile; discount unlocks high incremental cart size."
    }
}


@router.post("/v1/predict/uplift-nbo", response_model=MFSInferenceResponse)
@router.post("/predict/uplift-nbo", response_model=MFSInferenceResponse)
def predict_uplift_nbo(request: MFSInferenceRequest, response: Response):
    """
    Production Real-Time MFS Inference Endpoint
    --------------------------------------------
    Targeted by Locust Load Testing at 1,000 RPS / 500 concurrent virtual users.
    Computes individual-level CATE uplift and ranks Next-Best-Offers (NBO) in < 28ms.
    """
    t_start = time.perf_counter()

    # 0. User Consent & Opt-Out Guardrail (Dimension 7: Responsible AI)
    if not is_user_opted_in(request.user_id):
        t_end = time.perf_counter()
        lat_ms = round((t_end - t_start) * 1000.0, 2)
        log_model_decision(
            user_id=request.user_id,
            model_version="GOVERNANCE_SUPPRESSED",
            uplift_score=0.0,
            segment="OPTED_OUT",
            treatment_assigned=False,
            opt_in_status=False,
            latency_ms=lat_ms,
            action_type="CONSENT_OPT_OUT_SUPPRESSION"
        )
        return MFSInferenceResponse(
            user_id=request.user_id,
            model_version="GOVERNANCE_SUPPRESSED",
            model_sha256="N/A_USER_OPTED_OUT",
            segment="OPTED_OUT",
            primary_uplift_score=0.0,
            ranked_offers=[],
            inference_latency_ms=lat_ms,
            sla_compliant=True
        )

    # 1. Load active production model from cache
    model, version, checksum, feature_cols = get_active_inference_model()

    # 2. Sub-2ms online feature vector retrieval from sliding-window store
    user_features = streaming_pipeline.get_features_for_inference(request.user_id)
    if request.wallet_balance is not None:
        user_features["wallet_balance"] = request.wallet_balance

    # 3. Construct ordered feature vector (high-speed numpy buffer)
    feat_vals = [float(user_features.get(c, 0.0)) for c in feature_cols]
    feat_arr = np.array([feat_vals], dtype=np.float32)

    # 4. Predict CATE uplift: tau_hat(X) = mu_1(X) - mu_0(X)
    p_treat = float(model.m1.predict_proba(feat_arr)[0, 1])
    p_ctrl = float(model.m0.predict_proba(feat_arr)[0, 1])
    cate = p_treat - p_ctrl

    # 5. Causal Quadrant Classification
    if cate >= 0.05:
        segment = "PERSUADABLE"
    elif p_ctrl >= 0.50 and cate < 0.05:
        segment = "SURE_THING"
    elif cate <= -0.02:
        segment = "SLEEPING_DOG"
    else:
        segment = "LOST_CAUSE"

    # 6. Rank Candidate Offers by Incremental Impact
    ranked_offers: List[OfferRecommendation] = []
    candidates = request.candidate_offers or list(OFFER_METADATA.keys())

    for idx, offer_id in enumerate(candidates):
        meta = OFFER_METADATA.get(offer_id, {
            "name": f"Offer {offer_id}",
            "base_lift_multiplier": 1.0,
            "avg_gmv": 1000.0,
            "persuadable_reason": "Contextual offer based on user transaction history."
        })
        mult = meta["base_lift_multiplier"]
        offer_cate = round(cate * mult, 4)
        offer_treat = round(min(0.99, p_treat * mult), 4)
        expected_inc_gmv = round(max(0.0, offer_cate * meta["avg_gmv"]), 2)

        ranked_offers.append(OfferRecommendation(
            offer_id=offer_id,
            offer_name=meta["name"],
            predicted_cate_uplift=offer_cate,
            treatment_conversion_prob=offer_treat,
            control_conversion_prob=round(p_ctrl, 4),
            segment=segment,
            expected_incremental_gmv_bdt=expected_inc_gmv,
            recommendation_priority=idx + 1,
            explainability=meta["persuadable_reason"]
        ))

    # Sort descending by predicted CATE uplift
    ranked_offers.sort(key=lambda x: x.predicted_cate_uplift, reverse=True)
    for rank_idx, off in enumerate(ranked_offers):
        off.recommendation_priority = rank_idx + 1

    # 7. SLA Telemetry & Immutable Model Decision Logging
    t_end = time.perf_counter()
    latency_ms = round((t_end - t_start) * 1000.0, 2)
    response.headers["X-Inference-Latency-Ms"] = str(latency_ms)
    response.headers["X-Model-Version"] = version

    # Decoupled decision logging (isolated from core transaction ledger mutations)
    log_model_decision(
        user_id=request.user_id,
        model_version=version,
        uplift_score=cate,
        segment=segment,
        treatment_assigned=bool(segment == "PERSUADABLE"),
        opt_in_status=True,
        latency_ms=latency_ms,
        action_type="PRODUCTION_INFERENCE"
    )

    return MFSInferenceResponse(
        user_id=request.user_id,
        model_version=version,
        model_sha256=checksum,
        segment=segment,
        primary_uplift_score=round(cate, 4),
        ranked_offers=ranked_offers,
        inference_latency_ms=latency_ms,
        sla_compliant=bool(latency_ms < 28.0)
    )


@router.get("/v1/predict/uplift-nbo", response_model=MFSInferenceResponse)
def get_predict_uplift_nbo_sample(response: Response, user_id: int = 1042):
    """GET convenience probe for health checks and automated load testing."""
    req = MFSInferenceRequest(user_id=user_id)
    return predict_uplift_nbo(req, response)
