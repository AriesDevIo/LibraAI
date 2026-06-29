# Arbeitsjournal — Libra

**Projekt:** Libra — sichere, KI-gestützte Notiz- & Kollaborationsplattform (Notion-Alternative)
**Autor:** Andrin Rüegg · **Klasse:** AP23a · **Schule:** TBZ
**Methodik:** „Vibe Coding" — Code grösstenteils KI-gestützt generiert (Codex und Claude Code), wie im Projektantrag deklariert. Die Eigenleistung liegt im **Konzipieren, Prompten, Prüfen/Testen, Konfigurieren (Supabase) und Absichern (Security)** — nicht im manuellen Tippen jeder Zeile.
**Unterricht:** montags pro Block 4 Lektionen à 45 Min.; durchgehend an Libra gearbeitet (~45 Min. effektive Projektzeit je Lektion).
**Zusätzlich:** an den Wochenenden ca. **2–3 h** für die tiefergehende Security-Härtung, das Pentesting und die Dokumentation.
**Sicherheitsrahmen:** OWASP Top 10 (2025) — Security ist die zentrale, benotete Eigenleistung.
**Stand:** 29.06.2026

> Hinweis: Der generierte Code-Umfang ist grösser als die erfassten Stunden — das ist beim Vibe Coding so gewollt. Die erfasste Zeit ist die fokussierte Projektarbeit (planen, prompten, prüfen, konfigurieren, absichern, testen, dokumentieren).

---

## Stundenübersicht (Eigenleistung)

| Block | Datum | Fokus | Zeit |
|-------|-------|-------|-----:|
| Block 03 | 01.06.2026 | Projektwahl, Konzept & Setup | ~3 h |
| Block 04 | 08.06.2026 | Fundament & Landingpage | ~3 h |
| Block 05 | 15.06.2026 | Auth, Supabase & Editor | ~3 h |
| Block 06 | 22.06.2026 | Persistenz, Canvas, KI & Security | ~3 h |
| Block 07 | 29.06.2026 | App-Shell, Editor-Ausbau, Canvas-Persistenz & Upload | ~3 h |
| Wochenenden | (zusätzlich) | Security-Härtung, Pentest, Tests & Doku | ~3 h |
| **Total** | | | **~18 h** |

*(4 Lektionen × ~45 Min. = ~3 h pro Block; 5 Blöcke + Wochenendarbeit.)*

---

## Block 03 — 01.06.2026 · Projektwahl, Konzept & Setup

Erster Block: vor allem **Projekt ausgewählt und geplant**.

| Lektion | Zeit | Tätigkeit |
|---------|-----:|-----------|
| 1 | ~45 Min | Projektidee gewählt: sichere Notion-Alternative; Abgrenzung, Ziele, Risiken |
| 2 | ~45 Min | Projektantrag / Konzept (Google Doc): Funktionsumfang + OWASP-Zuordnung |
| 3 | ~45 Min | 24-Stunden-Plan & Security-Testmatrix (T01–T05) ausgearbeitet |
| 4 | ~45 Min | Repository + Next.js-Gerüst (App Router, TypeScript) angelegt |

## Block 04 — 08.06.2026 · Fundament & Landingpage

| Lektion | Zeit | Tätigkeit (Code per Vibe Coding) |
|---------|-----:|----------------------------------|
| 1 | ~45 Min | Projektgerüst (Next.js, TypeScript, Tailwind v4) konfiguriert, geprüft |
| 2 | ~45 Min | Design-System (Farb-Token, Light/Dark, Poppins) generiert und angepasst |
| 3 | ~45 Min | Landingpage-Sektionen (Navbar, Hero, Features, Security, Footer) generiert, durchgesehen |
| 4 | ~45 Min | Theme-Toggle mit Persistenz, README & Assets |

## Block 05 — 15.06.2026 · Auth, Supabase & Editor

