import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = Path(os.environ.get("MVQ_DATA_DIR", ROOT / "data"))
DB_PATH = DATA_DIR / "meerkat.db"
DATABASE_URL = os.environ.get("DATABASE_URL", "")
FRONTEND_DIST = ROOT.parent / "frontend" / "dist"

MAX_GRADE = 12
SESSION_DAYS = 30
MAX_STATE_BYTES = 256 * 1024
LOGIN_MAX_FAILURES = 5
LOGIN_WINDOW_SECONDS = 300

# Optional: when set, every page and API call asks for this shared password (staging/demo use).
SITE_PASSWORD = os.environ.get("MVQ_SITE_PASSWORD", "")
