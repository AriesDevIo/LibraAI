import type { Metadata } from "next";
import Canvas from "@/components/canvas/Canvas";

export const metadata: Metadata = {
  title: "Canvas · Libra",
  description: "Libra's freeform canvas — drag, resize, and recolour notes and images on an infinite board.",
};

/**
 * Standalone canvas, reachable from the dashboard sidebar. The shell (Tab 1)
 * provides the chrome, so this renders content only: a full-height host for the
 * self-contained <Canvas/> (local state, XSS-safe — internals unchanged).
 */
export default function DashboardCanvasPage() {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden">
      <Canvas />
    </div>
  );
}
