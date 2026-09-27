// Hand-written mirror of backend/models/detection.py — nothing infers across the
// Python/TS boundary; keeping the pair in sync is manual discipline.
export type DetectionCategory = "wild" | "cattle" | "domestic";
export type AlertChannel = "email" | "sms" | "whatsapp";

export interface Detection {
  id: string;
  species: string;
  category: DetectionCategory;
  confidence: number; // percent, 0-100
  image_url: string;
  flickr_reference_url: string;
  flickr_page_url: string;
  created_at: string; // ISO 8601 with UTC offset
  camera?: string | null; // e.g. "CAM 01 · North Fence" — absent on rows the Pi posted without one
  alert_channels?: AlertChannel[]; // which alert channels fired
  replay_count?: number; // times alerts were re-fired for this row (test path)
  source?: string; // "pi" | "web-demo"
}

export interface DetectionStats {
  total: number;
  wild: number;
  cattle: number;
  domestic: number;
}

// Mirrors IdentifyResult in backend/models/detection.py
export interface IdentifyResult {
  is_animal: boolean;
  species?: string | null;
  category?: DetectionCategory | null;
  confidence?: number | null;
  note?: string | null;
  detection?: Detection | null;
}

export type CategoryFilter = "all" | DetectionCategory;
