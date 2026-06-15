import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Log in · Libra",
  description:
    "Sign in to Libra with a one-time code sent to your email — passwordless by design.",
};

/**
 * /login — passwordless email sign-in (OWASP A07).
 *
 * Server component: the surrounding two-column chrome comes from the shared
 * (auth) layout, so this page only mounts the interactive client form. All
 * state, validation, and the two-step (email → code) flow live in LoginForm.
 */
export default function LoginPage() {
  return <LoginForm />;
}
