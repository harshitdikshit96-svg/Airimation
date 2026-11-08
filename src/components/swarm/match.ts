// Reorder a target formation so drone i flies to the target nearest its
// own position, using the configurator's assignment heuristic (angular
// sort + bounded 2-opt, see src/lib/show/assign.ts). Without this, drones
// cross through each other in transit and the swarm reads as noise.

import { assign } from "@/lib/show/assign";
import type { Vec3 } from "@/lib/show/types";

function toVecs(a: Float32Array, n: number): Vec3[] {
  const out: Vec3[] = new Array(n);
  for (let i = 0; i < n; i++) out[i] = { x: a[i * 3], y: a[i * 3 + 1], z: a[i * 3 + 2] };
  return out;
}

export function matchTargets(from: Float32Array, to: Float32Array, n: number): Float32Array {
  const mapping = assign(toVecs(from, n), toVecs(to, n));
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const j = mapping[i];
    out[i * 3] = to[j * 3];
    out[i * 3 + 1] = to[j * 3 + 1];
    out[i * 3 + 2] = to[j * 3 + 2];
  }
  return out;
}

/**
 * Per-drone start delays that ripple outward from a point — used for
 * lift-off, so the fleet lights and rises in waves from the centre.
 */
export function radialDelays(positions: Float32Array, n: number, cx = 0, cz = 0): Float32Array {
  const d = new Float32Array(n);
  let max = 1e-6;
  for (let i = 0; i < n; i++) {
    d[i] = Math.hypot(positions[i * 3] - cx, positions[i * 3 + 2] - cz);
    if (d[i] > max) max = d[i];
  }
  for (let i = 0; i < n; i++) d[i] /= max;
  return d;
}
