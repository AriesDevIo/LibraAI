"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { AltArrowLeft, CloudCheck, RefreshCircle, DangerTriangle } from "@solar-icons/react/ssr";
import BlockEditor from "@/components/editor/BlockEditor";
import Canvas from "@/components/canvas/Canvas";
import AssistantPanel from "@/components/ai/AssistantPanel";
import { updateDocument } from "@/app/dashboard/actions";
import type { Block } from "@/components/editor/types";

type SaveStatus = "saved" | "saving" | "error";
type View = "editor" | "canvas";

/**
 * In-document workspace. An open document hosts two views — the block Editor
 * and the freeform Canvas — plus a toggleable AI Assistant side panel that
 * persists alongside either view. The outer dashboard shell (Tab 1) provides
 * the app chrome, so this renders content only (no logo header of its own).
 *
 * Autosave goes through the RLS-scoped `updateDocument` server action. The
 * Assistant receives the note's PLAIN TEXT as context (plain strings only —
 * XSS-safe), and the route's hardened system prompt treats it as data (A05).
 */
export default function DocEditor({
  docId,
  initialTitle,
  initialBlocks,
}: {
  docId: string;
  initialTitle: string;
  initialBlocks: Block[];
}) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [view, setView] = useState<View>("editor");
  const [title, setTitle] = useState(initialTitle);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [focusTick, setFocusTick] = useState(0);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest editor state, kept in a ref so the assistant can read note text on
  // demand without re-rendering this tree on every keystroke.
  const latest = useRef<{ title: string; blocks: Block[] }>({
    title: initialTitle,
    blocks: initialBlocks,
  });
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  const onChange = useCallback(
    (data: { title: string; blocks: Block[] }) => {
      latest.current = data;
      setTitle(data.title);
      setStatus("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const res = await updateDocument(docId, {
          title: data.title,
          content: data.blocks,
        });
        setStatus(res?.ok ? "saved" : "error");
      }, 800);
    },
    [docId],
  );

  const getContext = useCallback(
    () => blocksToPlainText(latest.current.title, latest.current.blocks),
    [],
  );

  function openAssistant() {
    setAssistantOpen(true);
    setFocusTick((t) => t + 1);
  }
  function closeAssistant() {
    setAssistantOpen(false);
    toggleBtnRef.current?.focus();
  }

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      {/* Sub-toolbar */}
      <header
        className="z-30 flex items-center gap-2 px-3 py-2.5 sm:px-4"
        style={{
          background: "var(--color-nav-bg)",
          borderBottom: "1px solid var(--color-surface-border)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Left: back + title */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link
            href="/dashboard"
            aria-label="Back to documents"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_12%,transparent)]"
            style={{ color: "var(--color-secondary-text)" }}
          >
            <AltArrowLeft size={18} color="currentColor" weight="Bold" />
          </Link>
          <span
            className="hidden truncate text-sm font-semibold sm:block"
            style={{ color: "var(--color-fg)" }}
            title={title || "Untitled"}
          >
            {title || "Untitled"}
          </span>
        </div>

        {/* Center: view switcher */}
        <ViewSwitcher view={view} onChange={setView} />

        {/* Right: save status + assistant toggle */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <SaveBadge status={status} />
          <button
            ref={toggleBtnRef}
            type="button"
            onClick={() => (assistantOpen ? closeAssistant() : openAssistant())}
            aria-pressed={assistantOpen}
            aria-expanded={assistantOpen}
            aria-controls="assistant-panel"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors cursor-pointer"
            style={
              assistantOpen
                ? { background: "var(--color-secondary)", color: "white" }
                : {
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-surface-border)",
                    color: "var(--color-fg)",
                  }
            }
          >
            <SparkGlyph />
            <span className="hidden sm:inline">Assistant</span>
          </button>
        </div>
      </header>

      {/* Body: view area + persistent assistant dock */}
      <div className="flex min-h-0 flex-1">
        <main className="relative min-w-0 flex-1">
          <div
            role="tabpanel"
            id="panel-editor"
            aria-labelledby="tab-editor"
            tabIndex={0}
            hidden={view !== "editor"}
            className="h-full overflow-y-auto outline-none"
          >
            <BlockEditor
              initialTitle={initialTitle}
              initialBlocks={initialBlocks}
              onChange={onChange}
            />
          </div>
          <div
            role="tabpanel"
            id="panel-canvas"
            aria-labelledby="tab-canvas"
            tabIndex={0}
            hidden={view !== "canvas"}
            className="h-full outline-none"
          >
            <Canvas />
          </div>
        </main>

        {/* Assistant: right-side column on md+, full-width sheet on mobile.
            Kept mounted (display toggle) so the chat + draft survive view
            switches and open/close. */}
        <aside
          id="assistant-panel"
          aria-label="AI assistant"
          className={`${
            assistantOpen ? "flex" : "hidden"
          } fixed inset-0 z-50 flex-col p-3 sm:p-4 md:static md:z-auto md:w-[380px] md:shrink-0 md:border-l md:border-[var(--color-surface-border)]`}
          style={{ background: "var(--color-bg)" }}
        >
          <AssistantPanel
            getContext={getContext}
            onClose={closeAssistant}
            focusSignal={focusTick}
          />
        </aside>
      </div>
    </div>
  );
}

