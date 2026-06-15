"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import {
  AltArrowUp,
  AltArrowDown,
  TrashBinMinimalistic,
  GalleryMinimalistic,
  LinkMinimalistic,
  DangerTriangle,
} from "@solar-icons/react/ssr";
import {
  colorValue,
  isSafeImageUrl,
  isTextBlock,
  type Block as BlockModel,
} from "./types";

interface BlockProps {
  block: BlockModel;
  /** 1-based position within its run of numbered-list blocks (if applicable). */
  listNumber?: number;
  isFirst: boolean;
  isLast: boolean;
  registerRef: (
    id: string,
    el: HTMLTextAreaElement | HTMLInputElement | null,
  ) => void;
  onChangeText: (id: string, text: string) => void;
  onImagePatch: (id: string, patch: { src?: string; alt?: string }) => void;
  onKeyDown: (id: string, e: React.KeyboardEvent) => void;
  onFocus: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  /** Slash menu panel, injected by the editor only for the active block. */
  slashMenu?: React.ReactNode;
}

/** Per-type base typography for the text surface. Marks layer on top. */
const TYPE_STYLE: Record<string, CSSProperties> = {
  h1: { fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.2 },
  h2: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.25 },
  h3: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.3 },
  paragraph: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.6 },
  bulleted: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.6 },
  numbered: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.6 },
};

const PLACEHOLDER: Record<string, string> = {
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  paragraph: "Write something, or press “/” for blocks",
  bulleted: "List item",
  numbered: "List item",
};

export default function Block({
  block,
  listNumber,
  isFirst,
  isLast,
  registerRef,
  onChangeText,
  onImagePatch,
  onKeyDown,
  onFocus,
  onMoveUp,
  onMoveDown,
  onDelete,
  slashMenu,
}: BlockProps) {
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow the textarea to fit its content (no inner scrollbar).
  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [block.text, block.type, block.marks.bold, block.marks.italic]);

  const text = isTextBlock(block.type);

  return (
    <div className="group relative flex items-start gap-1">
      {/* Left gutter: reorder controls (appear on hover / keyboard focus). */}
      <div
        className="flex flex-col items-center pt-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
        aria-hidden={false}
      >
        <GutterButton
          label="Move block up"
          disabled={isFirst}
          onClick={() => onMoveUp(block.id)}
        >
          <AltArrowUp size={14} color="currentColor" weight="Bold" />
        </GutterButton>
        <GutterButton
          label="Move block down"
          disabled={isLast}
          onClick={() => onMoveDown(block.id)}
        >
          <AltArrowDown size={14} color="currentColor" weight="Bold" />
        </GutterButton>
      </div>

      {/* Block content */}
      <div className="relative min-w-0 flex-1">
        {text ? (
          <TextSurface
            block={block}
            listNumber={listNumber}
            textRef={textRef}
            registerRef={registerRef}
            onChangeText={onChangeText}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
          />
        ) : (
          <ImageSurface
            block={block}
            registerRef={registerRef}
            onImagePatch={onImagePatch}
            onFocus={onFocus}
          />
        )}

        {/* Slash menu anchors to the block content. */}
        {slashMenu}
      </div>

      {/* Delete control */}
      <div className="pt-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <GutterButton
          label="Delete block"
          onClick={() => onDelete(block.id)}
        >
          <TrashBinMinimalistic size={14} color="currentColor" weight="Bold" />
        </GutterButton>
      </div>
    </div>
  );
}

function GutterButton({
  label,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      // Don't steal focus from the editor when clicking a control.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_16%,transparent)] disabled:opacity-30 disabled:cursor-not-allowed"
      style={{ color: "var(--color-accent)" }}
    >
      {children}
    </button>
  );
}

/* ── Text blocks (headings, paragraph, list items) ────────────────────────── */

