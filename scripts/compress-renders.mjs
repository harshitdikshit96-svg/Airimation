#!/usr/bin/env node
// The home page's Design a Show stills: crop the renders from
// scripts/render-formations.ts into public/renders/<id>.webp.
//
//   SCALE=2 npx vite-node scripts/render-formations.ts -- <site> <dir> 5000 nandi,damru,auto-rickshaw,sitar,rose 2.5
//   node scripts/compress-renders.mjs <dir>/5000
//
// Every still gets the SAME crop: they share one camera (same fleet, same
// framing), so side by side the horizon and dusk sky run on unbroken and
// each figure keeps its true size. The crop is in 1440x900-viewport pixels,
// scaled to the render's own size.

import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(process.argv[2] ?? "formation-renders/5000");
const OUT = join(root, "public/renders");
const CROP = { left: 370, top: 190, width: 700, height: 540 }; // at 1x
const WIDTH = 1280;
mkdirSync(OUT, { recursive: true });

for (const file of readdirSync(SRC).filter((f) => f.endsWith(".png"))) {
  const img = sharp(join(SRC, file));
  const { width } = await img.metadata();
  const k = width / 1440;
  const box = Object.fromEntries(Object.entries(CROP).map(([key, v]) => [key, Math.round(v * k)]));
  const out = join(OUT, `${basename(file, ".png")}.webp`);
  const info = await img.extract(box).resize({ width: WIDTH }).webp({ quality: 82, effort: 6 }).toFile(out);
  console.log(`${basename(out)}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}
