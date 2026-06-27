"use client";

import { useEffect, useRef, useState } from "react";
import { TextBold, TextItalic, TextUnderline, Code } from "@solar-icons/react/ssr";
import {
  COLOR_SWATCHES,
  FONT_OPTIONS,
  SIZE_OPTIONS,
  colorValue,
  fontValue,
  type ColorKey,
  type FontKey,
  type SizeKey,
  type TextMarks,
} from "./types";

type Menu = "color" | "font" | "size" | null;

interface ToolbarProps {
  /** Marks of the currently active text block, or null when none is active. */
  marks: TextMarks | null;
  /** True when the active block can't take text formatting (e.g. an image). */
  disabled: boolean;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
  onToggleStrike: () => void;
  onToggleCode: () => void;
  onSetColor: (color: ColorKey) => void;
  onSetFont: (font: FontKey) => void;
  onSetSize: (size: SizeKey) => void;
}

/**
 * Formatting toolbar. Acts on the block currently in focus — bold / italic /
 * underline / strikethrough / inline-code, a brand-palette text-color picker,
 * and font family + size pickers. Every choice is stored as a flag or a closed
 * SET KEY (never markup / raw CSS), keeping the document XSS-safe by design.
 *
 * Buttons preventDefault on mousedown so clicking them never blurs the editor,
 * keeping the caret in place.
 */
export default function Toolbar({
  marks,
  disabled,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleStrike,
  onToggleCode,
  onSetColor,
  onSetFont,
  onSetSize,
}: ToolbarProps) {
  const [menu, setMenu] = useState<Menu>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close any open popover on outside click or Escape.
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

  const activeColor: ColorKey = marks?.color ?? "default";
  const activeFont: FontKey = marks?.font ?? "default";
  const activeSize: SizeKey = marks?.size ?? "default";

  const hold = (fn: () => void) => (e: React.MouseEvent) => {
    e.preventDefault(); // keep focus/caret in the editor
    fn();
  };
  const toggleMenu = (m: Menu) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) setMenu((cur) => (cur === m ? null : m));
  };

  const btnBase =
    "flex h-8 items-center justify-center rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
  const iconBtn = `${btnBase} w-8`;

  return (
    <div
      ref={rootRef}
      className="sticky top-0 z-20 flex flex-wrap items-center gap-1 rounded-xl px-1.5 py-1.5"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-surface-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      role="toolbar"
      aria-label="Text formatting"
    >
      <ToggleButton label="Bold" pressed={!!marks?.bold} disabled={disabled} onMouseDown={hold(onToggleBold)} className={iconBtn}>
        <TextBold size={16} color="currentColor" weight="Bold" />
      </ToggleButton>
      <ToggleButton label="Italic" pressed={!!marks?.italic} disabled={disabled} onMouseDown={hold(onToggleItalic)} className={iconBtn}>
        <TextItalic size={16} color="currentColor" weight="Bold" />
      </ToggleButton>
      <ToggleButton label="Underline" pressed={!!marks?.underline} disabled={disabled} onMouseDown={hold(onToggleUnderline)} className={iconBtn}>
        <TextUnderline size={16} color="currentColor" weight="Bold" />
      </ToggleButton>
      <ToggleButton label="Strikethrough" pressed={!!marks?.strike} disabled={disabled} onMouseDown={hold(onToggleStrike)} className={iconBtn}>
        <span className="text-sm font-bold leading-none" style={{ textDecorationLine: "line-through" }}>
          S
        </span>
      </ToggleButton>
      <ToggleButton label="Inline code" pressed={!!marks?.code} disabled={disabled} onMouseDown={hold(onToggleCode)} className={iconBtn}>
        <Code size={16} color="currentColor" weight="Bold" />
      </ToggleButton>

      <Divider />

      {/* Font family */}
      <div className="relative">
        <MenuButton
          label="Font family"
          open={menu === "font"}
          disabled={disabled}
          onMouseDown={toggleMenu("font")}
          className={`${btnBase} gap-1 px-2 text-xs font-semibold`}
        >
          <span style={{ fontFamily: fontValue(activeFont) }}>
            {FONT_OPTIONS.find((f) => f.key === activeFont)?.label ?? "Sans"}
          </span>
          <Caret />
        </MenuButton>
        {menu === "font" && (
          <Popover>
            {FONT_OPTIONS.map((f) => (
              <OptionRow
                key={f.key}
                selected={f.key === activeFont}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSetFont(f.key);
                  setMenu(null);
                }}
              >
                <span style={{ fontFamily: fontValue(f.key) }}>{f.label}</span>
              </OptionRow>
            ))}
          </Popover>
        )}
      </div>

      {/* Font size */}
      <div className="relative">
        <MenuButton
          label="Font size"
          open={menu === "size"}
          disabled={disabled}
          onMouseDown={toggleMenu("size")}
          className={`${btnBase} gap-1 px-2 text-xs font-semibold`}
        >
          <span>{SIZE_OPTIONS.find((s) => s.key === activeSize)?.label ?? "Default"}</span>
          <Caret />
        </MenuButton>
        {menu === "size" && (
          <Popover>
            {SIZE_OPTIONS.map((s) => (
              <OptionRow
                key={s.key}
                selected={s.key === activeSize}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSetSize(s.key);
                  setMenu(null);
                }}
              >
                {s.label}
              </OptionRow>
            ))}
          </Popover>
        )}
      </div>

      <Divider />

      {/* Color picker */}
      <div className="relative">
        <MenuButton
          label="Text color"
          open={menu === "color"}
          disabled={disabled}
          onMouseDown={toggleMenu("color")}
          className={`${iconBtn}`}
        >
          <span className="text-base font-bold leading-none" style={{ color: colorValue(activeColor) }}>
            A
          </span>
        </MenuButton>
        {menu === "color" && (
          <Popover width="w-44">
            <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--color-accent)" }}>
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
                      setMenu(null);
                    }}
                    className="flex h-9 items-center justify-center rounded-lg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
                    style={{
                      border: selected
                        ? "2px solid var(--color-secondary)"
                        : "1px solid var(--color-surface-border)",
                    }}
                  >
                    <span className="text-base font-bold leading-none" style={{ color: colorValue(key) }}>
                      A
                    </span>
                  </button>
                );
              })}
            </div>
          </Popover>
        )}
      </div>
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

function Caret() {
  return (
    <span aria-hidden="true" className="text-[9px] opacity-60">
      ▾
    </span>
  );
}

function Popover({
  children,
  width = "w-36",
}: {
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div
      className={`absolute left-0 top-full z-30 mt-1.5 ${width} rounded-xl p-2 shadow-2xl`}
      style={{ background: "var(--color-bg)", border: "1px solid var(--color-surface-border)" }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
}

function OptionRow({
  selected,
  onMouseDown,
  children,
}: {
  selected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onMouseDown={onMouseDown}
      className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_12%,transparent)]"
      style={{ color: selected ? "var(--color-secondary-text)" : "var(--color-fg)" }}
    >
      {children}
      {selected && <span className="text-xs">✓</span>}
    </button>
  );
}

function MenuButton({
  label,
  open,
  disabled,
  onMouseDown,
  className,
  children,
}: {
  label: string;
  open: boolean;
  disabled: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-haspopup="true"
      aria-expanded={open}
      aria-label={label}
      title={label}
      onMouseDown={onMouseDown}
      className={className}
      style={{
        background: open
          ? "color-mix(in srgb, var(--color-secondary) 16%, transparent)"
          : "transparent",
        color: "var(--color-fg)",
      }}
    >
      {children}
    </button>
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
