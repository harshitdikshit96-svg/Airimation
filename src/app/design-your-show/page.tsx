import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import ShowConfiguratorLoader from "@/components/show/ShowConfiguratorLoader";
import { designYourShow } from "@/lib/content";

export const metadata: Metadata = {
  title: "Design Your Show | Airimation",
  description:
    "Choose a fleet size and formations, and watch a drone light show play out over a night sky — so you can picture yours before you book.",
};

export default function DesignYourShowPage() {
  return (
    <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-28">
      <Reveal>
        <p className="mb-5 font-mono text-xs tracking-[0.2em] text-dim">
          {designYourShow.eyebrow}
        </p>
        <h1 className="mb-6 font-serif text-[clamp(32px,4.4vw,56px)] font-light leading-[1.1] text-ink">
          {designYourShow.title}
        </h1>
        <p className="max-w-[58ch] text-base font-light leading-relaxed text-muted">
          {designYourShow.intro}
        </p>
      </Reveal>

      <ShowConfiguratorLoader />

      <Reveal>
        <section className="mt-20 grid gap-10 border-t border-line pt-12 sm:grid-cols-3">
          {designYourShow.notes.map((note) => (
            <div key={note.title}>
              <h2 className="mb-2 text-sm font-medium text-ink">{note.title}</h2>
              <p className="text-sm font-light leading-relaxed text-muted">{note.body}</p>
            </div>
          ))}
        </section>
      </Reveal>
    </main>
  );
}
