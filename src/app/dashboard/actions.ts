"use server";

import { redirect } from "next/navigation";
import type { Block } from "@/components/editor/types";
import { sanitizeCanvas, type CanvasObject } from "@/components/canvas/types";
import { requireUser } from "@/lib/documents";

/**
 * Document mutations as Server Actions. They live in this dedicated "use server"
 * module so a Client Component (e.g. DocEditor) can import them as RPC
 * references without dragging the server-only data layer (`next/headers`,
 * Supabase server client) into the browser bundle.
 *
 * Every call goes through `requireUser()` + the cookie-based anon client, so
 * Row Level Security remains the access control (OWASP A01): a user can only
 * ever mutate their own rows. The service-role key is never used here.
 */

/** Create an empty document and open it. */
export async function createDocument(): Promise<void> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("documents")
    .insert({ user_id: user.id, title: "Untitled", content: [] })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  redirect(`/dashboard/doc/${data.id}`);
}

/** Save title and/or blocks. RLS guarantees only the owner's row is touched. */
export async function updateDocument(
  id: string,
  patch: { title?: string; content?: Block[]; canvas?: CanvasObject[] },
): Promise<{ ok: boolean; error?: string }> {
  const { supabase } = await requireUser();
  const update: Record<string, unknown> = {};
  if (patch.title !== undefined) update.title = patch.title;
  if (patch.content !== undefined) update.content = patch.content;
  // Re-sanitise on the server too (defence in depth) before storing.
  if (patch.canvas !== undefined) update.canvas = sanitizeCanvas(patch.canvas);
  if (Object.keys(update).length === 0) return { ok: true };

  let { error } = await supabase.from("documents").update(update).eq("id", id);
  // Tolerate a database without the canvas column yet: retry without it so the
  // rest of the document still saves.
  if (error && "canvas" in update) {
    delete update.canvas;
    if (Object.keys(update).length === 0) return { ok: true };
    ({ error } = await supabase.from("documents").update(update).eq("id", id));
  }
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Delete a document (owner-only via RLS) and return to the dashboard. */
export async function deleteDocument(id: string): Promise<void> {
  const { supabase } = await requireUser();
  await supabase.from("documents").delete().eq("id", id);
  redirect("/dashboard");
}
