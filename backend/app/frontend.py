"""Serves the game itself (the plain static files in /frontend)."""

from fastapi import APIRouter
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from .config import FRONTEND_DIR, VERSION

NO_CACHE = {"Cache-Control": "no-cache"}

router = APIRouter()


class NoCacheStaticFiles(StaticFiles):
    """Static files that browsers re-check on every visit, so new deploys show up straight away."""

    def file_response(self, *args, **kwargs):
        response = super().file_response(*args, **kwargs)
        response.headers.update(NO_CACHE)
        return response


@router.get("/", include_in_schema=False)
def index() -> HTMLResponse:
    """The page, stamped with the deployed version so a tab can tell when it is out of date."""
    html = (FRONTEND_DIR / "index.html").read_text(encoding="utf-8").replace("__BUILD__", VERSION)
    return HTMLResponse(html, headers=NO_CACHE)


static_files = NoCacheStaticFiles(directory=FRONTEND_DIR)
