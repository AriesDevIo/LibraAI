import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary";
type Size = "sm" | "md" | "lg";

interface PillLinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  "aria-label"?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-base",
};

/**
 * The shared pill button, rendered as a Next <Link>.
 *  - primary:   solid brand violet, white text, hover lift + scale
 *  - secondary: glass surface with border, foreground text
 */
export default function PillLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  "aria-label": ariaLabel,
}: PillLinkProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]";

  const variantStyle =
    variant === "primary"
      ? {
          backgroundColor: "var(--color-secondary)",
          color: "#ffffff",
          boxShadow: "0 10px 30px color-mix(in srgb, var(--color-secondary) 30%, transparent)",
        }
      : {
          backgroundColor: "var(--color-surface)",
          color: "var(--color-fg)",
          border: "1px solid var(--color-surface-border)",
          backdropFilter: "blur(10px)",
        };

  const hoverClass = variant === "primary" ? "hover:shadow-xl" : "hover:shadow-lg";

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`${base} ${sizeClasses[size]} ${hoverClass} ${className}`}
      style={variantStyle}
    >
      {children}
    </Link>
  );
}
