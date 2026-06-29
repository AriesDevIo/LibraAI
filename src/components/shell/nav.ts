import type { ComponentProps, ComponentType } from "react";
import { DocumentText, MagicStick3, Settings } from "@solar-icons/react/ssr";

/** All Solar icons share one props shape; type against any of them. */
type SolarIcon = ComponentType<ComponentProps<typeof DocumentText>>;

export interface NavItem {
  href: string;
  label: string;
  Icon: SolarIcon;
}

/**
 * The single source of truth for the authenticated sidebar nav.
 *
 * - Home is the AI: a prompt hero that drafts notes and creates documents, with
 *   the document list below the fold.
 * - Documents is the full document list on its own.
 * The Assistant has no standalone tab — it lives on Home (and inside a document).
 *
 * There is intentionally NO top-level "Canvas" item: the freeform canvas is a
 * view INSIDE a document (Editor ⇄ Canvas), saved on that document's row.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Home", Icon: MagicStick3 },
  { href: "/dashboard/docs", label: "Documents", Icon: DocumentText },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
];

/**
 * Active-link test. Home ("/dashboard") matches only the index; Documents owns
 * the documents list AND the document editor routes (/dashboard/doc/x).
 */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/dashboard/docs") {
    return pathname.startsWith("/dashboard/doc"); // covers /docs and /doc/[id]
  }
  return pathname === href || pathname.startsWith(href + "/");
}
