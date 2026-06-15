# Libra logo asset

Drop your crown logo here as:

    public/LibraNoBg.png

That exact filename is what the `Logo` component
(`src/components/shared/Logo.tsx`) loads everywhere — navbar, footer,
and the mockup. A transparent-background PNG (square, ideally 256×256 or
larger) works best.

Until that file exists, the brand mark falls back to a built-in violet
crown glyph, so nothing ever shows a broken image.
