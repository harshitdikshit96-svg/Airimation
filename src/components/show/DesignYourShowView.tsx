import Reveal from "@/components/ui/Reveal";
import ShowConfiguratorLoader from "@/components/show/ShowConfiguratorLoader";
import { designYourShow } from "@/lib/content";

/**
 * The /design-your-show page body. Shared by the page itself and by
 * shared-show links (/design-your-show/s/[code]), which open the same page
 * with the sender's show loaded.
 */
export default function DesignYourShowView({ code }: { code?: string }) {
  return (
    <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-28">
      {/* Not <Reveal>: its opacity fade delays LCP until JS runs. */}
      <div className="hero-enter">
        <p className="mb-5 font-mono text-xs tracking-[0.2em] text-dim">
          {designYourShow.eyebrow}
        </p>
        <h1 className="mb-6 font-serif text-[clamp(32px,4.4vw,56px)] font-light leading-[1.1] text-ink">
          {designYourShow.title}
        </h1>
        <p className="max-w-[58ch] text-base font-light leading-relaxed text-muted">
          {designYourShow.intro}
        </p>
      </div>

      <ShowConfiguratorLoader initialCode={code} />

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
