"""The grown-up on record for a player's account, and their consent to collecting answers.

Each account has at most one grown-up: an email address, a password of their own and whether
they have agreed to the player's answers being collected.

What keeps a child from standing in for the grown-up:
- The email address has to be confirmed through a link sent to it. Until then the grown-ups
  area stays closed and nothing is collected, whatever was ticked at sign-up.
- The grown-up password is checked on every change, so the player's own session cannot switch
  sharing on, and it can never be the same as the player's password.
- Links are single-use, expire, are stored only as hashes, and are built from the configured
  public address, never from the request.
- Switching sharing on sends the grown-up an email saying so.
"""

from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException

from ..config import PUBLIC_URL, RESET_MINUTES, VERIFY_HOURS
from ..db import Conn, IntegrityErrors, Row, get_db, utc_now
from ..deps import current_user
from ..mail import send_mail
from ..schemas import (
    ConsentIn,
    EmailChangeIn,
    ParentIn,
    ParentOut,
    ParentUnlockIn,
    ResetConfirmIn,
    TokenIn,
)
from ..security import (
    clear_login_failures,
    hash_password,
    hash_token,
    login_blocked,
    new_token,
    record_login_failure,
    verify_password,
)

router = APIRouter(prefix="/api/parent", tags=["parent"])

SAME_PASSWORD = "The grown-up password must be different from the player’s password"
NOT_CONFIRMED = "Open the link we emailed to the grown-up first"
BAD_LINK = "This link has expired or was already used. Ask for a new one in the grown-ups area."
MAIL_FAILED = "We couldn’t send the email. Please try again in a moment."


def parent_state(db: Conn, user_id: int) -> ParentOut:
    row = db.execute(
        "SELECT email, verified_at, consent_at FROM parents WHERE user_id = ?", (user_id,)
    ).fetchone()
    if row is None:
        return ParentOut(has_parent=False, verified=False, consent=False, email_hint="")
    name, _, domain = row["email"].partition("@")
    return ParentOut(
        has_parent=True,
        verified=bool(row["verified_at"]),
        consent=bool(row["consent_at"]),
        email_hint=f"{name[:1]}***@{domain}",
    )


def _parent(db: Conn, user: Row) -> Row:
    row = db.execute("SELECT * FROM parents WHERE user_id = ?", (user["id"],)).fetchone()
    if row is None:
        raise HTTPException(404, "No grown-up is set up for this account yet")
    return row


def _check_password(db: Conn, user: Row, password: str) -> Row:
    key = f"parent|{user['id']}"
    if login_blocked(key):
        raise HTTPException(429, "Too many tries. Please wait a few minutes and try again.")
    parent = _parent(db, user)
    if not verify_password(password, parent["password_hash"]):
        record_login_failure(key)
        # 403, not 401: the game treats 401 as "signed out"
        raise HTTPException(403, "That’s not the grown-up password")
    clear_login_failures(key)
    return parent


def _limit_mail(user: Row) -> None:
    """At most a handful of emails per account in a few minutes (the login limiter, reused)."""
    key = f"mail|{user['id']}"
    if login_blocked(key):
        raise HTTPException(429, "Too many emails asked for. Please wait a few minutes.")
    record_login_failure(key)


def _issue(db: Conn, user_id: int, purpose: str, email: str, minutes: int) -> str:
    """A new single-use link token. Any earlier link of the same kind stops working."""
    db.execute("DELETE FROM email_tokens WHERE user_id = ? AND purpose = ?", (user_id, purpose))
    token, token_hash = new_token()
    expires = datetime.now(UTC) + timedelta(minutes=minutes)
    db.execute(
        """INSERT INTO email_tokens (token_hash, user_id, purpose, email, expires_at)
           VALUES (?, ?, ?, ?, ?)""",
        (token_hash, user_id, purpose, email, expires.isoformat()),
    )
    return token


