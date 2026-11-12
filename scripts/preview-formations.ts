// Contact sheets of every Design a Show formation, to check colours and
// shading by eye before they go on the site.
//
//   npx vite-node scripts/preview-formations.ts -- <drones> [outDir] [ids,comma,separated] [t]
//   e.g. npx vite-node scripts/preview-formations.ts -- 100 ../Formations/previews
//
// <drones> is the fleet size, one of 100, 200, 500, 800, 1500, 2000 (the
// site's Fleet menu). It may also come second, after the folder; whichever
// argument is a number is the fleet. The folder's old sheets are deleted
// first, so every sheet in it is from this run.
//
// Only the formations the site offers at that fleet size, each drawn with
// exactly that many drones. Draws each (front view at show time t, default 0) as glowing
// dots on black, 12 per sheet, and screenshots the sheets with the local
// Chrome (playwright-core) into <outDir>/sheet-<k>.png. Dots are additive
// and sized like the site's drones, so a figure that reads here reads on
// the page.

import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { CULTURAL, SHOW_ALT, formationsFor, loadAll } from "../src/lib/cultural";

await loadAll();

const FLEETS = [100, 200, 500, 800, 1500, 2000];
const args = process.argv.slice(2).filter((a) => a !== "--");
// The fleet is whichever of the first two arguments is a number (people
// type it first); the other is the output folder.
const isNum = (a?: string) => a !== undefined && /^\d+$/.test(a);
const [fleetArg, outArg] = isNum(args[0]) ? [args[0], args[1]] : [args[1], args[0]];
const N = Number(fleetArg);
if (!FLEETS.includes(N)) {
  console.error(`Fleet size missing or not offered: "${fleetArg ?? ""}". Use one of ${FLEETS.join(", ")}.`);
  console.error("  npx vite-node scripts/preview-formations.ts -- <drones> [outDir] [ids] [t]");
  process.exit(1);
}
const OUT = resolve(outArg ?? "preview");
const ONLY = args[2] && args[2] !== "all" ? args[2].split(",") : null;
const T = Number(args[3] ?? 0);
mkdirSync(OUT, { recursive: true });
// Old sheets (another fleet size, another run) would sit beside the new ones.
for (const f of readdirSync(OUT)) if (/^sheet-\d+\.(png|html)$/.test(f)) rmSync(join(OUT, f));
console.log(`fleet ${N} drones -> ${OUT}`);

const toSrgb = (c: number) => {
  const v = Math.max(0, Math.min(1, c));
  return Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
};

type Fig = { id: string; label: string; n: number; pts: number[] };
const figs: Fig[] = [];
// Exactly what the site offers at this fleet size (Fleet menu): formations
// that need more drones than N are left out, and every figure is drawn with
// exactly N drones.
const offered = new Set(formationsFor(N).map((f) => f.id));
for (const f of CULTURAL) {
  if (ONLY && !ONLY.includes(f.id)) continue;
  if (!offered.has(f.id)) {
    console.log(`skip ${f.id}: needs ${f.minDrones} drones, fleet is ${N}`);
    continue;
  }
  const n = N;
  const rig = f.build(n);
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  f.pose(rig, T, pos, col);
  const pts: number[] = [];
  // Back to front, so near drones paint over far ones.
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => pos[a * 3 + 2] - pos[b * 3 + 2]);
  for (const i of order) {
    pts.push(+pos[i * 3].toFixed(2), +(pos[i * 3 + 1] - SHOW_ALT).toFixed(2), toSrgb(col[i * 3]), toSrgb(col[i * 3 + 1]), toSrgb(col[i * 3 + 2]));
  }
  if (pts.length / 5 !== N) throw new Error(`${f.id}: drew ${pts.length / 5} drones, expected ${N}`);
  figs.push({ id: f.id, label: f.label, n: pts.length / 5, pts });
}

const PER = 12;
const sheets = Math.ceil(figs.length / PER);
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1600, height: 1230 } });
for (let s = 0; s < sheets; s++) {
  const batch = figs.slice(s * PER, s * PER + PER);
  const html = `<!doctype html><body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(4,400px);font:12px monospace;color:#999">
${batch.map((f, k) => `<div><canvas id="c${k}" width="400" height="390"></canvas><div style="position:relative;top:-386px;left:6px">${f.label} (${f.id}) · ${f.n} drones</div></div>`).join("")}
<script>
const figs = ${JSON.stringify(batch.map((f) => f.pts))};
figs.forEach((p, k) => {
  const c = document.getElementById("c" + k).getContext("2d");
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < p.length; i += 5) { x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]); y0 = Math.min(y0, p[i+1]); y1 = Math.max(y1, p[i+1]); }
  const sc = 340 / Math.max(x1 - x0, y1 - y0, 1);
  c.globalCompositeOperation = "lighter";
  for (let i = 0; i < p.length; i += 5) {
    const x = 200 + (p[i] - (x0 + x1) / 2) * sc, y = 200 - (p[i+1] - (y0 + y1) / 2) * sc;
    const g = c.createRadialGradient(x, y, 0, x, y, 4);
    g.addColorStop(0, "rgba(" + p[i+2] + "," + p[i+3] + "," + p[i+4] + ",1)");
    g.addColorStop(0.35, "rgba(" + p[i+2] + "," + p[i+3] + "," + p[i+4] + ",0.55)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; c.fillRect(x - 4, y - 4, 8, 8);
  }
});
</script></body>`;
  const file = join(OUT, `sheet-${s}.html`);
  writeFileSync(file, html);
  await page.goto("file://" + file);
  await page.screenshot({ path: join(OUT, `sheet-${s}.png`) });
  console.log(join(OUT, `sheet-${s}.png`), batch.map((f) => `${f.id} (${f.n})`).join(", "));
}
await browser.close();
