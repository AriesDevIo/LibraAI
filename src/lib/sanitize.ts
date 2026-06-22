/**
 * Libra · input sanitisation & validation helpers (OWASP A05: Injection / XSS).
 *
 * Hand-rolled, ZERO dependencies. These are defensive primitives for anywhere
 * untrusted input meets an output sink — server actions, API routes, log lines,
 * non-React DOM, `new URL()` consumers, etc.
 *
 * IMPORTANT — defense in depth, not the only line of defense:
 *  - React already escapes any string rendered as a text node or as a
 *    controlled input value, so the block editor (plain-string model) is
 *    XSS-safe by construction WITHOUT calling these.
 *  - Use `escapeHtml` only when you build HTML yourself (a raw string that will
 *    be inserted as markup), never as a substitute for React escaping.
 *  - Use the URL/text validators at trust boundaries (before storing a URL,
 *    before fetching it, before echoing user text into a non-escaping sink).
 *
 * Usage notes are inline next to each function as `@example` blocks; they double
 * as lightweight unit specs (input -> expected output).
 */

/* ─────────────────────────────────────────────────────────────────────────
 * HTML escaping
 * ───────────────────────────────────────────────────────────────────────── */

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
};

/**
 * Escape the five significant HTML characters plus the forward slash and
 * backtick. Turns active markup into inert text so a payload can never break
 * out of an attribute or open a tag. A single pass over the character class is
 * safe — each match maps to its own escape, so output is never re-escaped.
 *
 * @example escapeHtml("<script>alert('XSS')</script>")
 *   // => "&lt;script&gt;alert(&#39;XSS&#39;)&lt;&#x2F;script&gt;"
 * @example escapeHtml('a & b "c" \'d\'')
 *   // => "a &amp; b &quot;c&quot; &#39;d&#39;"
 * @example escapeHtml("plain text")   // => "plain text"
 */
export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'`/]/g, (ch) => HTML_ESCAPES[ch]);
}

/**
 * Remove anything that looks like an HTML tag. A blunt fallback for contexts
 * that must be tag-free (e.g. a plain-text preview). Prefer `escapeHtml` when
 * you want to *preserve and neutralise* the characters instead of deleting.
 *
 * @example stripTags("<b>hi</b> <img src=x onerror=alert(1)>")  // => "hi "
 * @example stripTags("no tags here")                             // => "no tags here"
 */
export function stripTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/* ─────────────────────────────────────────────────────────────────────────
 * Text normalisation
 * ───────────────────────────────────────────────────────────────────────── */

// Control characters to drop: U+0000..U+0008, U+000B, U+000C, U+000E..U+001F
// and U+007F (DEL). Tab (U+0009) and newline (U+000A) are kept; carriage
// returns are normalised to newlines first. Dropping these blocks
// log-injection and terminal-escape-sequence tricks.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/**
 * Strip control characters (except tab/newline) and normalise line endings.
 * Does NOT trim — callers decide on trimming.
 *
 * @example sanitizeText("a" + String.fromCharCode(27) + "b")  // => "ab" (ESC removed)
 * @example sanitizeText("a\r\nb")                              // => "a\nb"
 */
export function sanitizeText(input: string): string {
  return input.replace(/\r\n?/g, "\n").replace(CONTROL_CHARS, "");
}

/**
 * Collapse a string to a single trimmed line with a max length — handy for
 * titles, usernames, and anything echoed into a log with a length budget.
 *
 * @example singleLine("  My\nNote  ")            // => "My Note"
 * @example singleLine("x".repeat(10), 5)         // => "xxxxx"
 */
export function singleLine(input: string, maxLength = 200): string {
  const collapsed = sanitizeText(input).replace(/\s+/g, " ").trim();
  return collapsed.slice(0, maxLength);
}

/* ─────────────────────────────────────────────────────────────────────────
 * URL validation (blocks javascript:, data:, vbscript:, file:, etc.)
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * True only for absolute http(s) URLs. Rejects dangerous schemes
 * (`javascript:`, `data:`, `vbscript:`, `file:`) and relative strings (which
 * have no base and throw). This is the same rule the editor enforces before it
 * ever sets an <img src>, lifted into a reusable helper.
 *
 * @example isSafeHttpUrl("https://ex.com/a.png")     // => true
 * @example isSafeHttpUrl("http://ex.com")            // => true
 * @example isSafeHttpUrl("javascript:alert(1)")      // => false
 * @example isSafeHttpUrl("data:text/html,<script>")  // => false
 * @example isSafeHttpUrl("/relative/path.png")       // => false
 * @example isSafeHttpUrl("")                         // => false
 */
export function isSafeHttpUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Return the normalised URL string if it is a safe http(s) URL, otherwise null.
 * Use at storage/render boundaries: `const src = sanitizeImageUrl(input)`.
 *
 * @example sanitizeImageUrl("  https://ex.com/a.png ")  // => "https://ex.com/a.png"
 * @example sanitizeImageUrl("javascript:alert(1)")      // => null
 */
export function sanitizeImageUrl(raw: string): string | null {
  const value = raw.trim();
  if (!isSafeHttpUrl(value)) return null;
  // new URL() normalises (e.g. encodes spaces, lower-cases the host).
  return new URL(value).toString();
}

/* ─────────────────────────────────────────────────────────────────────────
 * Email (cheap shape check for rate-limit keys / display — NOT validation of
 * deliverability; Supabase Auth remains the source of truth).
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Loose RFC-ish email shape check. Lower-cases + trims. Intended for keying
 * rate-limits and basic UX feedback, not as a security control on its own.
 *
 * @example normalizeEmail("  Foo@Bar.COM ")   // => "foo@bar.com"
 * @example normalizeEmail("not-an-email")     // => null
 */
export function normalizeEmail(raw: string): string | null {
  const value = raw.trim().toLowerCase();
  // One @, no spaces, a dot in the domain. Deliberately conservative.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return null;
  return value;
}
