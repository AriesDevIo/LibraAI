"use client";

import { useState, useEffect, useRef } from "react";
import {
  Lock,
  MagicStick3,
  Magnifer,
  AddSquare,
  CheckCircle,
  UsersGroupRounded,
} from "@solar-icons/react/ssr";

/* The AI assistant cycles through these scenes. Each highlights a different
   block in the document while the assistant "works" on it. */
type Highlight = "summary" | "image" | "checklist";
type Phase = "prompt" | "thinking" | "writing" | "done";

const SCENES: {
  prompt: string;
  working: string;
  result: string;
  highlight: Highlight;
}[] = [
  {
    prompt: "Summarize my research notes",
    working: "Writing a summary…",
    result: "Added a 3-point summary",
    highlight: "summary",
  },
  {
    prompt: "Find a cover image for this page",
    working: "Fetching an image…",
    result: "Added an image from the web",
    highlight: "image",
  },
  {
    prompt: "Turn the next steps into tasks",
    working: "Building a checklist…",
    result: "Created a 3-item checklist",
    highlight: "checklist",
  },
];

const SIDEBAR_PAGES = [
  { label: "Getting started", active: false },
  { label: "Product brief", active: true },
  { label: "Research notes", active: false },
  { label: "Roadmap", active: false },
];

function InkBar({ w, o = 0.14 }: { w: string; o?: number }) {
  return (
    <div
      className="h-2.5 rounded-full"
      style={{
        width: w,
        background: `color-mix(in srgb, var(--color-fg) ${o * 100}%, transparent)`,
      }}
    />
  );
}

