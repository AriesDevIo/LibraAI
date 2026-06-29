import { notFound } from "next/navigation";
import { getDocument } from "@/lib/documents";
import DocEditor from "./DocEditor";

/**
 * One document. `getDocument` is RLS-scoped, so requesting another user's id
 * returns null → 404 here. A user can never load (or even confirm the
 * existence of) someone else's document — OWASP A01 / pentest T01.
 *
 * In this Next.js, route `params` is a Promise and must be awaited.
 */
export default async function DocPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) notFound();

  return (
    <DocEditor
      docId={doc.id}
      initialTitle={doc.title}
      initialBlocks={doc.content}
      initialCanvas={doc.canvas}
    />
  );
}
