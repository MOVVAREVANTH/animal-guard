# Animal Guard — App Spec

## What it is
Two-part site for a Raspberry Pi wildlife/livestock detection system:
- `/` — landing page (hero with simulated camera viewfinder, How It Works 4 steps, 6-feature grid, architecture pipeline diagram, CTA band, footer with docs/GitHub links).
- `/dashboard` — **Live Identify panel** (upload/drag-drop a photo or capture from webcam → vision model names the species and logs it as a real detection tagged "Web demo"), stats bar (Total / Wild / Cattle / Domestic), category filter pills (all/wild/cattle/domestic), detection cards (camera snapshot + Flickr reference side-by-side, species, category badge, "Web demo" chip on browser-sourced rows, confidence bar, camera label chip e.g. "CAM 01 · North Fence", alert-channel badges showing which of email/SMS/WhatsApp fired, timestamp, "Replay alerts" test-path button, "More Flickr photos" link), Export CSV button (downloads the filtered history), wild-alert chime + toast on new wild detections while open (sound toggle persisted in localStorage `ag-wild-alert-sound`; WebAudio unlocked on first pointerdown), 10s polling (TanStack Query refetchInterval), empty state, "Simulate Detection" demo button (clearly labeled demo).

## Stack & wiring
- Backend: FastAPI (`backend/server.py`), routes on `api_router` under `/api`. Resource router: `backend/routers/detections.py`; models `backend/models/detection.py`; Mongo via `lib.db.db` (motor), DB name `app`.
- Frontend: React 19 + Vite + Tailwind v4 + shadcn/ui (base-nova). Pages `src/pages/Landing.tsx` / `Dashboard.tsx`; shared `Navbar`/`Footer`; `DetectionCard` component. Typed fetch via `src/lib/api.ts`; API host is the single constant `API_BASE_URL` in `src/lib/config.ts` (default same-origin; override with `VITE_API_BASE_URL`).
- Theme: cream #FBF9F4 bg, forest greens #142B1B/#2D6A4F, terracotta #C85A17 accent; fonts Outfit (heading) / DM Sans (body) / JetBrains Mono (telemetry).

## Integrations
- **Vision species ID** (`backend/lib/vision.py`): Gemini 3 Flash (`gemini-3-flash-preview`) via `emergentintegrations` LlmChat, key `EMERGENT_LLM_KEY` in `backend/.env`. Returns strict JSON {is_animal, species, category, confidence, note}; non-animal images return is_animal=false with a reason. Accepts JPEG/PNG/WebP base64 or data URL; 422 on bad payload, 503 when the provider/key is unavailable. Testing rules for images: `/app/image_testing.md`.

## API contract (matches user's existing `animal-guard/backend/app.py`)
- `GET /api/detections?category=wild|cattle|domestic&limit=50` → `[{id, species, category, confidence, image_url, flickr_reference_url, flickr_page_url, created_at}]` sorted newest-first. Invalid category → 400.
- `GET /api/stats` → `{total, wild, cattle, domestic}`
- `GET /api/detections/export.csv?category=&limit=500` → `text/csv` attachment (`Content-Disposition`), same filters as the list endpoint, columns: id, species, category, confidence, camera, alert_channels (pipe-joined), replay_count, image_url, flickr_reference_url, flickr_page_url, created_at
- `POST /api/detections/{id}/replay` → test path: re-fires alerts, sets alert_channels to all three, increments replay_count, returns the updated Detection; 404 on unknown id
- `POST /api/detections/identify` → body `{image_base64, mime_type}`; runs the vision model and, when an animal is found, saves a Detection (camera "WEB DEMO · Live Identify", `source: "web-demo"`, inline data-URL snapshot, reference photo resolved from the catalog/keyword/category fallback) and returns `{is_animal, species, category, confidence, note, detection}`
- `POST /api/detections` (Pi ingest) and `POST /api/detections/simulate?category=` (demo) → 201 + Detection.

## Data model
Mongo collection `detections` (uuid string `id`, not ObjectId). Optional per-row `camera` (node label, e.g. "CAM 01 · North Fence"), `alert_channels` (subset of email/sms/whatsapp — what the Pi dispatched), and `replay_count` (times the alert path was re-tested). 14 seeded rows via `backend/seed.py` (idempotent, clear+reinsert): wild 7 (Elephant×2, Zebra, Bear, Bird, Giraffe, Deer), cattle 5 (Cow×2, Sheep×2, Horse), domestic 2 (Dog, Cat), spread across 4 cameras. Images are Unsplash stock URLs. created_at stored aware-UTC, normalized on read.

## Auth
None — dashboard is open (user's explicit choice).

## Test credentials
No accounts/PIN — see memory/test_credentials.md.
