import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import { founders, site } from "@/lib/content";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Airimation",
  description:
    "Airimation's mission, founding team and honest read on what the company is today versus where it is building toward.",
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line-2 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionLabel>About Airimation</SectionLabel>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              A regional drone-experience company, building toward an
              indigenous UAV technology company.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Airimation&apos;s mission is to become a leading Indian UAV technology
              company — earned in stages, starting from a profitable,
              category-leading regional drone-show operation based in{" "}
              {site.base}.
            </p>
            <p className="mt-4 text-sm text-dim">
              Airimation is a brand of {site.legalName}, the company&apos;s
              registered legal entity.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <div className="panel-border rounded-2xl bg-panel/40 p-8 sm:p-10">
              <h2 className="font-serif text-2xl font-semibold text-amber-soft">
                What we are — and what we are not
              </h2>
              <p className="mt-4 leading-relaxed text-muted">
                In its early years, <strong className="text-ink">Biscope</strong>{" "}
                is a drone-show services and operator business, run on proven
                off-the-shelf software and a contract-manufactured drone. That
                is a good business on its own terms: profitable at the unit
                level, and riding a real shift away from fireworks.
              </p>
              <p className="mt-4 leading-relaxed text-muted">
                The longer-term vision — an indigenous, full-stack UAV
                technology company — is a destination we build toward over
                five to ten years, using the cash and credibility the show
                business generates. It is not a claim we make on day one, and
                we would rather be precise about that than over-promise.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line-2 bg-panel-2/40 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionLabel no="01">Why Uttar Pradesh</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-ink">
              The wedge no national player is rooted in
            </h2>
            <p className="mt-4 max-w-2xl text-muted">
              Uttar Pradesh runs one of India&apos;s richest event and
              religious-tourism calendars — from Ayodhya and the Kumbh to
              Varanasi and Mathura — alongside a dense state-government events
              calendar. No competitor, not even the national market leader, is
              rooted here. Our moat is proximity, regional density and
              relationships built market by market, which is hard for a
              distant, generalist operator to replicate.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionLabel no="02">The founding team</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-ink">
              A founding team with the depth to build this
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {founders.map((founder, i) => (
              <Reveal key={founder.name} delay={i * 0.06}>
                <div className="panel-border h-full rounded-2xl bg-panel/40 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-panel-2 font-serif text-sm text-amber-soft">
                    {founder.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold text-ink">
                    {founder.name}
                  </h3>
                  <div className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-cyan-soft">
                    {founder.role}
                  </div>
                  <p className="mt-3 text-sm text-muted">{founder.background}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <Link
              href="/team"
              className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-dim transition-colors hover:text-ink"
            >
              See full bios <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line-2 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
              Want the full picture — the roadmap and what&apos;s next?
            </h2>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Button href="/vision">
                Visit Vision <ArrowRight size={16} />
              </Button>
              <Button href="/contact" variant="ghost">
                Get in Touch
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
