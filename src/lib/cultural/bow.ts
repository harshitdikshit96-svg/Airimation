// Dhanush-baan — a recurve bow drawn back, a fire-arrow nocked, released.
//
// Built procedurally rather than sampled, because the bow itself bends:
// every drone stores where it sits on its piece (along the limb, across
// it), and the piece is rebuilt each frame from the draw amount.
//
// 6 s loop:
//   0.0–2.2  the string is drawn back; the limbs flex; flame catches
//   2.2–3.0  hold at full draw, a breath of tremble
//   3.0      release — the arrow flies right and out of frame trailing
//            fire; the string snaps forward and rings down
//   4.0–5.2  arrow drones fly back to the nock with LEDs OFF (how a real
//            show repositions drones unseen)
//   5.2–6.0  they light again as the next arrow

import { AnimatedFormation, SHOW_ALT, clamp, hex, lerp, makeRand, mixRGB, smooth, type RGB } from "./kit";

const L = 40; // half-height of the bow, metres
const GRIP_X = -6;
const REST = 9; // string-to-grip depth at rest
const FULL = 40; // at full draw
const ARROW = 62; // shaft length
const HEAD = 9;

type Piece = "bow" | "grip" | "string" | "shaft" | "head" | "fletch" | "flame";

type Rig = {
  n: number;
  piece: Piece[];
  /** Position along the piece, 0..1 (or -1..1 for the bow). */
  a: Float32Array;
  /** Position across the piece, -1..1. */
  b: Float32Array;
  /** Per-drone random, for flame flicker. */
  r: Float32Array;
};

const C = {
  gold: hex("#ffc640"),
  cream: hex("#fff1c9"),
  grip: hex("#ff3b2f"),
  string: hex("#ffffff"),
  shaft: hex("#ffe7b0"),
  steel: hex("#f2f6ff"),
  fletch: hex("#ff4a2a"),
  saffron: hex("#ff9a1f"),
  fireCore: hex("#fff3a0"),
  fireMid: hex("#ff9a1f"),
  fireOut: hex("#ff2a10"),
};

function build(n: number): Rig {
  const shares: [Piece, number][] = [
    ["bow", 0.33], ["grip", 0.04], ["string", 0.11], ["shaft", 0.15], ["head", 0.08], ["fletch", 0.08], ["flame", 0.21],
  ];
  const rand = makeRand(5);
  const piece: Piece[] = [];
  const a: number[] = [];
  const b: number[] = [];
  let used = 0;
  shares.forEach(([name, share], idx) => {
    const count = idx === shares.length - 1 ? n - used : Math.round(n * share);
    used += count;
    // Rows across the piece: thick pieces get 3, thin ones 1.
    const rows = name === "bow" ? 3 : name === "shaft" || name === "grip" ? 2 : 1;
    const per = Math.ceil(count / rows);
    for (let k = 0; k < count; k++) {
      const row = k % rows;
      const j = Math.floor(k / rows);
      piece.push(name);
      if (name === "head" || name === "fletch") {
        // Filled triangles: stratified (along, across).
        a.push((j + rand()) / per);
        b.push(rand() * 2 - 1);
      } else if (name === "flame") {
        a.push(rand());
        b.push(rand() * 2 - 1);
      } else {
        a.push(name === "bow" ? -1 + (2 * (j + 0.5)) / per : (j + 0.5) / per);
        b.push(rows === 1 ? 0 : -1 + (2 * row) / (rows - 1));
      }
    }
  });
  const r = new Float32Array(n);
  for (let i = 0; i < n; i++) r[i] = rand();
  return { n, piece, a: Float32Array.from(a), b: Float32Array.from(b), r };
}

/** The bow limb at v (-1 bottom .. 1 top) for draw amount d. */
function limb(v: number, d: number): [number, number] {
  const bend = lerp(7, 13, d);
  const av = Math.abs(v);
  // Recurve: the tips flick forward, toward the target.
  const flick = Math.max(0, av - 0.78) ** 2 * 26;
  return [GRIP_X - bend * v * v + flick, L * v * (1 - 0.07 * d)];
}

