#!/usr/bin/env node
// Give a formation its model's REAL colours: sample the source GLB's
// texture (the photograph a museum scan is made from, or the artist's
// paint on a Sketchfab model) at every drone of an existing formation, and
// reduce them to a short palette.
//
//   node scripts/scan-colors.mjs <in.glb> <id> [--k 5] [--only nodeA,nodeB]
//
// Reads src/lib/cultural/scans/<id>.json (made by scan-to-formation.mjs),
// writes back two fields:
//   palette  the model's own colours, k hex codes (most common first)
//   ci       per drone, base64 Uint8: index into `palette`
// The formation's config (scans/index.ts, sketchfab.ts) may replace the
// palette with LED-friendly hex codes of its own; `ci` says which drones
// take which colour.
//
// The formation's points were made with orientation options that were not
// recorded, so this script FINDS the alignment: it tries the 24 right-angle
// orientations, refines each with a few rounds of ICP (rotation, scale,
// shift) and keeps the best fit. The fit error is printed; above ~2% of
// the figure's height, look at the preview before trusting the colours.

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [, , input, id, ...rest] = process.argv;
if (!input || !id) {
  console.error("usage: scan-colors.mjs <in.glb> <id> [--k 5] [--only a,b]");
  process.exit(1);
}
const opt = (name, def) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : def;
};
const K = Number(opt("k", 5));
const ONLY = opt("only", "") ? opt("only", "").split(",") : null;
const SAMPLES = 60000;

const jsonPath = join(import.meta.dirname, "..", "src", "lib", "cultural", "scans", `${id}.json`);
const scan = JSON.parse(readFileSync(jsonPath, "utf8"));
const pb = Buffer.from(scan.pos, "base64");
const posQ = new Int16Array(pb.buffer, pb.byteOffset, pb.byteLength / 2);
const P = Float64Array.from(posQ, (v) => v * scan.quant);
const NP = scan.count;

// ------------------------------------------------------------ read the GLB
await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder });
const doc = await io.read(input);

const imageCache = new Map();
async function decodeTexture(tex) {
  if (!tex) return null;
  if (imageCache.has(tex)) return imageCache.get(tex);
  const { data, info } = await sharp(Buffer.from(tex.getImage())).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const img = { data, w: info.width, h: info.height };
  imageCache.set(tex, img);
  return img;
}
async function materialSampler(mat) {
  if (!mat) return { factor: [1, 1, 1], img: null };
  const sg = mat.getExtension("KHR_materials_pbrSpecularGlossiness");
  const tex = mat.getBaseColorTexture() ?? sg?.getDiffuseTexture() ?? null;
  const factor = (sg && !mat.getBaseColorTexture() ? sg.getDiffuseFactor() : mat.getBaseColorFactor()).slice(0, 3);
  return { factor, img: await decodeTexture(tex) };
}
const lin2srgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

const tris = []; // [a, b, c, uvA, uvB, uvC, colA, colB, colC, sampler]
const mul = (m, p) => [
  m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
  m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
  m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
];
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  if (ONLY && !ONLY.some((o) => (o.endsWith("*") ? node.getName().startsWith(o.slice(0, -1)) : node.getName() === o))) continue;
  const m = node.getWorldMatrix();
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute("POSITION");
    if (!pos) continue;
    const uv = prim.getAttribute("TEXCOORD_0");
    const vc = prim.getAttribute("COLOR_0");
    const sampler = await materialSampler(prim.getMaterial());
    const idx = prim.getIndices();
    const count = idx ? idx.getCount() : pos.getCount();
    const at = (k) => (idx ? idx.getScalar(k) : k);
    for (let k = 0; k + 2 < count; k += 3) {
      const v = [at(k), at(k + 1), at(k + 2)];
      tris.push({
        p: v.map((i) => mul(m, pos.getElement(i, []))),
        uv: uv ? v.map((i) => uv.getElement(i, [])) : null,
        vc: vc ? v.map((i) => vc.getElement(i, [])) : null,
        s: sampler,
      });
    }
  }
}
if (!tris.length) throw new Error("no triangles");

