import type { ImageResult } from "./types";

// Image fetching for the assistant (A05: validate every URL before surfacing).
//
// Source: the Openverse API (openverse.org) — openly-licensed images, no API
// key required, so it runs out of the box. We fetch results ourselves rather
// than trusting model-produced URLs, then run each URL through isSafeImageUrl
// before it reaches the client: HTTPS only, and private/loopback hosts blocked
// so a malicious result can't point the browser (or any future server-side
// fetch) at an internal address (SSRF defense).

const OPENVERSE_ENDPOINT = "https://api.openverse.org/v1/images/";
const REQUEST_TIMEOUT_MS = 8000;

/** Reject anything that isn't a plain public HTTPS URL. */
export function isSafeImageUrl(value: string | undefined | null): value is string {
  if (!value) return false;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;

  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    return false;
  }
  // Block loopback, link-local, and RFC-1918 private ranges.
  if (
    /^(127\.|10\.|0\.|169\.254\.|192\.168\.)/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    return false;
  }
  return true;
}

type OpenverseItem = {
  url?: string;
  thumbnail?: string;
  title?: string;
  source?: string;
  license?: string;
  foreign_landing_url?: string;
};

/**
 * Search Openverse for up to `limit` openly-licensed images matching `query`.
 * Returns only results whose image AND thumbnail URLs pass validation. Never
 * throws — on any failure it returns an empty list so the chat keeps working.
 */
export async function searchImages(query: string, limit = 4): Promise<ImageResult[]> {
  const q = query.trim().slice(0, 100);
  if (!q) return [];

  const url =
    `${OPENVERSE_ENDPOINT}?q=${encodeURIComponent(q)}` +
    `&page_size=${limit}&mature=false`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "LibraAI/0.1 (TBZ educational project)",
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return [];

    const data = (await res.json()) as { results?: OpenverseItem[] };
    const items = Array.isArray(data.results) ? data.results : [];

    return items
      .filter((it) => isSafeImageUrl(it.url) && isSafeImageUrl(it.thumbnail))
      .slice(0, limit)
      .map((it) => ({
        url: it.url!,
        thumbnail: it.thumbnail!,
        title: (it.title || q).slice(0, 140),
        source: it.source || "openverse",
        license: (it.license || "").toUpperCase(),
        landingUrl: isSafeImageUrl(it.foreign_landing_url)
          ? it.foreign_landing_url!
          : it.url!,
      }));
  } catch {
    return [];
  }
}
