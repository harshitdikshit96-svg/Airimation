"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { quadcopterParts, howItFlies, type QuadPart } from "@/lib/academyContent";
import ChapterShell from "./ChapterShell";
import RevealCard from "./RevealCard";
import clsx from "clsx";

export default function QuadcopterLab({
  onNext,
  onPrev,
  onPartOpen,
}: {
  onNext: () => void;
  onPrev: () => void;
  onPartOpen: () => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const active: QuadPart | undefined = quadcopterParts.find((p) => p.id === activeId);

  function select(id: string) {
    setActiveId(id);
    if (!seen.has(id)) {
      onPartOpen();
      setSeen(new Set(seen).add(id));
    }
  }

  return (
    <ChapterShell
      eyebrow="LEVEL 3 · TAKE ONE APART"
      title="Quadcopter 101."
      description="Every Biscope drone is built from the same 10 parts. Click each glowing dot to learn what it does — plain English first, technical name second."
      onNext={onNext}
      onPrev={onPrev}
      nextLabel="Next: Swarm science"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-int-dim">
          Parts explored: {seen.size}/{quadcopterParts.length}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,280px)_1fr]">
        {/* The diagram */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[280px] rounded-2xl border border-int-line bg-int-panel p-4">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full opacity-50"
            aria-hidden="true"
          >
            <line x1="50" y1="6" x2="50" y2="75" stroke="var(--int-line)" strokeWidth="0.6" />
            <line x1="30" y1="25" x2="70" y2="30" stroke="var(--int-line)" strokeWidth="0.6" />
            <line x1="42" y1="40" x2="68" y2="30" stroke="var(--int-line)" strokeWidth="0.6" />
            <circle cx="50" cy="52" r="14" fill="none" stroke="var(--int-line)" strokeWidth="0.6" />
          </svg>

          {quadcopterParts.map((part) => {
            const isActive = part.id === activeId;
            const isSeen = seen.has(part.id);
            return (
              <button
                key={part.id}
                type="button"
                onClick={() => select(part.id)}
                aria-label={part.name}
                style={{ left: `${part.position.x}%`, top: `${part.position.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <span
                  className={clsx(
                    "block h-3.5 w-3.5 rounded-full border transition-all",
                    isActive
                      ? "scale-125 border-int-yellow bg-int-yellow shadow-[0_0_16px_rgba(242,180,48,0.55)]"
                      : isSeen
                        ? "border-int-pink/70 bg-int-pink/30"
                        : "animate-pulse border-int-dim/60 bg-int-dim/20"
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* The detail panel */}
        <div>
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-int-line bg-int-panel p-6"
              >
                <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-int-pink">
                  {active.nickname}
                </p>
                <h3 className="mb-3 font-serif text-xl font-medium text-int-ink">{active.name}</h3>
                <p className="mb-4 text-[15px] font-light leading-relaxed text-int-ink/90">
                  {active.simple}
                </p>
                <div className="border-t border-int-line pt-3">
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] text-int-dim">
                    Technical nomenclature
                  </p>
                  <p className="text-sm font-light leading-relaxed text-int-muted">
                    {active.technical}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-int-line p-6 text-center">
                <p className="text-sm font-light text-int-dim">
                  Click a glowing dot on the diagram to start exploring.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="mb-4 mt-14 font-mono text-xs uppercase tracking-[0.16em] text-int-dim">
        So how does it actually fly?
      </p>
      <p className="mb-5 max-w-[62ch] text-[15px] font-light text-int-muted">{howItFlies.intro}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {howItFlies.moves.map((m) => (
          <RevealCard key={m.name} title={m.name} accent="pink" onReveal={onPartOpen}>
            {m.detail}
          </RevealCard>
        ))}
      </div>
    </ChapterShell>
  );
}
