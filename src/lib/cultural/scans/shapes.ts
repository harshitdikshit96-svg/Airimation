// The 3D shapes — globe, helix, atom and the rest — as real 3D models,
// modelled by Airimation in Blender (scripts/blender/make-shapes.py; GLBs
// in the workspace Scans/made/shapes/). They replaced the code-generated
// shapes (classic.ts) in Nov 2026 so that EVERY formation on Design a Show
// is made from a 3D model. Every shape is a closed SOLID (a cube's six
// faces, a pyramid's sides and base, a whole sphere, lines as thick rods),
// not a wireframe: drones cover the surfaces and the shading by surface
// normal makes the faces read in 3D. Solids need ~500 drones to read (at
// 100 a cube face gets ~17), so they start at 500; the globe at 200.
//
// Colour: two clearly different hues per shape, placed by which way each
// surface faces (paint.byFace), so every face of a solid shows its own colour.

import type { AnimatedFormation } from "../kit";
import { scanFormation } from "../scan";
import { SCAN_SOURCES } from "./manifest";

const SHAPES: { name: string; blurb: string; ramp: [string, string]; minDrones: number }[] = [
  { name: "globe", blurb: "A solid globe of light — a sphere from any seat.", ramp: ["#2a5bff", "#3fe0ff"], minDrones: 200 },
  { name: "helix", blurb: "A double helix: two solid strands and their rungs.", ramp: ["#ff4fa0", "#7ff6ff"], minDrones: 500 },
  { name: "atom", blurb: "A nucleus, three orbit rings and their electrons.", ramp: ["#7a5cff", "#ffe23a"], minDrones: 500 },
  { name: "knot", blurb: "A torus knot — one solid rope, endlessly looping.", ramp: ["#ff5a1a", "#ffd23a"], minDrones: 500 },
  { name: "cube", blurb: "A solid cube: six faces, each lit differently.", ramp: ["#1f4bff", "#2fe6ff"], minDrones: 500 },
  { name: "spiral", blurb: "A rising spiral, its arms opening upward.", ramp: ["#ffb02e", "#ff4f6d"], minDrones: 500 },
  { name: "diamond", blurb: "A solid brilliant-cut diamond: table, crown, pavilion.", ramp: ["#6a4bff", "#3fd8ff"], minDrones: 500 },
  { name: "pyramid", blurb: "A solid pyramid: four faces on a square base.", ramp: ["#ff4a1a", "#ffc23a"], minDrones: 500 },
  { name: "starburst", blurb: "Rays of light bursting from a glowing core.", ramp: ["#ff3d6e", "#ffd35a"], minDrones: 500 },
];

export const SHAPE_FORMATIONS: AnimatedFormation<unknown>[] = SHAPES.map((s) =>
  scanFormation(SCAN_SOURCES[`shape-${s.name}`], {
    blurb: s.blurb,
    colors: [s.ramp[0], s.ramp[1]],
    // Colour by facing: each face of a solid shows its own colour.
    paint: { ramp: s.ramp, byFace: true },
    theme: "shapes",
    minDrones: s.minDrones,
    // Strong face shading: a cube's or pyramid's faces must differ in brightness.
    shading: 0.85,
  })
) as AnimatedFormation<unknown>[];
