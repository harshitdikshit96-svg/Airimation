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

  test("a palette changes the hue but keeps each drone's brightness", () => {
    const { pos, col } = make();
    const levels = [0.2, 1, 0.6];
    applyHues(pos, col, 3, ["#ff0000", "#00ff00", "#0000ff"]);
    for (let i = 0; i < 3; i++) {
      const peak = Math.max(col[i * 3], col[i * 3 + 1], col[i * 3 + 2]);
      expect(peak).toBeCloseTo(levels[i], 5);
    }
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