| Lektion | Zeit | Tätigkeit |
|---------|-----:|-----------|
| 1 | ~45 Min | Logo + passwortloser Auth-Flow (Login/Register) generiert, geprüft |
| 2 | ~45 Min | **Supabase** (manuelle Konfiguration): Projekt erstellt, `.env.local` gesetzt, Migration `0001_profiles` + RLS angewendet |
| 3 | ~45 Min | Login-/Register-Seiten + Block-Editor generiert, Review |
| 4 | ~45 Min | End-to-End-Test: Registrierung → Profil-Trigger; Zugriffsschutz `/dashboard` (Proxy) |

## Block 06 — 22.06.2026 · Persistenz, Canvas, KI & Security

| Lektion | Zeit | Tätigkeit |
|---------|-----:|-----------|
| 1 | ~45 Min | Dokumente speichern (Editor ↔ Supabase, owner-only RLS) generiert, getestet |
| 2 | ~45 Min | Freeform-Canvas + KI-Assistent (Claude: Textgenerierung + Bildsuche) generiert, Review |
| 3 | ~45 Min | Security-Header (HSTS/CSP/X-Frame-Options), Input-Sanitisierung, Pentest-Protokoll T01–T05 angelegt |
| 4 | ~45 Min | Dokumentation, Arbeitsjournal, Supabase-Screenshots |

## Block 07 — 29.06.2026 · App-Shell, Editor-Ausbau, Canvas-Persistenz & Upload

Letzter Block: bestehende Features **zusammengeführt, vertieft und durchgängig
gemacht** statt neuer Baustellen. Schwerpunkte: eine einheitliche App-Oberfläche
mit Sidebar, der Canvas „gehört" jetzt zum Dokument (und wird gespeichert),
echtes Hochladen von Bildern — und der **Abschluss des Pentests**.

| Lektion | Zeit | Tätigkeit |
|---------|-----:|-----------|
| 1 | ~45 Min | App-Shell mit persistenter Sidebar (Home / Dokumente / Einstellungen) + Einstellungsseite (Profil, Theme, Konto) generiert, Review |
| 2 | ~45 Min | Editor-Ausbau: Schriftarten & -grössen, Unterstreichen/Durchstreichen/Inline-Code, neue Blöcke (To-do, Zitat, Callout, Code, Trenner, Icon) |
| 3 | ~45 Min | Canvas ins Dokument integriert + **Persistenz** (neue Spalte `canvas`, Autosave); Emoji-Icons, Duplizieren, Reihenfolge |
| 4 | ~45 Min | **Bild-Upload** via Supabase Storage (RLS, kein SVG, 5 MB); Pentest **T03/T05 abgeschlossen**, **T01/T02 als Video aufgezeichnet**, Demo-Skript |

## Wochenenden (zusätzlich, ~3 h)

Ausserhalb des Unterrichts vertieft — vor allem die **benotete Security-Arbeit**:

- Feinschliff der **RLS-Policies** (nur eigene Zeilen, kein `using(true)`) und der **Input-Sanitisierung** (Editor, Canvas, Bild-URLs, Uploads).
- **Pentesting** der Testmatrix T01–T05 durchgeführt und protokolliert; T01 (RLS) und T02 (XSS) zusätzlich als **animierte Video-Belege** aufgezeichnet (`docs/security-tests/`).
- Build-/Architektur-Fixes (Server-Actions sauber getrennt) und Dokumentation (README, Security-Protokoll, Demo-Skript).

---

## Supabase (Backend)

Siehe Screenshots in [`docs/screenshots/`](docs/screenshots/).

