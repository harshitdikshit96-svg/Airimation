"use client";

import clsx from "clsx";
import { Check } from "lucide-react";

export type AcademyChapterMeta = { id: string; label: string; num: number };

export default function ProgressRail({
  chapters,
  activeId,
  completed,
  onSelect,
}: {
  chapters: AcademyChapterMeta[];
  activeId: string;
  completed: Set<string>;
  onSelect: (id: string) => void;
}) {
  const pct = Math.round((completed.size / chapters.length) * 100);

  return (
    <div className="sticky top-0 z-30 border-b border-int-line bg-int-bg/90 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex flex-wrap items-center gap-x-1 gap-y-3">
          {chapters.map((ch, i) => {
            const isActive = ch.id === activeId;
            const isDone = completed.has(ch.id);
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => onSelect(ch.id)}
                className={clsx(
                  "group flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors",
                  isActive
                    ? "bg-int-yellow text-int-ink"
                    : isDone
                      ? "text-int-pink hover:text-int-pink"
                      : "text-int-dim hover:text-int-ink"
                )}
              >
                <span
                  className={clsx(
                    "flex h-4 w-4 items-center justify-center rounded-full border text-[9px]",
                    isActive
                      ? "border-int-ink/30"
                      : isDone
                        ? "border-int-pink/50"
                        : "border-int-line"
                  )}
                >
                  {isDone ? <Check size={10} /> : ch.num}
                </span>
                {ch.label}
                {i < chapters.length - 1 && (
                  <span className="mx-1 hidden text-int-line sm:inline">/</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-int-ink/[0.08]">
            <div
              className="h-full rounded-full bg-int-yellow transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="font-mono text-[10px] tracking-[0.1em] text-int-dim">
            {completed.size}/{chapters.length} EXPLORED
          </span>
        </div>
      </div>
    </div>
  );
}
