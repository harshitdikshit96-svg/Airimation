#!/usr/bin/env node
// End-to-end checks against a running site, in the locally installed Chrome.
//
//   npm run build && npm run start      # or npm run dev
//   npm run test:e2e                    # default http://localhost:3000
//   npm run test:e2e -- http://localhost:3200
//
// What it guards (each rule is in DECISIONS.md):
//   - every page loads (200) with no uncaught errors; old URLs redirect
//   - no sideways scroll on a phone (390 px) or a laptop (1456 px)
//   - page headings line up with the header's left edge
//   - every inner page has the steady dusk backdrop; home has its live scene
//   - home: the 3D scene starts on load, before any scroll
//   - Design a Show: one flat formation list (no group headings), the LED
//     hues picker, a fleet change redraws the figure in place
//   - masked registration numbers, the harshitcreates.in credit, the
//     concept-render label
// Exits non-zero on any failure.

import { chromium } from "playwright-core";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const PAGES = ["/", "/shows", "/about", "/vision", "/team", "/contact", "/design-your-show", "/credits"];
const failures = [];
let passed = 0;

async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failures.push(`${name}: ${err.message}`);
    console.log(`  ✗ ${name}\n      ${err.message}`);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const browser = await chromium.launch({
  channel: "chrome",
  args: ["--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"],
});

async function open(path, width = 1456, height = 900) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const res = await page.goto(base + path, { waitUntil: "load" });
  return { page, res, errors };
}

console.log(`E2E against ${base}`);

for (const path of PAGES) {
  console.log(path);
  await check("loads with 200 and no uncaught errors", async () => {
    const { page, res, errors } = await open(path);
    await page.waitForTimeout(1500);
    assert(res.status() === 200, `status ${res.status()}`);
    assert(errors.length === 0, errors.join("; "));
    await page.close();
  });

  for (const width of [390, 1456]) {
    await check(`no sideways scroll at ${width}px`, async () => {
      const { page } = await open(path, width, 844);
      await page.waitForTimeout(800);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert(over <= 1, `page is ${over}px wider than the screen`);
      await page.close();
    });
  }

  await check("first heading lines up with the header", async () => {
    const { page } = await open(path);
    const [logo, h1] = await page.evaluate(() => [
      document.querySelector("header a")?.getBoundingClientRect().left ?? -1,
      document.querySelector("main h1")?.getBoundingClientRect().left ?? -1,
    ]);
    assert(Math.abs(logo - h1) <= 2, `logo at ${Math.round(logo)}px, h1 at ${Math.round(h1)}px`);
    await page.close();
  });

  await check(path === "/" ? "no static backdrop (home has its live scene)" : "steady dusk backdrop behind the page", async () => {
    const { page } = await open(path);
    const has = await page.evaluate(() => !!document.querySelector('img[src="/posters/backdrop.jpg"]'));
    assert(has === (path !== "/"), has ? "backdrop found on home" : "backdrop missing");
    await page.close();
  });

  await check("masked registration numbers and footer credit", async () => {
    const { page } = await open(path);
    const html = await page.content();
    assert(!/U82300UW2026PTC257648|09ABGCA5420J1ZN|CF-132G/.test(html), "full registration detail in the page");
    assert(/harshitcreates\.in/.test(html), "harshitcreates.in credit missing");
    await page.close();
  });
}

console.log("redirects");
for (const [from, to] of [["/biscope", "/shows"], ["/gallery", "/design-your-show"]]) {
  await check(`${from} → ${to}`, async () => {
    const { page } = await open(from);
    assert(new URL(page.url()).pathname === to, `landed on ${page.url()}`);
    await page.close();
  });
}

console.log("credits");
await check("/credits lists every credited model and is linked from the footer", async () => {
  const { page } = await open("/credits");
  const text = await page.textContent("main");
  for (const label of ["Diya", "Damru", "Dhanush-baan", "Dragon", "Ganesha", "Nataraja"]) assert(text.includes(label), `${label} missing`);
  assert(/CC BY 4\.0/.test(text), "CC BY credits missing");
  assert(await page.$('footer a[href="/credits"]'), "footer link missing");
  await page.close();
});

console.log("home");
await check("3D scene starts on load, before any scroll", async () => {
  const { page } = await open("/");
  await page.waitForSelector("canvas", { timeout: 10000 });
  assert((await page.evaluate(() => window.scrollY)) === 0, "page scrolled");
  await page.close();
});
await check("concept-render label shown", async () => {
  const { page } = await open("/");
  assert(/concept render/i.test(await page.textContent("body")), "label missing");
  await page.close();
});

console.log("design a show");
await check("flat formation list, LED hues, instant fleet change", async () => {
  const { page, errors } = await open("/design-your-show");
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForSelector('[role="tab"]', { timeout: 20000 });
  const body = await page.textContent("body");
  for (const old of ["Story & culture", "Sculptures — real 3D scans", "3D shapes"]) assert(!body.includes(old), `old heading "${old}"`);
  for (const gone of ["Mahadev", "Kamal"]) assert(!(await page.$(`[role="tab"]:text-is("${gone}")`)), `removed formation "${gone}" listed`);
  assert(!/Source: /.test(body), "model credit shown on Design a Show (it lives on /credits)");
  assert(await page.$('[role="radiogroup"][aria-label="LED hues"]'), "LED hues picker missing");
  const hues = await page.$$('[role="radio"]');
  assert(hues.length >= 4, `only ${hues.length} hue options`);
  await hues[1].click();
  assert((await hues[1].getAttribute("aria-checked")) === "true", "hue not selected");
  const before = await page.$$eval('[role="tab"]', (t) => t.length);
  await page.selectOption("#fleet", "2000");
  const after = await page.$$eval('[role="tab"]', (t) => t.length);
  assert(after > before, `fleet 2000 lists ${after} formations, was ${before}`);
  assert(/2,000 drones/.test(await page.textContent("body")), "caption did not update");
  assert(errors.length === 0, errors.join("; "));
  await page.close();
});

await browser.close();
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log(failures.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
