// Helpers for building genuinely three-dimensional formations.
//
// WHY THIS EXISTS: the first formation set was parametric curves in the x/y
// plane — a lotus was a flat rose curve, a heart a flat outline. From the
// front they read fine; orbit forty degrees and they collapse into a line,
// which is exactly what a real drone show does NOT do. A swarm is a volume.
//
// The approach here is to define real 3D geometry — surfaces of revolution,
// petals as curved sheets, implicit surfaces sampled as shells — and to put
// the DEFINING curves (rims, ribs, silhouette edges) in priority tier 1 so
// that at 50 drones the shape still reads as itself. Drones can only ever
// suggest a surface, so emphasising its edges is what makes the form legible
// rather than a fuzzy cloud.

import type { Vec3 } from "../types";

/**
 * Evenly distributed directions on a sphere (Fibonacci spiral). Used for
 * radial bursts and for shell-sampling implicit surfaces.
 */
export function fibonacciDirections(count: number): Vec3[] {
  const out: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / Math.max(count - 1, 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    out.push({ x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius });
  }
  return out;
}

export function rotateY(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c };
}

/**
 * Tilt about the X axis.
 *
 * Needed because the audience stands on the ground and looks UP. A flower
 * that opens toward the sky presents only its underside from there — a
 * spiky cluster, not a bloom. Real shows tilt such forms toward the crowd
 * for exactly this reason.
 */
export function rotateX(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

export function translate(p: Vec3, dx: number, dy: number, dz: number): Vec3 {
  return { x: p.x + dx, y: p.y + dy, z: p.z + dz };
}

/**
 * A surface of revolution. `profile(t)` returns { r, y } in metres for
 * t in [0,1]; the profile is swept around the Y axis.
 *
 * Returns rings and ribs separately so the caller can tier them: rings read
 * as the object's silhouette from the side, ribs from above.
 */
export function revolve(
  profile: (t: number) => { r: number; y: number },
  options: { rings: number; segments: number; ribs: number }
): { rings: Vec3[]; ribs: Vec3[] } {
  const rings: Vec3[] = [];
  const ribs: Vec3[] = [];

  for (let i = 0; i < options.rings; i++) {
    const t = options.rings === 1 ? 0.5 : i / (options.rings - 1);
    const { r, y } = profile(t);
    for (let j = 0; j < options.segments; j++) {
      const a = (j / options.segments) * Math.PI * 2;
      rings.push({ x: Math.cos(a) * r, y, z: Math.sin(a) * r });
    }
  }

  for (let k = 0; k < options.ribs; k++) {
    const a = (k / options.ribs) * Math.PI * 2;
    const steps = 26;
    for (let i = 0; i < steps; i++) {
      const { r, y } = profile(i / (steps - 1));
      ribs.push({ x: Math.cos(a) * r, y, z: Math.sin(a) * r });
    }
  }

  return { rings, ribs };
}

/**
 * One petal, as a curved sheet.
 *
 * Built in a local frame where the petal grows outward along +x from the
 * flower's centre, then rotated into place. `s` runs base (0) to tip (1),
 * `w` runs across the petal (-1 to 1).
 */
export type PetalSpec = {
  /** Distance from the flower axis at which the petal starts, in metres. */
  innerRadius: number;
  /** Petal length, in metres. */
  length: number;
  /** Half-width at the petal's widest, in metres. */
  halfWidth: number;
  /** Vertical rise from base to tip, in metres. Negative droops outward. */
  rise: number;
  /** Extra upward curl at the tip, in metres. */
  curl: number;
  /** How much the petal cups: edges lift relative to the centre rib. */
  cup: number;
  /** Height of the petal base above the formation origin, in metres. */
  baseHeight: number;
};

function petalPoint(spec: PetalSpec, s: number, w: number): Vec3 {
  // Width tapers to nothing at base and tip, widest just past the middle.
  // Widest at roughly a third of the way out, then tapering to a sharp
  // tip — the profile of an actual petal rather than a symmetric lens.
  const halfWidth = spec.halfWidth * Math.sin(Math.PI * Math.pow(s, 0.55));
  const radial = spec.innerRadius + s * spec.length;
  const y =
    spec.baseHeight +
    s * spec.rise +
    spec.curl * s * s +
    spec.cup * w * w * Math.sin(Math.PI * s);
  return { x: radial, y, z: w * halfWidth };
}

/**
 * A petal sampled into three priority groups:
 *  - `edge`   the two outer edges plus the tip — the silhouette
 *  - `rib`    the centre line, which gives the petal its direction
 *  - `fill`   the surface between them
 */
export function petal(
  spec: PetalSpec,
  angle: number,
  counts: { edge: number; rib: number; fill: number }
): { edge: Vec3[]; rib: Vec3[]; fill: Vec3[] } {
  const edge: Vec3[] = [];
  const rib: Vec3[] = [];
  const fill: Vec3[] = [];

  const perSide = Math.max(1, Math.floor(counts.edge / 2));
  for (let i = 0; i < perSide; i++) {
    const s = i / (perSide - 1 || 1);
    edge.push(rotateY(petalPoint(spec, s, 1), angle));
    edge.push(rotateY(petalPoint(spec, s, -1), angle));
  }

  for (let i = 0; i < counts.rib; i++) {
    rib.push(rotateY(petalPoint(spec, i / (counts.rib - 1 || 1), 0), angle));
  }

  const grid = Math.max(1, Math.floor(Math.sqrt(counts.fill)));
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const s = (i + 0.5) / grid;
      const w = ((j + 0.5) / grid) * 2 - 1;
      fill.push(rotateY(petalPoint(spec, s, w * 0.72), angle));
    }
  }

  return { edge, rib, fill };
}

