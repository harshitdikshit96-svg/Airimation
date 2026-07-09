"use client";

import { historyTimeline, funFacts } from "@/lib/academyContent";
import ChapterShell from "./ChapterShell";
import RevealCard from "./RevealCard";

export default function HistoryChapter({
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
      eyebrow="LEVEL 2 · TIMELINE"
      title="From an art project to 33,615 drones."
      description="A decade of drone shows, compressed. Tap a year to read what actually happened."
      onNext={onNext}
      onPrev={onPrev}
      nextLabel="Next: Quadcopter 101"
    >
      <div className="relative border-l border-int-line pl-8">
        {historyTimeline.map((event) => (
          <div key={event.year} className="relative mb-6 last:mb-0">
            <span className="absolute -left-[38px] top-1.5 h-2.5 w-2.5 rounded-full bg-int-yellow" />
            <RevealCard eyebrow={event.year} title={event.title} onReveal={onCardOpen}>
              <p>{event.detail}</p>
              {event.source && (
                <p className="mt-2 font-mono text-[11px] tracking-[0.06em] text-int-dim">
                  Source: {event.source}
                </p>
              )}
            </RevealCard>
          </div>
        ))}
      </div>

      <p className="mb-4 mt-12 font-mono text-xs uppercase tracking-[0.16em] text-int-dim">
        A few more facts worth knowing
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {funFacts.map((fact, i) => (
          <RevealCard
            key={i}
            title={`Fact ${i + 1}`}
            teaser="Tap to reveal"
            accent="pink"
            onReveal={onCardOpen}
          >
            {fact}
          </RevealCard>
        ))}
      </div>
    </ChapterShell>
  );
}
