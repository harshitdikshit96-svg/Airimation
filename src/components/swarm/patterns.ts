// LED colour patterns.
//
// A pattern decides what colour each drone shows at a given instant. They
// are deliberately per-formation and coherent — a lotus is pinks and golds,
// a diya is flame-warm — rather than random per drone, which is what made
// the earlier 2D attempt look like confetti.
//
// Patterns are evaluated every frame, so they can animate: sweeps, pulses
// and slow hue drifts are what a real LED show actually does.

export type Rgb = [number, number, number];

export type ColorContext = {
  /** Drone index. */
  i: number;
  /** Total drones in this show. */
  n: number;
  /** Position in metres. */
  x: number;
  y: number;
  z: number;
  /** Seconds since the show started — drives animation. */
  t: number;
  /** Stable per-drone pseudo-random value in [0,1). */
  r: number;
  /** Height within the formation, roughly 0 at its base and 1 at its top. */
  h: number;
};

export type ColorPattern = (ctx: ColorContext) => Rgb;

function hsvToRgb(hue: number, sat: number, val: number): Rgb {
  const h = ((hue % 1) + 1) % 1;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = val * (1 - sat);
  const q = val * (1 - f * sat);
  const t = val * (1 - (1 - f) * sat);
  switch (i % 6) {
    case 0: return [val, t, p];
    case 1: return [q, val, p];
    case 2: return [p, val, t];
    case 3: return [p, q, val];
    case 4: return [t, p, val];
    default: return [val, p, q];
  }
}

/** Gentle brightness shimmer, so a held formation is never dead still. */
function shimmer(ctx: ColorContext): number {
  return 0.86 + 0.14 * Math.sin(ctx.t * 2.1 + ctx.r * 12.0);
}

/**
 * DIWALI SHIMMER — the default.
 *
 * Every drone holds a stable hue drawn from a festive palette (saffron,
 * gold, rose, emerald, cyan, violet) so the swarm reads as strings of
 * fairy lights rather than a random scatter, and the whole palette drifts
 * slowly so the sky is never static. Each drone twinkles on its own
 * offset, which is what makes a real LED swarm sparkle rather than glow.
 *
 * This replaced a plain white default. White was correct for the earlier
 * 2D canvas work, where a multi-colour version read as bokeh — but that
 * was a symptom of wildly varying point sizes, not of colour. With tight
 * uniform sizes, colour is what the brief actually wants.
 */
// Weighted toward warm: saffron, amber and gold appear roughly twice as
// often as the cool accents. An even spread across the wheel reads as a
// generic RGB rainbow; Diwali is warm light with pops of rose and green.
const FESTIVE_HUES = [
  0.07, // saffron
  0.10, // amber
  0.07, // saffron
  0.13, // gold
  0.10, // amber
  0.96, // rose
  0.13, // gold
  0.34, // emerald
  0.07, // saffron
  0.53, // cyan
];

const DIWALI: ColorPattern = (ctx) => {
  const hue =
    FESTIVE_HUES[Math.floor(ctx.r * FESTIVE_HUES.length) % FESTIVE_HUES.length] +
    ctx.t * 0.02;
  // Sharp, offset twinkle — closer to a lamp flame than a sine glow.
  const phase = Math.sin(ctx.t * 2.6 + ctx.r * 41.0);
  const twinkle = 0.58 + 0.42 * Math.pow(Math.max(0, phase), 1.6);
  return hsvToRgb(hue, 0.78, twinkle);
};

/** Kept for anything that genuinely wants plain light. */
const WHITE: ColorPattern = (ctx) => {
  const v = shimmer(ctx);
  return [v, v, v];
};

/**
 * Gold heart fading to pink petal tips.
 *
 * Keyed to distance from the flower's axis, not to height: the bloom is
 * tilted to face the audience, so "up" no longer runs from centre to tip.
 */
