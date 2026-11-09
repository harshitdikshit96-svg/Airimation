import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import Button from "@/components/ui/Button";
import CulturalShowcaseLoader from "@/components/gallery/CulturalShowcaseLoader";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery | Airimation",
  description:
    "Concept formations from Airimation's show-design pipeline — our first live shows are in preparation."
};


export default function GalleryPage() {
  return (
    <>
      <section className="border-b border-line-2 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionLabel>Concept Gallery</SectionLabel>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Formations from the design pipeline.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted">
              Our first live shows are in preparation, so what
              follows are concept renders from our own choreography process —
              not footage. We would rather show you the real thing honestly
              than fake it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* LIVE 3D — animated cultural formations */}
      <section className="px-6 pt-14 sm:pt-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionLabel>Story formations, in motion</SectionLabel>
            <h2 className="mt-3 max-w-3xl font-serif text-3xl font-semibold text-ink sm:text-4xl">
              From a 100-drone tricolour to a 2,000-drone dragon.
            </h2>
            <p className="mt-4 max-w-3xl text-muted">
              Figures that move the way a show tells a story — a flag that
              waves, a diya that flickers, a trunk that sways, the Ganga pouring
              from Shiva&apos;s hair. Simulated live in 3D. Pick a fleet size:
              each one offers the formations that genuinely read at that count,
              so you see what your budget buys.
            </p>
          </Reveal>
          <div className="mt-10">
            <CulturalShowcaseLoader />
          </div>
        </div>
      </section>

      {/* The 2D "formation library" cards were removed (Nov 2026): flat white
          dots on black next to the 3D showcase looked unfinished. */}
      <div className="h-14 sm:h-20" />

      <section className="border-t border-line-2 bg-panel-2/40 px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <h2 className="font-serif text-2xl font-semibold text-ink sm:text-3xl">
              Want your event&apos;s formation designed from scratch?
            </h2>
            <p className="mt-4 text-muted">
              Every Airimation show is bespoke — storyboarded and animated around
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
