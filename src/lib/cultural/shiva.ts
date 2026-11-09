// Mahadev — Shiva seated in meditation: jata with the crescent moon and the
// Ganga pouring from it, a serpent at the throat, the third eye, tiger-skin
// over crossed legs, and the trishul standing beside him with its damru.
//
// Motion (8 s loop, real drone speeds): the Ganga FLOWS IN LIGHT — the
// drones hold the stream's shape while bright ripples run down it, which
// is how a real show animates water. Hair locks drift, the third eye
// pulses, the halo glints round, the damru on the trishul swings gently,
// and the figure breathes. Every part is inflated into a rounded relief.

import { AnimatedFormation, Part, SHOW_ALT, TAU, V2, hex, inflate, mixRGB, onTube, sampleParts, type Sampled2D } from "./kit";

const circle = (cx: number, cy: number, r: number, k = 28): V2[] =>
  Array.from({ length: k + 1 }, (_, i) => [cx + Math.cos((i / k) * TAU) * r, cy + Math.sin((i / k) * TAU) * r] as V2);

const P = {
  halo: 0, locks: 1, jata: 2, ganga: 3, moon: 4, seat: 5, legs: 6, body: 7, feet: 8, head: 9, snake: 10, eye: 11, trishul: 12, damru: 13,
} as const;

const DAMRU_PIVOT: V2 = [36, 57.5];

const parts: Part[] = [
  { id: "halo", prims: [{ k: "tube", path: circle(0, 44, 21, 36), r0: 0.9, r1: 0.9 }] },
  {
    id: "locks",
    prims: [
      { k: "tube", path: [[-7, 46], [-12, 41], [-15, 33], [-19, 26], [-23, 22]], r0: 2.4, r1: 0.8 },
      { k: "tube", path: [[7, 46], [12, 41], [15, 33], [19, 26], [23, 22]], r0: 2.4, r1: 0.8 },
    ],
  },
  {
    id: "jata",
    outline: true,
    prims: [
      { k: "ellipse", cx: 0, cy: 51, rx: 9, ry: 6.6 },
      { k: "ellipse", cx: 0, cy: 56.5, rx: 6.2, ry: 4.6 },
      { k: "ellipse", cx: 0, cy: 61.5, rx: 3.6, ry: 3.2 },
    ],
  },
  { id: "ganga", prims: [{ k: "tube", path: [[1, 63], [4, 69], [10, 73.5], [18, 73.5], [24, 68.5], [26.5, 62]], r0: 1.7, r1: 1.1 }] },
  {
    id: "moon",
    prims: [{ k: "ellipse", cx: -8.5, cy: 56.5, rx: 5.6, ry: 5.6 }],
    cuts: [{ k: "ellipse", cx: -6.4, cy: 58, rx: 4.8, ry: 4.8 }],
  },
  { id: "seat", prims: [{ k: "ellipse", cx: 0, cy: -15.5, rx: 37, ry: 3.2 }] },
  {
    id: "legs",
    outline: true,
    prims: [
      { k: "ellipse", cx: 0, cy: -7, rx: 31, ry: 8.5 },
      { k: "poly", pts: [[-14, 4], [14, 4], [23, -3], [-23, -3]] },
    ],
  },
  {
    id: "body",
    prims: [
      { k: "poly", pts: [[-16, 25], [16, 25], [12.5, 2], [-12.5, 2]] },
      { k: "ellipse", cx: -14.5, cy: 22, rx: 5.2, ry: 5.2 },
      { k: "ellipse", cx: 14.5, cy: 22, rx: 5.2, ry: 5.2 },
      { k: "poly", pts: [[-3.6, 24], [3.6, 24], [3.2, 31], [-3.2, 31]] },
      { k: "tube", path: [[-18, 21], [-22, 12], [-21.5, 3], [-25, -4], [-27.5, -8]], r0: 3.6, r1: 2.6 },
      { k: "tube", path: [[18, 21], [22, 12], [21.5, 3], [25, -4], [27.5, -8]], r0: 3.6, r1: 2.6 },
      { k: "ellipse", cx: -28.5, cy: -9.5, rx: 3.3, ry: 3.0 },
      { k: "ellipse", cx: 28.5, cy: -9.5, rx: 3.3, ry: 3.0 },
    ],
  },
  {
    id: "feet",
    prims: [
      { k: "ellipse", cx: -10, cy: -2.5, rx: 5.2, ry: 2.4, rot: 0.25 },
      { k: "ellipse", cx: 10, cy: -2.5, rx: 5.2, ry: 2.4, rot: -0.25 },
    ],
  },
  { id: "head", outline: true, prims: [{ k: "ellipse", cx: 0, cy: 38.5, rx: 9, ry: 11 }] },
  {
    id: "snake",
    prims: [
      { k: "tube", path: [[-7, 29.5], [-3.5, 25.5], [3, 25.5], [7, 28.5], [8.8, 33], [9.6, 36]], r0: 1.5, r1: 1.2 },
      { k: "ellipse", cx: 10.4, cy: 38.4, rx: 2.5, ry: 3.1 },
    ],
  },
  { id: "eye", prims: [{ k: "ellipse", cx: 0, cy: 43, rx: 1.2, ry: 2.4 }] },
  {
    id: "trishul",
    prims: [
      { k: "tube", path: [[36, -15], [36, 62]], r0: 1.0, r1: 1.0 },
      { k: "poly", pts: [[34.7, 62], [37.3, 62], [36, 77.5]] },
      { k: "tube", path: [[36, 62], [31.2, 63.5], [29.6, 68], [30.2, 74.5]], r0: 1.2, r1: 0.45 },
      { k: "tube", path: [[36, 62], [40.8, 63.5], [42.4, 68], [41.8, 74.5]], r0: 1.2, r1: 0.45 },
      { k: "ellipse", cx: 36, cy: 62, rx: 6, ry: 1.3 },
    ],
  },
  { id: "damru", prims: [{ k: "poly", pts: [[32, 57], [40, 57], [37, 52.5], [40, 48], [32, 48], [35, 52.5]] }] },
];