// ------------------------------------------------- coloured surface samples
let seed = 7654321;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const cum = [];
let total = 0;
for (const t of tris) {
  const [a, b, c] = t.p;
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  total += Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]) / 2;
  cum.push(total);
}
const S = new Float64Array(SAMPLES * 3);
const SC = new Float32Array(SAMPLES * 3); // sRGB 0..1
for (let i = 0; i < SAMPLES; i++) {
  const r = rand() * total;
  let lo = 0, hi = cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < r) lo = mid + 1;
    else hi = mid;
  }
  const t = tris[lo];
  let p = rand(), q = rand();
  if (p + q > 1) { p = 1 - p; q = 1 - q; }
  const w = [1 - p - q, p, q];
  for (let k = 0; k < 3; k++) S[i * 3 + k] = w[0] * t.p[0][k] + w[1] * t.p[1][k] + w[2] * t.p[2][k];
  // Colour: texture (sRGB) x factor (linear -> sRGB) x vertex colour.
  let col = t.s.factor.map(lin2srgb);
  if (t.s.img && t.uv) {
    let u = w[0] * t.uv[0][0] + w[1] * t.uv[1][0] + w[2] * t.uv[2][0];
    let v = w[0] * t.uv[0][1] + w[1] * t.uv[1][1] + w[2] * t.uv[2][1];
    u -= Math.floor(u);
    v -= Math.floor(v);
    const { data, w: W, h: H } = t.s.img;
    const x = Math.min(W - 1, Math.floor(u * W)), y = Math.min(H - 1, Math.floor(v * H));
    const o = (y * W + x) * 3;
    col = [0, 1, 2].map((k) => (data[o + k] / 255) * col[k]);
  }
  if (t.vc) col = col.map((c, k) => c * lin2srgb(w[0] * t.vc[0][k] + w[1] * t.vc[1][k] + w[2] * t.vc[2][k]));
  SC.set(col, i * 3);
}

// ------------------------------------------------------- spatial hash (NN)
function makeGrid(pts, n, cell) {
  const map = new Map();
  const key = (x, y, z) => `${x},${y},${z}`;
  for (let i = 0; i < n; i++) {
    const k = key(Math.floor(pts[i * 3] / cell), Math.floor(pts[i * 3 + 1] / cell), Math.floor(pts[i * 3 + 2] / cell));
    let a = map.get(k);
    if (!a) map.set(k, (a = []));
    a.push(i);
  }
  /** Up to m nearest (index, d2), searching outward ring by ring. */
  return function near(x, y, z, m = 1) {
    const cx = Math.floor(x / cell), cy = Math.floor(y / cell), cz = Math.floor(z / cell);
    const best = [];
    for (let r = 0; r <= 6; r++) {
      for (let dx = -r; dx <= r; dx++)
        for (let dy = -r; dy <= r; dy++)
          for (let dz = -r; dz <= r; dz++) {
            if (Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz)) !== r) continue;
            const a = map.get(key(cx + dx, cy + dy, cz + dz));
            if (!a) continue;
            for (const i of a) {
              const d = (pts[i * 3] - x) ** 2 + (pts[i * 3 + 1] - y) ** 2 + (pts[i * 3 + 2] - z) ** 2;
              if (best.length < m) { best.push([i, d]); best.sort((p, q) => p[1] - q[1]); }
              else if (d < best[m - 1][1]) { best[m - 1] = [i, d]; best.sort((p, q) => p[1] - q[1]); }
            }
          }
      // Anything beyond this ring is at least r*cell away.
      if (best.length >= m && best[m - 1][1] <= (r * cell) ** 2) break;
    }
    // Nothing near: a capped penalty (only happens for a wrong orientation).
    while (best.length < m) best.push([best.length ? best[0][0] : 0, (7 * cell) ** 2]);
    return best;
  };
}

// ------------------------------------------------------------- alignment
const H = scan.height;
const CELL = H / 30;

