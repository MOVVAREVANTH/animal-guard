"""Seed the detections collection with a realistic sample log.

Run: cd /app/backend && python seed.py
Idempotent (clears + re-inserts each run); standalone — never imported by server.py.
"""

import asyncio
from datetime import timedelta

from lib.db import db, ensure_indexes
from models.detection import Detection, utc_now
from routers.detections import SPECIES_CATALOG, flickr_page_url

# (species, minutes ago, confidence %, camera, alert channels) — newest first, ~2 days
SAMPLE_LOG: list[tuple[str, int, float, str, list[str]]] = [
    ("Elephant", 38, 91.4, "CAM 01 · North Fence", ["email", "sms", "whatsapp"]),
    ("Zebra", 125, 93.2, "CAM 04 · South Pasture", ["email", "sms"]),
    ("Cow", 190, 96.1, "CAM 02 · Water Trough", ["email", "sms", "whatsapp"]),
    ("Bear", 310, 87.6, "CAM 01 · North Fence", ["email", "sms", "whatsapp"]),
    ("Dog", 420, 97.3, "CAM 03 · Barn Door", ["email"]),
    ("Sheep", 560, 92.8, "CAM 04 · South Pasture", ["email", "sms"]),
    ("Bird", 730, 84.5, "CAM 02 · Water Trough", ["email", "sms"]),
    ("Horse", 950, 95.0, "CAM 04 · South Pasture", ["email", "sms", "whatsapp"]),
    ("Giraffe", 1210, 89.4, "CAM 01 · North Fence", ["email", "sms"]),
    ("Cow", 1560, 93.7, "CAM 02 · Water Trough", ["email", "sms", "whatsapp"]),
    ("Cat", 1830, 95.8, "CAM 03 · Barn Door", ["email"]),
    ("Deer", 2050, 90.2, "CAM 01 · North Fence", ["email", "sms", "whatsapp"]),
    ("Sheep", 2480, 88.9, "CAM 04 · South Pasture", ["email", "sms"]),
    ("Elephant", 2840, 86.1, "CAM 01 · North Fence", ["email", "sms", "whatsapp"]),
]


async def seed() -> None:
    await db.detections.delete_many({})
    docs = []
    for species, minutes_ago, confidence, camera, channels in SAMPLE_LOG:
        meta = SPECIES_CATALOG[species]
        docs.append(
            Detection(
                species=species,
                category=meta["category"],
                confidence=confidence,
                image_url=meta["snapshot"],
                flickr_reference_url=meta["reference"],
                flickr_page_url=flickr_page_url(species),
                created_at=utc_now() - timedelta(minutes=minutes_ago),
                camera=camera,
                alert_channels=channels,
            ).model_dump()
        )
    await db.detections.insert_many(docs)
    await ensure_indexes()
    print(f"seeded {len(docs)} detections (wild/cattle/domestic)")


if __name__ == "__main__":
    asyncio.run(seed())
