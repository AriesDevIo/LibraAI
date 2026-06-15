import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import Logo from "@/components/shared/Logo";

/**
 * Minimal authenticated landing. The proxy already gates this route, but we
 * re-check on the server and read the profile so the page never renders for an
 * anonymous request. Placeholder until the real editor/canvas dashboard lands.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Own-row read — succeeds only because RLS lets a user see their own profile.
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const name = profile?.display_name || user.email;

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: "var(--color-bg)", color: "var(--color-fg)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 text-center"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-surface-border)",
          animation: "libra-fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div className="flex justify-center">
          <Logo size={40} />
        </div>
        <h1 className="mt-6 text-2xl font-extrabold tracking-tight">
          Welcome, {name} 👋
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--color-accent)" }}>
          You&apos;re signed in to Libra. The editor, canvas, and AI assistant
          land here next.
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--color-accent)" }}>
          {user.email}
        </p>

        <form action={signOut} className="mt-8">
          <button
            type="submit"
            className="w-full rounded-full py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "var(--color-secondary)", color: "#ffffff" }}
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
