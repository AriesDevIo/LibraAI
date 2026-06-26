"use server";

import { requireUser } from "@/lib/documents";

/**
 * Settings Server Actions. Each goes through `requireUser()` + the cookie-based
 * anon Supabase client, so Row Level Security is the access control (OWASP A01):
 * a user can only ever change their OWN profile or delete their OWN documents.
 * The service-role key is never used here.
 */

/** Update the signed-in user's display name (profiles row, owner-only via RLS). */
export async function updateProfile(
  displayName: string,
): Promise<{ ok: boolean; error?: string }> {
  const name = displayName.trim();
  if (name.length === 0)
    return { ok: false, error: "Display name can’t be empty." };
  if (name.length > 50)
    return { ok: false, error: "Display name is too long (max 50 characters)." };

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Delete ALL of the signed-in user's documents (owner-only via RLS). */
export async function deleteAllDocuments(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
