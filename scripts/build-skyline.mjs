#!/usr/bin/env node
// Generates the skyline the drone show plays above, as a GLB.
//
//   node scripts/build-skyline.mjs            -> assets/src/skyline.glb (raw)
//   node scripts/compress-assets.mjs          -> public/models/skyline.glb
//
// Everything is procedural and seeded, so the output is identical on every
// run. It is written as a GLB (rather than built in the browser) so that a
// modelled replacement from an artist drops into the same slot and goes
// through the same compression step.
//
// Two named nodes:
//   "Ring" - a full circle of North-Indian city around the launch field,
//            480-1150m out, in three depth layers (configurator: orbitable)
//   "Ghat" - a riverfront strip facing +z: steps down to the water, tall
//            narrow houses and temple spires (home page)
// Each has two meshes: "<name>_Silhouette" (dark, unlit) and
// "<name>_Lights" (windows, string lights, diyas; vertex-coloured; the
// runtime pushes these into HDR so they bloom).

import { Document, NodeIO } from "@gltf-transform/core";
import { KHRMaterialsUnlit } from "@gltf-transform/extensions";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(root, "assets/src/skyline.glb");

// ---------------------------------------------------------------- random
let seed = 20261108;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const range = (a, b) => a + rand() * (b - a);
const pick = (arr) => arr[Math.floor(rand() * arr.length) % arr.length];

// ---------------------------------------------------------------- builder
class Builder {
  constructor() {
    this.pos = [];
    this.col = [];
  }
  /** Transform a local point by rotation about Y then translation. */
  static tx(p, frame) {
    const [x, y, z] = p;
    const c = Math.cos(frame.rot);
    const s = Math.sin(frame.rot);
    return [frame.x + x * c + z * s, frame.y + y, frame.z - x * s + z * c];
  }
  tri(a, b, c, frame, color) {
    for (const p of [a, b, c]) {
      this.pos.push(...Builder.tx(p, frame));
      if (color) this.col.push(...color);
    }
  }
  quad(a, b, c, d, frame, color) {
    this.tri(a, b, c, frame, color);
    this.tri(a, c, d, frame, color);
  }
  /** Axis-aligned (in frame) box from y0 to y1. */
  box(cx, cz, w, d, y0, y1, frame) {
    const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2;
    const p = (x, y, z) => [x, y, z];
    this.quad(p(x0, y0, z1), p(x1, y0, z1), p(x1, y1, z1), p(x0, y1, z1), frame); // front
    this.quad(p(x1, y0, z0), p(x0, y0, z0), p(x0, y1, z0), p(x1, y1, z0), frame); // back
    this.quad(p(x0, y0, z0), p(x0, y0, z1), p(x0, y1, z1), p(x0, y1, z0), frame);
    this.quad(p(x1, y0, z1), p(x1, y0, z0), p(x1, y1, z0), p(x1, y1, z1), frame);
    this.quad(p(x0, y1, z1), p(x1, y1, z1), p(x1, y1, z0), p(x0, y1, z0), frame); // top
  }
  /** Solid of revolution. profile: [[radius, y], ...] bottom to top. */
  lathe(cx, cz, profile, segments, frame, twist = 0) {
    for (let k = 0; k < profile.length - 1; k++) {
      const [r0, y0] = profile[k];
      const [r1, y1] = profile[k + 1];
      for (let s = 0; s < segments; s++) {
        const a0 = twist + (s / segments) * Math.PI * 2;
        const a1 = twist + ((s + 1) / segments) * Math.PI * 2;
        const P = (r, y, a) => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r];
        this.quad(P(r0, y0, a0), P(r0, y0, a1), P(r1, y1, a1), P(r1, y1, a0), frame);
      }
    }
  }
  /** A small light: a flat square facing +z in the frame (toward viewers). */
  light(x, y, z, size, color, frame, wide = 1) {
    const h = size / 2;
    const w = h * wide;
    this.quad([x - w, y - h, z], [x + w, y - h, z], [x + w, y + h, z], [x - w, y + h, z], frame, color);
  }
}

// ---------------------------------------------------------------- palette
const WARM = [1.0, 0.62, 0.26];
const AMBER = [1.0, 0.5, 0.16];
const CREAM = [1.0, 0.82, 0.55];
const COOL = [0.62, 0.78, 1.0];
const STRING = [WARM, CREAM, [1.0, 0.45, 0.55], [0.5, 1.0, 0.6], [0.55, 0.7, 1.0], WARM];

