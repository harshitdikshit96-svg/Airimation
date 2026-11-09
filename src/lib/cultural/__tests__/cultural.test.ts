import { describe, expect, test } from "vitest";
import { CULTURAL } from "../index";

describe("animated cultural formations", () => {
  for (const f of CULTURAL) {
    for (const n of [f.minDrones, 1000]) {
      test(`${f.id} at ${n}: exact count, finite, deterministic, in the show volume`, () => {
        const a = f.build(n);
        const b = f.build(n);
        const pa = new Float32Array(n * 3);
        const ca = new Float32Array(n * 3);
        const pb = new Float32Array(n * 3);
        const cb = new Float32Array(n * 3);
        for (const t of [0, f.loop * 0.37, f.loop * 0.81]) {
          f.pose(a, t, pa, ca);
          f.pose(b, t, pb, cb);
          expect(Array.from(pa)).toEqual(Array.from(pb));
          for (let i = 0; i < n; i++) {
            const [x, y, z] = [pa[i * 3], pa[i * 3 + 1], pa[i * 3 + 2]];
            expect(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)).toBe(true);
            // Above the 25 m floor, within a ~300 m wide show box.
            expect(y).toBeGreaterThan(25);
            expect(Math.abs(x)).toBeLessThan(150);
            expect(Math.abs(z)).toBeLessThan(80);
            for (const c of [ca[i * 3], ca[i * 3 + 1], ca[i * 3 + 2]]) expect(c).toBeGreaterThanOrEqual(0);
          }
        }
      });
    }
  }
});
