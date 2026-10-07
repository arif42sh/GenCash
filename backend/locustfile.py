"""
GenCash Enterprise MFS - High-Throughput Distributed Load Testing Suite
========================================================================
Author: Principal MLOps & Distributed Systems Architect
System: GenCash Enterprise MFS Platform (Dimension 6: Scalability & Integration)
Target: Real-Time Causal Uplift & Next-Best-Offer Inference Service (/v1/predict/uplift-nbo)

SLA Performance Targets:
- Concurrent Virtual Users: 500
- Target Sustained Throughput: 1,000 RPS
- Target Mean Latency: < 28 ms
- Target 95th Percentile (p95): < 65 ms
- Target 99th Percentile (p99): < 90 ms
- Target Error Rate: 0.00% (0 errors allowed)

Usage (Headless CLI Execution):
  locust -f locustfile.py --headless -u 500 -r 50 --run-time 1m --host http://127.0.0.1:8000 --csv=benchmark_results
"""

import random
import json
from locust import HttpUser, task, between, events
from locust.runners import MasterRunner, WorkerRunner

CANDIDATE_OFFERS_POOL = [
    ["UPAY_CASHBACK_10", "GP_DATA_BONUS_20"],
    ["BILL_DISCOUNT_5", "MERCHANT_GROCERY_15"],
    ["UPAY_CASHBACK_10", "BILL_DISCOUNT_5", "MERCHANT_GROCERY_15"],
    ["UPAY_CASHBACK_10", "GP_DATA_BONUS_20", "BILL_DISCOUNT_5", "MERCHANT_GROCERY_15"]
]

CHANNELS = ["android_app", "ios_app", "ussd_assisted", "agent_assisted"]


class MFSRealtimeInferenceUser(HttpUser):
    """
    Simulates high-velocity concurrent MFS wallet users requesting real-time
    contextual Next-Best-Offer (NBO) recommendations during peak transaction hours.
    """
    # Extremely low wait time to sustain high RPS per concurrent user:
    # 500 users * ~2-3 requests/sec = 1,000+ sustained RPS
    wait_time = between(0.1, 0.4)

    @task(8)
    def test_predict_uplift_nbo_post(self):
        """
        Primary mission-critical path:
        POST /v1/predict/uplift-nbo with dynamic customer profile and candidate offer set.
        """
        user_id = random.randint(1001, 50000)
        wallet_balance = round(random.uniform(250.0, 15000.0), 2)
        payload = {
            "user_id": user_id,
            "wallet_balance": wallet_balance,
            "channel": random.choice(CHANNELS),
            "candidate_offers": random.choice(CANDIDATE_OFFERS_POOL)
        }

        with self.client.post(
            "/v1/predict/uplift-nbo",
            json=payload,
            name="POST /v1/predict/uplift-nbo",
            catch_response=True,
            timeout=5.0
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Unexpected status code {response.status_code}")

    @task(2)
    def test_predict_uplift_nbo_get_probe(self):
        """
        Secondary telemetry probe:
        GET /v1/predict/uplift-nbo for lightweight health check and edge routing validation.
        """
        user_id = random.randint(1001, 10000)
        with self.client.get(
            f"/v1/predict/uplift-nbo?user_id={user_id}",
            name="GET /v1/predict/uplift-nbo [Probe]",
            catch_response=True,
            timeout=5.0
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"GET probe failed with status {response.status_code}")