/**
 * One petal as a CLOSED OUTLINE: up one edge, around the tip, back down the
 * other. At the point budgets this product deals in (a handful of drones per
 * petal) an outline reads as a petal where scattered surface samples read as
 * noise.
 */
export function petalOutline(spec: PetalSpec, angle: number, count: number): Vec3[] {
  const pts: Vec3[] = [];
  const half = Math.max(2, Math.floor(count / 2));
  for (let i = 0; i < half; i++) {
    pts.push(rotateY(petalPoint(spec, i / (half - 1 || 1), 1), angle));
  }
  for (let i = half - 1; i >= 0; i--) {
    pts.push(rotateY(petalPoint(spec, i / (half - 1 || 1), -1), angle));
  }
  return pts;
}

/**
 * Sample the shell of an implicit surface F(p) = 0.
 *
 * For each direction, march outward from the origin and bisect on the sign
 * change. Cheap, robust for star-shaped surfaces (every ray crosses the
 * boundary exactly once), and it needs no mesh asset — which is what makes a
 * real 3D heart possible in a few lines rather than a downloaded model.
 */
export function implicitShell(
  directions: Vec3[],
  F: (x: number, y: number, z: number) => number,
  maxRadius = 2.2
): Vec3[] {
  const out: Vec3[] = [];

  for (const dir of directions) {
    let low = 0;
    let high = maxRadius;
    const at = (r: number) => F(dir.x * r, dir.y * r, dir.z * r);
    const inside = at(0.001);

    // Find a bracket where the sign flips.
    let found = false;
    const steps = 24;
    for (let i = 1; i <= steps; i++) {
      const r = (i / steps) * maxRadius;
      if (Math.sign(at(r)) !== Math.sign(inside)) {
        low = ((i - 1) / steps) * maxRadius;
        high = r;
        found = true;
        break;
      }
    }
    if (!found) continue;

    for (let i = 0; i < 18; i++) {
      const mid = (low + high) / 2;
      if (Math.sign(at(mid)) === Math.sign(inside)) low = mid;
      else high = mid;
    }

    const r = (low + high) / 2;
    out.push({ x: dir.x * r, y: dir.y * r, z: dir.z * r });
  }

  return out;
}
