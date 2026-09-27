# Animal Guard — App Spec

## What it is
Two-part site for a Raspberry Pi wildlife/livestock detection system:
- `/` — landing page (hero with simulated camera viewfinder, How It Works 4 steps, 6-feature grid, architecture pipeline diagram, CTA band, footer with docs/GitHub links).
- `/dashboard` — live detections gallery: stats bar (Total / Wild / Cattle / Domestic), category filter pills (all/wild/cattle/domestic), detection cards (camera snapshot + Flickr reference side-by-side, species, category badge, confidence bar, timestamp, "More Flickr photos" link), 10s polling (TanStack Query refetchInterval), empty state, "Simulate Detection" demo button (clearly labeled demo).

## Stack & wiring
- Backend: FastAPI (`backend/server.py`), routes on `api_router` under `/api`. Resource router: `backend/routers/detections.py`; models `backend/models/detection.py`; Mongo via `lib.db.db` (motor), DB name `app`.
- Frontend: React 19 + Vite + Tailwind v4 + shadcn/ui (base-nova). Pages `src/pages/Landing.tsx` / `Dashboard.tsx`; shared `Navbar`/`Footer`; `DetectionCard` component. Typed fetch via `src/lib/api.ts`; API host is the single constant `API_BASE_URL` in `src/lib/config.ts` (default same-origin; override with `VITE_API_BASE_URL`).
- Theme: cream #FBF9F4 bg, forest greens #142B1B/#2D6A4F, terracotta #C85A17 accent; fonts Outfit (heading) / DM Sans (body) / JetBrains Mono (telemetry).

## API contract (matches user's existing `animal-guard/backend/app.py`)
- `GET /api/detections?category=wild|cattle|domestic&limit=50` → `[{id, species, category, confidence, image_url, flickr_reference_url, flickr_page_url, created_at}]` sorted newest-first. Invalid category → 400.
- `GET /api/stats` → `{total, wild, cattle, domestic}`
- `POST /api/detections` (Pi ingest) and `POST /api/detections/simulate?category=` (demo) → 201 + Detection.

## Data model
Mongo collection `detections` (uuid string `id`, not ObjectId). 14 seeded rows via `backend/seed.py` (idempotent, clear+reinsert): wild 7 (Elephant×2, Zebra, Bear, Bird, Giraffe, Deer), cattle 5 (Cow×2, Sheep×2, Horse), domestic 2 (Dog, Cat). Images are Unsplash stock URLs. created_at stored aware-UTC, normalized on read.

## Auth
None — dashboard is open (user's explicit choice).

## Test credentials
No accounts/PIN — see memory/test_credentials.md.
