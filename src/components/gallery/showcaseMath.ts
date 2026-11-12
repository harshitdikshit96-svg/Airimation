// Pure numbers behind the Design a Show preview (no three.js, no DOM), so
// they can be unit-tested.

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
 * Clamped so 100 drones still reads and 2,000 still fits the sky.
 */
export function fleetScale(count: number): number {
  return Math.min(2, Math.max(0.5, Math.sqrt(count / REFERENCE_FLEET)));
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
  return 230 * Math.sqrt(fleetScale(count));
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

const rampCache = new Map<string, [number, number, number][]>();

/**
 * Recolour a posed figure with an LED palette ("LED hues"): each drone keeps
 * its own BRIGHTNESS (so shading, flame flicker and every light effect still
 * read) and takes its hue from a gradient through the palette, top to
 * bottom. An empty palette leaves the formation's own colours.
 */
export function applyHues(pos: Float32Array, col: Float32Array, count: number, palette: string[]): void {
  if (!palette.length || count === 0) return;
  const key = palette.join();
  let ramp = rampCache.get(key);
  if (!ramp) rampCache.set(key, (ramp = palette.map(hexToLinear)));
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < count; i++) {
    const y = pos[i * 3 + 1];
    if (y < lo) lo = y;
    if (y > hi) hi = y;
  }
  const span = hi - lo || 1;
  const last = ramp.length - 1;
  for (let i = 0; i < count; i++) {
    const r = col[i * 3];
    const g = col[i * 3 + 1];
    const b = col[i * 3 + 2];
    const level = Math.max(r, g, b);
    // Top of the figure = the palette's first (dominant) colour.
    const s = ((hi - pos[i * 3 + 1]) / span) * last;
    const k = Math.min(last - 1, Math.floor(s));
    const t = last === 0 ? 0 : s - k;
    const a = ramp[Math.max(0, k)];
    const c = ramp[Math.min(last, k + 1)];
    const cr = a[0] + (c[0] - a[0]) * t;
    const cg = a[1] + (c[1] - a[1]) * t;
    const cb = a[2] + (c[2] - a[2]) * t;
    const peak = Math.max(cr, cg, cb) || 1;
    col[i * 3] = (cr / peak) * level;
    col[i * 3 + 1] = (cg / peak) * level;
    col[i * 3 + 2] = (cb / peak) * level;
  }
}
