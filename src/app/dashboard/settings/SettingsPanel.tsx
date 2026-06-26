"use client";

import { useState } from "react";
import {
  User,
  Palette,
  SettingsMinimalistic,
  DangerTriangle,
} from "@solar-icons/react/ssr";
import { ProfileSection } from "./sections/ProfileSection";
import { AppearanceSection } from "./sections/AppearanceSection";
import { AccountSection } from "./sections/AccountSection";
import { DangerZoneSection } from "./sections/DangerZoneSection";

type SectionId = "profile" | "appearance" | "account" | "danger";

const NAV = [
  { id: "profile", label: "Profile", Icon: User },
  { id: "appearance", label: "Appearance", Icon: Palette },
  { id: "account", label: "Account", Icon: SettingsMinimalistic },
  { id: "danger", label: "Danger zone", Icon: DangerTriangle },
] as const;

/**
 * Two-column settings panel: a section nav (vertical on desktop, a horizontal
 * scroller on mobile) + the active section's content. Renders inside the
 * dashboard shell, so it carries no logo/header of its own.
 */
export default function SettingsPanel({
  initialDisplayName,
  email,
  createdAt,
}: {
  initialDisplayName: string;
  email: string;
  createdAt: string;
}) {
  const [active, setActive] = useState<SectionId>("profile");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Settings</h1>

      <div className="grid gap-6 sm:grid-cols-[200px_1fr]">
        <nav
          aria-label="Settings sections"
          className="flex gap-1 overflow-x-auto pb-1 sm:flex-col sm:overflow-visible sm:pb-0"
        >
          {NAV.map(({ id, label, Icon }) => {
            const isActive = active === id;
            const isDanger = id === "danger";
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                aria-current={isActive ? "page" : undefined}
                className="flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition"
                style={{
                  background: isActive
                    ? "color-mix(in srgb, var(--color-secondary) 12%, transparent)"
                    : "transparent",
                  color: isActive
                    ? "var(--color-secondary-text)"
                    : isDanger
                      ? "#e11d48"
                      : "var(--color-fg)",
                }}
              >
                <Icon size={16} color="currentColor" weight="Bold" />
                {label}
              </button>
            );
          })}
        </nav>

        <div>
          {active === "profile" && (
            <ProfileSection
              initialDisplayName={initialDisplayName}
              email={email}
            />
          )}
          {active === "appearance" && <AppearanceSection />}
          {active === "account" && (
            <AccountSection email={email} createdAt={createdAt} />
          )}
          {active === "danger" && <DangerZoneSection />}
        </div>
      </div>
    </div>
  );
}
