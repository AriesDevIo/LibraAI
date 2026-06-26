import type { Metadata } from "next";
import AssistantPanel from "@/components/ai/AssistantPanel";

export const metadata: Metadata = {
  title: "Assistant · Libra",
  description:
    "Libra's built-in AI assistant — draft and refine notes, summarize ideas, and pull in images, powered by Claude.",
};

/**
 * Standalone AI assistant, reachable from the dashboard sidebar. The shell
 * (Tab 1) provides the chrome, so this renders content only: the streaming
 * <AssistantPanel/> inside a centered surface card. No document context here —
 * that variant lives in the document workspace.
 */
export default function DashboardAssistantPage() {
  return (
    <div className="h-[100dvh] p-4 sm:p-6">
      <div
        className="mx-auto flex h-full max-w-2xl flex-col rounded-2xl p-3 sm:p-4"
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-surface-border)",
        }}
      >
        <AssistantPanel />
      </div>
    </div>
  );
}
