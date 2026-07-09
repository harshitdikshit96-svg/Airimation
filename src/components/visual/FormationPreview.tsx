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

const generators: Record<string, (n: number, aspect?: number) => Point[]> = {
  lotus: lotusPoints,
  monogram: monogramPoints,
  ring: ringPoints,
  wave: wavePoints,
  heart: heartPoints,
  snowflake: snowflakePoints,
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function FormationPreview({
  formation,
  particleCount = 110,
}: {
  formation: "lotus" | "monogram" | "ring" | "wave" | "heart" | "snowflake";
  particleCount?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const n = particleCount;
    // Aspect-correct circular/symmetric shapes (lotus, ring, heart, snowflake)
    // for this card's actual width/height so they render as true circles
    // rather than squashed ellipses.
    const parentEl = canvas.parentElement;
    const aspect =
      parentEl && parentEl.clientHeight
        ? parentEl.clientWidth / parentEl.clientHeight
        : 4 / 3;
    const shape = generators[formation](n, aspect);
    const scatter = scatterPoints(n);
    const formations = [scatter, shape];

    // Single colour (white), small and tight size range — matches the
    // homepage swarm's fix for the same "uneven bokeh" problem: real
    // drone-show photography reads as crisp, uniform points of light.
    const particles = Array.from({ length: n }, (_, i) => ({
      from: formations[0][i],
      to: formations[0][i],
      current: { ...formations[0][i] },
      size: 1.2 + Math.random() * 0.3,
    }));

    let idx = 0;
    let start = performance.now();
    const holdMs = 2400;
    const transitionMs = 1800;
    let phase: "hold" | "moving" = "hold";
    let raf = 0;

    function setSize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : 300;
      const h = parent ? parent.clientHeight : 300;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    setSize();
    window.addEventListener("resize", setSize);

    function draw(now: number) {
      if (!canvas || !ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
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
        const eased = easeInOutCubic(t);
        particles.forEach((p) => {
          p.current.x = lerp(p.from.x, p.to.x, eased);
          p.current.y = lerp(p.from.y, p.to.y, eased);
        });
        if (t >= 1) {
          phase = "hold";
          start = now;
        }
      }

      particles.forEach((p) => {
        const px = p.current.x * w;
        const py = p.current.y * h;

        // Two flat-alpha white layers (soft halo + bright core) instead of
        // shadowBlur — crisp, no per-particle colour or size variance.
        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.16)";
        ctx.arc(px, py, p.size * 2.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "rgba(255,255,255,0.95)";
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
  }, [formation, particleCount]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
