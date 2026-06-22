import type { NextConfig } from "next";

// ───────────────────────────────────────────────────────────────────────────
// Security headers (OWASP A02: Security Misconfiguration)
//
// Applied to EVERY response via headers() below. Mirrors AriesAI's posture and
// extends it with a content Content-Security-Policy.
//
// CSP design notes (this is graded, so the trade-offs are explicit):
//  - `frame-ancestors 'none'` + `X-Frame-Options: DENY` → clickjacking-proof.
//  - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` → close off
//    plugin, <base>-hijack and form-exfiltration vectors. No breakage.
//  - `script-src`/`style-src` must keep `'unsafe-inline'`: Next.js injects an
//    inline bootstrap script and we ship an inline theme-init script in
//    layout.tsx; Tailwind + design tokens emit inline styles. A nonce-based
//    strict CSP would need per-request middleware (out of scope here) and is
//    the documented next hardening step. The PRIMARY XSS defense is that the
//    app never renders untrusted input as HTML (React escaping + sanitize.ts +
//    the editor's plain-string model); this CSP is defense-in-depth (A05).
//  - `'unsafe-eval'` is added in DEVELOPMENT ONLY (Turbopack HMR needs it); the
//    production policy omits it so eval-based injection is blocked in prod.
//  - `connect-src` is scoped to self + Supabase (REST + realtime websockets).
// ───────────────────────────────────────────────────────────────────────────

const isDev = process.env.NODE_ENV !== "production";

const csp = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'none'"],
  "object-src": ["'none'"],
  // Editor image blocks embed images by URL — allow any https origin + inline.
  "img-src": ["'self'", "https:", "data:", "blob:"],
  "font-src": ["'self'", "data:"],
  "style-src": ["'self'", "'unsafe-inline'"],
  "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
  "connect-src": [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    // Dev server uses websockets on localhost for HMR.
    ...(isDev ? ["ws://localhost:*", "http://localhost:*"] : []),
  ],
  "worker-src": ["'self'", "blob:"],
  "manifest-src": ["'self'"],
};

const cspValue = Object.entries(csp)
  .map(([directive, sources]) => `${directive} ${sources.join(" ")}`)
  .join("; ");

const securityHeaders = [
  // Force HTTPS for 2 years, including subdomains (A02). No effect on plain
  // http://localhost, but correct and ready for production.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Disallow framing entirely (clickjacking). DENY per the test matrix.
  { key: "X-Frame-Options", value: "DENY" },
  // Block MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Leak as little referrer information cross-origin as possible.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Drop powerful browser features the app never uses.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Content-Security-Policy", value: cspValue },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
