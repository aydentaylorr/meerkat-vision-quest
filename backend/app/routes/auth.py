"""Accounts: register, log in, log out, and the signed-in profile."""

import json
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, Request

from ..config import SESSION_DAYS
from ..db import Conn, IntegrityErrors, Row, get_db, utc_now
from ..deps import current_user
from ..schemas import LoginIn, ProfileUpdateIn, RegisterIn, SessionOut, UserOut
from ..security import (
    DUMMY_HASH,
    clear_login_failures,
    hash_password,
    hash_token,
    login_blocked,
    new_token,
    record_login_failure,
    verify_password,
)

router = APIRouter(prefix="/api", tags=["auth"])


def _user_out(row: Row) -> UserOut:
    return UserOut(
        username=row["username"],
        start_grade=row["start_grade"],
        created_at=row["created_at"],
    )


def _load_state(db: Conn, user_id: int) -> dict | None:
    row = db.execute("SELECT state_json FROM progress WHERE user_id = ?", (user_id,)).fetchone()
    return json.loads(row["state_json"]) if row else None


def _open_session(db: Conn, user: Row) -> SessionOut:
    token, token_hash = new_token()
    expires = datetime.now(UTC) + timedelta(days=SESSION_DAYS)
    db.execute("DELETE FROM sessions WHERE expires_at < ?", (datetime.now(UTC).isoformat(),))
    db.execute(
        "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
        (token_hash, user["id"], expires.isoformat()),
    )
    return SessionOut(token=token, user=_user_out(user), state=_load_state(db, user["id"]))


@router.post("/auth/register", response_model=SessionOut, status_code=201)
def register(body: RegisterIn, db: Conn = Depends(get_db)):
    try:
        user = db.execute(
            """INSERT INTO users (username, start_grade, password_hash, created_at)
               VALUES (?, ?, ?, ?) RETURNING *""",
            (body.username, body.start_grade, hash_password(body.password), utc_now()),
        ).fetchone()
    except IntegrityErrors:
        raise HTTPException(409, "That username is already taken") from None
    return _open_session(db, user)


@router.post("/auth/login", response_model=SessionOut)
def login(body: LoginIn, request: Request, db: Conn = Depends(get_db)):
    username = body.username.strip().lower()
    key = f"{username}|{request.client.host if request.client else '?'}"
    if login_blocked(key):
        raise HTTPException(429, "Too many tries. Please wait a few minutes and try again.")
    user = db.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
    ok = verify_password(body.password, user["password_hash"] if user else DUMMY_HASH)
    if not user or not ok:
        record_login_failure(key)
        raise HTTPException(401, "Wrong username or password")
    clear_login_failures(key)
    return _open_session(db, user)


@router.post("/auth/logout", status_code=204)
def logout(
    x_session_token: str | None = Header(default=None),
    _user: Row = Depends(current_user),
    db: Conn = Depends(get_db),
):
    db.execute("DELETE FROM sessions WHERE token_hash = ?", (hash_token(x_session_token),))


@router.get("/me", response_model=SessionOut)
def me(
    x_session_token: str | None = Header(default=None),
    user: Row = Depends(current_user),
    db: Conn = Depends(get_db),
):
    return SessionOut(
        token=x_session_token, user=_user_out(user), state=_load_state(db, user["id"])
    )


@router.patch("/me", response_model=UserOut)
def update_me(
    body: ProfileUpdateIn,
    user: Row = Depends(current_user),
    db: Conn = Depends(get_db),
):
    db.execute("UPDATE users SET start_grade = ? WHERE id = ?", (body.start_grade, user["id"]))
    return _user_out(db.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone())
