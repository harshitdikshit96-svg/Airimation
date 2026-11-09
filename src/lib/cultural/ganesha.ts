// Ganesha — the head, front-facing: tiered mukut, fanned ears, trunk
// curling to his left, one full tusk and one broken, tilak and eyes.
//
// Motion (6 s loop, every speed kept under ~8 m/s so it could fly):
//   ears fan slowly, the trunk sways from its root to its curled tip,
//   the crown's jewels glint, the whole head breathes very slightly.

import { AnimatedFormation, Part, SHOW_ALT, TAU, hex, mixRGB, onTube, sampleParts, type Sampled2D } from "./kit";

const P = {
  earL: 0, earR: 1, earInL: 2, earInR: 3, head: 4, crown: 5, jewel: 6, tuskL: 7, tuskR: 8, trunk: 9, eyes: 10, tilak: 11,
} as const;

const parts: Part[] = [
  // Ears behind everything, tilted out at the top.
  { id: "earL", outline: true, prims: [{ k: "ellipse", cx: -31, cy: -2, rx: 17, ry: 24, rot: 0.18 }] },
  { id: "earR", outline: true, prims: [{ k: "ellipse", cx: 31, cy: -2, rx: 17, ry: 24, rot: -0.18 }] },
  // Inner ear: the paler, pinker fold that gives the ear its depth.
  { id: "earInL", outline: true, prims: [{ k: "ellipse", cx: -29, cy: -4, rx: 10, ry: 16, rot: 0.22 }] },
  { id: "earInR", outline: true, prims: [{ k: "ellipse", cx: 29, cy: -4, rx: 10, ry: 16, rot: -0.22 }] },
  { id: "head", prims: [{ k: "ellipse", cx: 0, cy: 2, rx: 19, ry: 22 }] },
  {
    id: "crown",
    outline: true,
    prims: [
      { k: "poly", pts: [[-18, 17], [18, 17], [17.5, 25], [-17.5, 25]] },
      { k: "poly", pts: [[-15, 25], [15, 25], [10.5, 39], [-10.5, 39]] },
      { k: "ellipse", cx: 0, cy: 41, rx: 9, ry: 7 },
      { k: "poly", pts: [[-4.2, 45], [4.2, 45], [0, 57]] },
      { k: "ellipse", cx: 0, cy: 58.5, rx: 2.2, ry: 2.6 },
      { k: "ellipse", cx: -18, cy: 29, rx: 3.6, ry: 7, rot: 0.35 },
      { k: "ellipse", cx: 18, cy: 29, rx: 3.6, ry: 7, rot: -0.35 },
    ],
  },
  // Jewels on the crown band — painted over it, glint independently.
  {
    id: "jewel",
    prims: [
      { k: "ellipse", cx: 0, cy: 21, rx: 2.6, ry: 2.6 },
      { k: "ellipse", cx: -8, cy: 21, rx: 1.8, ry: 1.8 },
      { k: "ellipse", cx: 8, cy: 21, rx: 1.8, ry: 1.8 },
      { k: "ellipse", cx: 0, cy: 41, rx: 2.4, ry: 2.4 },
    ],
  },
  { id: "tuskL", prims: [{ k: "tube", path: [[-8.5, -12], [-13, -19], [-15, -26], [-14, -31]], r0: 2.4, r1: 0.7 }] },
  { id: "tuskR", prims: [{ k: "tube", path: [[8.5, -12], [11.5, -16.5]], r0: 2.2, r1: 1.7 }] },
  // The trunk rises from between the eyes: no seam line at its root, the
  // face simply becomes trunk.
  {
    id: "trunk",
    prims: [{ k: "tube", path: [[0, 9], [0, -6], [-1.5, -20], [-2, -31], [1.5, -40], [8, -46], [15, -44], [16.5, -38]], r0: 6.2, r1: 2.3 }],
  },
  {
    id: "eyes",
    prims: [
      { k: "ellipse", cx: -8.5, cy: 6.5, rx: 4.4, ry: 2.7, rot: -0.15 },
      { k: "ellipse", cx: 8.5, cy: 6.5, rx: 4.4, ry: 2.7, rot: 0.15 },
    ],
  },
  { id: "tilak", prims: [{ k: "ellipse", cx: 0, cy: 13, rx: 1.4, ry: 4.2 }] },
];

