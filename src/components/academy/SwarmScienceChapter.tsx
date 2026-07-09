"use client";

import { swarmConcepts, showPipeline } from "@/lib/academyContent";
import ChapterShell from "./ChapterShell";
import RevealCard from "./RevealCard";

export default function SwarmScienceChapter({
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
      eyebrow="LEVEL 4 · ONE BECOMES MANY"
      title="From one drone to a choreographed swarm."
      description="Flying one drone safely is a solved problem. Flying 300 of them a metre apart, on cue, without a single collision, is the actual engineering challenge Airmation sells."
      onNext={onNext}
      onPrev={onPrev}
      nextLabel="Next: The business"
    >
      <p className="mb-4 font-mono text-xs uppercase tracking-[0.16em] text-int-dim">
        The building blocks
      </p>
      <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {swarmConcepts.map((c) => (
          <RevealCard key={c.title} title={c.title} accent="yellow" onReveal={onCardOpen}>
            {c.simple}
          </RevealCard>
        ))}
      </div>

      <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-int-dim">
        Every show follows the same four-step pipeline
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {showPipeline.map((s) => (
          <div key={s.step} className="rounded-2xl border border-int-line bg-int-panel p-5">
            <p className="mb-2 font-mono text-xs tracking-[0.16em] text-int-pink">{s.step}</p>
            <p className="text-sm font-light leading-relaxed text-int-muted">{s.detail}</p>
          </div>
        ))}
      </div>
    </ChapterShell>
  );
}
