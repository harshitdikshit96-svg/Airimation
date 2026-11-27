// Formation generators for any drone count.
//
// A formation is a function from a drone count to that many target
// positions, in METRES (x right, y up, z toward the audience), as a flat
// Float32Array. Three families:
//
//   parametric  circle, sphere, spiral, heart, wave, grid, cloud, lotus
//   text        fromText("AIRIMATION", n)        - filled glyphs
//   SVG         fromSvg(pathD, n, { viewBox })  - filled silhouettes
//
// This is the general toolkit (home page, new configurator formations).
// The configurator's original library in src/lib/show/formations is
// version-pinned for share links and stays as it is.
//
// Text and SVG sampling are FILLED, using jittered stratified sampling: the
// shape's area is cut into n equal cells and one drone lands at a random
// lit point in each. That gives the even, dense, slightly organic texture
// of a real show (and of the reference), with no clumps and no grid
// artefacts. Canvas-based, so browser-only.

import { SHOW_CENTRE_ALTITUDE } from "@/lib/show/constants";

export type Formation = { id: string; label: string; build: (n: number) => Float32Array };

/** The whole "add a formation" API. See README > Adding a formation. */
export function defineFormation(id: string, label: string, build: (n: number) => Float32Array): Formation {
  return { id, label, build };
}

// ------------------------------------------------------------ utilities

export function makeRand(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function fill(n: number, at: (i: number, out: [number, number, number]) => void): Float32Array {
  const arr = new Float32Array(n * 3);
  const p: [number, number, number] = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    at(i, p);
    arr[i * 3] = p[0];
    arr[i * 3 + 1] = p[1];
    arr[i * 3 + 2] = p[2];
  }
  return arr;
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const Y0 = SHOW_CENTRE_ALTITUDE;

// ------------------------------------------------------------ parametric

/** Launch grid on the ground, centred under the show. */
export function grid(n: number, spacing = 2.6): Float32Array {
  const cols = Math.ceil(Math.sqrt(n * 1.6));
  const rows = Math.ceil(n / cols);
  return fill(n, (i, p) => {
    p[0] = ((i % cols) - (cols - 1) / 2) * spacing;
    p[1] = 0.4;
    p[2] = (Math.floor(i / cols) - (rows - 1) / 2) * spacing * 0.9;
  });
}

/**
 * The launch grid risen into a level, hovering carpet with a slow swell
 * through it — how a real fleet holds after take-off, before the first
 * formation. Index order matches grid(), so no matching is needed.
 */
export function sheet(n: number, altitude = 46): Float32Array {
  const g = grid(n, 3.6);
  for (let i = 0; i < n; i++) {
    const x = g[i * 3];
    const z = g[i * 3 + 2];
    g[i * 3 + 1] = altitude + Math.sin(x * 0.045 + z * 0.03) * 5 - z * 0.12;
  }
  return g;
}

export function circle(n: number, radius = 48): Float32Array {
  return fill(n, (i, p) => {
    const a = (i / n) * Math.PI * 2;
    p[0] = Math.cos(a) * radius;
    p[1] = Y0 + Math.sin(a) * radius;
    p[2] = 0;
  });
}

export function sphere(n: number, radius = 46): Float32Array {
  return fill(n, (i, p) => {
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(1 - y * y);
    const a = i * GOLDEN;
    p[0] = Math.cos(a) * r * radius;
    p[1] = Y0 + y * radius;
    p[2] = Math.sin(a) * r * radius;
  });
}

export function spiral(n: number, radius = 55, turns = 4): Float32Array {
  return fill(n, (i, p) => {
    const t = i / n;
    const a = t * turns * Math.PI * 2;
    const r = radius * Math.sqrt(t);
    p[0] = Math.cos(a) * r;
    p[1] = Y0 + Math.sin(a) * r;
    p[2] = (t - 0.5) * 20;
  });
}

/** Filled heart: half the drones on the outline, half inside. */
export function heart(n: number, size = 3.2): Float32Array {
  const rand = makeRand(4242);
  const outline = Math.floor(n * 0.5);
  const shape = (t: number): [number, number] => [
    16 * Math.pow(Math.sin(t), 3),
    13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t),
  ];
  return fill(n, (i, p) => {
    const t = i < outline ? (i / outline) * Math.PI * 2 : rand() * Math.PI * 2;
    const k = i < outline ? 1 : Math.sqrt(rand()) * 0.94;
    const [x, y] = shape(t);
    p[0] = x * size * k;
    p[1] = Y0 + (y + 2) * size * k;
    p[2] = (rand() - 0.5) * 3;
  });
}

