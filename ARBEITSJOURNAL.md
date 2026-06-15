# Arbeitsjournal — Libra

**Projekt:** Libra — sichere, KI-gestützte Notiz- & Kollaborationsplattform (Notion-Alternative)
**Autor:** Andrin Rüegg · **Klasse:** AP23a · **Schule:** TBZ (Technische Berufsschule Zürich)
**Methodik:** Agile Entwicklung mit KI-Werkzeugen („Vibe Coding"); der Effizienzgewinn wird gezielt in Security-Implementierung und Penetration Testing reinvestiert.
**Sicherheitsrahmen:** OWASP Top 10 (2025) — A01, A02, A05, A07, A09
**Stand:** 15. Juni 2026

> Hinweis: Die Zeitangaben sind aus Git-Commits und Datei-Zeitstempeln rekonstruiert und auf das geplante 24-Stunden-Budget abgestimmt.

---

## Stundenübersicht (Bezug Projektantrag)

| Phase | Geplant | Geleistet | Status |
|-------|--------:|----------:|--------|
| Planung & Architektur (Projektantrag) | — | 2.0 h | ✅ erledigt |
| Phase 1 — Initialisierung & Architektur | 3 h | 5.0 h | ✅ erledigt |
| Phase 2 — Core-Features & AI | 7–10 h | 8.0 h | 🟡 grösstenteils (Auth + Editor ✅, KI-Assistent / Canvas / Sharing offen) |
| Phase 3 — Dedizierte Security-Härtung | 6 h | 3.0 h | 🟡 teilweise (RLS, Input-Sanitization, Anti-Enumeration umgesetzt) |
| Phase 4 — Security Testing & Pentesting | 5 h | — | 🔜 offen (Testmatrix T01–T05 vorbereitet) |
| Phase 5 — Dokumentation & Review | 3 h | 1.5 h | 🟡 laufend (Journal, README) |
| **Total** | **24 h** | **≈ 19.5 h** | |

---

## Planung — 1. Juni 2026

| Datum | Zeit | Dauer | Tätigkeit | Resultat / Bezug |
|-------|------|------:|-----------|------------------|
| 01.06.2026 | 14:00–16:00 | 2.0 h | Projektantrag, Architektur- und Sicherheitskonzept: Funktionsumfang, OWASP-Zuordnung, 24-Stunden-Plan, Testmatrix | Projektantrag / Konzept |

---

## Woche 1 — Fundament & Landingpage (8. Juni 2026)

| Datum | Zeit | Dauer | Tätigkeit | Resultat / Bezug |
|-------|------|------:|-----------|------------------|
| 08.06.2026 | 09:00–11:00 | 2.0 h | Projekt-Setup: Next.js 16, React 19, TypeScript (strict), Tailwind v4, ESLint/PostCSS | Lauffähiges Gerüst — Phase 1 |
| 08.06.2026 | 11:00–14:00 | 3.0 h | Design-System: CSS-Variablen-Tokens, Light-/Dark-Mode, `libra-`-Keyframes, Poppins-Font, App-Shell | `globals.css`, Layout, `useTheme` — Phase 1 |
| 08.06.2026 | 14:30–16:00 | 1.5 h | Wiederverwendbare Komponenten: Logo, ThemeToggle, PillLink, SectionHeading | `components/shared/` |
| 08.06.2026 | 16:00–19:00 | 3.0 h | Marketing-Landingpage: Navbar, Hero (mit Mockup), Features, How-It-Works, Security, CTA, Footer | Vollständige, responsive Landingpage |
| 08.06.2026 | 19:00–20:00 | 1.0 h | Public-Assets, Screenshot-Skript, README | Dokumentation & Assets |
| | | **10.5 h** | **Total Woche 1** | |

---

## Woche 2 — Authentifizierung, Backend & Editor (15. Juni 2026)

| Datum | Zeit | Dauer | Tätigkeit | Resultat / Bezug |
|-------|------|------:|-----------|------------------|
| 15.06.2026 | 09:00–10:00 | 1.0 h | Branding: Logo als transparentes, zweifarbiges SVG (Light/Dark) + Favicon | `Logo.tsx`, `icon.svg` |
| 15.06.2026 | 10:00–13:00 | 3.0 h | Auth- & Supabase-Fundament: Browser-/Server-Clients, Proxy (Session-Refresh & Route-Schutz), passwortlose Server-Actions, `profiles`-Migration mit RLS | Foundation — A01, A02, A07 |
| 15.06.2026 | 13:30–15:30 | 2.0 h | Login- & Register-Seiten (passwortlos, 6-stelliger Magic-Code); parallele Umsetzung per Multi-Agent-Workflow | `/login`, `/register` — A07 |
| 15.06.2026 | 15:30–17:00 | 1.5 h | Block-Editor: Block-Typen, Slash-Menü, Textfarben; XSS-sicheres Rendering | `/editor` — A05 |
| 15.06.2026 | 17:00–18:30 | 1.5 h | Supabase-Projekt erstellt, `.env.local`, Migration angewendet; End-to-End-Test: Registrierung → Profil-Trigger, Zugriffsschutz `/dashboard` | Live-Backend, verifiziert — A01/A07 |
| | | **9.0 h** | **Total Woche 2** | |

---

## Umgesetzte Sicherheitsmassnahmen (OWASP Top 10 2025)

- **A01 — Broken Access Control:** Row Level Security auf `profiles` (nur eigene Zeile lesbar/schreibbar); bewusst keine `using(true)`-Policy; Proxy schützt `/dashboard` (Umleitung auf `/login` für nicht angemeldete Nutzer). ✅ getestet.
- **A02 — Security Misconfiguration:** Secrets in `.env.local` (nicht im Repo); DB-Funktionen mit fixiertem `search_path`; Callback gegen Open-Redirect abgesichert.
- **A05 — Injection:** Editor rendert keine unsicheren Inhalte (kein `dangerouslySetInnerHTML` auf Nutzereingaben), Bild-URLs validiert.
- **A07 — Authentication Failures:** Passwortloses Login (OTP/Magic-Link), keine Benutzer-Enumeration, Rate-Limit-Meldung (HTTP 429).

---

## Nächste Schritte (offen)

- **Phase 2:** KI-Assistent (Text generieren, Bilder online holen), Freeform-Canvas, Sharing zwischen Nutzern.
- **Phase 3:** Feinschliff der RLS-Policies, serverseitiges Rate-Limiting, Absicherung des KI-System-Prompts (Prompt-Injection).
- **Phase 4:** Penetration Testing gemäss Testmatrix **T01–T05** (ID-Manipulation, XSS, Prompt-Injection, Brute-Force, Log-Prüfung).
- **Phase 5:** Finales Testprotokoll & Projektdemonstration.
