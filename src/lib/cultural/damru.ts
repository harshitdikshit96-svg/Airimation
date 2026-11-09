// Damru — Shiva's hourglass drum, in full 3D: two laced cones, two
// drumheads, the red binding at the waist, and two beads on cords that
// swing up and strike the heads. Each strike flashes the head it hits —
// the visual beat of the sound.
//
// 4 s loop. The drum turns slowly so the 3D form reads, with the quick
// wrist-twist that throws the beads.

import { AnimatedFormation, SHOW_ALT, TAU, clamp, hex, makeRand, mixRGB, type RGB } from "./kit";

const H = 27; // half-height
const R = 19; // rim radius
const RW = 3.6; // waist radius

type Piece = "cone" | "head" | "band" | "cord" | "bead" | "tassel";

type Rig = {
  n: number;
  piece: Piece[];
  /** Cones/heads: +1 top, -1 bottom. Cords/beads: +1 / -1 which side. */
  side: Int8Array;
  /** Generic surface coordinates. */
  a: Float32Array;
  b: Float32Array;
  c: Float32Array;
};

const C = {
  wood: hex("#c2601c"),
  woodDeep: hex("#8a3a10"),
  lace: hex("#fff0c8"),
  skin: hex("#ffe8bf"),
  flash: hex("#ffffff"),
  red: hex("#ff2a22"),
  gold: hex("#ffd34d"),
  cord: hex("#fff6e0"),
};

function build(n: number): Rig {
  const rand = makeRand(17);
  const shares: [Piece, number][] = [["cone", 0.5], ["head", 0.22], ["band", 0.08], ["cord", 0.07], ["bead", 0.08], ["tassel", 0.05]];
  const piece: Piece[] = [];
  const side: number[] = [];
  const A: number[] = [];
  const B: number[] = [];
  const Cc: number[] = [];
  let used = 0;
  const GOLD = Math.PI * (3 - Math.sqrt(5));
  shares.forEach(([name, share], idx) => {
    const count = idx === shares.length - 1 ? n - used : Math.round(n * share);
    used += count;
    for (let k = 0; k < count; k++) {
      piece.push(name);
      const sd = k % 2 === 0 ? 1 : -1;
      side.push(sd);
      const j = Math.floor(k / 2);
      const per = Math.ceil(count / 2);
      if (name === "cone") {
        // Rings, not scatter: each cone is laid as evenly spaced rings with
        // drones in proportion to the ring's circumference. Rings are what
        // make the lacing pattern read as lacing.
        const rings = Math.max(4, Math.round(Math.sqrt(per) * 0.62));
        let weight = 0;
        for (let q = 0; q < rings; q++) weight += RW + (R - RW) * ((q + 0.5) / rings);
        let acc = 0;
        let ring = 0;
        for (; ring < rings; ring++) {
          const w = ((RW + (R - RW) * ((ring + 0.5) / rings)) / weight) * per;
          if (j < acc + w) break;
          acc += w;
        }
        ring = Math.min(ring, rings - 1);
        const inRing = Math.max(1, Math.round(((RW + (R - RW) * ((ring + 0.5) / rings)) / weight) * per));
        A.push((ring + 0.5) / rings); // 0 waist .. 1 rim
        B.push(((j - acc) / inRing) * TAU + ring * 0.37);
        Cc.push(0);
      } else if (name === "head") {
        // Rim ring first (a third), then a sunflower fill of the skin.
        if (j < per / 3) {
          A.push(1);
          B.push((j / (per / 3)) * TAU);
        } else {
          const q = j - per / 3;
          A.push(Math.sqrt((q + 0.5) / (per - per / 3)) * 0.94);
          B.push(q * GOLD);
        }
        Cc.push(0);
      } else if (name === "band") {
        A.push(rand() * 2 - 1); // height within the band
        B.push((k / count) * TAU * 3);
        Cc.push(0);
      } else if (name === "bead") {
        // A small sphere: fibonacci points.
        const m = per;
        const yy = 1 - (2 * (j + 0.5)) / m;
        const rr = Math.sqrt(1 - yy * yy);
        A.push(rr * Math.cos(j * GOLD));
        B.push(yy);
        Cc.push(rr * Math.sin(j * GOLD));
      } else {
        A.push((j + 0.5) / per);
        B.push(rand() * 2 - 1);
        Cc.push(rand() * 2 - 1);
      }
    }
  });
  return { n, piece, side: Int8Array.from(side), a: Float32Array.from(A), b: Float32Array.from(B), c: Float32Array.from(Cc) };
}