export function wave(n: number, width = 150): Float32Array {
  const cols = Math.ceil(Math.sqrt(n * 3));
  const rows = Math.ceil(n / cols);
  return fill(n, (i, p) => {
    const u = (i % cols) / (cols - 1) - 0.5;
    const v = Math.floor(i / cols) / Math.max(rows - 1, 1) - 0.5;
    p[0] = u * width;
    p[2] = v * 60;
    p[1] = Y0 + Math.sin(u * 9 + v * 3) * 12 + v * 30;
  });
}

/** Loose volumetric cloud — the swarm "breathing" in open sky. */
export function cloud(n: number, width = 120, height = 60, depth = 50, seed = 99): Float32Array {
  const rand = makeRand(seed);
  const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;
  return fill(n, (_, p) => {
    p[0] = gauss() * width * 0.6;
    p[1] = Y0 + gauss() * height * 0.6 + 5;
    p[2] = gauss() * depth * 0.6;
  });
}

/**
 * Lotus in bloom, in 3D: three rings of curved petals opening outward and
 * tilted toward the audience, over a seed-pod centre. Each petal is a
 * curved surface sampled with more drones along its rim than its body, so
 * the outlines read crisply and the fill gives it mass.
 */
export function lotus(n: number, size = 52): Float32Array {
  const rand = makeRand(1608);
  const rings = [
    { count: 8, len: 1.0, width: 0.42, open: 1.2, offset: 0, share: 0.42 },
    { count: 8, len: 0.82, width: 0.38, open: 0.8, offset: Math.PI / 8, share: 0.32 },
    { count: 6, len: 0.55, width: 0.36, open: 0.35, offset: 0, share: 0.16 },
  ];
  const centreShare = 0.1;
  const out = new Float32Array(n * 3);
  let w = 0;
  const push = (x: number, y: number, z: number) => {
    if (w >= n) return;
    // Tilt the whole flower 62 degrees toward the audience.
    const tilt = 1.08;
    const yy = y * Math.cos(tilt) - z * Math.sin(tilt);
    const zz = y * Math.sin(tilt) + z * Math.cos(tilt);
    out[w * 3] = x * size;
    out[w * 3 + 1] = Y0 - 6 + yy * size;
    out[w * 3 + 2] = zz * size * 0.6;
    w++;
  };
  for (const ring of rings) {
    const budget = Math.floor(n * ring.share);
    const perPetal = Math.max(4, Math.floor(budget / ring.count));
    for (let k = 0; k < ring.count; k++) {
      const a = ring.offset + (k / ring.count) * Math.PI * 2;
      for (let j = 0; j < perPetal; j++) {
        const rim = j < perPetal * 0.55;
        const u = rim ? (j / (perPetal * 0.55)) : rand(); // along the petal
        const side = rim ? (j % 2 === 0 ? 1 : -1) : (rand() * 2 - 1) * 0.9;
        const width = ring.width * Math.sin(Math.PI * Math.pow(u, 0.8));
        const s = rim ? side * width : side * width;
        // Petal frame: radial r, tangential s, height h (cupped upward).
        const r = 0.12 + u * ring.len * Math.cos(ring.open * u * 0.6);
        const h = Math.sin(u * ring.open) * ring.len * 0.55 + u * u * 0.25;
        push(Math.cos(a) * r - Math.sin(a) * s * 0.5, h, Math.sin(a) * r + Math.cos(a) * s * 0.5);
      }
    }
  }
  const centre = Math.floor(n * centreShare);
  for (let i = 0; i < centre; i++) {
    const r = Math.sqrt(rand()) * 0.13;
    const a = i * GOLDEN;
    push(Math.cos(a) * r, 0.06 + rand() * 0.03, Math.sin(a) * r);
  }
  // Rounding leaves a few drones unplaced; tuck them into the centre.
  while (w < n) push((rand() - 0.5) * 0.2, 0.08, (rand() - 0.5) * 0.2);
  return out;
}

// ------------------------------------------------------------ raster sampling

type RasterOptions = {
  /** Width of the result in metres. */
  width: number;
  /** Max height in metres (aspect is preserved). */
  maxHeight?: number;
  /** Forward bow in metres, so flat shapes are not perfectly planar. */
  bow?: number;
  seed?: number;
  /** Altitude of the shape's centre. */
  altitude?: number;
};

