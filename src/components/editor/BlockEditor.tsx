"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AddSquare, ShieldCheck } from "@solar-icons/react/ssr";
import Block from "./Block";
import SlashMenu from "./SlashMenu";
import Toolbar from "./Toolbar";
import {
  createBlock,
  filterBlockTypes,
  isListLike,
  isMultilineBlock,
  isTextBlock,
  reserveIds,
  type Block as BlockModel,
  type BlockType,
  type ColorKey,
  type FontKey,
  type IconSizeKey,
  type SizeKey,
  type ToggleMark,
  DEFAULT_MARKS,
} from "./types";

type Caret = "start" | "end" | number;

export interface BlockEditorProps {
  /** Initial title (document mode). Defaults to "Untitled". */
  initialTitle?: string;
  /** Initial blocks (document mode). When omitted, the standalone demo seed is
   *  used; when an empty array is passed, a single empty paragraph is shown. */
  initialBlocks?: BlockModel[];
  /** Fired (on every edit) with the current title + blocks. The parent debounces
   *  and persists. Omit for the standalone, non-persisted demo. */
  onChange?: (data: { title: string; blocks: BlockModel[] }) => void;
}

/** Seed document for the standalone demo. Explicit (non-generated) ids so server
 *  and client render identically — no hydration mismatch. */
function seedBlocks(): BlockModel[] {
  const mk = (
    id: string,
    type: BlockType,
    text: string,
    color: ColorKey = "default",
  ): BlockModel => ({
    id,
    type,
    text,
    marks: { ...DEFAULT_MARKS, color },
  });
  return [
    mk("seed_1", "h1", "Welcome to the Libra editor"),
    mk(
      "seed_2",
      "paragraph",
      "Press “/” at the start of a line to insert a block — headings, lists, or an image.",
    ),
    mk("seed_3", "h2", "Formatting"),
    mk(
      "seed_4",
      "bulleted",
      "Focus a block and use the toolbar for bold, italic, and text color.",
    ),
    mk(
      "seed_5",
      "bulleted",
      "Everything you type is stored as plain text — safe from XSS by design.",
      "violet",
    ),
    mk("seed_6", "h2", "Try it"),
    mk("seed_7", "numbered", "Press Enter to add a new block."),
    mk("seed_8", "numbered", "Backspace at the start merges or unwraps a block."),
    mk("seed_9", "numbered", "Alt + ↑/↓ moves a block; arrow keys move the caret."),
    mk("seed_10", "paragraph", ""),
  ];
}

