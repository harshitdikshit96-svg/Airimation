import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import FormationPreview from "@/components/visual/FormationPreview";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | Airimation",
  description:
    "Concept formations from Biscope's design pipeline — Airimation's first live shows are in preparation.",
};

const formations: {
  key: "lotus" | "monogram" | "ring" | "wave" | "heart" | "snowflake";
  title: string;
  caption: string;
}[] = [
  {
    key: "lotus",
    title: "Bloom",
    caption: "A layered lotus formation, designed for heritage and temple-town venues.",
  },
  {
    key: "ring",
    title: "Salute",
    caption: "Concentric rings — a formal opening formation for government events.",
  },
  {
    key: "wave",
    title: "Flight",
    caption: "A rising chevron, evoking the swarm in transit between formations.",
  },
  {
    key: "heart",
    title: "Devotion",
    caption: "A heart formation — a warm closing note for weddings and anniversaries.",
  },
  {
    key: "snowflake",
    title: "Frost",
    caption: "A six-armed snowflake, for winter festivals and year-end celebrations.",
  },
  {
    key: "monogram",
    title: "Mark",
    caption: "The Airimation monogram, assembled by the swarm as a closing formation.",
  },
];

export default function GalleryPage() {
  return (
    <>
      <section className="border-b border-line-2 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionLabel>Concept Gallery</SectionLabel>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Formations from the design pipeline.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Biscope&apos;s first live shows are in preparation, so what
              follows are concept renders from our own choreography process —
              not footage. We would rather show you the real thing honestly
              than fake it.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {formations.map((f, i) => (
              <Reveal key={f.key} delay={i * 0.08}>
                <div className="panel-border overflow-hidden rounded-2xl bg-panel/40">
                  <div className="aspect-[4/3] bg-navy-2">
                    <FormationPreview formation={f.key} />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-lg font-semibold text-ink">
                      {f.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{f.caption}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line-2 bg-panel-2/40 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
              Want your event&apos;s formation designed from scratch?
            </h2>
            <p className="mt-4 text-muted">
              Every Biscope show is bespoke — storyboarded and animated around
              your theme, colours and story before a single drone flies.
            </p>
            <div className="mt-8">
              <Button href="/contact">
                Start a Design Conversation <ArrowRight size={16} />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
