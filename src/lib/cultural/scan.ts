// Formations from real 3D models: museum scans and openly licensed models,
// made by scripts/scan-to-formation.mjs. These are TRUE 3D figures: drones
// on the surface of the object, not a flat drawing.
//
// The point list is farthest-point ordered, so the first n points are an
// even sampling for any fleet size n.
//
// Motion (real drone speeds): a slow turntable turn; for flat objects (a
// lamp, a heart) a gentle sway, so they never turn edge-on to the
// audience; or "still" (the bow, so the shot reads). The loop is long enough that the outermost drone stays
// under the speed limit.
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
};

type Effect = "fireRing" | "flame" | "beat" | "strike" | "arrow";

type Rig = {
  n: number;
  p: Float32Array;
  nrm: Float32Array;
  /** Per drone: 0 model, 1 effect group (ring / flame / drum head / arrow), 2 bow string. */
  tag: Uint8Array;
  /** Per drone: effect parameter (flame height 0..1, position along arrow 0..1, drum head ±1). */
  e: Float32Array;
  h: number;
};

export type ScanOptions = {
  blurb: string;
  /** [base, highlight] hex colours. */
  colors: [string, string];
  motion?: "turn" | "sway" | "still";
  /** Sway half-angle, degrees. */
  sway?: number;
  effect?: Effect;
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

export function scanFormation(file: ScanFile, opts: ScanOptions): AnimatedFormation<Rig> {
  const motion = opts.motion ?? "turn";
  const swayAmp = ((opts.sway ?? 28) * Math.PI) / 180;
  // Outermost radius from the turn axis, for the speed budget (flame and
  // arrow sit inside the model's bounds or close to them).
  const reach = Math.hypot(file.width, file.depth) / 2 + (opts.effect === "flame" ? 8 : 0);
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
  const base = hex(opts.colors[0]);
  const highlight = hex(opts.colors[1]);
  let cache: { pos: Int16Array; nrm: Int8Array } | null = null;

  return {
    id: file.id,
    label: file.label,
    blurb: opts.blurb,
    credit: file.credit,
    theme: opts.theme ?? "culture",
    loop,
    minDrones: opts.minDrones ?? 500,
    build(n) {
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
        for (let i = 0; i < m; i++) if (p[i * 3] > p[tip * 3]) tip = i;
        const tx = p[tip * 3] - W * 0.04;
        const ty = p[tip * 3 + 1] + 1.5;
        const tz = p[tip * 3 + 2];
        const F = Math.max(6, Math.round(n * 0.1));
        const FH = H * 0.42;
        const FR = H * 0.09;
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
      return { n, p, nrm, tag, e, h: H };
    },
    pose(rig, t, pos, col) {
      const a = motion === "turn" ? (TAU * t) / loop : motion === "sway" ? swayAmp * Math.sin((TAU * t) / loop) : 0;
      const shot = opts.effect === "arrow" ? arrowShot(t) : null;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const L = HIGHLIGHT_LIGHT;
      // Heartbeat: two quick pulses, then rest (~1.2 s).
      const beatPhase = (t % 1.2) / 1.2;
      const beat = Math.exp(-((beatPhase - 0.08) ** 2) / 0.002) + 0.7 * Math.exp(-((beatPhase - 0.3) ** 2) / 0.002);
      for (let i = 0; i < rig.n; i++) {
        let x = rig.p[i * 3];
        const y = rig.p[i * 3 + 1];
        if (shot && rig.tag[i] === 1) x += shot.arrow;
        else if (shot && rig.tag[i] === 2) x += shot.string * (1 - rig.e[i]);
        const z = rig.p[i * 3 + 2];
        const rx = x * ca + z * sa;
        const rz = -x * sa + z * ca;
        const nx = rig.nrm[i * 3] * ca + rig.nrm[i * 3 + 2] * sa;
        const ny = rig.nrm[i * 3 + 1];
        const nz = -rig.nrm[i * 3] * sa + rig.nrm[i * 3 + 2] * ca;
        // Two-sided diffuse: a scan's normals can face either way.
        const diffuse = Math.abs(nx * L[0] + ny * L[1] + nz * L[2]);
        // Only the brightest-lit surfaces lean toward the highlight, so the
        // object keeps its own colour under bloom.
        let c: RGB = mixRGB(base, highlight, clamp((diffuse - 0.8) / 0.2, 0, 1) * 0.35);
        let k = 0.22 + 0.78 * diffuse;

        if (rig.tag[i]) {
          if (opts.effect === "fireRing") {
            const flick = 0.5 + 0.5 * Math.sin(t * 7 + i * 1.7) * Math.sin(t * 3.1 + i * 0.37);
            c = mixRGB(FIRE_A, FIRE_B, flick);
            k = 0.75 + 0.6 * flick;
          } else if (opts.effect === "flame") {
            const s = rig.e[i];
            const flick = 0.5 + 0.5 * Math.sin(t * 9 + i * 2.3) * Math.sin(t * 4.3 + i * 0.7);
            c = mixRGB(FLAME_CORE, FLAME_EDGE, clamp(s * 1.3 - 0.1 + flick * 0.25, 0, 1));
            k = (1.5 - s * 0.6) * (0.75 + 0.35 * flick);
          } else if (opts.effect === "strike") {
            // Heads flash in turn, like the two beads striking them.
            const phase = (t % 0.9) / 0.9;
            const hit = rig.e[i] > 0 ? Math.exp(-phase * 9) : Math.exp(-((phase + 0.5) % 1) * 9);
            c = mixRGB(c, hex("#fff6e0"), hit);
            k = k * (0.8 + 1.1 * hit);
          } else if (opts.effect === "arrow" && shot && rig.tag[i] === 1) {
            // The arrow burns bright, its head white-hot; dark on the way back.
            const head = rig.e[i] > 0.85 ? 1 : 0;
            c = mixRGB(c, hex("#fff2c0"), 0.3 + 0.7 * head);
            k = (1.1 + 0.6 * head) * shot.light;
          }
        }
        if (opts.effect === "beat") k *= 0.7 + 0.55 * beat;

        // Rotation is about the vertical axis only, so the flame stays
        // upright above the spout as the lamp sways.
        pos[i * 3] = rx;
        pos[i * 3 + 1] = SHOW_ALT - rig.h / 2 + y;
        pos[i * 3 + 2] = rz;
        col[i * 3] = c[0] * k;
        col[i * 3 + 1] = c[1] * k;
        col[i * 3 + 2] = c[2] * k;
      }
    },
  };
}
