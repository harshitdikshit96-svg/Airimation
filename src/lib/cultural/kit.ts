// Figure kit: turns a drawing made of simple parts into drone positions
// that remember which part they belong to — so the parts can move.
//
// WHY A KIT AND NOT AN SVG
// A silhouette SVG gives you a still shape. A show needs Ganesha's trunk to
// sway, his ears to fan, the Ganga to pour from Shiva's hair. That needs
// every drone to know "I am trunk, 70% of the way to the tip, on the left
// edge". So figures are authored as named parts (ellipses, polygons and
// tapered tubes along a curve), sampled once, and posed every frame.
//
// PURE TS, NO DOM: the same code builds the figure in the browser and in
// scripts/export-formations.ts (which writes the files for Blender /
// Skybrush). Deterministic — no Math.random.
//
// UNITS: metres. x right, y up, z toward the audience. Figures are drawn
// around the origin and lifted to show altitude by the caller.
//
// SAMPLING, the way real drone-show artwork is laid out:
//   1. Outline first. Drones are spaced evenly along every edge — the outer
//      silhouette and the edges of parts marked `outline` (an ear against
//      the head, the trunk against the face). Edges are what the eye reads.
//   2. Fill second, on a hexagonal lattice, kept clear of the outline.
//   3. The lattice spacing is solved (bisection) so the total is exactly n.

export type V2 = [number, number];
export type RGB = [number, number, number];

export type Prim =
  | { k: "ellipse"; cx: number; cy: number; rx: number; ry: number; rot?: number }
  | { k: "poly"; pts: V2[] }
  /** A tapered stroke along a smooth curve through `path`. */
  | { k: "tube"; path: V2[]; r0: number; r1: number };

export type Part = {
  id: string;
  prims: Prim[];
  /** Areas removed from this part (e.g. the inside of a crescent). */
  cuts?: Prim[];
  /** Draw this part's edge with its own line of drones. */
  outline?: boolean;
};

/** A sampled tube: the dense centreline, for posing tube drones by (s, u). */
export type TubeLine = { pts: V2[]; len: number[]; total: number; r0: number; r1: number };

export type Sampled2D = {
  n: number;
  x: Float32Array;
  y: Float32Array;
  /** Index into the parts array. */
  part: Uint8Array;
  /** 1 if the drone sits on an edge line, 0 if it is fill. */
  edge: Uint8Array;
  /** Tube drones only: index of the tube within its part, or 255. */
  tube: Uint8Array;
  /** Tube drones: 0 at the tube's start .. 1 at its end. */
  s: Float32Array;
  /** Tube drones: signed offset across the tube, -1..1 of the local radius. */
  u: Float32Array;
  /**
   * Metres from this drone to the edge of its own part. Used to INFLATE a
   * flat drawing into a rounded relief (z ~ sqrt(d)), so a figure has
   * volume when the camera moves round it instead of reading as a sheet.
   */
  d: Float32Array;
  /** Per part, its tubes' centrelines (same order as its `tube` prims). */
  tubes: TubeLine[][];
};

// ------------------------------------------------------------ small maths

export function makeRand(seed: number) {
  let s = seed % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
};
export const TAU = Math.PI * 2;

/** sRGB hex to LINEAR rgb (the shader works in linear light). */
export function hex(h: string): RGB {
  const n = parseInt(h.replace("#", ""), 16);
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return [lin(((n >> 16) & 255) / 255), lin(((n >> 8) & 255) / 255), lin((n & 255) / 255)];
}

