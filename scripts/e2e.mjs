#!/usr/bin/env node
// End-to-end checks against a running site, in the locally installed Chrome.
//
//   npm run build && npm run start      # or npm run dev
//   npm run test:e2e                    # default http://localhost:3000
//   npm run test:e2e -- http://localhost:3200
//
// What it guards (each rule is in DECISIONS.md):
//   - every page loads (200) with no uncaught errors; old URLs redirect
//   - phones (390 px) and laptops (1456 px) both see the site, no sideways
//     scroll (the phone gate was retired on 25 Nov 2026)
//   - hello@airimation.in is the only company email; /team also shows the team's own @airimation.in addresses
//   - page headings line up with the header's left edge
//   - every inner page has the steady dusk backdrop; home has its live scene
//   - home: the 3D scene starts on load, before any scroll; the Design a
//     Show strip sits in the page column, its arrows scroll it, each still
//     opens its formation (fleet and LED hues in the link)
//   - Design a Show: one flat formation list (no group headings), the LED
//     hues picker, a fleet change redraws the figure in place; every
//     control fits under the sky on the first screen, formations and hues
//     slide on one row each and "View all" opens the full list
//   - masked registration numbers, the harshitcreates.in credit, the
//     concept-render label
//   - formation pages (/design-your-show/<id>, docs/seo/PLAN.md): own H1,
//     canonical, share image and breadcrumbs; picking another formation
//     changes the address bar and the copy without loading a page (same
//     canvas, no document request); the hub's URL is untouched until the
//     visitor acts; Share (WhatsApp link, clip); unknown ids 404
// Exits non-zero on any failure.

import { chromium } from "playwright-core";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const PAGES = ["/", "/shows", "/about", "/vision", "/team", "/contact", "/design-your-show", "/design-your-show/ganesha", "/credits"];
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

async function phoneCheck(path) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + path, { waitUntil: "load" });
  await page.waitForTimeout(800);
  const state = await page.evaluate(() => ({
    over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    gate: !!document.querySelector(".phone-gate"),
    menu: document.querySelector('header button[aria-label="Open menu"]')?.getBoundingClientRect().height ?? 0,
  }));
  assert(await page.isVisible("header"), "header hidden on a phone");
  assert(await page.isVisible("main h1"), "page heading hidden on a phone");
  assert(await page.isVisible("footer"), "footer hidden on a phone");
  assert(!state.gate, "the retired phone gate is back");
  assert(state.over <= 1, `page is ${state.over}px wider than the screen`);
  assert(state.menu >= 44, `menu button is ${state.menu}px tall (< 44)`);
  assert(errors.length === 0, errors.join("; "));
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

  await check("no sideways scroll at 1456px", async () => {
    const { page } = await open(path, 1456, 844);
    await page.waitForTimeout(800);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(over <= 1, `page is ${over}px wider than the screen`);
    assert(await page.isVisible("main"), "main content hidden on a laptop");
    await page.close();
  });

  await check("at 390px: the site itself (header, heading, footer, menu), no sideways scroll", async () => {
    await phoneCheck(path);
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
await check("at 1456px: light theme", async () => {
  const { page } = await open("/internal");
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector("main > div")).backgroundColor);
  assert(bg === "rgb(255, 240, 246)", `internal background is ${bg}`);
  await page.close();
});

