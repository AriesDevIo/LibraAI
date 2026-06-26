"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  TrashBinMinimalistic,
  DangerTriangle,
  CloseCircle,
} from "@solar-icons/react/ssr";
import { deleteAllDocuments } from "../actions";
import { SectionCard, SectionRow, SectionDivider } from "./SectionCard";

const CONFIRM_PHRASE = "DELETE";

/** Destructive actions. "Delete all documents" is guarded by a type-to-confirm
 *  modal; full account deletion is disabled (needs the service-role key / an
 *  edge function we don't have on the free tier). */
export function DangerZoneSection() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const canDelete = confirm === CONFIRM_PHRASE;

  function close() {
    setOpen(false);
    setConfirm("");
    setError("");
  }

  function handleDelete() {
    if (!canDelete) return;
    setError("");
    startTransition(async () => {
      const res = await deleteAllDocuments();
      if (res?.error) {
        setError(res.error);
      } else {
        close();
        router.refresh();
      }
    });
  }

  return (
    <SectionCard
      label="Danger zone"
      tone="danger"
      icon={<DangerTriangle size={15} color="#e11d48" weight="Bold" />}
    >
      <SectionRow>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Delete all my documents</p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--color-accent)" }}>
              Permanently removes every note in your account. This can’t be undone.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition"
            style={{
              background: "color-mix(in srgb, #e11d48 10%, transparent)",
              border: "1px solid color-mix(in srgb, #e11d48 35%, transparent)",
              color: "#e11d48",
            }}
          >
            <TrashBinMinimalistic size={13} color="currentColor" weight="Bold" />
            Delete all
          </button>
        </div>
      </SectionRow>

      <SectionDivider />

      <SectionRow>
        <div className="flex items-center justify-between gap-3 opacity-60">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Delete account</p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--color-accent)" }}>
              Removes your account entirely. Coming soon.
            </p>
          </div>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex flex-shrink-0 cursor-not-allowed items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-surface-border)",
              color: "var(--color-accent)",
            }}
          >
            Coming soon
          </button>
        </div>
      </SectionRow>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="danger-title"
          onClick={close}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-surface-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 id="danger-title" className="text-lg font-bold">
                Delete all documents?
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="opacity-60 transition hover:opacity-100"
              >
                <CloseCircle size={20} color="currentColor" weight="Bold" />
              </button>
            </div>
            <p className="mt-2 text-sm" style={{ color: "var(--color-accent)" }}>
              This permanently deletes <strong>all</strong> your notes. To confirm,
              type <strong>{CONFIRM_PHRASE}</strong> below.
            </p>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-label={`Type ${CONFIRM_PHRASE} to confirm`}
              autoFocus
              className="mt-4 w-full rounded-xl px-3 py-2 text-sm outline-none focus-visible:ring-2"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-surface-border)",
                color: "var(--color-fg)",
              }}
            />
            {error && (
              <p className="mt-2 text-xs font-medium" style={{ color: "#e11d48" }}>
                {error}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                disabled={isPending}
                className="rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50"
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid var(--color-surface-border)",
                  color: "var(--color-fg)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={!canDelete || isPending}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: "#e11d48" }}
              >
                {isPending ? "Deleting…" : "Delete all"}
              </button>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
