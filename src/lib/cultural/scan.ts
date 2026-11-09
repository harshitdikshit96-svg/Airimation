// Formations from real 3D scans (CC0 museum sculptures), made by
// scripts/scan-to-formation.mjs. These are TRUE 3D figures: drones on the
// surface of the sculpture, not a flat drawing.
//
// The point list is farthest-point ordered, so the first n points are an
// even sampling for any fleet size n.
//
// Motion (real drone speeds): a slow turntable turn, one revolution per
// loop, loop long enough that the outermost drone stays under ~7 m/s.
// Shading is LIGHT: each drone's brightness follows its surface normal
// against a fixed light, so the form reads as solid while it turns. For
// figures with an aureole (Nataraja's ring of fire), the outer ring
// flickers like flame — also light only.

import { AnimatedFormation, MAX_DRONE_SPEED, SHOW_ALT, TAU, clamp, hex, mixRGB } from "./kit";

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

type Rig = { n: number; p: Float32Array; nrm: Float32Array; ring: Uint8Array; h: number };

function decode(b64: string): Uint8Array {
  if (typeof atob === "function") {
    const s = atob(b64);
    const u = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
    return u;
  }
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

export function scanFormation(
  file: ScanFile,
  opts: { blurb: string; fireRing?: boolean; palette?: "bronze" | "gold" | "stone"; minDrones?: number }
): AnimatedFormation<Rig> {
  // Outermost radius from the turn axis, for the speed budget.
  const reach = Math.hypot(file.width, file.depth) / 2;
  const loop = Math.max(48, Math.ceil((TAU * reach) / (MAX_DRONE_SPEED - 1)));
  const base = opts.palette === "gold" ? hex("#ffc246") : opts.palette === "stone" ? hex("#f4dcc0") : hex("#ffab4f");
  const highlight = hex("#fff3d6");
  const fireA = hex("#ff3a12");
  const fireB = hex("#ffd36a");
  let cache: { pos: Int16Array; nrm: Int8Array } | null = null;

  return {
    id: file.id,
    label: file.label,
    blurb: opts.blurb,
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
      const ring = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        // More drones than scan points: extras double up on a tiny offset.
        const j = i < m ? i : i % m;
        const off = i < m ? 0 : 0.6;
        p[i * 3] = cache.pos[j * 3] * file.quant + off;
        p[i * 3 + 1] = cache.pos[j * 3 + 1] * file.quant;
        p[i * 3 + 2] = cache.pos[j * 3 + 2] * file.quant + off;
        for (let k = 0; k < 3; k++) nrm[i * 3 + k] = cache.nrm[j * 3 + k] / 127;
        // Aureole: the outer band, far from the figure's vertical axis
        // through its middle.
        if (opts.fireRing) {
          const dx = p[i * 3];
          const dy = p[i * 3 + 1] - file.height * 0.55;
          ring[i] = Math.hypot(dx, dy) > Math.min(file.width, file.height) * 0.4 ? 1 : 0;
        }
      }
      return { n, p, nrm, ring, h: file.height };
    },
    pose(rig, t, pos, col) {
      const a = (TAU * t) / loop;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      // Fixed key light from front-left-above, in world space.
      const L = [-0.45, 0.55, 0.7];
      for (let i = 0; i < rig.n; i++) {
        const x = rig.p[i * 3];
        const y = rig.p[i * 3 + 1];
        const z = rig.p[i * 3 + 2];
        const rx = x * ca + z * sa;
        const rz = -x * sa + z * ca;
        const nx = rig.nrm[i * 3] * ca + rig.nrm[i * 3 + 2] * sa;
        const ny = rig.nrm[i * 3 + 1];
        const nz = -rig.nrm[i * 3] * sa + rig.nrm[i * 3 + 2] * ca;
        // Two-sided diffuse: a scan's normals can face either way.
        const diffuse = Math.abs(nx * L[0] + ny * L[1] + nz * L[2]);
        const shade = 0.22 + 0.78 * diffuse;
        let c = mixRGB(base, highlight, clamp((diffuse - 0.7) / 0.3, 0, 1) * 0.6);
        let k = shade;
        if (rig.ring[i]) {
          const flick = 0.5 + 0.5 * Math.sin(t * 7 + i * 1.7) * Math.sin(t * 3.1 + i * 0.37);
          c = mixRGB(fireA, fireB, flick);
          k = 0.75 + 0.6 * flick;
        }
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
