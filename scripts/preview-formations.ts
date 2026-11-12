// Contact sheets of every Design a Show formation, to check colours and
// shading by eye before they go on the site.
//
//   npx vite-node scripts/preview-formations.ts -- <outDir> [drones] [ids,comma,separated] [t]
//
// Draws each formation (front view at show time t, default 0) as glowing
// dots on black, 12 per sheet, and screenshots the sheets with the local
// Chrome (playwright-core) into <outDir>/sheet-<k>.png. Dots are additive
// and sized like the site's drones, so a figure that reads here reads on
// the page.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium } from "playwright-core";
import { CULTURAL, SHOW_ALT } from "../src/lib/cultural";

const args = process.argv.slice(2).filter((a) => a !== "--");
const OUT = resolve(args[0] ?? "preview");
const N = Number(args[1] ?? 1500);
const ONLY = args[2] && args[2] !== "all" ? args[2].split(",") : null;
const T = Number(args[3] ?? 0);
mkdirSync(OUT, { recursive: true });

const toSrgb = (c: number) => {
  const v = Math.max(0, Math.min(1, c));
  return Math.round(255 * (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
};

type Fig = { id: string; label: string; pts: number[] };
const figs: Fig[] = [];
for (const f of CULTURAL) {
  if (ONLY && !ONLY.includes(f.id)) continue;
  const n = Math.max(N, f.minDrones);
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
  figs.push({ id: f.id, label: f.label, pts });
}

const PER = 12;
const sheets = Math.ceil(figs.length / PER);
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 1600, height: 1230 } });
for (let s = 0; s < sheets; s++) {
  const batch = figs.slice(s * PER, s * PER + PER);
  const html = `<!doctype html><body style="margin:0;background:#000;display:grid;grid-template-columns:repeat(4,400px);font:12px monospace;color:#999">
${batch.map((f, k) => `<div><canvas id="c${k}" width="400" height="390"></canvas><div style="position:relative;top:-386px;left:6px">${f.label} (${f.id})</div></div>`).join("")}
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
  console.log(join(OUT, `sheet-${s}.png`), batch.map((f) => f.id).join(", "));
}
await browser.close();
