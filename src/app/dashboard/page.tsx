import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AddSquare,
  DocumentText,
  TrashBinMinimalistic,
  Logout2,
} from "@solar-icons/react/ssr";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";
import { listDocuments } from "@/lib/documents";
import { createDocument, deleteDocument } from "@/app/dashboard/actions";
import Logo from "@/components/shared/Logo";
import ThemeToggle from "@/components/shared/ThemeToggle";

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
 * Authenticated home: the signed-in user's documents. The proxy gates the
 * route; we re-check on the server. Every document shown comes from
 * `listDocuments()`, which is RLS-scoped to this user (A01).
 */
export default async function DashboardPage() {
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
  const name = profile?.display_name || user.email;

  const docs = await listDocuments();

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg)", color: "var(--color-fg)" }}
    >
      {/* Top chrome */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 sm:px-6"
        style={{
          background: "var(--color-nav-bg)",
          borderBottom: "1px solid var(--color-surface-border)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <Link href="/" aria-label="Libra home">
          <Logo size={28} textClassName="text-lg" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm sm:inline" style={{ color: "var(--color-accent)" }}>
            {name}
          </span>
          <ThemeToggle />
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_12%,transparent)]"
              style={{ color: "var(--color-secondary-text)" }}
            >
              <Logout2 size={14} color="currentColor" weight="Bold" />
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Your documents</h1>
          <form action={createDocument}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--color-secondary)" }}
            >
              <AddSquare size={16} color="#ffffff" weight="Bold" />
              New document
            </button>
          </form>
        </div>

        {docs.length === 0 ? (
          <div
            className="mt-10 rounded-2xl p-10 text-center"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-surface-border)",
            }}
          >
            <DocumentText
              size={32}
              color="var(--color-secondary)"
              weight="Bold"
            />
            <p className="mt-3 font-semibold">No documents yet</p>
            <p className="mt-1 text-sm" style={{ color: "var(--color-accent)" }}>
              Create your first note — it&apos;s saved privately to your account.
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
                <DocumentText
                  size={18}
                  color="var(--color-secondary-text)"
                  weight="Bold"
                />
                <Link
                  href={`/dashboard/doc/${doc.id}`}
                  className="min-w-0 flex-1"
                >
                  <span className="block truncate font-medium">
                    {doc.title || "Untitled"}
                  </span>
                  <span
                    className="block text-xs"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Updated {updatedLabel(doc.updated_at)}
                  </span>
                </Link>
                <form action={deleteDocument.bind(null, doc.id)}>
                  <button
                    type="submit"
                    aria-label={`Delete ${doc.title || "Untitled"}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--color-rose,#e11d48)_14%,transparent)]"
                    style={{ color: "var(--color-accent)" }}
                  >
                    <TrashBinMinimalistic
                      size={16}
                      color="currentColor"
                      weight="Bold"
                    />
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