- Free-Tier-Projekt **`libra`** (Organisation „Libra"), Region Europa.
- Tabellen **`profiles`** und **`documents`** mit **Row Level Security** — nur der Eigentümer kann seine Zeilen lesen/schreiben (`auth.uid() = user_id`); bewusst keine `using(true)`-Policy. Das Dokument enthält neben dem Block-`content` jetzt auch eine `canvas`-Spalte, damit Editor- **und** Canvas-Ansicht in derselben Zeile gespeichert werden.
- **Storage-Bucket `note-images`** für Bild-Uploads: öffentlich lesbar, aber Schreiben nur im eigenen Ordner (`<uid>/…`) per Storage-RLS; nur Raster-Bildtypen (kein SVG), max. 5 MB.
- Passwortlose Authentifizierung (E-Mail-OTP / Magic-Link); das Profil wird beim Sign-up automatisch per DB-Trigger angelegt.
- `.env.local` enthält Projekt-URL + Publishable Key (Secrets sind **nicht** im Repository).

## Umgesetzte Sicherheitsmassnahmen (OWASP Top 10 2025)

- **A01 — Broken Access Control:** RLS auf `profiles` und `documents` (nur eigene Zeilen); Proxy schützt `/dashboard` (Umleitung auf `/login`). Getestet: das Aufrufen eines fremden Dokuments per ID liefert 404 (T01).
- **A02 — Security Misconfiguration:** Secrets in `.env.local` (nicht im Repo); Security-Header (HSTS, X-Frame-Options, CSP); DB-Funktionen mit fixiertem `search_path`; Callback gegen Open-Redirect abgesichert.
- **A05 — Injection:** Editor & Canvas rendern keine unsicheren Inhalte (kein `dangerouslySetInnerHTML`); Formatierung nur als geschlossene Schlüssel-Liste (Whitelist), nie als CSS/Markup; Bild-URLs auf `http(s)` validiert; Uploads auf Raster-Bildtypen (kein SVG) + Grösse begrenzt; gespeicherte Canvas-Objekte werden beim Laden re-sanitisiert; KI-System-Prompt gegen Prompt-Injection gehärtet (alle Tools deaktiviert, Secrets aus der Umgebung entfernt).
- **A07 — Authentication Failures:** Passwortloses Login, keine Benutzer-Enumeration, Rate-Limit-Meldung (HTTP 429).

## Pentest-Status (Testmatrix T01–T05)

Vollständiges Protokoll: [`docs/SECURITY-TESTS.md`](docs/SECURITY-TESTS.md) · Video-Belege: [`docs/security-tests/`](docs/security-tests/).

| Test | OWASP | Kontrolle | Status |
|------|-------|-----------|--------|
| T01 | A01 | Pro-Nutzer-Isolation (RLS) | ✅ PASS — **Video** |
| T02 | A05 | Editor rendert Eingaben nie als HTML | ✅ PASS — **Video** |
| T03 | A05 | KI gegen Prompt-Injection gehärtet | ✅ PASS (White-Box + live in der Demo) |
| T04 | A07 | Login-Rate-Limiting (HTTP 429) | ✅ PASS |
| T05 | A09 | Sicherheitsereignisse werden geloggt | ✅ PASS (Logs befüllt + abfragbar) |

## Abschluss / Stand der Abgabe

- **Funktionsumfang erfüllt:** Landingpage, passwortloses Login, Dokumente anlegen, Block-Editor (Text/Bild/Farben/Schriften), Freeform-Canvas, KI-Assistent (Text + Bilder) — alles umgesetzt und im Dokument gespeichert.
- **Security (benotet) umgesetzt und getestet:** OWASP A01/A02/A05/A07/A09; Testmatrix T01–T05 dokumentiert, T01 & T02 mit Video-Beleg.
- **Bewusst offen gelassen (Zeit):** Sharing von Dokumenten zwischen Nutzern — als bewusste Scope-Entscheidung zugunsten einer sauber abgesicherten App statt eines unfertigen Sharing-Features mit möglichem RLS-Loch.
- **Demo vorbereitet:** [`docs/DEMO.md`](docs/DEMO.md) (Login → Dokument → Editor/Canvas → KI-Assistent → Pentest T01–T05 live).
