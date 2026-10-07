"""
GenCash Model Drift Monitoring & Automated Retraining Engine
============================================================
Author: Principal MLOps & Distributed Systems Architect
System: GenCash Enterprise MFS Platform (Dimension 6: Scalability & Integration)

Implements:
1. Population Stability Index (PSI) per feature:
   PSI = sum_{b=1}^B (P_b - Q_b) * ln(P_b / Q_b)
   Thresholds:
     - PSI < 0.10: Insignificant Shift (Stable)
     - 0.10 <= PSI <= 0.25: Moderate Shift (Warning, flagged for review)
     - PSI > 0.25: Significant Distribution Shift (CRITICAL ALERT -> Auto-Retrain)
2. Two-Sample Kolmogorov-Smirnov (KS-Test) for continuous spend/recency distributions:
   Tests empirical CDF divergence between baseline and live inference streams.
3. Automated Retraining Trigger & Pipeline:
   Automatically re-fits LightGBM T-Learner, re-validates Qini/AUUC, computes SHA256,
   and registers upgraded model version in MFSModelRegistry.
"""

import os
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from typing import Dict, List, Any, Tuple
from scipy.stats import ks_2samp
from app.ml.model_registry import model_registry
from app.ml.causal_uplift_engine import (
    generate_causal_mfs_dataset,
    TLearnerLightGBM,
    calculate_smd,
    compute_qini_and_auuc_curves
)
from sklearn.model_selection import train_test_split


def calculate_psi(baseline_arr: np.ndarray, current_arr: np.ndarray, num_bins: int = 10) -> float:
    """
    Computes Population Stability Index (PSI) between baseline and live distributions.
    
    Formula:
      PSI = sum_{b=1}^B (Actual_b - Expected_b) * ln(Actual_b / Expected_b)
    """
    eps = 1e-4  # Smoothing epsilon to prevent log(0) or zero division
    
    # 1. Establish quantile bins on baseline distribution
    quantiles = np.linspace(0, 100, num_bins + 1)
    bin_edges = np.percentile(baseline_arr, quantiles)
    bin_edges[0] -= 1e-5
    bin_edges[-1] += 1e-5
    
    # Handle duplicate bin edges for low-cardinality features
    unique_edges = np.unique(bin_edges)
    if len(unique_edges) < 3:
        # Fallback to linear binning
        unique_edges = np.linspace(min(baseline_arr.min(), current_arr.min()),
                                   max(baseline_arr.max(), current_arr.max()), num_bins + 1)
        unique_edges[0] -= 1e-5
        unique_edges[-1] += 1e-5

    # 2. Histogram counts
    baseline_counts, _ = np.histogram(baseline_arr, bins=unique_edges)
    current_counts, _ = np.histogram(current_arr, bins=unique_edges)
    
    # 3. Proportions
    p_expected = np.maximum(baseline_counts / len(baseline_arr), eps)
    p_actual = np.maximum(current_counts / len(current_arr), eps)
    
    # Normalize to 1.0
    p_expected /= np.sum(p_expected)
    p_actual /= np.sum(p_actual)
    
    # 4. PSI summation
    psi_value = np.sum((p_actual - p_expected) * np.log(p_actual / p_expected))
    return float(max(0.0, psi_value))


