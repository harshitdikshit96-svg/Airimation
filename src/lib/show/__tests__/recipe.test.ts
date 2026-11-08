import { describe, expect, it } from "vitest";
import { decodeRecipe, defaultRecipe, encodeRecipe } from "../recipe";
import { generateShow } from "../generate";
import type { Recipe } from "../types";

const encodeRaw = (obj: unknown) =>
  Buffer.from(JSON.stringify(obj)).toString("base64url");

describe("share links", () => {
  it("round-trips a recipe", () => {
    const r: Recipe = { v: 1, d: 200, s: ["ring", "lotus", "heart"], t: "Aarav", p: "gold" };
    expect(decodeRecipe(encodeRecipe(r))).toEqual(r);
  });

  it("encodes deterministically", () => {
    const r = defaultRecipe();
    expect(encodeRecipe(r)).toBe(encodeRecipe({ ...r, s: [...r.s] }));
  });

  it("opens links from before palettes existed", () => {
    const legacy = encodeRaw({ v: 1, d: 100, s: ["ring", "globe", "spiral"] });
    expect(decodeRecipe(legacy)).toEqual({ v: 1, d: 100, s: ["ring", "globe", "spiral"] });
  });

  it("maps the retired 500-drone tier to 300", () => {
    const legacy = encodeRaw({ v: 1, d: 500, s: ["ring", "globe", "spiral"] });
    expect(decodeRecipe(legacy)?.d).toBe(300);
  });

  it("drops unknown palettes and formations instead of failing", () => {
    const raw = encodeRaw({ v: 1, d: 50, s: ["ring", "nope", "globe", "spiral"], p: "neon" });
    expect(decodeRecipe(raw)).toEqual({ v: 1, d: 50, s: ["ring", "globe", "spiral"] });
  });

  it("returns null for garbage, never throws", () => {
    expect(decodeRecipe("%%%not-base64")).toBeNull();
    expect(decodeRecipe(encodeRaw({ d: 7, s: [] }))).toBeNull();
    expect(decodeRecipe(null)).toBeNull();
  });
});

describe("show generation", () => {
  it("is byte-identical for the same recipe", () => {
    const r: Recipe = { v: 1, d: 300, s: ["ring", "lotus", "diya", "globe"] };
    const a = generateShow(r);
    const b = generateShow(r);
    expect(a.stages.length).toBe(b.stages.length);
    a.stages.forEach((s, i) => expect(Array.from(s.targets)).toEqual(Array.from(b.stages[i].targets)));
  });

  it("gives every stage exactly one target per drone", () => {
    for (const d of [50, 100, 200, 300] as const) {
      const plan = generateShow({ v: 1, d, s: ["ring", "spiral", "heart", "atom"] });
      for (const s of plan.stages) expect(s.targets.length).toBe(d * 3);
    }
  });
});

import { describeRecipe } from "../summary";

describe("summary", () => {
  it("describes a recipe for previews and quote requests", () => {
    const s = describeRecipe({ v: 1, d: 200, s: ["ring", "text", "heart"], t: "Aarav", p: "gold" });
    expect(s.line).toBe("200 drones · Ring → “Aarav” → Heart");
    expect(s.palette).toBe("Diwali gold");
  });
});
