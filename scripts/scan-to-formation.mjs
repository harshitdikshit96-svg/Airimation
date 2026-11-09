#!/usr/bin/env node
// Turn a 3D scan (GLB) into a drone formation: a surface point cloud with
// shading normals, ready for src/lib/cultural/scans.ts.
//
//   node scripts/scan-to-formation.mjs <in.glb> <id> [--height 84] [--points 2000]
//        [--rotate-x -90] [--rotate-y 0] [--crop-bottom 0.2] [--label "Nataraja"] [--credit "..."]
//
// What it does:
//   1. Reads every mesh in the GLB (Meshopt/Draco-free GLBs, as museums ship).
//   2. Samples ~40x the target count uniformly by SURFACE AREA, keeping each
//      sample's face normal. Drones make shells, not solids.
//   3. Farthest-point sampling down to --points. The result has a useful
//      property: ANY PREFIX of the list is itself evenly spread, so the
//      site takes the first 100, 500 or 2,000 for any fleet size.
//   4. Normalises: Y up, base on the ground plane of the figure, height
//      --height metres, centred on x/z.
//   5. Writes src/lib/cultural/scans/<id>.json — int16-quantised, base64.
//
// Licence: only CC0 / public-domain scans go in the repo. Record the
// source in --credit.

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [, , input, id, ...rest] = process.argv;
if (!input || !id) {
  console.error("usage: scan-to-formation.mjs <in.glb> <id> [--height 84] [--points 2000] [--rotate-x deg] [--rotate-y deg] [--label s] [--credit s]");
  process.exit(1);
}
const opt = (name, def) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : def;
};
const HEIGHT = Number(opt("height", 84));
const POINTS = Number(opt("points", 2000));
const RX = (Number(opt("rotate-x", 0)) * Math.PI) / 180;
const RY = (Number(opt("rotate-y", 0)) * Math.PI) / 180;
// Drop the lowest fraction of the figure (a heavy pedestal eats drones).
const CROP = Number(opt("crop-bottom", 0));

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const doc = await io.read(input);

// --- gather world-space triangles
const tris = [];
const mul = (m, p) => [
  m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
  m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
  m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
];
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  const m = node.getWorldMatrix();
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute("POSITION");
    if (!pos) continue;
    const idx = prim.getIndices();
    const count = idx ? idx.getCount() : pos.getCount();
    const get = (k) => mul(m, pos.getElement(idx ? idx.getScalar(k) : k, []));
    for (let k = 0; k + 2 < count; k += 3) tris.push([get(k), get(k + 1), get(k + 2)]);
  }
}
if (!tris.length) throw new Error("no triangles found");

// --- orientation fix (museum scans are not always Y-up)
const rot = (p) => {
  let [x, y, z] = p;
  [y, z] = [y * Math.cos(RX) - z * Math.sin(RX), y * Math.sin(RX) + z * Math.cos(RX)];
  [x, z] = [x * Math.cos(RY) + z * Math.sin(RY), -x * Math.sin(RY) + z * Math.cos(RY)];
  return [x, y, z];
};
for (const t of tris) for (let k = 0; k < 3; k++) t[k] = rot(t[k]);
if (CROP > 0) {
  let lo = Infinity, hi = -Infinity;
  for (const t of tris) for (const p of t) { lo = Math.min(lo, p[1]); hi = Math.max(hi, p[1]); }
  const cut = lo + (hi - lo) * CROP;
  for (let i = tris.length - 1; i >= 0; i--) if (Math.max(tris[i][0][1], tris[i][1][1], tris[i][2][1]) < cut) tris.splice(i, 1);
}

// --- area-weighted sampling
let s = 1234567;
const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647);
const cum = [];
let total = 0;
const normals = [];
for (const [a, b, c] of tris) {
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  const len = Math.hypot(...n) || 1;
  total += len / 2;
  cum.push(total);
  normals.push([n[0] / len, n[1] / len, n[2] / len]);
}
const CAND = Math.max(POINTS * 40, 40000);
const cand = new Float32Array(CAND * 3);
const candN = new Float32Array(CAND * 3);
for (let i = 0; i < CAND; i++) {
  const r = rand() * total;
  let lo = 0, hi = cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < r) lo = mid + 1;
    else hi = mid;
  }
  const [a, b, c] = tris[lo];
  let p = rand(), q = rand();
  if (p + q > 1) { p = 1 - p; q = 1 - q; }
  for (let k = 0; k < 3; k++) {
    cand[i * 3 + k] = a[k] + (b[k] - a[k]) * p + (c[k] - a[k]) * q;
    candN[i * 3 + k] = normals[lo][k];
  }
}

// --- farthest-point sampling (prefix-uniform)
const minD = new Float32Array(CAND).fill(Infinity);
const order = [Math.floor(rand() * CAND)];
for (let k = 1; k < POINTS; k++) {
  const last = order[k - 1];
  const lx = cand[last * 3], ly = cand[last * 3 + 1], lz = cand[last * 3 + 2];
  let best = -1, bestD = -1;
  for (let i = 0; i < CAND; i++) {
    const d = (cand[i * 3] - lx) ** 2 + (cand[i * 3 + 1] - ly) ** 2 + (cand[i * 3 + 2] - lz) ** 2;
    if (d < minD[i]) minD[i] = d;
    if (minD[i] > bestD) { bestD = minD[i]; best = i; }
  }
  order.push(best);
}

// --- normalise: centred on x/z, base at y=0, height HEIGHT
let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
for (const i of order) {
  minX = Math.min(minX, cand[i * 3]); maxX = Math.max(maxX, cand[i * 3]);
  minY = Math.min(minY, cand[i * 3 + 1]); maxY = Math.max(maxY, cand[i * 3 + 1]);
  minZ = Math.min(minZ, cand[i * 3 + 2]); maxZ = Math.max(maxZ, cand[i * 3 + 2]);
}
const scale = HEIGHT / (maxY - minY);
const cx = (minX + maxX) / 2, cz = (minZ + maxZ) / 2;
// int16 over +-128 m: 4 mm resolution, plenty.
const Q = 32767 / 128;
const posQ = new Int16Array(POINTS * 3);
const nrmQ = new Int8Array(POINTS * 3);
order.forEach((i, k) => {
  posQ[k * 3] = Math.round((cand[i * 3] - cx) * scale * Q);
  posQ[k * 3 + 1] = Math.round((cand[i * 3 + 1] - minY) * scale * Q);
  posQ[k * 3 + 2] = Math.round((cand[i * 3 + 2] - cz) * scale * Q);
  for (let j = 0; j < 3; j++) nrmQ[k * 3 + j] = Math.round(candN[i * 3 + j] * 127);
});

const out = {
  id,
  label: opt("label", id),
  credit: opt("credit", ""),
  licence: "CC0 1.0",
  height: HEIGHT,
  width: +((maxX - minX) * scale).toFixed(1),
  depth: +((maxZ - minZ) * scale).toFixed(1),
  count: POINTS,
  quant: 1 / Q,
  pos: Buffer.from(posQ.buffer).toString("base64"),
  nrm: Buffer.from(nrmQ.buffer).toString("base64"),
};
const dir = join(import.meta.dirname, "..", "src", "lib", "cultural", "scans");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, `${id}.json`), JSON.stringify(out));
console.log(`${id}: ${tris.length} triangles -> ${POINTS} points, ${out.width}x${HEIGHT}x${out.depth} m`);
