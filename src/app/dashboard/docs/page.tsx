import type { Metadata } from "next";
import DocumentsSection from "../DocumentsSection";

export const metadata: Metadata = {
  title: "Documents · Libra",
  description: "All your Libra documents.",
};

/**
 * Documents tab — the full list of the user's documents (same component the
 * Home tab shows below its AI hero). Content only; the shell provides chrome.
 */
export default function DocsPage() {
  return (
    <DocumentsSection
      heading="Documents"
      className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10"
    />
  );
}
