// Per-drone colour: figures must show their features, not one flat colour.
import { describe, expect, test } from "vitest";
import files from "./scanFiles";
import { CULTURAL } from "..";
import { paintPoints } from "../scan";

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
  const scans = CULTURAL.filter((f) => f.credit && !f.id.startsWith("classic"));
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
