# Libra 👑

Planning: https://docs.google.com/document/d/1UIwTsLSTqNp8ZQLog38L2qGsicQjexujxpY_zD2XE-M/edit?tab=t.0

**Libra** is a secure, AI-powered note-taking and collaboration platform — a security-first alternative to Notion. Block-based editing, a freeform canvas, document sharing, and a built-in AI assistant, all built on a foundation of strict per-user data isolation.

> Security is the headline feature. Libra is engineered against the OWASP Top 10 (2025) from the first line of code: passwordless login, Row Level Security, input sanitization, and a prompt-injection-resistant AI.

---

## Screenshots

### Application

| Landing page | Login (passwordless) | Register |
|---|---|---|
| ![Landing](docs/screenshots/app-1-landing.png) | ![Login](docs/screenshots/app-2-login.png) | ![Register](docs/screenshots/app-3-register.png) |

| Block editor | Freeform canvas | AI assistant |
|---|---|---|
| ![Editor](docs/screenshots/app-4-editor.png) | ![Canvas](docs/screenshots/app-5-canvas.png) | ![Assistant](docs/screenshots/app-6-assistant.png) |

### Supabase backend (Row Level Security)

| Tables (`profiles`, `documents`) | RLS policies | Auth users |
|---|---|---|
| ![Tables](docs/screenshots/supabase-tables.png) | ![Policies](docs/screenshots/supabase-rls-policies.png) | ![Users](docs/screenshots/supabase-auth-users.png) |

> Secrets live only in a local `.env.local` (gitignored). These screenshots document the live backend without exposing any keys.

## Tech stack

