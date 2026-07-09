"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { roadmap, founders } from "@/lib/content";
import ChapterShell from "./ChapterShell";

export default function RoadmapExplorer({
  onPrev,
  onYearOpen,
}: {
  onPrev: () => void;
  onYearOpen: () => void;
}) {
  const [activeYear, setActiveYear] = useState(roadmap[0].year);
  const [seen, setSeen] = useState<Set<string>>(new Set([roadmap[0].year]));
  const active = roadmap.find((r) => r.year === activeYear) ?? roadmap[0];

  function select(year: string) {
    setActiveYear(year);
    if (!seen.has(year)) {
      onYearOpen();
      setSeen(new Set(seen).add(year));
    }
  }

  return (
    <ChapterShell
      eyebrow="LEVEL 6 · THE PLAN"
      title="Five years, mapped out."
      description="Click through each year to see the plan unfold — fleet size, shows per year, and the milestone that defines it."
      onPrev={onPrev}
    >
      <div className="mb-8 flex flex-wrap gap-2">
        {roadmap.map((r) => (
          <button
            key={r.year}
            type="button"
            onClick={() => select(r.year)}
            className={clsx(
              "rounded-full border px-4 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors",
              activeYear === r.year
                ? "border-int-yellow bg-int-yellow text-int-ink"
                : seen.has(r.year)
                  ? "border-int-pink/40 text-int-pink"
                  : "border-int-line text-int-dim hover:text-int-ink"
            )}
          >
            {r.year}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.year}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-int-line bg-int-panel p-7"
        >
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-int-pink">
            {active.year}
          </p>
          <h3 className="mb-3 font-serif text-2xl font-medium text-int-ink">{active.heading}</h3>
          <p className="mb-4 font-mono text-sm tracking-[0.04em] text-int-ink/80">
            {active.fleet}
          </p>
          <p className="text-[15px] font-light leading-relaxed text-int-muted">
            {active.detail}
          </p>
        </motion.div>
      </AnimatePresence>

      <p className="mb-5 mt-14 font-mono text-xs uppercase tracking-[0.16em] text-int-dim">
        Who&apos;s building this
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {founders.map((f) => (
          <div key={f.name}>
            <h4 className="mb-1 text-[15px] font-medium text-int-ink">{f.name}</h4>
            <p className="mb-2 font-mono text-[10px] tracking-[0.08em] text-int-dim">{f.role}</p>
            <p className="text-[13px] font-light text-int-muted">{f.background}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-int-yellow/40 bg-int-yellow/10 p-7 text-center">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-int-pink">
          That&apos;s the full tour
        </p>
        <h3 className="mb-4 font-serif text-xl font-medium text-int-ink">
          Ready to prove it?
        </h3>
        <Link
          href="/internal/quiz"
          className="inline-flex items-center gap-2 rounded-full bg-int-pink px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-white transition-all hover:bg-int-pink/90"
        >
          Take the quiz <ArrowRight size={14} />
        </Link>
      </div>
    </ChapterShell>
  );
}
