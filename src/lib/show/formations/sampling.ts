// Shared helpers for building formation point sets.
//
// The central idea of this module is PROGRESSIVE ORDERING. Every formation
// generates a dense canonical set (CANONICAL_POINTS), and rendering at n
// drones simply takes the first n. For that to work, any prefix of the array
// must be spread evenly over the whole shape — if points were stored in
// natural order (say, sweeping around a circle), the first 50 of 600 would
// be a 30-degree arc rather than a circle.
//
// `orderProgressively` fixes that using a van der Corput sequence, so a
// prefix of any length samples the full shape at roughly even spacing.

import type { Vec3 } from "../types";
import { CANONICAL_POINTS } from "../constants";

/**
 * Small deterministic PRNG (Lehmer / minimal standard). Same generator used
 * by the existing 2D swarm code, kept for consistency. Never use
 * Math.random() in a formation — a shared link must render identically
 * forever.
 */
export function makeRand(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Stable numeric seed from a string, so each formation gets its own stream. */
export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) || 1;
}

/** Van der Corput radical inverse in base 2 — a low-discrepancy sequence. */
function radicalInverse(i: number): number {
  let result = 0;
  let base = 0.5;
  let n = i;
  while (n > 0) {
    result += (n & 1) * base;
    n >>= 1;
    base /= 2;
  }
  return result;
}

/**
 * Reorder so that every prefix is evenly distributed across the original
 * sequence. Taking the first k of the result samples the whole shape rather
 * than one contiguous region of it.
 */
export function orderProgressively<T>(items: T[]): T[] {
  const indices = items.map((_, i) => i);
  indices.sort((a, b) => radicalInverse(a) - radicalInverse(b));
  return indices.map((i) => items[i]);
}

/**
 * Assemble a canonical point set from priority tiers. Each tier is ordered
 * progressively, then tiers are concatenated in order of importance — so the
 * silhouette is fully sampled before any interior fill appears.
 *
 * RULE, learned the hard way: EVERY ELEMENT ESSENTIAL TO RECOGNITION MUST
 * SHARE TIER 1. The diya was first written as
 * prioritise(bowl, rim, flame) with 220 bowl points — so at 200 drones the
 * renderer never reached the flame and the formation was an anonymous arc.
 * Tier boundaries are hard cut-offs at low counts, whereas progressive
 * ordering *within* a tier distributes points across everything in it. So
 * "bowl and flame" belongs in one tier and "decorative rim" in the next,
 * not one element per tier.
 */
export function prioritise(...tiers: Vec3[][]): Vec3[] {
  const out: Vec3[] = [];
  for (const tier of tiers) {
    out.push(...orderProgressively(tier));
  }
  return fitToCanonical(out);
}

/** Pad (by repeating with slight jitter) or trim to exactly CANONICAL_POINTS. */
function fitToCanonical(points: Vec3[]): Vec3[] {
  if (points.length === CANONICAL_POINTS) return points;
  if (points.length > CANONICAL_POINTS) return points.slice(0, CANONICAL_POINTS);

  const out = points.slice();
  const rand = makeRand(points.length + 7);
  let i = 0;
  while (out.length < CANONICAL_POINTS && points.length > 0) {
    const src = points[i % points.length];
    out.push({
      x: src.x + (rand() - 0.5) * 0.6,
      y: src.y + (rand() - 0.5) * 0.6,
      z: src.z + (rand() - 0.5) * 0.6,
    });
    i++;
  }
  return out;
}

/**
 * Sample a closed parametric curve at even parameter spacing.
 * `curve(t)` takes t in [0, 1).
 */
export function sampleCurve(count: number, curve: (t: number) => Vec3): Vec3[] {
  const pts: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    pts.push(curve(i / count));
  }
  return pts;
}

/**
 * Rejection-sample points inside a 2D region, lifted onto a plane.
 * `contains(u, v)` takes coordinates in [-1, 1].
 */
export function sampleArea(
  count: number,
  rand: () => number,
  contains: (u: number, v: number) => boolean,
  place: (u: number, v: number) => Vec3
): Vec3[] {
  const pts: Vec3[] = [];
  let guard = 0;
  while (pts.length < count && guard < count * 200) {
    guard++;
    const u = rand() * 2 - 1;
    const v = rand() * 2 - 1;
    if (contains(u, v)) pts.push(place(u, v));
  }
  return pts;
}
