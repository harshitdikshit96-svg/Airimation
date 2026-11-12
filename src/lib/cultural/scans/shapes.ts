// The 3D shapes — globe, helix, atom and the rest — as real 3D models,
// modelled by Airimation in Blender (scripts/blender/make-shapes.py; GLBs
// in the workspace Scans/made/shapes/). They replaced the code-generated
// shapes (classic.ts) in Nov 2026 so that EVERY formation on Design a Show
// is made from a 3D model. Lines are thin tubes, so drones sample the lines.
//
// Colour: a gradient up the shape (base colour at the bottom, light at the
// top), the same pairs the generated shapes used.

import type { AnimatedFormation } from "../kit";
import { scanFormation } from "../scan";
import { SCAN_SOURCES } from "./manifest";

const SHAPES: { name: string; blurb: string; ramp: [string, string]; minDrones: number }[] = [
  { name: "globe", blurb: "A wireframe globe — reads as a sphere from any seat.", ramp: ["#3d8bff", "#9ff0ff"], minDrones: 500 },
  { name: "helix", blurb: "A double helix, two strands and their rungs.", ramp: ["#ff4fa0", "#7ff6ff"], minDrones: 100 },
  { name: "atom", blurb: "Electron orbits around a nucleus.", ramp: ["#7a5cff", "#fff27a"], minDrones: 500 },
  { name: "knot", blurb: "A torus knot — one line, endlessly looping.", ramp: ["#ff7a2a", "#ffe08a"], minDrones: 100 },
  { name: "cube", blurb: "A cube in three dimensions, edges and all.", ramp: ["#28d7ff", "#e8fbff"], minDrones: 100 },
  { name: "spiral", blurb: "A rising spiral, opening upward.", ramp: ["#ffb02e", "#ff4f6d"], minDrones: 500 },
  { name: "diamond", blurb: "A brilliant-cut diamond: crown, girdle, pavilion.", ramp: ["#9fd8ff", "#e8f8ff"], minDrones: 100 },
  { name: "pyramid", blurb: "A pyramid on its square base.", ramp: ["#ff7b2a", "#ffcc4d"], minDrones: 100 },
  { name: "starburst", blurb: "A burst of light rays from a single point.", ramp: ["#ff3d6e", "#ffd35a"], minDrones: 100 },
];

export const SHAPE_FORMATIONS: AnimatedFormation<unknown>[] = SHAPES.map((s) =>
  scanFormation(SCAN_SOURCES[`shape-${s.name}`], {
    blurb: s.blurb,
    colors: [s.ramp[0], s.ramp[1]],
    paint: { ramp: s.ramp },
    theme: "shapes",
    minDrones: s.minDrones,
  })
) as AnimatedFormation<unknown>[];
