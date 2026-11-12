// The national flag, drawn to its official specification (Flag Code of
// India: 3:2, three equal bands, a navy Ashoka Chakra of 24 spokes whose
// diameter is about the white band's height). The cloth waves; the chakra
// turns.
//
// The chakra is built so its 24 spokes read as spokes, not rings. Near the
// hub 24 spokes crowd together, so drones on spokes only fill the outer
// part of the disc (40–95% of the radius), packed closer along each spoke
// than the spokes are apart: the eye joins them into 24 lines. A small hub
// ring closes the middle. More drones = more per spoke (2 to 7). The
// smallest chakra (rim + 2 per spoke + hub) is ~80 drones, so the flag
// needs a fleet of 200.

import { AnimatedFormation, SHOW_ALT, TAU, hex, type RGB } from "./kit";

type FlagRig = {
  n: number;
  /** Field drones: x, y. Chakra drones: angle, radius. */
  u: Float32Array;
  v: Float32Array;
  /** 0 field, 1 chakra. */
  kind: Uint8Array;
};

const FW = 78; // flag width, metres (3:2)
const FH = 52;
/** Chakra radius: its diameter matches the white band (FH / 3). */
const R = FH / 6;
const SPOKES = 24;
const LOOP = 16;

const SAFFRON = hex("#ff9933");
const WHITE = hex("#ffffff");
const GREEN = hex("#1fc23f");
const NAVY = hex("#3d6dff");

export const tiranga: AnimatedFormation<FlagRig> = {
  id: "tiranga",
  label: "Tiranga",
  blurb: "The tricolour waves; the Ashoka Chakra's 24 spokes turn at its heart.",
  credit: "Drawn to the Flag Code of India specification",
  theme: "culture",
  loop: LOOP,
  minDrones: 200,
  build(n) {
    const spacing = Math.sqrt((FW * FH) / n);
    const perSpoke = Math.min(7, Math.max(2, Math.round(n / 130)));
    const rim = Math.max(SPOKES, Math.round((TAU * R) / Math.min(spacing, 2)));
    const hub = 8;
    const chakra = rim + SPOKES * perSpoke + hub;
    const field = Math.max(0, n - chakra);

    const u: number[] = [];
    const v: number[] = [];
    const kind: number[] = [];

    // Field: a grid at the flag's aspect, skipping the chakra disc.
    const cols = Math.max(6, Math.round(Math.sqrt(field * (FW / FH))));
    let rows = Math.ceil(field / cols);
    const fits = (r: number) => {
      let count = 0;
      for (let j = 0; j < r; j++)
        for (let i = 0; i < cols; i++) {
          const x = ((i + 0.5) / cols - 0.5) * FW;
          const y = ((j + 0.5) / r - 0.5) * FH;
          if (Math.hypot(x, y) > R * 1.12) count++;
        }
      return count;
    };
    while (fits(rows) < field) rows++;
    for (let j = 0; j < rows && u.length < field; j++) {
      for (let i = 0; i < cols && u.length < field; i++) {
        const x = ((i + 0.5) / cols - 0.5) * FW;
        const y = ((j + 0.5) / rows - 0.5) * FH;
        if (Math.hypot(x, y) <= R * 1.12) continue;
        u.push(x);
        v.push(y);
        kind.push(0);
      }
    }

    // Chakra, in polar form (u = angle, v = radius).
    for (let k = 0; k < rim; k++) {
      u.push((k / rim) * TAU);
      v.push(R);
      kind.push(1);
    }
    for (let s = 0; s < SPOKES; s++) {
      for (let k = 0; k < perSpoke; k++) {
        u.push((s / SPOKES) * TAU);
        // Outer part of the disc only, where the spokes are apart.
        v.push(R * (perSpoke === 1 ? 0.7 : 0.4 + (0.52 * k) / (perSpoke - 1)));
        kind.push(1);
      }
    }
    for (let k = 0; k < hub; k++) {
      u.push((k / hub) * TAU);
      v.push(R * 0.16);
      kind.push(1);
    }

    // Too few drones for the full spec: keep the first n (field first).
    return { n, u: Float32Array.from(u.slice(0, n)), v: Float32Array.from(v.slice(0, n)), kind: Uint8Array.from(kind.slice(0, n)) };
  },
  pose(rig, t, pos, col) {
    // One chakra turn and two waves per loop: the rim moves ~3.4 m/s.
    const w = (TAU * t) / LOOP;
    for (let i = 0; i < rig.n; i++) {
      let x: number;
      let y: number;
      let c: RGB;
      if (rig.kind[i] === 0) {
        x = rig.u[i];
        y = rig.v[i];
        c = y > FH / 6 ? SAFFRON : y < -FH / 6 ? GREEN : WHITE;
      } else {
        const a = rig.u[i] + w;
        x = Math.cos(a) * rig.v[i];
        y = Math.sin(a) * rig.v[i];
        c = NAVY;
      }
      // Travelling wave, zero at the hoist (left edge), growing to the fly.
      const k = (x + FW / 2) / FW;
      const z = Math.sin(x * 0.11 - w * 2 + y * 0.03) * 4.2 * k;
      const dy = Math.sin(x * 0.09 - w * 2) * 1.6 * k;
      // Folds catch the light: a crest brightens, a trough dims.
      const shade = (0.82 + 0.18 * Math.sin(x * 0.11 - w * 2 + 1.2)) * (rig.kind[i] ? 1.35 : 1);
      pos[i * 3] = x;
      pos[i * 3 + 1] = SHOW_ALT + y + dy;
      pos[i * 3 + 2] = z;
      col[i * 3] = c[0] * shade;
      col[i * 3 + 1] = c[1] * shade;
      col[i * 3 + 2] = c[2] * shade;
    }
  },
};
