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
}

export interface DetectionStats {
  total: number;
  wild: number;
  cattle: number;
  domestic: number;
}

export type CategoryFilter = "all" | DetectionCategory;
