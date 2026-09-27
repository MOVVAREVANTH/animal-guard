"""Detections — the ingest + read API the Raspberry Pi node and the dashboard talk to."""

import csv
import io
import random
from datetime import datetime, timezone
from typing import List
from urllib.parse import quote

from fastapi import APIRouter, HTTPException, Query, Response
from pymongo import DESCENDING, ReturnDocument

from lib.db import db
from models.detection import Detection, DetectionCreate, DetectionStats, utc_now

router = APIRouter()

VALID_CATEGORIES = ("wild", "cattle", "domestic")

ALERT_CHANNELS = ("email", "sms", "whatsapp")

CAMERAS = (
    "CAM 01 · North Fence",
    "CAM 02 · Water Trough",
    "CAM 03 · Barn Door",
    "CAM 04 · South Pasture",
)


def random_alert_channels() -> list[str]:
    """Realistic dispatch pattern: email always, SMS and WhatsApp mostly."""
    channels = ["email"]
    if random.random() < 0.9:
        channels.append("sms")
    if random.random() < 0.85:
        channels.append("whatsapp")
    return channels


def flickr_page_url(species: str) -> str:
    """Curated Flickr search for the species — the 'more reference photos' link."""
    return f"https://www.flickr.com/search/?text={quote(f'{species} wildlife')}"


# Species the edge model recognises, with sample snapshot + reference imagery so a fresh
# install has a populated dashboard. In production the Pi node posts its own camera URLs.
SPECIES_CATALOG: dict[str, dict] = {
    "Elephant": {
        "category": "wild",
        "snapshot": "https://images.unsplash.com/photo-1554490754-c1f912ac1b77?w=900&q=75&auto=format&fit=crop",
        "reference": "https://images.unsplash.com/photo-1497877525637-8139b5d0ef24?w=900&q=75&auto=format&fit=crop",
    },
    "Bear": {
        "category": "wild",
        "snapshot": "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=900&q=75&auto=format&fit=crop",
        "reference": "https://images.unsplash.com/photo-1551792714-9a8b35338793?w=900&q=75&auto=format&fit=crop",
    },
    "Zebra": {
        "category": "wild",
        "snapshot": "https://images.unsplash.com/photo-1605087787800-2058b163a326?w=900&q=75&auto=format&fit=crop",
        "reference": "https://images.unsplash.com/photo-1481889617387-82a8f2413b6b?w=900&q=75&auto=format&fit=crop",
    },
    "Giraffe": {
        "category": "wild",
        "snapshot": "https://images.unsplash.com/photo-1549854233-ca0baec6fa74?w=900&q=75&auto=format&fit=crop",
        "reference": "https://images.unsplash.com/photo-1623951578056-5082d34a9859?w=900&q=75&auto=format&fit=crop",
    },
    "Bird": {
        "category": "wild",
        "snapshot": "https://images.unsplash.com/photo-1608412236942-41d095875b39?w=900&q=75&auto=format&fit=crop",
        "reference": "https://images.unsplash.com/photo-1722167993715-40a7661cf036?w=900&q=75&auto=format&fit=crop",
    },
    "Deer": {
        "category": "wild",
        "snapshot": "https://images.unsplash.com/photo-1599180469126-0defe37b368b?w=900&q=75&auto=format&fit=crop",
        "reference": "https://images.unsplash.com/photo-1570422593863-bd38ef7ce050?w=900&q=75&auto=format&fit=crop",
    },
    "Cow": {
        "category": "cattle",
        "snapshot": "https://images.unsplash.com/photo-1641939193329-7071068dc40f?w=900&q=75&auto=format&fit=crop",
        "reference": "https://images.unsplash.com/photo-1659148566517-9dfe52f802ac?w=900&q=75&auto=format&fit=crop",
    },
    "Horse": {
        "category": "cattle",
        "snapshot": "https://images.unsplash.com/photo-1550785148-ace594ff7b61?w=900&q=75&auto=format&fit=crop",
        "reference": "https://images.unsplash.com/photo-1616517465328-de964a6f8cd5?w=900&q=75&auto=format&fit=crop",
    },
    "Sheep": {
        "category": "cattle",
        "snapshot": "https://images.unsplash.com/photo-1601284703470-0afd2fcf7ccc?w=900&q=75&auto=format&fit=crop",
        "reference": "https://images.unsplash.com/photo-1695076721761-7eb530f1ef4d?w=900&q=75&auto=format&fit=crop",
    },
    "Dog": {
        "category": "domestic",
        "snapshot": "https://images.unsplash.com/photo-1543599000-876a9c2ad286?w=900&q=75&auto=format&fit=crop",
        "reference": "https://images.unsplash.com/photo-1680718349543-2016f3e618cd?w=900&q=75&auto=format&fit=crop",
    },
    "Cat": {
        "category": "domestic",
        "snapshot": "https://images.unsplash.com/photo-1675504661658-33940d979a6a?w=900&q=75&auto=format&fit=crop",
        "reference": "https://images.unsplash.com/photo-1577544060849-3fc4e4a5ba01?w=900&q=75&auto=format&fit=crop",
    },
}


