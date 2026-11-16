"""The grown-up on record for a player's account, and their consent to collecting answers.

Each account has at most one grown-up: an email address, a password of their own and whether
they have agreed to the player's answers being collected. The grown-up password is checked on
every change, so the player's own session cannot switch consent on.
"""

from fastapi import APIRouter, Depends, HTTPException

from ..db import Conn, IntegrityErrors, Row, get_db, utc_now
from ..deps import current_user
from ..schemas import ConsentIn, ParentIn, ParentOut, ParentUnlockIn
from ..security import (
    clear_login_failures,
    hash_password,
    login_blocked,
    record_login_failure,
    verify_password,
)

router = APIRouter(prefix="/api/parent", tags=["parent"])

SAME_PASSWORD = "The grown-up password must be different from the player’s password"


def parent_state(db: Conn, user_id: int) -> ParentOut:
    row = db.execute("SELECT consent_at FROM parents WHERE user_id = ?", (user_id,)).fetchone()
    return ParentOut(has_parent=row is not None, consent=bool(row and row["consent_at"]))


def add_parent(db: Conn, user_id: int, body: ParentIn) -> None:
    # ponytail: the email is recorded, not verified. Send a confirmation link once there is a
    # mail service; until then a child can type any address.
    db.execute(
        """INSERT INTO parents (user_id, email, password_hash, consent_at, created_at)
           VALUES (?, ?, ?, ?, ?)""",
        (
            user_id,
            body.email,
            hash_password(body.password),
            utc_now() if body.consent else None,
            utc_now(),
        ),
    )


def _check_password(db: Conn, user: Row, password: str) -> None:
    key = f"parent|{user['id']}"
    if login_blocked(key):
        raise HTTPException(429, "Too many tries. Please wait a few minutes and try again.")
    row = db.execute(
        "SELECT password_hash FROM parents WHERE user_id = ?", (user["id"],)
    ).fetchone()
    if row is None:
        raise HTTPException(404, "No grown-up is set up for this account yet")
    if not verify_password(password, row["password_hash"]):
        record_login_failure(key)
        # 403, not 401: the game treats 401 as "signed out"
        raise HTTPException(403, "That’s not the grown-up password")
    clear_login_failures(key)


@router.post("", response_model=ParentOut, status_code=201)
def set_up(body: ParentIn, user: Row = Depends(current_user), db: Conn = Depends(get_db)):
    """For accounts made before grown-ups existed, or by an app that does not ask for one."""
    if verify_password(body.password, user["password_hash"]):
        raise HTTPException(422, SAME_PASSWORD)
    try:
        add_parent(db, user["id"], body)
    except IntegrityErrors:
        raise HTTPException(409, "A grown-up is already set up for this account") from None
    return parent_state(db, user["id"])


@router.post("/unlock", status_code=204)
def unlock(body: ParentUnlockIn, user: Row = Depends(current_user), db: Conn = Depends(get_db)):
    _check_password(db, user, body.password)


@router.put("/consent", response_model=ParentOut)
def set_consent(body: ConsentIn, user: Row = Depends(current_user), db: Conn = Depends(get_db)):
    _check_password(db, user, body.password)
    db.execute(
        "UPDATE parents SET consent_at = ? WHERE user_id = ?",
        (utc_now() if body.consent else None, user["id"]),
    )
    return parent_state(db, user["id"])
