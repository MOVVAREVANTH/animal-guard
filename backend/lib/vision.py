"""Vision-backed species identification for the browser demo (upload / webcam).

Uses the Emergent Universal LLM key via emergentintegrations (Gemini 3 Flash).
"""

import base64
import binascii
import json
import logging
import os
import re
import uuid

from dotenv import load_dotenv
from emergentintegrations.llm.chat import ImageContent, LlmChat, UserMessage

load_dotenv()

logger = logging.getLogger(__name__)

MODEL_PROVIDER = "gemini"
MODEL_NAME = "gemini-3-flash-preview"

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}

SYSTEM_MESSAGE = """You are the species classifier inside Animal Guard, a farm camera system.
You look at one camera frame and identify the single most prominent animal.

Reply with ONLY a JSON object, no markdown fence, no commentary:
{"is_animal": bool, "species": string|null, "category": "wild"|"cattle"|"domestic"|null, "confidence": number, "box": {"x": number, "y": number, "w": number, "h": number}|null, "note": string|null}

Rules:
- "species" is the common English name, singular, Capitalised (e.g. "Elephant", "Red Deer", "Cow").
- "category": "cattle" for farm livestock (cow, cattle, bull, horse, sheep, goat, pig);
  "domestic" for pets (dog, cat, rabbit); "wild" for everything wild (deer, bear, bird,
  elephant, zebra, giraffe, fox, boar, monkey...).
- "confidence" is 0-100, your genuine certainty in the species call.
- "box" is the tight bounding box around that animal, as FRACTIONS of the image size:
  x = left edge, y = top edge, w = width, h = height, each between 0 and 1
  (x=0,y=0 is the top-left corner). Make it snug around the animal's full visible body.
  Set box to null only if you truly cannot localise it.
- If there is no animal (empty field, person only, object, blurry nothing), set
  is_animal false, species/category/box null, confidence 0, and put the reason in "note".
- A human alone is NOT an animal for this system."""


class VisionUnavailable(RuntimeError):
    """Raised when the vision provider cannot be reached or returns nothing usable."""


def decode_image(image_base64: str, mime_type: str) -> tuple[str, str]:
    """Normalise a data URL / raw base64 pair into (clean_base64, mime_type).

    Raises ValueError on an unsupported mime type or undecodable payload.
    """
    payload = image_base64.strip()
    match = re.match(r"^data:([-\w.+/]+);base64,(.*)$", payload, re.DOTALL)
    if match:
        mime_type = match.group(1)
        payload = match.group(2)
    payload = re.sub(r"\s+", "", payload)

    mime_type = (mime_type or "image/jpeg").lower()
    if mime_type == "image/jpg":
        mime_type = "image/jpeg"
    if mime_type not in ALLOWED_MIME:
        raise ValueError(
            f"unsupported image type '{mime_type}' — use image/jpeg, image/png or image/webp"
        )

    try:
        raw = base64.b64decode(payload, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ValueError("image_base64 is not valid base64") from exc
    if len(raw) < 512:
        raise ValueError("image is too small or empty to classify")

    return payload, mime_type


def _parse_json_object(text: str) -> dict:
    """Pull the first JSON object out of a model reply, fence or prose tolerated."""
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.IGNORECASE)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not match:
        raise VisionUnavailable(f"model did not return JSON: {text[:200]}")
    try:
        return json.loads(match.group(0))
    except json.JSONDecodeError as exc:
        raise VisionUnavailable(f"model returned malformed JSON: {text[:200]}") from exc


def _parse_box(raw: object) -> dict | None:
    """Clamp a model-supplied box to the 0-1 unit square; None if unusable."""
    if not isinstance(raw, dict):
        return None
    try:
        x = float(raw.get("x"))  # type: ignore[arg-type]
        y = float(raw.get("y"))  # type: ignore[arg-type]
        w = float(raw.get("w"))  # type: ignore[arg-type]
        h = float(raw.get("h"))  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None
    # Some models answer in percentages — normalise those back to fractions.
    if max(x, y, w, h) > 1.5:
        x, y, w, h = x / 100.0, y / 100.0, w / 100.0, h / 100.0
    x = min(max(x, 0.0), 1.0)
    y = min(max(y, 0.0), 1.0)
    w = min(max(w, 0.0), 1.0 - x)
    h = min(max(h, 0.0), 1.0 - y)
    if w <= 0.01 or h <= 0.01:  # degenerate box is worse than no box
        return None
    return {"x": round(x, 4), "y": round(y, 4), "w": round(w, 4), "h": round(h, 4)}


async def identify_species(image_base64: str, mime_type: str) -> dict:
    """Classify the animal in one frame. Returns the parsed model verdict."""
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise VisionUnavailable("EMERGENT_LLM_KEY is not configured on the backend")

    clean_b64, _mime = decode_image(image_base64, mime_type)

    chat = LlmChat(
        api_key=api_key,
        session_id=f"animal-guard-identify-{uuid.uuid4()}",  # new instance per request
        system_message=SYSTEM_MESSAGE,
    ).with_model(MODEL_PROVIDER, MODEL_NAME)

    message = UserMessage(
        text="Identify the animal in this camera frame. Reply with the JSON object only.",
        file_contents=[ImageContent(image_base64=clean_b64)],
    )

    try:
        reply = await chat.send_message(message)
    except Exception as exc:  # provider/network failure — surfaced as 503 upstream
        logger.exception("vision call failed")
        raise VisionUnavailable(f"vision provider error: {exc}") from exc

    text = reply if isinstance(reply, str) else str(reply)
    verdict = _parse_json_object(text)

    # Normalise the shape so callers can trust it.
    is_animal = bool(verdict.get("is_animal"))
    category = verdict.get("category")
    if category not in ("wild", "cattle", "domestic"):
        category = None
    species = verdict.get("species") or None
    if isinstance(species, str):
        species = species.strip().title() or None

    raw_conf = verdict.get("confidence")
    try:
        confidence = float(raw_conf)
    except (TypeError, ValueError):
        confidence = 0.0
    confidence = max(0.0, min(100.0, confidence))

    if is_animal and (not species or not category):
        is_animal = False  # incomplete call — treat as no confident detection

    return {
        "is_animal": is_animal,
        "species": species if is_animal else None,
        "category": category if is_animal else None,
        "confidence": round(confidence, 1) if is_animal else 0.0,
        "box": _parse_box(verdict.get("box")) if is_animal else None,
        "note": verdict.get("note") or None,
    }
