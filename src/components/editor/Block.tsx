"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  AltArrowUp,
  AltArrowDown,
  TrashBinMinimalistic,
  GalleryMinimalistic,
  LinkMinimalistic,
  DangerTriangle,
  Lightbulb,
} from "@solar-icons/react/ssr";
import {
  colorValue,
  fontValue,
  sizeValue,
  isTextBlock,
  isSafeImageUrl,
  FONT_VALUES,
  type Block as BlockModel,
} from "./types";
import { uploadImage } from "@/lib/uploads";

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
  onToggleCheck: (id: string) => void;
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
  todo: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.6 },
  quote: { fontSize: "1.05rem", fontWeight: 400, lineHeight: 1.6 },
  callout: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.6 },
  code: { fontSize: "0.9rem", fontWeight: 400, lineHeight: 1.5 },
};

const PLACEHOLDER: Record<string, string> = {
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  paragraph: "Write something, or press “/” for blocks",
  bulleted: "List item",
  numbered: "List item",
  todo: "To-do",
  quote: "Quote",
  callout: "Callout",
  code: "Code",
};

export default function Block({
  block,
  listNumber,
  isFirst,
  isLast,
  registerRef,
  onChangeText,
  onImagePatch,
  onToggleCheck,
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
  }, [block.text, block.type, block.marks]);

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
        {block.type === "divider" ? (
          <DividerSurface />
        ) : text ? (
          <TextSurface
            block={block}
            listNumber={listNumber}
            textRef={textRef}
            registerRef={registerRef}
            onChangeText={onChangeText}
            onToggleCheck={onToggleCheck}
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
        <GutterButton label="Delete block" onClick={() => onDelete(block.id)}>
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

/* ── Divider ──────────────────────────────────────────────────────────────── */

function DividerSurface() {
  return (
    <div className="py-3" aria-hidden="true">
      <hr
        className="border-0"
        style={{ height: 1, background: "var(--color-surface-border)" }}
      />
    </div>
  );
}

/* ── Text blocks (headings, paragraph, lists, todo, quote, callout, code) ───── */

function TextSurface({
  block,
  listNumber,
  textRef,
  registerRef,
  onChangeText,
  onToggleCheck,
  onKeyDown,
  onFocus,
}: {
  block: BlockModel;
  listNumber?: number;
  textRef: React.RefObject<HTMLTextAreaElement | null>;
  registerRef: BlockProps["registerRef"];
  onChangeText: BlockProps["onChangeText"];
  onToggleCheck: BlockProps["onToggleCheck"];
  onKeyDown: BlockProps["onKeyDown"];
  onFocus: BlockProps["onFocus"];
}) {
  const base = TYPE_STYLE[block.type] ?? TYPE_STYLE.paragraph;
  const m = block.marks;
  const heading = block.type === "h1" || block.type === "h2" || block.type === "h3";
  const mono = m.code || block.type === "code";
  const checked = block.type === "todo" && !!block.checked;

  // Underline + strikethrough combine into one decoration value.
  const decos: string[] = [];
  if (m.underline) decos.push("underline");
  if (m.strike || checked) decos.push("line-through");

  // Every value here is whitelist-resolved — never raw user CSS.
  const style: CSSProperties = {
    ...base,
    fontWeight: m.bold ? (heading ? 800 : 700) : base.fontWeight,
    fontStyle: m.italic || block.type === "quote" ? "italic" : "normal",
    color: colorValue(m.color),
    fontFamily: mono ? FONT_VALUES.mono : fontValue(m.font),
    fontSize: sizeValue(m.size) ?? base.fontSize,
    textDecorationLine: decos.length ? decos.join(" ") : undefined,
    opacity: checked ? 0.55 : undefined,
  };

  const textarea = (
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
  );

  // Leading marker for list / todo blocks.
  const marker =
    block.type === "bulleted" ? (
      <span aria-hidden="true" className="select-none" style={{ ...base, color: "var(--color-accent)" }}>
        •
      </span>
    ) : block.type === "numbered" ? (
      <span
        aria-hidden="true"
        className="select-none tabular-nums"
        style={{ ...base, color: "var(--color-accent)" }}
      >
        {listNumber ?? 1}.
      </span>
    ) : block.type === "todo" ? (
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={checked ? "Mark as not done" : "Mark as done"}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onToggleCheck(block.id)}
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors"
        style={{
          background: checked ? "var(--color-secondary)" : "transparent",
          border: checked ? "none" : "1.5px solid var(--color-surface-border)",
          color: "white",
          fontSize: "0.8rem",
          lineHeight: 1,
        }}
      >
        {checked ? "✓" : null}
      </button>
    ) : null;

  const row = (
    <div className="flex items-start gap-2">
      {marker}
      {textarea}
    </div>
  );

  // Container styling for quote / callout / code.
  if (block.type === "quote") {
    return (
      <div
        className="my-1 rounded-r-lg py-1 pl-3.5"
        style={{ borderLeft: "3px solid var(--color-secondary)" }}
      >
        {row}
      </div>
    );
  }

  if (block.type === "callout") {
    const accent =
      m.color === "default" ? "var(--color-secondary)" : colorValue(m.color);
    return (
      <div
        className="my-1 flex items-start gap-2.5 rounded-xl px-3.5 py-3"
        style={{
          background: `color-mix(in srgb, ${accent} 10%, var(--color-bg))`,
          border: `1px solid color-mix(in srgb, ${accent} 28%, transparent)`,
        }}
      >
        <span className="mt-0.5 shrink-0" aria-hidden="true">
          <Lightbulb size={18} color={accent} weight="Bold" />
        </span>
        <div className="min-w-0 flex-1">{textarea}</div>
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <pre
        className="my-1 overflow-x-auto rounded-xl px-3.5 py-3"
        style={{
          background: "color-mix(in srgb, var(--color-fg) 6%, var(--color-bg))",
          border: "1px solid var(--color-surface-border)",
        }}
      >
        {textarea}
      </pre>
    );
  }

  // Inline-code mark on a normal block gets a faint tinted strip.
  if (m.code) {
    return (
      <div
        className="my-0.5 rounded-md px-2 py-1"
        style={{ background: "color-mix(in srgb, var(--color-fg) 6%, transparent)" }}
      >
        {row}
      </div>
    );
  }

  return row;
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
  const [uploading, setUploading] = useState(false);
  const [upErr, setUpErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setUpErr(null);
    setUploading(true);
    const res = await uploadImage(file);
    setUploading(false);
    if ("url" in res) {
      const caption = block.alt || file.name.replace(/\.[^.]+$/, "");
      onImagePatch(block.id, { src: res.url, alt: caption });
    } else {
      setUpErr(res.error);
    }
  }

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
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileRef.current?.click();
            }
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl px-4 py-8 text-center transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_6%,transparent)]"
          style={{
            background: "var(--color-surface)",
            border: "1px dashed var(--color-surface-border)",
          }}
        >
          <GalleryMinimalistic size={26} color="var(--color-accent)" weight="Bold" />
          <span className="text-sm" style={{ color: "var(--color-accent)" }}>
            {uploading
              ? "Uploading…"
              : "Drag an image here, or click to upload — or paste a URL below"}
          </span>
        </div>
      )}

      {/* Hidden file input for upload (click + drag-drop both route here). */}
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = ""; // allow re-selecting the same file
        }}
      />

      {/* URL field + Upload button */}
      <div className="flex items-center gap-2">
        <label
          className="flex flex-1 items-center gap-2 rounded-lg px-2.5 py-1.5"
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
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
          style={{
            background: "color-mix(in srgb, var(--color-secondary) 12%, transparent)",
            color: "var(--color-secondary-text)",
          }}
        >
          <GalleryMinimalistic size={14} color="currentColor" weight="Bold" />
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>

      {upErr && (
        <p
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "var(--color-secondary-text)" }}
        >
          <DangerTriangle size={13} color="currentColor" weight="Bold" />
          {upErr}
        </p>
      )}

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
