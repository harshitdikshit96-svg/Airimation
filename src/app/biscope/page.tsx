import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import GlowCard from "@/components/ui/GlowCard";
import {
  processSteps,
  droneSpecs,
  clientSegments,
  safetyPoints,
} from "@/lib/content";
import { ArrowRight, Radio, Satellite, Lightbulb } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biscope | Airmation",
  description:
    "Biscope is Airmation's flagship drone-swarm light show — synchronised LED drones choreographed for government, festival, wedding and corporate events.",
};

const specIcons = [Satellite, Radio, Lightbulb];

export default function BiscopePage() {
  return (
    <>
      <section className="border-b border-line-2 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionLabel>The Flagship Product</SectionLabel>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Biscope: a swarm of light, choreographed to the second.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Hundreds of synchronised LED drones fly a designed, validated,
              and permitted show — a reusable, eco-friendly alternative to
              fireworks, built for the moments that deserve one.
            </p>
            <div className="mt-8">
              <Button href="/contact">
                Book a Show <ArrowRight size={16} />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionLabel no="01">The process</SectionLabel>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
              A six-to-seven-day cycle, every time
            </h2>
            <p className="mt-4 max-w-2xl text-muted">
              Every Biscope show runs the same disciplined sequence — design,
              validation, permitting and performance — handled by a defined
              crew working to written safety procedures.
            </p>
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

      <section className="border-t border-line-2 bg-panel-2/40 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionLabel no="02">On every drone</SectionLabel>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
              What makes a formation hold together
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {droneSpecs.map((spec, i) => {
              const Icon = specIcons[i];
              return (
                <Reveal key={spec.title} delay={i * 0.08}>
                  <div className="panel-border h-full rounded-2xl bg-panel/40 p-7">
                    <Icon className="text-cyan-soft" size={22} />
                    <h3 className="mt-4 font-serif text-lg font-semibold text-ink">
                      {spec.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted">{spec.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionLabel no="03">Where Biscope performs</SectionLabel>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
              Built for four audiences
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
        </div>
      </section>

      <section className="border-t border-line-2 bg-panel-2/40 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionLabel no="04">Safety, named plainly</SectionLabel>
            <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
              Every show carries this discipline
            </h2>
          </Reveal>

          <div className="mt-10 space-y-4">
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

      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <div className="panel-border rounded-3xl bg-gradient-to-br from-panel to-panel-2 px-8 py-16">
              <h2 className="font-serif text-3xl font-semibold text-ink sm:text-4xl">
                Have a date and a venue in mind?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted">
                Share the details and we&apos;ll assess feasibility — venue,
                airspace and permissions — before anything else.
              </p>
              <div className="mt-8">
                <Button href="/contact">
                  Start the Conversation <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