// ---------------------------------------------------------------- pieces
/** Flat-roofed house with parapet, optional water tank / chhatri. */
function house(sil, lit, frame, w, d, h, opts = {}) {
  sil.box(0, 0, w, d, 0, h, frame);
  sil.box(0, d / 2 - 0.25, w, 0.5, h, h + 1.0, frame); // front parapet
  if (rand() < 0.35) sil.lathe(range(-w / 3, w / 3), range(-d / 4, d / 4), [[1.4, h], [1.4, h + 2.2], [0.2, h + 2.6]], 8, frame);
  if (rand() < 0.12) {
    // chhatri: four posts would be invisible at this range — a cap on a drum reads.
    const cx = range(-w / 4, w / 4);
    sil.lathe(cx, 0, [[1.8, h + 1], [1.8, h + 3.2], [2.4, h + 3.4], [0.2, h + 5.4]], 8, frame);
  }
  // Windows on the face toward the audience (+z in frame).
  const floors = Math.max(1, Math.floor(h / 3.3));
  const cols = Math.max(1, Math.floor(w / 3.2));
  const litShare = opts.litShare ?? 0.18;
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      if (rand() > litShare) continue;
      const x = -w / 2 + (c + 0.5) * (w / cols);
      const y = 1.6 + f * 3.3;
      const tone = rand() < 0.08 ? COOL : rand() < 0.5 ? WARM : CREAM;
      lit.light(x, y, d / 2 + 0.05, 1.0, tone.map((v) => v * range(0.45, 0.9)), frame, 0.7);
    }
  }
  // Diwali string lights hanging from the parapet.
  if (rand() < (opts.stringShare ?? 0.6)) {
    const n = Math.floor(w / 0.9);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const sag = Math.sin(t * Math.PI) * 0.8;
      lit.light(-w / 2 + t * w, h + 0.6 - sag, d / 2 + 0.3, 0.32, pick(STRING), frame);
    }
    // Vertical drops at the corners, the way houses are lit for Diwali.
    if (rand() < 0.5) {
      for (const sx of [-1, 1]) {
        for (let y = h; y > 0.8; y -= 0.9) lit.light((sx * w) / 2, y, d / 2 + 0.3, 0.3, pick(STRING), frame);
      }
    }
  }
}

/** Nagara temple: plinth, mandapa with stepped roof, curvilinear shikhara. */
function temple(sil, lit, frame, scale) {
  const S = scale;
  sil.box(0, 0, 22 * S, 30 * S, 0, 2.2 * S, frame); // plinth
  // Mandapa in front (+z), with a stepped pyramidal roof.
  sil.box(0, 7 * S, 12 * S, 10 * S, 2.2 * S, 8 * S, frame);
  sil.lathe(0, 7 * S, [[8.6 * S, 8 * S], [7 * S, 9.5 * S], [5.6 * S, 10.2 * S], [4.2 * S, 11.8 * S], [2.4 * S, 12.6 * S], [0.3 * S, 14.5 * S]], 4, frame, Math.PI / 4);
  // Garbhagriha + shikhara behind it: a bulging, tapering spire.
  sil.box(0, -6 * S, 13 * S, 13 * S, 2.2 * S, 10 * S, frame);
  const prof = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    const r = 8.2 * S * (1 - Math.pow(t, 1.7)) * (1 + 0.12 * Math.sin(t * Math.PI));
    prof.push([Math.max(r, 1.4 * S), 10 * S + t * 26 * S]);
  }
  sil.lathe(0, -6 * S, prof, 8, frame, Math.PI / 8);
  // Amalaka (ribbed disc), kalash and flag pole.
  sil.lathe(0, -6 * S, [[1.6 * S, 36 * S], [2.8 * S, 36.8 * S], [2.8 * S, 37.6 * S], [1.2 * S, 38.4 * S], [0.9 * S, 40.2 * S], [0.1 * S, 41.4 * S]], 10, frame);
  sil.box(0, -6 * S, 0.25, 0.25, 41 * S, 47 * S, frame);
  // Temple lamps: rows of diyas along the plinth edge and the mandapa.
  for (let x = -10 * S; x <= 10 * S; x += 0.9) lit.light(x, 2.4 * S, 15 * S + 0.1, 0.42, AMBER, frame);
  for (let x = -5.5 * S; x <= 5.5 * S; x += 0.7) lit.light(x, 8.3 * S, 12 * S + 0.1, 0.38, WARM, frame);
  // String lights running down the spire's front ridge.
  for (let i = 0; i < prof.length - 1; i++) {
    const [r, y] = prof[i];
    lit.light(0, y, -6 * S + r + 0.2, 0.42, pick(STRING), frame);
  }
}