function TextSurface({
  block,
  listNumber,
  textRef,
  registerRef,
  onChangeText,
  onKeyDown,
  onFocus,
}: {
  block: BlockModel;
  listNumber?: number;
  textRef: React.RefObject<HTMLTextAreaElement | null>;
  registerRef: BlockProps["registerRef"];
  onChangeText: BlockProps["onChangeText"];
  onKeyDown: BlockProps["onKeyDown"];
  onFocus: BlockProps["onFocus"];
}) {
  const base = TYPE_STYLE[block.type] ?? TYPE_STYLE.paragraph;
  const heading = block.type === "h1" || block.type === "h2" || block.type === "h3";

  // Marks layer over the per-type base. color is resolved through the
  // whitelist so it can never be an arbitrary (injectable) CSS value.
  const style: CSSProperties = {
    ...base,
    fontWeight: block.marks.bold ? (heading ? 800 : 700) : base.fontWeight,
    fontStyle: block.marks.italic ? "italic" : "normal",
    color: colorValue(block.marks.color),
  };

  return (
    <div className="flex items-start gap-2">
      {block.type === "bulleted" && (
        <span
          aria-hidden="true"
          className="select-none"
          style={{ ...base, color: "var(--color-accent)" }}
        >
          •
        </span>
      )}
      {block.type === "numbered" && (
        <span
          aria-hidden="true"
          className="select-none tabular-nums"
          style={{ ...base, color: "var(--color-accent)" }}
        >
          {listNumber ?? 1}.
        </span>
      )}

      <textarea
        ref={(el) => {
          textRef.current = el;
          registerRef(block.id, el);
        }}
        // CONTROLLED plain-text field: the value is always a string and React
        // escapes it — typing `<script>…</script>` is shown literally, never run.
        value={block.text}
        rows={1}
        spellCheck
        placeholder={PLACEHOLDER[block.type]}
        onChange={(e) => onChangeText(block.id, e.target.value)}
        onKeyDown={(e) => onKeyDown(block.id, e)}
        onFocus={() => onFocus(block.id)}
        className="w-full resize-none overflow-hidden bg-transparent outline-none placeholder:opacity-40"
        style={style}
      />
    </div>
  );
}

/* ── Image blocks (image by URL) ──────────────────────────────────────────── */

function ImageSurface({
  block,
  registerRef,
  onImagePatch,
  onFocus,
}: {
  block: BlockModel;
  registerRef: BlockProps["registerRef"];
  onImagePatch: BlockProps["onImagePatch"];
  onFocus: BlockProps["onFocus"];
}) {
  const src = block.src ?? "";
  const safe = isSafeImageUrl(src);
  const invalid = src.trim().length > 0 && !safe;

  return (
    <div className="my-1 flex flex-col gap-2">
      {safe ? (
        // Only ever set src once it passes the http(s) whitelist — this blocks
        // javascript:/data: URL injection. alt is a plain (escaped) string.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={block.alt ?? ""}
          className="max-h-[420px] w-full rounded-xl object-cover"
          style={{ border: "1px solid var(--color-surface-border)" }}
        />
      ) : (
        <div
          className="flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-8 text-center"
          style={{
            background: "var(--color-surface)",
            border: "1px dashed var(--color-surface-border)",
          }}
        >
          <GalleryMinimalistic
            size={26}
            color="var(--color-accent)"
            weight="Bold"
          />
          <span className="text-sm" style={{ color: "var(--color-accent)" }}>
            Paste an image URL below
          </span>
        </div>
      )}

      {/* URL field */}
      <label className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-surface-border)",
        }}
      >
        <LinkMinimalistic size={15} color="var(--color-accent)" weight="Bold" />
        <input
          ref={(el) => registerRef(block.id, el)}
          type="url"
          inputMode="url"
          value={src}
          placeholder="https://example.com/image.jpg"
          onChange={(e) => onImagePatch(block.id, { src: e.target.value })}
          onFocus={() => onFocus(block.id)}
          className="w-full bg-transparent text-sm outline-none placeholder:opacity-40"
          style={{ color: "var(--color-fg)" }}
        />
      </label>

      {/* Alt text / caption */}
      <input
        type="text"
        value={block.alt ?? ""}
        placeholder="Alt text (describes the image for screen readers)"
        onChange={(e) => onImagePatch(block.id, { alt: e.target.value })}
        onFocus={() => onFocus(block.id)}
        className="w-full rounded-lg bg-transparent px-2.5 py-1.5 text-xs outline-none placeholder:opacity-40"
        style={{
          color: "var(--color-accent)",
          border: "1px solid var(--color-surface-border)",
        }}
      />

      {invalid && (
        <p
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--color-secondary-text)" }}
        >
          <DangerTriangle size={13} color="currentColor" weight="Bold" />
          Only http(s) image URLs are allowed.
        </p>
      )}
    </div>
  );
}
