// Formations that hold up at SMALL fleets (100–200 drones): the tricolour,
// a diya, a blooming lotus, a heartbeat and Om. Bold silhouettes, little
// interior detail, and motion kept slow (≲ 8 m/s) or done with LIGHT —
// drones holding still while a glow runs along them — which is exactly how
// a 100-drone show would fly them.

import { AnimatedFormation, Part, SHOW_ALT, TAU, clamp, hex, mixRGB, sampleParts, smooth, type RGB, type Sampled2D } from "./kit";

const GOLD = Math.PI * (3 - Math.sqrt(5));

function write(pos: Float32Array, col: Float32Array, i: number, x: number, y: number, z: number, c: RGB, k = 1) {
  pos[i * 3] = x;
  pos[i * 3 + 1] = y;
  pos[i * 3 + 2] = z;
  col[i * 3] = c[0] * k;
  col[i * 3 + 1] = c[1] * k;
  col[i * 3 + 2] = c[2] * k;
}

// ------------------------------------------------------------ Tiranga

type FlagRig = { n: number; u: Float32Array; v: Float32Array; kind: Uint8Array };

const FW = 78; // flag width, metres (3:2)
const FH = 52;

/** The national flag, waving, with the Ashoka Chakra turning at its centre. */
export const tiranga: AnimatedFormation<FlagRig> = {
  id: "tiranga",
  label: "Tiranga",
  blurb: "The tricolour waves; the chakra turns at its heart.",
  loop: 8,
  minDrones: 100,
  build(n) {
    // ~14% chakra (rim + 24 spokes need at least ~14 drones), rest the field.
    const chakra = Math.max(14, Math.round(n * 0.14));
    const field = n - chakra;
    const cols = Math.max(6, Math.round(Math.sqrt(field * (FW / FH))));
    const u: number[] = [];
    const v: number[] = [];
    const kind: number[] = [];
    // Field on a grid, skipping the chakra disc so it reads cleanly.
    const R = FH / 6.2;
    let rows = Math.ceil(field / cols);
    for (let tries = 0; tries < 40; tries++) {
      let count = 0;
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = ((c + 0.5) / cols - 0.5) * FW;
        const y = ((r + 0.5) / rows - 0.5) * FH;
        if (Math.hypot(x, y) > R * 1.15) count++;
      }
      if (count >= field) break;
      rows++;
    }
    for (let r = 0; r < rows && u.length < field; r++) {
      for (let c = 0; c < cols && u.length < field; c++) {
        const x = ((c + 0.5) / cols - 0.5) * FW;
        const y = ((r + 0.5) / rows - 0.5) * FH;
        if (Math.hypot(x, y) <= R * 1.15) continue;
        u.push(x);
        v.push(y);
        kind.push(0);
      }
    }
    while (u.length < field) {
      u.push(FW / 2);
      v.push(0);
      kind.push(0);
    }
    // Chakra: half on the rim, half on 24 spokes (polar u=angle, v=radius).
    const rim = Math.ceil(chakra / 2);
    for (let k = 0; k < chakra; k++) {
      if (k < rim) {
        u.push((k / rim) * TAU);
        v.push(R);
      } else {
        const j = k - rim;
        const spokes = chakra - rim;
        u.push(((j % 24) / 24) * TAU + (Math.floor(j / 24) * TAU) / 48);
        v.push(R * (0.2 + 0.75 * ((Math.floor(j / 24) + 0.5) / Math.max(1, Math.ceil(spokes / 24)))));
      }
      kind.push(1);
    }
    return { n, u: Float32Array.from(u), v: Float32Array.from(v), kind: Uint8Array.from(kind) };
  },
  pose(rig, t, pos, col) {
    const saffron = hex("#ff9933");
    const white = hex("#ffffff");
    const green = hex("#1fc23f");
    const blue = hex("#3d6dff");
    const w = (TAU * t) / 8;
    const turn = w * 0.5;
    const wave = (x: number, y: number) => {
      // Travelling wave, zero at the hoist (left edge), growing to the fly.
      const k = (x + FW / 2) / FW;
      return {
        z: Math.sin(x * 0.11 - w * 2 + y * 0.03) * 4.2 * k,
        dy: Math.sin(x * 0.09 - w * 2) * 1.6 * k,
      };
    };
    for (let i = 0; i < rig.n; i++) {
      let x: number;
      let y: number;
      let c: RGB;
      if (rig.kind[i] === 0) {
        x = rig.u[i];
        y = rig.v[i];
        c = y > FH / 6 ? saffron : y < -FH / 6 ? green : white;
      } else {
        const a = rig.u[i] + turn;
        x = Math.cos(a) * rig.v[i];
        y = Math.sin(a) * rig.v[i];
        c = blue;
      }
      const { z, dy } = wave(x, y);
      // Shading on the folds: a crest catches light, a trough dims.
      const shade = 0.82 + 0.18 * Math.sin(x * 0.11 - w * 2 + 1.2);
      write(pos, col, i, x, SHOW_ALT + y + dy, z, c, shade * (rig.kind[i] ? 1.3 : 1));
    }
  },
};

