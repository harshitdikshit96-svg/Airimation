import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import FounderAvatar from "@/components/team/FounderAvatar";
import { directors, site, visibleAdvisors, type TeamMember } from "@/lib/content";
import { ArrowRight, ExternalLink, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team | Airimation",
  description:
    visibleAdvisors.length > 0
      ? "The directors and advisors behind Airimation's drone-swarm light shows."
      : "The directors behind Airimation's drone-swarm light shows.",
};

/**
 * One person, one row — the SAME shape for everybody.
 *
 * This used to alternate sides on every second row by flipping the grid
 * ORDER inside a `[220px_1fr]` template. Order does not move the column
 * WIDTHS, so the flipped rows put the photo in the 1fr column: every other
 * headshot rendered several times larger than its neighbours and the bio
 * beside it was squeezed into 220px. A fixed photo column, same on every
 * row, is the whole fix — and the page reads calmer for it.
 *
 * On phones the photo stays beside the name at 96px rather than becoming a
 * full-width tile — seven full-bleed 4:5 portraits made the page an endless
 * scroll — and the bio drops underneath it at full width.
 */
function MemberRow({ member }: { member: TeamMember }) {
  return (
    <div className="py-10 first:pt-0 sm:py-14">
      <Reveal>
        <div className="grid grid-cols-[96px_1fr] items-start gap-x-5 gap-y-4 sm:grid-cols-[200px_1fr] sm:gap-x-10">
          <div className="sm:row-span-2">
            <FounderAvatar name={member.name} photo={member.photo} size="lg" />
          </div>

          {/* Name and role sit BESIDE the photo; the bio drops below it and
              runs the full width. On a phone a bio squeezed into the 230px
              left over next to a portrait wraps every three or four words. */}
          <div>
            <p className="mb-1.5 font-mono text-[11px] uppercase leading-relaxed tracking-[0.16em] text-cyan-soft sm:text-xs">
              {member.role}
            </p>
            <h3 className="font-serif text-xl font-semibold text-ink sm:text-3xl">
              {member.name}
            </h3>
          </div>

          <div className="col-span-2 sm:col-span-1 sm:col-start-2">
            <p className="max-w-[62ch] text-sm leading-relaxed text-muted sm:text-base">
              {member.intro}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-6 sm:mt-4">
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex min-h-11 items-center gap-2 text-sm text-dim transition-colors hover:text-ink"
                >
                  <Mail size={14} className="shrink-0 text-cyan-soft" />
                  {member.email}
                </a>
              )}
              {member.profile && (
                <a
                  href={member.profile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 text-sm text-dim transition-colors hover:text-ink"
                >
                  <ExternalLink size={14} className="shrink-0 text-cyan-soft" />
                  Profile
                </a>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export default function TeamPage() {
  return (
    <>
      <section className="border-b border-line-2 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-[1052px]">
          <Reveal>
            <SectionLabel>The Team</SectionLabel>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              The people building Airimation.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              {visibleAdvisors.length > 0
                ? "The directors who run the company, and the advisors who guide its operations and technology. "
                : "The directors who run the company and design the shows. "}
              Based in {site.base}. Our first prototype drone is built, and
              we&apos;re taking it into the Nano class — one milestone at a time.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 pt-20">
        <div className="mx-auto max-w-[1052px]">
          <Reveal>
            <SectionLabel>Directors</SectionLabel>
          </Reveal>
          <div className="mt-10 divide-y divide-line-2">
            {directors.map((member) => (
              <MemberRow key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* Advisors: those not marked `hidden` in content.ts. */}
      {visibleAdvisors.length > 0 && (
      <section className="px-6 pb-20 pt-16">
        <div className="mx-auto max-w-[1052px] border-t border-line-2 pt-16">
          <Reveal>
            <SectionLabel>Advisors</SectionLabel>
          </Reveal>
          <div className="mt-10 divide-y divide-line-2">
            {visibleAdvisors.map((member) => (
              <MemberRow key={member.name} member={member} />
            ))}
          </div>
        </div>
      </section>
      )}

      <section className="border-t border-line-2 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
              Want the fuller story — mission, roadmap and honest positioning?
            </h2>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Button href="/about">
                About Airimation <ArrowRight size={16} />
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
