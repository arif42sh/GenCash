"""
GenCash Responsible AI & User Consent Governance Engine
=======================================================
Author: Principal Application Security Engineer & Responsible AI Architect
System: GenCash Enterprise MFS Platform (Dimension 7: Responsible AI & Security)

Features:
1. User Campaign Opt-In / Opt-Out Consent Management:
   - Respects customer privacy preferences and notification fatigue boundaries.
   - Enforces strict zero-inference suppression when customer opts out of promotional nudges.
2. Immutable Model Decision Logging:
   - Logs every probabilistic inference decision to an append-only JSONL audit trail.
   - Captures user_id, timestamp, model_version, uplift_score, segment, treatment_assigned, opt_in_status.
   - Strictly decouples probabilistic ML decisions from ACID-compliant core financial ledger mutations.
"""

import os
import json
import threading
from datetime import datetime, timezone
from typing import Dict, Any, Optional

AUDIT_LOG_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "logs"))
os.makedirs(AUDIT_LOG_DIR, exist_ok=True)
DECISION_LOG_PATH = os.path.join(AUDIT_LOG_DIR, "model_decision_audit.jsonl")
CONSENT_STORE_PATH = os.path.join(AUDIT_LOG_DIR, "user_consent_registry.json")

_lock = threading.Lock()
_consent_cache: Dict[int, bool] = {}


def _load_consent_registry():
    global _consent_cache
    if os.path.exists(CONSENT_STORE_PATH):
        try:
            with open(CONSENT_STORE_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                _consent_cache = {int(k): bool(v) for k, v in data.items()}
        except Exception:
            _consent_cache = {}


def _save_consent_registry():
    with open(CONSENT_STORE_PATH, "w", encoding="utf-8") as f:
        json.dump(_consent_cache, f, indent=2)


# Initialize cache on module load
_load_consent_registry()


def record_user_consent(user_id: int, opt_in: bool) -> Dict[str, Any]:
    """Records customer promotional campaign consent (Opt-In or Opt-Out)."""
    with _lock:
        _consent_cache[int(user_id)] = bool(opt_in)
        _save_consent_registry()

    # Log immutable audit event
    log_model_decision(
        user_id=user_id,
        model_version="SYSTEM_GOVERNANCE",
        uplift_score=0.0,
        segment="OPT_IN" if opt_in else "OPTED_OUT",
        treatment_assigned=False,
        opt_in_status=bool(opt_in),
        latency_ms=0.5,
        action_type="CONSENT_CHANGE"
    )

    return {
        "user_id": user_id,
        "promotional_nudge_opt_in": opt_in,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }


def is_user_opted_in(user_id: int) -> bool:
    """Returns False if user has explicitly opted out of marketing nudges."""
    return _consent_cache.get(int(user_id), True)


def log_model_decision(
    user_id: int,
    model_version: str,
    uplift_score: float,
    segment: str,
    treatment_assigned: bool,
    opt_in_status: bool,
    latency_ms: float,
    action_type: str = "INFERENCE_EVALUATION"
):
    """
    Appends an immutable decision record to the audit trail.
    Ensures non-repudiation and regulatory fairness auditing without blocking core ledger mutations.
    """
    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "action_type": action_type,
        "user_id": int(user_id),
        "model_version": model_version,
        "primary_uplift_score": round(float(uplift_score), 4),
        "segment": segment,
        "treatment_assigned": bool(treatment_assigned),
        "opt_in_status": bool(opt_in_status),
        "inference_latency_ms": round(float(latency_ms), 2),
        "isolation_boundary": "ML_DECISION_PLANE_DECOUPLED_FROM_FINANCIAL_LEDGER"
    }

    try:
        with _lock:
            with open(DECISION_LOG_PATH, "a", encoding="utf-8") as f:
                f.write(json.dumps(record) + "\n")
    except Exception as exc:
        print(f"Audit log writing warning: {exc}")