/** Best rotation for paired points (Horn's quaternion method). */
function horn(A, B, n, wts) {
  // Centroids.
  const ca = [0, 0, 0], cb = [0, 0, 0];
  let W = 0;
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 3; k++) { ca[k] += A[i * 3 + k] * wts[i]; cb[k] += B[i * 3 + k] * wts[i]; }
    W += wts[i];
  }
  for (let k = 0; k < 3; k++) { ca[k] /= W; cb[k] /= W; }
  const M = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  let va = 0, vb = 0;
  for (let i = 0; i < n; i++) {
    const a = [A[i * 3] - ca[0], A[i * 3 + 1] - ca[1], A[i * 3 + 2] - ca[2]];
    const b = [B[i * 3] - cb[0], B[i * 3 + 1] - cb[1], B[i * 3 + 2] - cb[2]];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) M[r][c] += wts[i] * a[r] * b[c];
    va += wts[i] * (a[0] ** 2 + a[1] ** 2 + a[2] ** 2);
    vb += wts[i] * (b[0] ** 2 + b[1] ** 2 + b[2] ** 2);
  }
  const [[Sxx, Sxy, Sxz], [Syx, Syy, Syz], [Szx, Szy, Szz]] = M;
  const N = [
    [Sxx + Syy + Szz, Syz - Szy, Szx - Sxz, Sxy - Syx],
    [Syz - Szy, Sxx - Syy - Szz, Sxy + Syx, Szx + Sxz],
    [Szx - Sxz, Sxy + Syx, -Sxx + Syy - Szz, Syz + Szy],
    [Sxy - Syx, Szx + Sxz, Syz + Szy, -Sxx - Syy + Szz],
  ];
  const shift = Math.abs(Sxx) + Math.abs(Syy) + Math.abs(Szz) + Math.abs(Sxy) + Math.abs(Sxz) + Math.abs(Syx) + Math.abs(Syz) + Math.abs(Szx) + Math.abs(Szy) + 1e-9;
  let q = [1, 0.1, 0.1, 0.1];
  for (let it = 0; it < 200; it++) {
    const nq = [0, 1, 2, 3].map((r) => N[r].reduce((s, v, c) => s + v * q[c], 0) + shift * q[r]);
    const l = Math.hypot(...nq);
    q = nq.map((v) => v / l);
  }
  const [w, x, y, z] = q;
  const R = [
    [w * w + x * x - y * y - z * z, 2 * (x * y - w * z), 2 * (x * z + w * y)],
    [2 * (x * y + w * z), w * w - x * x + y * y - z * z, 2 * (y * z - w * x)],
    [2 * (x * z - w * y), 2 * (y * z + w * x), w * w - x * x - y * y + z * z],
  ];
  const s = Math.sqrt(vb / va);
  return { R, s, ca, cb };
}

const apply = (R, s, t, src, dst, n) => {
  for (let i = 0; i < n; i++) {
    const x = src[i * 3], y = src[i * 3 + 1], z = src[i * 3 + 2];
    for (let r = 0; r < 3; r++) dst[i * 3 + r] = s * (R[r][0] * x + R[r][1] * y + R[r][2] * z) + t[r];
  }
};

// The 24 proper right-angle rotations.
const ROTS = [];
{
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  for (const p of perms)
    for (const sx of [1, -1]) for (const sy of [1, -1]) for (const sz of [1, -1]) {
      const R = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
      R[0][p[0]] = sx; R[1][p[1]] = sy; R[2][p[2]] = sz;
      const det = R[0][0] * (R[1][1] * R[2][2] - R[1][2] * R[2][1]) - R[0][1] * (R[1][0] * R[2][2] - R[1][2] * R[2][0]) + R[0][2] * (R[1][0] * R[2][1] - R[1][1] * R[2][0]);
      if (det > 0) ROTS.push(R);
    }
}

const T = new Float64Array(SAMPLES * 3);
function fit(R0) {
  // Initial: rotate, then normalise like the converter (base y=0, centred
  // x/z, height H).
  apply(R0, 1, [0, 0, 0], S, T, SAMPLES);
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < SAMPLES; i++) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], T[i * 3 + k]); hi[k] = Math.max(hi[k], T[i * 3 + k]); }
  const s0 = H / (hi[1] - lo[1]);
  let R = R0, s = s0, t = [-(lo[0] + hi[0]) / 2 * s0, -lo[1] * s0, -(lo[2] + hi[2]) / 2 * s0];
  const pairsA = new Float64Array(NP * 3), pairsB = new Float64Array(NP * 3), wts = new Float64Array(NP);
  let err = Infinity;
  for (let it = 0; it < 18; it++) {
    apply(R, s, t, S, T, SAMPLES);
    const near = makeGrid(T, SAMPLES, CELL);
    const ds = [];
    for (let i = 0; i < NP; i++) {
      const [[j, d]] = near(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]);
      pairsA.set(S.subarray(j * 3, j * 3 + 3), i * 3);
      pairsB.set(P.subarray(i * 3, i * 3 + 3), i * 3);
      ds.push(Math.sqrt(d));
    }
    const sorted = [...ds].sort((a, b) => a - b);
    err = sorted.reduce((a, b) => a + b, 0) / NP / H;
    const cut = sorted[Math.floor(NP * 0.85)];
    for (let i = 0; i < NP; i++) wts[i] = ds[i] <= cut ? 1 : 0.05;
    // Fit original-sample -> formation directly: q = s R p + t.
    const h = horn(pairsA, pairsB, NP, wts);
    R = h.R;
    s = h.s;
    t = [0, 1, 2].map((r) => h.cb[r] - s * (R[r][0] * h.ca[0] + R[r][1] * h.ca[1] + R[r][2] * h.ca[2]));
  }
  return { R, s, t, err };
}

