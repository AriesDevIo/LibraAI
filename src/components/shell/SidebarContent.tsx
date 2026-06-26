"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logout2 } from "@solar-icons/react/ssr";
import Logo from "@/components/shared/Logo";
import ThemeToggle from "@/components/shared/ThemeToggle";
import { signOut } from "@/app/(auth)/actions";
import { NAV_ITEMS, isActive } from "./nav";

interface SidebarContentProps {
  displayName: string;
  email: string;
  /** Called when a nav link / brand is clicked — used by the mobile drawer to
   *  close itself on navigation. */
  onNavigate?: () => void;
}

/**
 * The inner sidebar UI, shared by the fixed desktop <Sidebar> and the mobile
 * drawer in <MobileNav> so there's a single nav + user card to maintain.
 *
 * All colour comes from Libra's design tokens (no hardcoded hex). `displayName`
 * and `email` are rendered as React text nodes, so they're escaped — consistent
 * with the project's XSS-safe posture (A05).
 */
export default function SidebarContent({
  displayName,
  email,
  onNavigate,
}: SidebarContentProps) {
  const pathname = usePathname();
  const initial = (displayName.trim()[0] || email.trim()[0] || "?").toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-5 py-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          aria-label="Libra dashboard"
          className="inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
        >
          <Logo size={26} textClassName="text-lg" />
        </Link>
      </div>

      {/* Primary navigation */}
      <nav
        aria-label="Primary"
        className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2"
      >
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150 hover:bg-[color-mix(in_srgb,var(--color-secondary)_8%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
              style={{
                background: active
                  ? "color-mix(in srgb, var(--color-secondary) 14%, transparent)"
                  : "transparent",
                color: active
                  ? "var(--color-secondary-text)"
                  : "var(--color-accent)",
                border: active
                  ? "1px solid color-mix(in srgb, var(--color-secondary) 24%, transparent)"
                  : "1px solid transparent",
              }}
            >
              <Icon size={18} color="currentColor" weight="Bold" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User card + controls */}
      <div
        className="px-3 py-3"
        style={{ borderTop: "1px solid var(--color-surface-border)" }}
      >
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{
              background:
                "linear-gradient(135deg, var(--color-secondary), var(--color-glow))",
            }}
            aria-hidden="true"
          >
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-semibold"
              style={{ color: "var(--color-fg)" }}
            >
              {displayName}
            </p>
            <p
              className="truncate text-xs"
              style={{ color: "var(--color-accent)" }}
            >
              {email}
            </p>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 px-1">
          <ThemeToggle />
          <form action={signOut}>
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-[color-mix(in_srgb,var(--color-secondary)_12%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)]"
              style={{ color: "var(--color-secondary-text)" }}
            >
              <Logout2 size={14} color="currentColor" weight="Bold" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
