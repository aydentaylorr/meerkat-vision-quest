"""Saving a player’s game progress, and collecting the answers from each exercise.

Answers are only collected once the account's grown-up has confirmed their email and agreed.
The collected answers (the attempts table) carry no username or user id. Each player gets a
random id, and the players table is the only link from an account to it: delete that row and the
player's attempts can no longer be traced to anyone.
"""

import json
import secrets
import time
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError

from ..config import MAX_ATTEMPT_DETAIL_BYTES, MAX_STATE_BYTES
from ..db import Conn, Row, get_db, utc_now
from ..deps import current_user
from ..schemas import LogEntry, ProgressIn

router = APIRouter(prefix="/api", tags=["progress"])

DAY_MS = 86_400_000


def new_attempts(log: Any, after_ts: int, now_ms: int) -> list[tuple]:
    """Rows for the attempts table: log entries newer than `after_ts` that carry answers.

    The log is whatever the client sent, so anything that doesn't fit is skipped. That
    includes the grown-ups area's sample data and runs old enough to have dropped their answers.
    """
    rows = []
    for raw in log if isinstance(log, list) else []:
        try:
            entry = LogEntry.model_validate(raw)
        except ValidationError:
            continue
        detail = json.dumps(entry.d, separators=(",", ":"))
        # a clock set far ahead would otherwise hide every later run behind its timestamp
        if after_ts < entry.ts <= now_ms + DAY_MS and len(detail) <= MAX_ATTEMPT_DETAIL_BYTES:
            rows.append(
                (
                    entry.ts,
                    entry.grade,
                    entry.module,
                    entry.kind,
                    entry.score,
                    int(entry.passed),
                    detail,
                )
            )
    return rows


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
           ON CONFLICT(user_id) DO UPDATE
           SET state_json = excluded.state_json, updated_at = excluded.updated_at""",
        (user["id"], payload, utc_now()),
    )
    parent = db.execute(
        """SELECT consent_at, verified_at FROM parents
           WHERE user_id = ? AND consent_at IS NOT NULL AND verified_at IS NOT NULL""",
        (user["id"],),
    ).fetchone()
    if not parent:
        return {"ok": True}
    # Only exercises finished after the grown-up both agreed and confirmed their email are
    # collected, not the ones still in the log from before. ponytail: this compares the player's
    # clock with the server's, so runs within the gap between the two clocks can land on the
    # wrong side.
    start = max(parent["consent_at"], parent["verified_at"])
    agreed = datetime.strptime(start, "%Y-%m-%d %H:%M:%S").replace(tzinfo=UTC)
    since = int(agreed.timestamp() * 1000)
    # ponytail: the saved game overwrites itself, so finished runs are copied out of its log into
    # an append-only table here. Give the client its own endpoint if the log stops being saved.
    db.execute(
        "INSERT INTO players (user_id, anon_id) VALUES (?, ?) ON CONFLICT (user_id) DO NOTHING",
        (user["id"], secrets.token_hex(8)),
    )
    anon_id = db.execute("SELECT anon_id FROM players WHERE user_id = ?", (user["id"],)).fetchone()[
        "anon_id"
    ]
    last = db.execute(
        "SELECT COALESCE(MAX(ts), 0) AS ts FROM attempts WHERE anon_id = ?", (anon_id,)
    ).fetchone()["ts"]
    for row in new_attempts(body.state.get("log"), max(last, since), int(time.time() * 1000)):
        # the school grade is copied onto each row so age groups need no join back to accounts
        db.execute(
            """INSERT INTO attempts
               (anon_id, school_grade, ts, grade, module, kind, score, passed, detail_json)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING""",
            (anon_id, user["start_grade"], *row),
        )
    return {"ok": True}