let best = null;
const firstPass = ROTS.map((R0) => ({ R0, ...fitQuick(R0) })).sort((a, b) => a.err - b.err);
function fitQuick(R0) {
  // A cheap 3-iteration fit to rank the 24 starts.
  apply(R0, 1, [0, 0, 0], S, T, SAMPLES);
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < SAMPLES; i++) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], T[i * 3 + k]); hi[k] = Math.max(hi[k], T[i * 3 + k]); }
  const s0 = H / (hi[1] - lo[1]);
  const t0 = [-(lo[0] + hi[0]) / 2 * s0, -lo[1] * s0, -(lo[2] + hi[2]) / 2 * s0];
  apply(R0, s0, t0, S, T, SAMPLES);
  const near = makeGrid(T, SAMPLES, CELL);
  let e = 0;
  for (let i = 0; i < NP; i += 4) e += Math.sqrt(near(P[i * 3], P[i * 3 + 1], P[i * 3 + 2])[0][1]);
  return { err: e / (NP / 4) / H };
}
for (const c of firstPass.slice(0, 6)) {
  const r = fit(c.R0);
  if (!best || r.err < best.err) best = r;
}
apply(best.R, best.s, best.t, S, T, SAMPLES);

// ------------------------------------------------- colour at every drone
const near = makeGrid(T, SAMPLES, CELL);
const C = new Float64Array(NP * 3);
for (let i = 0; i < NP; i++) {
  const nb = near(P[i * 3], P[i * 3 + 1], P[i * 3 + 2], 8);
  for (const [j] of nb) for (let k = 0; k < 3; k++) C[i * 3 + k] += SC[j * 3 + k] / nb.length;
}

// ------------------------------------------- k-means palette (deterministic)
const k = Math.min(K, NP);
const cent = [];
cent.push([C[0], C[1], C[2]]);
while (cent.length < k) {
  // k-means++ (farthest-first, deterministic).
  let bi = 0, bd = -1;
  for (let i = 0; i < NP; i++) {
    let d = Infinity;
    for (const c of cent) d = Math.min(d, (C[i * 3] - c[0]) ** 2 + (C[i * 3 + 1] - c[1]) ** 2 + (C[i * 3 + 2] - c[2]) ** 2);
    if (d > bd) { bd = d; bi = i; }
  }
  if (bd < 1e-4) break;
  cent.push([C[bi * 3], C[bi * 3 + 1], C[bi * 3 + 2]]);
}
const ci = new Uint8Array(NP);
for (let it = 0; it < 30; it++) {
  const sum = cent.map(() => [0, 0, 0, 0]);
  for (let i = 0; i < NP; i++) {
    let bj = 0, bd = Infinity;
    cent.forEach((c, j) => {
      const d = (C[i * 3] - c[0]) ** 2 + (C[i * 3 + 1] - c[1]) ** 2 + (C[i * 3 + 2] - c[2]) ** 2;
      if (d < bd) { bd = d; bj = j; }
    });
    ci[i] = bj;
    for (let q = 0; q < 3; q++) sum[bj][q] += C[i * 3 + q];
    sum[bj][3]++;
  }
  sum.forEach((s, j) => { if (s[3]) cent[j] = [s[0] / s[3], s[1] / s[3], s[2] / s[3]]; });
}
// Most common first.
const counts = cent.map((_, j) => ci.reduce((a, v) => a + (v === j ? 1 : 0), 0));
const order = cent.map((_, j) => j).sort((a, b) => counts[b] - counts[a]).filter((j) => counts[j] > 0);
const remap = new Uint8Array(cent.length);
order.forEach((j, r) => (remap[j] = r));
for (let i = 0; i < NP; i++) ci[i] = remap[ci[i]];
const toHex = (c) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, "0")).join("");
scan.palette = order.map((j) => toHex(cent[j]));
scan.ci = Buffer.from(ci).toString("base64");
writeFileSync(jsonPath, JSON.stringify(scan));
console.log(`${id}: fit ${(best.err * 100).toFixed(2)}% of height · palette ${scan.palette.join(" ")} · shares ${order.map((j) => Math.round((counts[j] / NP) * 100) + "%").join(" ")}`);
