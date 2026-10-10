import base64
import hmac
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi import Request
from fastapi.responses import FileResponse, Response

from .config import FRONTEND_DIST, SITE_PASSWORD
from .db import close_db, init_db
from .routes import auth, progress


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield
    close_db()


app = FastAPI(title="Meerkat Vision Quest API", lifespan=lifespan)
app.include_router(auth.router)
app.include_router(progress.router)


@app.middleware("http")
async def staging_gate(request: Request, call_next):
    if SITE_PASSWORD and request.url.path != "/api/health":
        given = ""
        header = request.headers.get("authorization", "")
        if header.startswith("Basic "):
            try:
                given = base64.b64decode(header[6:]).decode().partition(":")[2]
            except ValueError:
                pass
        if not hmac.compare_digest(given.encode(), SITE_PASSWORD.encode()):
            return Response(
                "Password required",
                status_code=401,
                headers={"WWW-Authenticate": 'Basic realm="Meerkat Vision Quest preview"'},
            )
    response = await call_next(request)
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    return response


@app.get("/api/health")
def health():
    return {"ok": True}


if FRONTEND_DIST.is_dir():

    @app.get("/{path:path}", include_in_schema=False)
    def frontend(path: str):
        if path.startswith("api/"):
            raise HTTPException(404, "Not found")
        candidate = (FRONTEND_DIST / path).resolve()
        if path and candidate.is_file() and FRONTEND_DIST.resolve() in candidate.parents:
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")
