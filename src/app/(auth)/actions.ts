"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * Shared form-action state for the login & register pages (via useActionState).
 * `sent` flips the UI to the "enter your code" step; `error` shows inline.
 */
export type AuthState = { sent?: boolean; error?: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Maps Supabase errors to a friendly message + flags the rate-limit case (A07/T04). */
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("rate") || m.includes("too many") || m.includes("429")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  return message;
}

function isEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Passwordless LOGIN — emails a 6-digit code + magic link to an EXISTING user.
 * `shouldCreateUser: false` means logins never create accounts. Supabase
 * intentionally returns success even when the email is unknown, which avoids
 * user-enumeration — so we always advance to the code step on success.
 */
export async function loginWithEmail(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email");
  if (!isEmail(email)) return { error: "Enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    // Supabase returns "Signups not allowed for otp" when no account exists
    // (login never creates users). Guide them to register instead of leaking
    // the raw error.
    if (error.message.toLowerCase().includes("signups not allowed")) {
      return {
        error: "No Libra account uses that email yet — create one to get started.",
      };
    }
    return { error: friendlyError(error.message) };
  }
  return { sent: true };
}

/**
 * Passwordless REGISTER — emails a code + magic link and creates the account
 * on verification. An optional display name is stored in user metadata and
 * copied into `profiles` by the DB trigger.
 */
export async function registerWithEmail(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email");
  const displayName = (formData.get("displayName") as string | null)?.trim();
  if (!isEmail(email)) return { error: "Enter a valid email address." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: displayName ? { display_name: displayName } : undefined,
      emailRedirectTo: `${SITE_URL}/auth/callback`,
    },
  });

  if (error) return { error: friendlyError(error.message) };
  return { sent: true };
}

/** Verifies the 6-digit email code, establishing the session. */
export async function verifyEmailCode(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email");
  const token = (formData.get("token") as string | null)?.trim();
  if (!isEmail(email)) return { error: "Something went wrong — start over." };
  if (!token || !/^\d{6}$/.test(token)) {
    return { sent: true, error: "Enter the 6-digit code from your email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) return { sent: true, error: friendlyError(error.message) };
  redirect("/dashboard");
}

/** Signs the user out and returns them to the landing page. */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
