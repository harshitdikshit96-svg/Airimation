"use client";

import { ReactNode } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

export default function ChapterShell({
  eyebrow,
  title,
  description,
  children,
  onNext,
  onPrev,
  nextLabel = "Next chapter",
  prevLabel = "Previous",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  onNext?: () => void;
  onPrev?: () => void;
  nextLabel?: string;
  prevLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="mb-4 font-mono text-xs tracking-[0.28em] text-int-dim">{eyebrow}</p>
      <h2 className="mb-4 font-serif text-[clamp(28px,3.6vw,44px)] font-light leading-[1.15] text-int-ink">
        {title}
      </h2>
      {description && (
        <p className="mb-10 max-w-[62ch] text-base font-light text-int-muted">{description}</p>
      )}

      <div className="mt-4">{children}</div>

      <div className="mt-14 flex items-center justify-between border-t border-int-line pt-8">
        {onPrev ? (
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-int-dim transition-colors hover:text-int-ink"
          >
            <ArrowLeft size={14} /> {prevLabel}
          </button>
        ) : (
          <span />
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-full bg-int-yellow px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-int-ink transition-all hover:bg-int-yellow-soft"
          >
            {nextLabel} <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
