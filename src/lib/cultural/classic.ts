// The 3D shapes from the archived show designer (src/lib/show/formations),
// carried over into Design a Show as slowly turning formations.
//
// They are genuine 3D wireframes — a globe, a helix, an atom — so they read
// as volume from every angle, and they hold at small fleets (100 drones).
// The archived designer's library itself is left untouched: it is
// version-pinned for old share links.
//
// Motion: the shape holds still (the visitor orbits the camera). Colour: a
// height gradient through a palette, with a slow sweep of light rising
// through the shape.

import type { FormationDef, Vec3 } from "../show/types";
import { SHOW_SCALE } from "../show/constants";
import { makeRand, hashSeed } from "../show/formations/sampling";
import { cube, spiral, starburst } from "../show/formations/geometric";
import { atom, diamond, globe, helix, knot, pyramid } from "../show/formations/playful";
import { AnimatedFormation, SHOW_ALT, hex, type RGB } from "./kit";

type Rig = { n: number; p: Float32Array; h: Float32Array; reach: number };

const PALETTES: Record<string, [string, string]> = {
  globe: ["#3d8bff", "#9ff0ff"],
  helix: ["#ff4fa0", "#7ff6ff"],
  atom: ["#7a5cff", "#fff27a"],
  knot: ["#ff7a2a", "#ffe08a"],
  cube: ["#28d7ff", "#ffffff"],
  spiral: ["#ffb02e", "#ff4f6d"],
  diamond: ["#c9f2ff", "#ffffff"],
  pyramid: ["#ffcc4d", "#ff7b2a"],
  starburst: ["#ff3d6e", "#ffd35a"],
};

const BLURBS: Record<string, string> = {
  globe: "A wireframe globe, turning — reads as a sphere from any seat.",
  helix: "A double helix, climbing as it turns.",
  atom: "Electron orbits around a nucleus.",
  knot: "A torus knot — one line, endlessly looping.",
  cube: "A cube in three dimensions, edges and all.",
  spiral: "A rising spiral, opening upward.",
  diamond: "A brilliant-cut diamond: crown, girdle, pavilion.",
  pyramid: "A pyramid, turning on its base.",
  starburst: "A burst of light rays from a single point.",
};

function wrap(def: FormationDef): AnimatedFormation<Rig> {
  const pal = PALETTES[def.id] ?? ["#ffffff", "#ffd36a"];
  const lo: RGB = hex(pal[0]);
  const hi: RGB = hex(pal[1]);
  // Generous loop up front; the true reach is only known per build, so the
  // turn rate below is also scaled to it.
  const loop = 48;
  return {
    id: `classic-${def.id}`,
    label: def.label,
    blurb: BLURBS[def.id] ?? "",
    loop,
    minDrones: Math.max(100, def.minRecommended),
    theme: "shapes",
    build(n) {
      const pts: Vec3[] = def.build({
        scale: SHOW_SCALE,
        droneCount: n,
        text: undefined,
        rand: makeRand(hashSeed(`${def.id}:${n}:cultural`)),
      } as Parameters<FormationDef["build"]>[0]).slice(0, n);
      // Fewer points than drones: nudge extras off their source so they
      // never stack (same rule as the archived designer).
      const m = pts.length || 1;
      for (let extra = 0; pts.length < n; extra++) {
        const src = pts[extra % m] ?? { x: 0, y: SHOW_ALT, z: 0 };
        const a = extra * 2.399963;
        const r = (1 + Math.floor(extra / m)) * 1.1;
        pts.push({ x: src.x + Math.cos(a) * r, y: src.y + Math.sin(a) * r, z: src.z });
      }
      let minY = Infinity;
      let maxY = -Infinity;
      let reach = 1;
      for (const p of pts) {
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
        reach = Math.max(reach, Math.hypot(p.x, p.z));
      }
      const p = new Float32Array(n * 3);
      const h = new Float32Array(n);
      pts.forEach((q, i) => {
        p[i * 3] = q.x;
        p[i * 3 + 1] = q.y;
        p[i * 3 + 2] = q.z;
        h[i] = (q.y - minY) / Math.max(1, maxY - minY);
      });
      return { n, p, h, reach };
    },
    pose(rig, t, pos, col) {
      // The shape holds still (the visitor orbits the camera); a band of
      // light rises through it. Allocation-free.
      const sweep = ((t / loop) * 2) % 1;
      pos.set(rig.p.subarray(0, rig.n * 3));
      for (let i = 0; i < rig.n; i++) {
        const h = rig.h[i];
        const d = Math.abs(h - sweep);
        const glow = d < 0.12 ? 1 - d / 0.12 : 0;
        const w = glow * 0.5;
        const k = 0.85 + glow * 0.5;
        col[i * 3] = (lo[0] + (hi[0] - lo[0]) * h) * (1 - w) * k + w * k;
        col[i * 3 + 1] = (lo[1] + (hi[1] - lo[1]) * h) * (1 - w) * k + w * k;
        col[i * 3 + 2] = (lo[2] + (hi[2] - lo[2]) * h) * (1 - w) * k + w * k;
      }
    },
  };
}

/**
 * Speed note: the shapes hold still now; only the light moves. (They used to
 * turn: a radius R turning once per 48 s moves at 2πR/48 — 36 m
 * (globe) is 4.7 m/s. `turns` keeps any larger shape at one revolution, so
 * the limit holds only if R stays under ~53 m; the speed test checks it.
 */
export const CLASSIC_3D: AnimatedFormation<Rig>[] = [globe, helix, atom, knot, cube, spiral, diamond, pyramid, starburst].map(wrap);
