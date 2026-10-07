"""
GenCash Enterprise MFS Model Registry & Artifact Store
======================================================
Author: Principal MLOps & Distributed Systems Architect
System: GenCash Enterprise MFS Platform (Dimension 6: Scalability & Integration)

Implements:
1. Persistent, versioned model artifact storage (e.g., model_v1.0.0_uplift.joblib).
2. Cryptographic SHA256 integrity checksum verification.
3. Model governance manifest tracking hyperparameters, training timestamps, validation metrics (AUUC, Qini), and feature schemas.
4. Model lifecycle management: STAGING -> PRODUCTION -> ARCHIVED.
"""

import os
import json
import hashlib
import joblib
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple

REGISTRY_DIR = os.path.join(os.path.dirname(__file__), "registry")
MANIFEST_PATH = os.path.join(REGISTRY_DIR, "registry_manifest.json")


def compute_file_sha256(filepath: str) -> str:
    """Computes SHA256 checksum of a binary file for tamper detection and auditability."""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(65536), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


class MFSModelRegistry:
    """
    Enterprise Model Registry managing immutable serialized model artifacts,
    reproducible lineages, cryptographic hashes, and zero-downtime hot-swapping.
    """
    def __init__(self, registry_dir: str = REGISTRY_DIR):
        self.registry_dir = registry_dir
        os.makedirs(self.registry_dir, exist_ok=True)
        self.manifest_path = os.path.join(self.registry_dir, "registry_manifest.json")
        self._ensure_manifest_exists()

    def _ensure_manifest_exists(self):
        if not os.path.exists(self.manifest_path):
            initial_manifest = {
                "registry_name": "GenCash-MFS-Model-Registry",
                "organization": "upay / GenCash AI Core",
                "active_production_version": None,
                "models": {}
            }
            with open(self.manifest_path, "w", encoding="utf-8") as f:
                json.dump(initial_manifest, f, indent=2)

    def _load_manifest(self) -> Dict[str, Any]:
        with open(self.manifest_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def _save_manifest(self, manifest: Dict[str, Any]):
        with open(self.manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)

    def register_model(
        self,
        model_artifact: Any,
        version: str,
        algorithm: str,
        hyperparameters: Dict[str, Any],
        validation_metrics: Dict[str, float],
        features_list: list,
        training_samples: int,
        set_as_production: bool = True
    ) -> Dict[str, Any]:
        """
        Persists a trained model artifact, calculates its SHA256 checksum,
        and registers complete audit metadata in the registry manifest.
        """
        artifact_filename = f"model_{version}_uplift.joblib"
        artifact_path = os.path.join(self.registry_dir, artifact_filename)
        pkl_filename = f"model_{version}_uplift.pkl"
        pkl_path = os.path.join(self.registry_dir, pkl_filename)

        # 1. Serialize model artifacts (both joblib compressed and standard pkl)
        joblib.dump(model_artifact, artifact_path, compress=3)
        joblib.dump(model_artifact, pkl_path)

        # 2. Calculate cryptographic SHA256 checksums
        checksum = compute_file_sha256(artifact_path)
        pkl_checksum = compute_file_sha256(pkl_path)

        # 3. Create metadata entry
        created_at = datetime.now(timezone.utc).isoformat()
        metadata = {
            "model_id": f"gencash-uplift-{version}",
            "version": version,
            "artifact_file": artifact_filename,
            "sha256_checksum": checksum,
            "pkl_artifact_file": pkl_filename,
            "pkl_sha256_checksum": pkl_checksum,
            "algorithm": algorithm,
            "hyperparameters": hyperparameters,
            "validation_metrics": validation_metrics,
            "features": features_list,
            "training_samples": training_samples,
            "status": "PRODUCTION" if set_as_production else "STAGING",
            "registered_at": created_at,
            "artifact_size_bytes": os.path.getsize(artifact_path)
        }

        # 4. Update manifest
        manifest = self._load_manifest()
        if set_as_production:
            # Demote existing production models to ARCHIVED
            for m_ver, m_info in manifest["models"].items():
                if m_info.get("status") == "PRODUCTION":
                    m_info["status"] = "ARCHIVED"
                    m_info["archived_at"] = created_at
            manifest["active_production_version"] = version

        manifest["models"][version] = metadata
        self._save_manifest(manifest)

        print(f"✅ Model version '{version}' registered successfully! SHA256: {checksum[:16]}...")
        return metadata

    def load_production_model(self) -> Tuple[Any, Dict[str, Any]]:
        """
        Loads the currently active production model with strict SHA256 integrity validation.
        Raises ValueError if the artifact has been tampered with or corrupted.
        """
        manifest = self._load_manifest()
        active_ver = manifest.get("active_production_version")
        if not active_ver or active_ver not in manifest["models"]:
            raise RuntimeError("No active production model found in registry manifest.")

        meta = manifest["models"][active_ver]
        artifact_path = os.path.join(self.registry_dir, meta["artifact_file"])
        if not os.path.exists(artifact_path):
            raise FileNotFoundError(f"Model artifact not found on disk: {artifact_path}")

        # Strict integrity check
        current_checksum = compute_file_sha256(artifact_path)
        if current_checksum != meta["sha256_checksum"]:
            raise ValueError(
                f"FATAL: Model artifact checksum mismatch! "
                f"Expected: {meta['sha256_checksum']}, Found: {current_checksum}"
            )

        model = joblib.load(artifact_path)
        return model, meta

    def get_active_metadata(self) -> Optional[Dict[str, Any]]:
        manifest = self._load_manifest()
        active_ver = manifest.get("active_production_version")
        if active_ver and active_ver in manifest["models"]:
            return manifest["models"][active_ver]
        return None

    def list_all_models(self) -> Dict[str, Any]:
        return self._load_manifest()["models"]


# Singleton instance
model_registry = MFSModelRegistry()
