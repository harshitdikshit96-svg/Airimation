"use client";

import { useEffect, useRef } from "react";
import {
  scatterPoints,
  lotusPoints,
  monogramPoints,
  ringPoints,
  wavePoints,
  heartPoints,
  snowflakePoints,
  Point,
} from "@/lib/swarmShapes";

const SEQUENCE: ((n: number, aspect?: number) => Point[])[] = [
  scatterPoints,
  wavePoints,
  lotusPoints,
  heartPoints,
  snowflakePoints,
  ringPoints,
  monogramPoints,
];

const DRONE_COUNT = 140;

/**
 * Ambient looping swarm for the Academy page's hero — cycles through every
 * formation shape in sequence, purely decorative. Same rendering approach as
 * the rest of the site (single white colour, tight uniform size, two-layer
 * glow) so it feels like the same product, just a different, playful page.
 */
export default function AcademySwarmHero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    function setSize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      w = parent ? parent.clientWidth : 800;
      h = parent ? parent.clientHeight : 400;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    setSize();
    window.addEventListener("resize", setSize);

    const aspect = w / Math.max(1, h);
    const formations = SEQUENCE.map((fn) => fn(DRONE_COUNT, aspect));

    const particles = Array.from({ length: DRONE_COUNT }, (_, i) => ({
      current: { ...formations[0][i] },
      from: { ...formations[0][i] },
      to: { ...formations[0][i] },
      size: 1.2 + Math.random() * 0.3,
    }));

    let idx = 0;
    let start = performance.now();
    const holdMs = 2600;
    const transitionMs = 1700;
    let phase: "hold" | "moving" = "hold";
    let raf = 0;

    function ease(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function draw(now: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      if (phase === "hold" && now - start > holdMs) {
        const next = (idx + 1) % formations.length;
        particles.forEach((p, i) => {
          p.from = { ...p.current };
          p.to = formations[next][i];
        });
        idx = next;
        phase = "moving";
        start = now;
      } else if (phase === "moving") {
        const t = Math.min(1, (now - start) / transitionMs);
        const e = ease(t);
        particles.forEach((p) => {
          p.current.x = p.from.x + (p.to.x - p.from.x) * e;
          p.current.y = p.from.y + (p.to.y - p.from.y) * e;
        });
        if (t >= 1) {
          phase = "hold";
          start = now;
        }
      }

      particles.forEach((p) => {
        const px = p.current.x * w;
        const py = p.current.y * h;

        // Dark rose core + soft pink halo — reads clearly against the
        // internal theme's light pink background (white dots would vanish).
        ctx.beginPath();
        ctx.fillStyle = "rgba(236,111,156,0.22)";
        ctx.arc(px, py, p.size * 2.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "rgba(58,31,43,0.85)";
        ctx.arc(px, py, p.size * 0.85, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="h-full w-full" />;
}