def _normalize(doc: dict) -> dict:
    """Motor hands naive datetimes back — re-anchor them to UTC before serialising."""
    created = doc.get("created_at")
    if isinstance(created, datetime) and created.tzinfo is None:
        doc["created_at"] = created.replace(tzinfo=timezone.utc)
    return doc


@router.get("/detections", response_model=List[Detection])
async def list_detections(
    category: str | None = Query(default=None, description="wild | cattle | domestic"),
    limit: int = Query(default=50, ge=1, le=200),
):
    query: dict = {}
    if category:
        if category not in VALID_CATEGORIES:
            raise HTTPException(
                status_code=400,
                detail=f"unknown category '{category}' — use wild, cattle or domestic",
            )
        query["category"] = category
    docs = await db.detections.find(query).sort("created_at", DESCENDING).to_list(limit)
    return [Detection(**_normalize(doc)) for doc in docs]


@router.get("/stats", response_model=DetectionStats)
async def get_stats():
    return DetectionStats(
        total=await db.detections.count_documents({}),
        wild=await db.detections.count_documents({"category": "wild"}),
        cattle=await db.detections.count_documents({"category": "cattle"}),
        domestic=await db.detections.count_documents({"category": "domestic"}),
    )


@router.post("/detections", response_model=Detection, status_code=201)
async def create_detection(input: DetectionCreate):
    """Ingest endpoint the Pi node posts to when the edge model fires."""
    detection = Detection(**input.model_dump())
    await db.detections.insert_one(detection.model_dump())
    return detection


@router.post("/detections/simulate", response_model=Detection, status_code=201)
async def simulate_detection(
    category: str | None = Query(default=None, description="constrain the random species"),
):
    """Demo affordance: fabricate one detection so the live flow is observable."""
    pool_category = category or random.choice(list(VALID_CATEGORIES))
    if pool_category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"unknown category '{pool_category}'")
    pool = {s: m for s, m in SPECIES_CATALOG.items() if m["category"] == pool_category}
    species, meta = random.choice(list(pool.items()))
    detection = Detection(
        species=species,
        category=meta["category"],
        confidence=round(random.uniform(78.0, 98.5), 1),
        image_url=meta["snapshot"],
        flickr_reference_url=meta["reference"],
        flickr_page_url=flickr_page_url(species),
        created_at=utc_now(),
        camera=random.choice(CAMERAS),
        alert_channels=random_alert_channels(),
    )
    await db.detections.insert_one(detection.model_dump())
    return detection


@router.get("/detections/export.csv")
async def export_detections_csv(
    category: str | None = Query(default=None, description="wild | cattle | domestic"),
    limit: int = Query(default=500, ge=1, le=1000),
):
    """The filtered detection history as a downloadable CSV for record-keeping."""
    query: dict = {}
    if category:
        if category not in VALID_CATEGORIES:
            raise HTTPException(
                status_code=400,
                detail=f"unknown category '{category}' — use wild, cattle or domestic",
            )
        query["category"] = category
    docs = await db.detections.find(query).sort("created_at", DESCENDING).to_list(limit)

    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(
        ["id", "species", "category", "confidence", "camera", "alert_channels",
         "replay_count", "image_url", "flickr_reference_url", "flickr_page_url", "created_at"]
    )
    for doc in docs:
        d = Detection(**_normalize(doc))
        writer.writerow(
            [d.id, d.species, d.category, d.confidence, d.camera or "",
             "|".join(d.alert_channels), d.replay_count, d.image_url,
             d.flickr_reference_url, d.flickr_page_url, d.created_at.isoformat()]
        )

    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="animal-guard-detections.csv"'},
    )


@router.post("/detections/{detection_id}/replay", response_model=Detection)
async def replay_detection_alerts(detection_id: str):
    """Test path: re-fire the alert channels for one stored detection."""
    doc = await db.detections.find_one({"id": detection_id})
    if not doc:
        raise HTTPException(status_code=404, detail=f"detection {detection_id} not found")
    updated = await db.detections.find_one_and_update(
        {"id": detection_id},
        {"$set": {"alert_channels": list(ALERT_CHANNELS)}, "$inc": {"replay_count": 1}},
        return_document=ReturnDocument.AFTER,
    )
    return Detection(**_normalize(updated))
