import hashlib
import hmac
import os
import secrets
import time
from collections import defaultdict

from .config import LOGIN_MAX_FAILURES, LOGIN_WINDOW_SECONDS

_N, _R, _P = 2**14, 8, 1


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=_N, r=_R, p=_P)
    return f"scrypt${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, salt_hex, digest_hex = stored.split("$")
        digest = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt_hex), n=_N, r=_R, p=_P)
        return hmac.compare_digest(digest, bytes.fromhex(digest_hex))
    except ValueError:
        return False


DUMMY_HASH = hash_password("not-a-real-password")


def new_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    return token, hash_token(token)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


_failures: dict[str, list[float]] = defaultdict(list)


def login_blocked(key: str) -> bool:
    cutoff = time.time() - LOGIN_WINDOW_SECONDS
    _failures[key] = [t for t in _failures[key] if t > cutoff]
    return len(_failures[key]) >= LOGIN_MAX_FAILURES


def record_login_failure(key: str) -> None:
    _failures[key].append(time.time())


def clear_login_failures(key: str) -> None:
    _failures.pop(key, None)
