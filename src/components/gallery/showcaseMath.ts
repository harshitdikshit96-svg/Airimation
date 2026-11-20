// Pure numbers behind the Design a Show preview (no three.js, no DOM), so
// they can be unit-tested.

import type { HueMode } from "@/lib/show/palettes";
export type { HueMode };

/**
 * The preview runs this much faster than the flyable choreography. The
 * formations themselves are tuned to real drone speeds (< 8 m/s, enforced by
 * tests); at 1x the preview felt slow, so it plays at 1.8x — about halfway
 * between those real speeds and the earlier, unrealistically fast version.
 * The page copy says the preview is sped up.
 */
export const PREVIEW_RATE = 1.8;

/** Fleet size at which a figure is drawn at its designed size (84 m tall). */
const REFERENCE_FLEET = 500;

/**
 * How big a figure is flown for a fleet. Real shows keep drones a fixed
 * distance apart, so more drones means a BIGGER picture, not just a denser
 * one: size grows with the square root of the count (spacing stays put).
 * Clamped so 100 drones still reads (x0.5); 5,000 flies a figure ~3.2x the
 * 500-drone size, so each fleet step is a clear visual difference.
 */
export function fleetScale(count: number): number {
  return Math.min(3.2, Math.max(0.5, Math.sqrt(count / REFERENCE_FLEET)));
}

/**
 * Centre altitude: the figure's base (42 m below centre at full size) stays
 * ~60 m up, clear of the skyline from the audience's eye line, so a bigger
 * figure flies higher.
 */
export function showAltitude(count: number): number {
  return 42 * fleetScale(count) + 60;
}

/**
 * Camera distance for a fleet. It grows slower than the figure, so a bigger
 * fleet both fills more of the frame and shows finer detail.
 */
export function viewDistance(count: number): number {
  // Exponent 0.8: at 5,000 drones (a figure ~3.2x as big) the camera backs
  // off ~2.5x, so the figure is bigger on screen but still fits the frame.
  return 230 * Math.pow(fleetScale(count), 0.8);
}

/** Drone cruise speed for transitions, m/s, at the preview rate. */
const MORPH_SPEED = 7.5 * PREVIEW_RATE;
export const MORPH_MIN = 4.5;
export const MORPH_MAX = 14;

/**
 * Transitions take as long as the distance needs. The shader eases each
 * drone with a cubic (peak speed 3x the average) inside its staggered
 * window, so duration = 3 * distance / ((1 - stagger) * v), clamped.
 */
export function morphSeconds(maxDistance: number, stagger: number): number {
  return Math.min(MORPH_MAX, Math.max(MORPH_MIN, (3 * maxDistance) / ((1 - stagger) * MORPH_SPEED)));
}

function hexToLinear(h: string): [number, number, number] {
  const v = parseInt(h.slice(1), 16);
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return [f((v >> 16) & 255), f((v >> 8) & 255), f(v & 255)];
}

type HSV = [number, number, number];

function toHsv([r, g, b]: [number, number, number]): HSV {
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d > 0) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  return [h / 6, max ? d / max : 0, max];
}

function fromHsv(h: number, s: number, v: number, out: Float32Array, i: number) {
  const k = (n: number) => (n + h * 6) % 6;
  const f = (n: number) => v - v * s * Math.max(0, Math.min(k(n), 4 - k(n), 1));
  out[i] = f(5);
  out[i + 1] = f(3);
  out[i + 2] = f(1);
}

/** Blend two colours round the colour wheel (shortest way): blue to gold
 *  passes through green or magenta, never through grey (which, at full
 *  brightness, is white). A grey end (the Tiranga's white) keeps the other's hue. */
function mixHsv(a: HSV, c: HSV, t: number): HSV {
  let ha = a[0];
  let hc = c[0];
  if (a[1] < 0.05) ha = hc;
  if (c[1] < 0.05) hc = ha;
  let dh = hc - ha;
  if (dh > 0.5) dh -= 1;
  if (dh < -0.5) dh += 1;
  return [(ha + dh * t + 1) % 1, a[1] + (c[1] - a[1]) * t, a[2] + (c[2] - a[2]) * t];
}


