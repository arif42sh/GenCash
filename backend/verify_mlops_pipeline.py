"""
Verification script for MLOps Drift Monitoring, Automated Retraining, and Model Registry
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.ml.drift_monitor import drift_monitor, calculate_psi
from app.ml.model_registry import model_registry
from app.ml.causal_uplift_engine import generate_causal_mfs_dataset
import pandas as pd
import numpy as np

def run_verification():
    print("=================================================================")
    print("STEP 1: Verify Initial Production Model in Registry")
    print("=================================================================")
    active_meta = model_registry.get_active_metadata()
    print("Active Production Version:", active_meta.get("version"))
    print("Artifact File:", active_meta.get("artifact_file"))
    print("SHA256 Checksum:", active_meta.get("sha256_checksum"))
    print("Validation Qini:", active_meta.get("validation_metrics", {}).get("qini_coefficient"))
    print("Validation AUUC:", active_meta.get("validation_metrics", {}).get("auuc"))

    print("\n=================================================================")
    print("STEP 2: Evaluate Stable Live Stream Cohort (Baseline)")
    print("=================================================================")
    stable_df = generate_causal_mfs_dataset(n_samples=3000, seed=123)
    res_stable = drift_monitor.evaluate_cohort_drift(stable_df)
    print("Evaluated Samples:", res_stable["evaluated_samples"])
    print("Max PSI:", res_stable["max_psi"])
    print("Overall Status:", res_stable["overall_status"])
    print("Retraining Triggered:", res_stable["retraining_triggered"])
    print("Sample Feature PSI Values:")
    for feat in ["monetary_avg", "wallet_balance", "recency_days", "fatigue_score"]:
        if feat in res_stable["feature_psi"]:
            print(f"  - {feat:16s}: PSI = {res_stable['feature_psi'][feat]['psi']:.4f} ({res_stable['feature_psi'][feat]['status']}) | KS p-val = {res_stable['continuous_ks_tests'][feat]['p_value']}")

    print("\n=================================================================")
    print("STEP 3: Induce Festival / Eid Spend Shock & Run Drift Audit")
    print("=================================================================")
    drift_df = stable_df.copy()
    # Induce massive transaction distribution shift:
    # 1. 3.5x monetary surge
    drift_df["monetary_avg"] = drift_df["monetary_avg"] * 3.5 + np.random.normal(500, 100, len(drift_df))
    # 2. Daily velocity increase / recency collapse
    drift_df["recency_days"] = np.random.exponential(0.8, len(drift_df))
    # 3. High balance drain
    drift_df["wallet_balance"] = np.maximum(50, drift_df["wallet_balance"] * 0.3)

    res_drift = drift_monitor.evaluate_cohort_drift(drift_df)
    print("Max PSI:", res_drift["max_psi"])
    print("Overall Status:", res_drift["overall_status"])
    print("Retraining Triggered:", res_drift["retraining_triggered"])
    print("Critical Alerts Logged:")
    for alert in res_drift["alerts"][:3]:
        print(f"  🚨 {alert}")

    if "retrained_model" in res_drift:
        print("\n=================================================================")
        print("STEP 4: Verify Autonomous Retraining & Hot-Swapped Model")
        print("=================================================================")
        new_meta = res_drift["retrained_model"]
        print("Newly Deployed Version:", new_meta["version"])
        print("New Artifact File:", new_meta["artifact_file"])
        print("New SHA256 Checksum:", new_meta["sha256_checksum"])
        print("Upgraded Qini:", new_meta["validation_metrics"]["qini_coefficient"])
        print("Upgraded AUUC:", new_meta["validation_metrics"]["auuc"])
        print("Status:", new_meta["status"])

        # Check model registry manifest
        updated_active = model_registry.get_active_metadata()
        assert updated_active["version"] == new_meta["version"], "Registry active version did not hot-swap!"
        print("Active Model Hot-Swap Verified!")

if __name__ == "__main__":
    run_verification()
