import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import DesignStage from "./DesignStage";
import { designYourShow } from "@/lib/content";
import { allFormationFacts, formationPath, relatedFormations, type FormationFacts } from "@/lib/cultural/facts";
import { THEMES } from "@/lib/cultural";
import { ArrowRight, ChevronDown } from "lucide-react";

/**
 * /design-your-show and /design-your-show/<formation>: pick a fleet size,
 * watch the formations that fleet can actually fly, in 3D, at real drone
 * speeds. Both are the same page: a formation page only opens the sky on
 * its own figure and starts with that figure's heading and copy (search and
 * link previews get one real page per formation; docs/seo/PLAN.md §2).
 * Picking another formation never loads a page. (The earlier
 * formation-picker configurator is archived at /design-your-show/classic and
 * still serves old share links.)
 */
export default function DesignShowcaseView({ formation }: { formation?: FormationFacts }) {
  const facts = allFormationFacts();
  const hub = (
    // Not <Reveal>: its opacity fade delays LCP until JS runs.
    <div className="hero-enter mt-16 border-t border-line pt-12">
      <p className="mb-5 font-mono text-xs tracking-[0.2em] text-dim">{designYourShow.eyebrow}</p>
      <h1 className="mb-6 font-display text-[clamp(32px,4.4vw,56px)] font-light leading-[1.1] text-ink">{designYourShow.title}</h1>
      <p className="max-w-[62ch] text-base font-light leading-relaxed text-muted">{designYourShow.intro}</p>
    </div>
  );

  return (
    <div className="pb-24">
      {/* The hero is the sky itself, full width; its controls sit just below; then the heading. */}
      <DesignStage initial={formation?.id} facts={facts} hub={hub} />

      <div className="mx-auto max-w-[1100px] px-6">
        <Reveal>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button cta="design_request_quote" href="/contact">
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

        {formation && <Related id={formation.id} />}
        <FormationIndex facts={facts} />
      </div>
    </div>
  );
}

/** Formation pages: a few neighbours, as plain links. */
function Related({ id }: { id: string }) {
  const related = relatedFormations(id, 6);
  return (
    <section className="mt-16 border-t border-line pt-12" aria-labelledby="related-title">
      <h2 id="related-title" className="mb-6 font-display text-2xl font-light text-ink">
        More formations like this
      </h2>
      <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((f) => (
          <li key={f.id}>
            <Link href={formationPath(f.id)} className="text-sm font-light text-muted underline-offset-4 hover:text-ink hover:underline">
              {f.heading}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Every formation, grouped by theme, as crawlable links to its page — on
 * the hub and on every formation page. Following a link loads that page; the
 * chips in the sky's dock switch figures without a load.
 */
function FormationIndex({ facts }: { facts: FormationFacts[] }) {
  return (
    <section className="mt-16 border-t border-line pt-12" aria-labelledby="library-title">
      <h2 id="library-title" className="mb-2 font-display text-2xl font-light text-ink">
        Every formation in the library
      </h2>
      <p className="mb-8 max-w-[62ch] text-sm font-light text-muted">
        {facts.length} figures, each made from a real 3D model. Open a theme to see its figures, or pick from the rail under the sky.
      </p>
      {/* One collapsed group per theme: a short page until the visitor opens one.
          Native <details>, so the links stay in the HTML for crawlers. */}
      <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        {THEMES.map((t) => {
          const items = facts.filter((f) => f.themeId === t.id);
          if (!items.length) return null;
          return (
            <details key={t.id} className="group border-b border-line">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-dim transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber [&::-webkit-details-marker]:hidden">
                <span>
                  {t.label} <span className="text-dim/70">· {items.length}</span>
                </span>
                <ChevronDown size={14} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="space-y-2 pb-4 pt-1">
                {items.map((f) => (
                  <li key={f.id}>
                    <Link href={formationPath(f.id)} className="text-sm font-light text-muted underline-offset-4 hover:text-ink hover:underline">
                      {f.label}
                    </Link>
                    <span className="ml-2 font-mono text-[10px] text-dim">{f.minDrones.toLocaleString("en-IN")}+</span>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}
