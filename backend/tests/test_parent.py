"""A grown-up has to confirm their email before anything opens or is collected.

Run with `make test`.
"""

import os
import re
import tempfile
import time
from contextlib import contextmanager

os.environ["MVQ_DATA_DIR"] = tempfile.mkdtemp()
os.environ.pop("DATABASE_URL", None)

from fastapi import HTTPException  # noqa: E402

from app.config import PUBLIC_URL  # noqa: E402
from app.db import get_db, init_db  # noqa: E402
from app.routes import parent as grown_up  # noqa: E402
from app.routes.auth import register  # noqa: E402
from app.routes.progress import save_progress  # noqa: E402
from app.schemas import (  # noqa: E402
    ConsentIn,
    EmailChangeIn,
    ParentIn,
    ParentUnlockIn,
    ProgressIn,
    RegisterIn,
    ResetConfirmIn,
    TokenIn,
)

CHILD, GROWN_UP, NEW = "child-pass", "grown-up-pass", "new-grown-up-pass"

MAILS = []
grown_up.send_mail = lambda to, subject, body: MAILS.append((to, subject, body)) or True


def link(kind):
    """The token in the newest email's link."""
    return re.search(rf"{re.escape(PUBLIC_URL)}/#{kind}=([\w-]+)", MAILS[-1][2]).group(1)


def run_state(seconds):
    """A finished exercise, `seconds` from now."""
    return {
        "ts": int(time.time() * 1000) + seconds * 1000,
        "grade": 2,
        "module": "scan",
        "kind": "tracking",
        "score": 80,
        "pass": True,
        "d": {"actual": 4, "said": 3},
    }


def status(call):
    try:
        call()
    except HTTPException as e:
        return e.status_code
    except ValueError:  # a request body the schema refuses
        return 422
    return 200


def test_grown_up_accounts():
    init_db()
    with contextmanager(get_db)() as db:
        count = lambda: db.execute("SELECT COUNT(*) AS n FROM attempts").fetchone()["n"]  # noqa: E731
        user = lambda name: db.execute(  # noqa: E731
            "SELECT * FROM users WHERE username = ?", (name,)
        ).fetchone()
        save = lambda u, *secs: save_progress(  # noqa: E731
            ProgressIn(state={"log": [run_state(s) for s in secs]}), u, db
        )
        unlock = lambda u, pw: status(  # noqa: E731
            lambda: grown_up.unlock(ParentUnlockIn(password=pw), u, db)
        )
        consent = lambda u, pw, on: status(  # noqa: E731
            lambda: grown_up.set_consent(ConsentIn(password=pw, consent=on), u, db)
        )
        verify = lambda t: status(lambda: grown_up.verify(TokenIn(token=t), db))  # noqa: E731
        reset = lambda t, pw: status(  # noqa: E731
            lambda: grown_up.confirm_reset(ResetConfirmIn(token=t, password=pw), db)
        )

        # a grown-up password equal to the player's is refused, and so is a short one
        same = ParentIn(email="a@b.co", password=CHILD)
        kid0 = RegisterIn(username="kid_zero", password=CHILD, start_grade=2, parent=same)
        assert status(lambda: register(kid0, db)) == 422
        assert status(lambda: ParentIn(email="a@b.co", password="short")) == 422
        assert status(lambda: ParentIn(email="not an email", password=GROWN_UP)) == 422

        # sign-up with the sharing box ticked: recorded, emailed, but not confirmed yet
        mum = ParentIn(email=" Mum@Example.com ", password=GROWN_UP, consent=True)
        out = register(
            RegisterIn(username="kid_one", password=CHILD, start_grade=2, parent=mum), db
        ).user
        assert (out.has_parent, out.verified, out.consent) == (True, False, True)
        assert out.email_hint == "m***@example.com"
        assert MAILS[-1][0] == "mum@example.com" and len(MAILS) == 1
        kid = user("kid_one")

        # until the email is confirmed nothing opens and nothing is collected
        save(kid, -60, 5)
        assert count() == 0
        assert unlock(kid, GROWN_UP) == 409
        assert unlock(kid, CHILD) == 403
        assert consent(kid, GROWN_UP, True) == 409

        # the emailed link confirms the address, once
        token = link("verify")
        assert verify("x" * 40) == 400
        assert verify(token) == 200
        assert verify(token) == 400
        assert unlock(kid, GROWN_UP) == 200

        # now only what is played from here on is collected, not the earlier exercise
        save(kid, -60, 5)
        assert count() == 1

        # the player's password cannot change sharing; the grown-up's can, and off deletes
        assert consent(kid, CHILD, False) == 403
        assert consent(kid, GROWN_UP, False) == 200
        assert count() == 0
        assert db.execute("SELECT COUNT(*) AS n FROM players").fetchone()["n"] == 0
        assert consent(kid, GROWN_UP, True) == 200
        assert "Sharing is now on" in MAILS[-1][1]

        # a forgotten grown-up password is reset through an emailed link
        grown_up.request_reset(kid, db)
        token = link("reset")
        assert reset(token, CHILD) == 422  # still may not match the player's password
        assert reset(token, NEW) == 200
        assert reset(token, NEW) == 400
        assert unlock(kid, GROWN_UP) == 403
        assert unlock(kid, NEW) == 200

        # an expired link does nothing
        grown_up.request_reset(kid, db)
        db.execute("UPDATE email_tokens SET expires_at = '2000-01-01T00:00:00+00:00'")
        assert reset(link("reset"), GROWN_UP) == 400

        # a new email address has to be confirmed again, and sharing pauses until it is
        before = count()
        changed = grown_up.change_email(
            EmailChangeIn(password=NEW, email="dad@example.com"), kid, db
        )
        assert not changed.verified and MAILS[-1][0] == "dad@example.com"
        assert unlock(kid, NEW) == 409
        save(kid, 8)
        assert count() == before
        assert verify(link("verify")) == 200
        assert unlock(kid, NEW) == 200

        # an account made without a grown-up collects nothing and can add one later, once
        register(RegisterIn(username="kid_two", password=CHILD, start_grade=2), db)
        kid2 = user("kid_two")
        save(kid2, 9)
        assert count() == before
        set_up = lambda body: status(lambda: grown_up.set_up(body, kid2, db))  # noqa: E731
        assert set_up(same) == 422
        assert set_up(ParentIn(email="a@b.co", password=GROWN_UP)) == 200
        assert set_up(mum) == 409

        # emails per account are limited
        codes = [status(lambda: grown_up.resend(kid2, db)) for _ in range(6)]
        assert codes[0] == 200 and codes[-1] == 429


if __name__ == "__main__":
    test_grown_up_accounts()
    print("ok")
