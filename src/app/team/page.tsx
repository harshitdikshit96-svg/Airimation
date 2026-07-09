import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import FounderAvatar from "@/components/team/FounderAvatar";
import { founders, site } from "@/lib/content";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team | Airmation",
  description: "The founding team behind Airmation and Biscope.",
};

export default function TeamPage() {
  return (
    <>
      <section className="border-b border-line-2 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionLabel>The Team</SectionLabel>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              The people building Airmation.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Four founders, one flagship product. Based in {site.base}, building
              toward an indigenous Indian UAV technology company — one show at a
              time.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl divide-y divide-line-2">
          {founders.map((founder, i) => (
            <div key={founder.name} className={i === 0 ? "pb-16" : "py-16"}>
              <Reveal>
                <div className="group grid grid-cols-1 items-center gap-10 sm:grid-cols-[240px_1fr]">
                  <div className={i % 2 === 1 ? "sm:order-2" : ""}>
                    <FounderAvatar name={founder.name} photo={founder.photo} size="lg" />
                  </div>
                  <div className={i % 2 === 1 ? "sm:order-1" : ""}>
                    <p className="mb-2 font-mono text-xs uppercase tracking-[0.16em] text-cyan-soft">
                      {founder.role}
                    </p>
                    <h2 className="mb-4 font-serif text-2xl font-semibold text-ink sm:text-3xl">
                      {founder.name}
                    </h2>
                    <p className="max-w-[62ch] leading-relaxed text-muted">{founder.intro}</p>
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line-2 px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
              Want the fuller story — mission, roadmap and honest positioning?
            </h2>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Button href="/about">
                About Airmation <ArrowRight size={16} />
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
