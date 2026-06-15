"use client";

import { Monitor, Sun, Moon } from "@solar-icons/react/ssr";
import { useTheme } from "@/hooks/useTheme";
import { ThemeMode } from "@/types/theme";

const THEME_META: Record<ThemeMode, { label: string; icon: React.ReactNode }> = {
  system: { label: "System", icon: <Monitor size={14} color="currentColor" weight="Bold" /> },
  light: { label: "Light", icon: <Sun size={14} color="currentColor" weight="Bold" /> },
  dark: { label: "Dark", icon: <Moon size={14} color="currentColor" weight="Bold" /> },
};

/**
 * Theme switcher pill — cycles system → light → dark and shows the current
 * mode with a Solar icon + label. Self-contained: reads and writes the theme
 * via useTheme, which persists to localStorage and toggles `data-theme`.
 */
export default function ThemeToggle() {
  const { mode, cycleMode } = useTheme();
  const { label, icon } = THEME_META[mode];

  return (
    <button
      type="button"
      onClick={cycleMode}
      title={`Theme: ${label} — click to cycle`}
      aria-label={`Theme: ${label}. Click to cycle theme.`}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-surface-border)",
        color: "var(--color-secondary-text)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
