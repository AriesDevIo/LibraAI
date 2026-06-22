"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { AltArrowLeft, CloudCheck, RefreshCircle, DangerTriangle } from "@solar-icons/react/ssr";
import Logo from "@/components/shared/Logo";
import ThemeToggle from "@/components/shared/ThemeToggle";
import BlockEditor from "@/components/editor/BlockEditor";
import { updateDocument } from "@/app/dashboard/actions";
import type { Block } from "@/components/editor/types";

type SaveStatus = "saved" | "saving" | "error";

/**
 * Client wrapper around the block editor that autosaves (debounced) to the
 * document via the RLS-scoped `updateDocument` server action.
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
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pending = useRef<{ title: string; blocks: Block[] } | null>(null);

  const onChange = useCallback(
    (data: { title: string; blocks: Block[] }) => {
      pending.current = data;
      setStatus("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const next = pending.current;
        if (!next) return;
        const res = await updateDocument(docId, {
          title: next.title,
          content: next.blocks,
        });
        setStatus(res?.ok ? "saved" : "error");
      }, 800);
    },
    [docId],
  );

  return (
    <div className="flex min-h-full flex-col">
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
            href="/dashboard"
            aria-label="Back to documents"
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_12%,transparent)]"
            style={{ color: "var(--color-secondary-text)" }}
          >
            <AltArrowLeft size={18} color="currentColor" weight="Bold" />
          </Link>
          <Link href="/" aria-label="Libra home">
            <Logo size={26} textClassName="text-lg" />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <SaveBadge status={status} />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1">
        <BlockEditor
          initialTitle={initialTitle}
          initialBlocks={initialBlocks}
          onChange={onChange}
        />
      </main>
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
      {label}
    </span>
  );
}
