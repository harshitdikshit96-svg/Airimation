// Dragon — a full 3D serpent dragon swimming a loop through the show
// volume: scaled tube body with a travelling ripple, dorsal spikes, four
// paddling legs, horned head with an opening jaw, glowing eyes, mane and
// whiskers — and, once a loop, a breath of fire toward the audience.
//
// Every drone is fixed to the body (where along it, which way round it),
// and the body is rebuilt each frame along a moving path. That is why the
// motion reads as one animal rather than a cloud.

import { AnimatedFormation, SHOW_ALT, TAU, clamp, hex, makeRand, mixRGB, smooth, type RGB } from "./kit";

// 80 s per lap at real drone speeds (~3–4 m/s along the path). Every
// secondary motion runs a whole number of cycles per lap so the loop is
// seamless, and the fire breath is LIGHT on parked drones.
const LOOP = 80;
const SPAN = 2.3; // radians of the path the body covers
type V3 = [number, number, number];

function path(u: number): V3 {
  // An elliptical swim through the show volume, rising and dipping.
  // Wider in depth than before: the tight turns at the ends of a flat
  // ellipse swung the head round faster than a drone can fly.
  return [50 * Math.sin(u), SHOW_ALT + 8 * Math.sin(2 * u) + 2 * Math.sin(5 * u), 32 * Math.cos(u)];
}

function frameAt(u: number): { p: V3; T: V3; N: V3; B: V3 } {
  const p = path(u);
  const q = path(u + 0.002);
  let T: V3 = [q[0] - p[0], q[1] - p[1], q[2] - p[2]];
  const lt = Math.hypot(...T) || 1;
  T = [T[0] / lt, T[1] / lt, T[2] / lt];
  // N = T x up (lateral), B = N x T (dorsal).
  let N: V3 = [-T[2], 0, T[0]];
  const ln = Math.hypot(...N) || 1;
  N = [N[0] / ln, N[1] / ln, N[2] / ln];
  const B: V3 = [N[1] * T[2] - N[2] * T[1], N[2] * T[0] - N[0] * T[2], N[0] * T[1] - N[1] * T[0]];
  return { p, T, N, B };
}

function radius(s: number): number {
  const swell = 3.3 + 2.5 * Math.pow(Math.sin(Math.PI * Math.min(1, s / 0.8)), 0.6);
  return swell * (1 - smooth((s - 0.7) / 0.3) * 0.88);
}

type Piece = "body" | "spike" | "leg" | "skull" | "snout" | "jaw" | "eye" | "horn" | "mane" | "whisker" | "fire";

type Rig = {
  n: number;
  piece: Piece[];
  a: Float32Array; // along (s for body pieces, local param otherwise)
  b: Float32Array; // around / across
  c: Float32Array; // extra
  k: Int16Array; // which spike / leg / side
};

const C = {
  scale: hex("#ff3524"),
  scaleDeep: hex("#c4161a"),
  belly: hex("#ffcf5a"),
  gold: hex("#ffc93d"),
  orange: hex("#ff8a1f"),
  ivory: hex("#fff3d4"),
  eye: hex("#fffbd0"),
  fireCore: hex("#fff6b0"),
  fireOut: hex("#ff3a10"),
};

function build(n: number): Rig {
  const rand = makeRand(41);
  const shares: [Piece, number][] = [
    ["body", 0.52], ["spike", 0.09], ["leg", 0.07], ["skull", 0.05], ["snout", 0.03], ["jaw", 0.03],
    ["eye", 0.012], ["horn", 0.03], ["mane", 0.03], ["whisker", 0.04], ["fire", 0.068],
  ];
  const piece: Piece[] = [];
  const A: number[] = [];
  const B: number[] = [];
  const Cc: number[] = [];
  const K: number[] = [];
  const GOLD = Math.PI * (3 - Math.sqrt(5));
  // Inverse CDF of body surface area along s, so scales are evenly spaced.
  const table: number[] = [0];
  for (let i = 1; i <= 200; i++) table.push(table[i - 1] + radius(i / 200));
  const total = table[200];
  const sAt = (q: number) => {
    const target = q * total;
    let i = 1;
    while (i < 200 && table[i] < target) i++;
    return (i - 1 + (target - table[i - 1]) / (table[i] - table[i - 1] || 1)) / 200;
  };
  let used = 0;
  shares.forEach(([name, share], idx) => {
    const count = idx === shares.length - 1 ? n - used : Math.max(4, Math.round(n * share));
    used += count;
    for (let j = 0; j < count; j++) {
      piece.push(name);
      const q = (j + 0.5) / count;
      if (name === "body") {
        A.push(sAt(q));
        B.push((j * GOLD) % TAU);
        Cc.push(0);
        K.push(0);
      } else if (name === "spike") {
        const spikes = 30;
        const which = j % spikes;
        A.push(0.04 + (which / (spikes - 1)) * 0.9);
        B.push(Math.floor(j / spikes) / Math.ceil(count / spikes)); // 0 base .. 1 tip
        Cc.push(0);
        K.push(which);
      } else if (name === "leg") {
        const which = j % 4;
        A.push(Math.floor(j / 4) / Math.ceil(count / 4));
        B.push(rand());
        Cc.push(rand());
        K.push(which);
      } else if (name === "skull" || name === "snout" || name === "jaw" || name === "eye") {
        // Fibonacci sphere, mapped onto an ellipsoid at pose time.
        const yy = 1 - 2 * q;
        const rr = Math.sqrt(1 - yy * yy);
        A.push(rr * Math.cos(j * GOLD));
        B.push(yy);
        Cc.push(rr * Math.sin(j * GOLD));
        K.push(name === "eye" ? (j % 2 ? 1 : -1) : 0);
      } else if (name === "horn" || name === "whisker") {
        A.push(Math.floor(j / 2) / Math.ceil(count / 2));
        B.push(rand() * 2 - 1);
        Cc.push(0);
        K.push(j % 2 ? 1 : -1);
      } else {
        A.push(rand());
        B.push(rand() * TAU);
        Cc.push(rand());
        K.push(0);
      }
    }
  });
  return { n, piece, a: Float32Array.from(A), b: Float32Array.from(B), c: Float32Array.from(Cc), k: Int16Array.from(K) };
}

