import Link from "next/link";
import { AddSquare, DocumentText, TrashBinMinimalistic } from "@solar-icons/react/ssr";
import { listDocuments } from "@/lib/documents";
import { createDocument, deleteDocument } from "@/app/dashboard/actions";

/** Format an ISO timestamp as a short, locale-aware "updated" label. */
function updatedLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * The signed-in user's document list (RLS-scoped — A01), with a "New document"
 * action. Shared by the Home tab (below the AI hero) and the dedicated
 * Documents tab so the two stay identical. Server Component — fetches on render.
 */
export default async function DocumentsSection({
  id,
  heading = "Your documents",
  className = "mx-auto w-full max-w-3xl px-4 py-12 sm:px-6",
}: {
  id?: string;
  heading?: string;
  className?: string;
}) {
  const docs = await listDocuments();

  return (
    <section id={id} className={className}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
          {heading}
        </h2>
        <form action={createDocument}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
            style={{ background: "var(--color-secondary)" }}
          >
            <AddSquare size={16} color="#ffffff" weight="Bold" />
            New document
          </button>
        </form>
      </div>

      {docs.length === 0 ? (
        <div
          className="mt-6 rounded-2xl p-10 text-center"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-surface-border)",
          }}
        >
          <DocumentText size={32} color="var(--color-secondary)" weight="Bold" />
          <p className="mt-3 font-semibold" style={{ color: "var(--color-fg)" }}>
            No documents yet
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--color-accent)" }}>
            Ask the assistant on the Home tab to create one, or start a blank note — it&apos;s
            saved privately to your account.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_7%,transparent)]"
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-surface-border)",
              }}
            >
              <DocumentText size={18} color="var(--color-secondary-text)" weight="Bold" />
              <Link href={`/dashboard/doc/${doc.id}`} className="min-w-0 flex-1">
                <span className="block truncate font-medium" style={{ color: "var(--color-fg)" }}>
                  {doc.title || "Untitled"}
                </span>
                <span className="block text-xs" style={{ color: "var(--color-accent)" }}>
                  Updated {updatedLabel(doc.updated_at)}
                </span>
              </Link>
              <form action={deleteDocument.bind(null, doc.id)}>
                <button
                  type="submit"
                  aria-label={`Delete ${doc.title || "Untitled"}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--color-rose,#e11d48)_14%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
                  style={{ color: "var(--color-accent)" }}
                >
                  <TrashBinMinimalistic size={16} color="currentColor" weight="Bold" />
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