export default function DocumentMockup() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("done");
  const idxRef = useRef(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const tick = () => {
      const next = (idxRef.current + 1) % SCENES.length;
      idxRef.current = next;
      setIdx(next);
      setPhase("prompt");
      timers.push(setTimeout(() => setPhase("thinking"), 700));
      timers.push(setTimeout(() => setPhase("writing"), 1500));
      timers.push(setTimeout(() => setPhase("done"), 2900));
    };
    const interval = setInterval(tick, 4600);
    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, []);

  const scene = SCENES[idx];
  const lit = (h: Highlight) =>
    scene.highlight === h && phase !== "done"
      ? {
          outline: "1.5px dashed var(--color-secondary)",
          outlineOffset: "4px",
          borderRadius: "8px",
        }
      : {};

  return (
    <div
      className="libra-float relative mx-auto w-full max-w-3xl"
      aria-hidden="true"
    >
      {/* Soft glow behind the window */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[28px] blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, var(--color-glow) 0%, var(--color-secondary) 55%, transparent 100%)",
          opacity: 0.22,
        }}
      />

      {/* Window */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-surface-border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Chrome bar */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--color-surface-border)" }}
        >
          <div className="flex shrink-0 gap-1.5">
            <span className="h-3 w-3 rounded-full" style={{ background: "var(--color-secondary)", opacity: 0.85 }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "var(--color-primary)" }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "var(--color-glow)" }} />
          </div>
          <div
            className="hidden flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium sm:flex"
            style={{ background: "var(--color-surface-border)", color: "var(--color-accent)" }}
          >
            <Lock size={11} color="currentColor" weight="Bold" />
            libra.app/my-workspace
          </div>
          <div className="flex shrink-0 items-center -space-x-2">
            {["var(--color-secondary)", "var(--color-glow)", "var(--color-primary)"].map(
              (c, i) => (
                <span
                  key={i}
                  className="h-5 w-5 rounded-full"
                  style={{ background: c, border: "1.5px solid var(--color-bg)" }}
                />
              ),
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex" style={{ minHeight: "380px" }}>
          {/* Sidebar */}
          <div
            className="hidden w-[34%] shrink-0 flex-col gap-1 p-3.5 sm:flex"
            style={{ borderRight: "1px solid var(--color-surface-border)" }}
          >
            <div className="mb-2 flex items-center gap-2 px-1">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-extrabold text-white"
                style={{ background: "linear-gradient(135deg, var(--color-secondary), var(--color-glow))" }}
              >
                L
              </span>
              <div className="flex-1">
                <InkBar w="75%" o={0.3} />
              </div>
            </div>

            <div
              className="mb-2 flex items-center gap-2 rounded-lg px-2.5 py-2"
              style={{ background: "var(--color-surface-border)" }}
            >
              <Magnifer size={12} color="var(--color-accent)" weight="Bold" />
              <span className="text-[11px]" style={{ color: "var(--color-accent)", opacity: 0.7 }}>
                Search
              </span>
            </div>

            {SIDEBAR_PAGES.map((p) => (
              <div
                key={p.label}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
                style={
                  p.active
                    ? { background: "color-mix(in srgb, var(--color-secondary) 14%, transparent)" }
                    : {}
                }
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-[5px]"
                  style={{
                    background: p.active
                      ? "var(--color-secondary)"
                      : "color-mix(in srgb, var(--color-fg) 18%, transparent)",
                  }}
                />
                <span
                  className="text-[12px] font-medium"
                  style={{
                    color: p.active ? "var(--color-secondary)" : "var(--color-accent)",
                  }}
                >
                  {p.label}
                </span>
              </div>
            ))}

            <div className="mt-1 flex items-center gap-2 px-2.5 py-1.5">
              <AddSquare size={14} color="var(--color-accent)" weight="Bold" />
              <span className="text-[12px] font-medium" style={{ color: "var(--color-accent)", opacity: 0.8 }}>
                New page
              </span>
            </div>
          </div>

          {/* Document */}
          <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
            {/* Title with blinking cursor */}
            <div className="flex items-center gap-1">
              <div
                className="h-6 w-3/5 rounded-lg"
                style={{ background: "linear-gradient(90deg, var(--color-secondary), var(--color-primary))" }}
              />
              <span
                className="libra-blink h-6 w-[2px] rounded-full"
                style={{ background: "var(--color-secondary)" }}
              />
            </div>

            {/* Summary block */}
            <div className="flex flex-col gap-2" style={lit("summary")}>
              <InkBar w="96%" />
              <InkBar w="88%" />
              <InkBar w="72%" />
            </div>

            {/* Image block */}
            <div className="relative" style={lit("image")}>
              <div
                className="flex h-24 w-full items-center justify-center rounded-xl"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--color-glow) 50%, transparent), color-mix(in srgb, var(--color-secondary) 35%, transparent))",
                }}
              >
                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-sm"
                  style={{ background: "var(--color-bg)", color: "var(--color-secondary)" }}
                >
                  <MagicStick3 size={11} color="var(--color-secondary)" weight="Bold" />
                  AI · from the web
                </span>
              </div>
            </div>

            {/* Checklist block */}
            <div className="flex flex-col gap-2.5" style={lit("checklist")}>
              {[true, true, false].map((done, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {done ? (
                    <CheckCircle size={15} color="var(--color-secondary)" weight="Bold" />
                  ) : (
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-[5px]"
                      style={{ border: "1.5px solid var(--color-surface-border)" }}
                    />
                  )}
                  <InkBar w={["58%", "66%", "48%"][i]} o={done ? 0.1 : 0.16} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI command bar */}
        <div
          className="flex items-center gap-2.5 px-4 py-3"
          style={{ borderTop: "1px solid var(--color-surface-border)", background: "var(--color-surface)" }}
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg, var(--color-secondary), var(--color-glow))" }}
          >
            <MagicStick3
              size={14}
              color="#ffffff"
              weight="Bold"
              className={phase === "thinking" || phase === "writing" ? "libra-pulse" : ""}
            />
          </span>

          <div key={`${idx}-${phase}`} className="libra-pop flex-1 text-xs">
            {phase === "prompt" && (
              <span style={{ color: "var(--color-fg)" }}>
                <span style={{ color: "var(--color-accent)", opacity: 0.65 }}>You: </span>
                {scene.prompt}
              </span>
            )}
            {phase === "thinking" && (
              <span className="inline-flex items-center gap-1.5" style={{ color: "var(--color-accent)" }}>
                <span className="inline-flex gap-1">
                  <span className="libra-pulse h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-accent)" }} />
                  <span className="libra-pulse h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-accent)", animationDelay: "0.15s" }} />
                  <span className="libra-pulse h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-accent)", animationDelay: "0.3s" }} />
                </span>
                Libra AI is thinking…
              </span>
            )}
            {phase === "writing" && (
              <span className="libra-shimmer-text font-medium">{scene.working}</span>
            )}
            {phase === "done" && (
              <span className="inline-flex items-center gap-1.5" style={{ color: "var(--color-fg)" }}>
                <CheckCircle size={13} color="var(--color-secondary)" weight="Bold" />
                <span style={{ color: "var(--color-secondary)", fontWeight: 600 }}>{scene.result}</span>
              </span>
            )}
          </div>

          <span
            className="hidden shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold sm:inline"
            style={{ background: "var(--color-surface-border)", color: "var(--color-accent)" }}
          >
            ⌘ Libra AI
          </span>
        </div>
      </div>

      {/* Floating badge — bottom left */}
      <div
        className="libra-float-alt absolute -bottom-5 -left-3 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 shadow-xl md:-left-6"
        style={{ background: "var(--color-bg)", border: "1px solid var(--color-surface-border)" }}
      >
        <Lock size={16} color="var(--color-secondary)" weight="Bold" />
        <span className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>
          Private by default
        </span>
      </div>

      {/* Floating badge — top right */}
      <div
        className="libra-float absolute -right-3 -top-5 hidden items-center gap-2 rounded-2xl px-3.5 py-2.5 shadow-xl md:flex"
        style={{ background: "var(--color-bg)", border: "1px solid var(--color-surface-border)", animationDelay: "1.4s" }}
      >
        <UsersGroupRounded size={16} color="var(--color-secondary)" weight="Bold" />
        <span className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>
          Shared securely
        </span>
      </div>
    </div>
  );
}
