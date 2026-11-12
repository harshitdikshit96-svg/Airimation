import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import CulturalShowcaseLoader from "@/components/gallery/CulturalShowcaseLoader";
import { designYourShow } from "@/lib/content";
import { ArrowRight } from "lucide-react";

/**
 * /design-your-show: pick a fleet size, watch the formations that fleet can
 * actually fly, in 3D, at real drone speeds. (The earlier formation-picker
 * configurator is archived at /design-your-show/classic and still serves
 * old share links.)
 */
export default function DesignShowcaseView() {
  return (
    <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-28">
      {/* Not <Reveal>: its opacity fade delays LCP until JS runs. */}
      <div className="hero-enter">
        <p className="mb-5 font-mono text-xs tracking-[0.2em] text-dim">{designYourShow.eyebrow}</p>
        <h1 className="mb-6 font-serif text-[clamp(32px,4.4vw,56px)] font-light leading-[1.1] text-ink">
          {designYourShow.title}
        </h1>
        <p className="max-w-[62ch] text-base font-light leading-relaxed text-muted">{designYourShow.intro}</p>
      </div>

      <div className="mt-10">
        <CulturalShowcaseLoader />
      </div>

      <Reveal>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="/contact">
            Request a quote <ArrowRight size={16} />
          </Button>
          <p className="max-w-[52ch] text-sm font-light text-muted">{designYourShow.quoteNote}</p>
        </div>
      </Reveal>

      <Reveal>
        <section className="mt-16 grid gap-10 border-t border-line pt-12 sm:grid-cols-3">
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
