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
