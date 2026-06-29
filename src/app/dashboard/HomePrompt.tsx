"use client";

import { useEffect, useRef, useState } from "react";
import AssistantPanel from "@/components/ai/AssistantPanel";

/* Libra home hero — Aries-style prompt box, violet palette. Submitting starts
   the assistant INLINE (no redirect) with the prompt already running, so the
   AI begins immediately. */

const PLACEHOLDERS = [
  "Ask Libra to draft a meeting agenda…",
  "Ask Libra to create a reading list…",
  "Ask Libra to summarize an idea…",
  "Ask Libra to outline a project plan…",
  "Ask Libra to plan your week…",
];

const SUGGESTIONS = [
  { label: "Meeting agenda", prompt: "Create a meeting-agenda note for a 30-minute project kickoff with goals, topics, and action items." },
  { label: "Reading list", prompt: "Create a reading list of 5 must-read science-fiction books, each with a one-line summary." },
  { label: "Trip packing", prompt: "Draft a weekend-trip packing list grouped by category (clothes, toiletries, tech)." },
  { label: "Brainstorm", prompt: "Brainstorm 10 blog-post ideas about productivity, then outline the best one." },
];

const TYPE_MS = 45;
const DELETE_MS = 25;
const HOLD_MS = 1600;

export function HomePrompt({ firstName }: { firstName: string }) {
  const [value, setValue] = useState("");
  // The submitted prompt → switches this hero into the live chat. null = hero.
  const [started, setStarted] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cycling placeholder typewriter.
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [placeholder, setPlaceholder] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");

  useEffect(() => {
    if (value || started !== null) return;
    const current = PLACEHOLDERS[phraseIndex];
    // Every transition runs in a timeout callback (never a synchronous setState
    // in the effect body) — the re-render then re-enters with the next phase.
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      t =
        placeholder.length < current.length
          ? setTimeout(() => setPlaceholder(current.slice(0, placeholder.length + 1)), TYPE_MS)
          : setTimeout(() => setPhase("holding"), HOLD_MS / 4);
    } else if (phase === "holding") {
      t = setTimeout(() => setPhase("deleting"), HOLD_MS);
    } else if (placeholder.length > 0) {
      t = setTimeout(() => setPlaceholder(placeholder.slice(0, -1)), DELETE_MS);
    } else {
      t = setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % PLACEHOLDERS.length);
        setPhase("typing");
      }, DELETE_MS);
    }
    return () => clearTimeout(t);
  }, [placeholder, phase, phraseIndex, value, started]);

  // Auto-grow textarea up to ~6 lines.
  useEffect(() => {
    if (started !== null) return;
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [value, started]);

  function submit(text: string) {
    const prompt = text.trim();
    if (!prompt) return;
    setStarted(prompt);
  }

  // ── Live chat (started) ──────────────────────────────────────────────
  if (started !== null) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4">
        <div
          className="flex h-[min(72vh,640px)] flex-col rounded-2xl p-3 shadow-2xl sm:p-4"
          style={{ background: "var(--color-bg)", border: "1px solid var(--color-surface-border)" }}
        >
          <AssistantPanel
            title="Libra AI"
            initialPrompt={started}
            onClose={() => {
              setStarted(null);
              setValue("");
            }}
          />
        </div>
      </div>
    );
  }

  // ── Hero prompt ──────────────────────────────────────────────────────
  return (
    <div
      className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center"
      style={{ animation: "libra-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s both" }}
    >
      <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
        Let&apos;s write something,{" "}
        <span style={{ color: "var(--color-primary)" }}>{firstName}</span>
      </h1>
      <p
        className="mb-8 max-w-xl text-sm leading-relaxed sm:text-base"
        style={{ color: "rgba(255,255,255,0.72)" }}
      >
        Describe the note you want. Libra&apos;s AI drafts it, finds images, and can
        create the document for you — privately, in your workspace.
      </p>

      {/* Prompt card */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="relative z-10 w-full max-w-2xl rounded-2xl p-3 shadow-2xl backdrop-blur-xl"
        style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(255,255,255,0.4)" }}
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(value);
              }
            }}
            placeholder={value ? "" : placeholder}
            rows={1}
            maxLength={2000}
            aria-label="Describe the note you want Libra to write"
            className="flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed outline-none sm:text-base"
            style={{ color: "var(--color-on-primary)", minHeight: "2.5rem", maxHeight: "180px" }}
          />
          <button
            type="submit"
            disabled={!value.trim()}
            aria-label="Ask Libra"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            style={{ background: "var(--color-secondary)" }}
          >
            <ArrowIcon />
          </button>
        </div>
      </form>

      {/* Suggestion chips — start the chat immediately */}
      <div
        className="mt-7 grid w-full max-w-2xl grid-cols-2 gap-2.5 sm:grid-cols-4"
        style={{ animation: "libra-fade-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s both" }}
      >
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => submit(s.prompt)}
            className="flex items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-center transition-opacity duration-200 hover:opacity-90"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.16)",
              backdropFilter: "blur(8px)",
            }}
          >
            <SparkIcon />
            <span className="text-[11px] font-medium leading-tight" style={{ color: "rgba(255,255,255,0.72)" }}>
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)" aria-hidden="true">
      <path d="M12 3l1.6 4.8L18 9.5l-4.4 1.7L12 16l-1.6-4.8L6 9.5l4.4-1.7L12 3Z" />
    </svg>
  );
}