// ------------------------------------------------------------ Diya

const DIYA_PARTS: Part[] = [
  { id: "base", outline: true, prims: [{ k: "poly", pts: [[-12, -26], [12, -26], [8, -19], [-8, -19]] }] },
  {
    id: "bowl",
    outline: true,
    prims: [
      { k: "poly", pts: [[-34, -4], [34, -4], [26, -14], [14, -20], [-14, -20], [-26, -14]] },
      // The spout, where the wick sits.
      { k: "poly", pts: [[22, -4], [40, 2], [34, -6]] },
    ],
  },
  { id: "oil", prims: [{ k: "ellipse", cx: 0, cy: -4, rx: 31, ry: 3.4 }] },
  { id: "flame", outline: true, prims: [{ k: "tube", path: [[33, 2], [32, 10], [34, 19], [37, 26]], r0: 6, r1: 0.6 }] },
];

/** A diya, its flame flickering and leaning. */
export const diya: AnimatedFormation<{ s: Sampled2D }> = {
  id: "diya",
  label: "Diya",
  blurb: "One lamp, one flame — the oldest light show there is.",
  loop: 4,
  minDrones: 100,
  build: (n) => ({ s: sampleParts(DIYA_PARTS, n, { seed: 3, edgeBias: 1.2, res: 260 }) }),
  pose({ s }, t, pos, col) {
    const clay = hex("#ff7a2a");
    const rim = hex("#ffd36b");
    const oil = hex("#ffb84a");
    const core = hex("#fffbe0");
    const mid = hex("#ffc23a");
    const tip = hex("#ff4d12");
    const flick = Math.sin(t * 7.3) * 0.5 + Math.sin(t * 12.1 + 1) * 0.3;
    const lean = Math.sin(t * 1.6) * 0.18 + flick * 0.04;
    const stretch = 1 + flick * 0.08;
    for (let i = 0; i < s.n; i++) {
      let x = s.x[i];
      let y = s.y[i];
      let c: RGB = clay;
      let k = s.edge[i] ? 1.1 : 0.9;
      const p = s.part[i];
      if (p === 3) {
        // Flame: stretch up from the wick and lean, more at the tip.
        const h = Math.max(0, y - 2);
        y = 2 + h * stretch;
        x += Math.sin(lean) * h * 0.9;
        const q = clamp(h / 24, 0, 1);
        c = q < 0.35 ? mixRGB(core, mid, q / 0.35) : mixRGB(mid, tip, (q - 0.35) / 0.65);
        k = 1.1 + 0.25 * Math.sin(t * 9 + y);
      } else if (p === 2) c = oil;
      else if (s.edge[i]) c = rim;
      write(pos, col, i, x, SHOW_ALT + y, p === 3 ? 4 : 0, c, k);
    }
  },
};

// ------------------------------------------------------------ Lotus

type LotusRig = { n: number; ring: Uint8Array; petal: Uint8Array; a: Float32Array; b: Float32Array };

const RINGS = [
  { petals: 8, len: 34, width: 10, share: 0.34, off: 0 },
  { petals: 8, len: 46, width: 13, share: 0.4, off: Math.PI / 8 },
];

