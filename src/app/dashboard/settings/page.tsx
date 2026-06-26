import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsPanel from "./SettingsPanel";

/**
 * Settings route. The proxy gates /dashboard/*, but we re-check on the server
 * and read the profile (own-row via RLS). Renders inside the dashboard shell.
 */
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <SettingsPanel
      initialDisplayName={profile?.display_name ?? ""}
      email={user.email ?? ""}
      createdAt={user.created_at ?? ""}
    />
  );
}
