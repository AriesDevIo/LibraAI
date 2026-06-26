import type { ReactNode } from "react";

/** Card wrapper for a settings section: a labelled header + bordered body.
 *  Presentational only — used inside the (client) settings panel. */
export function SectionCard({
  label,
  description,
  tone = "default",
  icon,
  children,
}: {
  label: string;
  description?: string;
  tone?: "default" | "danger";
  icon?: ReactNode;
  children: ReactNode;
}) {
  const isDanger = tone === "danger";
  return (
    <div
      className="w-full overflow-hidden rounded-2xl"
      style={{
        background: isDanger
          ? "color-mix(in srgb, #e11d48 5%, var(--color-surface))"
          : "var(--color-surface)",
        border: isDanger
          ? "1px solid color-mix(in srgb, #e11d48 30%, transparent)"
          : "1px solid var(--color-surface-border)",
      }}
    >
      <div className="flex items-center gap-2 px-6 pb-3 pt-5">
        {icon}
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-widest"
            style={{ color: isDanger ? "#e11d48" : "var(--color-accent)" }}
          >
            {label}
          </p>
          {description && (
            <p className="mt-0.5 text-xs" style={{ color: "var(--color-accent)" }}>
              {description}
            </p>
          )}
        </div>
      </div>
      <div
        style={{
          borderTop: isDanger
            ? "1px solid color-mix(in srgb, #e11d48 18%, transparent)"
            : "1px solid var(--color-surface-border)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function SectionRow({ children }: { children: ReactNode }) {
  return <div className="px-6 py-4">{children}</div>;
}

export function SectionDivider() {
  return <div style={{ borderTop: "1px solid var(--color-surface-border)" }} />;
}
