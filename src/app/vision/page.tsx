import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import Timeline from "@/components/ui/Timeline";
import Button from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { buildStatus, pledge, principles, rdDirections, visionTracks } from "@/lib/content";

export const metadata: Metadata = pageMeta({
  title: "Vision",
  description:
    "Airimation's two-track vision: a drone light-show fleet that grows from Uttar Pradesh to the world, then grant-funded swarm R&D for environmental and civic problems.",
  path: "/vision",
});

export default function VisionPage() {
  const [shows, research] = visionTracks;

  return (
    <>
      <section className="border-b border-line-2 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-[1052px]">
          <Reveal>
            <SectionLabel>Vision</SectionLabel>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Two tracks, in order.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              First, light shows — a fleet that grows from Uttar Pradesh to the
              world. Then, once the shows run like clockwork, research that puts
              the same swarm know-how to work on real problems. The second is
              earned by the first.
            </p>
          </Reveal>
        </div>
      </section>

      {/* WHERE WE ARE */}
      <section className="px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-[1052px]">
          <Reveal>
            <SectionLabel>Where we are</SectionLabel>
            <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold text-ink sm:text-4xl">
              {buildStatus.title}
            </h2>
            <p className="mt-4 max-w-3xl text-muted">{buildStatus.body}</p>
          </Reveal>
          <dl className="mt-10 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
            {buildStatus.facts.map((fact, i) => (
              <Reveal key={fact.label} delay={i * 0.05}>
                <div className="border-t border-line-2 pt-4">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
                    {fact.label}
                  </dt>
                  <dd className="mt-1.5 text-ink">{fact.value}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* TRACK 1 */}
      <section className="border-t border-line-2 bg-panel-2/40 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-[1052px]">
          <Reveal>
            <SectionLabel no={shows.no}>{shows.label}</SectionLabel>
            <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold text-ink sm:text-4xl">
              {shows.title}
            </h2>
            <p className="mt-4 max-w-3xl text-muted">{shows.body}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <ol className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-3 font-mono text-xs uppercase tracking-[0.14em] sm:text-sm">
              {shows.steps.map((step, i) => (
                <li key={step} className="flex items-center gap-3">
                  <span className={i === shows.steps.length - 1 ? "text-amber-soft" : "text-ink"}>
                    {step}
                  </span>
                  {i < shows.steps.length - 1 && <ArrowRight size={14} className="text-dim" />}
                </li>
              ))}
            </ol>
          </Reveal>

          <div className="mt-12 panel-border rounded-2xl bg-panel/40 p-6 sm:p-8">
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
              The plan, dated — everything after &ldquo;Now&rdquo; is a plan, not a record
            </p>
            <Timeline />
          </div>
        </div>
      </section>

      {/* TRACK 2 */}
      <section className="px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-[1052px]">
          <Reveal>
            <SectionLabel no={research.no}>{research.label}</SectionLabel>
            <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold text-ink sm:text-4xl">
              {research.title}
            </h2>
            <p className="mt-4 max-w-3xl text-muted">{research.body}</p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {rdDirections.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <div className="panel-border h-full rounded-2xl bg-panel/40 p-6">
                  <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted">{item.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-10 border-l-2 border-amber pl-5">
              <h3 className="font-display text-lg font-semibold text-ink">{pledge.title}</h3>
              <p className="mt-2 max-w-3xl text-muted">{pledge.body}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW WE BUILD */}
      <section className="border-t border-line-2 bg-panel-2/40 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-[1052px]">
          <Reveal>
            <SectionLabel no="03">How we build</SectionLabel>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {principles.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.07}>
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line-2 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              Building toward this with us — as a client, a partner or a future teammate?
            </h2>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Button cta="vision_contact" href="/contact">
                Get in Touch <ArrowRight size={16} />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
