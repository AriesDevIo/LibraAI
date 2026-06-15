import Link from "next/link";
import { ArrowRight } from "@solar-icons/react/ssr";

export default function CTABanner() {
  return (
    <section className="px-5 py-24 sm:px-8">
      <div
        className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20"
        style={{
          background: "linear-gradient(120deg, var(--color-secondary), var(--color-glow))",
        }}
      >
        {/* Dotted texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
          aria-hidden="true"
        />
        {/* Soft light highlight */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)" }}
          aria-hidden="true"
        />

        <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tighter text-white sm:text-4xl md:text-5xl">
          Start building your second brain — securely.
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/85">
          Free to start. No password, no setup headaches — just open a page and
          begin.
        </p>

        <div className="relative mt-9 flex justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            style={{ color: "var(--color-secondary)" }}
          >
            Start writing free
            <ArrowRight size={18} color="var(--color-secondary)" weight="Bold" />
          </Link>
        </div>
      </div>
    </section>
  );
}
