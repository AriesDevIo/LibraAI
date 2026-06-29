# Arbeitsjournal — Libra

**Projekt:** Libra — sichere, KI-gestützte Notiz- & Kollaborationsplattform (Notion-Alternative)
**Autor:** Andrin Rüegg · **Klasse:** AP23a · **Schule:** TBZ
**Methodik:** „Vibe Coding" — Code grösstenteils KI-gestützt generiert (Codex und Claude Code), wie im Projektantrag deklariert. Die erfassten Zeiten sind die **effektive Eigenleistung**: Projektwahl & Konzept, Prompting, Review/Test der Ergebnisse, Konfiguration (Supabase), Security und Dokumentation.
**Unterricht:** pro Block 4 Lektionen à 45 Min. (montags); davon teils ~20 Min. Klassenvideo + Pausen — pro Lektion also weniger als 45 Min. effektive Projektzeit.
**Sicherheitsrahmen:** OWASP Top 10 (2025)
**Stand:** 29.06.2026

> Hinweis: Der generierte Code-Umfang ist grösser als die erfassten Stunden — das ist beim Vibe Coding so gewollt. Die Eigenleistung liegt im Konzipieren, Prompten, Prüfen, Konfigurieren und Absichern, nicht im manuellen Tippen jeder Zeile.

---

## Stundenübersicht (effektive Eigenleistung)

| Block | Datum | Fokus | Effektiv |
|-------|-------|-------|---------:|
| Block 03 | 01.06.2026 | Projektwahl, Konzept & Setup | ~1.5 h |
| Block 04 | 08.06.2026 | Fundament & Landingpage | ~1.75 h |
| Block 05 | 15.06.2026 | Auth, Supabase & Editor | ~2.0 h |
| Block 06 | 22.06.2026 | Persistenz, Canvas, KI & Security | ~2.0 h |
| Block 07 | 29.06.2026 | App-Shell, Editor-Ausbau, Canvas-Persistenz & Upload | ~2.0 h |
| **Total** | | | **~9.25 h** |

---

## Block 03 — 01.06.2026 · Projektwahl, Konzept & Setup

Erster Block: vor allem **Projekt ausgewählt und geplant**, noch wenig Code.

| Lektion | Effektiv | Tätigkeit |
|---------|---------:|-----------|
| 1 | ~30 Min | Projektidee gewählt: sichere Notion-Alternative; Abgrenzung & Ziele |
| 2 | ~30 Min | Projektantrag / Konzept (Google Doc): Funktionsumfang, OWASP-Zuordnung |
| 3 | ~20 Min | 24-Stunden-Plan & Testmatrix grob skizziert (~20 Min Klassenvideo) |
| 4 | ~10 Min | Repository + Next.js-Gerüst angelegt (Rest: Theorie) |

## Block 04 — 08.06.2026 · Fundament & Landingpage

| Lektion | Effektiv | Tätigkeit (Code per Vibe Coding) |
|---------|---------:|----------------------------------|
| 1 | ~25 Min | Projektgerüst (Next.js, TypeScript, Tailwind) fertig konfiguriert, geprüft |
| 2 | ~35 Min | Design-System (Farben, Light/Dark, Schrift) generiert und angepasst |
| 3 | ~35 Min | Landingpage-Sektionen (Hero, Features, Footer …) generiert, durchgesehen |
| 4 | ~10 Min | README & Assets (Rest: Klassenvideo) |

## Block 05 — 15.06.2026 · Auth, Supabase & Editor

| Lektion | Effektiv | Tätigkeit |
|---------|---------:|-----------|
| 1 | ~30 Min | Logo + passwortloser Auth-Flow generiert, geprüft |
| 2 | ~40 Min | **Supabase** (manuelle Konfiguration): Projekt erstellt, `.env.local` gesetzt, Migration angewendet |
| 3 | ~35 Min | Login-/Register-Seiten + Block-Editor generiert, Review |
| 4 | ~25 Min | End-to-End-Test: Registrierung → Profil-Trigger, Zugriffsschutz `/dashboard` |

## Block 06 — 22.06.2026 · Persistenz, Canvas, KI & Security

| Lektion | Effektiv | Tätigkeit |
|---------|---------:|-----------|
| 1 | ~35 Min | Dokumente speichern (Editor ↔ Supabase, RLS) generiert, getestet |
| 2 | ~35 Min | Freeform-Canvas + KI-Assistent generiert, Review |
| 3 | ~30 Min | Security-Header, Input-Sanitization, Pentest-Protokoll (T01–T05) |
| 4 | ~20 Min | Dokumentation, Arbeitsjournal, Supabase-Screenshots |

## Block 07 — 29.06.2026 · App-Shell, Editor-Ausbau, Canvas-Persistenz & Upload

Letzter Block: bestehende Features **zusammengeführt, vertieft und durchgängig
gemacht** statt neuer Baustellen. Schwerpunkte: eine einheitliche App-Oberfläche
mit Sidebar, der Canvas „gehört" jetzt zum Dokument (und wird gespeichert), und
echtes Hochladen von Bildern.

| Lektion | Effektiv | Tätigkeit |
|---------|---------:|-----------|
| 1 | ~30 Min | App-Shell mit persistenter Sidebar (Dokumente / Assistent / Einstellungen) + Einstellungsseite (Profil, Theme, Konto) generiert, Review |
| 2 | ~35 Min | Editor-Ausbau: Schriftarten & -grössen, Unterstreichen/Durchstreichen/Inline-Code, neue Blöcke (To-do, Zitat, Callout, Code, Trenner) |
| 3 | ~35 Min | Canvas ins Dokument integriert + **Persistenz** (neue Spalte `canvas`, Autosave) — der zuvor „lose", nicht gespeicherte Canvas wird jetzt pro Dokument gesichert; Emoji-Icons, Duplizieren, Reihenfolge |
| 4 | ~20 Min | **Bild-Upload** via Supabase Storage (eigener Ordner pro Nutzer, nur Raster-Bilder, kein SVG, max. 5 MB); Migrationen `0003`/`0004` angewendet & verifiziert, Build geprüft |

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
- **A05 — Injection:** Editor & Canvas rendern keine unsicheren Inhalte (kein `dangerouslySetInnerHTML`); Formatierung nur als geschlossene Schlüssel-Liste (Whitelist), nie als CSS/Markup; Bild-URLs auf `http(s)` validiert; Uploads auf Raster-Bildtypen (kein SVG) + Grösse begrenzt; gespeicherte Canvas-Objekte werden beim Laden re-sanitisiert; KI-System-Prompt gegen Prompt-Injection gehärtet.
- **A07 — Authentication Failures:** Passwortloses Login, keine Benutzer-Enumeration, Rate-Limit-Meldung (HTTP 429).

## Offene Punkte für die Abgabe (letzter Block)

- **Pentest abschliessen:** `docs/SECURITY-TESTS.md` ist erstellt — T01/T02/T04 = PASS. **T03** (Prompt-Injection) kann jetzt real ausgeführt werden, da der KI-Assistent gebaut ist; **T05** (Logging) noch korrelieren. Beide live in der Demo durchführen und im Protokoll festhalten.
- **Optional (Antrag-Scope):** Sharing von Dokumenten zwischen Nutzern.
- **Projektdemonstration** vorbereiten (Login → Dokument → Editor/Canvas → KI-Assistent → Pentest T01–T05).
