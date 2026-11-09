import { describe, expect, test } from "vitest";
import { CULTURAL } from "../index";
import { MAX_DRONE_SPEED } from "../kit";

// Real show drones fly ~3–8 m/s. Every formation, every drone, every frame
// of a loop (including the wrap from the end of the loop back to t=0, and
// drones repositioning with their LEDs off) must stay under the limit.
const FPS = 24;

describe("every formation moves at real drone speeds", () => {
  for (const f of CULTURAL) {
    for (const n of [Math.max(f.minDrones, 200), 1000]) {
      test(`${f.id} at ${n} drones stays under ${MAX_DRONE_SPEED} m/s`, () => {
        const rig = f.build(n);
        const prev = new Float32Array(n * 3);
        const pos = new Float32Array(n * 3);
        const col = new Float32Array(n * 3);
        const frames = Math.round(f.loop * FPS);
        let worst = 0;
        let who = "";
        f.pose(rig, 0, prev, col);
        for (let k = 1; k <= frames; k++) {
          const t = k === frames ? 0 : k / FPS; // last step checks the loop wrap
          f.pose(rig, t, pos, col);
          for (let i = 0; i < n; i++) {
            const v = Math.hypot(pos[i * 3] - prev[i * 3], pos[i * 3 + 1] - prev[i * 3 + 1], pos[i * 3 + 2] - prev[i * 3 + 2]) * FPS;
            if (v > worst) {
              worst = v;
              who = `drone ${i} at t=${(k / FPS).toFixed(2)}s`;
            }
          }
          prev.set(pos);
        }
        expect(worst, `${f.id}: ${worst.toFixed(1)} m/s (${who})`).toBeLessThanOrEqual(MAX_DRONE_SPEED);
      });
    }
  }
});
