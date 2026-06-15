"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ClockCircle,
  DangerTriangle,
  Letter,
  LockPassword,
  ShieldKeyhole,
} from "@solar-icons/react/ssr";
import {
  loginWithEmail,
  verifyEmailCode,
  type AuthState,
} from "@/app/(auth)/actions";

/**
 * Passwordless email login — a single page with two steps (OWASP A07):
 *
 *   1. Enter email  → `loginWithEmail` sends a 6-digit code, returns { sent: true }.
 *   2. Enter code   → `verifyEmailCode` checks { email, token } and (on success)
 *                     redirects server-side.
 *
 * Each step is backed by its own `useActionState` so the email and code actions
 * keep independent error/pending state. The active step is derived from
 * `emailState.sent` (with a local override so the user can edit their email).
 *
 * All colour comes from the Libra design tokens — no hardcoded hex — so the form
 * tracks light/dark automatically.
 */
export default function LoginForm() {
  const [emailState, sendEmail, sendingEmail] = useActionState<
    AuthState,
    FormData
  >(loginWithEmail, {});
  const [codeState, verifyCode, verifyingCode] = useActionState<
    AuthState,
    FormData
  >(verifyEmailCode, {});

  // The email is captured in step 1 and replayed (hidden) into step 2 + resend.
  const [email, setEmail] = useState("");
  // Lets the user jump back to step 1 to fix a typo without losing the code view.
  const [editingEmail, setEditingEmail] = useState(false);
  // Client-side resend throttle — complements the server-side rate limiter.
  const [cooldown, setCooldown] = useState(0);

  const codeSent = emailState.sent === true && !editingEmail;

  const codeInputRef = useRef<HTMLInputElement>(null);

  // Move focus to the code field as soon as step 2 appears.
  useEffect(() => {
    if (codeSent) codeInputRef.current?.focus();
  }, [codeSent]);

  // Tick the resend cooldown down to zero.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  function handleResend() {
    if (cooldown > 0 || sendingEmail || !email) return;
    const data = new FormData();
    data.set("email", email);
    sendEmail(data);
    setCooldown(30);
  }

  return (
    <div className="w-full">
      {/* ─── Header (adapts to the active step) ─── */}
      <div className="mb-8 flex flex-col gap-4">
        <span
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            background:
              "color-mix(in srgb, var(--color-secondary) 12%, transparent)",
            border:
              "1px solid color-mix(in srgb, var(--color-secondary) 22%, transparent)",
          }}
          aria-hidden="true"
        >
          {codeSent ? (
            <LockPassword
              size={22}
              weight="Bold"
              color="var(--color-secondary)"
            />
          ) : (
            <ShieldKeyhole
              size={22}
              weight="Bold"
              color="var(--color-secondary)"
            />
          )}
        </span>

        <div>
          <h1
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: "var(--color-fg)" }}
          >
            {codeSent ? "Enter your code" : "Welcome back"}
          </h1>
          <p
            className="mt-1.5 text-sm leading-relaxed"
            style={{ color: "var(--color-accent)" }}
          >
            {codeSent ? (
              <>
                We sent a 6-digit code to{" "}
                <span className="font-semibold" style={{ color: "var(--color-fg)" }}>
                  {email}
                </span>
                .
              </>
            ) : (
              "Sign in to Libra with a one-time code — no password to remember."
            )}
          </p>
        </div>
      </div>

      {/* ─── Step content ─── */}
      {codeSent ? (
        // ── Step 2: verify the 6-digit code ──
        <form
          key="code-step"
          action={verifyCode}
          className="libra-fade-in flex flex-col gap-4"
        >
          {/* Carry the verified email forward for verifyEmailCode({ email, token }). */}
          <input type="hidden" name="email" value={email} readOnly />

          <label className="flex flex-col gap-1.5">
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--color-fg)" }}
            >
              6-digit code
            </span>
            <input
              ref={codeInputRef}
              name="token"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              required
              placeholder="••••••"
              aria-describedby="code-hint"
              className="w-full rounded-xl px-4 py-3 text-center text-2xl font-semibold tracking-[0.4em] outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)]"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-surface-border)",
                color: "var(--color-fg)",
              }}
            />
          </label>

          <p id="code-hint" className="text-xs" style={{ color: "var(--color-accent)" }}>
            The code expires shortly. Check your spam folder if it hasn&apos;t arrived.
          </p>

          <FormAlert state={codeState} />

          <button
            type="submit"
            disabled={verifyingCode}
            className="mt-2 w-full cursor-pointer rounded-xl py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.01] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            style={{ background: "var(--color-secondary)", color: "white" }}
          >
            {verifyingCode ? "Verifying…" : "Verify & continue"}
          </button>

          {/* Resend + edit-email controls */}
          <div className="mt-1 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setEditingEmail(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 font-medium transition-opacity duration-150 hover:opacity-80"
              style={{ color: "var(--color-accent)" }}
            >
              <ArrowLeft size={14} weight="Bold" color="currentColor" />
              Use a different email
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || sendingEmail}
              className="cursor-pointer font-semibold transition-opacity duration-150 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ color: "var(--color-secondary-text)" }}
            >
              {sendingEmail
                ? "Sending…"
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend code"}
            </button>
          </div>
        </form>
      ) : (
        // ── Step 1: request a code by email ──
        <form
          key="email-step"
          action={sendEmail}
          // A fresh submit always lands the user back on the code step.
          onSubmit={() => setEditingEmail(false)}
          className="libra-fade-in flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1.5">
            <span
              className="text-xs font-semibold"
              style={{ color: "var(--color-fg)" }}
            >
              Email
            </span>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              >
                <Letter size={18} weight="Bold" color="var(--color-accent)" />
              </span>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                required
                className="w-full rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-[var(--color-secondary)]"
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-surface-border)",
                  color: "var(--color-fg)",
                }}
              />
            </div>
          </label>

          <FormAlert state={emailState} />

          <button
            type="submit"
            disabled={sendingEmail}
            className="mt-2 w-full cursor-pointer rounded-xl py-3 text-sm font-semibold transition-all duration-200 hover:scale-[1.01] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            style={{ background: "var(--color-secondary)", color: "white" }}
          >
            {sendingEmail ? "Sending code…" : "Continue with email"}
          </button>
        </form>
      )}

      {/* ─── Footer: register link ─── */}
      <p
        className="mt-7 text-center text-sm"
        style={{ color: "var(--color-accent)" }}
      >
        New here?{" "}
        <Link
          href="/register"
          className="font-semibold transition-colors duration-150 hover:underline"
          style={{ color: "var(--color-secondary-text)" }}
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

