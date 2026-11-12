import { describe, expect, test } from "vitest";
import { gateBeat, INTRO_SECONDS, LOOP_SECONDS } from "../phoneGateStory";

describe("phone gate story", () => {
  test("starts on the ground, matching the poster", () => {
    expect(gateBeat(0)).toBe(0);
  });

  test("stays within the home story's beats and never dissolves", () => {
    for (let t = 0; t < INTRO_SECONDS + 3 * LOOP_SECONDS; t += 0.05) {
      const b = gateBeat(t);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(4);
    }
  });

  test("moves gently: no jump between frames, including the loop seam", () => {
    let prev = gateBeat(0);
    for (let t = 1 / 60; t < INTRO_SECONDS + 2 * LOOP_SECONDS; t += 1 / 60) {
      const b = gateBeat(t);
      expect(Math.abs(b - prev)).toBeLessThan(0.02);
      prev = b;
    }
  });

  test("loops", () => {
    expect(gateBeat(INTRO_SECONDS + 1.5)).toBeCloseTo(gateBeat(INTRO_SECONDS + LOOP_SECONDS + 1.5), 6);
  });
});
