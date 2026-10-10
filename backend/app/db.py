"""Database access. SQLite for local development; Postgres when DATABASE_URL is set."""

import sqlite3
from collections.abc import Iterator
from datetime import datetime, timezone
from typing import Any, Mapping

from .config import DATABASE_URL, DB_PATH

Row = Mapping[str, Any]

_TABLES = """
CREATE TABLE IF NOT EXISTS users (
    id            {pk},
    username      TEXT NOT NULL UNIQUE,
    start_grade   INTEGER NOT NULL DEFAULT 1,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS progress (
    user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
"""

USING_POSTGRES = bool(DATABASE_URL)


def utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


class Conn:
    """Runs SQL written with ? placeholders on either database."""

    def __init__(self, raw: Any):
        self.raw = raw

    def execute(self, sql: str, params: tuple = ()):
        if USING_POSTGRES:
            sql = sql.replace("?", "%s")
        return self.raw.execute(sql, params)


if USING_POSTGRES:
    import psycopg
    from psycopg.rows import dict_row
    from psycopg_pool import ConnectionPool

    IntegrityErrors: tuple = (psycopg.errors.IntegrityError,)
    # prepare_threshold=None keeps this working behind Neon's pooled endpoint.
    _pool = ConnectionPool(
        DATABASE_URL,
        min_size=1,
        max_size=5,
        open=False,
        check=ConnectionPool.check_connection,
        kwargs={"row_factory": dict_row, "prepare_threshold": None},
    )

    def init_db() -> None:
        _pool.open()
        with _pool.connection() as conn:
            conn.execute(_TABLES.format(pk="BIGSERIAL PRIMARY KEY"))

    def close_db() -> None:
        _pool.close()

    def get_db() -> Iterator[Conn]:
        with _pool.connection() as raw:
            yield Conn(raw)

else:
    IntegrityErrors = (sqlite3.IntegrityError,)

    def init_db() -> None:
        DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute("PRAGMA journal_mode=WAL")
            conn.executescript(_TABLES.format(pk="INTEGER PRIMARY KEY AUTOINCREMENT"))
            columns = {row[1] for row in conn.execute("PRAGMA table_info(users)")}
            if "start_grade" not in columns:
                conn.execute("ALTER TABLE users ADD COLUMN start_grade INTEGER NOT NULL DEFAULT 1")
            for old in ("display_name", "avatar"):
                if old in columns:
                    conn.execute(f"ALTER TABLE users DROP COLUMN {old}")

    def close_db() -> None:
        pass

    def get_db() -> Iterator[Conn]:
        raw = sqlite3.connect(DB_PATH)
        raw.row_factory = sqlite3.Row
        raw.execute("PRAGMA foreign_keys=ON")
        try:
            yield Conn(raw)
            raw.commit()
        except Exception:
            raw.rollback()
            raise
        finally:
            raw.close()
