"use client";

import { Palette, Sun, Moon, Monitor } from "@solar-icons/react/ssr";
import { useTheme } from "@/hooks/useTheme";
import type { ThemeMode } from "@/types/theme";
import { SectionCard, SectionRow } from "./SectionCard";

const OPTIONS: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: "light", label: "Light", Icon: Sun },
  { mode: "dark", label: "Dark", Icon: Moon },
  { mode: "system", label: "System", Icon: Monitor },
];

/** Theme picker — reuses the shared `useTheme` hook (no new theme code). */
export function AppearanceSection() {
  const { mode, setMode } = useTheme();

  return (
    <SectionCard
      label="Appearance"
      icon={<Palette size={15} color="var(--color-secondary)" weight="Bold" />}
    >
      <SectionRow>
        <p className="mb-3 text-sm font-medium">Theme</p>
        <div className="grid grid-cols-3 gap-2" role="group" aria-label="Theme">
          {OPTIONS.map(({ mode: m, label, Icon }) => {
            const active = mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={active}
                className="flex flex-col items-center gap-2 rounded-xl py-4 text-xs font-semibold transition focus-visible:ring-2"
                style={{
                  background: active
                    ? "color-mix(in srgb, var(--color-secondary) 12%, transparent)"
                    : "var(--color-bg)",
                  border: active
                    ? "1px solid var(--color-secondary)"
                    : "1px solid var(--color-surface-border)",
                  color: active ? "var(--color-secondary-text)" : "var(--color-fg)",
                }}
              >
                <Icon size={20} color="currentColor" weight="Bold" />
                {label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs" style={{ color: "var(--color-accent)" }}>
          “System” follows your device’s light/dark setting.
        </p>
      </SectionRow>
    </SectionCard>
  );
}
