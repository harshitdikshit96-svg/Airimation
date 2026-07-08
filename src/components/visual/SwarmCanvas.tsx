"use client";

import { useEffect, useRef } from "react";
import { scatterPoints, lotusPoints, monogramPoints } from "@/lib/swarmShapes";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function SwarmCanvas({ particleCount = 240 }: { particleCount?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const n = particleCount;
    const formations = [scatterPoints(n), lotusPoints(n), monogramPoints(n)];
    const colors = ["#e0a230", "#5cc6d3", "#f0c878", "#2aa5b5"];

    const particles = Array.from({ length: n }, (_, i) => ({
      from: formations[0][i],
      to: formations[0][i],
      current: { ...formations[0][i] },
      color: colors[i % colors.length],
      size: 1.1 + Math.random() * 1.6,
      twinkle: Math.random() * Math.PI * 2,
    }));

    let formationIndex = 0;
    let transitionStart = performance.now();
    const holdMs = reduceMotion ? 100000 : 2600;
    const transitionMs = 2200;
    let phase: "hold" | "moving" = "hold";
    let raf = 0;

    function setSize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    setSize();
    window.addEventListener("resize", setSize);

    function advanceFormation(now: number) {
      const nextIndex = (formationIndex + 1) % formations.length;
      particles.forEach((p, i) => {
        p.from = { ...p.current };
        p.to = formations[nextIndex][i];
      });
      formationIndex = nextIndex;
      phase = "moving";
      transitionStart = now;
    }

    function draw(now: number) {
      if (!canvas || !ctx) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (phase === "hold" && now - transitionStart > holdMs) {
        advanceFormation(now);
      } else if (phase === "moving") {
        const t = Math.min(1, (now - transitionStart) / transitionMs);
        const eased = easeInOutCubic(t);
        particles.forEach((p) => {
          p.current.x = lerp(p.from.x, p.to.x, eased);
          p.current.y = lerp(p.from.y, p.to.y, eased);
        });
        if (t >= 1) {
          phase = "hold";
          transitionStart = now;
        }
      }

      particles.forEach((p) => {
        const px = p.current.x * w;
        const py = p.current.y * h;
        const twinkle = 0.55 + 0.45 * Math.sin(now / 600 + p.twinkle);
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.55 * twinkle + 0.25;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", setSize);
    };
  }, [particleCount]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />;
}
