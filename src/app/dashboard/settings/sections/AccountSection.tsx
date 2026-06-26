"use client";

import { Letter, ClockCircle, Logout2 } from "@solar-icons/react/ssr";
import { signOut } from "@/app/(auth)/actions";
import { SectionCard, SectionRow, SectionDivider } from "./SectionCard";

/** Read-only account info + sign out (server action). */
export function AccountSection({
  email,
  createdAt,
}: {
  email: string;
  createdAt: string;
}) {
  const created = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <SectionCard
      label="Account"
      icon={<Letter size={15} color="var(--color-secondary)" weight="Bold" />}
    >
      <SectionRow>
        <div className="flex items-center gap-3">
          <Letter size={16} color="var(--color-accent)" weight="Bold" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>
              Email
            </p>
            <p className="truncate text-sm font-medium">{email}</p>
          </div>
        </div>
      </SectionRow>

      <SectionDivider />

      <SectionRow>
        <div className="flex items-center gap-3">
          <ClockCircle size={16} color="var(--color-accent)" weight="Bold" />
          <div>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>
              Account created
            </p>
            <p className="text-sm font-medium">{created}</p>
          </div>
        </div>
      </SectionRow>

      <SectionDivider />

      <SectionRow>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-secondary)_10%,transparent)]"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-surface-border)",
              color: "var(--color-fg)",
            }}
          >
            <Logout2 size={15} color="currentColor" weight="Bold" />
            Sign out
          </button>
        </form>
      </SectionRow>
    </SectionCard>
  );
}
