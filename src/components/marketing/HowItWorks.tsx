import { MagicStick3 } from "@solar-icons/react/ssr";

interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Create a workspace",
    description:
      "Sign in with a magic link — no password to leak or reuse. Your private workspace is ready in seconds.",
  },
  {
    number: 2,
    title: "Write, drag & design your blocks",
    description:
      "Build pages from text and image blocks, or flip to the freeform canvas to arrange everything spatially.",
  },
  {
    number: 3,
    title: "Share securely & let AI help",
    description:
      "Invite exactly the right people, then call on the AI assistant to draft, refine, and find images for you.",
  },
];

function StepItem({ number, title, description }: Step) {
  return (
    <div className="flex gap-5 md:gap-6">
      <div className="flex flex-shrink-0 flex-col items-center">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
          style={{ background: "var(--color-secondary)" }}
        >
          {number}
        </div>
        {number < steps.length && (
          <div
            className="mt-2 w-px flex-1"
            style={{ background: "var(--color-surface-border)", minHeight: "52px" }}
          />
        )}
      </div>
      <div className="pb-10">
        <h3 className="mb-1.5 text-lg font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
          {title}
        </h3>
        <p className="leading-relaxed" style={{ color: "var(--color-accent)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 scroll-mt-20">
      <div className="flex flex-col items-start gap-16 lg:flex-row">
        <div className="lg:sticky lg:top-28 lg:w-2/5">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-surface-border)",
              color: "var(--color-secondary-text)",
            }}
          >
            <MagicStick3 size={14} color="var(--color-secondary-text)" weight="Bold" />
            How it works
          </div>
          <h2
            className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl"
            style={{ color: "var(--color-fg)" }}
          >
            From blank page to brilliant in three steps.
          </h2>
          <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--color-accent)" }}>
            No setup, no boilerplate, no learning curve — open Libra and your
            ideas have a secure home in under a minute.
          </p>
        </div>

        <div className="lg:w-3/5">
          {steps.map((step) => (
            <StepItem key={step.number} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}