def _link(db: Conn, token: str, purpose: str) -> Row:
    """The live link a token belongs to. It only counts for the address it was sent to."""
    row = db.execute(
        "SELECT * FROM email_tokens WHERE token_hash = ? AND purpose = ?",
        (hash_token(token), purpose),
    ).fetchone()
    if row is None or datetime.fromisoformat(row["expires_at"]) < datetime.now(UTC):
        raise HTTPException(400, BAD_LINK)
    return row


def _use_up(db: Conn, link: Row) -> None:
    db.execute("DELETE FROM email_tokens WHERE token_hash = ?", (link["token_hash"],))


def _send_confirmation(db: Conn, user: Row, email: str, sharing: bool) -> bool:
    token = _issue(db, user["id"], "verify", email, VERIFY_HOURS * 60)
    sharing_line = (
        "You ticked the box to share this player’s answers, without their name, to help improve "
        "the game. That starts once you confirm. You can switch it off at any time in the "
        "grown-ups area, under Settings.\n\n"
        if sharing
        else ""
    )
    return send_mail(
        email,
        f"Confirm you are the grown-up for {user['username']} on Meerkat Vision Quest",
        f"Someone set you up as the grown-up for the player “{user['username']}” on Meerkat "
        "Vision Quest.\n\n"
        "If that was you, open this link to confirm your email address:\n"
        f"{PUBLIC_URL}/#verify={token}\n\n"
        f"The link works once and expires in {VERIFY_HOURS} hours. Until you confirm, the "
        "grown-ups area stays closed and none of this player’s answers are shared.\n\n"
        f"{sharing_line}"
        "If this was not you, ignore this email and nothing will happen.\n",
    )


def add_parent(db: Conn, user: Row, body: ParentIn) -> None:
    """Records the grown-up, unconfirmed, and emails them the link that confirms them."""
    db.execute(
        """INSERT INTO parents (user_id, email, password_hash, consent_at, created_at)
           VALUES (?, ?, ?, ?, ?)""",
        (
            user["id"],
            body.email,
            hash_password(body.password),
            utc_now() if body.consent else None,
            utc_now(),
        ),
    )
    # a failed send is not fatal: the grown-ups area offers to send it again
    _send_confirmation(db, user, body.email, body.consent)


@router.post("", response_model=ParentOut, status_code=201)
def set_up(body: ParentIn, user: Row = Depends(current_user), db: Conn = Depends(get_db)):
    """For accounts made before grown-ups existed, or by an app that does not ask for one."""
    if verify_password(body.password, user["password_hash"]):
        raise HTTPException(422, SAME_PASSWORD)
    _limit_mail(user)
    try:
        add_parent(db, user, body)
    except IntegrityErrors:
        raise HTTPException(409, "A grown-up is already set up for this account") from None
    return parent_state(db, user["id"])


@router.post("/verify", status_code=204)
def verify(body: TokenIn, db: Conn = Depends(get_db)):
    """Opened from the emailed link, signed in or not."""
    link = _link(db, body.token, "verify")
    done = db.execute(
        "UPDATE parents SET verified_at = ? WHERE user_id = ? AND email = ?",
        (utc_now(), link["user_id"], link["email"]),
    )
    if done.rowcount != 1:
        raise HTTPException(400, BAD_LINK)
    _use_up(db, link)


@router.post("/resend", status_code=204)
def resend(user: Row = Depends(current_user), db: Conn = Depends(get_db)):
    parent = _parent(db, user)
    if parent["verified_at"]:
        raise HTTPException(409, "This email address is already confirmed")
    _limit_mail(user)
    if not _send_confirmation(db, user, parent["email"], bool(parent["consent_at"])):
        raise HTTPException(502, MAIL_FAILED)


