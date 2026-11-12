#!/usr/bin/env node
// One-off prep for the Dhanush-baan formation: the source model ("Bow &
// Arrow" by MOJackal, CC BY 4.0) ships the arrow lying beside the bow.
// This turns the arrow 90 degrees and nocks it on the string, in the
// bow's plane, then writes a new GLB for scan-to-formation.mjs.
//
//   node scripts/nock-arrow.mjs ../Scans/ccby_bow_arrow.glb ../Scans/ccby_bow_arrow_nocked.glb

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";

const [, , input, output] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);

// Arrow parts: shaft, head and fletching (Object_2..Object_9). The bow
// limb and string are Object_10..Object_13. The string runs along z at x~7.
const ARROW = new Set(["Object_2", "Object_3", "Object_4", "Object_5", "Object_6", "Object_7", "Object_8", "Object_9"]);
const STRING_X = 7;
const SHAFT_X = -14; // arrow shaft centre line (x) as shipped
const NOCK_Z = 84; // shaft end (z) as shipped

for (const node of doc.getRoot().listNodes()) {
  if (!ARROW.has(node.getName()) || !node.getMesh()) continue;
  const m = node.getWorldMatrix();
  for (const prim of node.getMesh().listPrimitives()) {
    const pos = prim.getAttribute("POSITION");
    for (let i = 0; i < pos.getCount(); i++) {
      const v = pos.getElement(i, []);
      const w = [0, 1, 2].map((k) => m[k] * v[0] + m[4 + k] * v[1] + m[8 + k] * v[2] + m[12 + k]);
      // Turn -90 degrees about y (head toward +x, through the bow), then
      // slide the nock onto the string and the shaft into the bow's plane.
      // Positions are written in world space; the node becomes identity.
      pos.setElement(i, [-w[2] + NOCK_Z + STRING_X, w[1], w[0] - SHAFT_X]);
    }
  }
  node.setTranslation([0, 0, 0]).setRotation([0, 0, 0, 1]).setScale([1, 1, 1]);
  // Re-parent to the scene root so no parent transform applies.
  for (const scene of doc.getRoot().listScenes()) {
    const parent = node.getParentNode();
    if (parent) {
      parent.removeChild(node);
      scene.addChild(node);
    }
  }
}
await io.write(output, doc);
console.log(`wrote ${output}`);
