# Libra 👑

**Libra** is a secure, AI-powered note-taking and collaboration platform — a security-first alternative to Notion. Block-based editing, a freeform canvas, document sharing, and a built-in AI assistant, all built on a foundation of strict per-user data isolation.

> Security is the headline feature. Libra is engineered against the OWASP Top 10 (2025) from the first line of code: passwordless login, Row Level Security, input sanitization, and a prompt-injection-resistant AI.

---

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
│  ├─ page.tsx          # home route — composes the landing sections
│  └─ globals.css       # design system: @theme tokens, light/dark, libra- keyframes
├─ components/
│  ├─ shared/           # Logo, ThemeToggle, PillLink, SectionHeading
│  └─ marketing/        # Navbar, Hero, DocumentMockup, Features, HowItWorks, Security, CTABanner, Footer
├─ hooks/
│  └─ useTheme.ts       # 3-mode theme controller (system → light → dark), SSR-safe
└─ types/
   └─ theme.ts          # ThemeMode union + cycle order
```

### Brand logo

The brand mark is an inline, background-less SVG baked into the [`Logo`](src/components/shared/Logo.tsx) component — nothing to drop in, nothing to 404. It uses CSS-variable fills so it adapts to light/dark automatically, in a two-tone treatment (the stem in theme ink, the arrow in brand violet). A standalone copy lives at [`public/libra-mark.svg`](public/libra-mark.svg) for reuse (decks, docs), and [`src/app/icon.svg`](src/app/icon.svg) is the matching browser-tab favicon. Pass `variant="violet" | "twotone" | "lavender"` to `Logo` to switch treatments.

## Design system

Design tokens (`--color-bg`, `--color-fg`, `--color-primary`, `--color-secondary`, etc.) live as CSS variables in [`src/app/globals.css`](src/app/globals.css). Light mode is the default; dark mode is applied two ways:

- automatically via `@media (prefers-color-scheme: dark)`, and
- explicitly via a `data-theme="dark" | "light"` attribute on `<html>` (set by the navbar theme toggle and persisted to `localStorage`).

The `@theme inline` block registers these variables as Tailwind tokens, so utilities reference the live `var()` and the whole UI switches themes automatically. Components reference tokens only — no hardcoded hex.

---

## Roadmap

### ✅ Step 1 — Foundation & landing page (done)
- Next.js + TypeScript + Tailwind v4 scaffold
- Full purple design system: CSS-variable tokens, light/dark mode, `libra-` keyframe animations, Poppins
- Polished marketing landing page: Navbar, Hero (with floating mockup), Features, How It Works, Security, CTA banner, Footer
- Theme toggle with persistence; mobile-responsive and accessible

### 🔜 Upcoming steps (not built yet)
- **Authentication** — passwordless magic-link / OTP login (`/login`, `/register` routes)
- **Supabase backend** — Postgres, Auth, and Row Level Security policies
- **Editor** — block-based text + image editor, and a freeform canvas mode
- **AI assistant** — text generation and web image fetching, hardened against prompt injection

> The "Sign in" / "Get started" buttons currently link to `/login` and `/register`, which are intentional placeholders until the auth step.

_Built as a security-focused school project._
