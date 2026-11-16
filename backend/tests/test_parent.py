"""The grown-up on an account, their password and their consent. Run with `make test`."""

import os
import tempfile
from contextlib import contextmanager

os.environ["MVQ_DATA_DIR"] = tempfile.mkdtemp()
os.environ.pop("DATABASE_URL", None)

from fastapi import HTTPException  # noqa: E402

from app.db import get_db, init_db  # noqa: E402
from app.routes.auth import register  # noqa: E402
from app.routes.parent import set_consent, set_up, unlock  # noqa: E402
from app.schemas import (  # noqa: E402
    ConsentIn,
    ParentIn,
    ParentUnlockIn,
    RegisterIn,
)

CHILD, GROWN_UP = "child-pass", "grown-up-pass"


def status(call):
    try:
        call()
    except HTTPException as e:
        return e.status_code
    return 200


def test_grown_up():
    init_db()
    with contextmanager(get_db)() as db:
        user = lambda name: db.execute("SELECT * FROM users WHERE username = ?", (name,)).fetchone()  # noqa: E731
        parent = ParentIn(email=" Mum@Example.com ", password=GROWN_UP)

        # a grown-up password equal to the player's is refused
        same = RegisterIn(username="kid_zero", password=CHILD, start_grade=2,
                          parent=ParentIn(email="a@b.co", password=CHILD))  # fmt: skip
        assert status(lambda: register(same, db)) == 422

        # consent is off unless it was ticked
        out = register(
            RegisterIn(username="kid_one", password=CHILD, start_grade=2, parent=parent), db
        )
        assert (out.user.has_parent, out.user.consent) == (True, False)
        kid = user("kid_one")

        # the player's own password does not open the grown-ups area or switch consent on
        assert status(lambda: unlock(ParentUnlockIn(password=CHILD), kid, db)) == 403
        assert status(lambda: set_consent(ConsentIn(password=CHILD, consent=True), kid, db)) == 403
        assert status(lambda: unlock(ParentUnlockIn(password=GROWN_UP), kid, db)) == 200

        # only the grown-up password switches consent
        assert set_consent(ConsentIn(password=GROWN_UP, consent=True), kid, db).consent
        assert not set_consent(ConsentIn(password=GROWN_UP, consent=False), kid, db).consent

        # an account made without a grown-up can add one later, once
        register(RegisterIn(username="kid_two", password=CHILD, start_grade=2), db)
        kid2 = user("kid_two")
        assert status(lambda: set_up(ParentIn(email="a@b.co", password=CHILD), kid2, db)) == 422
        assert set_up(ParentIn(email="a@b.co", password=GROWN_UP, consent=True), kid2, db).consent
        assert status(lambda: set_up(parent, kid2, db)) == 409
        assert (
            db.execute("SELECT email FROM parents ORDER BY user_id").fetchone()["email"]
            == "mum@example.com"
        )


if __name__ == "__main__":
    test_grown_up()
    print("ok")
