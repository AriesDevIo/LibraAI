import {
  ShieldCheck,
  Letter,
  ShieldUser,
  CodeScan,
  ShieldStar,
} from "@solar-icons/react/ssr";

type SolarIcon = typeof ShieldCheck;

interface TrustPoint {
  icon: SolarIcon;
  title: string;
  description: string;
}

const trustPoints: TrustPoint[] = [
  {
    icon: Letter,
    title: "Passwordless magic-link login",
    description:
      "No passwords to phish, reuse, or leak. You sign in with a one-time link sent straight to your inbox.",
  },
  {
    icon: ShieldUser,
    title: "Strict per-user data isolation",
    description:
      "Row Level Security in the database means your pages are unreachable to anyone you didn't invite.",
  },
  {
    icon: CodeScan,
    title: "Inputs sanitized against XSS",
    description:
      "Everything you type is cleaned before it's stored or rendered, so malicious markup can never run.",
  },
  {
    icon: ShieldStar,
    title: "AI guarded against prompt injection",
    description:
      "The assistant stays inside its guardrails — it won't leak its instructions or follow hidden commands.",
  },
];

export default function Security() {
  return (
    <section
      id="security"
      className="border-y py-24 scroll-mt-20"
      style={{
        borderColor: "var(--color-surface-border)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--color-secondary) 10%, var(--color-bg)), var(--color-bg))",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
            style={{ background: "var(--color-secondary)" }}
          >
            <ShieldCheck size={28} color="#ffffff" weight="Bold" />
          </span>
          <p
            className="mb-3 text-sm font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-secondary-text)" }}
          >
            Security is the feature
          </p>
          <h2
            className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl"
            style={{ color: "var(--color-fg)" }}
          >
            Built in, not bolted on.
          </h2>
          <p
            className="mx-auto mt-4 max-w-xl text-lg leading-relaxed"
            style={{ color: "var(--color-accent)" }}
          >
            Libra is engineered against the OWASP Top 10 from day one. Here&apos;s
            how your work stays yours — and only yours.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {trustPoints.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex gap-5 rounded-2xl border p-7 shadow-sm transition-transform duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-surface-border)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                  color: "var(--color-secondary)",
                }}
              >
                <Icon size={24} color="var(--color-secondary)" weight="Bold" />
              </span>
              <div>
                <h3 className="mb-1.5 text-lg font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
                  {title}
                </h3>
                <p className="leading-relaxed" style={{ color: "var(--color-accent)" }}>
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
