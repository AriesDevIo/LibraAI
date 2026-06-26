"use client";

import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

interface AppShellProps {
  displayName: string;
  email: string;
  children: ReactNode;
}

/**
 * The authenticated app shell: a fixed left <Sidebar> on md+, a <MobileNav>
 * drawer on small screens, and a scrollable content area for the page. Rendered
 * by src/app/dashboard/layout.tsx around every /dashboard/* page, so individual
 * pages render only their own content — no per-page chrome.
 *
 * `children` is server-rendered and passed straight through (the supported
 * Server-in-Client interleaving pattern).
 */
export default function AppShell({
  displayName,
  email,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-bg)" }}>
      <Sidebar displayName={displayName} email={email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav displayName={displayName} email={email} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
