"""Detection models — hand-mirrored in frontend/src/types/detection.ts (keep in sync)."""

import uuid
from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field

Category = Literal["wild", "cattle", "domestic"]


def utc_now() -> datetime:
    """Aware UTC now — store aware, so Pydantic serialises the offset for new Date(...)."""
    return datetime.now(timezone.utc)


class Detection(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    species: str
    category: Category
    confidence: float = Field(ge=0, le=100)  # percent, 0-100
    image_url: str
    flickr_reference_url: str
    flickr_page_url: str
    created_at: datetime = Field(default_factory=utc_now)


class DetectionCreate(BaseModel):
    """What the Raspberry Pi node posts when the edge model fires."""

    species: str
    category: Category
    confidence: float = Field(ge=0, le=100)
    image_url: str
    flickr_reference_url: str
    flickr_page_url: str


class DetectionStats(BaseModel):
    total: int
    wild: int
    cattle: int
    domestic: int
