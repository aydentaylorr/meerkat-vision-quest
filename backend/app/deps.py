"""Shared request dependencies (who is the signed-in user)."""

from datetime import UTC, datetime

from fastapi import Depends, Header, HTTPException

from .db import Conn, Row, get_db
from .security import hash_token


def current_user(
    x_session_token: str | None = Header(default=None),
    db: Conn = Depends(get_db),
) -> Row:
    if not x_session_token:
        raise HTTPException(401, "Not signed in")
    row = db.execute(
        """SELECT u.*, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id
           WHERE s.token_hash = ?""",
        (hash_token(x_session_token),),
    ).fetchone()
    if row is None or datetime.fromisoformat(row["expires_at"]) < datetime.now(UTC):
        raise HTTPException(401, "Session expired")
    return row
