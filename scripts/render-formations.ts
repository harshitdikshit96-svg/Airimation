// Pictures of the formations EXACTLY as the website renders them: the live
// Design a Show scene (sky, skyline, bloom, colour, fleet scaling, camera
// framing), screenshotted in Chrome — not a re-drawing.
//
//   npx vite-node scripts/render-formations.ts -- <siteUrl> <outDir> [fleet] [ids] [t]
//
//   siteUrl  a running site, e.g. http://localhost:3000 (npm run dev / start)
//   outDir   where the PNGs go: <outDir>/<fleet>/<id>.png
//   fleet    100, 500, 1500, 3000 or 5000 (default 500). Only the
//            formations the site offers at that fleet are rendered, each
//            with exactly that many drones — the Fleet menu's list.
//   ids      comma-separated formation ids, or "all" (default)
//   t        seconds into the animation (default 0), for effects mid-move
//   az       degrees to turn the camera round the figure (default 0: front)
//   SCALE=2 in the environment renders at twice the pixels (for crops)
//
// The home page's gallery stills (public/renders/) come from this script at
// 5,000 drones; see scripts/compress-renders.mjs.
//
// Each picture opens /design-your-show?formation=<id>&fleet=<n>&capture=1:
// the page skips the fly-in, frames the camera at once, hides its text, and
// signals when the figure is on screen. Forced to the high quality tier
// (bloom on), as on a good laptop; add QUALITY=mid or low to the
// environment to see a weaker machine's render.

import { mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { formationsFor } from "../src/lib/cultural";

const args = process.argv.slice(2).filter((a) => a !== "--");
const SITE = (args[0] ?? "http://localhost:3000").replace(/\/$/, "");
const FLEETS = [100, 500, 1500, 3000, 5000];
const FLEET = Number(args[2] ?? 500);
if (!FLEETS.includes(FLEET)) {
  console.error(`fleet must be one of ${FLEETS.join(", ")} (the site's Fleet menu)`);
  process.exit(1);
}
const OUT = resolve(args[1] ?? "formation-renders", String(FLEET));
const ONLY = args[3] && args[3] !== "all" ? args[3].split(",") : null;
const T = Number(args[4] ?? 0);
const AZ = Number(args[5] ?? 0);
const SCALE = Number(process.env.SCALE ?? 1);
const QUALITY = process.env.QUALITY ?? "high";
mkdirSync(OUT, { recursive: true });

const offered = formationsFor(FLEET);
if (ONLY) {
  for (const id of ONLY) if (!offered.some((f) => f.id === id)) console.log(`skip ${id}: not offered at ${FLEET} drones`);
}
const todo = offered.filter((f) => !ONLY || ONLY.includes(f.id));
console.log(`${todo.length} formations at ${FLEET} drones → ${OUT}`);

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const failed: string[] = [];

async function shoot(id: string) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: SCALE });
  try {
    const url = `${SITE}/design-your-show?formation=${id}&fleet=${FLEET}&capture=1&t=${T}&az=${AZ}&quality=${QUALITY}`;
    await page.goto(url, { waitUntil: "load" });
    const key = `${id}:${FLEET}`;
    await page.waitForFunction((k) => document.documentElement.dataset.showcaseFrame === k, key, { timeout: 90000 });
    await page.waitForTimeout(300);
    await page.locator("main canvas").first().screenshot({ path: join(OUT, `${id}.png`) });
    console.log(`  ${id}`);
  } catch (err) {
    failed.push(id);
    console.log(`  ${id} FAILED: ${(err as Error).message.split("\n")[0]}`);
  } finally {
    await page.close();
  }
}

// A few at a time: each page runs its own WebGL scene.
const queue = todo.map((f) => f.id);
await Promise.all(
  Array.from({ length: 3 }, async () => {
    for (let id = queue.shift(); id; id = queue.shift()) await shoot(id);
  })
);
await browser.close();
console.log(failed.length ? `done, ${failed.length} failed: ${failed.join(", ")}` : "done");
if (failed.length) process.exit(1);
