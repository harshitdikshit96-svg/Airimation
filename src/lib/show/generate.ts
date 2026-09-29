// Recipe -> ShowPlan.
//
// This is the "compute once on render" step. It is pure, synchronous and
// deterministic: the same recipe always produces byte-identical output, so
// a link shared today renders the same show a year from now.
//
// It produces formation TARGETS, not a trajectory table. Positions between
// formations are interpolated per frame by the renderer — there is never a
// large trajectory artefact in memory or on disk. See the Phase 3 design
// doc, section A3, for why.

import type { Recipe, ShowPlan, Stage, Vec3 } from "./types";
import { MIN_ALTITUDE, SHOW_SCALE, TIMING } from "./constants";
import { getFormation } from "./formations";
import { hashSeed, makeRand } from "./formations/sampling";
import { assign } from "./assign";

/**
 * Drones at rest on the ground before lift-off. Opening here does two jobs:
 * it mirrors how a real show begins, and it puts the swarm next to the
 * horizon silhouette at a known scale, so the visitor sees how much ground
 * their chosen drone count actually occupies.
 */
function groundGrid(n: number): Vec3[] {
  const cols = Math.ceil(Math.sqrt(n * 2.2));
  const rows = Math.ceil(n / cols);
  const spacing = 3.2; // metres between drones on the ground
  const pts: Vec3[] = [];
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    pts.push({
      x: (col - (cols - 1) / 2) * spacing,
      y: 0.4,
      // Centred on the origin in depth too, so the launch grid sits under
      // the show rather than trailing away behind it.
      z: (row - (rows - 1) / 2) * spacing * 0.9,
    });
  }
  return pts;
}

function clampAltitude(points: Vec3[]): Vec3[] {
  return points.map((p) => (p.y < MIN_ALTITUDE ? { ...p, y: MIN_ALTITUDE } : p));
}

function toFloat32(points: Vec3[]): Float32Array {
  const arr = new Float32Array(points.length * 3);
  for (let i = 0; i < points.length; i++) {
    arr[i * 3] = points[i].x;
    arr[i * 3 + 1] = points[i].y;
    arr[i * 3 + 2] = points[i].z;
  }
  return arr;
}

/** Reorder `target` so that index i is where drone i should go. */
function reorderByAssignment(source: Vec3[], target: Vec3[]): Vec3[] {
  const mapping = assign(source, target);
  const out: Vec3[] = new Array(source.length);
  for (let i = 0; i < source.length; i++) {
    out[i] = target[mapping[i]] ?? target[i] ?? source[i];
  }
  return out;
}

export function generateShow(recipe: Recipe): ShowPlan {
  const n = recipe.d;
  const stages: Stage[] = [];

  // Stage 0 — on the ground, no assembly.
  let previous = groundGrid(n);
  stages.push({
    id: "__ground",
    label: "Ground Hold",
    targets: toFloat32(previous),
    assembleMs: 0,
    holdMs: 1600,
    startMs: 0,
  });

  let cursor = 1600;

  for (const id of recipe.s) {
    const def = getFormation(id, recipe.v);
    if (!def) continue;

    const ctx = {
      scale: SHOW_SCALE,
      droneCount: n,
      text: recipe.t,
      rand: makeRand(hashSeed(`${def.id}:${n}:${recipe.v}`)),
    };

    const canonical = def.build(ctx);
    if (canonical.length === 0) continue; // e.g. text formation with no text

    const taken = clampAltitude(canonical.slice(0, n));
    // If a generator returned fewer than n points, the surplus drones have
    // to go somewhere. They must NOT be placed at coordinates that already
    // exist: identical positions stack drones on top of each other, and
    // additive blending turns each stack into a bright blob. That is what
    // made a stroked name read as clumps rather than letters.
    //
    // Instead each extra drone is nudged off its source point along a
    // deterministic direction, so it reads as a slightly thicker stroke
    // rather than a hotspot.
    const available = taken.length;
    if (available > 0) {
      let extra = 0;
      while (taken.length < n) {
        const src = taken[extra % available];
        const angle = extra * 2.399963; // golden angle — spreads evenly
        const ring = 1 + Math.floor(extra / available);
        const offset = ring * 1.1; // metres
        taken.push({
          x: src.x + Math.cos(angle) * offset,
          y: src.y + Math.sin(angle) * offset,
          z: src.z,
        });
        extra++;
      }
    }

    const ordered = reorderByAssignment(previous, taken);

    stages.push({
      id: def.id,
      label: def.label,
      targets: toFloat32(ordered),
      assembleMs: TIMING.assembleMs,
      holdMs: TIMING.holdMs,
      startMs: cursor,
    });

    cursor += TIMING.assembleMs + TIMING.holdMs;
    previous = ordered;
  }

  // Land again, so the loop closes cleanly instead of cutting.
  const landing = reorderByAssignment(previous, groundGrid(n));
  stages.push({
    id: "__land",
    label: "Landing",
    targets: toFloat32(landing),
    assembleMs: TIMING.assembleMs,
    holdMs: 1200,
    startMs: cursor,
  });
  cursor += TIMING.assembleMs + 1200;

  return {
    recipe,
    droneCount: n,
    stages,
    totalDurationMs: cursor,
  };
}
