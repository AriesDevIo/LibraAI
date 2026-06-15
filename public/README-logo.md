# Libra logo asset

The brand mark is no longer a dropped-in PNG. It's an inline, background-less
SVG baked into the [`Logo`](../src/components/shared/Logo.tsx) component, so it
adapts to light/dark via CSS-variable fills with nothing to 404.

Assets:

- [`public/libra-mark.svg`](libra-mark.svg) — standalone mark (two-tone,
  OS-color-scheme aware) for decks, docs, and external use.
- [`src/app/icon.svg`](../src/app/icon.svg) — the matching browser-tab favicon.

To switch the in-app treatment, pass `variant="violet" | "twotone" | "lavender"`
to the `Logo` component (default: `twotone`).