export function mixRGB(a: RGB, b: RGB, t: number): RGB {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/** Catmull-Rom through `pts`, `per` samples per span. */
export function spline(pts: V2[], per = 16): V2[] {
  if (pts.length < 3) {
    const out: V2[] = [];
    for (let i = 0; i <= per; i++) out.push([lerp(pts[0][0], pts[1][0], i / per), lerp(pts[0][1], pts[1][1], i / per)]);
    return out;
  }
  const out: V2[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let j = 0; j < per; j++) {
      const t = j / per;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

export function tubeLine(path: V2[], r0: number, r1: number): TubeLine {
  const pts = spline(path, 20);
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, len, total: len[len.length - 1] || 1, r0, r1 };
}

/** Point and unit normal on a centreline at arc fraction s (0..1). */
export function along(line: TubeLine, s: number): { x: number; y: number; nx: number; ny: number } {
  const target = clamp(s, 0, 1) * line.total;
  let i = 1;
  while (i < line.len.length - 1 && line.len[i] < target) i++;
  const a = line.pts[i - 1];
  const b = line.pts[i];
  const seg = line.len[i] - line.len[i - 1] || 1;
  const t = (target - line.len[i - 1]) / seg;
  const dx = (b[0] - a[0]) / seg;
  const dy = (b[1] - a[1]) / seg;
  return { x: lerp(a[0], b[0], t), y: lerp(a[1], b[1], t), nx: -dy, ny: dx };
}

/** Nearest point on a centreline: arc fraction s and signed distance d. */
function project(line: TubeLine, px: number, py: number): { s: number; d: number } {
  let best = Infinity;
  let bs = 0;
  let bd = 0;
  for (let i = 1; i < line.pts.length; i++) {
    const a = line.pts[i - 1];
    const b = line.pts[i];
    const vx = b[0] - a[0];
    const vy = b[1] - a[1];
    const l2 = vx * vx + vy * vy || 1;
    const t = clamp(((px - a[0]) * vx + (py - a[1]) * vy) / l2, 0, 1);
    const qx = a[0] + vx * t - px;
    const qy = a[1] + vy * t - py;
    const d2 = qx * qx + qy * qy;
    if (d2 < best) {
      best = d2;
      bs = (line.len[i - 1] + t * Math.sqrt(l2)) / line.total;
      // Sign: which side of the travel direction the point is on.
      const cross = vx * (py - a[1]) - vy * (px - a[0]);
      bd = Math.sqrt(d2) * (cross >= 0 ? 1 : -1);
    }
  }
  return { s: bs, d: bd };
}

// ------------------------------------------------------------ inside tests

type Compiled =
  | { k: "ellipse"; cx: number; cy: number; rx: number; ry: number; c: number; s: number }
  | { k: "poly"; pts: V2[] }
  | { k: "tube"; line: TubeLine };

function compile(p: Prim): Compiled {
  if (p.k === "ellipse") return { k: "ellipse", cx: p.cx, cy: p.cy, rx: p.rx, ry: p.ry, c: Math.cos(-(p.rot ?? 0)), s: Math.sin(-(p.rot ?? 0)) };
  if (p.k === "poly") return { k: "poly", pts: p.pts };
  return { k: "tube", line: tubeLine(p.path, p.r0, p.r1) };
}

function inside(p: Compiled, x: number, y: number): boolean {
  if (p.k === "ellipse") {
    const dx = x - p.cx;
    const dy = y - p.cy;
    const lx = dx * p.c - dy * p.s;
    const ly = dx * p.s + dy * p.c;
    return (lx * lx) / (p.rx * p.rx) + (ly * ly) / (p.ry * p.ry) <= 1;
  }
  if (p.k === "poly") {
    let hit = false;
    const pts = p.pts;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i];
      const [xj, yj] = pts[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  }
  const { s, d } = project(p.line, x, y);
  return Math.abs(d) <= lerp(p.line.r0, p.line.r1, s);
}

function bounds(p: Compiled): [number, number, number, number] {
  if (p.k === "ellipse") {
    const r = Math.max(p.rx, p.ry);
    return [p.cx - r, p.cy - r, p.cx + r, p.cy + r];
  }
  const pts = p.k === "poly" ? p.pts : p.line.pts;
  const pad = p.k === "tube" ? Math.max(p.line.r0, p.line.r1) : 0;
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const [x, y] of pts) {
    a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y);
  }
  return [a - pad, b - pad, c + pad, d + pad];
}

// ------------------------------------------------------------ sampling

