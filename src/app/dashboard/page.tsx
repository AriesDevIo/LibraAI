import { AltArrowDown } from "@solar-icons/react/ssr";
import { createClient } from "@/lib/supabase/server";
import { HomePrompt } from "./HomePrompt";
import DocumentsSection from "./DocumentsSection";

/**
 * Home tab — AI-first, like AriesAI: a full-height violet hero with a prompt box
 * (the assistant drafts notes, finds images, and can CREATE documents), and the
 * user's documents below the fold. The dedicated Documents tab shows the same
 * list on its own. The shell provides the sidebar/chrome and already gated auth.
 */
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle()
    : { data: null };
  const firstName = (profile?.display_name?.split(" ")[0] || "there").trim();

  return (
    <div style={{ background: "var(--color-bg)" }}>
      {/* Hero — full-height centered prompt over the violet backdrop */}
      <section
        className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(23,20,28,1) 0%, rgba(23,20,28,0.4) 40%, transparent 70%), radial-gradient(ellipse 90% 70% at 50% 100%, var(--color-secondary) 0%, var(--color-primary) 35%, transparent 72%), linear-gradient(180deg, #1b1430 0%, #0f0a1c 100%)",
        }}
      >
        {/* Animated glow blobs (match the auth layout) */}
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: "55%",
            height: "55%",
            top: "10%",
            left: "20%",
            background: "radial-gradient(circle, var(--color-glow) 0%, transparent 70%)",
            opacity: 0.3,
            filter: "blur(52px)",
            animation: "libra-float 8s ease-in-out infinite",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute rounded-full"
          style={{
            width: "45%",
            height: "45%",
            bottom: "8%",
            right: "10%",
            background: "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)",
            opacity: 0.42,
            filter: "blur(52px)",
            animation: "libra-float-alt 9s ease-in-out infinite",
          }}
          aria-hidden="true"
        />
        {/* Subtle grain overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "3px 3px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 w-full py-20">
          <HomePrompt firstName={firstName} />
        </div>

        {/* Scroll cue → documents below the fold */}
        <a
          href="#documents"
          aria-label="Your documents"
          className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 text-white/55 transition-colors hover:text-white/90"
        >
          <span className="text-[11px] font-medium uppercase tracking-wider">Documents</span>
          <span className="motion-safe:animate-bounce">
            <AltArrowDown size={18} color="currentColor" weight="Bold" />
          </span>
        </a>
      </section>

      {/* Documents below the fold (same list as the Documents tab) */}
      <DocumentsSection
        id="documents"
        className="mx-auto w-full max-w-3xl scroll-mt-6 px-4 py-12 sm:px-6"
      />
    </div>
  );
}