const LOTUS: ColorPattern = (ctx) => {
  const radius = Math.min(1, Math.hypot(ctx.x, ctx.z * 1.6) / 46);
  const hue = 0.13 - radius * 0.22; // gold -> rose
  return hsvToRgb(hue, 0.35 + radius * 0.4, shimmer(ctx));
};

/** Flame: deep amber at the wick, pale yellow at the tip, flickering. */
const DIYA: ColorPattern = (ctx) => {
  const flicker = 0.8 + 0.2 * Math.sin(ctx.t * 7.3 + ctx.r * 9.0);
  if (ctx.h < 0.42) {
    // The clay bowl — warm white, steady.
    const v = 0.9 * shimmer(ctx);
    return [v, v * 0.86, v * 0.66];
  }
  const hue = 0.11 - (ctx.h - 0.42) * 0.05;
  return hsvToRgb(hue, 0.85 - (ctx.h - 0.42) * 0.7, flicker);
};

/** Saffron, for the Om. */
const SAFFRON: ColorPattern = (ctx) => hsvToRgb(0.08, 0.72, shimmer(ctx));

/** Deep red with a slow pulse, like a heartbeat. */
const HEART: ColorPattern = (ctx) => {
  const beat = 0.72 + 0.28 * Math.pow(Math.max(0, Math.sin(ctx.t * 1.6)), 3);
  return hsvToRgb(0.98, 0.7, beat * shimmer(ctx));
};

/** A hue wave travelling outward from the centre. */
const WAVE_SWEEP: ColorPattern = (ctx) => {
  const radius = Math.hypot(ctx.x, ctx.z) / 60;
  return hsvToRgb(0.55 + radius * 0.35 - ctx.t * 0.12, 0.62, shimmer(ctx));
};

/** A hue rotation around the vertical axis — good for rings and spirals. */
const SPIN: ColorPattern = (ctx) => {
  const angle = Math.atan2(ctx.z, ctx.x) / (Math.PI * 2);
  return hsvToRgb(angle + ctx.t * 0.08, 0.6, shimmer(ctx));
};

/**
 * On the ground, before lift-off and after landing: warm amber navigation
 * lights with the occasional cool one, the way a real fleet looks sitting
 * on the grass. Deliberately calmer than the airborne palette so the
 * lift-off reads as the show actually starting.
 */
const FLEET: ColorPattern = (ctx) => {
  const cool = ctx.r > 0.86;
  const v = 0.55 + 0.45 * Math.pow(Math.max(0, Math.sin(ctx.t * 1.7 + ctx.r * 23)), 2);
  return cool ? hsvToRgb(0.55, 0.45, v) : hsvToRgb(0.09, 0.8, v);
};

/** Warm temple gold, brightening toward the top of the form. */
const GOLD: ColorPattern = (ctx) =>
  hsvToRgb(0.1 - ctx.h * 0.015, 0.62 - ctx.h * 0.25, shimmer(ctx));

export const COLOR_PATTERNS: Record<string, ColorPattern> = {
  __ground: FLEET,
  __land: FLEET,
  ring: SPIN,
  spiral: SPIN,
  wave: WAVE_SWEEP,
  cube: DIWALI,
  starburst: WAVE_SWEEP,
  lotus: LOTUS,
  diya: DIYA,
  om: SAFFRON,
  bloom: LOTUS,
  ganesha: SAFFRON,
  temple: GOLD,
  heart: HEART,
  text: DIWALI,
  globe: SPIN,
  diamond: DIWALI,
  knot: WAVE_SWEEP,
  helix: SPIN,
  atom: WAVE_SWEEP,
  pyramid: GOLD,
};

export function patternFor(stageId: string): ColorPattern {
  return COLOR_PATTERNS[stageId] ?? DIWALI;
}

// `WHITE` is unused by the current library but kept deliberately: a future
// formation may want plain light, and reconstructing the shimmer curve is
// more annoying than keeping six lines.
void WHITE;
