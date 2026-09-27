"""Seed the detections collection with a realistic sample log.

Run: cd /app/backend && python seed.py
Idempotent (clears + re-inserts each run); standalone — never imported by server.py.
"""

import asyncio
from datetime import timedelta

from lib.db import db, ensure_indexes
from models.detection import Detection, utc_now
from routers.detections import SPECIES_CATALOG, flickr_page_url

# (species, minutes ago, confidence %) — newest first, ~2 days of activity
SAMPLE_LOG: list[tuple[str, int, float]] = [
    ("Elephant", 38, 91.4),
    ("Zebra", 125, 93.2),
    ("Cow", 190, 96.1),
    ("Bear", 310, 87.6),
    ("Dog", 420, 97.3),
    ("Sheep", 560, 92.8),
    ("Bird", 730, 84.5),
    ("Horse", 950, 95.0),
    ("Giraffe", 1210, 89.4),
    ("Cow", 1560, 93.7),
    ("Cat", 1830, 95.8),
    ("Deer", 2050, 90.2),
    ("Sheep", 2480, 88.9),
    ("Elephant", 2840, 86.1),
]


async def seed() -> None:
    await db.detections.delete_many({})
    docs = []
    for species, minutes_ago, confidence in SAMPLE_LOG:
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
            ).model_dump()
        )
    await db.detections.insert_many(docs)
    await ensure_indexes()
    print(f"seeded {len(docs)} detections (wild/cattle/domestic)")


if __name__ == "__main__":
    asyncio.run(seed())
