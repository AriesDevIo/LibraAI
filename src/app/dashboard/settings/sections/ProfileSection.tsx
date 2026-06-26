"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { User, Letter, CheckCircle, CloseCircle } from "@solar-icons/react/ssr";
import { updateProfile } from "../actions";
import { SectionCard, SectionRow, SectionDivider } from "./SectionCard";

/** Edit display name (persisted to `profiles` via RLS-scoped action) + show
 *  the read-only email. The name is rendered only as an escaped input value. */
export function ProfileSection({
  initialDisplayName,
  email,
}: {
  initialDisplayName: string;
  email: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const dirty = displayName.trim() !== initialDisplayName.trim();

  function handleSave() {
    setError("");
    setSuccess(false);
    startTransition(async () => {
      const res = await updateProfile(displayName);
      if (res?.error) {
        setError(res.error);
      } else {
        setSuccess(true);
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  return (
    <SectionCard
      label="Profile"
      icon={<User size={15} color="var(--color-secondary)" weight="Bold" />}
    >
      <SectionRow>
        <label
          htmlFor="display-name"
          className="mb-2 block text-[11px] font-medium uppercase tracking-wide"
          style={{ color: "var(--color-accent)" }}
        >
          Display name
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <User size={14} color="var(--color-accent)" weight="Bold" />
          </span>
          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={50}
            placeholder="How others see you"
            className="w-full rounded-xl py-2 pl-9 pr-3 text-sm font-medium outline-none transition focus-visible:ring-2"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-surface-border)",
              color: "var(--color-fg)",
            }}
          />
        </div>
      </SectionRow>

      <SectionDivider />

      <SectionRow>
        <label
          htmlFor="email"
          className="mb-2 block text-[11px] font-medium uppercase tracking-wide"
          style={{ color: "var(--color-accent)" }}
        >
          Email
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <Letter size={14} color="var(--color-accent)" weight="Bold" />
          </span>
          <input
            id="email"
            type="email"
            value={email}
            readOnly
            aria-readonly="true"
            className="w-full cursor-not-allowed rounded-xl py-2 pl-9 pr-3 text-sm font-medium outline-none"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-surface-border)",
              color: "var(--color-accent)",
            }}
          />
        </div>
        <p className="mt-2 text-xs" style={{ color: "var(--color-accent)" }}>
          Your email is used for passwordless sign-in and can’t be changed here.
        </p>
      </SectionRow>

      {(dirty || error || success) && (
        <>
          <SectionDivider />
          <SectionRow>
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 text-xs">
                {error ? (
                  <span className="font-medium" style={{ color: "#e11d48" }}>
                    {error}
                  </span>
                ) : success ? (
                  <span
                    className="font-medium"
                    style={{ color: "var(--color-secondary-text)" }}
                  >
                    Saved!
                  </span>
                ) : (
                  <span style={{ color: "var(--color-accent)" }}>
                    Unsaved changes
                  </span>
                )}
              </span>
              <div className="flex flex-shrink-0 gap-2">
                {dirty && (
                  <button
                    type="button"
                    onClick={() => {
                      setDisplayName(initialDisplayName);
                      setError("");
                    }}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50"
                    style={{
                      background: "var(--color-bg)",
                      border: "1px solid var(--color-surface-border)",
                      color: "var(--color-accent)",
                    }}
                  >
                    <CloseCircle size={13} color="currentColor" weight="Bold" />
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!dirty || isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: "var(--color-secondary)" }}
                >
                  {isPending ? (
                    "Saving…"
                  ) : (
                    <>
                      <CheckCircle size={13} color="#ffffff" weight="Bold" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </SectionRow>
        </>
      )}
    </SectionCard>
  );
}