/**
 * Sample `parts` (painted back to front: a later part covers an earlier
 * one) with exactly `n` drones. `edgeBias` > 1 spaces edge drones closer
 * than fill drones, which is what makes a figure read as drawn, not blobby.
 */
export function sampleParts(parts: Part[], n: number, opts: { res?: number; edgeBias?: number; seed?: number } = {}): Sampled2D {
  const compiled = parts.map((part) => ({ prims: part.prims.map(compile), cuts: (part.cuts ?? []).map(compile) }));

  // Raster of "which part is on top here" (-1 = sky).
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const c of compiled) for (const p of c.prims) {
    const [a, b, cc, d] = bounds(p);
    minX = Math.min(minX, a); minY = Math.min(minY, b); maxX = Math.max(maxX, cc); maxY = Math.max(maxY, d);
  }
  const res = opts.res ?? 380;
  const cell = Math.max(maxX - minX, maxY - minY) / res;
  const W = Math.ceil((maxX - minX) / cell) + 2;
  const H = Math.ceil((maxY - minY) / cell) + 2;
  const x0 = minX - cell;
  const y0 = minY - cell;
  const label = new Int16Array(W * H).fill(-1);

  for (let pi = 0; pi < compiled.length; pi++) {
    const { prims, cuts } = compiled[pi];
    for (const prim of prims) {
      const [a, b, c, d] = bounds(prim);
      const i0 = Math.max(0, Math.floor((a - x0) / cell));
      const i1 = Math.min(W - 1, Math.ceil((c - x0) / cell));
      const j0 = Math.max(0, Math.floor((b - y0) / cell));
      const j1 = Math.min(H - 1, Math.ceil((d - y0) / cell));
      for (let j = j0; j <= j1; j++) {
        const y = y0 + (j + 0.5) * cell;
        for (let i = i0; i <= i1; i++) {
          const x = x0 + (i + 0.5) * cell;
          if (!inside(prim, x, y)) continue;
          if (cuts.length && cuts.some((cut) => inside(cut, x, y))) continue;
          label[j * W + i] = pi;
        }
      }
    }
  }
  // Distance (in cells) from every cell to the nearest cell of a DIFFERENT
  // label: a two-pass chamfer transform. Gives each part its own bulge.
  const dist = new Float32Array(W * H).fill(1e9);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const k = j * W + i;
    const l = label[k];
    if (l < 0) {
      dist[k] = 0;
      continue;
    }
    if (i === 0 || j === 0 || i === W - 1 || j === H - 1) dist[k] = 1;
    else if (label[k - 1] !== l || label[k + 1] !== l || label[k - W] !== l || label[k + W] !== l) dist[k] = 1;
  }
  const D2 = Math.SQRT2;
  for (let j = 1; j < H; j++) for (let i = 1; i < W - 1; i++) {
    const k = j * W + i;
    if (dist[k] === 0) continue;
    dist[k] = Math.min(dist[k], dist[k - 1] + 1, dist[k - W] + 1, dist[k - W - 1] + D2, dist[k - W + 1] + D2);
  }
  for (let j = H - 2; j >= 0; j--) for (let i = W - 2; i >= 1; i--) {
    const k = j * W + i;
    if (dist[k] === 0) continue;
    dist[k] = Math.min(dist[k], dist[k + 1] + 1, dist[k + W] + 1, dist[k + W + 1] + D2, dist[k + W - 1] + D2);
  }
  const distAt = (x: number, y: number) => {
    const i = Math.floor((x - x0) / cell);
    const j = Math.floor((y - y0) / cell);
    return i < 0 || j < 0 || i >= W || j >= H ? 0 : dist[j * W + i] * cell;
  };

  const at = (x: number, y: number) => {
    const i = Math.floor((x - x0) / cell);
    const j = Math.floor((y - y0) / cell);
    return i < 0 || j < 0 || i >= W || j >= H ? -1 : label[j * W + i];
  };

  // Edge cells: on the outer silhouette, or where an `outline` part meets
  // something else.
  const edgeCells: number[] = [];
  for (let j = 1; j < H - 1; j++) {
    for (let i = 1; i < W - 1; i++) {
      const l = label[j * W + i];
      if (l < 0) continue;
      const nb = [label[j * W + i - 1], label[j * W + i + 1], label[(j - 1) * W + i], label[(j + 1) * W + i]];
      const outer = nb.some((v) => v < 0);
      // A seam is drawn on the side of the part painted on top, so once.
      const seam = nb.some((v) => v >= 0 && v < l && (parts[l].outline || parts[v].outline));
      if (outer || seam) edgeCells.push(j * W + i);
    }
  }
  // Deterministic shuffle so greedy spacing doesn't follow scan order.
  const rand = makeRand(opts.seed ?? 97);
  for (let i = edgeCells.length - 1; i > 0; i--) {
    const k = Math.floor(rand() * (i + 1));
    [edgeCells[i], edgeCells[k]] = [edgeCells[k], edgeCells[i]];
  }

  const edgeBias = opts.edgeBias ?? 1.35;
  const layout = (h: number) => {
    const d = h / edgeBias;
    const grid = new Map<number, number[]>();
    const key = (x: number, y: number) => Math.floor(x / h) * 100003 + Math.floor(y / h);
    const pts: number[] = [];
    const isEdge: number[] = [];
    const near = (x: number, y: number, r: number) => {
      const gx = Math.floor(x / h);
      const gy = Math.floor(y / h);
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) {
        const list = grid.get((gx + a) * 100003 + gy + b);
        if (!list) continue;
        for (const idx of list) if ((pts[idx * 2] - x) ** 2 + (pts[idx * 2 + 1] - y) ** 2 < r * r) return true;
      }
      return false;
    };
    const add = (x: number, y: number, e: number) => {
      const idx = pts.length / 2;
      pts.push(x, y);
      isEdge.push(e);
      const k = key(x, y);
      const list = grid.get(k);
      if (list) list.push(idx);
      else grid.set(k, [idx]);
    };
    for (const c of edgeCells) {
      const x = x0 + ((c % W) + 0.5) * cell;
      const y = y0 + (Math.floor(c / W) + 0.5) * cell;
      if (!near(x, y, d)) add(x, y, 1);
    }
    // Hex fill.
    const rowH = (h * Math.sqrt(3)) / 2;
    for (let r = 0, y = minY + rowH / 2; y <= maxY; r++, y += rowH) {
      for (let x = minX + (r % 2 ? h / 2 : 0); x <= maxX; x += h) {
        if (at(x, y) < 0) continue;
        if (!near(x, y, h * 0.72)) add(x, y, 0);
      }
    }
    return { pts, isEdge };
  };

  // Bisection on the lattice spacing until the count brackets n.
  let lo = cell * 0.5;
  let hi = Math.max(maxX - minX, maxY - minY);
  let best = layout(hi);
  for (let it = 0; it < 34; it++) {
    const mid = (lo + hi) / 2;
    const r = layout(mid);
    if (r.pts.length / 2 >= n) {
      best = r;
      lo = mid;
    } else hi = mid;
  }
  // Exactly n: drop fill drones evenly if over (never edge drones first).
  const order = Array.from({ length: best.pts.length / 2 }, (_, i) => i);
  const fillIdx = order.filter((i) => !best.isEdge[i]);
  const edgeIdx = order.filter((i) => best.isEdge[i]);
  let keep: number[];
  const over = order.length - n;
  if (over > 0 && over <= fillIdx.length) {
    const drop = new Set<number>();
    for (let k = 0; k < over; k++) drop.add(fillIdx[Math.floor(((k + 0.5) * fillIdx.length) / over)]);
    keep = [...edgeIdx, ...fillIdx.filter((i) => !drop.has(i))];
  } else keep = order.slice(0, n);
  while (keep.length < n) keep.push(keep[keep.length % Math.max(keep.length, 1)] ?? 0);

  const out: Sampled2D = {
    n,
    x: new Float32Array(n),
    y: new Float32Array(n),
    part: new Uint8Array(n),
    edge: new Uint8Array(n),
    tube: new Uint8Array(n).fill(255),
    s: new Float32Array(n),
    u: new Float32Array(n),
    d: new Float32Array(n),
    tubes: compiled.map((c) => c.prims.filter((p): p is Extract<Compiled, { k: "tube" }> => p.k === "tube").map((p) => p.line)),
  };
  for (let k = 0; k < n; k++) {
    const i = keep[k];
    const x = best.pts[i * 2];
    const y = best.pts[i * 2 + 1];
    out.x[k] = x;
    out.y[k] = y;
    out.edge[k] = best.isEdge[i];
    out.d[k] = out.edge[k] ? 0 : distAt(x, y);
    let l = at(x, y);
    if (l < 0) l = 0;
    out.part[k] = l;
    // Tube coordinates, against whichever of the part's tubes is nearest.
    const tubes = out.tubes[l];
    if (tubes.length) {
      let bestT = 0;
      let bestD = Infinity;
      let bestS = 0;
      for (let t = 0; t < tubes.length; t++) {
        const pr = project(tubes[t], x, y);
        const r = lerp(tubes[t].r0, tubes[t].r1, pr.s);
        const rel = Math.abs(pr.d) / r;
        if (rel < bestD) {
          bestD = rel;
          bestT = t;
          bestS = pr.s;
          out.u[k] = clamp(pr.d / r, -1.2, 1.2);
        }
      }
      // Only drones genuinely in a tube follow it; the rest of the part is rigid.
      if (bestD <= 1.25) {
        out.tube[k] = bestT;
        out.s[k] = bestS;
      }
    }
  }
  return out;
}

