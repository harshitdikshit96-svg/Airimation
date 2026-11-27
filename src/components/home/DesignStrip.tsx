"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Item = { id: string; label: string; hues: string; alt: string; /** LED hues: label and swatch ([] = the formation's own colours). */ theme: { label: string; colors: string[] } };

/**
 * The home page's Design a Show stills: a horizontal strip inside the page
 * column, moved one still at a time by the arrows (a smooth, animated
 * scroll; instant under reduced motion) or by trackpad / swipe. Every still
 * shares one camera and crop, so the horizon runs on unbroken from one to
 * the next. Each opens Design a Show on that formation, in that theme.
 */
export default function DesignStrip({ items, fleet, children }: { items: Item[]; fleet: number; children: ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () =>
      setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 4 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * w, behavior: smooth ? "smooth" : "auto" });
  };

  const arrow =
    "flex h-11 w-11 items-center justify-center rounded-full border border-line-2 text-ink transition-colors hover:border-amber hover:text-amber-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber disabled:pointer-events-none disabled:opacity-30";

  return (
    <>
      <div className="mb-10 flex items-end justify-between gap-8">
        <div>{children}</div>
        <div className="flex shrink-0 gap-2">
          <button type="button" aria-label="Previous formation" className={arrow} disabled={edge.start} onClick={() => step(-1)}>
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Next formation" className={arrow} disabled={edge.end} onClick={() => step(1)}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul
        ref={track}
        aria-label="Formations from Design a Show"
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          // Fade the edge that has more stills past it: a cue to scroll.
          maskImage: `linear-gradient(to right, ${edge.start ? "#000" : "transparent"}, #000 6%, #000 94%, ${edge.end ? "#000" : "transparent"})`,
        }}
      >
        {items.map((item, i) => (
          <li key={item.id} className="w-[46%] shrink-0 snap-start lg:w-[40%]">
            <Link
              href={`/design-your-show/${item.id}?fleet=${fleet}&hues=${item.hues}`}
              className="group block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-amber"
            >
              <Image
                src={`/renders/${item.id}-${item.hues}.webp`}
                alt={item.alt}
                width={1280}
                height={987}
                sizes="(min-width: 1100px) 420px, 46vw"
                className={`block h-auto w-full transition-[filter] duration-300 group-hover:brightness-125 ${i ? "border-l border-black" : ""}`}
              />
              <span className="block pt-3 font-serif text-[17px] font-light text-muted transition-colors group-hover:text-ink">
                {item.label}
              </span>
              <span className="mt-1 flex items-center gap-2 text-[13px] font-light text-dim">
                {item.theme.colors.length > 0 && (
                  <span className="flex" aria-hidden="true">
                    {item.theme.colors.slice(0, 4).map((c, k) => (
                      <span key={c + k} className="-ml-1 h-2.5 w-2.5 rounded-full border border-black/40 first:ml-0" style={{ background: c }} />
                    ))}
                  </span>
                )}
                {item.theme.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
