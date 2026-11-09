"""Optional shared-password gate for previews, and a "do not index" header on every response."""

import base64
import hmac

from fastapi import Request
from fastapi.responses import Response

from .config import SITE_PASSWORD


def _password_given(request: Request) -> str:
    header = request.headers.get("authorization", "")
    if not header.startswith("Basic "):
        return ""
    try:
        return base64.b64decode(header[6:]).decode().partition(":")[2]
    except ValueError:
        return ""


async def preview_gate(request: Request, call_next):
    if SITE_PASSWORD and request.url.path != "/api/health":
        if not hmac.compare_digest(_password_given(request).encode(), SITE_PASSWORD.encode()):
            return Response(
                "Password required",
                status_code=401,
                headers={"WWW-Authenticate": 'Basic realm="Meerkat Vision Quest preview"'},
            )
    response = await call_next(request)
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    return response
