"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Magnifer } from "@solar-icons/react/ssr";
import { filterIcons, iconComponent } from "./icons";

interface IconPickerProps {
  /** Currently selected icon key (highlighted in the grid). */
  current?: string;
  onSelect: (key: string) => void;
  onClose: () => void;
}

/**
 * Searchable Solar-icon picker popover. Anchored to the icon block (rendered
 * inside a `relative` container). Closes on Escape or outside click. Selecting
 * an icon stores only its KEY — never markup — so it's XSS-safe by design.
 */
export default function IconPicker({
  current,
  onSelect,
  onClose,
}: IconPickerProps) {
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => filterIcons(query), [query]);

  // Focus search on open; close on outside click / Escape.
  useEffect(() => {
    inputRef.current?.focus();
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label="Choose an icon"
      className="absolute left-0 top-full z-30 mt-1 w-72 rounded-xl p-2 shadow-2xl"
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-surface-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Search */}
      <label
        className="mb-2 flex items-center gap-2 rounded-lg px-2.5 py-1.5"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-surface-border)",
        }}
      >
        <Magnifer size={14} color="var(--color-accent)" weight="Bold" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons…"
          aria-label="Search icons"
          className="w-full bg-transparent text-sm outline-none placeholder:opacity-40"
          style={{ color: "var(--color-fg)" }}
        />
      </label>

      {/* Grid */}
      {results.length === 0 ? (
        <p
          className="px-1 py-6 text-center text-xs"
          style={{ color: "var(--color-accent)" }}
        >
          No icons match “{query}”.
        </p>
      ) : (
        <div className="grid max-h-60 grid-cols-6 gap-1 overflow-y-auto pr-0.5">
          {results.map(({ key, label }) => {
            const Cmp = iconComponent(key);
            if (!Cmp) return null;
            const selected = key === current;
            return (
              <button
                key={key}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={selected}
                // Don't blur before the click registers.
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(key)}
                className="flex aspect-square items-center justify-center rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_14%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
                style={{
                  background: selected
                    ? "color-mix(in srgb, var(--color-secondary) 16%, transparent)"
                    : "transparent",
                  color: selected
                    ? "var(--color-secondary-text)"
                    : "var(--color-fg)",
                }}
              >
                <Cmp size={20} color="currentColor" weight="Bold" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
