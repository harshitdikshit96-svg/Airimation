#!/usr/bin/env node
// End-to-end checks against a running site, in the locally installed Chrome.
//
//   npm run build && npm run start      # or npm run dev
//   npm run test:e2e                    # default http://localhost:3000
//   npm run test:e2e -- http://localhost:3200
//
// What it guards (each rule is in DECISIONS.md):
//   - every page loads (200) with no uncaught errors; old URLs redirect
//   - phones (390 px) see only the phone gate (site hidden, not removed),
//     no sideways scroll; laptops (1456 px) see the site, never the gate
//   - hello@airimation.in is the only company email; /team also shows the team's own @airimation.in addresses
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

async function phoneGateCheck(path) {
  const { page } = await open(path, 390, 844);
  await page.waitForTimeout(800);
  const state = await page.evaluate(() => ({
    over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    bodyOverflow: getComputedStyle(document.body).overflowY,
    mainInHtml: (document.querySelector("main")?.textContent ?? "").trim().length > 0,
    mail: document.querySelector('.phone-gate a[href="mailto:hello@airimation.in"]')?.getBoundingClientRect().height ?? 0,
  }));
  assert(await page.isVisible(".phone-gate"), "phone gate not visible");
  assert(!(await page.isVisible("main")), "main content visible on a phone");
  assert(!(await page.isVisible("header")) && !(await page.isVisible("footer")), "header/footer visible on a phone");
  assert(state.mainInHtml, "main content missing from the HTML (should be hidden, not removed)");
  assert(state.over <= 1, `page is ${state.over}px wider than the screen`);
  assert(state.bodyOverflow === "hidden", `body scrolls (overflow ${state.bodyOverflow})`);
  assert(state.mail >= 44, `mail link is ${state.mail}px tall (< 44)`);
  assert(/bigger screen/i.test(await page.textContent(".phone-gate")), "gate message missing");
  await page.close();
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

  await check("no sideways scroll at 1456px, phone gate hidden", async () => {
    const { page } = await open(path, 1456, 844);
    await page.waitForTimeout(800);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(over <= 1, `page is ${over}px wider than the screen`);
    assert(!(await page.isVisible(".phone-gate")), "phone gate visible on a laptop");
    assert(await page.isVisible("main"), "main content hidden on a laptop");
    await page.close();
  });

  await check("at 390px: phone gate shown, site hidden but in the HTML, no sideways scroll", async () => {
    await phoneGateCheck(path);
  });

  await check("hello@ is the only company email (team addresses on /team only)", async () => {
    const { page } = await open(path);
    const found = new Set((await page.content()).match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g) ?? []);
    found.delete("you@example.com"); // the contact form's placeholder
    const team = path === "/team" ? ["harshit@airimation.in", "madhuri@airimation.in", "gaurav@airimation.in"] : [];
    assert([...found].every((e) => e === "hello@airimation.in" || team.includes(e)), `found ${[...found].join(", ")}`);
    await page.close();
  });

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

console.log("/internal");
await check("at 390px: phone gate shown, site hidden", async () => {
  await phoneGateCheck("/internal");
});
await check("at 1456px: light theme, no phone gate", async () => {
  const { page } = await open("/internal");
  assert(!(await page.isVisible(".phone-gate")), "phone gate visible on a laptop");
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector("main > div")).backgroundColor);
  assert(bg === "rgb(255, 240, 246)", `internal background is ${bg}`);
  await page.close();
});