@router.put("/email", response_model=ParentOut)
def change_email(
    body: EmailChangeIn, user: Row = Depends(current_user), db: Conn = Depends(get_db)
):
    """A new address has to be confirmed again; sharing pauses until it is."""
    parent = _check_password(db, user, body.password)
    _limit_mail(user)
    db.execute(
        "UPDATE parents SET email = ?, verified_at = NULL WHERE user_id = ?",
        (body.email, user["id"]),
    )
    db.execute("DELETE FROM email_tokens WHERE user_id = ?", (user["id"],))
    if not _send_confirmation(db, user, body.email, bool(parent["consent_at"])):
        raise HTTPException(502, MAIL_FAILED)
    return parent_state(db, user["id"])


@router.post("/unlock", status_code=204)
def unlock(body: ParentUnlockIn, user: Row = Depends(current_user), db: Conn = Depends(get_db)):
    if not _check_password(db, user, body.password)["verified_at"]:
        raise HTTPException(409, NOT_CONFIRMED)


@router.put("/consent", response_model=ParentOut)
def set_consent(body: ConsentIn, user: Row = Depends(current_user), db: Conn = Depends(get_db)):
    parent = _check_password(db, user, body.password)
    if not parent["verified_at"]:
        raise HTTPException(409, NOT_CONFIRMED)
    db.execute(
        "UPDATE parents SET consent_at = ? WHERE user_id = ?",
        (utc_now() if body.consent else None, user["id"]),
    )
    if body.consent:
        send_mail(
            parent["email"],
            f"Sharing is now on for {user['username']} on Meerkat Vision Quest",
            f"Sharing was just switched on for the player “{user['username']}”. Their answers "
            "in the exercises are now studied together with other players’, without their "
            "name, to help improve the game.\n\n"
            "If you did not do this, or change your mind, open the grown-ups area in the game, "
            "go to Settings and switch sharing off. That also deletes what was collected.\n",
        )
    else:
        # taking consent back removes what was collected, and the link to it
        db.execute(
            "DELETE FROM attempts WHERE anon_id IN (SELECT anon_id FROM players WHERE user_id = ?)",
            (user["id"],),
        )
        db.execute("DELETE FROM players WHERE user_id = ?", (user["id"],))
    return parent_state(db, user["id"])


@router.post("/reset", status_code=204)
def request_reset(user: Row = Depends(current_user), db: Conn = Depends(get_db)):
    """Emails the grown-up a link for choosing a new grown-up password."""
    parent = _parent(db, user)
    _limit_mail(user)
    token = _issue(db, user["id"], "reset", parent["email"], RESET_MINUTES)
    sent = send_mail(
        parent["email"],
        f"Choose a new grown-up password for {user['username']} on Meerkat Vision Quest",
        f"A new grown-up password was asked for on the account of the player “{user['username']}”."
        "\n\nOpen this link to choose one:\n"
        f"{PUBLIC_URL}/#reset={token}\n\n"
        f"The link works once and expires in {RESET_MINUTES} minutes. "
        "If this was not you, ignore this email and the password stays as it is.\n",
    )
    if not sent:
        raise HTTPException(502, MAIL_FAILED)


@router.post("/reset/confirm", status_code=204)
def confirm_reset(body: ResetConfirmIn, db: Conn = Depends(get_db)):
    """Opened from the emailed link, signed in or not."""
    link = _link(db, body.token, "reset")
    user = db.execute("SELECT * FROM users WHERE id = ?", (link["user_id"],)).fetchone()
    if verify_password(body.password, user["password_hash"]):
        raise HTTPException(422, SAME_PASSWORD)  # the link stays usable for another try
    # reaching this link also proves the address, so it counts as confirming it
    done = db.execute(
        """UPDATE parents SET password_hash = ?, verified_at = COALESCE(verified_at, ?)
           WHERE user_id = ? AND email = ?""",
        (hash_password(body.password), utc_now(), link["user_id"], link["email"]),
    )
    if done.rowcount != 1:
        raise HTTPException(400, BAD_LINK)
    _use_up(db, link)
    clear_login_failures(f"parent|{link['user_id']}")
