#!/usr/bin/env node
// Compress every GLB in assets/src/ into public/models/.
//
//   node scripts/compress-assets.mjs           # Meshopt + quantization
//   node scripts/compress-assets.mjs --ktx2    # also convert textures to KTX2
//
// Why Meshopt and not Draco by default: the Meshopt decoder is ~20 KB and
// ships inside three-stdlib; Draco's decoder is a ~300 KB wasm download
// the visitor pays before seeing anything. For untextured silhouette
// geometry like the skyline, Meshopt + quantization gets within a few KB of
// Draco anyway.
//
// --ktx2 needs the `toktx` binary (KTX-Software) on PATH and only matters
// for textured models; the Basis transcoder it implies is another ~200 KB
// at runtime, so it should be opted into per asset, not by default.
//
// Budget: the brief caps total GLB weight at ~1.5 MB. This script fails if
// the output exceeds it.

import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, quantize, weld, textureCompress } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import { readdirSync, statSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "assets/src");
const OUT = join(root, "public/models");
const BUDGET = 1.5 * 1024 * 1024;
const useKtx2 = process.argv.includes("--ktx2");

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });

mkdirSync(OUT, { recursive: true });
let total = 0;

for (const file of readdirSync(SRC).filter((f) => f.endsWith(".glb"))) {
  const doc = await io.read(join(SRC, file));
  const steps = [dedup(), weld(), prune(), quantize({ quantizePosition: 14, quantizeColor: 8 })];
  if (useKtx2) {
    const { toktx, Mode } = await import("@gltf-transform/cli");
    steps.push(toktx({ mode: Mode.ETC1S, quality: 128 }));
  } else {
    // WebP is decoded by the browser for free; fine for small textures.
    steps.push(textureCompress({ targetFormat: "webp" }));
  }
  steps.push(meshopt({ encoder: MeshoptEncoder, level: "high" }));
  await doc.transform(...steps);

  const out = join(OUT, file);
  await io.write(out, doc);
  const before = statSync(join(SRC, file)).size;
  const after = statSync(out).size;
  total += after;
  console.log(`${file}: ${(before / 1024).toFixed(0)} KB -> ${(after / 1024).toFixed(0)} KB`);
}

console.log(`total: ${(total / 1024).toFixed(0)} KB (budget ${(BUDGET / 1024).toFixed(0)} KB)`);
if (total > BUDGET) {
  console.error("Over the GLB budget.");
  process.exit(1);
}