const C = {
  skin: hex("#5f9bff"),
  skinHi: hex("#9cc4ff"),
  hair: hex("#7a63ff"),
  water: hex("#7ff3ff"),
  white: hex("#ffffff"),
  gold: hex("#ffd166"),
  tiger: hex("#ff9a2e"),
  stripe: hex("#5a2a10"),
  serpent: hex("#3ee07e"),
  fire: hex("#ff5a1f"),
  steel: hex("#e8f0ff"),
  amber: hex("#ffb347"),
  stone: hex("#6d7486"),
};

type Rig = { s: Sampled2D };

export const shiva: AnimatedFormation<Rig> = {
  id: "shiva",
  label: "Mahadev",
  blurb: "Shiva in meditation — the Ganga flows from his hair.",
  loop: 8,
  minDrones: 500,
  build: (n) => ({ s: sampleParts(parts, n, { seed: 23, edgeBias: 1.25 }) }),
  pose({ s }, t, pos, col) {
    const w = (TAU * t) / 8;
    const breathe = Math.sin(w) * 0.012;
    const ganga = s.tubes[P.ganga][0];
    const swing = Math.sin(w * 2) * 0.14;

    for (let i = 0; i < s.n; i++) {
      let x = s.x[i];
      let y = s.y[i];
      let z = 0;
      let bright = 1;
      const p = s.part[i];
      let c = C.skin;

      switch (p) {
        case P.ganga: {
          // Drones hold the stream; ripples of light run down it.
          [x, y] = onTube(ganga, s.s[i], s.u[i], (q) => [0, -Math.sin(q * Math.PI) * 0.8 * Math.sin(w * 2)]);
          const ripple = 0.5 + 0.5 * Math.sin(s.s[i] * 28 - w * 6);
          bright = 0.55 + 0.75 * ripple * ripple;
          c = mixRGB(C.water, C.white, ripple);
          z = 3;
          break;
        }
        case P.locks: {
          const side = x < 0 ? -1 : 1;
          const q = Math.min(1, Math.abs(x) / 23);
          x += side * Math.sin(w + q * 2) * 1.6 * q * q;
          y += Math.cos(w * 0.7 + q) * 0.8 * q;
          c = C.hair;
          z = -1;
          break;
        }
        case P.halo: {
          const a = Math.atan2(y - 44, x);
          bright = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.cos(a - w * 2), 6);
          c = C.gold;
          z = -5;
          break;
        }
        case P.jata:
          c = s.edge[i] ? mixRGB(C.hair, C.white, 0.35) : C.hair;
          y += (y - 2) * breathe;
          break;
        case P.moon:
          c = C.white;
          z = 2;
          y += (y - 2) * breathe;
          break;
        case P.eye:
          c = mixRGB(C.fire, C.white, 0.5 + 0.5 * Math.sin(w * 3));
          bright = 0.7 + 0.5 * (0.5 + 0.5 * Math.sin(w * 3));
          z = 5;
          y += (y - 2) * breathe;
          break;
        case P.head:
          c = s.edge[i] ? C.skinHi : C.skin;
          z = 4;
          y += (y - 2) * breathe;
          break;
        case P.body:
        case P.feet:
          c = s.edge[i] ? C.skinHi : C.skin;
          z = p === P.feet ? 4 : 3 * Math.cos((x / 30) * Math.PI * 0.5);
          y += (y - 2) * breathe;
          break;
        case P.snake:
          c = s.edge[i] ? mixRGB(C.serpent, C.white, 0.3) : C.serpent;
          z = 5;
          y += (y - 2) * breathe;
          break;
        case P.legs: {
          // Tiger skin: soft stripes across the lap.
          const stripe = Math.sin(x * 0.55 + Math.sin(y * 0.5) * 1.6) > 0.55;
          c = s.edge[i] ? C.gold : stripe ? C.stripe : C.tiger;
          if (stripe && !s.edge[i]) bright = 0.9;
          z = 4;
          break;
        }
        case P.seat:
          c = C.stone;
          bright = 0.8;
          break;
        case P.trishul:
          c = y > 61 ? mixRGB(C.steel, C.gold, s.edge[i] ? 0.4 : 0) : C.steel;
          z = 6;
          break;
        case P.damru: {
          const dx = x - DAMRU_PIVOT[0];
          const dy = y - DAMRU_PIVOT[1];
          x = DAMRU_PIVOT[0] + dx * Math.cos(swing) - dy * Math.sin(swing);
          y = DAMRU_PIVOT[1] + dx * Math.sin(swing) + dy * Math.cos(swing);
          c = Math.abs(dy + 4.5) < 0.9 ? C.fire : C.amber;
          z = 7;
          break;
        }
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = SHOW_ALT - 12 + y;
      // Rounded relief: every part bulges toward the audience from its own
      // edge, so the figure has volume when the camera moves round it.
      pos[i * 3 + 2] = z + inflate(s.d[i], p === P.trishul ? 0.6 : 2.1);
      const k = bright * (s.edge[i] ? 1.12 : 0.95);
      col[i * 3] = c[0] * k;
      col[i * 3 + 1] = c[1] * k;
      col[i * 3 + 2] = c[2] * k;
    }
  },
};
