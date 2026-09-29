import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import FounderAvatar from "@/components/team/FounderAvatar";
import { advisors, coreTeam, site, type TeamMember } from "@/lib/content";
import { ArrowRight, ExternalLink, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team | Airimation",
  description:
    "The advisory bench and operating team behind Airimation and its flagship drone light show, Biscope.",
};

function MemberRow({ member, index }: { member: TeamMember; index: number }) {
  const flipped = index % 2 === 1;
  return (
    <div className="py-14 first:pt-0">
      <Reveal>
        <div className="grid grid-cols-1 items-center gap-10 sm:grid-cols-[220px_1fr]">
          <div className={flipped ? "sm:order-2" : ""}>
            <FounderAvatar name={member.name} photo={member.photo} size="lg" />
          </div>
          <div className={flipped ? "sm:order-1" : ""}>
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.16em] text-cyan-soft">
              {member.role}
            </p>
            <h3 className="mb-4 font-serif text-2xl font-semibold text-ink sm:text-3xl">
              {member.name}
            </h3>
            <p className="max-w-[62ch] leading-relaxed text-muted">{member.intro}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center gap-2 text-sm text-dim transition-colors hover:text-ink"
                >
                  <Mail size={14} className="text-cyan-soft" />
                  {member.email}
                </a>
              )}
              {member.profile && (
                <a
                  href={member.profile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-dim transition-colors hover:text-ink"
                >
                  <ExternalLink size={14} className="text-cyan-soft" />
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
      <section className="border-b border-line-2 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionLabel>The Team</SectionLabel>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              The people building Airimation.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              An advisory bench drawn from drone research, wireless communications
              and institutional leadership, and a small operating team that flies
              the shows. Based in {site.base}, building toward an indigenous Indian
              UAV technology company — one show at a time.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Advisors lead: pre-first-show, the bench is the strongest thing we
          can put in front of a client or an investor. */}
      <section className="px-6 pt-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionLabel>Advisors</SectionLabel>
          </Reveal>
          <div className="mt-10 divide-y divide-line-2">
            {advisors.map((member, i) => (
              <MemberRow key={member.name} member={member} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 pt-16">
        <div className="mx-auto max-w-5xl border-t border-line-2 pt-16">
          <Reveal>
            <SectionLabel>Core Team</SectionLabel>
          </Reveal>
          <div className="mt-10 divide-y divide-line-2">
            {coreTeam.map((member, i) => (
              <MemberRow key={member.name} member={member} index={i} />
            ))}
          </div>
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
