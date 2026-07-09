"use client";

import { useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Check } from "lucide-react";
import clsx from "clsx";

/**
 * A click-to-reveal fact card — the core "gamified learning" primitive used
 * across the Academy chapters. Front is always visible (title + teaser);
 * clicking expands the detail and marks the card "collected" so a chapter
 * can show a small "X/Y uncovered" counter. Styled for the internal-only
 * light pink/yellow theme — only two accent options, to keep the palette
 * standard rather than a rainbow of one-off colours.
 */
export default function RevealCard({
  title,
  teaser,
  eyebrow,
  children,
  onReveal,
  accent = "yellow",
}: {
  title: string;
  teaser?: string;
  eyebrow?: string;
  children: ReactNode;
  onReveal?: () => void;
  accent?: "yellow" | "pink";
}) {
  const [open, setOpen] = useState(false);

  function toggle() {
    if (!open) onReveal?.();
    setOpen((v) => !v);
  }

  const ring = accent === "pink" ? "group-hover:border-int-pink/50" : "group-hover:border-int-yellow/60";
  const badgeColor = accent === "pink" ? "border-int-pink text-int-pink" : "border-int-yellow text-int-yellow";

  return (
    <button
      type="button"
      onClick={toggle}
      className={clsx(
        "group w-full rounded-2xl border border-int-line bg-int-panel p-5 text-left shadow-sm transition-colors",
        ring
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow && (
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-int-dim">
              {eyebrow}
            </p>
          )}
          <h4 className="font-serif text-lg font-medium text-int-ink">{title}</h4>
          {teaser && !open && (
            <p className="mt-1.5 text-sm font-light text-int-muted">{teaser}</p>
          )}
        </div>
        <span
          className={clsx(
            "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-transform",
            open ? clsx("rotate-45", badgeColor) : "border-int-line text-int-dim"
          )}
        >
          <Plus size={13} />
        </span>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 border-t border-int-line pt-3 text-[14.5px] font-light leading-relaxed text-int-muted">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-600/80">
          <Check size={11} /> Uncovered
        </div>
      )}
    </button>
  );
}
