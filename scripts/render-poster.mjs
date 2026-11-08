#!/usr/bin/env node
// Render the static poster frames shown before WebGL is ready (and kept
// when WebGL is unavailable), from the real scene, using the locally
// installed Google Chrome.
//
//   npm run dev            # or: npm run build && npm run start
//   node scripts/render-poster.mjs [baseUrl]   # default http://localhost:3000
//
// Writes public/posters/home.jpg, home-portrait.jpg and show.jpg.
// Re-run whenever the scene's look changes.

import { chromium } from "playwright-core";
import { statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const base = process.argv[2] ?? "http://localhost:3000";
const out = join(resolve(dirname(fileURLToPath(import.meta.url)), ".."), "public/posters");

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
});

// Hide every DOM layer so only the WebGL scene is captured.
const ONLY_CANVAS = `body * { visibility: hidden !important; } canvas { visibility: visible !important; }`;

async function home(width, height, file) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  // Beat 0: the fleet waiting on the launch field, matching the first live frame.
  await page.goto(`${base}/?swarmBeat=0&quality=high`, { waitUntil: "load" });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.waitForTimeout(6000);
  await page.addStyleTag({ content: ONLY_CANVAS });
  await page.screenshot({ path: join(out, file), type: "jpeg", quality: 74 });
  await page.close();
}

async function show() {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await page.goto(`${base}/design-your-show?quality=high`, { waitUntil: "load" });
  const canvas = await page.waitForSelector("canvas", { timeout: 30000 });
  // Ground hold (1.6s) + first assembly (4.2s): the ring is fully formed.
  await page.waitForTimeout(7400);
  await page.addStyleTag({ content: ONLY_CANVAS });
  await canvas.screenshot({ path: join(out, "show.jpg"), type: "jpeg", quality: 74 });
  await page.close();
}

await home(1600, 900, "home.jpg");
await home(720, 1280, "home-portrait.jpg");
await show();
await browser.close();

for (const f of ["home.jpg", "home-portrait.jpg", "show.jpg"]) {
  console.log(`${f}: ${(statSync(join(out, f)).size / 1024).toFixed(0)} KB`);
}
