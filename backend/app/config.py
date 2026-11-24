"""Settings, read once from environment variables with sensible local defaults."""

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT.parent / "frontend"

# Local development uses a SQLite file; setting DATABASE_URL switches to Postgres.
DATA_DIR = Path(os.environ.get("MVQ_DATA_DIR", ROOT / "data"))
DB_PATH = DATA_DIR / "meerkat.db"
DATABASE_URL = os.environ.get("DATABASE_URL", "")

# The deployed git commit (Render sets RENDER_GIT_COMMIT); "dev" when running locally.
VERSION = os.environ.get("RENDER_GIT_COMMIT", "dev")[:7]

# Optional: when set, every page and API call asks for this shared password (preview use).
SITE_PASSWORD = os.environ.get("MVQ_SITE_PASSWORD", "")

MAX_GRADE = 12
SESSION_DAYS = 30
MAX_STATE_BYTES = 256 * 1024
LOGIN_MAX_FAILURES = 5
LOGIN_WINDOW_SECONDS = 300

# Email, used to confirm a grown-up's address. With no MVQ_SMTP_HOST (local development)
# messages are written to the server log instead of being sent.
SMTP_HOST = os.environ.get("MVQ_SMTP_HOST", "")
SMTP_PORT = int(os.environ.get("MVQ_SMTP_PORT", "587"))
SMTP_USER = os.environ.get("MVQ_SMTP_USER", "")
SMTP_PASSWORD = os.environ.get("MVQ_SMTP_PASSWORD", "")
MAIL_FROM = os.environ.get("MVQ_MAIL_FROM", "Meerkat Vision Quest <no-reply@localhost>")
# Where players reach the game. Links in emails are built from this, never from the request,
# so a forged Host header cannot point a link somewhere else.
PUBLIC_URL = os.environ.get("MVQ_PUBLIC_URL", "http://localhost:8000").rstrip("/")
VERIFY_HOURS = 24
RESET_MINUTES = 60
