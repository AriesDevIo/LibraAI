"use client";

import { useSyncExternalStore, useCallback } from "react";
import { ThemeMode, THEME_CYCLE } from "@/types/theme";

const STORAGE_KEY = "libra-theme";

/** Our own listeners, notified when the mode is changed in this tab. */
const modeListeners = new Set<() => void>();

function readMode(): ThemeMode {
  const stored =
    typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", mode);
}

function writeMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* localStorage may be unavailable (private mode) — ignore. */
  }
  applyMode(mode);
  modeListeners.forEach((listener) => listener());
}

function subscribeMode(callback: () => void) {
  modeListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    modeListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function subscribeSystem(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSystemDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * Three-mode theme controller (system → light → dark), built on
 * useSyncExternalStore so it's SSR-safe and free of setState-in-effect.
 *  - Reads/writes `data-theme` on <html> for the forced light/dark overrides,
 *    removing it for "system" so the OS preference wins.
 *  - Persists the choice to localStorage; the root layout applies it pre-paint
 *    so the saved theme never flashes on reload.
 */
export function useTheme() {
  const mode = useSyncExternalStore(
    subscribeMode,
    readMode,
    () => "system" as ThemeMode,
  );
  const systemDark = useSyncExternalStore(
    subscribeSystem,
    getSystemDark,
    () => false,
  );

  const setMode = useCallback((next: ThemeMode) => writeMode(next), []);
  const cycleMode = useCallback(() => {
    const current = readMode();
    writeMode(THEME_CYCLE[(THEME_CYCLE.indexOf(current) + 1) % THEME_CYCLE.length]);
  }, []);

  const effectiveDark = mode === "dark" || (mode === "system" && systemDark);

  return { mode, setMode, cycleMode, effectiveDark };
}