console.log("phones");
await check("home runs its live scene on a phone (one canvas)", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await page.goto(base + "/", { waitUntil: "load" });
  await page.waitForSelector("canvas", { timeout: 20000 });
  await page.waitForTimeout(1000);
  const canvases = await page.evaluate(() => document.querySelectorAll("canvas").length);
  assert(canvases === 1, `${canvases} canvases on the home page`);
  await page.close();
});
await check("Design a Show works on a phone: sky, then the dock, Share reachable", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + "/design-your-show/diya", { waitUntil: "load" });
  await page.waitForSelector("[data-formations] button", { timeout: 30000 });
  assert(await page.isVisible("button:has-text('Share')"), "Share button hidden");
  // Each rail shows its chips (they once shrank to 0 px beside the buttons),
  // and every dock control sits fully inside the screen.
  const rails = await page.$$eval('[data-formations], [role="radiogroup"][aria-label="LED hues"]', (els) =>
    els.map((el) => ({ w: el.getBoundingClientRect().width, chip: el.querySelector("button")?.getBoundingClientRect().width ?? 0 })),
  );
  assert(rails.length === 2 && rails.every((r) => r.w > 200 && r.chip > 40), `rails too narrow: ${JSON.stringify(rails)}`);
  // (Chips inside a rail may sit off-screen — the rail slides — so skip those.)
  const outside = await page.$$eval("#theme, #fleet, main button", (els) =>
    els
      .filter((el) => el.offsetParent !== null && !el.closest('[data-formations], [aria-label="LED hues"]'))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1);
      })
      .map((el) => el.id || el.getAttribute("aria-label") || el.textContent?.trim()),
  );
  assert(outside.length === 0, `controls cut off: ${outside.join(", ")}`);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(over <= 1, `page is ${over}px wider than the screen`);
  assert(errors.length === 0, errors.join("; "));
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
await check("Design a Show strip: inside the page column, arrows scroll it, stills open their formation", async () => {
  const { page, errors } = await open("/");
  const strip = page.locator('#design ul[aria-label="Formations from Design a Show"]');
  await strip.scrollIntoViewIfNeeded();
  const box = await strip.boundingBox();
  const head = await page.locator("#design h2").boundingBox();
  assert(Math.abs(box.x - head.x) < 2, `strip starts at ${box.x}, heading at ${head.x}`);
  assert(box.x + box.width <= 1456 - (1456 - 1100) / 2 + 2, "strip wider than the page column");
  const prev = page.locator('#design button[aria-label="Previous formation"]');
  const next = page.locator('#design button[aria-label="Next formation"]');
  assert(await prev.isDisabled(), "previous enabled at the start");
  await next.click();
  await page.waitForTimeout(900);
  assert((await strip.evaluate((el) => el.scrollLeft)) > 100, "next did not scroll the strip");
  assert(!(await prev.isDisabled()), "previous still disabled after scrolling");
  const hrefs = await page.$$eval("#design ul a", (as) => as.map((a) => a.getAttribute("href")));
  assert(hrefs.length >= 4 && hrefs.every((h) => /^\/design-your-show\/[a-z-]+\?fleet=5000&hues=[a-z]+$/.test(h)), hrefs.join(" "));
  const imgs = await page.$$eval("#design ul img", (els) => els.map((e) => e.alt.length));
  assert(imgs.every((n) => n > 20), "a still has no alt text");
  assert(errors.length === 0, errors.join("; "));
  await page.close();
});

console.log("design a show");
await check("flat formation list, LED hues, instant fleet change", async () => {
  const { page, errors } = await open("/design-your-show");
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForSelector('[data-formations] button', { timeout: 20000 });
  const body = await page.textContent("body");
  for (const old of ["Story & culture", "Sculptures — real 3D scans", "3D shapes"]) assert(!body.includes(old), `old heading "${old}"`);
  for (const gone of ["Mahadev"]) assert(!(await page.$(`[data-formations] button:text-is("${gone}")`)), `removed formation "${gone}" listed`);
  assert(!/Source: /.test(body), "model credit shown on Design a Show (it lives on /credits)");
  assert(await page.$('[role="radiogroup"][aria-label="LED hues"]'), "LED hues picker missing");
  const hues = await page.$$('[role="radio"]');
  assert(hues.length >= 4, `only ${hues.length} hue options`);
  await hues[1].click();
  assert((await hues[1].getAttribute("aria-checked")) === "true", "hue not selected");
  await page.selectOption("#fleet", "100");
  const before = await page.$$eval('[data-formations] button', (t) => t.length);
  await page.selectOption("#fleet", "5000");
  const after = await page.$$eval('[data-formations] button', (t) => t.length);
  assert(after > before, `fleet 5000 lists ${after} formations, was ${before}`);
  assert(/5,000 drones/.test(await page.textContent("body")), "caption did not update");
  assert(errors.length === 0, errors.join("; "));
  await page.close();
});

