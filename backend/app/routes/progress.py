import json

from fastapi import APIRouter, Depends, HTTPException

from ..config import MAX_STATE_BYTES
from ..db import Conn, Row, get_db, utc_now
from ..deps import current_user
from ..schemas import ProgressIn

router = APIRouter(prefix="/api", tags=["progress"])


@router.put("/progress")
def save_progress(
    body: ProgressIn,
    user: Row = Depends(current_user),
    db: Conn = Depends(get_db),
):
    payload = json.dumps(body.state, separators=(",", ":"))
    if len(payload.encode()) > MAX_STATE_BYTES:
        raise HTTPException(413, "Progress data is too large")
    db.execute(
        """INSERT INTO progress (user_id, state_json, updated_at) VALUES (?, ?, ?)
           ON CONFLICT(user_id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at""",
        (user["id"], payload, utc_now()),
    )
    return {"ok": True}
