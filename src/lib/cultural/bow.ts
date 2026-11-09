// Dhanush-baan — a recurve bow slowly drawn, a fire-arrow loosed.
//
// Choreographed the way a real fleet would fly it, at real drone speeds
// (under 8 m/s, enforced by the speed test):
//   0–1 s     at rest, arrow nocked, flame lit
//   1–7 s     the draw: string and arrow pulled back over six seconds
//   7–8 s     held at full draw
//   8 s       RELEASE — done with light. The string and arrow switch off
//             where they are; a line of drones already parked along the
//             flight path ("trail") lights up in a racing chase, so the
//             arrow appears to streak across the sky at any speed.
//   8.5–14.5  the dark string and arrow drones fly back to rest, unseen
//   14.5–16   they light up again, ready for the next draw
//
// Built procedurally: every drone stores where it sits on its piece
// (along, across); the piece is rebuilt each frame from the draw amount.

import { AnimatedFormation, SHOW_ALT, clamp, hex, lerp, makeRand, mixRGB, smooth, type RGB } from "./kit";

const LOOP = 16;
const L = 40; // half-height of the bow, metres
const GRIP_X = -14;
const REST = 9; // string-to-grip depth at rest
const FULL = 34; // at full draw
const ARROW = 56; // shaft length
const HEAD = 8;
const TRAIL_TO = 125; // how far right the light-chase runs

type Piece = "bow" | "grip" | "string" | "shaft" | "head" | "fletch" | "flame" | "trail";

type Rig = {
  n: number;
  piece: Piece[];
  /** Position along the piece, 0..1 (or -1..1 for the bow). */
  a: Float32Array;
  /** Position across the piece, -1..1. */
  b: Float32Array;
  /** Per-drone random, for flame flicker (light only). */
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
    ["bow", 0.3], ["grip", 0.04], ["string", 0.1], ["shaft", 0.13], ["head", 0.07], ["fletch", 0.07], ["flame", 0.11], ["trail", 0.18],
  ];
  const rand = makeRand(5);
  const piece: Piece[] = [];
  const a: number[] = [];
  const b: number[] = [];
  let used = 0;
  shares.forEach(([name, share], idx) => {
    const count = idx === shares.length - 1 ? n - used : Math.round(n * share);
    used += count;
    const rows = name === "bow" ? 3 : name === "shaft" || name === "grip" ? 2 : 1;
    const per = Math.ceil(count / rows);
    for (let k = 0; k < count; k++) {
      const row = k % rows;
      const j = Math.floor(k / rows);
      piece.push(name);
      if (name === "head" || name === "fletch" || name === "flame") {
        a.push((j + rand()) / per);
        b.push(rand() * 2 - 1);
      } else if (name === "trail") {
        // Evenly spaced along the flight line, slight vertical spread.
        a.push((k + 0.5) / count);
        b.push((rand() * 2 - 1) * 0.6);
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
  const bend = lerp(7, 12, d);
  const av = Math.abs(v);
  const flick = Math.max(0, av - 0.78) ** 2 * 26;
  return [GRIP_X - bend * v * v + flick, L * v * (1 - 0.05 * d)];
}

export const bowArrow: AnimatedFormation<Rig> = {
  id: "bow",
  label: "Dhanush-baan",
  blurb: "A fire-arrow slowly drawn — and loosed in a streak of light.",
  loop: LOOP,
  minDrones: 200,
  build,
  pose(rig, t, pos, col) {
    // Draw amount: up over 6 s, held, then (after release, in the dark)
    // back to rest over 6 s.
    const d =
      t < 1 ? 0 : t < 7 ? smooth((t - 1) / 6) : t < 8.5 ? 1 : t < 14.5 ? 1 - smooth((t - 8.5) / 6) : 0;
    // Lit before release; off from release until re-lit at 14.5–16.
    const lit = t < 8 ? 1 : t < 8.25 ? 1 - (t - 8) / 0.25 : t < 14.5 ? 0 : smooth((t - 14.5) / 1.5);
    const fire = t < 8 ? 0.35 + 0.65 * smooth((t - 1) / 6) : lit * 0.35;

    const top = limb(1, d);
    const bot = limb(-1, d);
    const nockX = GRIP_X - lerp(REST, FULL, d);
    const nock: [number, number] = [nockX, 0];
    const tailX = nockX;
    const headX = tailX + ARROW;
    const fullHeadX = GRIP_X - FULL + ARROW;
    // The light-chase: a bright front racing along the trail drones, 8.0–9.2 s.
    const chase = t >= 8 && t < 9.6 ? (t - 8) / 1.2 : -1;

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
        z = b * 1.2;
        c = b > 0.5 ? C.cream : C.gold;
      } else if (p === "grip") {
        const [lx, ly] = limb((a - 0.5) * 0.16, d);
        x = lx + b * 1.6;
        y = ly;
        c = C.grip;
      } else if (p === "string") {
        const [from, to] = a < 0.5 ? [top, nock] : [nock, bot];
        const k = a < 0.5 ? a * 2 : (a - 0.5) * 2;
        x = lerp(from[0], to[0], k);
        y = lerp(from[1], to[1], k);
        c = C.string;
        bright = 0.9 * lit;
      } else if (p === "shaft") {
        x = tailX + a * ARROW;
        y = b * 0.55;
        c = C.shaft;
        bright = lit;
      } else if (p === "head") {
        const half = (1 - a) * 3.6;
        x = headX + a * HEAD;
        y = b * half;
        c = mixRGB(C.steel, C.fireCore, fire * 0.4);
        bright = lit;
      } else if (p === "fletch") {
        const side = b < 0 ? -1 : 1;
        const span = Math.abs(b);
        x = tailX + 2 + a * 9 - span * 3.2;
        y = side * (1 + span * 3.4 * (1 - a * 0.5));
        c = side < 0 ? C.fletch : C.saffron;
        bright = lit;
      } else if (p === "flame") {
        // Fire around the arrowhead. Drones hold a fixed little cloud that
        // travels with the head; the flicker is LIGHT only.
        const flick = 0.5 + 0.5 * Math.sin(t * 19 + rig.r[i] * 40);
        x = headX + HEAD * 0.5 - a * 5;
        y = b * (1.4 + a * 1.6);
        z = (rig.r[i] - 0.5) * 2.4;
        c = mixRGB(mixRGB(C.fireCore, C.fireMid, clamp(a * 2, 0, 1)), C.fireOut, clamp(a * 2 - 1, 0, 1));
        bright = fire * lit * (1 - a * 0.6) * (0.5 + 0.5 * flick);
      } else {
        // Trail: parked along the flight path from the full-draw arrowhead
        // to the right; dark except while the chase passes.
        x = fullHeadX + HEAD + a * (TRAIL_TO - fullHeadX - HEAD);
        y = b + a * 6;
        const behind = chase - a; // > 0 once the front has passed
        const glow = chase < 0 ? 0 : behind >= 0 && behind < 0.22 ? 1 - behind / 0.22 : 0;
        c = mixRGB(C.fireOut, C.fireCore, glow);
        bright = glow * 1.4;
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
