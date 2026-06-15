import Link from "next/link";
import { ArrowLeft, ShieldKeyhole, Pen2, MagicStick3 } from "@solar-icons/react/ssr";
import Logo from "@/components/shared/Logo";

/**
 * Shared chrome for /login and /register: a centered form column on the left
 * and a branded violet panel on the right (hidden on small screens). Login and
 * register pages render only their form into `children`.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen w-full grid lg:grid-cols-2"
      style={{ background: "var(--color-bg)" }}
    >
      {/* ─── Left: form column ─── */}
      <div className="relative flex flex-col min-h-screen px-6 sm:px-10 lg:px-16 py-10">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Libra home">
            <Logo size={32} />
          </Link>
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium transition-opacity duration-150 hover:opacity-80"
            style={{ color: "var(--color-accent)" }}
          >
            <ArrowLeft size={14} color="currentColor" weight="Bold" />
            Back to home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <div
            className="w-full max-w-sm"
            style={{
              animation:
                "libra-fade-up 0.55s cubic-bezier(0.16,1,0.3,1) 0.05s both",
            }}
          >
            {children}
          </div>
        </div>

        <p className="text-center text-xs" style={{ color: "var(--color-accent)" }}>
          By continuing, you agree to our{" "}
          <Link href="/terms" className="underline hover:opacity-80">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:opacity-80">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* ─── Right: branded violet panel ─── */}
      <div className="hidden lg:block relative overflow-hidden p-3">
        <div
          className="relative w-full h-full rounded-3xl overflow-hidden flex items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 50% 100%, var(--color-secondary) 0%, var(--color-primary) 38%, transparent 72%), linear-gradient(180deg, #1b1430 0%, #0f0a1c 100%)",
          }}
        >
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: "60%",
              height: "55%",
              top: "8%",
              left: "20%",
              background:
                "radial-gradient(circle, var(--color-glow) 0%, transparent 70%)",
              opacity: 0.3,
              filter: "blur(48px)",
              animation: "libra-float 8s ease-in-out infinite",
            }}
            aria-hidden="true"
          />
          <div
            className="absolute pointer-events-none rounded-full"
            style={{
              width: "50%",
              height: "45%",
              bottom: "8%",
              right: "10%",
              background:
                "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)",
              opacity: 0.45,
              filter: "blur(48px)",
              animation: "libra-float-alt 9s ease-in-out infinite",
            }}
            aria-hidden="true"
          />

          <div
            className="relative z-10 w-[78%] max-w-md text-white"
            style={{
              animation:
                "libra-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both",
            }}
          >
            <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight mb-3">
              Your notes,
              <br />
              <span style={{ color: "var(--color-primary)" }}>
                locked down by design.
              </span>
            </h2>
            <p
              className="text-sm xl:text-base mb-8 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.72)" }}
            >
              Block-based docs, a freeform canvas, and an AI assistant — on a
              foundation of strict per-user isolation.
            </p>

            <ul className="space-y-3">
              {[
                { icon: ShieldKeyhole, text: "Passwordless sign-in — no password to leak." },
                { icon: Pen2, text: "Block editor & freeform canvas." },
                { icon: MagicStick3, text: "AI that drafts text & finds images." },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm">
                  <span
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    <Icon size={16} color="#ffffff" weight="Bold" />
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.88)" }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