/** A lotus that opens from a bud, holds in full bloom, and closes again. */
export const lotusBloom: AnimatedFormation<LotusRig> = {
  id: "lotus",
  label: "Kamal",
  blurb: "A lotus opens from the bud, petal by petal.",
  loop: 10,
  minDrones: 100,
  build(n) {
    const ring: number[] = [];
    const petal: number[] = [];
    const a: number[] = [];
    const b: number[] = [];
    const centre = n - RINGS.reduce((acc, r) => acc + Math.round(n * r.share), 0);
    RINGS.forEach((r, ri) => {
      const count = Math.round(n * r.share);
      const per = Math.max(3, Math.floor(count / r.petals));
      for (let k = 0; k < count; k++) {
        const p = k % r.petals;
        const j = Math.floor(k / r.petals);
        ring.push(ri);
        petal.push(p);
        // Petals are pure outlines: at 100–200 drones a filled petal is
        // fuzz, a drawn edge reads instantly. Alternate sides, evenly
        // spaced from base to tip.
        const half = Math.ceil(per / 2);
        // Start a little out from the centre: every petal meeting at one
        // point would stack drones on top of each other.
        a.push(0.14 + 0.86 * Math.min(1, (Math.floor(j / 2) + 0.5) / half));
        b.push(j % 2 ? 1 : -1);
      }
    });
    for (let k = 0; k < centre; k++) {
      ring.push(9);
      petal.push(0);
      a.push(Math.sqrt((k + 0.5) / centre));
      b.push(k * GOLD);
    }
    return { n, ring: Uint8Array.from(ring), petal: Uint8Array.from(petal), a: Float32Array.from(a), b: Float32Array.from(b) };
  },
  pose(rig, t, pos, col) {
    // The flower's axis leans toward the audience so the open bloom faces
    // them; seen level, an open lotus is just a flat line.
    const TILT = 0.95;
    const ct = Math.cos(TILT);
    const st = Math.sin(TILT);
    const put = (i: number, x: number, up: number, z: number, c: RGB, k: number) =>
      write(pos, col, i, x, SHOW_ALT - 6 + up * ct - z * st, up * st + z * ct, c, k);
    const pink = hex("#ff5fa2");
    const blush = hex("#ffc2dc");
    const gold = hex("#ffd34d");
    // 0 bud .. 1 open: open over 3 s, hold, close over 3 s.
    const phase = t / 10;
    const open = smooth(phase / 0.3) * (1 - smooth((phase - 0.75) / 0.25));
    const spin = (TAU * t) / 40;
    for (let i = 0; i < rig.n; i++) {
      if (rig.ring[i] === 9) {
        const r = rig.a[i] * 8;
        const ang = rig.b[i] + spin;
        put(i, Math.cos(ang) * r, 3 + (1 - rig.a[i]) * 3, Math.sin(ang) * r, gold, 1.15);
        continue;
      }
      const R = RINGS[rig.ring[i]];
      const u = rig.a[i];
      const side = rig.b[i];
      const ang = R.off + (rig.petal[i] / R.petals) * TAU + spin;
      // Petal: rises from the centre; tilt from vertical (bud) to ~70°
      // (open), outer ring opening further than the inner.
      const tilt = (0.12 + open * (rig.ring[i] ? 1.05 : 0.72)) * (0.85 + 0.15 * u);
      const width = R.width * Math.sin(Math.PI * Math.pow(u, 0.75)) * (0.5 + 0.5 * open);
      const radial = Math.sin(tilt) * R.len * u;
      const up = Math.cos(tilt) * R.len * u;
      const lat = side * width;
      const x = Math.cos(ang) * radial - Math.sin(ang) * lat;
      const z = Math.sin(ang) * radial + Math.cos(ang) * lat;
      const c = mixRGB(pink, blush, u * u);
      put(i, x, up, z, c, Math.abs(side) > 0.95 ? 1.15 : 0.9);
    }
  },
};

// ------------------------------------------------------------ Heart

