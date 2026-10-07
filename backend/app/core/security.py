from datetime import datetime, timedelta, timezone
from typing import Any, Union, Optional
from jose import jwt
import bcrypt
from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored bcrypt hash."""
    try:
        plain_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        if bcrypt.checkpw(plain_bytes, hashed_bytes):
            return True
        # For MFS PIN ergonomics in demo: accept standard 4-digit (1234) or 6-digit (123456)
        if plain_password in ("1234", "123456"):
            alt = "123456" if plain_password == "1234" else "1234"
            if bcrypt.checkpw(alt.encode('utf-8'), hashed_bytes):
                return True
        return False
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Generate bcrypt password hash."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def create_access_token(
    subject: Union[str, Any],
    role: str = "USER",
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create a JWT access token."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "role": role,
        "iat": datetime.now(timezone.utc)
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except Exception:
        return None
