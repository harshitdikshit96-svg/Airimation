"use client";

import { opportunityPoints, competitiveLandscape } from "@/lib/academyContent";
import { clientSegments } from "@/lib/content";
import ChapterShell from "./ChapterShell";
import RevealCard from "./RevealCard";

export default function BusinessChapter({
  onNext,
  onPrev,
  onCardOpen,
}: {
  onNext: () => void;
  onPrev: () => void;
  onCardOpen: () => void;
}) {
  return (
    <ChapterShell
      eyebrow="LEVEL 5 · THE BUSINESS"
      title="Who we serve, and why now."
      description="The technology is the how. This is the why — the market opportunity and who else is playing."
      onNext={onNext}
      onPrev={onPrev}
      nextLabel="Next: The roadmap"
    >
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-int-dim">
        Our four client segments
      </p>
      <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {clientSegments.map((seg) => (
          <RevealCard key={seg.title} title={seg.title} accent="yellow" onReveal={onCardOpen}>
            {seg.description}
          </RevealCard>
        ))}
      </div>

      <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-int-dim">
        Why this market, why now
      </p>
      <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {opportunityPoints.map((o) => (
          <RevealCard key={o.title} title={o.title} accent="pink" onReveal={onCardOpen}>
            {o.detail}
          </RevealCard>
        ))}
      </div>

      <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-int-dim">
        Who else is flying
      </p>
      <div className="rounded-2xl border border-int-pink/30 bg-int-pink/[0.06] p-6">
        <h4 className="mb-3 font-serif text-lg font-medium text-int-ink">
          {competitiveLandscape.headline}
        </h4>
        <p className="mb-4 text-[15px] font-light leading-relaxed text-int-ink/90">
          {competitiveLandscape.detail}
        </p>
        <div className="border-t border-int-pink/20 pt-3">
          <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-int-pink">
            Our takeaway
          </p>
          <p className="text-sm font-light leading-relaxed text-int-muted">
            {competitiveLandscape.takeaway}
          </p>
        </div>
      </div>
    </ChapterShell>
  );
}