/** Domed monument: drum, onion dome, four minarets. */
function domed(sil, lit, frame, scale) {
  const S = scale;
  sil.box(0, 0, 34 * S, 34 * S, 0, 12 * S, frame);
  sil.lathe(0, 0, [[9 * S, 12 * S], [9 * S, 16 * S]], 16, frame);
  const onion = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const r = 9 * S * (Math.sin(Math.PI * (0.18 + t * 0.82)) * (1.15 - t * 0.55));
    onion.push([Math.max(r, 0.15), 16 * S + t * 16 * S]);
  }
  sil.lathe(0, 0, onion, 16, frame);
  sil.box(0, 0, 0.3, 0.3, 32 * S, 37 * S, frame);
  for (const [mx, mz] of [[-15, 15], [15, 15], [-15, -15], [15, -15]]) {
    sil.lathe(mx * S, mz * S, [[1.6 * S, 0], [1.4 * S, 26 * S], [2.1 * S, 26.4 * S], [2.1 * S, 27.4 * S], [1.6 * S, 28 * S], [0.1 * S, 31 * S]], 8, frame);
    for (let y = 2; y < 26 * S; y += 1.2) lit.light(mx * S, y, mz * S + 1.7 * S, 0.34, CREAM, frame);
  }
  for (let x = -16 * S; x <= 16 * S; x += 1) lit.light(x, 12.4 * S, 17 * S + 0.1, 0.36, WARM, frame);
}

function tree(sil, frame, h) {
  sil.lathe(0, 0, [[0.5, 0], [0.4, h * 0.45]], 5, frame);
  const r = h * range(0.28, 0.38);
  const c = h * 0.45 + r * 0.8;
  sil.lathe(0, 0, [[0.4, c - r * 0.9], [r * 0.85, c - r * 0.45], [r, c], [r * 0.8, c + r * 0.5], [0.3, c + r * 0.95]], 7, frame, rand());
}

// ---------------------------------------------------------------- ring
function buildRing() {
  const sil = new Builder();
  const lit = new Builder();
  const layers = [
    { r0: 470, r1: 560, count: 260, kind: "near" },
    { r0: 640, r1: 860, count: 380, kind: "mid" },
    { r0: 920, r1: 1150, count: 240, kind: "far" },
  ];
  for (const layer of layers) {
    for (let i = 0; i < layer.count; i++) {
      const angle = (i / layer.count) * Math.PI * 2 + range(-0.01, 0.01);
      const r = range(layer.r0, layer.r1);
      // Face the launch field: +z in the frame points at the origin.
      const frame = { x: Math.cos(angle) * r, y: 0, z: Math.sin(angle) * r, rot: Math.atan2(-Math.cos(angle), -Math.sin(angle)) };
      const roll = rand();
      if (layer.kind === "near") {
        if (roll < 0.6) tree(sil, frame, range(9, 22));
        else house(sil, lit, frame, range(8, 16), range(8, 12), range(5, 11), { litShare: 0.25 });
      } else if (layer.kind === "mid") {
        if (roll < 0.06) temple(sil, lit, frame, range(0.8, 1.15));
        else if (roll < 0.08) domed(sil, lit, frame, range(0.8, 1.1));
        else if (roll < 0.28) tree(sil, frame, range(10, 20));
        else house(sil, lit, frame, range(10, 22), range(10, 18), range(7, 18));
      } else {
        if (roll < 0.08) temple(sil, lit, frame, range(1.1, 1.5));
        else if (roll < 0.11) domed(sil, lit, frame, range(1.1, 1.4));
        else house(sil, lit, frame, range(14, 30), range(12, 22), range(10, 28), { litShare: 0.1, stringShare: 0.25 });
      }
    }
  }
  return { sil, lit };
}

