// Single source of truth for the backend host the frontend talks to.
// "" (default) = same origin — the Vite dev proxy and a single-origin production
// deploy both resolve /api/* locally. Point it at any backend host by setting
// VITE_API_BASE_URL="https://your-backend-host" (a trailing slash is trimmed).
const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

export const API_BASE_URL = (env?.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

// Every api* helper joins this with /api — the wire format the Animal Guard backend serves.
export const API_ROOT = `${API_BASE_URL}/api`;
