from datetime import datetime, timezone

from fastapi import Depends, Header, HTTPException

from .db import Conn, Row, get_db
from .security import hash_token


def current_user(
    authorization: str | None = Header(default=None),
    db: Conn = Depends(get_db),
) -> Row:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Not signed in")
    row = db.execute(
        """SELECT u.*, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id
           WHERE s.token_hash = ?""",
        (hash_token(authorization[7:]),),
    ).fetchone()
    if row is None or datetime.fromisoformat(row["expires_at"]) < datetime.now(timezone.utc):
        raise HTTPException(401, "Session expired")
    return row