/**
 * Heuristic for the rate-limit (HTTP 429) path — see test T04. The action
 * surfaces 429s through `AuthState.error`, so we sniff the message rather than
 * depend on a field outside the shared contract (`error` + `sent`). Supabase's
 * own throttle copy ("for security purposes…", "email rate limit exceeded") is
 * covered alongside generic phrasing.
 */
function isRateLimited(message?: string | null): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("429") ||
    m.includes("rate limit") ||
    m.includes("rate-limit") ||
    m.includes("too many") ||
    m.includes("for security purposes") ||
    m.includes("slow down")
  );
}

/**
 * Inline, accessible alert for an action's error. Rate-limit errors get a
 * distinct, friendlier "slow down" treatment; everything else is a plain error.
 * Both are built purely from design tokens so they theme cleanly.
 */
function FormAlert({ state }: { state: AuthState }) {
  if (!state.error) return null;

  const rateLimited = isRateLimited(state.error);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-start gap-2.5 rounded-xl px-3.5 py-3"
      style={{
        background: "color-mix(in srgb, var(--color-secondary) 9%, transparent)",
        border:
          "1px solid color-mix(in srgb, var(--color-secondary) 24%, transparent)",
      }}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        {rateLimited ? (
          <ClockCircle size={18} weight="Bold" color="var(--color-secondary-text)" />
        ) : (
          <DangerTriangle size={18} weight="Bold" color="var(--color-secondary-text)" />
        )}
      </span>
      <div className="flex flex-col gap-0.5">
        <p className="text-xs font-semibold" style={{ color: "var(--color-fg)" }}>
          {rateLimited ? "Too many attempts" : "Something went wrong"}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--color-accent)" }}>
          {rateLimited
            ? "Please wait a moment before trying again."
            : state.error}
        </p>
      </div>
    </div>
  );
}
