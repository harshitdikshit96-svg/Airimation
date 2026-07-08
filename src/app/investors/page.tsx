import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import StatGrid from "@/components/ui/StatGrid";
import Timeline from "@/components/ui/Timeline";
import { investorHighlights, marketFacts, positioning } from "@/lib/content";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investors | Airmation",
  description:
    "Airmation's market opportunity, positioning and roadmap for investors and grant partners. Figures are illustrative and assumption-based.",
};

export default function InvestorsPage() {
  return (
    <>
      <section className="border-b border-line-2 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionLabel>For Investors & Grant Partners</SectionLabel>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              A disciplined regional build, toward an indigenous UAV company.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Airmation is raising phased capital — blending equity,
              non-dilutive grants (iDEX, DST, TDF) and later equipment finance
              — to fund the Biscope fleet ramp. This page is a summary; get in
              touch for the full deck and financial model.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <StatGrid stats={investorHighlights} />
          </Reveal>
          <p className="mt-4 text-center text-xs text-dim">
            Base-case projections, illustrative and assumption-based. See the
            full model for methodology and sensitivities.
          </p>
        </div>
      </section>

      <section className="border-t border-line-2 bg-panel-2/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionLabel no="01">The market</SectionLabel>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
              A real, bounded niche — captured regionally
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {marketFacts.map((fact, i) => (
              <Reveal key={fact.stat} delay={i * 0.08}>
                <div className="panel-border h-full rounded-2xl bg-panel/40 p-7">
                  <div className="font-serif text-3xl font-semibold text-cyan-soft">
                    {fact.stat}
                  </div>
                  <p className="mt-3 text-sm text-muted">{fact.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionLabel no="02">Positioning</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-ink sm:text-4xl">
              The game we win
            </h2>
            <p className="mt-4 text-muted">{positioning.summary}</p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line-2 bg-panel-2/40 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionLabel no="03">Execution roadmap</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-ink sm:text-4xl">
              Five years: operator to company
            </h2>
          </Reveal>
          <div className="mt-12 panel-border rounded-2xl bg-panel/40 p-8">
            <Timeline />
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <div className="panel-border rounded-3xl bg-gradient-to-br from-panel to-panel-2 px-8 py-16">
              <h2 className="font-serif text-3xl font-semibold text-ink">
                Request the full investor deck
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted">
                The complete business plan, financial model and stress-tested
                assumptions are available on request.
              </p>
              <div className="mt-8">
                <Button href="/contact">
                  Request the Deck <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