const RASTER_W = 1024;
const RASTER_H = 512;

function sampleRaster(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  n: number,
  opts: RasterOptions
): Float32Array {
  const out = new Float32Array(n * 3);
  if (typeof document === "undefined" || n === 0) return out;

  const canvas = document.createElement("canvas");
  canvas.width = RASTER_W;
  canvas.height = RASTER_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return out;
  ctx.fillStyle = "#fff";
  draw(ctx, RASTER_W, RASTER_H);
  const { data } = ctx.getImageData(0, 0, RASTER_W, RASTER_H);

  // Collect lit pixels at step 2 (plenty: ~10x the largest fleet).
  const xs: number[] = [];
  const ys: number[] = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let y = 0; y < RASTER_H; y += 2) {
    for (let x = 0; x < RASTER_W; x += 2) {
      if (data[(y * RASTER_W + x) * 4 + 3] < 128) continue;
      xs.push(x);
      ys.push(y);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (xs.length === 0) return out;

  // Jittered stratified sampling: cells sized so ~n of them are lit.
  const rand = makeRand(opts.seed ?? 31);
  const cell = Math.max(2, Math.sqrt((xs.length * 4) / n));
  const buckets = new Map<number, number[]>();
  for (let i = 0; i < xs.length; i++) {
    const key = Math.floor(ys[i] / cell) * 4096 + Math.floor(xs[i] / cell);
    let b = buckets.get(key);
    if (!b) buckets.set(key, (b = []));
    b.push(i);
  }
  const chosen: number[] = [];
  for (const b of buckets.values()) chosen.push(b[Math.floor(rand() * b.length)]);
  // Deterministic shuffle, then trim or top up to exactly n.
  for (let i = chosen.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [chosen[i], chosen[j]] = [chosen[j], chosen[i]];
  }
  while (chosen.length < n) chosen.push(Math.floor(rand() * xs.length));
  chosen.length = n;

  const bw = Math.max(maxX - minX, 1);
  const bh = Math.max(maxY - minY, 1);
  const unit = Math.min(opts.width / bw, (opts.maxHeight ?? Infinity) / bh);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const alt = opts.altitude ?? Y0;
  const bow = opts.bow ?? 8;
  const halfW = (bw * unit) / 2;

  for (let k = 0; k < n; k++) {
    const i = chosen[k];
    // Sub-pixel jitter so drones don't sit on the 2px sampling lattice.
    const x = (xs[i] + (rand() - 0.5) * 2 - cx) * unit;
    const y = alt - (ys[i] + (rand() - 0.5) * 2 - cy) * unit;
    out[k * 3] = x;
    out[k * 3 + 1] = y;
    out[k * 3 + 2] = bow * (1 - (x / halfW) ** 2) + (rand() - 0.5) * 2.2;
  }
  return out;
}

/**
 * Filled text. Await the font first (`document.fonts.load`), or the canvas
 * silently falls back to a system face.
 */
export function fromText(
  text: string,
  n: number,
  opts: RasterOptions & { font?: string; letterSpacing?: number } = { width: 150 }
): Float32Array {
  const font = opts.font ?? `600 220px "Clash Display", "IBM Plex Sans", sans-serif`;
  return sampleRaster(
    (ctx, w, h) => {
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if ("letterSpacing" in ctx) {
        (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${opts.letterSpacing ?? 6}px`;
      }
      const m = ctx.measureText(text);
      const scale = Math.min(1, (w * 0.94) / Math.max(m.width, 1));
      ctx.setTransform(scale, 0, 0, scale, (w / 2) * (1 - scale), (h / 2) * (1 - scale));
      ctx.fillText(text, w / 2, h / 2);
    },
    n,
    opts
  );
}

/** Filled SVG path. `viewBox` is the square extent the path was drawn in. */
export function fromSvg(
  d: string,
  n: number,
  opts: RasterOptions & { viewBox: number; fillRule?: CanvasFillRule }
): Float32Array {
  return sampleRaster(
    (ctx, w, h) => {
      const unit = h / opts.viewBox;
      ctx.setTransform(unit, 0, 0, unit, (w - opts.viewBox * unit) / 2, 0);
      ctx.fill(new Path2D(d), opts.fillRule ?? "nonzero");
    },
    n,
    opts
  );
}
