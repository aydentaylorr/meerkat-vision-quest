"""Health check, also used to see which version is deployed."""

from fastapi import APIRouter

from ..config import VERSION

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health():
    return {"ok": True, "version": VERSION}
