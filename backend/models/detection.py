"""Detection models — hand-mirrored in frontend/src/types/detection.ts (keep in sync)."""

import uuid
from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field

Category = Literal["wild", "cattle", "domestic"]
AlertChannel = Literal["email", "sms", "whatsapp"]


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
    camera: str | None = None  # which node saw it, e.g. "CAM 01 · North Fence"
    alert_channels: list[AlertChannel] = Field(default_factory=list)  # what fired
    replay_count: int = 0  # times alerts were re-fired for this row (test path)
    source: str = "pi"  # "pi" (edge node) | "web-demo" (browser upload/webcam)


class IdentifyRequest(BaseModel):
    """A browser upload or webcam frame to run through the vision model."""

    image_base64: str  # raw base64 or a data: URL
    mime_type: str = "image/jpeg"


class IdentifyResult(BaseModel):
    is_animal: bool
    species: str | None = None
    category: Category | None = None
    confidence: float | None = None
    note: str | None = None  # why nothing was detected, or extra detail
    detection: Detection | None = None  # set when the result was logged


class DetectionCreate(BaseModel):
    """What the Raspberry Pi node posts when the edge model fires."""

    species: str
    category: Category
    confidence: float = Field(ge=0, le=100)
    image_url: str
    flickr_reference_url: str
    flickr_page_url: str
    camera: str | None = None
    alert_channels: list[AlertChannel] = Field(default_factory=list)


class DetectionStats(BaseModel):
    total: int
    wild: int
    cattle: int
    domestic: int
