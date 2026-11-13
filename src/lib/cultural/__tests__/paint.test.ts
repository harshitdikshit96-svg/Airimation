// Per-drone colour: figures must show their features, not one flat colour.
import { describe, expect, test, beforeAll } from "vitest";
import { loadAll } from "..";

// Scanned models load on demand; tests need them all.
beforeAll(() => loadAll());
import files from "./scanFiles";
import { CULTURAL } from "..";
import { MIN_SAT, paintPoints, saturation, vivid } from "../scan";
import { hex } from "../kit";

const decode = (b64: string) => Uint8Array.from(Buffer.from(b64, "base64"));

describe("model colours (scripts/scan-colors.mjs)", () => {
  for (const [name, file] of Object.entries(files)) {
    if (!file.palette) continue;
    test(`${name}: palette indices valid`, () => {
      expect(file.ci).toBeTruthy();
      const ci = decode(file.ci!);
      expect(ci.length).toBe(file.count);
      for (const v of ci) expect(v).toBeLessThan(file.palette!.length);
      for (const h of file.palette!) expect(h).toMatch(/^#[0-9a-f]{6}$/);
    });
  }

  test("paintPoints: regions by position override, ramp follows brightness", () => {
    const pts = new Float32Array([0, 0, 0, 0, 10, 0]);
    const file = { height: 10, width: 1, depth: 1, count: 2 } as Parameters<typeof paintPoints>[0];
    const c = paintPoints(file, pts, 2, "#000000", { regions: [{ hex: "#ff0000", y: [0.9, 1] }] });
    expect(c[3]).toBeGreaterThan(0.9); // top drone red
    expect(c[0]).toBe(0); // bottom keeps the fallback
  });
});

describe("every scanned figure has more than one colour", () => {
  const scans = CULTURAL.filter((f) => f.credit);
  for (const f of scans) {
    test(`${f.id}: varied colour`, () => {
      const n = Math.max(500, f.minDrones);
      const rig = f.build(n);
      const pos = new Float32Array(n * 3);
      const col = new Float32Array(n * 3);
      f.pose(rig, 0, pos, col);
      // Hue/brightness spread: distinct colours after rounding.
      const seen = new Set<string>();
      for (let i = 0; i < n; i++) seen.add(`${Math.round(col[i * 3] * 8)},${Math.round(col[i * 3 + 1] * 8)},${Math.round(col[i * 3 + 2] * 8)}`);
      expect(seen.size).toBeGreaterThan(6);
    });
  }
});

describe("scans/manifest.ts (scripts/scan-manifest.mjs)", () => {
  test("matches every model file — re-run the script after converting a model", async () => {
    const { SCAN_SOURCES } = await import("../scans/manifest");
    const byId = Object.values(files);
    expect(Object.keys(SCAN_SOURCES).length).toBe(byId.length);
    for (const file of byId) {
      const src = Object.values(SCAN_SOURCES).find((s) => s.id === file.id)!;
      expect(src, file.id).toBeTruthy();
      for (const k of ["height", "width", "depth", "count", "quant", "licence"] as const) expect(src[k], `${file.id}.${k}`).toBe(file[k]);
      const loaded = await src.load!();
      expect(loaded.pos).toBe(file.pos);
    }
  });
});

describe("no white LEDs (Nov 2026)", () => {
  // White drones flare under bloom and wash a figure out: every drone of
  // every model-based figure is a colour. (The Tiranga's white band is the
  // flag's own colour, by its specification, and is exempt.)
  test("vivid keeps hue and peak, lifts saturation, tints grey", () => {
    const gold = hex("#ffb347");
    expect(vivid(gold)).toEqual(gold);
    const ivory = vivid(hex("#fff4e0"));
    expect(saturation(ivory)).toBeGreaterThanOrEqual(MIN_SAT - 1e-6);
    expect(Math.max(...ivory)).toBeCloseTo(1, 5);
    expect(ivory[0]).toBeGreaterThan(ivory[2]); // still warm
    const steel = vivid(hex("#d0d0d0"), hex("#3f74ff"));
    expect(steel[2]).toBeGreaterThan(steel[0]); // grey takes the blue tint
    expect(saturation(steel)).toBeGreaterThanOrEqual(MIN_SAT - 1e-6);
  });

  for (const f of CULTURAL.filter((x) => x.id !== "tiranga")) {
    test(`${f.id}: no drone near white`, () => {
      const n = Math.max(500, f.minDrones);
      const pos = new Float32Array(n * 3);
      const col = new Float32Array(n * 3);
      const rig = f.build(n);
      for (const t of [0, 2.3, 6.1, 9]) {
        f.pose(rig, t, pos, col);
        for (let i = 0; i < n; i++) {
          const c: [number, number, number] = [col[i * 3], col[i * 3 + 1], col[i * 3 + 2]];
          if (Math.max(...c) < 0.02) continue; // dark (the arrow on its way back)
          expect(saturation(c), `${f.id} drone ${i} t=${t}`).toBeGreaterThanOrEqual(0.5);
        }
      }
    });
  }
});
