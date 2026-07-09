import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import Timeline from "@/components/ui/Timeline";
import Button from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vision | Airimation",
  description:
    "How Airimation grows from a drone-show operator into an indigenous UAV technology company — Biscope, Airimation Academy, and the UAV R&D division.",
};

const rdBeachheads = [
  {
    title: "Infrastructure inspection",
    detail:
      "Drone-as-a-service inspection for power lines, solar farms and highways, with an AI defect-detection layer as the recurring product.",
  },
  {
    title: "Government & smart-city services",
    detail:
      "Municipal mapping, urban planning and project auditing — leaning on the same government relationships Biscope builds through shows.",
  },
  {
    title: "Industrial monitoring",
    detail:
      "Construction-progress monitoring and site mapping, drawing on Airimation's existing real-estate relationships.",
  },
];

export default function VisionPage() {
  return (
    <>
      <section className="border-b border-line-2 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionLabel>Beyond Biscope</SectionLabel>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              From drone-show operator to UAV technology company.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Every stage is built on the last. Biscope funds and proves the
              team; Airimation Academy and the UAV R&amp;D division are earned,
              not assumed — each with a named buyer before a rupee is spent.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionLabel no="01">The five-year path</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-ink sm:text-4xl">
              Operator to company
            </h2>
          </Reveal>
          <div className="mt-12 panel-border rounded-2xl bg-panel-2/50 p-8">
            <Timeline />
          </div>
        </div>
      </section>

      <section className="border-t border-line-2 bg-panel-2/40 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionLabel no="02">Year 2+</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-ink sm:text-4xl">
              Airimation Academy
            </h2>
            <p className="mt-4 text-muted">
              India&apos;s basic pilot-training market is already saturated —
              hundreds of DGCA-approved training organisations compete on
              price. Airimation&apos;s academy does not fight there. It is
              anchored on the advanced tier: swarm choreography, drone-show
              software, mission planning and collision detection — skills
              almost no one else can teach, because almost no one else
              actually operates a swarm the way Biscope does.
            </p>
            <p className="mt-4 text-muted">
              Delivered through corporate workshops and college partnerships,
              it is counter-seasonal to the show calendar and builds the
              talent pipeline Airimation hires from.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionLabel no="03">Year 4+</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-ink sm:text-4xl">
              UAV R&amp;D — funded by grants, not equity
            </h2>
            <p className="mt-4 max-w-3xl text-muted">
              The bridge to a true technology company, pursued only once
              expertise and cash are established. Funded largely by
              non-dilutive grants (iDEX, DST, TDF), it is deliberately
              disciplined: one or two beachheads, each with a clear buyer,
              rather than seven ambitious domains at once.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {rdBeachheads.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="panel-border h-full rounded-2xl bg-panel/40 p-6">
                  <h3 className="font-serif text-lg font-semibold text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted">{item.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <p className="mt-8 max-w-3xl text-sm text-dim">
              Agriculture, disaster management and environmental work remain
              real but grant- or government-dependent niches, pursued
              opportunistically. Defence is treated strictly as long-horizon,
              grant-funded optionality on the dual-use side — never a
              near-term revenue line.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line-2 px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
              Building toward this with us — as a client, partner or investor?
            </h2>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Button href="/contact">
                Get in Touch <ArrowRight size={16} />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