export default function BlockEditor({
  initialTitle,
  initialBlocks,
  onChange,
}: BlockEditorProps = {}) {
  const [title, setTitle] = useState(initialTitle ?? "Untitled");
  const [blocks, setBlocks] = useState<BlockModel[]>(() => {
    if (initialBlocks) {
      return initialBlocks.length ? initialBlocks : [createBlock("paragraph")];
    }
    return seedBlocks();
  });
  const [activeId, setActiveId] = useState<string | null>(
    initialBlocks ? null : "seed_1",
  );

  // Document mode: emit edits to the parent (skipping the initial mount) and
  // reserve ids past the loaded blocks so new blocks never collide.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const mounted = useRef(false);
  useEffect(() => {
    reserveIds(blocks);
    mounted.current = true;
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!mounted.current) return;
    onChangeRef.current?.({ title, blocks });
  }, [title, blocks]);
  /** Slash menu state: which block triggered it, the query, and the cursor. */
  const [slash, setSlash] = useState<{
    blockId: string;
    query: string;
    index: number;
  } | null>(null);

  // Map of block id -> its editable element, for programmatic focus.
  const inputRefs = useRef<
    Record<string, HTMLTextAreaElement | HTMLInputElement | null>
  >({});
  // Focus requested for after the next render (for newly created/merged blocks).
  const pendingFocus = useRef<{ id: string; caret: Caret } | null>(null);

  const registerRef = useCallback(
    (id: string, el: HTMLTextAreaElement | HTMLInputElement | null) => {
      if (el) inputRefs.current[id] = el;
      else delete inputRefs.current[id];
    },
    [],
  );

  const setCaret = (el: HTMLTextAreaElement, caret: Caret) => {
    const len = el.value.length;
    const pos =
      caret === "start"
        ? 0
        : caret === "end"
          ? len
          : Math.max(0, Math.min(len, caret));
    el.setSelectionRange(pos, pos);
  };

  /** Focus an existing block now (used for caret navigation). */
  const focusBlock = (id: string, caret: Caret): boolean => {
    const el = inputRefs.current[id];
    if (!el) return false;
    el.focus();
    if (el instanceof HTMLTextAreaElement) setCaret(el, caret);
    return true;
  };

  // Apply any pending focus once the DOM reflects the new block list.
  useLayoutEffect(() => {
    const pf = pendingFocus.current;
    if (!pf) return;
    pendingFocus.current = null;
    const el = inputRefs.current[pf.id];
    if (!el) return;
    el.focus();
    if (el instanceof HTMLTextAreaElement) setCaret(el, pf.caret);
  }, [blocks]);

  /* ── Mutations ──────────────────────────────────────────────────────────── */

  const handleChangeText = (id: string, value: string) => {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, text: value } : b)));
    // "/" at the very start of a block opens the insert menu.
    if (value.startsWith("/")) {
      setSlash({ blockId: id, query: value.slice(1), index: 0 });
    } else {
      setSlash((s) => (s && s.blockId === id ? null : s));
    }
  };

  const handleImagePatch = (
    id: string,
    patch: { src?: string; alt?: string },
  ) => {
    setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    const i = blocks.findIndex((b) => b.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= blocks.length) return;
    const copy = blocks.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setBlocks(copy);
    // The same DOM node is reordered, so browser focus & caret are preserved.
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      const only = createBlock("paragraph");
      setBlocks([only]);
      pendingFocus.current = { id: only.id, caret: "start" };
    } else {
      const i = blocks.findIndex((b) => b.id === id);
      const neighbor = blocks[i - 1] ?? blocks[i + 1];
      setBlocks(blocks.filter((b) => b.id !== id));
      if (neighbor) pendingFocus.current = { id: neighbor.id, caret: "end" };
    }
    setSlash((s) => (s && s.blockId === id ? null : s));
  };

  const selectSlashType = (type: BlockType) => {
    const target = slash?.blockId;
    if (!target) return;
    // Divider is non-text: convert in place, then drop a paragraph after it so
    // the caret has somewhere to land.
    if (type === "divider") {
      const para = createBlock("paragraph");
      setBlocks((bs) => {
        const i = bs.findIndex((b) => b.id === target);
        if (i < 0) return bs;
        const copy = bs.slice();
        copy[i] = { ...copy[i], type: "divider", text: "" };
        copy.splice(i + 1, 0, para);
        return copy;
      });
      setSlash(null);
      setActiveId(para.id);
      pendingFocus.current = { id: para.id, caret: "start" };
      return;
    }
    setBlocks((bs) =>
      bs.map((b) =>
        b.id === target
          ? { ...b, type, text: "", src: type === "image" ? "" : b.src }
          : b,
      ),
    );
    setSlash(null);
    setActiveId(target);
    pendingFocus.current = { id: target, caret: "start" };
  };

  const addBlockAtEnd = () => {
    const nb = createBlock("paragraph");
    setBlocks([...blocks, nb]);
    pendingFocus.current = { id: nb.id, caret: "start" };
  };

  /* ── Formatting (acts on the active block) ──────────────────────────────── */

  const toggleMark = (key: ToggleMark) => {
    if (!activeId) return;
    setBlocks((bs) =>
      bs.map((b) =>
        b.id === activeId && isTextBlock(b.type)
          ? { ...b, marks: { ...b.marks, [key]: !b.marks[key] } }
          : b,
      ),
    );
  };

  const setColor = (color: ColorKey) => {
    if (!activeId) return;
    setBlocks((bs) =>
      bs.map((b) =>
        b.id === activeId && isTextBlock(b.type)
          ? { ...b, marks: { ...b.marks, color } }
          : b,
      ),
    );
  };

  const setFont = (font: FontKey) => {
    if (!activeId) return;
    setBlocks((bs) =>
      bs.map((b) =>
        b.id === activeId && isTextBlock(b.type)
          ? { ...b, marks: { ...b.marks, font } }
          : b,
      ),
    );
  };

  const setSize = (size: SizeKey) => {
    if (!activeId) return;
    setBlocks((bs) =>
      bs.map((b) =>
        b.id === activeId && isTextBlock(b.type)
          ? { ...b, marks: { ...b.marks, size } }
          : b,
      ),
    );
  };

  /** Toggle a to-do block's checked state. */
  const toggleCheck = (id: string) => {
    setBlocks((bs) =>
      bs.map((b) => (b.id === id ? { ...b, checked: !b.checked } : b)),
    );
  };

  /** Update an icon block: its icon key, display size, and/or colour (the icon
   *  block's controls live in-block since the toolbar only acts on text). */
  const handleIconPatch = (
    id: string,
    patch: { icon?: string; iconSize?: IconSizeKey; color?: ColorKey },
  ) => {
    setBlocks((bs) =>
      bs.map((b) => {
        if (b.id !== id) return b;
        const next: BlockModel = { ...b };
        if (patch.icon !== undefined) next.icon = patch.icon;
        if (patch.iconSize !== undefined) next.iconSize = patch.iconSize;
        if (patch.color !== undefined) {
          next.marks = { ...b.marks, color: patch.color };
        }
        return next;
      }),
    );
  };

  const handleFocus = (id: string) => {
    setActiveId(id);
    setSlash((s) => (s && s.blockId !== id ? null : s));
  };

  /* ── Keyboard handling ──────────────────────────────────────────────────── */

  const handleKeyDown = (id: string, e: React.KeyboardEvent) => {
    // Slash menu navigation takes priority while it's open for this block.
    if (slash && slash.blockId === id) {
      const items = filterBlockTypes(slash.query);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (items.length)
          setSlash({ ...slash, index: (slash.index + 1) % items.length });
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (items.length)
          setSlash({
            ...slash,
            index: (slash.index - 1 + items.length) % items.length,
          });
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (items.length)
          selectSlashType(items[Math.min(slash.index, items.length - 1)].type);
        else setSlash(null);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSlash(null);
        return;
      }
      // Any other key falls through so the query keeps updating as you type.
    }

    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const block = blocks[idx];
    if (!isTextBlock(block.type)) return; // image fields use native behavior

    const el = e.currentTarget as HTMLTextAreaElement;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const collapsed = start === end;
    const value = block.text;

    // Alt + ↑/↓ reorders the block.
    if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
      e.preventDefault();
      moveBlock(id, e.key === "ArrowUp" ? -1 : 1);
      return;
    }

    // Multi-line blocks (code / quote / callout): a bare Enter inserts a newline
    // INSIDE the block rather than splitting it.
    if (e.key === "Enter" && !e.shiftKey && isMultilineBlock(block.type)) {
      return; // let the textarea insert the newline natively
    }

    // Enter splits the block at the caret (Shift+Enter = soft newline).
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const before = value.slice(0, start);
      const after = value.slice(end);
      // Enter on an empty list-like item exits to a paragraph.
      if (isListLike(block.type) && value.trim() === "") {
        setBlocks((bs) =>
          bs.map((b) =>
            b.id === id ? { ...b, type: "paragraph", checked: undefined } : b,
          ),
        );
        pendingFocus.current = { id, caret: "start" };
        return;
      }
      const newType: BlockType = isListLike(block.type)
        ? block.type
        : "paragraph";
      const newBlock = createBlock(newType, {
        text: after,
        marks: { ...block.marks },
      });
      setBlocks((bs) => {
        const i = bs.findIndex((b) => b.id === id);
        const copy = bs.slice();
        copy[i] = { ...copy[i], text: before };
        copy.splice(i + 1, 0, newBlock);
        return copy;
      });
      pendingFocus.current = { id: newBlock.id, caret: "start" };
      return;
    }

    // Backspace at the very start: unwrap, then merge.
    if (e.key === "Backspace" && collapsed && start === 0) {
      if (block.type !== "paragraph") {
        // Headings / list / quote / callout / code first collapse to a paragraph.
        e.preventDefault();
        setBlocks((bs) =>
          bs.map((b) =>
            b.id === id ? { ...b, type: "paragraph", checked: undefined } : b,
          ),
        );
        pendingFocus.current = { id, caret: "start" };
        return;
      }
      if (idx === 0) return; // nothing above
      const prev = blocks[idx - 1];
      if (isTextBlock(prev.type)) {
        e.preventDefault();
        const junction = prev.text.length;
        setBlocks((bs) => {
          const copy = bs.slice();
          copy[idx - 1] = { ...copy[idx - 1], text: copy[idx - 1].text + value };
          copy.splice(idx, 1);
          return copy;
        });
        pendingFocus.current = { id: prev.id, caret: junction };
      } else if (value === "") {
        // Previous block is an image: only remove this one if it's empty.
        e.preventDefault();
        setBlocks(blocks.filter((b) => b.id !== id));
        pendingFocus.current = { id: prev.id, caret: "end" };
      }
      return;
    }

    // Arrow up/down hop to the adjacent block when on the first/last line.
    if (e.key === "ArrowUp" && collapsed) {
      const onFirstLine = !value.slice(0, start).includes("\n");
      if (onFirstLine && idx > 0) {
        e.preventDefault();
        focusBlock(blocks[idx - 1].id, "end");
      }
      return;
    }
    if (e.key === "ArrowDown" && collapsed) {
      const onLastLine = !value.slice(start).includes("\n");
      if (onLastLine && idx < blocks.length - 1) {
        e.preventDefault();
        focusBlock(blocks[idx + 1].id, "start");
      }
      return;
    }
  };

  /* ── Derived render data ────────────────────────────────────────────────── */

  // Number consecutive runs of numbered-list blocks.
  const numbering: Record<string, number> = {};
  let run = 0;
  for (const b of blocks) {
    if (b.type === "numbered") {
      run += 1;
      numbering[b.id] = run;
    } else {
      run = 0;
    }
  }

  const activeBlock = blocks.find((b) => b.id === activeId) ?? null;
  const activeIsText = !!activeBlock && isTextBlock(activeBlock.type);
  const slashItems = slash ? filterBlockTypes(slash.query) : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-32 pt-8 sm:px-6">
      {/* Document title — a plain controlled field (escaped, XSS-safe). */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        aria-label="Document title"
        className="mb-4 w-full bg-transparent text-3xl font-extrabold tracking-tight outline-none placeholder:opacity-30 sm:text-4xl"
        style={{ color: "var(--color-fg)" }}
      />

      <div className="mb-5">
        <Toolbar
          marks={activeIsText ? activeBlock!.marks : null}
          disabled={!activeIsText}
          onToggleBold={() => toggleMark("bold")}
          onToggleItalic={() => toggleMark("italic")}
          onToggleUnderline={() => toggleMark("underline")}
          onToggleStrike={() => toggleMark("strike")}
          onToggleCode={() => toggleMark("code")}
          onSetColor={setColor}
          onSetFont={setFont}
          onSetSize={setSize}
        />
      </div>

      <div className="space-y-1">
        {blocks.map((b, i) => (
          <Block
            key={b.id}
            block={b}
            listNumber={numbering[b.id]}
            isFirst={i === 0}
            isLast={i === blocks.length - 1}
            registerRef={registerRef}
            onChangeText={handleChangeText}
            onImagePatch={handleImagePatch}
            onIconPatch={handleIconPatch}
            onToggleCheck={toggleCheck}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onMoveUp={(id) => moveBlock(id, -1)}
            onMoveDown={(id) => moveBlock(id, 1)}
            onDelete={deleteBlock}
            slashMenu={
              slash && slash.blockId === b.id ? (
                <SlashMenu
                  items={slashItems}
                  activeIndex={Math.min(
                    slash.index,
                    Math.max(0, slashItems.length - 1),
                  )}
                  onSelect={selectSlashType}
                  onHover={(index) =>
                    setSlash((s) => (s ? { ...s, index } : s))
                  }
                />
              ) : undefined
            }
          />
        ))}
      </div>

      {/* Click below the last block to append a paragraph. */}
      <button
        type="button"
        onClick={addBlockAtEnd}
        className="mt-2 flex w-full items-center gap-2 rounded-lg px-2 py-3 text-left text-sm transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_8%,transparent)]"
        style={{ color: "var(--color-accent)" }}
      >
        <AddSquare size={16} color="currentColor" weight="Bold" />
        Add a block
      </button>

      {/* Quiet reminder of the security posture (this editor is the A05 demo). */}
      <p
        className="mt-10 flex items-center gap-1.5 text-xs"
        style={{ color: "var(--color-accent)" }}
      >
        <ShieldCheck size={13} color="var(--color-secondary)" weight="Bold" />
        Text is stored as plain strings and rendered escaped — no raw HTML, no
        XSS.
      </p>
    </div>
  );
}