- **Next.js 16** (App Router, `/src` directory)
- **React 19 + TypeScript** (strict mode)
- **Tailwind CSS v4** — design tokens defined as CSS variables in an `@theme` block (no `tailwind.config.js` theme)
- **Poppins** via `next/font/google` (weights 300–800)
- **[@solar-icons/react](https://www.npmjs.com/package/@solar-icons/react)** (Solar icon set, `Bold` weight) — the same icon language as the sibling **AriesAI** project
- No component library, no animation library — all animations are hand-rolled CSS keyframes.

## Getting started

```bash
npm install      # if dependencies aren't installed yet
npm run dev      # start the dev server → http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build (type-check + lint + bundle)
npm run lint     # ESLint
npm start        # serve the production build
```

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx        # root layout: Poppins font, metadata, pre-paint theme script
│  ├─ page.tsx          # home route — landing sections
│  ├─ globals.css       # design system: @theme tokens, light/dark, libra- keyframes
│  ├─ (auth)/           # login & register pages + passwordless server actions + shared layout
│  ├─ auth/callback/    # magic-link callback (code → session)
│  ├─ dashboard/        # documents list + actions; doc/[id] = editor with autosave
│  ├─ editor/           # standalone block-editor demo
│  ├─ canvas/           # standalone freeform-canvas demo
│  ├─ assistant/        # standalone AI-assistant demo
│  └─ api/ai/           # AI chat route (Claude)
├─ components/
│  ├─ shared/           # Logo, ThemeToggle, PillLink, SectionHeading
│  ├─ marketing/        # Navbar, Hero, Features, HowItWorks, Security, CTABanner, Footer
│  ├─ editor/           # BlockEditor, Block, SlashMenu, Toolbar, types
│  ├─ canvas/           # Canvas, objects, toolbar
│  └─ ai/               # AssistantPanel
├─ lib/
│  ├─ supabase/         # browser + server clients (RLS-enforced)
│  ├─ documents.ts      # RLS-scoped document reads
│  ├─ ai/               # system prompt (injection-hardened), config, rate limit
│  └─ sanitize.ts       # text / URL sanitisation helpers
├─ hooks/useTheme.ts    # 3-mode theme controller (system → light → dark), SSR-safe
├─ types/theme.ts       # ThemeMode union + cycle order
└─ proxy.ts             # session refresh + route protection (Next renames middleware → proxy)

supabase/migrations/    # 0001_profiles.sql, 0002_documents.sql (tables + RLS)
docs/                   # SECURITY-TESTS.md (pentest protocol), screenshots/
```

### Brand logo

The brand mark is an inline, background-less SVG baked into the [`Logo`](src/components/shared/Logo.tsx) component — nothing to drop in, nothing to 404. It uses CSS-variable fills so it adapts to light/dark automatically, in a two-tone treatment (the stem in theme ink, the arrow in brand violet). A standalone copy lives at [`public/libra-mark.svg`](public/libra-mark.svg) for reuse (decks, docs), and [`src/app/icon.svg`](src/app/icon.svg) is the matching browser-tab favicon. Pass `variant="violet" | "twotone" | "lavender"` to `Logo` to switch treatments.

## Design system

Design tokens (`--color-bg`, `--color-fg`, `--color-primary`, `--color-secondary`, etc.) live as CSS variables in [`src/app/globals.css`](src/app/globals.css). Light mode is the default; dark mode is applied two ways:

- automatically via `@media (prefers-color-scheme: dark)`, and
- explicitly via a `data-theme="dark" | "light"` attribute on `<html>` (set by the navbar theme toggle and persisted to `localStorage`).

The `@theme inline` block registers these variables as Tailwind tokens, so utilities reference the live `var()` and the whole UI switches themes automatically. Components reference tokens only — no hardcoded hex.

---

## Security (OWASP Top 10 2025)

Security is the graded focus of this project. Implemented so far:

- **A01 Broken Access Control** — Row Level Security on every table; owner-only policies (`auth.uid() = id/user_id`), deliberately **no** permissive `using(true)`. `proxy.ts` redirects unauthenticated users away from protected routes (verified: `/dashboard` → `/login`).
- **A02 Security Misconfiguration** — secrets only in gitignored `.env.local`; DB functions pin `search_path = ''`; the auth callback validates `next` to a same-site path (no open redirect).
- **A05 Injection** — the editor never renders untrusted input as HTML (no `dangerouslySetInnerHTML` on user content); image URLs are validated.
- **A07 Authentication Failures** — passwordless login (no password to leak); no user-enumeration on login; rate-limit-aware (HTTP 429) messaging.
- **A09 Logging & Alerting** — Supabase logs capture auth/RLS events (exercised in the pentest phase).

The full threat model, 24-hour plan, and the **T01–T05 test matrix** are documented in [`ARBEITSJOURNAL.md`](ARBEITSJOURNAL.md).

## Roadmap

### ✅ Step 1 — Foundation & landing page (done)
- Next.js + TypeScript + Tailwind v4 scaffold
- Full purple design system: CSS-variable tokens, light/dark mode, `libra-` keyframe animations, Poppins
- Polished marketing landing page: Navbar, Hero (with floating mockup), Features, How It Works, Security, CTA banner, Footer
- Theme toggle with persistence; mobile-responsive and accessible

### ✅ Step 2 — Authentication & secure backend (done)
- Passwordless email login & registration (magic-link / OTP) via Supabase Auth — `/login`, `/register`
- Supabase Postgres with **Row Level Security**: `profiles` + `documents` tables, owner-only policies
- Session handling & route protection in `proxy.ts`; a profile row is auto-created on sign-up (DB trigger)
- Minimal authenticated `/dashboard` landing

### ✅ Step 3 — Block editor (done)
- Notion-style block editor at `/editor` — headings, lists, image blocks, text colours, slash menu
- XSS-safe rendering (no raw HTML for user content)

### ✅ Step 4 — Persistence, canvas & AI (done)
- Documents persist per user (editor + dashboard ↔ Supabase, RLS) — `/dashboard`, `/dashboard/doc/[id]`
- Freeform canvas with draggable text/image objects — `/canvas`
- AI assistant (Claude) for text generation + image fetch, hardened against prompt injection — `/assistant`

### 🔜 Upcoming steps
- **Document sharing** between users
- **Penetration testing** — complete the OWASP test matrix (T01–T05); see [`docs/SECURITY-TESTS.md`](docs/SECURITY-TESTS.md)

## Arbeitsjournal

A dated work log (planning, weekly progress, hours, and OWASP measures) lives in [`ARBEITSJOURNAL.md`](ARBEITSJOURNAL.md).

---

_Built as a security-focused school project._
