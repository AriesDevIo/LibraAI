"use client";

import SidebarContent from "./SidebarContent";

interface SidebarProps {
  displayName: string;
  email: string;
}

/**
 * The persistent left sidebar on md+ screens. Sticky, full-height, glass
 * surface — mirrors AriesAI's shell structure with Libra's violet tokens.
 * Hidden on small screens, where <MobileNav> provides a drawer instead.
 */
export default function Sidebar({ displayName, email }: SidebarProps) {
  return (
    <aside
      className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col md:flex"
      style={{
        background: "var(--color-surface)",
        borderRight: "1px solid var(--color-surface-border)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <SidebarContent displayName={displayName} email={email} />
    </aside>
  );
}
