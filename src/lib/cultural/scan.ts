// Formations from real 3D models: museum scans and openly licensed models,
// made by scripts/scan-to-formation.mjs. These are TRUE 3D figures: drones
// on the surface of the object, not a flat drawing.
//
// The point list is farthest-point ordered, so the first n points are an
// even sampling for any fleet size n.
//
// Motion: figures hold STILL, facing the audience — the visitor orbits the
// camera to see them in the round (12 Nov 2026). A slow turntable "turn"
// and a gentle "sway" remain available; their loops are sized so the
// outermost drone stays under the speed limit.
//
// Shading is LIGHT: each drone's brightness follows its surface normal
// against a fixed light, so the form reads as solid while it turns.
// Effects are LIGHT too — LEDs changing on drones that hold their place,
// as a real show does them. No effect adds drones beyond the model's own:
//   fireRing  Nataraja's aureole flickers like flame
//   flame     a flame above the lamp's spout (drones taken from the end
//             of the list, so the lamp itself stays evenly sampled)
//   beat      a double heartbeat pulse of brightness
//   strike    the drum's two heads flash in turn
//   arrow     the bow FIRES: the string and arrow draw back, the arrow is
//             loosed and flies off at drone speed, then returns in the
//             dark (LEDs off) and relights on the string. String and
//             arrow drones are the model's own; nothing is added.

import { AnimatedFormation, MAX_DRONE_SPEED, SHOW_ALT, TAU, clamp, hex, mixRGB, type RGB, type Theme } from "./kit";

export type ScanFile = {
  id: string;
  label: string;
  credit: string;
  licence: string;
  height: number;
  width: number;
  depth: number;
  count: number;
  quant: number;
  pos: string;
  nrm: string;
  /** The model's own colours (sRGB hex), from scripts/scan-colors.mjs. */
  palette?: string[];
  /** Per point: base64 Uint8 index into `palette`. */
  ci?: string;
};

/** A formation's small metadata, known before its point data is loaded. */
export type ScanMeta = Pick<ScanFile, "id" | "label" | "credit" | "licence" | "height" | "width" | "depth" | "count" | "quant">;

/**
 * Metadata plus a loader for the heavy point data (scans/manifest.ts), so
 * the page downloads a model only when it is first shown. A full ScanFile
 * (tests, scripts) is also accepted and counts as loaded.
 */
export type ScanSource = ScanMeta & { load?: () => Promise<ScanFile>; pos?: string; nrm?: string };

/**
 * Where a colour goes, in fractions of the model's bounding box (0..1):
 * x left to right, y base to top, z back to front, r = distance from the
 * vertical axis (0 centre .. 1 the widest point). Omitted = any.
 */
export type Region = {
  hex: string;
  /** Brightness, 0..1.5 (default 1). */
  level?: number;
  x?: [number, number];
  y?: [number, number];
  z?: [number, number];
  r?: [number, number];
};

/**
 * Per-drone colour — so a figure's features read, not one flat colour.
 *
 *   texture  the model's REAL colours (photographed texture or artist's
 *            paint, sampled by scripts/scan-colors.mjs), made LED-bright:
 *            each keeps its hue, brightness follows how light it is.
 *   ramp     hex codes from dark to light; each drone takes the colour at
 *            its texture brightness (a bronze's raised face bright gold,
 *            its folds deep amber). Works for any scanned texture.
 *   palette  hex codes replacing the model's own palette one for one
 *            (same order as the file's `palette`).
 *   regions  colours by position, applied last (later rules win). The
 *            only option for models with no texture.
 */
export type Paint = {
  mode?: "texture" | "ramp" | "flat";
  ramp?: string[];
  palette?: string[];
  regions?: Region[];
  /** Brightness of the darkest drones, 0..1 (default 0.3). Never 0: a dark drone still draws the shape. */
  floor?: number;
};

type Effect = "fireRing" | "flame" | "beat" | "strike" | "arrow";

