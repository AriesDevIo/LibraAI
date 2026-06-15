import type { Metadata } from "next";
import Link from "next/link";
import { AltArrowLeft } from "@solar-icons/react/ssr";
import Logo from "@/components/shared/Logo";
import ThemeToggle from "@/components/shared/ThemeToggle";
import BlockEditor from "@/components/editor/BlockEditor";

export const metadata: Metadata = {
  title: "Editor — Libra",
  description:
    "Libra's block-based editor — headings, lists, images, and colored text, all rendered XSS-safe by design.",
};

/**
 * Standalone demo page for the block editor. The page itself is a Server
 * Component (static chrome); the interactive editor is the Client Component
 * boundary. No backend — the document lives entirely in local React state.
 */
export default function EditorPage() {
  return (
    <div className="flex min-h-full flex-col">
      {/* Top chrome — mirrors the marketing nav's glass treatment. */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6"
        style={{
          background: "var(--color-nav-bg)",
          borderBottom: "1px solid var(--color-surface-border)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Back to home"
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_12%,transparent)]"
            style={{ color: "var(--color-secondary-text)" }}
          >
            <AltArrowLeft size={18} color="currentColor" weight="Bold" />
          </Link>
          <Link href="/" aria-label="Libra home">
            <Logo size={26} textClassName="text-lg" />
          </Link>
          <span
            className="hidden rounded-full px-2.5 py-1 text-[11px] font-semibold sm:inline"
            style={{
              background: "color-mix(in srgb, var(--color-secondary) 12%, transparent)",
              color: "var(--color-secondary-text)",
            }}
          >
            Editor
          </span>
        </div>

        <ThemeToggle />
      </header>

      <main className="flex-1">
        <BlockEditor />
      </main>
    </div>
  );
}