/**
 * Re-place a tube drone on a (possibly deformed) centreline: same arc
 * fraction, same relative offset across the tube.
 */
export function onTube(line: TubeLine, s: number, u: number, bend?: (s: number) => V2): V2 {
  const p = along(line, s);
  const r = lerp(line.r0, line.r1, s);
  let x = p.x + p.nx * u * r;
  let y = p.y + p.ny * u * r;
  if (bend) {
    const [bx, by] = bend(s);
    x += bx;
    y += by;
  }
  return [x, y];
}

// ------------------------------------------------------------ the contract

/**
 * An animated formation. `build` runs once per drone count; `pose` runs
 * every frame and writes positions (metres, show-centred, see SHOW_ALT)
 * and LINEAR colours, where black means "LED off".
 */
export const THEMES = [
  { id: "culture", label: "Culture & devotion" },
  { id: "landmarks", label: "Landmarks" },
  { id: "animals", label: "Animals" },
  { id: "travel", label: "Travel" },
  { id: "objects", label: "Objects" },
  { id: "shapes", label: "Shapes" },
] as const;
export type Theme = (typeof THEMES)[number]["id"];

export type AnimatedFormation<R = unknown> = {
  id: string;
  label: string;
  /** Short line for the UI. */
  blurb: string;
  /** Source and licence of the 3D model it is made from (listed on /credits). */
  credit?: string;
  /** Theme for the Design a Show filter. */
  theme?: Theme;
  /** Seconds per loop of the animation. */
  loop: number;
  /** Fewest drones at which this figure still reads. */
  minDrones: number;
  build(n: number): R;
  pose(rig: R, t: number, pos: Float32Array, col: Float32Array): void;
};

/**
 * Relief depth for a drone `d` metres inside its part: a rounded bulge
 * (sqrt profile, like an inflated balloon), `k` sets how deep.
 */
export const inflate = (d: number, k = 2.4) => k * Math.sqrt(Math.max(0, d));

/**
 * Real show drones fly at roughly 3–8 m/s. Every formation's motion is
 * tuned to stay under this, and a test enforces it; anything faster is done
 * with LIGHT (LEDs changing on drones that hold still), as real shows do.
 */
export const MAX_DRONE_SPEED = 8;

/** Altitude of a figure's origin. Matches the configurator's show centre. */
export const SHOW_ALT = 85;
