"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  registerWithEmail,
  verifyEmailCode,
  type AuthState,
} from "@/app/(auth)/actions";

/* ------------------------------------------------------------------ *
 * Libra · passwordless email registration (OWASP A07)
 * Step 1: email (+ optional display name)  →  registerWithEmail
 * Step 2: 6-digit code { email, token }     →  verifyEmailCode
 * Both actions return an `AuthState`; `{ sent: true }` advances to step 2.
 * ------------------------------------------------------------------ */

const EMPTY: AuthState = {};

// Inline styles read live from the design tokens so the form tracks
// light/dark automatically. `--tw-ring-color` feeds Tailwind's focus ring.
const inputStyle = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-surface-border)",
  color: "var(--color-fg)",
  "--tw-ring-color": "var(--color-secondary)",
} as React.CSSProperties;

const ghostButtonStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-surface-border)",
  color: "var(--color-fg)",
};

// A rate-limited response (HTTP 429, plan test T04) comes back through the
// same `error` channel — recognise it so we can soften the messaging instead
// of showing an alarming red error.
function looksRateLimited(message?: string | null) {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("429") ||
    m.includes("rate") ||
    m.includes("too many") ||
    m.includes("slow down") ||
    m.includes("try again") ||
    m.includes("temporarily") ||
    m.includes("wait")
  );
}

function Notice({ message }: { message?: string | null }) {
  if (!message) return null;
  const calm = looksRateLimited(message);
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-medium"
      style={{
        background: calm ? "rgba(217,119,6,0.12)" : "rgba(229,72,77,0.12)",
        color: calm ? "#b45309" : "#e5484d",
      }}
    >
      <span className="mt-px shrink-0" aria-hidden="true">
        {calm ? <ClockIcon /> : <WarnIcon />}
      </span>
      <span>{message}</span>
    </div>
  );
}

export default function RegisterForm() {
  const [registerState, registerAction, registerPending] = useActionState(
    registerWithEmail,
    EMPTY,
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyEmailCode,
    EMPTY,
  );

  const [step, setStep] = useState<"enter" | "verify">("enter");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [token, setToken] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Advance to the code step whenever a send succeeds (initial submit or
  // resend). `registerState` is a fresh object after every action, so this
  // fires on each successful send.
  useEffect(() => {
    if (registerState.sent) {
      setStep("verify");
      setToken("");
    }
  }, [registerState]);

  // Resend cooldown tick.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  /* ----------------------------- Step 2 ----------------------------- */
  if (step === "verify") {
    return (
      <div key="verify" className="w-full libra-fade-in">
        <button
          type="button"
          onClick={() => setStep("enter")}
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 transition-opacity duration-150 hover:opacity-80 cursor-pointer"
          style={{ color: "var(--color-accent)" }}
        >
          <ArrowLeftIcon />
          Use a different email
        </button>

        <div className="mb-7">
          <div className="mb-4">
            <MailBadge />
          </div>
          <h1
            className="text-3xl font-extrabold tracking-tight mb-2"
            style={{ color: "var(--color-fg)" }}
          >
            Check your email
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-accent)" }}>
            We sent a 6-digit code to{" "}
            <span className="font-semibold" style={{ color: "var(--color-fg)" }}>
              {email || "your inbox"}
            </span>
            . Enter it below to finish creating your account.
          </p>
        </div>

        <form action={verifyAction} className="flex flex-col gap-4">
          <input type="hidden" name="email" value={email} />
          <label htmlFor="token" className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>
              Verification code
            </span>
            <input
              id="token"
              name="token"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              autoFocus
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              aria-describedby="code-help"
              className="w-full px-4 py-4 rounded-xl text-center text-2xl font-semibold tracking-[0.5em] outline-none transition-all duration-200 focus:ring-2"
              style={inputStyle}
            />
          </label>

          <p id="code-help" className="text-xs px-1" style={{ color: "var(--color-accent)" }}>
            The code expires shortly. Didn&apos;t get it? Check your spam folder or resend below.
          </p>

          <Notice message={verifyState.error} />

          <button
            type="submit"
            disabled={verifyPending || token.length !== 6}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            style={{ background: "var(--color-secondary)", color: "white" }}
          >
            {verifyPending ? "Verifying…" : "Verify & continue"}
          </button>
        </form>

        {/* Resend re-runs the step-1 action; cooldown + 429 handling guard T04. */}
        <form action={registerAction} className="mt-4 flex flex-col items-center gap-2">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="displayName" value={displayName} />
          <button
            type="submit"
            onClick={() => setCooldown(30)}
            disabled={registerPending || cooldown > 0}
            className="text-xs font-medium transition-opacity duration-150 hover:opacity-80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: "var(--color-secondary-text)" }}
          >
            {registerPending
              ? "Sending…"
              : cooldown > 0
                ? `Resend code in ${cooldown}s`
                : "Resend code"}
          </button>
          {/* A resend that gets rate-limited reports through registerState. */}
          {!registerState.sent && registerState.error && (
            <Notice message={registerState.error} />
          )}
        </form>

        <p className="text-center text-sm mt-7" style={{ color: "var(--color-accent)" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold transition-colors duration-150 hover:underline"
            style={{ color: "var(--color-secondary-text)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  /* ----------------------------- Step 1 ----------------------------- */
  return (
    <div key="enter" className="w-full libra-fade-in">
      <div className="mb-7">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 mb-4 text-[11px] font-medium"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-surface-border)",
            color: "var(--color-secondary-text)",
          }}
        >
          <LockIcon />
          Passwordless — no password to leak
        </span>
        <h1
          className="text-3xl font-extrabold tracking-tight mb-2"
          style={{ color: "var(--color-fg)" }}
        >
          Create your account
        </h1>
        <p className="text-sm" style={{ color: "var(--color-accent)" }}>
          Sign up for Libra — we&apos;ll email you a one-time code, no password
          required.
        </p>
      </div>

      <form action={registerAction} className="flex flex-col gap-4">
        <label htmlFor="displayName" className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>
            Display name{" "}
            <span className="font-normal" style={{ color: "var(--color-accent)" }}>
              (optional)
            </span>
          </span>
          <input
            id="displayName"
            name="displayName"
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
            style={inputStyle}
          />
        </label>

        <label htmlFor="email" className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>
            Email
          </span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:ring-2"
            style={inputStyle}
          />
        </label>

        <Notice message={registerState.error} />

        <button
          type="submit"
          disabled={registerPending}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.01] hover:shadow-lg cursor-pointer mt-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          style={{ background: "var(--color-secondary)", color: "white" }}
        >
          {registerPending ? "Sending code…" : "Continue with email"}
        </button>
      </form>

      <p className="text-xs leading-relaxed mt-4 px-1" style={{ color: "var(--color-accent)" }}>
        By continuing you agree to the Terms below — we&apos;ll only email you a
        one-time sign-in code.
      </p>

      <p className="text-center text-sm mt-6" style={{ color: "var(--color-accent)" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold transition-colors duration-150 hover:underline"
          style={{ color: "var(--color-secondary-text)" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

/* ------------------------------- Icons ------------------------------- */

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="11" width="16" height="10" rx="2" fill="currentColor" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MailBadge() {
  return (
    <span
      className="inline-flex items-center justify-center rounded-2xl"
      style={{
        width: 48,
        height: 48,
        background: "var(--color-surface)",
        border: "1px solid var(--color-surface-border)",
        color: "var(--color-secondary-text)",
      }}
      aria-hidden="true"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
        <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4 2 20h20L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M12 10v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
