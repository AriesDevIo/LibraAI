// Shared types for Libra's AI assistant — imported by both the API route
// (server) and the chat panel (client). Type-only, so safe on either side.

/** One turn in the chat transcript sent from the client to the API route. */
export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

/** A single validated image suggestion surfaced by the `search_images` tool. */
export type ImageResult = {
  url: string;
  thumbnail: string;
  title: string;
  source: string;
  license: string;
  /** Attribution / "view source" page for the image. */
  landingUrl: string;
};

/**
 * Newline-delimited JSON (NDJSON) events the API route streams to the client.
 * One JSON object per line so the browser can parse incrementally.
 */
export type StreamEvent =
  | { type: "text"; text: string }
  | { type: "images"; query: string; images: ImageResult[] }
  | { type: "document"; id: string; title: string }
  | { type: "error"; error: string }
  | { type: "done" };
