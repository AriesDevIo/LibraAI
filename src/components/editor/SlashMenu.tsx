"use client";

import {
  Text,
  List,
  GalleryMinimalistic,
  CheckSquare,
  Lightbulb,
  Code,
} from "@solar-icons/react/ssr";
import type { BlockType, BlockTypeMeta } from "./types";

/** Icon (or text glyph) for each block type, shown in the menu row. */
function TypeIcon({ meta }: { meta: BlockTypeMeta }) {
  if (meta.glyph) {
    return (
      <span className="text-[11px] font-extrabold leading-none tracking-tight">
        {meta.glyph}
      </span>
    );
  }
  const common = { size: 16, color: "currentColor", weight: "Bold" as const };
  switch (meta.type) {
    case "bulleted":
      return <List {...common} />;
    case "image":
      return <GalleryMinimalistic {...common} />;
    case "todo":
      return <CheckSquare {...common} />;
    case "callout":
      return <Lightbulb {...common} />;
    case "code":
      return <Code {...common} />;
    default:
      return <Text {...common} />;
  }
}

interface SlashMenuProps {
  items: BlockTypeMeta[];
  activeIndex: number;
  onSelect: (type: BlockType) => void;
  onHover: (index: number) => void;
}

/**
 * The "/" insert menu. Purely presentational + controlled — keyboard navigation
 * (↑/↓/Enter/Esc) is owned by BlockEditor, which keeps `activeIndex` in sync.
 * Positioned by its parent (rendered inside a `relative` anchor in Block).
 */
export default function SlashMenu({
  items,
  activeIndex,
  onSelect,
  onHover,
}: SlashMenuProps) {
  return (
    <div
      role="listbox"
      aria-label="Insert block"
      className="absolute left-0 top-full z-30 mt-1 w-64 overflow-hidden rounded-xl py-1.5 shadow-2xl"
      style={{
        background: "var(--color-bg)",
        border: "1px solid var(--color-surface-border)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      // Keep focus in the textarea; clicking a row shouldn't blur it.
      onMouseDown={(e) => e.preventDefault()}
    >
      {items.length === 0 ? (
        <p
          className="px-3 py-2 text-xs"
          style={{ color: "var(--color-accent)" }}
        >
          No blocks match.
        </p>
      ) : (
        items.map((meta, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={meta.type}
              type="button"
              role="option"
              aria-selected={active}
              onClick={() => onSelect(meta.type)}
              onMouseEnter={() => onHover(i)}
              className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left transition-colors"
              style={{
                background: active
                  ? "color-mix(in srgb, var(--color-secondary) 14%, transparent)"
                  : "transparent",
              }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-surface-border)",
                  color: active
                    ? "var(--color-secondary-text)"
                    : "var(--color-fg)",
                }}
              >
                <TypeIcon meta={meta} />
              </span>
              <span className="min-w-0">
                <span
                  className="block text-[13px] font-semibold leading-tight"
                  style={{
                    color: active
                      ? "var(--color-secondary-text)"
                      : "var(--color-fg)",
                  }}
                >
                  {meta.label}
                </span>
                <span
                  className="block truncate text-[11px]"
                  style={{ color: "var(--color-accent)" }}
                >
                  {meta.description}
                </span>
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}
