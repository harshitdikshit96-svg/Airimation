import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CULTURAL } from "../cultural";
import { FORMATION_PAGES } from "../cultural/pages";
import { allFormationFacts, formationPath, relatedFormations } from "../cultural/facts";
import { clipFrame } from "../../components/gallery/recordClip";

// Formation pages, /design-your-show/<id> (docs/seo/PLAN.md §2).
const root = join(__dirname, "../../..");

describe("formation pages", () => {
  test("every library formation has a page, and every page is a real formation", () => {
    const ids = CULTURAL.map((f) => f.id).sort();
    expect(Object.keys(FORMATION_PAGES).sort()).toEqual(ids);
    expect(allFormationFacts().map((f) => f.id).sort()).toEqual(ids);
  });

  test("ids are URL-safe and never collide with the designer's own routes", () => {
    for (const f of allFormationFacts()) {
      expect(f.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(["s", "classic"]).not.toContain(f.id);
      expect(formationPath(f.id)).toBe(`/design-your-show/${f.id}`);
    }
  });

  test("copy is unique per page and substantial", () => {
    const facts = allFormationFacts();
    expect(new Set(facts.map((f) => f.heading)).size).toBe(facts.length);
    expect(new Set(facts.map((f) => f.about)).size).toBe(facts.length);
    for (const f of facts) {
      expect(f.heading).toMatch(/drone light show$/);
      expect(f.about.length, f.id).toBeGreaterThan(100);
      expect(f.about.length, f.id).toBeLessThan(420);
      expect(f.occasions.length, f.id).toBeGreaterThanOrEqual(2);
    }
  });

  test("copy claims no flown shows or clients (the company is pre-first-show)", () => {
    for (const f of allFormationFacts()) {
      const text = `${f.heading} ${f.about} ${f.occasions.join(" ")}`;
      expect(text, f.id).not.toMatch(/\b(we (have )?(flew|flown|performed|delivered)|our clients?|as seen at|trusted by)\b/i);
    }
  });

  test("the minimum fleet in the copy matches the library", () => {
    for (const f of allFormationFacts()) {
      const m = f.about.match(/(?:from|needs?) (?:just |only )?([\d,]+) drones/);
      if (m) expect(Number(m[1].replace(/,/g, "")), f.id).toBe(f.minDrones);
    }
  });

  test("every page has its still and its share image on disk", () => {
    for (const f of allFormationFacts()) {
      expect(existsSync(join(root, "public/renders/f", `${f.id}.webp`)), `${f.id}.webp`).toBe(true);
      expect(existsSync(join(root, "public/renders/og", `${f.id}.jpg`)), `${f.id}.jpg`).toBe(true);
    }
  });

  test("the copy module stays plain data (it ships to the browser)", () => {
    const src = readFileSync(join(root, "src/lib/cultural/pages.ts"), "utf8");
    expect(src).not.toMatch(/^import (?!type)/m);
  });

  test("related formations: same theme first, never itself", () => {
    const rel = relatedFormations("ganesha", 6);
    expect(rel).toHaveLength(6);
    expect(rel.map((f) => f.id)).not.toContain("ganesha");
    expect(rel[0].themeId).toBe(allFormationFacts().find((f) => f.id === "ganesha")!.themeId);
  });
});

describe("clip framing", () => {
  test("wide sky: cropped to 16:9, at most 1280 wide, even sizes", () => {
    const b = clipFrame(2184, 972);
    expect(b.sw / b.sh).toBeCloseTo(16 / 9, 2);
    expect(b.width).toBeLessThanOrEqual(1280);
    expect(b.width % 2).toBe(0);
    expect(b.height % 2).toBe(0);
    expect(b.sx).toBeGreaterThan(0);
  });
  test("tall phone sky: cropped to 4:5 at most", () => {
    const b = clipFrame(780, 1300);
    expect(b.sw / b.sh).toBeCloseTo(4 / 5, 2);
    expect(b.sy).toBeGreaterThan(0);
  });
});