/** Accessible tablist switching between the Editor and Canvas views. */
function ViewSwitcher({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  const tabs: { key: View; label: string; Icon: () => React.ReactElement }[] = [
    { key: "editor", label: "Editor", Icon: EditorGlyph },
    { key: "canvas", label: "Canvas", Icon: CanvasGlyph },
  ];
  return (
    <div
      role="tablist"
      aria-label="Document view"
      className="inline-flex shrink-0 rounded-lg p-0.5"
      style={{ background: "var(--color-bg)", border: "1px solid var(--color-surface-border)" }}
    >
      {tabs.map((t, i) => {
        const active = view === t.key;
        return (
          <button
            key={t.key}
            role="tab"
            id={`tab-${t.key}`}
            aria-selected={active}
            aria-controls={`panel-${t.key}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(t.key)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                onChange(tabs[(i + 1) % tabs.length].key);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
            style={
              active
                ? { background: "var(--color-secondary)", color: "white" }
                : { background: "transparent", color: "var(--color-accent)" }
            }
          >
            <t.Icon />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function SaveBadge({ status }: { status: SaveStatus }) {
  const map = {
    saving: { Icon: RefreshCircle, label: "Saving…", color: "var(--color-accent)" },
    saved: { Icon: CloudCheck, label: "Saved", color: "var(--color-secondary-text)" },
    error: { Icon: DangerTriangle, label: "Save failed", color: "#e11d48" },
  } as const;
  const { Icon, label, color } = map[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-medium"
      style={{ color }}
      aria-live="polite"
    >
      <Icon size={14} color="currentColor" weight="Bold" />
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}

/**
 * Extract the note's plain text from its blocks for AI context. Strings only —
 * never markup — so this can never carry script (XSS-safe by construction).
 */
function blocksToPlainText(title: string, blocks: Block[]): string {
  const lines: string[] = [];
  const t = title.trim();
  if (t) lines.push(t);
  for (const b of blocks) {
    if (b.type === "image") {
      const alt = (b.alt ?? "").trim();
      if (alt) lines.push(`[image: ${alt}]`);
    } else {
      const text = (b.text ?? "").trim();
      if (!text) continue;
      if (b.type === "bulleted") lines.push(`- ${text}`);
      else if (b.type === "numbered") lines.push(`• ${text}`);
      else lines.push(text);
    }
  }
  return lines.join("\n");
}

/* ── Inline glyphs (no icon-pkg coupling for the new controls) ── */

function EditorGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5h14M5 10h14M5 15h9M5 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CanvasGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="13" y="9" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <rect x="4" y="14" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function SparkGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 3l1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7L12 3Z" />
    </svg>
  );
}
