import { ArrowRight, ShieldCheck } from "@solar-icons/react/ssr";
import PillLink from "@/components/shared/PillLink";
import DocumentMockup from "@/components/marketing/DocumentMockup";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden px-5 pb-28 pt-36 text-center sm:px-8">
      {/* Background radial glows */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div
          className="libra-float absolute left-1/2 top-[-14%] h-[680px] w-[680px] -translate-x-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, var(--color-glow) 0%, var(--color-primary) 38%, transparent 70%)",
            opacity: 0.4,
            filter: "blur(44px)",
          }}
        />
        <div
          className="libra-float-alt absolute bottom-[-10%] left-[-8%] h-[520px] w-[520px] rounded-full"
          style={{
            background: "radial-gradient(circle, var(--color-secondary) 0%, transparent 70%)",
            opacity: 0.2,
            filter: "blur(52px)",
          }}
        />
      </div>

      {/* Eyebrow badge */}
      <div
        className="libra-fade-up mb-7 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium"
        style={{
          animationDelay: "0.1s",
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-surface-border)",
          color: "var(--color-accent)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <ShieldCheck size={16} color="var(--color-secondary-text)" weight="Bold" />
        Security-first workspace
      </div>

      {/* Headline */}
      <h1
        className="libra-fade-up max-w-4xl text-5xl font-extrabold leading-none tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl"
        style={{ animationDelay: "0.22s", color: "var(--color-fg)" }}
      >
        Your notes.
        <br />
        <span style={{ color: "var(--color-secondary)" }}>Secured by design.</span>
      </h1>

      {/* Subtitle */}
      <p
        className="libra-fade-up mt-7 max-w-2xl text-lg leading-relaxed sm:text-xl"
        style={{ animationDelay: "0.35s", color: "var(--color-accent)" }}
      >
        Libra is an AI-powered, block-based workspace for your ideas — write,
        design on a freeform canvas, and let AI help. Private by default, with
        strict per-user isolation baked in from the first line of code.
      </p>

      {/* CTAs */}
      <div
        className="libra-fade-up mt-10 flex flex-col items-center gap-3 sm:flex-row"
        style={{ animationDelay: "0.48s" }}
      >
        <PillLink href="/register" size="lg">
          Start writing free
          <ArrowRight size={18} color="#ffffff" weight="Bold" />
        </PillLink>
        <PillLink href="#how-it-works" variant="secondary" size="lg">
          See how it works
        </PillLink>
      </div>

      {/* Floating workspace mockup */}
      <div className="libra-fade-up mt-20 w-full" style={{ animationDelay: "0.62s" }}>
        <DocumentMockup />
      </div>
    </section>
  );
}
