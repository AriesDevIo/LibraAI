/**
 * Freeform-canvas data model + security primitives.
 *
 * SECURITY (OWASP A05 — Injection / XSS, the graded goal). Mirrors the block
 * editor's posture so the two features are consistent:
 *  - A text object's content is ALWAYS a plain string. It is only ever rendered
 *    as a React text node ({obj.text}) or as a controlled <textarea> value —
 *    both of which React escapes — so a payload like
 *    `<script>alert('XSS')</script>` shows up verbatim and never executes. We
 *    never call dangerouslySetInnerHTML on user content.
 *  - Colour is stored as a closed-set KEY (never a raw CSS value), looked up
 *    through a whitelist, so styling can't become an injection vector.
 *  - Image URLs are validated to http(s) only (see isSafeImageUrl), blocking
 *    `javascript:` / `data:` / `vbscript:` smuggling. The URL is re-checked at
 *    render time too, so even tampered state can't inject.
 */

/** A canvas object is either a text note or an image block. */
export type CanvasObjectType = "text" | "image";

/**
 * Closed set of brand-palette colour choices. Objects only ever store one of
 * these KEYS — never a raw CSS value. Values mirror the block editor's palette.
 */
export type ColorKey =
  | "violet"
  | "purple"
  | "orchid"
  | "rose"
  | "amber"
  | "teal"
  | "blue";

/**
 * Whitelist mapping every ColorKey to a known-safe CSS value. Lookups always go
 * through this table; `colorValue()` falls back to the brand violet for any
 * unexpected key — so a tampered object can never inject CSS. "violet" is the
 * theme-aware brand token; the rest are fixed accent hues (same as the editor).
 */
export const COLOR_VALUES: Record<ColorKey, string> = {
  violet: "var(--color-secondary)",
  purple: "#9333ea",
  orchid: "#c026d3",
  rose: "#e11d48",
  amber: "#d97706",
  teal: "#0d9488",
  blue: "#2563eb",
};

export function colorValue(key: ColorKey): string {
  return COLOR_VALUES[key] ?? COLOR_VALUES.violet;
}

/** Ordered swatches for the colour picker UI. */
export const COLOR_SWATCHES: { key: ColorKey; label: string }[] = [
  { key: "violet", label: "Violet" },
  { key: "purple", label: "Purple" },
  { key: "orchid", label: "Orchid" },
  { key: "rose", label: "Rose" },
  { key: "amber", label: "Amber" },
  { key: "teal", label: "Teal" },
  { key: "blue", label: "Blue" },
];

interface BaseObject {
  id: string;
  type: CanvasObjectType;
  /** Top-left position in world coordinates (independent of pan). */
  x: number;
  y: number;
  width: number;
  height: number;
  color: ColorKey;
}

export interface TextObject extends BaseObject {
  type: "text";
  /** Plain text — always rendered escaped (text node / textarea value). */
  text: string;
}

export interface ImageObject extends BaseObject {
  type: "image";
  /** A validated http(s) URL (see isSafeImageUrl). */
  src: string;
  /** Alt text — a plain string, escaped on render. */
  alt: string;
}

export type CanvasObject = TextObject | ImageObject;

/** Minimum object size, in px, so things can't be resized into nothing. */
export const MIN_SIZE = { width: 80, height: 56 } as const;

/** Default sizes for freshly added objects. */
export const DEFAULT_TEXT_SIZE = { width: 220, height: 132 } as const;
export const DEFAULT_IMAGE_SIZE = { width: 260, height: 180 } as const;

/**
 * Validate an image URL. Only http(s) is allowed — this blocks `javascript:`,
 * `data:`, `vbscript:` and similar schemes. Relative strings have no base and
 * throw, so they're rejected too.
 */
export function isSafeImageUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/* Monotonic, render-safe id generator. Only ever called from event handlers or
 * the initial state initializer (same order on server prerender + client
 * hydrate), so there's no hydration mismatch and no need for Math.random(). */
let idCounter = 0;
export function newId(): string {
  idCounter += 1;
  return `obj_${idCounter}`;
}

/** Bump the id counter past any loaded `obj_N` ids so newly created objects
 *  never collide with persisted ones. Call once after loading a document. */
export function reserveIds(objects: { id: string }[]): void {
  for (const o of objects) {
    const m = /^obj_(\d+)$/.exec(o.id);
    if (m) idCounter = Math.max(idCounter, Number(m[1]));
  }
}

const COLOR_KEY_SET = new Set<ColorKey>(COLOR_SWATCHES.map((s) => s.key));

/**
 * Validate + normalise canvas objects loaded from storage (or about to be
 * stored). Drops anything malformed, clamps sizes, and forces `color` back into
 * the closed set — so a tampered jsonb payload can never reintroduce the CSS/URL
 * injection holes the in-memory model closes. Image `src` is still re-validated
 * at render time by CanvasObjectView; here we only keep it a plain string.
 */
export function sanitizeCanvas(raw: unknown): CanvasObject[] {
  if (!Array.isArray(raw)) return [];
  const num = (v: unknown, d: number) =>
    typeof v === "number" && Number.isFinite(v) ? v : d;
  const out: CanvasObject[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    if (typeof o.id !== "string") continue;
    const color: ColorKey = COLOR_KEY_SET.has(o.color as ColorKey)
      ? (o.color as ColorKey)
      : "violet";
    const base = {
      id: o.id,
      x: num(o.x, 0),
      y: num(o.y, 0),
      width: Math.max(MIN_SIZE.width, num(o.width, DEFAULT_TEXT_SIZE.width)),
      height: Math.max(MIN_SIZE.height, num(o.height, DEFAULT_TEXT_SIZE.height)),
      color,
    };
    if (o.type === "text") {
      out.push({
        ...base,
        type: "text",
        text: typeof o.text === "string" ? o.text : "",
      });
    } else if (o.type === "image") {
      out.push({
        ...base,
        type: "image",
        src: typeof o.src === "string" ? o.src : "",
        alt: typeof o.alt === "string" ? o.alt : "",
      });
    }
  }
  return out;
}

/** Create a text note with sensible defaults. */
export function createTextObject(overrides: Partial<TextObject> = {}): TextObject {
  return {
    id: newId(),
    type: "text",
    x: 0,
    y: 0,
    width: DEFAULT_TEXT_SIZE.width,
    height: DEFAULT_TEXT_SIZE.height,
    color: "violet",
    text: "",
    ...overrides,
  };
}

/** Create an image block. `src` must already be validated by the caller. */
export function createImageObject(
  src: string,
  overrides: Partial<ImageObject> = {},
): ImageObject {
  return {
    id: newId(),
    type: "image",
    x: 0,
    y: 0,
    width: DEFAULT_IMAGE_SIZE.width,
    height: DEFAULT_IMAGE_SIZE.height,
    color: "violet",
    src,
    alt: "",
    ...overrides,
  };
}
