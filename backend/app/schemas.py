"""Request and response shapes for the API."""

import re
from typing import Any

from pydantic import BaseModel, Field, field_validator

from .config import MAX_GRADE

_USERNAME_RE = re.compile(r"^[a-z0-9_]{3,20}$")
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ParentIn(BaseModel):
    """The grown-up on record for a player's account."""

    email: str = Field(max_length=254)
    password: str = Field(min_length=6, max_length=128)
    consent: bool = False

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = v.strip().lower()
        if not _EMAIL_RE.match(v):
            raise ValueError("Please enter a real email address")
        return v


class ParentUnlockIn(BaseModel):
    password: str = Field(max_length=128)


class ConsentIn(BaseModel):
    password: str = Field(max_length=128)
    consent: bool


class ParentOut(BaseModel):
    has_parent: bool
    consent: bool


class RegisterIn(BaseModel):
    username: str
    password: str = Field(min_length=6, max_length=128)
    start_grade: int = Field(ge=1, le=MAX_GRADE)
    # The web game always sends a grown-up. An account without one can still play, but its
    # answers are not collected and its grown-ups area asks for one first.
    parent: ParentIn | None = None

    @field_validator("username")
    @classmethod
    def _username(cls, v: str) -> str:
        v = v.strip().lower()
        if not _USERNAME_RE.match(v):
            raise ValueError("Username must be 3-20 letters, numbers or underscores")
        return v


class LoginIn(BaseModel):
    username: str = Field(max_length=40)
    password: str = Field(max_length=128)


class ProfileUpdateIn(BaseModel):
    start_grade: int = Field(ge=1, le=MAX_GRADE)


class ProgressIn(BaseModel):
    state: dict[str, Any]


class UserOut(ParentOut):
    username: str
    start_grade: int
    created_at: str


class SessionOut(BaseModel):
    token: str
    user: UserOut
    state: dict[str, Any] | None
