import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/shell/AppShell";

/**
 * Authenticated shell for the whole /dashboard subtree (Server Component).
 *
 * Gates the route (redirect to /login when signed out, like dashboard/page.tsx
 * did), loads the user's profile display name, and wraps every child page in the
 * client <AppShell> (sidebar + mobile drawer + content). Child pages therefore
 * render only their own content — the shell owns all chrome.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const email = user.email ?? "";
  const displayName = profile?.display_name?.trim() || email || "Your account";

  return (
    <AppShell displayName={displayName} email={email}>
      {children}
    </AppShell>
  );
}
