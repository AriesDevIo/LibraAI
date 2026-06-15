import type { CSSProperties } from "react";

/** Color treatments for the brand mark. */
export type LogoVariant = "violet" | "twotone" | "lavender";

/** Mark geometry: width / height of the glyph's viewBox, for aspect-correct sizing. */
const MARK_RATIO = 573.49 / 735;

/** The two glyph shapes, with the surrounding background removed (transparent). */
const STEM_PATH =
  "M278 514.51 L278 167 L342.5 167 L407 167 L406.75 514.25 L406.5 861.5 L342.25 861.76 L278 862.01 Z";
const ARROW_PATH =
  "M536 733.28 L536 604.55 L581.75 558.76 C606.91 533.58 627.61 512.64 627.75 512.23 C627.89 511.82 607.31 490.79 582 465.51 L536 419.55 L536 293.28 L536 167 L600.5 167 L665 167 L665 266.25 L665 365.49 L738.25 438.75 L811.49 512 L738.25 585.25 L665.01 658.5 L664.75 760 L664.5 861.5 L600.25 861.76 L536 862.01 Z";

interface LogoProps {
  /** Height of the brand mark in px. */
  size?: number;
  /** Tailwind size class for the wordmark text. */
  textClassName?: string;
  /** Show the "Libra" wordmark next to the mark. */
  showWordmark?: boolean;
  /** Color treatment — all theme-aware, transparent background. */
  variant?: LogoVariant;
  className?: string;
}

/**
 * The Libra brand mark — an inline, background-less SVG so it adapts to light
 * and dark mode via CSS-variable fills (no PNG, nothing to 404). Three color
 * treatments are available via `variant`:
 *
 * - `violet`   — whole mark in the brand violet (`--color-secondary`).
 * - `twotone`  — stem in theme ink (`--color-fg`) + arrow in brand violet.
 * - `lavender` — whole mark in soft lavender (`--color-primary`).
 */
export function LogoMark({
  size = 34,
  variant = "twotone",
  className = "",
  style,
  "aria-hidden": ariaHidden,
}: {
  size?: number;
  variant?: LogoVariant;
  className?: string;
  style?: CSSProperties;
  "aria-hidden"?: boolean;
}) {
  const stem =
    variant === "twotone"
      ? "var(--color-fg)"
      : variant === "lavender"
        ? "var(--color-primary)"
        : "var(--color-secondary)";
  const arrow =
    variant === "lavender" ? "var(--color-primary)" : "var(--color-secondary)";

  return (
    <svg
      viewBox="258 147 573.49 735"
      height={size}
      width={Math.round(size * MARK_RATIO)}
      className={className}
      style={style}
      role={ariaHidden ? undefined : "img"}
      aria-label={ariaHidden ? undefined : "Libra"}
      aria-hidden={ariaHidden}
    >
      <path d={STEM_PATH} fill={stem} />
      <path d={ARROW_PATH} fill={arrow} />
    </svg>
  );
}

/**
 * Libra brand mark + wordmark. The wordmark accents the second syllable in the
 * brand violet: Li·bra.
 */
export default function Logo({
  size = 34,
  textClassName = "text-xl",
  showWordmark = true,
  variant = "twotone",
  className = "",
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={size} variant={variant} aria-hidden={showWordmark} />

      {showWordmark && (
        <span
          className={`font-extrabold tracking-tighter leading-none ${textClassName}`}
        >
          <span style={{ color: "var(--color-fg)" }}>Li</span>
          <span style={{ color: "var(--color-secondary)" }}>bra</span>
        </span>
      )}
    </span>
  );
}