export const dragon: AnimatedFormation<Rig> = {
  id: "dragon",
  label: "Dragon",
  blurb: "A 3D dragon swims the sky — and breathes fire once a loop.",
  loop: LOOP,
  minDrones: 500,
  build,
  pose(rig, t, pos, col) {
    const uHead = (TAU * t) / LOOP + 0.6;
    const ph = (TAU * t) / LOOP;
    // Fire when the dragon is crossing in front of the audience (z > 0).
    const phase = (t / LOOP) % 1;
    const fire = smooth((phase - 0.08) / 0.06) * (1 - smooth((phase - 0.26) / 0.06));
    const jawOpen = 0.08 + fire * 0.4 + Math.max(0, Math.sin(ph * 8)) * 0.06;
    const head0 = frameAt(uHead);
    // The head is drawn 1.35x its modelled size: at show distance a
    // true-to-scale head is lost against the body.
    const HS = 1.35;
    const head = head0;

    // Body frames, sampled once per frame and interpolated per drone
    // (evaluating the path per drone cost ~6 ms a frame at 1,600 drones).
    const S = 160;
    const tab = new Float32Array((S + 1) * 12);
    for (let k = 0; k <= S; k++) {
      const sk = k / S;
      const f = frameAt(uHead - 0.14 - sk * SPAN);
      const ripple = Math.sin(sk * 11 - ph * 8) * 2.4 * smooth(sk / 0.25);
      tab.set([f.p[0] + f.N[0] * ripple, f.p[1] + f.N[1] * ripple, f.p[2] + f.N[2] * ripple, ...f.T, ...f.N, ...f.B], k * 12);
    }
    const toWorld = (f: { p: V3; T: V3; N: V3; B: V3 }, fw: number, lat: number, up: number): V3 => [
      f.p[0] + f.T[0] * fw + f.N[0] * lat + f.B[0] * up,
      f.p[1] + f.T[1] * fw + f.N[1] * lat + f.B[1] * up,
      f.p[2] + f.T[2] * fw + f.N[2] * lat + f.B[2] * up,
    ];
    const toWorldH = (fw: number, lat: number, up: number) => toWorld(head, fw * HS, lat * HS, up * HS);
    // Body point with the travelling lateral ripple.
    const bodyFrame = (s: number) => {
      const x = clamp(s, 0, 1) * S;
      const k = Math.min(S - 1, Math.floor(x));
      const q = x - k;
      const g = (o: number): V3 => [
        tab[k * 12 + o] + (tab[(k + 1) * 12 + o] - tab[k * 12 + o]) * q,
        tab[k * 12 + o + 1] + (tab[(k + 1) * 12 + o + 1] - tab[k * 12 + o + 1]) * q,
        tab[k * 12 + o + 2] + (tab[(k + 1) * 12 + o + 2] - tab[k * 12 + o + 2]) * q,
      ];
      return { p: g(0), T: g(3), N: g(6), B: g(9) };
    };

    for (let i = 0; i < rig.n; i++) {
      const p = rig.piece[i];
      const a = rig.a[i];
      const b = rig.b[i];
      const cc = rig.c[i];
      let w: V3 = [0, 0, 0];
      let c: RGB = C.scale;
      let bright = 1;

      if (p === "body") {
        const f = bodyFrame(a);
        const r = radius(a);
        w = toWorld(f, 0, Math.cos(b) * r, Math.sin(b) * r);
        const under = Math.sin(b) < -0.45;
        const glint = Math.sin(a * 140) * Math.sin(b * 5) > 0.55;
        c = under ? C.belly : glint ? C.gold : mixRGB(C.scale, C.scaleDeep, 0.5 + 0.5 * Math.sin(b));
        bright = under ? 0.9 : 1;
      } else if (p === "spike") {
        const f = bodyFrame(a);
        const r = radius(a);
        const h = (3.4 - a * 2) * b;
        w = toWorld(f, -h * 0.55, 0, r + h);
        c = mixRGB(C.gold, C.orange, b);
      } else if (p === "leg") {
        const which = rig.k[i];
        const s = which < 2 ? 0.17 : 0.52;
        const side = which % 2 ? 1 : -1;
        const f = bodyFrame(s);
        const r = radius(s);
        const paddle = Math.sin(ph * 10 + which * 1.7) * 0.35;
        const len = 7;
        if (a < 0.8) {
          const k = a / 0.8;
          w = toWorld(f, Math.sin(paddle) * len * k - 1.5 * k, side * (r + 1.5 * k), -r * 0.4 - Math.cos(paddle) * len * 0.75 * k);
          c = C.gold;
        } else {
          // Three claws, splayed.
          const k = (a - 0.8) / 0.2;
          const claw = Math.floor(b * 3) - 1;
          w = toWorld(f, Math.sin(paddle) * len - 1.5 + k * 2.2, side * (r + 1.5 + claw * 1.1 * k), -r * 0.4 - Math.cos(paddle) * len * 0.75 - k * 0.6);
          c = C.ivory;
        }
      } else if (p === "skull") {
        w = toWorldH(2.5 + a * 5.2, cc * 3.3, 0.9 + b * 2.9);
        c = b > 0.2 ? C.scale : C.gold;
      } else if (p === "snout") {
        w = toWorldH(8.6 + a * 4.2, cc * 2.4, 0.4 + b * 1.7);
        c = C.gold;
      } else if (p === "jaw") {
        // Hinged at the back of the mouth; opens downward.
        const fw = 6.5 + a * 4.6;
        const up = -1.4 + b * 0.8;
        const ang = -jawOpen;
        const hx = 2.5;
        const hy = -0.6;
        const rx = (fw - hx) * Math.cos(ang) - (up - hy) * Math.sin(ang) + hx;
        const ry = (fw - hx) * Math.sin(ang) + (up - hy) * Math.cos(ang) + hy;
        w = toWorldH(rx, cc * 2.1, ry);
        c = C.belly;
      } else if (p === "eye") {
        const side = rig.k[i];
        w = toWorldH(6.4 + a * 0.6, side * 2.9 + cc * 0.4, 2.3 + b * 0.6);
        c = C.eye;
        bright = 1.6;
      } else if (p === "horn") {
        const side = rig.k[i];
        w = toWorldH(1.5 - a * 9, side * (1.7 + a * 2.6 + a * a * 1.2), 2.8 + a * 6 - a * a * 1.8);
        c = mixRGB(C.ivory, C.gold, a * 0.5);
      } else if (p === "mane") {
        const ang = Math.PI * (0.1 + 0.8 * a);
        const rr = 3.4 + cc * 2.6 + Math.sin(ph * 20 + b * 6) * 0.5;
        w = toWorldH(-1 - cc * 4, Math.cos(ang) * rr, Math.sin(ang) * rr);
        c = mixRGB(C.orange, C.gold, cc);
        bright = 0.9;
      } else if (p === "whisker") {
        const side = rig.k[i];
        const wave = Math.sin(a * 7 - ph * 16) * 1.4 * a;
        w = toWorldH(12 - a * 17, side * (1.8 + a * 6.5), -0.4 - a * 3 + wave);
        c = mixRGB(C.ivory, C.gold, a);
        bright = 1 - a * 0.4;
      } else {
        // Fire breath: drones hold a cone ahead of the mouth (dark until
        // the breath), the fire itself is light rolling outward.
        const d = a * 15;
        const spread = 0.6 + d * 0.22;
        const flick = 0.6 + 0.4 * Math.sin(t * 29 + cc * 50);
        const reach = clamp(fire * 1.3 - a * 0.3, 0, 1);
        w = toWorldH(12.5 + d / HS, (Math.cos(b) * spread * cc) / HS, -0.8 + (Math.sin(b) * spread * cc - d * 0.05) / HS);
        c = mixRGB(C.fireCore, C.fireOut, clamp(a * 1.4, 0, 1));
        bright = reach * flick * (1 - a * 0.6);
      }

      pos[i * 3] = w[0];
      pos[i * 3 + 1] = w[1];
      pos[i * 3 + 2] = w[2];
      col[i * 3] = c[0] * bright;
      col[i * 3 + 1] = c[1] * bright;
      col[i * 3 + 2] = c[2] * bright;
    }
  },
};