console.log("phones");
await check("the gate plays the home scene; the hidden page starts no 3D of its own", async () => {
  const { page } = await open("/", 390, 844);
  await page.waitForSelector(".phone-gate canvas", { timeout: 15000 });
  await page.waitForTimeout(1500);
  const canvases = await page.evaluate(() => document.querySelectorAll("canvas").length);
  assert(canvases === 1, `${canvases} canvases on a phone (expected only the gate's)`);
  await page.close();
});
await check("reduced motion: the gate keeps the still poster", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  await page.goto(base + "/shows", { waitUntil: "load" });
  await page.waitForTimeout(3000);
  assert(!(await page.$(".phone-gate canvas")), "live scene started on reduced motion");
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector(".phone-gate-poster")).backgroundImage);
  assert(/home-portrait\.jpg/.test(bg), `poster is ${bg}`);
  await page.close();
});
await check("laptops never load the gate's scene or poster", async () => {
  const { page } = await open("/shows");
  const requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.waitForTimeout(4000);
  assert(!(await page.$(".phone-gate canvas")), "gate scene mounted on a laptop");
  const loaded = await page.evaluate(() => performance.getEntriesByType("resource").map((e) => e.name));
  assert(![...loaded, ...requests].some((u) => /home-portrait\.jpg/.test(u)), "phone poster fetched on a laptop");
  await page.close();
});

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
  for (const gone of ["Mahadev"]) assert(!(await page.$(`[role="tab"]:text-is("${gone}")`)), `removed formation "${gone}" listed`);
  assert(!/Source: /.test(body), "model credit shown on Design a Show (it lives on /credits)");
  assert(await page.$('[role="radiogroup"][aria-label="LED hues"]'), "LED hues picker missing");
  const hues = await page.$$('[role="radio"]');
  assert(hues.length >= 4, `only ${hues.length} hue options`);
  await hues[1].click();
  assert((await hues[1].getAttribute("aria-checked")) === "true", "hue not selected");
  await page.selectOption("#fleet", "100");
  const before = await page.$$eval('[role="tab"]', (t) => t.length);
  await page.selectOption("#fleet", "5000");
  const after = await page.$$eval('[role="tab"]', (t) => t.length);
  assert(after > before, `fleet 5000 lists ${after} formations, was ${before}`);
  assert(/5,000 drones/.test(await page.textContent("body")), "caption did not update");
  assert(errors.length === 0, errors.join("; "));
  await page.close();
});

await check("hero: full-width sky first, controls below, then the heading", async () => {
  const { page, errors } = await open("/design-your-show");
  await page.waitForSelector("canvas", { timeout: 30000 });
  const r = await page.evaluate(() => {
    const c = document.querySelector("main canvas").getBoundingClientRect();
    const tabs = document.querySelector('[role="tablist"]')?.getBoundingClientRect().top ?? -1;
    const h1 = document.querySelector("main h1").getBoundingClientRect().top;
    return { w: c.width, vw: document.documentElement.clientWidth, top: c.top, h: c.height, vh: innerHeight, tabs, h1 };
  });
  assert(Math.abs(r.w - r.vw) <= 1, `canvas ${r.w}px wide, viewport ${r.vw}px`);
  assert(r.top < 90 && r.h > r.vh * 0.8, `canvas top ${r.top}px, height ${r.h}px`);
  assert(r.tabs > r.top + r.h - 1 && r.h1 > r.tabs, "order should be sky, controls, heading");
  assert(errors.length === 0, errors.join("; "));
  await page.close();
});

await check("wheel over the sky scrolls the page; Ctrl+wheel zooms instead", async () => {
  const { page, errors } = await open("/design-your-show");
  await page.waitForSelector("main canvas", { timeout: 30000 });
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(600);
  const y1 = await page.evaluate(() => scrollY);
  assert(y1 > 200, `page did not scroll over the canvas (scrollY ${y1})`);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.keyboard.down("Control");
  await page.mouse.wheel(0, -300);
  await page.keyboard.up("Control");
  await page.waitForTimeout(400);
  assert((await page.evaluate(() => scrollY)) === 0, "Ctrl+wheel scrolled the page");
  assert(await page.$('button[aria-label="Zoom in"]'), "zoom buttons missing");
  assert(errors.length === 0, errors.join("; "));
  await page.close();
});

await browser.close();
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log(failures.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
