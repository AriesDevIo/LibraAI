import {
  Widget,
  Layers,
  MagicStick3,
  UsersGroupRounded,
  Palette,
  ShieldKeyhole,
} from "@solar-icons/react/ssr";
import SectionHeading from "@/components/shared/SectionHeading";

type SolarIcon = typeof Widget;

interface Feature {
  icon: SolarIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Widget,
    title: "Block-based editor",
    description:
      "Compose pages from text and image blocks that snap together — fast, flexible, and keyboard-friendly.",
  },
  {
    icon: Layers,
    title: "Freeform canvas",
    description:
      "Switch to canvas mode to drag, arrange, and connect objects spatially when a linear doc isn't enough.",
  },
  {
    icon: MagicStick3,
    title: "AI writing & images",
    description:
      "A built-in assistant drafts and refines your text, and fetches relevant images from the web on request.",
  },
  {
    icon: UsersGroupRounded,
    title: "Real-time sharing",
    description:
      "Invite teammates to a document and collaborate, with access scoped to exactly who you choose.",
  },
  {
    icon: Palette,
    title: "Color theming",
    description:
      "Make every workspace yours with a vivid, accessible palette — light and dark mode included.",
  },
  {
    icon: ShieldKeyhole,
    title: "Private by default",
    description:
      "Your data stays yours. Strict per-user isolation means no one sees a page you didn't share.",
  },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 scroll-mt-20">
      <SectionHeading
        eyebrow="Everything you need"
        title="A workspace that thinks with you"
        subtitle="Powerful building blocks for notes, ideas, and projects — wrapped in a calm, secure interface."
      />

      <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <article
            key={title}
            className="group rounded-2xl border p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-surface-border)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            <span
              className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{
                backgroundColor: "color-mix(in srgb, var(--color-primary) 30%, transparent)",
                color: "var(--color-secondary)",
              }}
            >
              <Icon size={24} color="var(--color-secondary)" weight="Bold" />
            </span>
            <h3 className="mb-2 text-xl font-bold tracking-tight" style={{ color: "var(--color-fg)" }}>
              {title}
            </h3>
            <p className="leading-relaxed" style={{ color: "var(--color-accent)" }}>
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
