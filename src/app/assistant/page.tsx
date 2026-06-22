import type { Metadata } from "next";
import Link from "next/link";
import AssistantPanel from "@/components/ai/AssistantPanel";

export const metadata: Metadata = {
  title: "AI Assistant · Libra",
  description:
    "Libra's built-in AI assistant — draft and refine notes, summarize ideas, and pull in images, powered by Claude.",
};

export default function AssistantPage() {
  return (
    <main
      className="min-h-screen w-full flex flex-col items-center px-4 py-6 sm:py-10"
      style={{ background: "var(--color-bg)" }}
    >
      <div className="w-full max-w-2xl flex flex-col flex-1" style={{ minHeight: 0 }}>
        {/* Header */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center justify-center rounded-xl font-bold"
              style={{
                width: 32,
                height: 32,
                background: "var(--color-secondary)",
                color: "white",
              }}
              aria-hidden="true"
            >
              L
            </span>
            <div>
              <h1 className="text-base font-bold leading-tight" style={{ color: "var(--color-fg)" }}>
                Libra Assistant
              </h1>
              <p className="text-xs" style={{ color: "var(--color-accent)" }}>
                Powered by Claude · prompt-injection hardened
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs font-medium transition-opacity duration-150 hover:opacity-80"
            style={{ color: "var(--color-secondary-text)" }}
          >
            ← Home
          </Link>
        </header>

        {/* Chat surface */}
        <div
          className="flex-1 flex flex-col rounded-2xl p-3 sm:p-4"
          style={{
            minHeight: "70vh",
            background: "var(--color-surface)",
            border: "1px solid var(--color-surface-border)",
          }}
        >
          <AssistantPanel />
        </div>
      </div>
    </main>
  );
}
