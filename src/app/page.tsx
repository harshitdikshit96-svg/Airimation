import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import StatGrid from "@/components/ui/StatGrid";
import GlowCard from "@/components/ui/GlowCard";
import Timeline from "@/components/ui/Timeline";
import SwarmCanvas from "@/components/visual/SwarmCanvas";
import {
  heroStats,
  clientSegments,
  processSteps,
  safetyPoints,
  productLines,
  positioning,
  site,
} from "@/lib/content";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line-2">
        <div className="absolute inset-0 opacity-90">
          <SwarmCanvas />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-navy/10 via-navy/70 to-navy" />

        <div className="relative mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-center px-6 py-24">
          <div className="animate-fade-up">
            <SectionLabel>Biscope · Drone-Swarm Light Shows</SectionLabel>
            <h1 className="mt-5 max-w-3xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
              Hundreds of drones,{" "}
              <span className="text-amber-soft text-glow-amber">choreographed to the second.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">{site.tagline}</p>
            <p className="mt-3 max-w-xl text-sm text-dim">
              Based in {site.base} — built for the state, temple-town, wedding and corporate
              calendar no national operator is rooted in.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Button href="/contact">
                Book a Show <ArrowRight size={16} />
              </Button>
              <Button href="/biscope" variant="ghost">
                How a Show Comes Together
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <StatGrid stats={heroStats} />
        </Reveal>
      </section>

      {/* PROCESS */}
      <section className="border-t border-line-2 bg-panel-2/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <SectionLabel no="01">How a Biscope show comes together</SectionLabel>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
              From storyboard to a sky full of light
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.08}>
                <div className="panel-border h-full rounded-2xl bg-panel/50 p-6">
                  <span className="font-mono text-xs text-dim">{step.step}</span>
                  <h3 className="mt-3 font-serif text-xl font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <SectionLabel no="02">Who we serve</SectionLabel>
          <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
            One state, four audiences that matter
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {clientSegments.map((segment, i) => (
            <Reveal key={segment.title} delay={i * 0.07}>
              <GlowCard
                title={segment.title}
                description={segment.description}
                color={segment.color as "amber" | "cyan" | "violet" | "green"}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* POSITIONING */}
      <section className="border-t border-line-2 bg-panel-2/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <SectionLabel no="03">Positioning</SectionLabel>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
              We win the game we can win
            </h2>
            <p className="mt-4 max-w-2xl text-muted">{positioning.summary}</p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <Reveal>
              <div className="panel-border h-full rounded-2xl bg-panel/40 p-7">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-dim">
                  The incumbent
                </div>
                <h3 className="mt-2 font-serif text-lg font-semibold text-ink">
                  {positioning.incumbent.name}
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-muted">
                  {positioning.incumbent.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-dim" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="panel-border h-full rounded-2xl bg-panel/60 p-7 border-amber/30">
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-amber-soft">
                  Airmation
                </div>
                <h3 className="mt-2 font-serif text-lg font-semibold text-ink">
                  The regional wedge
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-muted">
                  {positioning.airmation.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* VISION / ROADMAP */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <SectionLabel no="04">The vision</SectionLabel>
          <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
            Three phased lines, one clear priority
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {productLines.map((line, i) => (
            <Reveal key={line.title} delay={i * 0.08}>
              <a href={line.href} className="block h-full">
                <GlowCard title={line.title} description={line.description} color={i === 0 ? "amber" : i === 1 ? "cyan" : "violet"}>
                  <div className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-dim">
                    {line.tag}
                  </div>
                </GlowCard>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-14 panel-border rounded-2xl bg-panel-2/50 p-8">
            <Timeline />
          </div>
        </Reveal>
      </section>

      {/* SAFETY */}
      <section className="border-t border-line-2 bg-panel-2/40">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-green-soft" size={22} />
              <SectionLabel no="05">Safety & compliance</SectionLabel>
            </div>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
              Flying over an audience is never treated as routine
            </h2>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {safetyPoints.map((point, i) => (
              <Reveal key={point} delay={i * 0.05}>
                <div className="panel-border flex gap-3 rounded-xl bg-panel/40 p-5">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green" />
                  <p className="text-sm text-muted">{point}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="panel-border relative overflow-hidden rounded-3xl bg-gradient-to-br from-panel to-panel-2 px-8 py-16 text-center">
            <h2 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
              Planning a celebration the sky should remember?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">
              Tell us the date, the venue and the story you want told in light —
              we&apos;ll take it from there.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact">
                Start a Conversation <ArrowRight size={16} />
              </Button>
              <Button href="/investors" variant="ghost">
                For Investors & Partners
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
