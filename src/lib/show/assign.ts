// Drone-to-target assignment between consecutive formations.
//
// WHY THIS EXISTS: if drone i simply flies to target i, the swarm visibly
// crosses through itself during transitions. It looks wrong, and to an
// audience that has been told drone shows are safe, it looks unsafe.
//
// WHY NOT OPTIMAL: the exact solution is the assignment problem, solved by
// the Hungarian algorithm in O(n^3). At 200 drones that is ~8 million
// operations per transition, and it scales badly if counts ever grow. We
// want the whole show to plan in single-digit milliseconds so that hitting
// "Render" feels instant.
//
// APPROACH: angular sort matching, then a bounded 2-opt improvement pass.
// Sorting both point sets by angle about their centroid and matching by
// index yields near-crossing-free assignments for the symmetric formations
// that dominate the library; 2-opt cleans up the asymmetric cases. Overall
// O(n log n) plus a fixed improvement budget.
//
// This is a VISUAL heuristic. It is not collision-checked and produces
// nothing flight-ready — that validation belongs in Skybrush, not here.

import type { Vec3 } from "./types";

function centroid(points: Vec3[]): Vec3 {
  const c = { x: 0, y: 0, z: 0 };
  for (const p of points) {
    c.x += p.x;
    c.y += p.y;
    c.z += p.z;
  }
  const n = points.length || 1;
  return { x: c.x / n, y: c.y / n, z: c.z / n };
}

function angularOrder(points: Vec3[]): number[] {
  const c = centroid(points);
  return points
    .map((p, i) => {
      const dx = p.x - c.x;
      const dy = p.y - c.y;
      return { i, angle: Math.atan2(dy, dx), radius: Math.hypot(dx, dy) };
    })
    .sort((a, b) => a.angle - b.angle || a.radius - b.radius)
    .map((e) => e.i);
}

function dist2(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Returns `mapping`, where mapping[sourceIndex] = targetIndex.
 * Always a valid permutation.
 */
export function assign(source: Vec3[], target: Vec3[]): Uint16Array {
  const n = Math.min(source.length, target.length);
  const mapping = new Uint16Array(n);

  const srcOrder = angularOrder(source.slice(0, n));
  const tgtOrder = angularOrder(target.slice(0, n));
  for (let k = 0; k < n; k++) {
    mapping[srcOrder[k]] = tgtOrder[k];
  }

  // Bounded 2-opt: sample pairs and swap where it shortens total travel.
  // Fixed budget keeps planning time predictable regardless of drone count.
  const budget = Math.min(n * 12, 6000);
  let seed = 1013904223;
  const nextIndex = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % n;
  };

  for (let step = 0; step < budget; step++) {
    const a = nextIndex();
    const b = nextIndex();
    if (a === b) continue;
    const ta = mapping[a];
    const tb = mapping[b];
    const before = dist2(source[a], target[ta]) + dist2(source[b], target[tb]);
    const after = dist2(source[a], target[tb]) + dist2(source[b], target[ta]);
    if (after < before) {
      mapping[a] = tb;
      mapping[b] = ta;
    }
  }

  return mapping;
}
