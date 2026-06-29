"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ImageResult, StreamEvent } from "@/lib/ai/types";
import type { Block } from "@/components/editor/types";
import { renderMarkdown } from "./markdown";

type CreatedDoc = { id: string; title: string };

/* Libra AI assistant — chat panel. Streams a Claude reply over NDJSON and
   renders any images the assistant surfaces via the search_images tool.

   Optional props let it dock as a side panel inside a document workspace:
   - getContext: returns the current note's PLAIN TEXT, sent as `context` so the
     AI can answer about the note (XSS-safe: plain strings only; the route's
     hardened system prompt treats it as data, not instructions — OWASP A05).
   - onClose: renders a panel header with a close button (side-panel / sheet).
   - focusSignal: bump it to move focus into the composer when the panel opens. */

type UIMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  images: ImageResult[];
  documents: CreatedDoc[];
};

const inputStyle = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-surface-border)",
  color: "var(--color-fg)",
  "--tw-ring-color": "var(--color-secondary)",
} as React.CSSProperties;

const GENERAL_EXAMPLES = [
  "Create a meeting-agenda note for a 30-minute kickoff",
  "Draft a reading list of 5 must-read sci-fi books",
  "Find some images of a mountain sunrise for my travel note",
];

const NOTE_EXAMPLES = [
  "Summarize this note in 3 bullet points",
  "Suggest a clearer title for this note",
  "Find images that fit this note",
];