const C = {
  skin: hex("#ff8a1e"),
  skinDeep: hex("#ff5a24"),
  ear: hex("#ff6f3a"),
  gold: hex("#ffcf45"),
  cream: hex("#fff2cf"),
  ivory: hex("#fff6e4"),
  white: hex("#ffffff"),
  red: hex("#ff1f2d"),
  pink: hex("#ff8f86"),
};

type Rig = { s: Sampled2D };

export const ganesha: AnimatedFormation<Rig> = {
  id: "ganesha",
  label: "Ganesha",
  blurb: "Vighnaharta — the crown, fanned ears and swaying trunk.",
  loop: 6,
  minDrones: 300,
  build: (n) => ({ s: sampleParts(parts, n, { seed: 11 }) }),
  pose({ s }, t, pos, col) {
    const w = (TAU * t) / 6;
    const fan = Math.sin(w) * 0.09; // ears: +-9% width, slow
    const sway = Math.sin(w + 0.6); // trunk
    const breathe = 1 + Math.sin(w * 0.5) * 0.008;
    const trunkLine = s.tubes[P.trunk][0];

    for (let i = 0; i < s.n; i++) {
      let x = s.x[i];
      let y = s.y[i];
      let z = 0;
      const p = s.part[i];

      if (p === P.earL || p === P.earR || p === P.earInL || p === P.earInR) {
        // Fan about the ear's inner edge, the way an elephant's ear swings.
        const pivot = p === P.earL || p === P.earInL ? -16 : 16;
        x = pivot + (x - pivot) * (1 + fan);
        z = -3 - Math.abs(x - pivot) * 0.06 * (1 - fan * 3);
      } else if (p === P.trunk && s.tube[i] !== 255) {
        // Bend grows toward the tip: the root is anchored in the face.
        [x, y] = onTube(trunkLine, s.s[i], s.u[i], (q) => [sway * 4.2 * q * q, Math.abs(sway) * 1.2 * q * q]);
        z = 6 + s.s[i] * 5;
      } else if (p === P.tuskL || p === P.tuskR) {
        z = 7;
      } else if (p === P.head || p === P.eyes || p === P.tilak) {
        // A shallow dome, so the face has form when the camera drifts.
        const r2 = (x * x) / (19 * 19) + ((y - 2) * (y - 2)) / (22 * 22);
        z = 7 * Math.sqrt(Math.max(0, 1 - r2));
      } else {
        z = 1.5;
      }

      pos[i * 3] = x * breathe;
      pos[i * 3 + 1] = SHOW_ALT + y * breathe;
      pos[i * 3 + 2] = z;

      // Colour.
      let c = C.skin;
      if (p === P.earL || p === P.earR) c = mixRGB(C.ear, C.skinDeep, s.edge[i] ? 0 : 0.35);
      else if (p === P.earInL || p === P.earInR) c = s.edge[i] ? C.gold : C.pink;
      else if (p === P.head) c = mixRGB(C.skin, C.skinDeep, Math.max(0, -y / 30));
      else if (p === P.trunk) c = mixRGB(C.skin, C.skinDeep, s.s[i] * 0.6);
      else if (p === P.crown) c = s.edge[i] ? C.cream : C.gold;
      else if (p === P.jewel) {
        const glint = 0.5 + 0.5 * Math.sin(w * 3 + x * 0.7 + y * 0.3);
        c = mixRGB(C.red, C.white, glint * glint);
      } else if (p === P.tuskL || p === P.tuskR) c = C.ivory;
      else if (p === P.eyes) c = C.white;
      else if (p === P.tilak) c = C.red;
      // Edge drones a touch brighter: the line work carries the drawing.
      const k = p === P.eyes ? 1.5 : s.edge[i] ? 1.15 : 0.92;
      col[i * 3] = c[0] * k;
      col[i * 3 + 1] = c[1] * k;
      col[i * 3 + 2] = c[2] * k;
    }
  },
};
