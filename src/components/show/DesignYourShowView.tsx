import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import ShowConfiguratorLoader from "@/components/show/ShowConfiguratorLoader";
import { designYourShow } from "@/lib/content";

/**
 * ARCHIVED show designer (the formation-picker configurator). Rendered at
 * /design-your-show/classic and by old share links
 * (/design-your-show/s/[code]), which open it with the sender's show
 * loaded. The live Design a Show page is DesignShowcaseView.
 */
export default function DesignYourShowView({ code, archived = true }: { code?: string; archived?: boolean }) {
  return (
    <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-28">
      {archived && (
        <p className="mb-8 rounded-lg border border-line-2 px-4 py-3 text-sm text-muted">
          This is our earlier show designer, kept so shared links still work.{" "}
          <Link href="/design-your-show" className="text-amber-soft underline-offset-4 hover:underline">
            Try the new one — 100 to 2,000 drones, in 3D →
          </Link>
        </p>
      )}
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
