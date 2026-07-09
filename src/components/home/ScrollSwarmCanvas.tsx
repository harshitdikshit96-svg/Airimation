"use client";

import { useEffect, useRef } from "react";
import {
  buildFormations,
  easeInOutCubic,
  phaseNames,
  Point,
} from "@/lib/homeFormations";

const DRONE_COUNT = 320;

// How quickly the rendered scroll position catches up to the real one, per
// frame (exponential smoothing). Lower = smoother but laggier, higher =
// snappier but closer to raw scroll jitter. This is what turns a scroll
// event's stepped, uneven deltas into a fluid, continuous glide.
const SCROLL_SMOOTHING = 0.08;

type Particle = {
  size: number;
  twinkle: number;
  stagger: number;
  driftX: number;
  driftY: number;
  prevX: number | null;
  prevY: number | null;
};

/**
 * Fixed full-viewport canvas that renders the swarm as a set of glowing
 * points, morphing between formations based on how far the visitor has
 * scrolled through the page. Pairs with the small phase indicator in the
 * bottom-right corner. Ported from the "Airmation Home v2" design export —
 * see src/lib/homeFormations.ts for the point-cloud generators.
 *
 * Two perf/feel choices worth noting:
 * - Formations are computed once (outside the draw loop), not per frame —
 *   the per-frame cost is just reading positions and drawing.
 * - Glow is layered flat-alpha circles rather than ctx.shadowBlur, which is
 *   dramatically cheaper per particle at this count and was the main source
 *   of dropped frames (which read as "jitter" tied to scroll).
 *
 * Rendering is deliberately plain white and tightly uniform in size — real
 * drone-show photography reads as crisp, small, matched points of light, not
 * varied-size coloured bokeh. Only this file's colour/size math changed for
 * that; the formation shapes and scroll-driven movement are untouched.
 */
export default function ScrollSwarmCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dotRef = useRef<HTMLSpanElement | null>(null);
  const captionRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let lastCaption = "";
    let raf = 0;
    let smoothP = -1; // -1 = uninitialized, seed from actual scroll on first frame

    function setSize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    // Sized before formations are built so the circular/symmetric formations
    // (lotus, heart, snowflake, rings) can be aspect-corrected for the real
    // viewport instead of assuming a fixed ratio.
    setSize();
    window.addEventListener("resize", setSize);

    const aspect = h > 0 ? w / h : 16 / 9;
    const formations = buildFormations(DRONE_COUNT, aspect);

    // Small, tight, uniform range — no depth multiplier. This is the fix for
    // the "uneven bokeh" look: every point reads as roughly the same size,
    // like matched LEDs on real drones, not a spread of blurry blob sizes.
    const particles: Particle[] = Array.from({ length: DRONE_COUNT }, () => ({
      size: 1.3 + Math.random() * 0.35,
      twinkle: Math.random() * Math.PI * 2,
      stagger: Math.random(),
      driftX: Math.random() * Math.PI * 2,
      driftY: Math.random() * Math.PI * 2,
      prevX: null,
      prevY: null,
    }));

    function draw(now: number) {
      if (!ctx) return;
      if (w !== window.innerWidth || h !== window.innerHeight) setSize();
      ctx.clearRect(0, 0, w, h);

      const se = document.scrollingElement || document.documentElement;
      const max = Math.max(1, se.scrollHeight - window.innerHeight);
      const rawP = Math.min(1, Math.max(0, se.scrollTop / max));

      if (smoothP < 0) smoothP = rawP;
      else smoothP += (rawP - smoothP) * SCROLL_SMOOTHING;
      const p = smoothP;

      const F = formations.length;
      const f = p * (F - 1);
      const base = Math.min(F - 2, Math.floor(f));
      const t = f - base;
      const phaseIdx = t > 0.55 ? base + 1 : base;

      // Phase name still updates (it's useful, wayfinding-style information);
      // the indicator dot stays a plain neutral white rather than cycling
      // through the swarm's own phase colours, to keep all UI chrome/text
      // monochrome and let colour live only in the swarm itself.
      const name = phaseNames[phaseIdx];
      if (captionRef.current && name !== lastCaption) {
        captionRef.current.textContent = name;
        lastCaption = name;
      }

      const wash = ctx.createRadialGradient(
        w * 0.5,
        h * 0.45,
        0,
        w * 0.5,
        h * 0.45,
        Math.max(w, h) * 0.6
      );
      wash.addColorStop(0, "rgba(255,255,255,0.035)");
      wash.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      if (p < 0.14) {
        const a = ((0.14 - p) / 0.14) * 0.22;
        const g = ctx.createLinearGradient(0, h * 0.95 - 34, 0, h * 0.95 + 10);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(1, `rgba(255,255,255,${a.toFixed(3)})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, h * 0.95 - 34, w, 44);
      }

      const from: Point[] = formations[base];
      const to: Point[] = formations[base + 1];
      const inTransition = t > 0.06 && t < 0.94;
      const motionScale = reduceMotion ? 0 : 1;

      for (let i = 0; i < DRONE_COUNT; i++) {
        const pt = particles[i];
        const local = Math.min(1, Math.max(0, t * 1.35 - pt.stagger * 0.35));
        const e = easeInOutCubic(local);
        let x = from[i].x + (to[i].x - from[i].x) * e;
        let y = from[i].y + (to[i].y - from[i].y) * e;

        const airborne = Math.min(1, base + e);
        x += Math.sin(now / 1700 + pt.driftX) * 0.004 * airborne * motionScale;
        y += Math.cos(now / 1400 + pt.driftY) * 0.004 * airborne * motionScale;

        const px = x * w;
        const py = y * h;

        // Subtle shimmer only — kept narrow so brightness stays close to
        // uniform across the swarm rather than swinging between dim and hot.
        const tw = reduceMotion ? 1 : 0.5 + 0.5 * Math.sin(now / 620 + pt.twinkle);
        const alpha = 0.75 + 0.2 * tw;
        const size = pt.size;

        if (inTransition && pt.prevX !== null && pt.prevY !== null) {
          const dx = px - pt.prevX;
          const dy = py - pt.prevY;
          const dist = Math.abs(dx) + Math.abs(dy);
          if (dist > 0.7 && dist < 90) {
            ctx.strokeStyle = `rgba(255,255,255,${(alpha * 0.18).toFixed(3)})`;
            ctx.lineWidth = size * 0.8;
            ctx.beginPath();
            ctx.moveTo(pt.prevX, pt.prevY);
            ctx.lineTo(px, py);
            ctx.stroke();
          }
        }
        pt.prevX = px;
        pt.prevY = py;

        // Two flat-alpha layers: a soft halo plus a bright core. Single
        // colour (white), consistent size ratio per particle — no shadowBlur
        // and no per-particle size/colour variance, so points read as crisp
        // matched LEDs rather than blurry, unevenly-sized bokeh.
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${(alpha * 0.16).toFixed(3)})`;
        ctx.arc(px, py, size * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, alpha).toFixed(3)})`;
        ctx.arc(px, py, size * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      />
      <div className="pointer-events-none fixed bottom-7 right-8 z-[2] flex items-center gap-2.5">
        <span
          ref={dotRef}
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-white/70"
        />
        <span
          ref={captionRef}
          className="font-mono text-[11px] tracking-[0.22em] text-dim"
        >
          GROUND HOLD
        </span>
      </div>
    </>
  );
}
