import Link from "next/link";
import Logo from "@/components/shared/Logo";
import ThemeToggle from "@/components/shared/ThemeToggle";
import PillLink from "@/components/shared/PillLink";

/**
 * Fixed, glassy navigation bar. Auth routes (/login, /register) do not exist
 * yet — these are intentional placeholder links for a future step.
 */
export default function Navbar() {
  return (
    <header
      className="libra-fade-in fixed inset-x-0 top-0 z-50 border-b"
      style={{
        backgroundColor: "var(--color-nav-bg)",
        borderColor: "var(--color-surface-border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          aria-label="Libra home"
          className="rounded-lg transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
        >
          <Logo />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)] sm:inline-flex"
            style={{ color: "var(--color-fg)" }}
          >
            Sign in
          </Link>

          <PillLink href="/register" size="sm">
            Get started
          </PillLink>
        </div>
      </nav>
    </header>
  );
}
