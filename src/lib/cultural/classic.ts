// The 3D shapes from the archived show designer (src/lib/show/formations),
// carried over into Design a Show as slowly turning formations.
//
// They are genuine 3D wireframes — a globe, a helix, an atom — so they read
// as volume from every angle, and they hold at small fleets (100 drones).
// The archived designer's library itself is left untouched: it is
// version-pinned for old share links.
//
// Motion: one turntable revolution per loop, loop sized so the outermost
// drone stays under the drone speed limit. Colour: a height gradient
// through a palette, with a slow sweep of light rising through the shape.

import type { FormationDef, Vec3 } from "../show/types";
import { SHOW_SCALE } from "../show/constants";
import { makeRand, hashSeed } from "../show/formations/sampling";
import { cube, spiral, starburst } from "../show/formations/geometric";
import { atom, diamond, globe, helix, knot, pyramid } from "../show/formations/playful";
import { AnimatedFormation, MAX_DRONE_SPEED, SHOW_ALT, TAU, hex, mixRGB, type RGB } from "./kit";

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
      // Whole revolutions per loop, as many as the speed budget allows
      // (at least one): seamless, and never faster than a drone can fly.
      const turns = Math.max(1, Math.floor(((MAX_DRONE_SPEED - 1) * loop) / (TAU * rig.reach)));
      const a = (TAU * turns * t) / loop;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const sweep = (t / loop) * 2 % 1;
      for (let i = 0; i < rig.n; i++) {
        const x = rig.p[i * 3];
        const z = rig.p[i * 3 + 2];
        pos[i * 3] = x * ca + z * sa;
        pos[i * 3 + 1] = rig.p[i * 3 + 1];
        pos[i * 3 + 2] = -x * sa + z * ca;
        const d = Math.abs(rig.h[i] - sweep);
        const glow = d < 0.12 ? 1 - d / 0.12 : 0;
        const c = mixRGB(mixRGB(lo, hi, rig.h[i]), hex("#ffffff"), glow * 0.5);
        const k = 0.85 + glow * 0.5;
        col[i * 3] = c[0] * k;
        col[i * 3 + 1] = c[1] * k;
        col[i * 3 + 2] = c[2] * k;
      }
    },
  };
}

/**
 * Speed note: a radius R turning once per 48 s moves at 2πR/48 — 36 m
 * (globe) is 4.7 m/s. `turns` keeps any larger shape at one revolution, so
 * the limit holds only if R stays under ~53 m; the speed test checks it.
 */
export const CLASSIC_3D: AnimatedFormation<Rig>[] = [globe, helix, atom, knot, cube, spiral, diamond, pyramid, starburst].map(wrap);