await check("hero: full-width sky first, every control on the first screen, then the heading", async () => {
  const { page, errors } = await open("/design-your-show");
  await page.waitForSelector("canvas", { timeout: 30000 });
  const r = await page.evaluate(() => {
    const c = document.querySelector("main canvas").getBoundingClientRect();
    const tabs = document.querySelector('[data-formations]')?.getBoundingClientRect().top ?? -1;
    const h1 = document.querySelector("main h1").getBoundingClientRect().top;
    const dock = document.querySelector('[aria-label="LED hues"]').getBoundingClientRect().bottom;
    return { w: c.width, vw: document.documentElement.clientWidth, top: c.top, h: c.height, vh: innerHeight, tabs, h1, dock };
  });
  assert(Math.abs(r.w - r.vw) <= 1, `canvas ${r.w}px wide, viewport ${r.vw}px`);
  assert(r.top < 90 && r.h > r.vh * 0.55, `canvas top ${r.top}px, height ${r.h}px`);
  assert(r.dock <= r.vh, `LED hues end at ${r.dock}px, below the ${r.vh}px first screen`);
  assert(r.tabs > r.top + r.h - 1 && r.h1 > r.tabs, "order should be sky, controls, heading");
  assert(errors.length === 0, errors.join("; "));
  await page.close();
});

