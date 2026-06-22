"use client";

import { useEffect, useRef, useState } from "react";
import Toolbar from "./Toolbar";
import CanvasObjectView from "./CanvasObjectView";
import ImageUrlDialog from "./ImageUrlDialog";
import {
  type CanvasObject,
  type ColorKey,
  createImageObject,
  createTextObject,
  DEFAULT_IMAGE_SIZE,
  DEFAULT_TEXT_SIZE,
  MIN_SIZE,
} from "./types";

/** Active pointer gesture, tracked in a ref so moves don't churn React state. */
type Gesture =
  | { kind: "pan"; startX: number; startY: number; origX: number; origY: number }
  | { kind: "drag"; id: string; startX: number; startY: number; origX: number; origY: number }
  | {
      kind: "resize";
      id: string;
      startX: number;
      startY: number;
      origW: number;
      origH: number;
    };

/**
 * Freeform canvas in local React state (no backend). Objects live in world
 * coordinates; a `camera` offset pans the whole world. Pointer Events drive
 * move / resize / pan (mouse + touch), with the container owning pointer capture
 * so gestures keep working even if the pointer leaves an element.
 */
export default function Canvas() {
  const [objects, setObjects] = useState<CanvasObject[]>(() => [
    createTextObject({
      x: 56,
      y: 44,
      color: "violet",
      width: 244,
      height: 140,
      text: "Welcome to your canvas ✨\n\nDrag me around. Double-click to edit my text.",
    }),
    createTextObject({
      x: 336,
      y: 150,
      color: "amber",
      width: 244,
      height: 150,
      text: "Add notes & images from the toolbar. Pick a colour, resize from the corner handle, press Delete to remove.",
    }),
    createTextObject({
      x: 120,
      y: 244,
      color: "teal",
      width: 224,
      height: 96,
      text: "Pan the canvas: drag an empty area, or scroll / two-finger swipe.",
    }),
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0 });
  const [defaultColor, setDefaultColor] = useState<ColorKey>("violet");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);

  const selected = objects.find((o) => o.id === selectedId) ?? null;
  const currentColor: ColorKey = selected?.color ?? defaultColor;

  // Wheel / trackpad panning. Attached natively so we can preventDefault
  // (React's onWheel is passive), keeping the page from doing anything.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCamera((c) => ({ x: c.x - e.deltaX, y: c.y - e.deltaY }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── Object mutations ──────────────────────────────────────────────
  function deleteObject(id: string) {
    setObjects((list) => list.filter((o) => o.id !== id));
    setSelectedId((s) => (s === id ? null : s));
    setEditingId((ed) => (ed === id ? null : ed));
  }

  function centerWorldPoint(w: number, h: number, index: number) {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width / 2 : 320;
    const cy = rect ? rect.height / 2 : 240;
    // Cascade successive additions so they don't stack exactly.
    const jitter = (index % 5) * 16;
    return {
      x: cx - camera.x - w / 2 + jitter,
      y: cy - camera.y - h / 2 + jitter,
    };
  }

  function addText() {
    const { width, height } = DEFAULT_TEXT_SIZE;
    const { x, y } = centerWorldPoint(width, height, objects.length);
    const obj = createTextObject({ x, y, color: defaultColor });
    setObjects((o) => [...o, obj]);
    setSelectedId(obj.id);
    setEditingId(obj.id);
  }

  function addImage(url: string, alt: string) {
    const { width, height } = DEFAULT_IMAGE_SIZE;
    const { x, y } = centerWorldPoint(width, height, objects.length);
    const obj = createImageObject(url, { x, y, alt, color: defaultColor });
    setObjects((o) => [...o, obj]);
    setSelectedId(obj.id);
  }

  function pickColor(color: ColorKey) {
    if (selectedId) {
      setObjects((list) =>
        list.map((o) => (o.id === selectedId ? { ...o, color } : o)),
      );
    } else {
      setDefaultColor(color);
    }
  }

  // ── Pointer gestures (container owns capture) ─────────────────────
  function onPointerDown(e: React.PointerEvent) {
    const target = e.target as HTMLElement;
    const handleEl = target.closest("[data-resize-handle]");
    const objEl = target.closest("[data-object-id]");

    if (handleEl) {
      const id = handleEl.getAttribute("data-resize-handle")!;
      const obj = objects.find((o) => o.id === id);
      if (!obj) return;
      gesture.current = {
        kind: "resize",
        id,
        startX: e.clientX,
        startY: e.clientY,
        origW: obj.width,
        origH: obj.height,
      };
      setSelectedId(id);
    } else if (objEl) {
      const id = objEl.getAttribute("data-object-id")!;
      // While editing this note, let the textarea handle the pointer.
      if (editingId === id) return;
      const obj = objects.find((o) => o.id === id);
      if (!obj) return;
      gesture.current = {
        kind: "drag",
        id,
        startX: e.clientX,
        startY: e.clientY,
        origX: obj.x,
        origY: obj.y,
      };
      setSelectedId(id);
    } else {
      // Empty canvas → pan + clear selection / editing.
      gesture.current = {
        kind: "pan",
        startX: e.clientX,
        startY: e.clientY,
        origX: camera.x,
        origY: camera.y,
      };
      setSelectedId(null);
      setEditingId(null);
    }
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;

    if (g.kind === "pan") {
      setCamera({ x: g.origX + dx, y: g.origY + dy });
    } else if (g.kind === "drag") {
      setObjects((list) =>
        list.map((o) =>
          o.id === g.id ? { ...o, x: g.origX + dx, y: g.origY + dy } : o,
        ),
      );
    } else {
      const width = Math.max(MIN_SIZE.width, g.origW + dx);
      const height = Math.max(MIN_SIZE.height, g.origH + dy);
      setObjects((list) =>
        list.map((o) => (o.id === g.id ? { ...o, width, height } : o)),
      );
    }
  }

  function endGesture(e: React.PointerEvent) {
    if (!gesture.current) return;
    gesture.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer may already be released */
    }
  }

  // ── Keyboard (canvas focused, not editing) ────────────────────────
  function onKeyDown(e: React.KeyboardEvent) {
    if (editingId) return; // textarea owns the keystrokes
    if (e.key === "Escape") {
      setSelectedId(null);
      return;
    }
    if (!selectedId) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      deleteObject(selectedId);
      return;
    }
    const nudges: Record<string, [number, number]> = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    };
    const n = nudges[e.key];
    if (n) {
      e.preventDefault();
      const step = e.shiftKey ? 10 : 1;
      setObjects((list) =>
        list.map((o) =>
          o.id === selectedId
            ? { ...o, x: o.x + n[0] * step, y: o.y + n[1] * step }
            : o,
        ),
      );
    }
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Interactive surface: dot grid + world layer. */}
      <div
        ref={containerRef}
        role="application"
        aria-label="Freeform canvas. Drag to move objects, scroll or drag empty space to pan."
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onKeyDown={onKeyDown}
        className="absolute inset-0 cursor-grab outline-none active:cursor-grabbing"
        style={{
          touchAction: "none",
          backgroundColor: "var(--color-bg)",
          backgroundImage:
            "radial-gradient(circle, color-mix(in srgb, var(--color-fg) 14%, transparent) 1px, transparent 1.6px)",
          backgroundSize: "26px 26px",
          backgroundPosition: `${camera.x}px ${camera.y}px`,
        }}
      >
        {/* World layer — translated by the camera; objects sit in world coords. */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px)`,
            willChange: "transform",
          }}
        >
          {objects.map((obj) => (
            <CanvasObjectView
              key={obj.id}
              obj={obj}
              selected={obj.id === selectedId}
              editing={obj.id === editingId}
              onRequestEdit={(id) => {
                setSelectedId(id);
                setEditingId(id);
              }}
              onChangeText={(id, text) =>
                setObjects((list) =>
                  list.map((o) =>
                    o.id === id && o.type === "text" ? { ...o, text } : o,
                  ),
                )
              }
              onCommitEdit={() => setEditingId(null)}
              onDelete={deleteObject}
            />
          ))}
        </div>
      </div>

      {/* Toolbar overlay — sibling of the surface so its clicks don't pan. */}
      <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-3">
        <Toolbar
          hasSelection={!!selectedId}
          currentColor={currentColor}
          onAddText={addText}
          onAddImage={() => setImageDialogOpen(true)}
          onPickColor={pickColor}
          onDeleteSelected={() => selectedId && deleteObject(selectedId)}
          onResetView={() => setCamera({ x: 0, y: 0 })}
        />
      </div>

      {/* Hint */}
      <p
        className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px]"
        style={{ color: "var(--color-accent)" }}
      >
        Drag to move · Double-click a note to edit · Scroll or drag the canvas to
        pan · Arrow keys nudge, Delete removes
      </p>

      {imageDialogOpen && (
        <ImageUrlDialog
          onClose={() => setImageDialogOpen(false)}
          onAdd={addImage}
        />
      )}
    </div>
  );
}
