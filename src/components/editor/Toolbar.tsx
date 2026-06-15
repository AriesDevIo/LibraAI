"use client";

import { useEffect, useRef, useState } from "react";
import { TextBold, TextItalic, Palette } from "@solar-icons/react/ssr";
import {
  COLOR_SWATCHES,
  colorValue,
  type ColorKey,
  type TextMarks,
} from "./types";

interface ToolbarProps {
  /** Marks of the currently active text block, or null when none is active. */
  marks: TextMarks | null;
  /** True when the active block can't take text formatting (e.g. an image). */
  disabled: boolean;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onSetColor: (color: ColorKey) => void;
}

/**
 * Formatting toolbar. Acts on the block currently in focus — bold / italic and
 * a brand-palette text-color picker. Formatting is stored as flags + a color
 * KEY (never markup), keeping the document XSS-safe by construction.
 *
 * Buttons preventDefault on mousedown so clicking them never blurs the editor,
 * keeping the caret in place.
 */
export default function Toolbar({
  marks,
  disabled,
  onToggleBold,
  onToggleItalic,
  onSetColor,
}: ToolbarProps) {
  const [colorOpen, setColorOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close the color popover on outside click or Escape.
  useEffect(() => {
    if (!colorOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setColorOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setColorOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [colorOpen]);

  const activeColor: ColorKey = marks?.color ?? "default";

  const hold = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault(); // keep focus/caret in the editor
    fn();
  };

  const btnBase =
    "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div
      className="sticky top-0 z-20 flex items-center gap-1 rounded-xl px-1.5 py-1.5"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-surface-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      role="toolbar"
      aria-label="Text formatting"
    >
      <ToggleButton
        label="Bold"
        pressed={!!marks?.bold}
        disabled={disabled}
        onMouseDown={hold(onToggleBold)}
        className={btnBase}
      >
        <TextBold size={16} color="currentColor" weight="Bold" />
      </ToggleButton>

      <ToggleButton
        label="Italic"
        pressed={!!marks?.italic}
        disabled={disabled}
        onMouseDown={hold(onToggleItalic)}
        className={btnBase}
      >
        <TextItalic size={16} color="currentColor" weight="Bold" />
      </ToggleButton>

      <span
        className="mx-0.5 h-5 w-px shrink-0"
        style={{ background: "var(--color-surface-border)" }}
        aria-hidden="true"
      />

      {/* Color picker */}
      <div className="relative" ref={pickerRef}>
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="true"
          aria-expanded={colorOpen}
          aria-label="Text color"
          title="Text color"
          onMouseDown={(e) => {
            e.preventDefault();
            if (!disabled) setColorOpen((o) => !o);
          }}
          className={`${btnBase} gap-1`}
          style={{
            background: colorOpen
              ? "color-mix(in srgb, var(--color-secondary) 16%, transparent)"
              : "transparent",
            color: "var(--color-fg)",
          }}
        >
          <Palette
            size={16}
            color={colorValue(activeColor)}
            weight="Bold"
          />
        </button>

        {colorOpen && (
          <div
            className="absolute left-0 top-full z-30 mt-1.5 w-44 rounded-xl p-2 shadow-2xl"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-surface-border)",
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <p
              className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              Text color
            </p>
            <div className="grid grid-cols-4 gap-1">
              {COLOR_SWATCHES.map(({ key, label }) => {
                const selected = key === activeColor;
                return (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={selected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onSetColor(key);
                      setColorOpen(false);
                    }}
                    className="flex h-9 items-center justify-center rounded-lg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
                    style={{
                      border: selected
                        ? "2px solid var(--color-secondary)"
                        : "1px solid var(--color-surface-border)",
                    }}
                  >
                    <span
                      className="text-base font-bold leading-none"
                      style={{ color: colorValue(key) }}
                    >
                      A
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleButton({
  label,
  pressed,
  disabled,
  onMouseDown,
  className,
  children,
}: {
  label: string;
  pressed: boolean;
  disabled: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onMouseDown={onMouseDown}
      className={className}
      style={{
        background: pressed
          ? "color-mix(in srgb, var(--color-secondary) 18%, transparent)"
          : "transparent",
        color: pressed ? "var(--color-secondary-text)" : "var(--color-fg)",
      }}
    >
      {children}
    </button>
  );
}
