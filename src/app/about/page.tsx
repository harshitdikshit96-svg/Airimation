import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import FounderAvatar from "@/components/team/FounderAvatar";
import { directors, site, visibleAdvisors, type TeamMember } from "@/lib/content";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "About",
  description:
    "Airimation's mission, founding team and honest read on what the company is today versus where it is building toward.",
  path: "/about",
});

function MemberCard({ member, delay }: { member: TeamMember; delay: number }) {
  return (
    <Reveal delay={delay}>
      <div className="group panel-border h-full rounded-2xl bg-panel/40 p-6">
        <div className="flex items-center gap-4">
          <FounderAvatar name={member.name} photo={member.photo} size="sm" />
          <div>
            <h3 className="font-serif text-lg font-semibold text-ink">{member.name}</h3>
            <div className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-cyan-soft">
              {member.role}
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted">{member.background}</p>
      </div>
    </Reveal>
  );
}

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line-2 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-[1052px]">
          <Reveal>
            <SectionLabel>About Airimation</SectionLabel>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              A drone-show company that builds its own drones.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Airimation designs, builds and flies synchronised drone light
              shows from {site.base} — starting in Uttar Pradesh, growing
              market by market, and earning the right to a research track
              once the shows run like clockwork.
            </p>
            <p className="mt-4 text-sm text-dim">
              Airimation is a brand of {site.legalName}, the company&apos;s
              registered legal entity.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-[1052px]">
          <Reveal>
            <div className="panel-border rounded-2xl bg-panel/40 p-8 sm:p-10">
              <h2 className="font-serif text-2xl font-semibold text-amber-soft">
                What we are — and what we are not
              </h2>
              <p className="mt-4 max-w-[68ch] leading-relaxed text-muted">
                Today Airimation is an early-stage company with its{" "}
                <strong className="text-ink">first in-house prototype drone built</strong>,
                now being taken below 250 grams into the DGCA Nano category. It
                runs on proven open software — ArduPilot on the aircraft,
                Skybrush for show control — with every component sourced from
                Indian vendors. We have not flown a commercial show yet, and
                nothing on this site pretends otherwise.
              </p>
              <p className="mt-4 max-w-[68ch] leading-relaxed text-muted">
                The plan is two tracks, in order. First, light shows: a
                100-drone fleet, test shows in Uttar Pradesh, then NCR,
                pan-India and international clients. Second, once operations
                are stable, grant-funded R&amp;D that puts the same swarm
                know-how to work on environmental and civic problems. We would
                rather be precise about that order than over-promise.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line-2 bg-panel-2/40 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-[1052px]">
          <Reveal>
            <SectionLabel no="01">Why Uttar Pradesh</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-ink">
              The wedge no national player is rooted in
            </h2>
            <p className="mt-4 max-w-2xl text-muted">
              Uttar Pradesh runs one of India&apos;s richest event and
              religious-tourism calendars — from Ayodhya and the Kumbh to
              Varanasi and Mathura — alongside a dense civic events
              calendar. No competitor, not even the national market leader, is
              rooted here. Our moat is proximity, regional density and
              relationships built market by market, which is hard for a
              distant, generalist operator to replicate.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-[1052px]">
          <Reveal>
            <SectionLabel no="02">The founding team</SectionLabel>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-ink">
              {visibleAdvisors.length > 0
                ? "The directors, and the advisors beside them"
                : "The directors building the company"}
            </h2>
          </Reveal>

          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
            Directors
          </p>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {directors.map((member, i) => (
              <MemberCard key={member.name} member={member} delay={i * 0.06} />
            ))}
          </div>

          {/* Advisors: only those not marked `hidden` in content.ts. */}
          {visibleAdvisors.length > 0 && (
            <>
              <p className="mt-12 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
                Advisors
              </p>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {visibleAdvisors.map((member, i) => (
                  <MemberCard key={member.name} member={member} delay={i * 0.06} />
                ))}
              </div>
            </>
          )}

          <Reveal delay={0.2}>
            <Link
              href="/team"
              className="mt-8 inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-dim transition-colors hover:text-ink"
            >
              See full bios <ArrowRight size={14} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line-2 px-6 py-14 sm:py-20">
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
