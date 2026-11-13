import type { CSSProperties, ReactNode } from "react";

/**
 * Fade-and-rise as a block scrolls into view — pure CSS (a scroll-driven
 * animation, `.reveal` in globals.css), so it is a SERVER component and
 * ships no JavaScript.
 *
 * Why not Framer Motion (replaced Nov 2026): it server-rendered every block
 * at opacity 0 and only showed it after the JS loaded and hydrated, which
 * delayed each page's Largest Contentful Paint (~0.8 s on /vision and
 * /team) and put framer-motion on every page. Here, anything already on
 * screen at load is fully visible in the first paint; browsers without
 * scroll-driven animations (Firefox today) simply show the content; reduced
 * motion turns it off.
 *
 * `delay` (seconds, kept for the existing call sites) staggers a grid by
 * starting the fade slightly later in the scroll.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  /** Kept for compatibility; the rise distance is set in CSS. */
  y?: number;
  className?: string;
}) {
  const style = delay ? ({ "--reveal-delay": `${Math.min(30, Math.round(delay * 60))}%` } as CSSProperties) : undefined;
  return (
    <div className={className ? `reveal ${className}` : "reveal"} style={style}>
      {children}
    </div>
  );
}
