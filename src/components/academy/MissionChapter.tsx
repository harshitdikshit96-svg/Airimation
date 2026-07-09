"use client";

import { missionPrimer } from "@/lib/academyContent";
import ChapterShell from "./ChapterShell";
import RevealCard from "./RevealCard";

export default function MissionChapter({
  onNext,
  onCardOpen,
}: {
  onNext: () => void;
  onCardOpen: () => void;
}) {
  return (
    <ChapterShell
      eyebrow="LEVEL 1 · THE 30-SECOND VERSION"
      title="What is Airmation, actually?"
      description={missionPrimer.simple}
      onNext={onNext}
      nextLabel="Next: History & world records"
    >
      <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-int-dim">
        Tap each card — why this matters
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {missionPrimer.whyItMatters.map((item) => (
          <RevealCard key={item.title} title={item.title} onReveal={onCardOpen}>
            {item.detail}
          </RevealCard>
        ))}
      </div>
    </ChapterShell>
  );
}
