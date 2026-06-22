"use client";

import { useState } from "react";
import { TrashBinMinimalistic, GalleryMinimalistic } from "@solar-icons/react/ssr";
import { type CanvasObject, colorValue, isSafeImageUrl } from "./types";

interface CanvasObjectViewProps {
  obj: CanvasObject;
  selected: boolean;
  editing: boolean;
  onRequestEdit: (id: string) => void;
  onChangeText: (id: string, text: string) => void;
  onCommitEdit: () => void;
  onDelete: (id: string) => void;
}

/**
 * Renders one canvas object (text note or image block) at its world position.
 *
 * Drag / select / resize are driven by the parent <Canvas> via the
 * `data-object-id` and `data-resize-handle` attributes (the parent owns pointer
 * capture), so this component only handles its own text editing + delete.
 *
 * XSS: text is rendered as a React text node or controlled textarea value;
 * image `src` is re-validated here and rendered via a plain <img>. Nothing is
 * ever passed to dangerouslySetInnerHTML.
 */
export default function CanvasObjectView({
  obj,
  selected,
  editing,
  onRequestEdit,
  onChangeText,
  onCommitEdit,
  onDelete,
}: CanvasObjectViewProps) {
  const accent = colorValue(obj.color);

  const positioning: React.CSSProperties = {
    position: "absolute",
    left: obj.x,
    top: obj.y,
    width: obj.width,
    height: obj.height,
    // Selection ring uses outline so it doesn't affect layout/size.
    outline: selected ? "2px solid var(--color-secondary)" : "none",
    outlineOffset: 2,
    borderRadius: 12,
    touchAction: "none",
    // Keep the active object (and its handles) above its neighbours.
    zIndex: selected ? 30 : 10,
  };

  return (
    <div
      data-object-id={obj.id}
      role="group"
      aria-label={
        obj.type === "text"
          ? `Text note${obj.text ? `: ${obj.text}` : " (empty)"}`
          : `Image${obj.alt ? `: ${obj.alt}` : ""}`
      }
      tabIndex={-1}
      onDoubleClick={
        obj.type === "text" ? () => onRequestEdit(obj.id) : undefined
      }
      style={positioning}
      className="group select-none"
    >
      {obj.type === "text" ? (
        <TextBody
          obj={obj}
          accent={accent}
          editing={editing}
          onChangeText={onChangeText}
          onCommitEdit={onCommitEdit}
        />
      ) : (
        <ImageBody obj={obj} accent={accent} />
      )}

      {selected && (
        <>
          {/* Delete — stops the pointer gesture so clicking it doesn't drag. */}
          <button
            type="button"
            aria-label="Delete object"
            title="Delete"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(obj.id)}
            className="absolute -right-3 -top-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full shadow-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-surface-border)",
              color: "var(--color-secondary-text)",
            }}
          >
            <TrashBinMinimalistic size={15} color="currentColor" weight="Bold" />
          </button>

          {/* Resize handle — must bubble so <Canvas> can start the resize. */}
          <span
            data-resize-handle={obj.id}
            aria-hidden="true"
            title="Drag to resize"
            className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rounded-sm"
            style={{
              cursor: "nwse-resize",
              background: "var(--color-bg)",
              border: `2px solid ${accent}`,
            }}
          />
        </>
      )}
    </div>
  );
}

function TextBody({
  obj,
  accent,
  editing,
  onChangeText,
  onCommitEdit,
}: {
  obj: CanvasObject & { type: "text" };
  accent: string;
  editing: boolean;
  onChangeText: (id: string, text: string) => void;
  onCommitEdit: () => void;
}) {
  const surface: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    background: `color-mix(in srgb, ${accent} 12%, var(--color-bg))`,
    border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`,
    boxShadow: "0 6px 20px -8px color-mix(in srgb, var(--color-fg) 30%, transparent)",
    color: "var(--color-fg)",
    overflow: "hidden",
  };

  if (editing) {
    return (
      <div style={surface}>
        <textarea
          autoFocus
          value={obj.text}
          onChange={(e) => onChangeText(obj.id, e.target.value)}
          onBlur={onCommitEdit}
          // Keep keystrokes (incl. Enter for newlines) inside the note; Escape
          // commits. stopPropagation prevents the canvas delete/move shortcuts.
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Escape") {
              e.preventDefault();
              (e.target as HTMLTextAreaElement).blur();
            }
          }}
          // Let the caret be placed without the parent starting a drag.
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="Type a note…"
          className="h-full w-full resize-none bg-transparent p-2.5 text-sm leading-snug outline-none"
          style={{ color: "var(--color-fg)" }}
          aria-label="Note text"
        />
      </div>
    );
  }

  return (
    <div style={surface} className="cursor-grab active:cursor-grabbing">
      {obj.text ? (
        <p className="h-full w-full overflow-hidden whitespace-pre-wrap break-words p-2.5 text-sm leading-snug">
          {obj.text}
        </p>
      ) : (
        <p
          className="flex h-full w-full items-center justify-center p-2.5 text-center text-xs"
          style={{ color: "var(--color-accent)" }}
        >
          Double-click to edit
        </p>
      )}
    </div>
  );
}

function ImageBody({
  obj,
  accent,
}: {
  obj: CanvasObject & { type: "image" };
  accent: string;
}) {
  const [errored, setErrored] = useState(false);
  // Defensive re-validation: even if state were tampered, an unsafe URL renders
  // the fallback instead of reaching the <img> src.
  const safe = isSafeImageUrl(obj.src);

  const frame: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    overflow: "hidden",
    border: `2px solid color-mix(in srgb, ${accent} 55%, transparent)`,
    background: "var(--color-surface)",
    boxShadow: "0 6px 20px -8px color-mix(in srgb, var(--color-fg) 30%, transparent)",
  };

  if (!safe || errored) {
    return (
      <div
        style={frame}
        className="flex cursor-grab flex-col items-center justify-center gap-1.5 p-3 text-center active:cursor-grabbing"
      >
        <GalleryMinimalistic
          size={22}
          color="var(--color-accent)"
          weight="Bold"
        />
        <span className="text-xs" style={{ color: "var(--color-accent)" }}>
          {safe ? "Image unavailable" : "Invalid image URL"}
        </span>
      </div>
    );
  }

  return (
    <div style={frame} className="cursor-grab active:cursor-grabbing">
      {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary user
          URLs can't use next/image's domain allow-list; a plain validated <img>
          is the XSS-safe choice here. */}
      <img
        src={obj.src}
        alt={obj.alt}
        draggable={false}
        referrerPolicy="no-referrer"
        onError={() => setErrored(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