// ---------------------------------------------------------------- ghat
/** Riverfront along x, facing +z. Water line at y = 0, z = 0. */
function buildGhat() {
  const sil = new Builder();
  const lit = new Builder();
  const front = { x: 0, y: 0, z: 0, rot: 0 };

  // Steps: 14 treads climbing back from the water to the bund.
  const STEPS = 14;
  for (let s = 0; s < STEPS; s++) {
    sil.box(0, -s * 1.3 - 0.65, 900, 1.3, -1.5, 0.5 + s * 0.55, front);
    // Diyas along every third tread, and boatmen's lamps near the water.
    if (s % 3 === 1) {
      for (let x = -440; x <= 440; x += range(1.4, 3.2)) {
        if (rand() < 0.55) lit.light(x, 0.5 + s * 0.55 + 0.15, -s * 1.3 + 0.05, 0.3, rand() < 0.8 ? AMBER : WARM, front);
      }
    }
  }
  const bundZ = -STEPS * 1.3;
  const bundY = 0.5 + STEPS * 0.55;
  // Umbrellas (chhatris of the ghat priests) dotted on the steps.
  for (let i = 0; i < 70; i++) {
    const x = range(-430, 430);
    const s = Math.floor(range(2, STEPS - 2));
    const y = 0.5 + s * 0.55;
    sil.lathe(x, -s * 1.3, [[0.08, y], [0.08, y + 2.4], [2.2, y + 2.3], [0.1, y + 3.1]], 8, front);
  }

  // Building front: tall, narrow, jostling houses, temples between them.
  let x = -450;
  while (x < 450) {
    const roll = rand();
    if (roll < 0.14) {
      const s = range(0.75, 1.05);
      temple(sil, lit, { x: x + 12 * s, y: bundY, z: bundZ - 18 * s, rot: 0 }, s);
      x += 26 * s;
    } else if (roll < 0.18) {
      const s = range(0.7, 0.9);
      domed(sil, lit, { x: x + 18 * s, y: bundY, z: bundZ - 22 * s, rot: 0 }, s);
      x += 38 * s;
    } else {
      const w = range(7, 15);
      const h = range(10, 30);
      const d = range(9, 14);
      house(sil, lit, { x: x + w / 2, y: bundY, z: bundZ - d / 2 - range(0, 3), rot: 0 }, w, d, h, { litShare: 0.28, stringShare: 0.75 });
      x += w + range(0, 1.5);
    }
  }
  // A second, taller row behind, mostly silhouette.
  for (let x2 = -480; x2 < 480; ) {
    const w = range(10, 22);
    house(sil, lit, { x: x2 + w / 2, y: bundY, z: bundZ - range(28, 45), rot: 0 }, w, range(10, 16), range(22, 44), { litShare: 0.1, stringShare: 0.15 });
    x2 += w + range(1, 6);
  }
  return { sil, lit };
}

// ---------------------------------------------------------------- write
function addMesh(doc, buffer, name, builder, material) {
  const prim = doc.createPrimitive().setMaterial(material);
  prim.setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(new Float32Array(builder.pos)).setBuffer(buffer));
  if (builder.col.length) {
    prim.setAttribute("COLOR_0", doc.createAccessor().setType("VEC3").setArray(new Float32Array(builder.col)).setBuffer(buffer));
  }
  return doc.createMesh(name).addPrimitive(prim);
}

const doc = new Document();
const buffer = doc.createBuffer();
const unlit = doc.createExtension(KHRMaterialsUnlit);
const silMat = doc.createMaterial("Silhouette").setBaseColorFactor([0.022, 0.018, 0.03, 1]).setDoubleSided(true).setExtension("KHR_materials_unlit", unlit.createUnlit());
const litMat = doc.createMaterial("Lights").setBaseColorFactor([1, 1, 1, 1]).setDoubleSided(true).setExtension("KHR_materials_unlit", unlit.createUnlit());

const scene = doc.createScene("Skyline");
for (const [name, built] of [["Ring", buildRing()], ["Ghat", buildGhat()]]) {
  const node = doc.createNode(name);
  node.addChild(doc.createNode(`${name}_Silhouette`).setMesh(addMesh(doc, buffer, `${name}_Silhouette`, built.sil, silMat)));
  node.addChild(doc.createNode(`${name}_Lights`).setMesh(addMesh(doc, buffer, `${name}_Lights`, built.lit, litMat)));
  scene.addChild(node);
  console.log(`${name}: ${built.sil.pos.length / 9} silhouette tris, ${built.lit.pos.length / 18} lights`);
}

mkdirSync(dirname(OUT), { recursive: true });
await new NodeIO().registerExtensions([KHRMaterialsUnlit]).write(OUT, doc);
console.log(`wrote ${OUT}`);