export default function AssistantPanel({
  getContext,
  onClose,
  focusSignal,
  title = "Assistant",
  initialPrompt,
  docId,
  onAppendBlocks,
}: {
  /** Returns the current document's plain text to send as context. */
  getContext?: () => string;
  /** When provided, the panel shows a header with a close button. */
  onClose?: () => void;
  /** Increment to focus the composer (e.g. when the panel is opened). */
  focusSignal?: number;
  title?: string;
  /** A prompt to auto-send once on mount (e.g. submitted from the home hero). */
  initialPrompt?: string;
  /** The open document's id — enables the assistant to insert into THIS note. */
  docId?: string;
  /** Called with blocks the assistant wants appended to the open document. */
  onAppendBlocks?: (blocks: Block[]) => void;
}) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const hasContext = typeof getContext === "function";
  const examples = hasContext ? NOTE_EXAMPLES : GENERAL_EXAMPLES;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, streaming]);

  // Move focus into the composer whenever the panel is (re)opened.
  useEffect(() => {
    if (focusSignal) inputRef.current?.focus();
  }, [focusSignal]);

  // Auto-send an initial prompt (e.g. submitted from the home hero), once.
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    const p = (initialPrompt ?? "").trim();
    if (!p) return;
    didInit.current = true;
    void send(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (id: number, fn: (m: UIMessage) => UIMessage) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? fn(m) : m)));

  async function send(text: string) {
    const prompt = text.trim();
    if (!prompt || streaming) return;
    setError(null);

    const userMsg: UIMessage = { id: ++idRef.current, role: "user", text: prompt, images: [], documents: [] };
    const assistantId = ++idRef.current;
    const assistantMsg: UIMessage = { id: assistantId, role: "assistant", text: "", images: [], documents: [] };

    // Build the API payload from the prior turns + this new user message.
    const payload = [...messages, userMsg].map((m) => ({ role: m.role, content: m.text }));
    // Plain-text note context (optional). Trimmed; the route also clamps it.
    const context = getContext?.().trim() ?? "";
    const reqBody: Record<string, unknown> = { messages: payload };
    if (context) reqBody.context = context;
    if (docId) reqBody.docId = docId;

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "The assistant is unavailable right now.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          let event: StreamEvent;
          try {
            event = JSON.parse(line) as StreamEvent;
          } catch {
            continue;
          }
          if (event.type === "text") {
            patch(assistantId, (m) => ({ ...m, text: m.text + event.text }));
          } else if (event.type === "images") {
            patch(assistantId, (m) => ({ ...m, images: [...m.images, ...event.images] }));
          } else if (event.type === "document") {
            patch(assistantId, (m) => ({
              ...m,
              documents: [...m.documents, { id: event.id, title: event.title }],
            }));
            // Refresh server components (e.g. the dashboard's document list).
            router.refresh();
          } else if (event.type === "append") {
            // Insert the blocks into the open document (the workspace handles it).
            onAppendBlocks?.(event.blocks);
          } else if (event.type === "error") {
            setError(event.error);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setStreaming(false);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div
      className="flex flex-col h-full"
      onKeyDown={(e) => {
        if (e.key === "Escape" && onClose) onClose();
      }}
    >
      {onClose && (
        <div className="flex items-center justify-between gap-2 pb-3 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-bold truncate" style={{ color: "var(--color-fg)" }}>
              {title}
            </h2>
            {hasContext && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  background: "color-mix(in srgb, var(--color-secondary) 12%, transparent)",
                  color: "var(--color-secondary-text)",
                }}
                title="The assistant can see this note's text"
              >
                Using this note
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant"
            className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_12%,transparent)] cursor-pointer"
            style={{ color: "var(--color-accent)" }}
          >
            <CloseIcon />
          </button>
        </div>
      )}

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-1 py-4 space-y-5"
        aria-live="polite"
        aria-busy={streaming}
      >
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 libra-fade-in">
            <div
              className="inline-flex items-center justify-center rounded-2xl mb-4"
              style={{
                width: 52,
                height: 52,
                background: "var(--color-surface)",
                border: "1px solid var(--color-surface-border)",
                color: "var(--color-secondary-text)",
              }}
              aria-hidden="true"
            >
              <SparkIcon />
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: "var(--color-fg)" }}>
              {hasContext ? "Ask about this note" : "Ask Libra anything"}
            </h2>
            <p className="text-sm mb-6 max-w-sm" style={{ color: "var(--color-accent)" }}>
              {hasContext
                ? "Summarize, rewrite, or find images for the note you're editing — powered by Claude, hardened against prompt injection."
                : "Draft and refine notes, summarize ideas, or pull in images — powered by Claude, hardened against prompt injection."}
            </p>
            <div className="flex flex-col gap-2 w-full max-w-md">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => send(ex)}
                  className="text-left text-sm px-4 py-2.5 rounded-xl transition-colors duration-150 hover:opacity-90 cursor-pointer"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-surface-border)",
                    color: "var(--color-fg)",
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}

        {streaming && <TypingIndicator />}
      </div>

      {error && (
        <p
          role="alert"
          className="mx-1 mb-2 rounded-xl px-3 py-2 text-xs font-medium"
          style={{ background: "rgba(229,72,77,0.12)", color: "#e5484d" }}
        >
          {error}
        </p>
      )}

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-end gap-2 pt-2"
      >
        <label htmlFor="assistant-input" className="sr-only">
          Message the assistant
        </label>
        <textarea
          id="assistant-input"
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          rows={1}
          placeholder="Ask, draft, or request images…  (Enter to send, Shift+Enter for a new line)"
          className="flex-1 resize-none max-h-40 px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
          style={inputStyle}
        />
        <button
          type="submit"
          disabled={streaming || !input.trim()}
          aria-label="Send message"
          className="shrink-0 h-[46px] px-5 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ background: "var(--color-secondary)", color: "white" }}
        >
          {streaming ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${
            isUser ? "whitespace-pre-wrap" : ""
          }`}
          style={
            isUser
              ? { background: "var(--color-secondary)", color: "white" }
              : {
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-surface-border)",
                  color: "var(--color-fg)",
                }
          }
        >
          {isUser ? message.text : message.text ? renderMarkdown(message.text) : "​"}
        </div>

        {message.documents.length > 0 && (
          <div className="flex w-full flex-col gap-2">
            {message.documents.map((doc) => (
              <Link
                key={doc.id}
                href={`/dashboard/doc/${doc.id}`}
                className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_7%,transparent)]"
                style={{ background: "var(--color-surface)", border: "1px solid var(--color-surface-border)" }}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: "color-mix(in srgb, var(--color-secondary) 12%, transparent)",
                    color: "var(--color-secondary-text)",
                  }}
                  aria-hidden="true"
                >
                  <DocIcon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold" style={{ color: "var(--color-fg)" }}>
                    {doc.title}
                  </span>
                  <span className="block text-[11px]" style={{ color: "var(--color-secondary-text)" }}>
                    Open document →
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}

        {message.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
            {message.images.map((img, i) => (
              <a
                key={`${img.url}-${i}`}
                href={img.landingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl overflow-hidden transition-transform duration-200 hover:scale-[1.02]"
                style={{ border: "1px solid var(--color-surface-border)", background: "var(--color-surface)" }}
                title={`${img.title} — opens source`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.thumbnail}
                  alt={img.title}
                  loading="lazy"
                  className="w-full h-24 object-cover"
                />
                <div className="px-2 py-1.5">
                  <p className="text-[11px] truncate" style={{ color: "var(--color-fg)" }}>
                    {img.title}
                  </p>
                  {img.license && (
                    <p className="text-[10px] uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>
                      {img.license}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-hidden="true">
      <div
        className="px-4 py-3 rounded-2xl flex gap-1.5"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-surface-border)" }}
      >
        {[0, 0.15, 0.3].map((d) => (
          <span
            key={d}
            className="libra-pulse inline-block rounded-full"
            style={{
              width: 7,
              height: 7,
              background: "var(--color-secondary-text)",
              animationDelay: `${d}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"
        fill="currentColor"
      />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 3h7l5 5v13a0 0 0 0 1 0 0H6a0 0 0 0 1 0 0V3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13 3v5h5M9 13h6M9 17h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
