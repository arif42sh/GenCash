"""
GenCash Production Idempotency Engine
Provides distributed idempotency validation using `X-Idempotency-Key` header with TTL and SHA-256 fingerprinting.
Prevents duplicate ledger postings and double-debits from network retries.
"""

import time
import json
import hashlib
import threading
from typing import Dict, Any, Optional
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class IdempotencyRecord:
    def __init__(self, key: str, request_hash: str, ttl_seconds: int = 86400):
        self.key = key
        self.request_hash = request_hash
        self.status = "IN_PROGRESS"  # IN_PROGRESS, COMPLETED, FAILED
        self.status_code: int = 200
        self.response_body: bytes = b""
        self.content_type: str = "application/json"
        self.created_at = time.time()
        self.expires_at = self.created_at + ttl_seconds

    def is_expired(self) -> bool:
        return time.time() > self.expires_at


class IdempotencyStore:
    """
    Thread-safe in-memory idempotency store with TTL eviction.
    Can be seamlessly backed by Redis in clustered deployments.
    """
    def __init__(self):
        self._store: Dict[str, IdempotencyRecord] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[IdempotencyRecord]:
        with self._lock:
            record = self._store.get(key)
            if record:
                if record.is_expired():
                    del self._store[key]
                    return None
                return record
            return None

    def reserve(self, key: str, request_hash: str, ttl_seconds: int = 86400) -> Tuple_Reservation:
        """
        Atomically reserve a key.
        Returns:
            (status: "NEW" | "COMPLETED" | "CONFLICT_IN_PROGRESS" | "PAYLOAD_MISMATCH", record)
        """
        with self._lock:
            record = self._store.get(key)
            if record:
                if record.is_expired():
                    del self._store[key]
                    record = None
                else:
                    if record.status == "COMPLETED":
                        if record.request_hash != request_hash:
                            return "PAYLOAD_MISMATCH", record
                        return "COMPLETED", record
                    elif record.status == "IN_PROGRESS":
                        return "CONFLICT_IN_PROGRESS", record

            new_record = IdempotencyRecord(key, request_hash, ttl_seconds)
            self._store[key] = new_record
            return "NEW", new_record

    def complete(self, key: str, status_code: int, response_body: bytes, content_type: str = "application/json"):
        with self._lock:
            record = self._store.get(key)
            if record:
                record.status = "COMPLETED"
                record.status_code = status_code
                record.response_body = response_body
                record.content_type = content_type

    def release(self, key: str):
        with self._lock:
            if key in self._store:
                del self._store[key]

    def clear(self):
        with self._lock:
            self._store.clear()


# Type alias helper
Tuple_Reservation = tuple[str, Optional[IdempotencyRecord]]

# Singleton Store Instance
idempotency_store = IdempotencyStore()


class IdempotencyMiddleware(BaseHTTPMiddleware):
    """
    FastAPI / Starlette Middleware intercepting mutating requests with X-Idempotency-Key.
    """
    async def dispatch(self, request: Request, call_next):
        # Only process mutating methods: POST, PUT, PATCH
        if request.method not in ("POST", "PUT", "PATCH"):
            return await call_next(request)

        idempotency_key = request.headers.get("x-idempotency-key") or request.headers.get("X-Idempotency-Key")
        if not idempotency_key:
            # Header not provided; proceed normally
            return await call_next(request)

        idempotency_key = idempotency_key.strip()
        if not idempotency_key:
            return await call_next(request)

        # Read and cache request body
        body = await request.body()
        payload_repr = f"{request.url.path}:{body.decode('utf-8', errors='ignore')}"
        request_hash = hashlib.sha256(payload_repr.encode("utf-8")).hexdigest()

        status_result, record = idempotency_store.reserve(idempotency_key, request_hash)

        if status_result == "COMPLETED" and record:
            # Return cached response without re-executing endpoint
            return Response(
                content=record.response_body,
                status_code=record.status_code,
                media_type=record.content_type,
                headers={
                    "X-Idempotency-Key": idempotency_key,
                    "X-Cache-Lookup": "HIT-IDEMPOTENT-REPLAY",
                }
            )

        if status_result == "CONFLICT_IN_PROGRESS":
            return Response(
                content=json.dumps({
                    "detail": "Conflict: A transaction with this Idempotency-Key is currently being processed."
                }),
                status_code=409,
                media_type="application/json"
            )

        if status_result == "PAYLOAD_MISMATCH":
            return Response(
                content=json.dumps({
                    "detail": "Unprocessable Entity: Idempotency-Key already used with different payload."
                }),
                status_code=422,
                media_type="application/json"
            )

        # Execute endpoint downstream
        try:
            response = await call_next(request)

            # Only cache successful transactions (200, 201)
            if response.status_code in (200, 201):
                # Consume response body to cache it
                response_body = [chunk async for chunk in response.body_iterator]
                full_body = b"".join(response_body)

                content_type = response.headers.get("content-type", "application/json")
                idempotency_store.complete(
                    key=idempotency_key,
                    status_code=response.status_code,
                    response_body=full_body,
                    content_type=content_type
                )

                # Return fresh response with idempotent headers
                return Response(
                    content=full_body,
                    status_code=response.status_code,
                    headers=dict(response.headers),
                    media_type=content_type
                )
            else:
                # If transaction failed with error, release key so client can retry safely
                idempotency_store.release(idempotency_key)
                return response
        except Exception:
            idempotency_store.release(idempotency_key)
            raise
