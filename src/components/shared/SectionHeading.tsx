import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

/** Centered section header: small violet eyebrow + bold title + muted subtitle. */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`mx-auto max-w-2xl text-center ${className}`}>
      {eyebrow && (
        <p
          className="mb-3 text-sm font-semibold uppercase tracking-widest"
          style={{ color: "var(--color-secondary-text)" }}
        >
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className="mx-auto mt-4 max-w-xl text-lg leading-relaxed"
          style={{ color: "var(--color-accent)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
