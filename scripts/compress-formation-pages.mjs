#!/usr/bin/env node
// Formation pages' images (docs/seo/PLAN.md, P4), from the 5,000-drone
// renders of scripts/render-formations.ts (1440 x 648 canvas at SCALE=1):
//
//   npx vite-node scripts/render-formations.ts -- <site> <dir> 5000 all 2.5
//   node scripts/compress-formation-pages.mjs <dir>/5000
//
//   public/renders/f/<id>.webp   page still, 800 px wide (the figure and skyline)
//   public/renders/og/<id>.jpg   1200 x 630 share image (WhatsApp, X, LinkedIn)
//
// Every image gets the SAME crop (one camera, one fleet), so figures keep
// their true relative size. Crops are in 1440-px-wide pixels, scaled to the
// render's own width.

import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(process.argv[2] ?? "formation-renders/5000");
const STILL = { left: 370, top: 60, width: 700, height: 540 };
const OG = { left: 240, top: 93, width: 960, height: 504 };
mkdirSync(join(root, "public/renders/f"), { recursive: true });
mkdirSync(join(root, "public/renders/og"), { recursive: true });

const scaled = (box, k) => Object.fromEntries(Object.entries(box).map(([key, v]) => [key, Math.round(v * k)]));

for (const file of readdirSync(SRC).filter((f) => f.endsWith(".png"))) {
  const id = basename(file, ".png");
  const { width } = await sharp(join(SRC, file)).metadata();
  const k = width / 1440;
  const still = await sharp(join(SRC, file)).extract(scaled(STILL, k)).resize({ width: 800 }).webp({ quality: 80, effort: 6 })
    .toFile(join(root, "public/renders/f", `${id}.webp`));
  const og = await sharp(join(SRC, file)).extract(scaled(OG, k)).resize({ width: 1200, height: 630 }).jpeg({ quality: 82, mozjpeg: true })
    .toFile(join(root, "public/renders/og", `${id}.jpg`));
  console.log(`${id}  still ${(still.size / 1024).toFixed(0)} KB  og ${(og.size / 1024).toFixed(0)} KB`);
}