type Rig = {
  n: number;
  p: Float32Array;
  /** Per drone base colour (linear rgb, brightness folded in). */
  c: Float32Array;
  nrm: Float32Array;
  /** Per drone: 0 model, 1 effect group (ring / flame / drum head / arrow), 2 bow string. */
  tag: Uint8Array;
  /** Per drone: effect parameter (flame height 0..1, position along arrow 0..1, drum head ±1). */
  e: Float32Array;
  h: number;
};

export type ScanOptions = {
  blurb: string;
  /** [base, highlight] hex colours. Base is the fallback where paint says nothing. */
  colors: [string, string];
  /** Per-drone colours: see `Paint`. */
  paint?: Paint;
  motion?: "turn" | "sway" | "still";
  /** Sway half-angle, degrees. */
  sway?: number;
  effect?: Effect;
  /** Flame: at the spout (a lamp with a nozzle) or on the wick at the top centre (a round diya). */
  flameAt?: "spout" | "top";
  minDrones?: number;
  theme?: Theme;
};

function decode(b64: string): Uint8Array {
  if (typeof atob === "function") {
    const s = atob(b64);
    const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return u;
  }
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

const FIRE_A = hex("#ff3a12");
const FIRE_B = hex("#ffd36a");
const FLAME_CORE = hex("#fff4c8");
const FLAME_EDGE = hex("#ff6a1a");
const HIGHLIGHT_LIGHT = [-0.45, 0.55, 0.7];
const STRIKE = hex("#fff6e0");
const ARROW_HOT = hex("#fff2c0");

/**
 * The bow's shot, in seconds of one loop. Every drone stays under the
 * 8 m/s limit: the draw is 8 m in 3 s, the string springs back over 2 s,
 * the arrow flies 56 m at 7 m/s, and it returns (dark) over 10 s.
 */
const ARROW = {
  loop: 24,
  drawEnd: 3,
  release: 4,
  stringBack: 2,
  flightEnd: 12,
  fadeFrom: 10.5,
  returnEnd: 22,
  relit: 23,
  draw: 8,
  speed: 7,
};
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Arrow and string offsets (metres along x) and arrow brightness at time t. */
export function arrowShot(t: number): { arrow: number; string: number; light: number } {
  const A = ARROW;
  const p = ((t % A.loop) + A.loop) % A.loop;
  const flown = -A.draw + A.speed * (A.flightEnd - A.release);
  let arrow: number;
  let light = 1;
  if (p < A.release) arrow = -A.draw * smoothstep(0, A.drawEnd, p);
  else if (p < A.flightEnd) arrow = -A.draw + A.speed * (p - A.release);
  else arrow = flown * (1 - smoothstep(A.flightEnd, A.returnEnd, p));
  if (p >= A.fadeFrom && p < A.flightEnd) light = 1 - (p - A.fadeFrom) / (A.flightEnd - A.fadeFrom);
  else if (p >= A.flightEnd && p < A.returnEnd) light = 0;
  else if (p >= A.returnEnd && p < A.relit) light = p - A.returnEnd;
  const string = p < A.release ? arrow : -A.draw * (1 - smoothstep(A.release, A.release + A.stringBack, p));
  return { arrow, string, light };
}

const luma = (c: RGB) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

/** A real (often dull) surface colour as an LED would show it: same hue, full saturation-ish, full brightness. */
function ledHue(c: RGB): RGB {
  const peak = Math.max(c[0], c[1], c[2]) || 1;
  const n: RGB = [c[0] / peak, c[1] / peak, c[2] / peak];
  // Push away from grey a little: LEDs are saturated, textures are not.
  const m = (n[0] + n[1] + n[2]) / 3;
  const sat = 1.6;
  return [clamp(m + (n[0] - m) * sat, 0, 1), clamp(m + (n[1] - m) * sat, 0, 1), clamp(m + (n[2] - m) * sat, 0, 1)];
}

function rampAt(ramp: RGB[], t: number): RGB {
  if (ramp.length === 1) return ramp[0];
  const s = clamp(t, 0, 1) * (ramp.length - 1);
  const k = Math.min(ramp.length - 2, Math.floor(s));
  return mixRGB(ramp[k], ramp[k + 1], s - k);
}

/**
 * Base colour per model point (linear rgb, brightness included), from the
 * texture palette and the paint config. Pure and deterministic.
 */
export function paintPoints(file: ScanFile, pts: Float32Array, m: number, fallback: string, paint: Paint = {}): Float32Array {
  const out = new Float32Array(m * 3);
  const floor = paint.floor ?? 0.55;
  const real = file.palette && file.ci && file.palette.length > 1 ? file.palette.map(hex) : null;
  const idx = real ? decode(file.ci!) : null;
  const mode = paint.mode ?? (paint.ramp ? "ramp" : real ? "texture" : "flat");
  const base = hex(fallback);

  // Brightness rank of each palette entry: its position in the cumulative
  // share of drones, darkest first, so contrast is spread evenly.
  let rank: number[] = [];
  if (real && idx) {
    const share = real.map(() => 0);
    for (let i = 0; i < Math.min(m, idx.length); i++) share[idx[i]]++;
    const byLum = real.map((_, k) => k).sort((a, b) => luma(real[a]) - luma(real[b]));
    rank = real.map(() => 0);
    let acc = 0;
    const total = share.reduce((a, b) => a + b, 0) || 1;
    for (const k of byLum) {
      rank[k] = (acc + share[k] / 2) / total;
      acc += share[k];
    }
  }
  const ramp = paint.ramp?.map(hex);
  const override = paint.palette?.map(hex);
  const maxL = real ? Math.max(...real.map(luma)) || 1 : 1;

  for (let i = 0; i < m; i++) {
    let c: RGB = base;
    let level = 1;
    if (real && idx) {
      const k = idx[i % idx.length];
      if (override && override[k]) {
        c = override[k];
        level = 1;
      } else if (mode === "ramp" && ramp) {
        c = rampAt(ramp, rank[k]);
        level = floor + (1 - floor) * rank[k];
      } else if (mode === "texture") {
        c = ledHue(real[k]);
        level = floor + (1 - floor) * Math.pow(luma(real[k]) / maxL, 0.6);
      }
    } else if (mode === "ramp" && ramp) {
      // No texture: ramp up the figure, base to top.
      c = rampAt(ramp, pts[i * 3 + 1] / Math.max(1, file.height));
    }
    if (paint.regions?.length) {
      const fx = pts[i * 3] / Math.max(1e-6, file.width) + 0.5;
      const fy = pts[i * 3 + 1] / Math.max(1e-6, file.height);
      const fz = pts[i * 3 + 2] / Math.max(1e-6, file.depth) + 0.5;
      const fr = Math.hypot(pts[i * 3], pts[i * 3 + 2]) / Math.max(1e-6, Math.max(file.width, file.depth) / 2);
      const inR = (v: number, r?: [number, number]) => !r || (v >= r[0] && v <= r[1]);
      for (const g of paint.regions) {
        if (inR(fx, g.x) && inR(fy, g.y) && inR(fz, g.z) && inR(fr, g.r)) {
          c = hex(g.hex);
          level = g.level ?? 1;
        }
      }
    }
    out[i * 3] = c[0] * level;
    out[i * 3 + 1] = c[1] * level;
    out[i * 3 + 2] = c[2] * level;
  }
  return out;
}

export function scanFormation(source: ScanSource, opts: ScanOptions): AnimatedFormation<Rig> {
  // Metadata now; points when loaded (already there for a full ScanFile).
  let file: ScanFile | null = source.pos && source.nrm ? (source as ScanFile) : null;
  let pending: Promise<void> | null = null;
  const meta: ScanMeta = source;
  // Still by default (12 Nov 2026): figures face the audience and the
  // visitor orbits the camera. "turn" and "sway" remain for future use.
  const motion = opts.motion ?? "still";
  const swayAmp = ((opts.sway ?? 28) * Math.PI) / 180;
  // Outermost radius from the turn axis, for the speed budget (flame and
  // arrow sit inside the model's bounds or close to them).
  const reach = Math.hypot(meta.width, meta.depth) / 2 + (opts.effect === "flame" ? 8 : 0);
  const budget = MAX_DRONE_SPEED - 1;
  const loop =
    opts.effect === "arrow"
      ? ARROW.loop
      : motion === "turn"
        ? Math.max(48, Math.ceil((TAU * reach) / budget))
        : motion === "still"
          ? 16
          : // Sway: peak angular speed is amp * 2π / loop.
            Math.max(16, Math.ceil((reach * swayAmp * TAU) / budget));
  const highlight = hex(opts.colors[1]);
  let cache: { pos: Int16Array; nrm: Int8Array } | null = null;

  return {
    id: meta.id,
    label: meta.label,
    blurb: opts.blurb,
    credit: meta.credit,
    theme: opts.theme ?? "culture",
    loop,
    minDrones: opts.minDrones ?? 500,
    // Held still with no light effect: every frame is the same picture.
    static: motion === "still" && !opts.effect,
    isLoaded: () => file !== null,
    load() {
      if (file) return Promise.resolve();
      // One request however many callers; the label/credit overrides in
      // the registry (meta) win over the file's own.
      pending ??= source.load!().then((f) => {
        file = { ...f, label: meta.label, credit: meta.credit };
      });
      return pending;
    },
    build(n) {
      if (!file) throw new Error(`${meta.id}: point data not loaded (await load() first)`);
      if (!cache) {
        const pb = decode(file.pos);
        const nb = decode(file.nrm);
        cache = { pos: new Int16Array(pb.buffer, pb.byteOffset, pb.byteLength / 2), nrm: new Int8Array(nb.buffer, nb.byteOffset, nb.byteLength) };
      }
      const m = Math.min(n, file.count);
      const p = new Float32Array(n * 3);
      const nrm = new Float32Array(n * 3);
      const tag = new Uint8Array(n);
      const e = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        // More drones than model points: extras double up on a small offset.
        const j = i < m ? i : i % m;
        const off = i < m ? 0 : 0.6;
        p[i * 3] = cache.pos[j * 3] * file.quant + off;
        p[i * 3 + 1] = cache.pos[j * 3 + 1] * file.quant;
        p[i * 3 + 2] = cache.pos[j * 3 + 2] * file.quant + off;
        for (let k = 0; k < 3; k++) nrm[i * 3 + k] = cache.nrm[j * 3 + k] / 127;
      }
      const W = file.width;
      const H = file.height;

      if (opts.effect === "fireRing") {
        // The aureole: the outer band, far from the figure's middle.
        for (let i = 0; i < n; i++) {
          const dy = p[i * 3 + 1] - H * 0.55;
          if (Math.hypot(p[i * 3], dy) > Math.min(W, H) * 0.4) tag[i] = 1;
        }
      } else if (opts.effect === "flame") {
        // Spout tip: the model point furthest along +x (the lamp is posed
        // spout-sideways by the converter). The flame is ~10% of the fleet,
        // taken from the END of the list so the lamp stays evenly sampled.
        let tip = 0;
        if (opts.flameAt === "top") {
          // Highest drone near the vertical axis: the wick.
          let best = -Infinity;
          for (let i = 0; i < m; i++) {
            if (Math.hypot(p[i * 3], p[i * 3 + 2]) < W * 0.2 && p[i * 3 + 1] > best) {
              best = p[i * 3 + 1];
              tip = i;
            }
          }
        } else {
          for (let i = 0; i < m; i++) if (p[i * 3] > p[tip * 3]) tip = i;
        }
        const tx = p[tip * 3] - (opts.flameAt === "top" ? 0 : W * 0.04);
        const ty = p[tip * 3 + 1] + 1.5;
        const tz = p[tip * 3 + 2];
        const F = Math.max(6, Math.round(n * 0.1));
        // A wide, shallow diya sizes its flame by its width, a tall lamp by its height.
        const ref = opts.flameAt === "top" ? Math.max(H, W * 0.9) : H;
        // The wick sits low in a bowl, so its flame must rise well clear of the rim.
        const FH = ref * (opts.flameAt === "top" ? 0.75 : 0.42);
        const FR = ref * 0.09;
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let k = 0; k < F; k++) {
          const i = n - F + k;
          const s = (k + 0.5) / F;
          // Teardrop: widest a third of the way up, a point at the top.
          const r = FR * Math.sin(Math.PI * Math.pow(s, 0.65)) * Math.sqrt(1 - s * 0.6);
          const a = k * golden;
          p[i * 3] = tx + Math.cos(a) * r;
          p[i * 3 + 1] = ty + s * FH;
          p[i * 3 + 2] = tz + Math.sin(a) * r;
          nrm[i * 3] = 0;
          nrm[i * 3 + 1] = 0;
          nrm[i * 3 + 2] = 1;
          tag[i] = 1;
          e[i] = s;
        }
      } else if (opts.effect === "strike") {
        // Drum heads: the top and bottom tenths of the drum.
        for (let i = 0; i < n; i++) {
          const y = p[i * 3 + 1];
          if (y > H * 0.86 || y < H * 0.14) {
            tag[i] = 1;
            e[i] = y > H / 2 ? 1 : -1;
          }
        }
      } else if (opts.effect === "arrow") {
        // The arrow: a thin horizontal line through the middle of the bow.
        // Find its height from the drones furthest along +x (the head).
        let maxX = -Infinity;
        for (let i = 0; i < m; i++) maxX = Math.max(maxX, p[i * 3]);
        let ySum = 0;
        let yN = 0;
        for (let i = 0; i < m; i++) {
          if (p[i * 3] > maxX - W * 0.15) {
            ySum += p[i * 3 + 1];
            yN++;
          }
        }
        const ay = yN ? ySum / yN : H / 2;
        // The string: the straight line at the bow's back. Found at
        // mid-height (the limb tips reach further back than the string),
        // it is the rearmost line of drones. Each string drone remembers how
        // far it is from the nock (0) to the bow tips (1), so the draw
        // bends it into a V. String drones never fly with the arrow.
        let backX = Infinity;
        for (let i = 0; i < n; i++) {
          const dy = Math.abs(p[i * 3 + 1] - ay);
          if (dy > 3 && dy < H * 0.3) backX = Math.min(backX, p[i * 3]);
        }
        const atString = (i: number) => Math.abs(p[i * 3] - backX) < 1.2;
        let minX = Infinity;
        for (let i = 0; i < n; i++) if (Math.abs(p[i * 3 + 1] - ay) < 1.8 && !atString(i)) minX = Math.min(minX, p[i * 3]);
        for (let i = 0; i < n; i++) {
          if (Math.abs(p[i * 3 + 1] - ay) < 1.8 && !atString(i)) {
            tag[i] = 1;
            e[i] = clamp((p[i * 3] - minX) / Math.max(1, maxX - minX), 0, 1);
          }
        }
        const onString = (i: number) => !tag[i] && atString(i);
        let half = 1;
        for (let i = 0; i < n; i++) if (onString(i)) half = Math.max(half, Math.abs(p[i * 3 + 1] - ay));
        for (let i = 0; i < n; i++) {
          if (onString(i)) {
            tag[i] = 2;
            e[i] = Math.abs(p[i * 3 + 1] - ay) / half;
          }
        }
      }
      // Per-drone colour (extras that double up take their twin's colour).
      const painted = paintPoints(file, p, m, opts.colors[0], opts.paint);
      const c = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const j = i < m ? i : i % m;
        c[i * 3] = painted[j * 3];
        c[i * 3 + 1] = painted[j * 3 + 1];
        c[i * 3 + 2] = painted[j * 3 + 2];
      }
      return { n, p, c, nrm, tag, e, h: H };
    },
    pose(rig, t, pos, col) {
      // Allocation-free: runs for every drone, every frame.
      const a = motion === "turn" ? (TAU * t) / loop : motion === "sway" ? swayAmp * Math.sin((TAU * t) / loop) : 0;
      const shot = opts.effect === "arrow" ? arrowShot(t) : null;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const L0 = HIGHLIGHT_LIGHT[0];
      const L1 = HIGHLIGHT_LIGHT[1];
      const L2 = HIGHLIGHT_LIGHT[2];
      const [h0, h1, h2] = highlight;
      // Heartbeat: two quick pulses, then rest (~1.2 s).
      const beatPhase = (t % 1.2) / 1.2;
      const beat = Math.exp(-((beatPhase - 0.08) ** 2) / 0.002) + 0.7 * Math.exp(-((beatPhase - 0.3) ** 2) / 0.002);
      const strikePhase = (t % 0.9) / 0.9;
      const baseY = SHOW_ALT - rig.h / 2;
      for (let i = 0; i < rig.n; i++) {
        const i3 = i * 3;
        let x = rig.p[i3];
        const y = rig.p[i3 + 1];
        if (shot && rig.tag[i] === 1) x += shot.arrow;
        else if (shot && rig.tag[i] === 2) x += shot.string * (1 - rig.e[i]);
        const z = rig.p[i3 + 2];
        const nx = rig.nrm[i3] * ca + rig.nrm[i3 + 2] * sa;
        const ny = rig.nrm[i3 + 1];
        const nz = -rig.nrm[i3] * sa + rig.nrm[i3 + 2] * ca;
        // Two-sided diffuse: a scan's normals can face either way.
        const diffuse = Math.abs(nx * L0 + ny * L1 + nz * L2);
        // Only the brightest-lit surfaces lean (a little) toward the
        // highlight, so the drone keeps its own colour under bloom.
        const lean = clamp((diffuse - 0.85) / 0.15, 0, 1) * 0.15;
        let r = rig.c[i3] + (h0 - rig.c[i3]) * lean;
        let g = rig.c[i3 + 1] + (h1 - rig.c[i3 + 1]) * lean;
        let b = rig.c[i3 + 2] + (h2 - rig.c[i3 + 2]) * lean;
        let k = 0.4 + 0.6 * diffuse;

        if (rig.tag[i]) {
          if (opts.effect === "fireRing") {
            const flick = 0.5 + 0.5 * Math.sin(t * 7 + i * 1.7) * Math.sin(t * 3.1 + i * 0.37);
            r = FIRE_A[0] + (FIRE_B[0] - FIRE_A[0]) * flick;
            g = FIRE_A[1] + (FIRE_B[1] - FIRE_A[1]) * flick;
            b = FIRE_A[2] + (FIRE_B[2] - FIRE_A[2]) * flick;
            k = 0.75 + 0.6 * flick;
          } else if (opts.effect === "flame") {
            const s = rig.e[i];
            const flick = 0.5 + 0.5 * Math.sin(t * 9 + i * 2.3) * Math.sin(t * 4.3 + i * 0.7);
            const m = clamp(s * 1.3 - 0.1 + flick * 0.25, 0, 1);
            r = FLAME_CORE[0] + (FLAME_EDGE[0] - FLAME_CORE[0]) * m;
            g = FLAME_CORE[1] + (FLAME_EDGE[1] - FLAME_CORE[1]) * m;
            b = FLAME_CORE[2] + (FLAME_EDGE[2] - FLAME_CORE[2]) * m;
            k = (1.5 - s * 0.6) * (0.75 + 0.35 * flick);
          } else if (opts.effect === "strike") {
            // Heads flash in turn, like the two beads striking them.
            const hit = rig.e[i] > 0 ? Math.exp(-strikePhase * 9) : Math.exp(-((strikePhase + 0.5) % 1) * 9);
            r += (STRIKE[0] - r) * hit;
            g += (STRIKE[1] - g) * hit;
            b += (STRIKE[2] - b) * hit;
            k = k * (0.8 + 1.1 * hit);
          } else if (opts.effect === "arrow" && shot && rig.tag[i] === 1) {
            // The arrow burns bright, its head white-hot; dark on the way back.
            const head = rig.e[i] > 0.85 ? 1 : 0;
            const m = 0.3 + 0.7 * head;
            r += (ARROW_HOT[0] - r) * m;
            g += (ARROW_HOT[1] - g) * m;
            b += (ARROW_HOT[2] - b) * m;
            k = (1.1 + 0.6 * head) * shot.light;
          }
        }
        if (opts.effect === "beat") k *= 0.7 + 0.55 * beat;

        // Rotation is about the vertical axis only, so the flame stays
        // upright above the spout.
        pos[i3] = x * ca + z * sa;
        pos[i3 + 1] = baseY + y;
        pos[i3 + 2] = -x * sa + z * ca;
        col[i3] = r * k;
        col[i3 + 1] = g * k;
        col[i3 + 2] = b * k;
      }
    },
  };
}
