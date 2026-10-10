import re
from typing import Any

from pydantic import BaseModel, Field, field_validator

from .config import MAX_GRADE

_USERNAME_RE = re.compile(r"^[a-z0-9_]{3,20}$")


class RegisterIn(BaseModel):
    username: str
    password: str = Field(min_length=6, max_length=128)
    start_grade: int = Field(ge=1, le=MAX_GRADE)

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


class UserOut(BaseModel):
    username: str
    start_grade: int
    created_at: str


class SessionOut(BaseModel):
    token: str
    user: UserOut
    state: dict[str, Any] | None
