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
 * There is intentionally NO top-level "Canvas" item: the freeform canvas is a
 * view INSIDE a document (Editor ⇄ Canvas), saved on that document's row — so a
 * standalone, unsaved canvas board would only be a confusing duplicate. The
 * Assistant remains reachable both globally (here) and inside a document.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Documents", Icon: DocumentText },
  { href: "/dashboard/assistant", label: "Assistant", Icon: MagicStick3 },
  { href: "/dashboard/settings", label: "Settings", Icon: Settings },
];

/**
 * Active-link test. "/dashboard" must match exactly (it's the index), while the
 * deeper sections also light up for their nested routes (e.g. /dashboard/doc/x
 * keeps "Documents" active).
 */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    // Documents owns the index AND the document editor routes.
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/doc");
  }
  return pathname === href || pathname.startsWith(href + "/");
}
