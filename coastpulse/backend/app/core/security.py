import datetime
from typing import Optional, Dict, Any
import bcrypt
import jwt
from app.core.config import settings


def hash_password(password: str) -> str:
    """
    Hashes a plaintext password using bcrypt with configurable work factor.
    Truncates to 72 bytes if necessary to prevent bcrypt buffer overflows.
    """
    pw_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=settings.PASSWORD_HASH_ROUNDS)
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plaintext password against a stored bcrypt hash.
    """
    try:
        pw_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False


def create_access_token(
    user_id: str,
    email: str,
    role: str,
    expires_delta: Optional[datetime.timedelta] = None,
) -> str:
    """
    Generates a cryptographically signed JWT access token.
    """
    if expires_delta:
        expire = datetime.datetime.now(datetime.UTC) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode: Dict[str, Any] = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": datetime.datetime.now(datetime.UTC),
    }

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_password_reset_token(user_id: str, email: str) -> str:
    """
    Generates a short-lived token for password reset workflows.
    """
    expire = datetime.datetime.now(datetime.UTC) + datetime.timedelta(
        minutes=settings.RESET_TOKEN_EXPIRE_MINUTES
    )
    to_encode: Dict[str, Any] = {
        "sub": user_id,
        "email": email,
        "type": "reset",
        "exp": expire,
        "iat": datetime.datetime.now(datetime.UTC),
    }
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Decodes and validates a JWT token signature and expiration.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
