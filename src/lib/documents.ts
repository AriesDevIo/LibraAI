import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Block } from "@/components/editor/types";

/**
 * Per-user document data layer. Every call goes through the cookie-based server
 * Supabase client (anon key), so **Row Level Security is the access control**
 * (OWASP A01): the `documents` policies are scoped to `auth.uid() = user_id`,
 * meaning a user can only ever read/write their own rows — even by guessing
 * another row's UUID (pentest T01). We never use the service-role key here.
 */

export interface DocumentMeta {
  id: string;
  title: string;
  updated_at: string;
}

export interface DocumentRecord {
  id: string;
  title: string;
  content: Block[];
}

/** Resolve the signed-in user or bounce to /login. Shared with the dashboard
 *  Server Actions ([[src/app/dashboard/actions.ts]]). */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/** List the current user's documents (most recently updated first). */
export async function listDocuments(): Promise<DocumentMeta[]> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * Fetch one document by id. Returns null when the row doesn't exist OR RLS
 * hides it (another user's document) — the caller renders a 404 either way, so
 * a user can never tell whether someone else's document exists (A01/T01).
 */
export async function getDocument(id: string): Promise<DocumentRecord | null> {
  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, content")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    title: data.title,
    content: Array.isArray(data.content) ? (data.content as Block[]) : [],
  };
}

/* Mutations (createDocument / updateDocument / deleteDocument) are Server
 * Actions and live in `src/app/dashboard/actions.ts` (a "use server" module).
 * Keeping them out of this read layer lets Client Components import the actions
 * without pulling this module's server-only deps (next/headers, the Supabase
 * server client) into the browser bundle. */
