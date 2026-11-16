"""Which log entries get collected into the attempts table. Run with `make test`."""

from app.routes.progress import new_attempts

RUN = {
    "ts": 2000, "day": "2026-11-13", "grade": 3, "module": "scan", "kind": "tracking",
    "score": 80, "pass": True, "d": {"actual": 4, "said": 3},
}  # fmt: skip


def test_new_attempts():
    log = [
        RUN,
        {**RUN, "ts": 1000},  # already collected
        {**RUN, "ts": 2100, "d": None},  # answers dropped
        {"ts": 2200, "grade": 3, "module": "scan", "score": 80, "pass": True},  # sample data
        {**RUN, "ts": 2300, "module": "nope"},
        {**RUN, "ts": 2400, "d": {"junk": "x" * 5000}},
        {**RUN, "ts": 10**15},  # clock far ahead
        "junk",
    ]
    assert new_attempts(log, after_ts=1500, now_ms=5000) == [
        (2000, 3, "scan", "tracking", 80, 1, '{"actual":4,"said":3}')
    ]
    assert new_attempts(None, after_ts=0, now_ms=5000) == []


if __name__ == "__main__":
    test_new_attempts()
    print("ok")