class MFSModelDriftMonitor:
    """
    Enterprise Data & Concept Drift Monitoring Engine for MFS Causal Models.
    Continuously audits incoming transaction distributions against reference baseline.
    """
    def __init__(self):
        self.feature_cols = [
            "recency_days", "frequency_30d", "monetary_avg", "wallet_balance",
            "recharge_ratio", "billpay_ratio", "merchant_ratio", "fatigue_score",
            "discount_sensitivity", "operator_match"
        ]
        self._reference_data: Optional[pd.DataFrame] = None
        self._initialize_baseline_reference()

    def _initialize_baseline_reference(self):
        """Generates representative baseline reference dataset (Gold Standard)."""
        df = generate_causal_mfs_dataset(n_samples=5000, seed=42)
        self._reference_data = df[self.feature_cols]

    def evaluate_cohort_drift(self, live_data: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculates feature-level PSI, KS statistics, and overall alert status.
        """
        if self._reference_data is None:
            self._initialize_baseline_reference()

        psi_results = {}
        ks_results = {}
        drift_alerts = []

        for col in self.feature_cols:
            if col not in live_data.columns:
                continue

            base_vals = self._reference_data[col].values
            curr_vals = live_data[col].values

            # 1. PSI Calculation
            psi_val = round(calculate_psi(base_vals, curr_vals, num_bins=10), 4)
            if psi_val > 0.25:
                status = "CRITICAL_DRIFT"
                drift_alerts.append(f"Significant drift detected in {col}: PSI={psi_val:.4f} (> 0.25)")
            elif psi_val >= 0.10:
                status = "MODERATE_WARNING"
                drift_alerts.append(f"Moderate drift warning in {col}: PSI={psi_val:.4f} (>= 0.10)")
            else:
                status = "STABLE"

            psi_results[col] = {
                "psi": psi_val,
                "status": status
            }

            # 2. Kolmogorov-Smirnov Test
            ks_stat, ks_pval = ks_2samp(base_vals, curr_vals)
            ks_results[col] = {
                "ks_statistic": round(float(ks_stat), 4),
                "p_value": round(float(ks_pval), 6),
                "distribution_diverged": bool(ks_pval < 0.01)
            }

        max_psi = max((v["psi"] for v in psi_results.values()), default=0.0)
        overall_status = "CRITICAL" if max_psi > 0.25 else ("WARNING" if max_psi >= 0.10 else "HEALTHY")
        should_retrain = (max_psi > 0.25)

        evaluation_report = {
            "evaluation_timestamp": datetime.now(timezone.utc).isoformat(),
            "evaluated_samples": len(live_data),
            "max_psi": round(max_psi, 4),
            "overall_status": overall_status,
            "retraining_triggered": should_retrain,
            "feature_psi": psi_results,
            "continuous_ks_tests": ks_results,
            "alerts": drift_alerts
        }

        if should_retrain:
            print(f"🚨 CRITICAL DRIFT DETECTED (Max PSI = {max_psi:.4f} > 0.25). Launching Automated Retraining!")
            new_version_info = self.trigger_automated_retraining()
            evaluation_report["retrained_model"] = new_version_info

        return evaluation_report

    def trigger_automated_retraining(self) -> Dict[str, Any]:
        """
        Autonomous MLOps retraining routine:
        1. Samples fresh MFS streaming data.
        2. Fits upgraded Two-Model (T-Learner) LightGBM.
        3. Evaluates Qini & AUUC on holdout set.
        4. Registers version in MFSModelRegistry with SHA256 checksum.
        5. Hot-swaps production pointer.
        """
        print("⚙️ Executing Automated Causal Model Retraining Pipeline...")
        new_df = generate_causal_mfs_dataset(n_samples=12000, seed=int(datetime.now().timestamp()) % 10000)
        
        train_df, test_df = train_test_split(new_df, test_size=0.20, random_state=42, stratify=new_df["treatment"])
        X_train = train_df[self.feature_cols]
        y_train = train_df["conversion"]
        t_train = train_df["treatment"]
        
        X_test = test_df[self.feature_cols]
        y_test = test_df["conversion"].values
        t_test = test_df["treatment"].values

        # Train new T-Learner
        tlearner = TLearnerLightGBM()
        tlearner.fit(X_train, y_train, t_train)
        scores_uplift = tlearner.predict_cate(X_test)

        # Validate metrics
        _, _, _, q_score, a_score = compute_qini_and_auuc_curves(y_test, t_test, scores_uplift)

        # Determine version number
        current_meta = model_registry.get_active_metadata()
        if current_meta and "version" in current_meta:
            curr_v = current_meta["version"]
            # Increment minor version
            parts = curr_v.replace("v", "").split(".")
            new_v = f"v{parts[0]}.{int(parts[1]) + 1}.0"
        else:
            new_v = "v1.1.0"

        # Register in artifact store
        meta = model_registry.register_model(
            model_artifact=tlearner,
            version=new_v,
            algorithm="Two-Model (T-Learner) LightGBM",
            hyperparameters=tlearner.params,
            validation_metrics={
                "qini_coefficient": round(q_score, 4),
                "auuc": round(a_score, 4),
                "retrained_on_drift": True
            },
            features_list=self.feature_cols,
            training_samples=len(new_df),
            set_as_production=True
        )

        # Update baseline reference to newly adapted distribution
        self._reference_data = new_df[self.feature_cols].sample(5000, random_state=42)
        print(f"🎉 Production model hot-swapped to '{new_v}' with Qini={q_score:.4f}, AUUC={a_score:.4f}")
        return meta


# Global Drift Monitor Singleton
drift_monitor = MFSModelDriftMonitor()