export const damru: AnimatedFormation<Rig> = {
  id: "damru",
  label: "Damru",
  blurb: "Shiva's drum in 3D — the beads strike, the heads flash.",
  loop: 4,
  minDrones: 200,
  build,
  pose(rig, t, pos, col) {
    // Slow turn plus a wrist twist.
    const twist = Math.sin((TAU * t) / 1) * 0.18;
    const spin = (TAU * t) / 16 + twist;
    const cs = Math.cos(spin);
    const sn = Math.sin(spin);
    // Bead swing in the drum's frame: angle of the cord from horizontal.
    // +ve swings it up to the top head. The two beads are opposite.
    const swing = Math.sin((TAU * t) / 1 + 0.9) * 1.25;
    const CORD = 21;
    // Strike flashes: when a bead is near a head.
    const hitTop = clamp((Math.sin((TAU * t) / 1 + 0.9) - 0.82) / 0.18, 0, 1);
    const hitBot = clamp((-Math.sin((TAU * t) / 1 + 0.9) - 0.82) / 0.18, 0, 1);

    for (let i = 0; i < rig.n; i++) {
      const p = rig.piece[i];
      const sd = rig.side[i];
      const a = rig.a[i];
      const b = rig.b[i];
      let lx = 0;
      let ly = 0;
      let lz = 0;
      let c: RGB = C.wood;
      let bright = 1;

      if (p === "cone") {
        const r = RW + (R - RW) * a;
        lx = Math.cos(b) * r;
        lz = Math.sin(b) * r;
        ly = sd * (2.2 + (H - 2.2) * a);
        // Lacing: criss-cross cords running rim to waist.
        const lace = Math.abs(Math.sin(b * 6 + a * 3.2 * sd)) > 0.93 || Math.abs(Math.sin(b * 6 - a * 3.2 * sd)) > 0.93;
        c = lace ? C.lace : mixRGB(C.wood, C.woodDeep, 1 - a);
      } else if (p === "head") {
        lx = Math.cos(b) * R * a;
        lz = Math.sin(b) * R * a;
        ly = sd * H;
        const hit = sd > 0 ? hitTop : hitBot;
        c = a >= 0.99 ? C.gold : mixRGB(C.skin, C.flash, hit);
        bright = a >= 0.99 ? 1 : 0.8 + hit * 0.9;
      } else if (p === "band") {
        const r = RW + 1.6;
        lx = Math.cos(b) * r;
        lz = Math.sin(b) * r;
        ly = a * 2.2;
        c = Math.abs(a) > 0.7 ? C.gold : C.red;
      } else if (p === "cord" || p === "bead") {
        // Cord from the waist at angle (swing * side), bead at its end.
        const ang = swing * sd;
        const dirx = Math.cos(ang) * sd; // out to its own side
        const diry = Math.sin(ang) * sd;
        if (p === "cord") {
          const k = 2 + a * (CORD - 2);
          lx = (RW + 1.6) * sd + dirx * k;
          ly = diry * k;
          c = C.cord;
          bright = 0.8;
        } else {
          const cx = (RW + 1.6) * sd + dirx * (CORD + 2.4);
          const cy = diry * (CORD + 2.4);
          lx = cx + a * 2.4;
          ly = cy + b * 2.4;
          lz = rig.c[i] * 2.4;
          c = C.gold;
          bright = 1.2;
        }
      } else {
        // Tassel: a short hank hanging from the band.
        const k = rig.a[i];
        lx = rig.b[i] * (0.6 + k * 1.6);
        lz = RW + 2 + rig.c[i] * 0.8;
        ly = -1.5 - k * 9 + Math.sin(t * 4 + k * 3) * 0.4;
        c = k > 0.7 ? C.gold : C.red;
      }

      // Turn the whole drum about the vertical axis.
      const x = lx * cs - lz * sn;
      const z = lx * sn + lz * cs;
      pos[i * 3] = x;
      pos[i * 3 + 1] = SHOW_ALT + ly;
      pos[i * 3 + 2] = z;
      col[i * 3] = c[0] * bright;
      col[i * 3 + 1] = c[1] * bright;
      col[i * 3 + 2] = c[2] * bright;
    }
  },
};
