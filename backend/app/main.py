"""Meerkat Vision Quest: the API (accounts and saved progress) and the game's static files."""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from . import frontend
from .db import close_db, init_db
from .middleware import preview_gate
from .routes import auth, health, progress


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield
    close_db()


app = FastAPI(title="Meerkat Vision Quest", lifespan=lifespan)
app.middleware("http")(preview_gate)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(progress.router)

# Registered last so the API routes above always win.
app.include_router(frontend.router)
app.mount("/", frontend.static_files, name="frontend")
