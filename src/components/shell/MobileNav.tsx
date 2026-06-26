"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HamburgerMenu, CloseSquare } from "@solar-icons/react/ssr";
import Logo from "@/components/shared/Logo";
import SidebarContent from "./SidebarContent";

interface MobileNavProps {
  displayName: string;
  email: string;
}

/**
 * Small-screen navigation: a sticky top bar with a hamburger that opens a
 * slide-over drawer reusing <SidebarContent>. Hidden on md+ (the fixed
 * <Sidebar> takes over).
 *
 * Accessibility: the drawer is a labelled modal dialog, closes on Escape,
 * backdrop click, and route change; focus moves to the close button on open;
 * body scroll is locked while open; and the closed drawer is `inert` so its
 * links stay out of the tab order and the a11y tree.
 */
export default function MobileNav({ displayName, email }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // The drawer closes itself on navigation via each link's `onNavigate`
  // (and on Escape / backdrop click below), so no route-watching effect is
  // needed — which also keeps it free of setState-in-effect.

  // While open: focus the close button, lock body scroll, close on Escape.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 md:hidden"
        style={{
          background: "var(--color-nav-bg)",
          borderBottom: "1px solid var(--color-surface-border)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={open}
          aria-controls="mobile-drawer"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_12%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
          style={{ color: "var(--color-fg)" }}
        >
          <HamburgerMenu size={20} color="currentColor" weight="Bold" />
        </button>
        <Link
          href="/dashboard"
          aria-label="Libra dashboard"
          className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
        >
          <Logo size={24} textClassName="text-base" />
        </Link>
      </div>

      {/* Slide-over drawer (mobile only). `inert` when closed removes it from
          tab order + a11y tree; pointer-events-none lets the page behind it
          stay clickable. */}
      <div
        id="mobile-drawer"
        className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
        inert={!open}
      >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          aria-hidden="true"
          className={`absolute inset-0 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: "color-mix(in srgb, var(--color-fg) 45%, transparent)",
          }}
        />

        {/* Panel */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`absolute inset-y-0 left-0 flex w-72 max-w-[82%] flex-col shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            background: "var(--color-bg)",
            borderRight: "1px solid var(--color-surface-border)",
          }}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="absolute right-3 top-4 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_12%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
            style={{ color: "var(--color-accent)" }}
          >
            <CloseSquare size={20} color="currentColor" weight="Bold" />
          </button>
          <SidebarContent
            displayName={displayName}
            email={email}
            onNavigate={() => setOpen(false)}
          />
        </div>
      </div>
    </>
  );
}
