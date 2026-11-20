import { describe, expect, test } from "vitest";
import { applyHues, fleetScale, MORPH_MAX, MORPH_MIN, morphSeconds, PREVIEW_RATE, showAltitude, viewDistance } from "../showcaseMath";

const FLEETS = [100, 500, 1500, 3000, 5000];
/** Designed figure height at scale 1, metres (scripts/scan-to-formation.mjs --height). */
const FIGURE_HEIGHT = 84;

describe("Design a Show preview maths", () => {
  test("a bigger fleet flies a bigger figure (never just a denser one)", () => {
    for (let k = 1; k < FLEETS.length; k++) expect(fleetScale(FLEETS[k])).toBeGreaterThan(fleetScale(FLEETS[k - 1]));
    expect(fleetScale(500)).toBe(1);
    expect(fleetScale(50)).toBe(0.5);
    expect(fleetScale(10_000)).toBe(3.2);
  });

  test("every figure's base stays well above the skyline", () => {
    for (const n of FLEETS) {
      const base = showAltitude(n) - (FIGURE_HEIGHT / 2) * fleetScale(n);
      expect(base, `${n} drones`).toBeGreaterThanOrEqual(55);
    }
  });

  test("the camera backs off slower than the figure grows, so bigger fleets fill more of the frame", () => {
    for (let k = 1; k < FLEETS.length; k++) {
      const a = fleetScale(FLEETS[k - 1]) / viewDistance(FLEETS[k - 1]);
      const b = fleetScale(FLEETS[k]) / viewDistance(FLEETS[k]);
      expect(b).toBeGreaterThan(a);
    }
  });

  test("preview rate sits between real speed and the old fast version", () => {
    expect(PREVIEW_RATE).toBeGreaterThan(1);
    expect(PREVIEW_RATE).toBeLessThan(3);
  });

  test("transitions are clamped and grow with distance", () => {
    expect(morphSeconds(0, 0.1)).toBe(MORPH_MIN);
    expect(morphSeconds(10_000, 0.1)).toBe(MORPH_MAX);
    expect(morphSeconds(80, 0.1)).toBeGreaterThan(morphSeconds(40, 0.1));
  });
});

describe("LED hues", () => {
  const make = () => {
    const pos = new Float32Array([0, 10, 0, 0, 50, 0, 0, 90, 0]);
    const col = new Float32Array([0.2, 0.1, 0.05, 1, 0.5, 0.25, 0.6, 0.6, 0.6]);
    return { pos, col };
  };

  test("'Per formation' (empty palette) leaves colours untouched", () => {
    const { pos, col } = make();
    const before = Array.from(col);
    applyHues(pos, col, 3, []);
    expect(Array.from(col)).toEqual(before);
  });

  test("a palette changes the hue, keeps light and shade in order, lifts dim drones", () => {
    const { pos, col } = make();
    const levels = [0.2, 1, 0.6];
    applyHues(pos, col, 3, ["#ff0000", "#00ff00", "#0000ff"]);
    const peaks = [0, 1, 2].map((i) => Math.max(col[i * 3], col[i * 3 + 1], col[i * 3 + 2]));
    expect(peaks[1]).toBeCloseTo(1, 5); // full stays full
    expect(peaks[0]).toBeGreaterThan(levels[0]); // dim is lifted
    expect(peaks[0]).toBeLessThan(peaks[2]); // order kept
    expect(peaks[2]).toBeLessThan(peaks[1]);
    // A dark drone (an effect switched off) stays dark.
    const off = new Float32Array([0, 0, 0]);
    applyHues(new Float32Array([0, 0, 0]), off, 1, ["#ff0000"]);
    expect(Math.max(...off)).toBe(0);
    // Top drone takes the first (dominant) colour.
    expect(col[2 * 3]).toBeGreaterThan(col[2 * 3 + 1]);
    expect(col[2 * 3]).toBeGreaterThan(col[2 * 3 + 2]);
    // Bottom drone takes the last.
    expect(col[2]).toBeGreaterThan(col[0]);
  });

  test("single-colour palettes and empty fleets are safe", () => {
    const { pos, col } = make();
    applyHues(pos, col, 3, ["#ffd27a"]);
    for (const c of col) expect(Number.isFinite(c)).toBe(true);
    applyHues(new Float32Array(0), new Float32Array(0), 0, ["#ffffff"]);
  });
});

describe("LED theme layouts", () => {
  const n = 200;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = ((i * 37) % 100) - 50;
    pos[i * 3 + 1] = (i / n) * 100;
    pos[i * 3 + 2] = 0;
  }
  const run = (mode: Parameters<typeof applyHues>[4]) => {
    const col = new Float32Array(n * 3).fill(1);
    applyHues(pos, col, n, ["#ff0000", "#0000ff"], mode);
    return col;
  };
  const isRed = (c: Float32Array, i: number) => c[i * 3] > 0.99 && c[i * 3 + 2] < 0.01;
  const isBlue = (c: Float32Array, i: number) => c[i * 3 + 2] > 0.99 && c[i * 3] < 0.01;

  test("bands and scatter use only the theme's own colours", () => {
    for (const mode of ["bands", "scatter"] as const) {
      const col = run(mode);
      let red = 0;
      for (let i = 0; i < n; i++) {
        expect(isRed(col, i) || isBlue(col, i), `${mode} ${i}`).toBe(true);
        if (isRed(col, i)) red++;
      }
      expect(red).toBeGreaterThan(n * 0.2);
      expect(red).toBeLessThan(n * 0.8);
    }
  });

  test("scatter (Holi patches) gives each drone the same colour every frame", () => {
    expect(Array.from(run("scatter"))).toEqual(Array.from(run("scatter")));
  });

  test("blends go round the colour wheel, not through white", () => {
    const col = new Float32Array(3 * 3).fill(1);
    const p = new Float32Array([0, 0, 0, 0, 50, 0, 0, 100, 0]);
    applyHues(p, col, 3, ["#2d5bff", "#ffd400"]); // blue over gold
    const mid = [col[3], col[4], col[5]];
    expect(Math.min(...mid) / Math.max(...mid)).toBeLessThan(0.3);
  });
});