/** A heart that beats — lub-dub — for weddings and anniversaries. */
export const heartbeat: AnimatedFormation<{ n: number; x: Float32Array; y: Float32Array; edge: Uint8Array }> = {
  id: "heart",
  label: "Dil",
  blurb: "A heart that beats — for weddings and anniversaries.",
  loop: 2.4,
  minDrones: 100,
  build(n) {
    const x = new Float32Array(n);
    const y = new Float32Array(n);
    const edge = new Uint8Array(n);
    const outline = Math.round(n * 0.55);
    for (let i = 0; i < outline; i++) {
      const t = (i / outline) * TAU;
      x[i] = 16 * Math.pow(Math.sin(t), 3) * 2.4;
      y[i] = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 2.4;
      edge[i] = 1;
    }
    // Fill: shrunken copies of the outline, sunflower-spaced.
    const fill = n - outline;
    for (let k = 0; k < fill; k++) {
      const s = 0.18 + 0.68 * Math.sqrt((k + 0.5) / fill);
      const t = k * GOLD * 3.1;
      x[outline + k] = 16 * Math.pow(Math.sin(t), 3) * 2.4 * s;
      y[outline + k] = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 2.4 * s;
    }
    return { n, x, y, edge };
  },
  pose(rig, t, pos, col) {
    const red = hex("#ff2a4d");
    const rose = hex("#ff8fb0");
    // Lub-dub: two quick beats, then rest.
    const p = (t % 2.4) / 2.4;
    const beat = Math.exp(-Math.pow((p - 0.1) / 0.05, 2)) + 0.6 * Math.exp(-Math.pow((p - 0.28) / 0.05, 2));
    const s = 1 + beat * 0.07;
    for (let i = 0; i < rig.n; i++) {
      write(pos, col, i, rig.x[i] * s, SHOW_ALT + 6 + rig.y[i] * s, 0, rig.edge[i] ? red : rose, (rig.edge[i] ? 1.05 : 0.8) + beat * 0.35);
    }
  },
};

// ------------------------------------------------------------ Om

const OM_PARTS: Part[] = [
  {
    id: "upper",
    prims: [{ k: "tube", path: [[-27, 20], [-19, 29], [-6, 30], [2, 22], [-2, 12], [-14, 7]], r0: 3.2, r1: 3.6 }],
  },
  {
    id: "lower",
    prims: [{ k: "tube", path: [[-14, 7], [-1, 4], [7, -6], [3, -20], [-12, -26], [-27, -19]], r0: 3.6, r1: 3.0 }],
  },
  {
    id: "tail",
    prims: [{ k: "tube", path: [[-3, 6], [12, 10], [25, 4], [27, -10], [19, -22], [11, -19]], r0: 3.4, r1: 2.4 }],
  },
  {
    id: "moon",
    prims: [{ k: "ellipse", cx: 16, cy: 30, rx: 10, ry: 6 }],
    cuts: [{ k: "ellipse", cx: 16, cy: 33.5, rx: 10, ry: 6 }],
  },
  { id: "bindu", prims: [{ k: "ellipse", cx: 16, cy: 40, rx: 3.2, ry: 3.2 }] },
];

/** Om, with light running along its strokes. The drones hold still. */
export const om: AnimatedFormation<{ s: Sampled2D }> = {
  id: "om",
  label: "Om",
  blurb: "Om, drawn in light that runs along its strokes.",
  loop: 6,
  minDrones: 150,
  build: (n) => ({ s: sampleParts(OM_PARTS, n, { seed: 5, edgeBias: 1.1, res: 300 }) }),
  pose({ s }, t, pos, col) {
    const saffron = hex("#ff9a1f");
    const gold = hex("#ffd75a");
    const white = hex("#fff8e0");
    const sway = Math.sin((TAU * t) / 6) * 0.12;
    for (let i = 0; i < s.n; i++) {
      const p = s.part[i];
      // Stroke order: upper -> lower -> tail; a bright pulse travels the pen
      // path once per loop.
      const order = p < 3 && s.tube[i] !== 255 ? (p + s.s[i]) / 3 : p === 3 ? 0.95 : 1;
      const head = (t / 6) * 1.25;
      const d = head - order;
      const glow = d >= 0 && d < 0.25 ? 1 - d / 0.25 : 0;
      const c = p === 4 ? white : mixRGB(saffron, gold, s.edge[i] ? 0.6 : 0.2);
      const k = 0.75 + glow * 0.9 + (p === 4 ? 0.4 + 0.3 * Math.sin(t * 3) : 0);
      const x = s.x[i];
      write(pos, col, i, x * Math.cos(sway), SHOW_ALT + s.y[i], x * Math.sin(sway), mixRGB(c, white, glow * 0.5), k);
    }
  },
};