await check("formation and LED hue rails: arrows slide them, View all opens the full list", async () => {
  const { page, errors } = await open("/design-your-show");
  await page.waitForSelector("[data-formations] button", { timeout: 30000 });
  const rail = "[data-formations]";
  const left = () => page.$eval(rail, (el) => el.scrollLeft);
  assert((await page.$eval(rail, (el) => el.scrollWidth > el.clientWidth + 10)), "formations fit on one row: no rail");
  await page.click('button[aria-label="Scroll Formation on"]');
  await page.waitForTimeout(800);
  assert((await left()) > 100, "next arrow did not slide the formations");
  const all = page.locator("button", { hasText: /^View all \d+$/ }).first();
  await all.click();
  assert((await page.$eval(rail, (el) => el.scrollWidth <= el.clientWidth + 1)), "View all left the list scrolling");
  assert((await page.$$('button[aria-expanded="true"]')).length === 1, "View all is not marked expanded");
  await page.click("button:has-text('Show fewer')");
  assert(await page.$('[role="radiogroup"][aria-label="LED hues"]'), "LED hues rail missing");
  assert(await page.$('button[aria-label="Scroll LED hues on"]'), "LED hues rail has no arrows");
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

console.log("formation pages");
await check("own H1, canonical, share image, breadcrumbs, still; listed on the hub", async () => {
  const { page, res } = await open("/design-your-show/ganesha");
  assert(res.status() === 200, `status ${res.status()}`);
  const meta = await page.evaluate(() => ({
    h1: document.querySelector("main h1")?.textContent,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
    og: document.querySelector('meta[property="og:image"]')?.getAttribute("content"),
    title: document.title,
    crumbs: [...document.querySelectorAll('script[type="application/ld+json"]')].some((s) => s.textContent.includes("BreadcrumbList")),
    still: !!document.querySelector('img[src*="renders%2Ff%2Fganesha.webp"], img[src*="/renders/f/ganesha.webp"]'),
  }));
  assert(meta.h1 === "Ganesha drone light show", `h1 "${meta.h1}"`);
  assert(meta.canonical === "https://airimation.in/design-your-show/ganesha", `canonical ${meta.canonical}`);
  assert(/\/renders\/og\/ganesha\.jpg$/.test(meta.og ?? ""), `og:image ${meta.og}`);
  assert(/^Ganesha drone light show/.test(meta.title), `title "${meta.title}"`);
  assert(meta.crumbs, "no BreadcrumbList");
  assert(meta.still, "no page still");
  await page.close();
  const hub = await open("/design-your-show");
  const links = await hub.page.$$eval('a[href^="/design-your-show/"]', (as) => new Set(as.map((a) => a.getAttribute("href"))).size);
  assert(links >= 50, `hub links to ${links} formation pages`);
  await hub.page.close();
});
await check("unknown formation is a 404", async () => {
  const { page, res } = await open("/design-your-show/not-a-formation");
  assert(res.status() === 404, `status ${res.status()}`);
  await page.close();
});
await check("picking a formation changes the URL and copy, never the page", async () => {
  const { page, errors } = await open("/design-your-show/ganesha");
  await page.waitForSelector("[data-formations] button", { timeout: 30000 });
  await page.waitForSelector("main canvas", { timeout: 30000 });
  await page.evaluate(() => (window.__sky = document.querySelector("main canvas")));
  const docs = [];
  page.on("request", (r) => r.resourceType() === "document" && docs.push(r.url()));
  await page.click('[data-formations] button:text-is("Nandi")');
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => ({
    path: location.pathname,
    search: location.search,
    same: window.__sky === document.querySelector("main canvas"),
    h1: document.querySelector("main h1")?.textContent,
    title: document.title,
  }));
  assert(after.path === "/design-your-show/nandi", `path ${after.path}`);
  assert(/fleet=\d+/.test(after.search) && /hues=/.test(after.search), `search ${after.search}`);
  assert(after.same, "the sky was re-created");
  assert(docs.length === 0, `loaded ${docs.join(", ")}`);
  assert(after.h1 === "Nandi drone light show", `h1 "${after.h1}"`);
  assert(/^Nandi drone light show/.test(after.title), `title "${after.title}"`);
  await page.selectOption("#fleet", "5000");
  await page.waitForTimeout(300);
  assert((await page.evaluate(() => location.search)).includes("fleet=5000"), "fleet not in the URL");
  assert(errors.length === 0, errors.join("; "));
  await page.close();
});
await check("hub: URL untouched on load; old ?formation= links still open their figure", async () => {
  const { page } = await open("/design-your-show");
  await page.waitForSelector("[data-formations] button", { timeout: 30000 });
  await page.waitForTimeout(500);
  assert((await page.evaluate(() => location.pathname + location.search)) === "/design-your-show", "URL changed on load");
  await page.close();
  const old = await open("/design-your-show?formation=damru&fleet=500");
  await old.page.waitForSelector("[data-formations] button[aria-pressed='true']", { timeout: 30000 });
  const pressed = await old.page.textContent("[data-formations] button[aria-pressed='true']");
  assert(/damru/i.test(pressed), `opened on ${pressed}`);
  await old.page.close();
});
await check("a formation that needs a bigger fleet opens at a fleet that flies it", async () => {
  const { page } = await open("/design-your-show/somaskanda?quality=low");
  await page.waitForSelector("[data-formations] button[aria-pressed='true']", { timeout: 30000 });
  assert(/somaskanda/i.test(await page.textContent("[data-formations] button[aria-pressed='true']")), "fell back to another figure");
  assert(Number(await page.inputValue("#fleet")) >= 1500, "fleet too small for Somaskanda");
  await page.close();
});
await check("Share: WhatsApp link to this show; a clip records and downloads", async () => {
  const { page, errors } = await open("/design-your-show/diya");
  await page.waitForSelector("main canvas", { timeout: 30000 });
  await page.click("button:has-text('Share')");
  const wa = await page.getAttribute('[data-share-menu] a[href^="https://wa.me/"]', "href");
  assert(decodeURIComponent(wa).includes("/design-your-show/diya?fleet="), `WhatsApp link ${wa}`);
  assert(/concept/i.test(decodeURIComponent(wa)), "share text doesn't say concept");
  const save = page.locator("[data-share-menu] button", { hasText: /Save a \d+-second clip/ });
  if (await save.count()) {
    await save.click();
    const link = page.locator('[data-share-menu] a[download]');
    await link.waitFor({ timeout: 25000 });
    const size = await page.evaluate(async () => (await (await fetch(document.querySelector("[data-share-menu] a[download]").href)).blob()).size);
    assert(size > 20000, `clip is ${size} bytes`);
  }
  assert(errors.length === 0, errors.join("; "));
  await page.close();
});

await browser.close();
console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log(failures.map((f) => `  - ${f}`).join("\n"));
  process.exit(1);
}