const rampCache = new Map<string, HSV[]>();

/** A fixed pseudo-random 0..1 per integer (same input, same colour, every frame). */
function hash01(i: number): number {
  let x = Math.imul(i + 1, 0x9e3779b1);
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

/**
 * Recolour a posed figure with an LED theme ("LED hues"): each drone keeps
 * its own BRIGHTNESS (so shading, flame flicker and every light effect still
 * read) and takes its hue from the theme, laid on by `mode`:
 *   height   a gradient top to bottom (top = first colour)
 *   bands    hard horizontal stripes, cycling the colours
 *   radial   rings from the figure's centre outwards
 *   sweep    a gradient left to right
 *   scatter  patches of colour, like thrown Holi powder (single drones
 *            at random blur to white from the ground; patches read)
 * Blends go round the colour wheel, so they stay vivid. Dim drones are
 * lifted (`LIFT`) so a dark-textured model still glows in its theme;
 * light and shade keep their order and dark drones stay dark. An empty
 * palette leaves the formation's own colours.
 */
const LIFT = 0.3;

export function applyHues(pos: Float32Array, col: Float32Array, count: number, palette: string[], mode: HueMode = "height"): void {
  if (!palette.length || count === 0) return;
  const key = palette.join();
  let ramp = rampCache.get(key);
  if (!ramp) rampCache.set(key, (ramp = palette.map((h) => toHsv(hexToLinear(h)))));
  const n = ramp.length;
  const last = n - 1;
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < count; i++) {
    const x = pos[i * 3];
    const y = pos[i * 3 + 1];
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
    cx += x;
    cy += y;
    cz += pos[i * 3 + 2];
  }
  cx /= count;
  cy /= count;
  cz /= count;
  let rMax = 0;
  if (mode === "radial") {
    for (let i = 0; i < count; i++) {
      rMax = Math.max(rMax, Math.hypot(pos[i * 3] - cx, pos[i * 3 + 1] - cy, pos[i * 3 + 2] - cz));
    }
  }
  const ySpan = y1 - y0 || 1;
  const xSpan = x1 - x0 || 1;
  const bands = Math.max(6, n * 2);
  const cell = Math.max(xSpan, ySpan) / 7 || 1; // Holi patches: ~7 across
  const pick = (u: number) => ramp![Math.min(n - 1, Math.floor(u * n))];
  for (let i = 0; i < count; i++) {
    const raw = Math.max(col[i * 3], col[i * 3 + 1], col[i * 3 + 2]);
    const level = raw > 0.01 ? LIFT + (1 - LIFT) * raw : raw;
    const fromTop = (y1 - pos[i * 3 + 1]) / ySpan; // 0 top .. 1 bottom
    let c: HSV;
    if (mode === "bands") c = ramp[Math.min(bands - 1, Math.floor(fromTop * bands)) % n];
    else if (mode === "scatter") {
      const ix = Math.floor((pos[i * 3] - x0) / cell);
      const iy = Math.floor((pos[i * 3 + 1] - y0) / cell);
      const iz = Math.floor((pos[i * 3 + 2] - cz) / cell);
      c = pick(hash01(ix * 73856093 + iy * 19349663 + iz * 83492791));
    }
    else {
      const u =
        mode === "radial"
          ? Math.hypot(pos[i * 3] - cx, pos[i * 3 + 1] - cy, pos[i * 3 + 2] - cz) / (rMax || 1)
          : mode === "sweep"
            ? (pos[i * 3] - x0) / xSpan
            : fromTop;
      const sIdx = u * last;
      const k = Math.max(0, Math.min(last - 1, Math.floor(sIdx)));
      c = last === 0 ? ramp[0] : mixHsv(ramp[k], ramp[k + 1], Math.min(1, sIdx - k));
    }
    // Hue and saturation from the theme; brightness from the drone.
    fromHsv(c[0], c[1], level, col, i * 3);
  }
}
