"use client";

import { useEffect, useRef, useState } from "react";
import {
  Notes,
  GalleryAdd,
  Palette,
  TrashBinMinimalistic,
  Restart,
} from "@solar-icons/react/ssr";
import { COLOR_SWATCHES, colorValue, type ColorKey } from "./types";

interface ToolbarProps {
  hasSelection: boolean;
  /** Colour of the selected object, or the default colour for new notes. */
  currentColor: ColorKey;
  onAddText: () => void;
  onAddImage: () => void;
  onPickColor: (color: ColorKey) => void;
  onDeleteSelected: () => void;
  onResetView: () => void;
}

/**
 * Floating canvas toolbar — add objects, recolour (brand palette), delete the
 * selection, and reset the pan. Recolour applies to the selected object, or
 * sets the colour for the next note when nothing is selected.
 */
export default function Toolbar({
  hasSelection,
  currentColor,
  onAddText,
  onAddImage,
  onPickColor,
  onDeleteSelected,
  onResetView,
}: ToolbarProps) {
  const [colorOpen, setColorOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

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

  const btnBase =
    "flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div
      className="pointer-events-auto flex items-center gap-1 rounded-2xl p-1.5 shadow-lg"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-surface-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      role="toolbar"
      aria-label="Canvas tools"
    >
      <button
        type="button"
        onClick={onAddText}
        className={btnBase}
        style={{ color: "var(--color-fg)" }}
        title="Add a text note"
      >
        <Notes size={17} color="currentColor" weight="Bold" />
        <span className="hidden sm:inline">Note</span>
      </button>

      <button
        type="button"
        onClick={onAddImage}
        className={btnBase}
        style={{ color: "var(--color-fg)" }}
        title="Add an image by URL"
      >
        <GalleryAdd size={17} color="currentColor" weight="Bold" />
        <span className="hidden sm:inline">Image</span>
      </button>

      <Divider />

      {/* Colour picker */}
      <div className="relative" ref={pickerRef}>
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={colorOpen}
          aria-label="Pick colour"
          title={hasSelection ? "Recolour selection" : "Colour for new notes"}
          onClick={() => setColorOpen((o) => !o)}
          className={`${btnBase} px-2`}
          style={{
            background: colorOpen
              ? "color-mix(in srgb, var(--color-secondary) 16%, transparent)"
              : "transparent",
            color: "var(--color-fg)",
          }}
        >
          <Palette size={17} color={colorValue(currentColor)} weight="Bold" />
        </button>

        {colorOpen && (
          <div
            className="absolute left-0 top-full z-30 mt-2 w-44 rounded-xl p-2 shadow-2xl"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-surface-border)",
            }}
          >
            <p
              className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--color-accent)" }}
            >
              {hasSelection ? "Recolour note" : "New note colour"}
            </p>
            <div className="grid grid-cols-4 gap-1">
              {COLOR_SWATCHES.map(({ key, label }) => {
                const selected = key === currentColor;
                return (
                  <button
                    key={key}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={selected}
                    onClick={() => {
                      onPickColor(key);
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
                      className="h-4 w-4 rounded-full"
                      style={{ background: colorValue(key) }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onDeleteSelected}
        disabled={!hasSelection}
        className={`${btnBase} px-2`}
        style={{ color: "var(--color-secondary-text)" }}
        title="Delete selected"
        aria-label="Delete selected object"
      >
        <TrashBinMinimalistic size={17} color="currentColor" weight="Bold" />
      </button>

      <Divider />

      <button
        type="button"
        onClick={onResetView}
        className={`${btnBase} px-2`}
        style={{ color: "var(--color-fg)" }}
        title="Reset view"
        aria-label="Reset view to origin"
      >
        <Restart size={17} color="currentColor" weight="Bold" />
      </button>
    </div>
  );
}

function Divider() {
  return (
    <span
      className="mx-0.5 h-5 w-px shrink-0"
      style={{ background: "var(--color-surface-border)" }}
      aria-hidden="true"
    />
  );
}