export const bowArrow: AnimatedFormation<Rig> = {
  id: "bow",
  label: "Dhanush-baan",
  blurb: "A fire-arrow drawn, held, and loosed across the sky.",
  loop: 6,
  minDrones: 200,
  build,
  pose(rig, t, pos, col) {
    // Draw amount.
    let d = t < 0.3 ? 0 : t < 2.2 ? smooth((t - 0.3) / 1.9) : t < 3 ? 1 : 0;
    const tremble = t > 2.2 && t < 3 ? Math.sin(t * 37) * 0.25 : 0;
    // After release the string rings down: a damped overshoot past rest.
    let ring = 0;
    if (t >= 3) {
      const tau = t - 3;
      ring = Math.exp(-tau * 5) * Math.sin(tau * 38) * 5;
      d = 0;
    }
    const top = limb(1, d);
    const bot = limb(-1, d);
    const nockX = GRIP_X - lerp(REST, FULL, d) + ring;
    const nock: [number, number] = [nockX, 0];

    // Arrow tail position and its light.
    let tailX = nockX + tremble;
    let tailY = 0;
    let arrowLight = 1;
    let flying = 0; // 0 nocked .. 1 in flight
    if (t >= 3 && t < 4.05) {
      const tau = t - 3;
      tailX = GRIP_X - FULL + 30 * tau + 150 * tau * tau;
      tailY = 7 * tau - 3 * tau * tau;
      flying = 1;
      arrowLight = 1 - smooth((tau - 0.8) / 0.2);
    } else if (t >= 4.05 && t < 5.2) {
      // Dark return to the nock.
      const k = smooth((t - 4.05) / 1.15);
      tailX = lerp(GRIP_X - FULL + 30 * 1.05 + 150 * 1.1, nockX, k);
      tailY = lerp(4, 0, k);
      arrowLight = 0;
    } else if (t >= 5.2) {
      arrowLight = smooth((t - 5.2) / 0.6);
    }
    // Fire grows with the draw, roars in flight, catches again at the end.
    const fire = flying ? 1 : t < 3 ? smooth((t - 0.6) / 1.2) : arrowLight * 0.6;
    const headX = tailX + ARROW;
    const speed = flying ? 30 + 300 * (t - 3) : 0;

    for (let i = 0; i < rig.n; i++) {
      const p = rig.piece[i];
      const a = rig.a[i];
      const b = rig.b[i];
      let x = 0;
      let y = 0;
      let z = 0;
      let c: RGB = C.gold;
      let bright = 1;

      if (p === "bow") {
        const [lx, ly] = limb(a, d);
        const w = lerp(2.3, 0.7, Math.abs(a));
        x = lx + b * w * 0.8;
        y = ly;
        z = b * 0.6;
        c = b > 0.5 ? C.cream : C.gold;
      } else if (p === "grip") {
        const [lx, ly] = limb((a - 0.5) * 0.16, d);
        x = lx + b * 1.6;
        y = ly;
        c = C.grip;
      } else if (p === "string") {
        // Two straight runs: top tip -> nock -> bottom tip.
        const [from, to] = a < 0.5 ? [top, nock] : [nock, bot];
        const k = a < 0.5 ? a * 2 : (a - 0.5) * 2;
        x = lerp(from[0], to[0], k);
        y = lerp(from[1], to[1], k);
        c = C.string;
        bright = 0.9;
      } else if (p === "shaft") {
        x = tailX + a * ARROW;
        y = tailY + b * 0.55;
        c = C.shaft;
        bright = arrowLight;
      } else if (p === "head") {
        const half = (1 - a) * 3.8;
        x = headX + a * HEAD;
        y = tailY + b * half;
        c = mixRGB(C.steel, C.fireCore, fire * 0.4);
        bright = arrowLight;
      } else if (p === "fletch") {
        // Two vanes, swept back from the tail.
        const side = b < 0 ? -1 : 1;
        const span = Math.abs(b);
        x = tailX + 2 + a * 10 - span * 3.5;
        y = tailY + side * (1 + span * 3.6 * (1 - a * 0.5));
        c = side < 0 ? C.fletch : C.saffron;
        bright = arrowLight;
      } else {
        // Fire: around the head when nocked, a long tail in flight.
        const flick = Math.sin(t * 23 + rig.r[i] * 40) * 0.5 + 0.5;
        const trail = flying ? clamp(speed * 0.12, 4, 46) : 6;
        const back = Math.pow(a, flying ? 1.3 : 2) * trail;
        const spread = (1.2 + back * 0.12) * (flying ? 1 : 1.5);
        x = headX + HEAD * 0.4 - back;
        y = tailY + b * spread + (flying ? 0 : (1 - a) * 1.5 * flick);
        z = (rig.r[i] - 0.5) * spread;
        c = mixRGB(mixRGB(C.fireCore, C.fireMid, clamp(a * 2, 0, 1)), C.fireOut, clamp(a * 2 - 1, 0, 1));
        bright = fire * arrowLight * (1 - a * 0.7) * (0.55 + 0.45 * flick);
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = SHOW_ALT + y;
      pos[i * 3 + 2] = z;
      col[i * 3] = c[0] * bright;
      col[i * 3 + 1] = c[1] * bright;
      col[i * 3 + 2] = c[2] * bright;
    }
  },
};
