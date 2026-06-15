import Link from "next/link";
import Logo from "@/components/shared/Logo";

interface FooterLink {
  label: string;
  href: string;
}

const footerLinks: FooterLink[] = [
  { label: "Product", href: "#features" },
  { label: "Security", href: "#security" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        borderColor: "var(--color-surface-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-12 sm:px-8 md:flex-row md:justify-between">
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Link href="/" aria-label="Libra home">
            <Logo />
          </Link>
          <p className="text-sm" style={{ color: "var(--color-accent)" }}>
            Built as a security-focused school project.
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="rounded text-sm font-medium transition-opacity duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
                  style={{ color: "var(--color-fg)" }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div
        className="border-t py-5 text-center text-sm"
        style={{
          borderColor: "var(--color-surface-border)",
          color: "var(--color-accent)",
        }}
      >
        © 2026 Libra. All rights reserved.
      </div>
    </footer>
  );
}
