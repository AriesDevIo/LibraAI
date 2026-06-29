"use client";

import { useEffect, useRef, useState } from "react";
import {
  Notes,
  GalleryAdd,
  EmojiFunnySquare,
  Palette,
  Copy,
  AltArrowUp,
  AltArrowDown,
  TrashBinMinimalistic,
  Restart,
} from "@solar-icons/react/ssr";
import { COLOR_SWATCHES, EMOJI_PALETTE, colorValue, type ColorKey } from "./types";

type Menu = "color" | "emoji" | null;

interface ToolbarProps {
  hasSelection: boolean;
  /** Colour of the selected object, or the default colour for new notes. */
  currentColor: ColorKey;
  onAddText: () => void;
  onAddImage: () => void;
  onAddIcon: (emoji: string) => void;
  onPickColor: (color: ColorKey) => void;
  onDuplicate: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDeleteSelected: () => void;
  onResetView: () => void;
}

/**
 * Floating canvas toolbar — add notes / images / emoji icons, recolour (brand
 * palette), duplicate, reorder (front/back), delete, and reset the pan.
 */
export default function Toolbar({
  hasSelection,
  currentColor,
  onAddText,
  onAddImage,
  onAddIcon,
  onPickColor,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onDeleteSelected,
  onResetView,
}: ToolbarProps) {
  const [menu, setMenu] = useState<Menu>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const btnBase =
    "flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] disabled:opacity-40 disabled:cursor-not-allowed";
  const fg = { color: "var(--color-fg)" };

  return (
    <div
      ref={rootRef}
      className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-2xl p-1.5 shadow-lg"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-surface-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      role="toolbar"
      aria-label="Canvas tools"
    >
      <button type="button" onClick={onAddText} className={btnBase} style={fg} title="Add a text note">
        <Notes size={17} color="currentColor" weight="Bold" />
        <span className="hidden sm:inline">Note</span>
      </button>

      <button type="button" onClick={onAddImage} className={btnBase} style={fg} title="Add an image">
        <GalleryAdd size={17} color="currentColor" weight="Bold" />
        <span className="hidden sm:inline">Image</span>
      </button>

      {/* Emoji / icon palette */}
      <div className="relative">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={menu === "emoji"}
          onClick={() => setMenu((m) => (m === "emoji" ? null : "emoji"))}
          className={btnBase}
          style={{
            ...fg,
            background:
              menu === "emoji"
                ? "color-mix(in srgb, var(--color-secondary) 16%, transparent)"
                : "transparent",
          }}
          title="Add an emoji / icon"
        >
          <EmojiFunnySquare size={17} color="currentColor" weight="Bold" />
          <span className="hidden sm:inline">Icon</span>
        </button>
        {menu === "emoji" && (
          <Popover>
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>
              Add icon
            </p>
            <div className="grid grid-cols-4 gap-1">
              {EMOJI_PALETTE.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  aria-label={`Add ${emoji}`}
                  onClick={() => {
                    onAddIcon(emoji);
                    setMenu(null);
                  }}
                  className="flex h-9 items-center justify-center rounded-lg text-xl transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
                  style={{ border: "1px solid var(--color-surface-border)" }}
                >
                  <span aria-hidden="true">{emoji}</span>
                </button>
              ))}
            </div>
          </Popover>
        )}
      </div>

      <Divider />

      {/* Colour picker */}
      <div className="relative">
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={menu === "color"}
          aria-label="Pick colour"
          title={hasSelection ? "Recolour selection" : "Colour for new objects"}
          onClick={() => setMenu((m) => (m === "color" ? null : "color"))}
          className={`${btnBase} px-2`}
          style={{
            ...fg,
            background:
              menu === "color"
                ? "color-mix(in srgb, var(--color-secondary) 16%, transparent)"
                : "transparent",
          }}
        >
          <Palette size={17} color={colorValue(currentColor)} weight="Bold" />
        </button>
        {menu === "color" && (
          <Popover>
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>
              {hasSelection ? "Recolour" : "New object colour"}
            </p>
            <div className="grid grid-cols-4 gap-1">
              {COLOR_SWATCHES.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  title={label}
                  aria-label={label}
                  aria-pressed={key === currentColor}
                  onClick={() => {
                    onPickColor(key);
                    setMenu(null);
                  }}
                  className="flex h-9 items-center justify-center rounded-lg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
                  style={{
                    border:
                      key === currentColor
                        ? "2px solid var(--color-secondary)"
                        : "1px solid var(--color-surface-border)",
                  }}
                >
                  <span className="h-4 w-4 rounded-full" style={{ background: colorValue(key) }} />
                </button>
              ))}
            </div>
          </Popover>
        )}
      </div>

      <button type="button" onClick={onDuplicate} disabled={!hasSelection} className={`${btnBase} px-2`} style={fg} title="Duplicate (⌘D)" aria-label="Duplicate selected">
        <Copy size={16} color="currentColor" weight="Bold" />
      </button>
      <button type="button" onClick={onBringToFront} disabled={!hasSelection} className={`${btnBase} px-2`} style={fg} title="Bring to front" aria-label="Bring selected to front">
        <AltArrowUp size={16} color="currentColor" weight="Bold" />
      </button>
      <button type="button" onClick={onSendToBack} disabled={!hasSelection} className={`${btnBase} px-2`} style={fg} title="Send to back" aria-label="Send selected to back">
        <AltArrowDown size={16} color="currentColor" weight="Bold" />
      </button>
      <button type="button" onClick={onDeleteSelected} disabled={!hasSelection} className={`${btnBase} px-2`} style={{ color: "var(--color-secondary-text)" }} title="Delete selected" aria-label="Delete selected object">
        <TrashBinMinimalistic size={17} color="currentColor" weight="Bold" />
      </button>

      <Divider />

      <button type="button" onClick={onResetView} className={`${btnBase} px-2`} style={fg} title="Reset view" aria-label="Reset view to origin">
        <Restart size={17} color="currentColor" weight="Bold" />
      </button>
    </div>
  );
}

function Popover({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="absolute left-0 top-full z-30 mt-2 w-44 rounded-xl p-2 shadow-2xl"
      style={{ background: "var(--color-bg)", border: "1px solid var(--color-surface-border)" }}
    >
      {children}
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
