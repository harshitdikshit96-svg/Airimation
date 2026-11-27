"use client";

import { useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Rows of the Design a Show dock share one label column, so the rails line up. */
export const ROW_LABEL = "w-[76px] shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-dim";

const ARROW =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-2 text-ink transition-colors hover:border-amber hover:text-amber-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:pointer-events-none disabled:opacity-30";

/**
 * One row of chips (formations, LED hues) that slides sideways, so every
 * control fits under the sky on the first screen. Arrows step most of a
 * width (smooth unless reduced motion); "View all" opens the row into a
 * wrapped grid in place. The chosen chip is kept in view, including when
 * auto-advance picks the next formation.
 */
export default function ChipRail({
  label,
  count,
  active,
  group,
  children,
}: {
  label: string;
  /** How many chips, for "View all 56". */
  count: number;
  /** Index of the chosen chip (-1 for none). */
  active: number;
  /** Attributes for the chip group itself (role, aria-label, data-*). */
  group: HTMLAttributes<HTMLDivElement> & { [k: `data-${string}`]: string };
  children: ReactNode;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () =>
      setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [open, count]);

  const smooth = () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Keep the chosen chip on screen: scroll the rail only (never the page).
  useEffect(() => {
    const el = track.current;
    const chip = el?.children[active] as HTMLElement | undefined;
    if (!el || !chip || open) return;
    const left = chip.offsetLeft;
    const right = left + chip.offsetWidth;
    if (left >= el.scrollLeft && right <= el.scrollLeft + el.clientWidth) return;
    el.scrollTo({ left: left - (el.clientWidth - chip.offsetWidth) / 2, behavior: smooth() ? "smooth" : "auto" });
  }, [active, open, count]);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: smooth() ? "smooth" : "auto" });
  };

  return (
    // Phones: label and buttons on one line, the chips full width under them
    // (side by side there is no room left for the chips). Arrows hide —
    // a swipe slides the rail. sm and up: one row.
    <div className="flex flex-wrap items-start gap-x-3 gap-y-2 sm:flex-nowrap">
      <span className={`${ROW_LABEL} pt-[15px]`}>{label}</span>
      <div
        ref={track}
        {...group}
        className={`relative order-last flex min-w-0 basis-full gap-2 sm:order-none sm:basis-auto sm:flex-1 ${
          open ? "flex-wrap" : "overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        }`}
        style={
          open
            ? undefined
            : { maskImage: `linear-gradient(to right, ${edge.start ? "#000" : "transparent"}, #000 40px, #000 calc(100% - 40px), ${edge.end ? "#000" : "transparent"})` }
        }
      >
        {children}
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
        {!open && (
          <span className="hidden items-center gap-2 sm:flex">
            <button type="button" aria-label={`Scroll ${label} back`} className={ARROW} disabled={edge.start} onClick={() => step(-1)}>
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button type="button" aria-label={`Scroll ${label} on`} className={ARROW} disabled={edge.end} onClick={() => step(1)}>
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </span>
        )}
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="min-h-11 min-w-[124px] whitespace-nowrap rounded-full border border-line-2 px-4 font-mono text-xs text-muted transition-colors hover:border-amber hover:text-amber-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
        >
          {open ? "Show fewer" : `View all ${count}`}
        </button>
      </div>
    </div>
  );
}
