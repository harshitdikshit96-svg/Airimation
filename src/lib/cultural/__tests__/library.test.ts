import { describe, expect, test, beforeAll } from "vitest";
import { loadAll } from "../index";

// Scanned models load on demand; tests need them all.
beforeAll(() => loadAll());
import { CULTURAL, formationsFor } from "../index";
import { tiranga } from "../tiranga";
import { SHOW_ALT, TAU } from "../kit";
import scanFiles from "./scanFiles";
import { FIT_D, FIT_H, FIT_W, fitScale } from "../scan";

// The Design a Show library rules (DECISIONS.md §3):
//  - every formation comes from a real 3D model, an exact geometric shape,
//    or the flag's official specification — no hand-drawn figures
//  - only CC0 / public-domain or CC BY 4.0 models, and CC BY ones are credited
//  - every fleet size on offer has formations to show

const FLEETS = [100, 500, 1500, 3000, 5000];
// Hand-drawn figures replaced by model-based ones (Om and Kamal came back
// as Airimation-modelled symbols, under new code).
const REMOVED = ["lotus", "mahadev", "shiva", "heartbeat"];

describe("formation library", () => {
  test("ids and labels are unique", () => {
    const ids = CULTURAL.map((f) => f.id);
    const labels = CULTURAL.map((f) => f.label);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(labels).size).toBe(labels.length);
  });

  test("formations without a 3D model are gone", () => {
    for (const id of REMOVED) expect(CULTURAL.find((f) => f.id === id), id).toBeUndefined();
  });

  test("every non-geometric formation names its source", () => {
    for (const f of CULTURAL) {
      if (f.id.startsWith("classic-")) continue;
      expect(f.credit, f.id).toBeTruthy();
    }
  });

  test("every fleet size offers at least four formations, and more drones never offer fewer", () => {
    let prev = 0;
    for (const n of FLEETS) {
      const k = formationsFor(n).length;
      expect(k, `${n} drones`).toBeGreaterThanOrEqual(4);
      expect(k).toBeGreaterThanOrEqual(prev);
      prev = k;
    }
  });
});

describe("3D model files", () => {
  for (const [name, file] of Object.entries(scanFiles)) {
    test(`${name}: allowed licence, credited, intact`, () => {
      expect(["CC0 1.0", "CC BY 4.0", "Airimation"]).toContain(file.licence);
      if (file.licence === "Airimation") expect(file.credit).toMatch(/Modelled by Airimation/);
      if (file.licence === "CC BY 4.0") expect(file.credit).toMatch(/CC BY 4\.0/);
      expect(file.credit).not.toMatch(/\bNC\b|\bSA\b|\bND\b|non-commercial/i);
      expect(file.height).toBeGreaterThan(20);
      // Positions are int16 over +-128 m.
      expect(Math.max(file.width, file.height, file.depth)).toBeLessThanOrEqual(250);
      // Shown at one common scale: fitted into FIT_W x FIT_H, touching one side.
      const k = fitScale(file);
      expect(file.width * k).toBeLessThanOrEqual(FIT_W + 0.01);
      expect(file.height * k).toBeLessThanOrEqual(FIT_H + 0.01);
      expect(file.depth * k).toBeLessThanOrEqual(FIT_D + 0.01);
      expect(Math.max(file.width * k - FIT_W, file.height * k - FIT_H, file.depth * k - FIT_D)).toBeGreaterThan(-0.01);
      const pos = Buffer.from(file.pos, "base64");
      const nrm = Buffer.from(file.nrm, "base64");
      expect(pos.byteLength).toBe(file.count * 3 * 2);
      expect(nrm.byteLength).toBe(file.count * 3);
      expect(file.count).toBeGreaterThanOrEqual(5000);
    });
  }
});

describe("light effects never add stray drones", () => {
  // The old bow drew a streak of extra lights behind the arrow. Every drone
  // must now sit on the model (or the diya's flame, just above it).
  for (const f of CULTURAL.filter((x) => x.id !== "tiranga")) {
    test(`${f.id}: every drone inside the model's bounds`, () => {
      const n = Math.max(f.minDrones, 800);
      const rig = f.build(n);
      const pos = new Float32Array(n * 3);
      const col = new Float32Array(n * 3);
      f.pose(rig, 0, pos, col);
      const raw = Object.values(scanFiles).find((s) => s.id === f.id)!;
      const fit = fitScale(raw);
      const file = { ...raw, width: raw.width * fit, height: raw.height * fit, depth: raw.depth * fit };
      // The loosed arrow flies 48 m beyond the bow, so check the bow at rest
      // (t = 0); its flight is tested on its own below.
      const reach = Math.hypot(file.width, file.depth) / 2 + 2;
      const top = SHOW_ALT + file.height / 2 + (f.id === "diya" ? Math.max(file.height, file.width) * 0.8 : 1);
      for (let i = 0; i < n; i++) {
        const [x, y, z] = [pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]];
        expect(Math.hypot(x, z), `${f.id} drone ${i}`).toBeLessThanOrEqual(reach);
        expect(y).toBeGreaterThanOrEqual(SHOW_ALT - file.height / 2 - 1);
        expect(y).toBeLessThanOrEqual(top);
      }
    });
  }

  test("the bow fires: the arrow draws back, flies off lit, returns dark", () => {
    const f = CULTURAL.find((x) => x.id === "dhanush-baan")!;
    const n = 800;
    const rig = f.build(n);
    const at = (t: number) => {
      const pos = new Float32Array(n * 3);
      const col = new Float32Array(n * 3);
      f.pose(rig, t, pos, col);
      return { pos, col };
    };
    const rest = at(0);
    const drawn = at(3.5);
    const flying = at(9);
    const returning = at(16);
    // Arrow drones: those whose x changes during flight.
    const arrow = Array.from({ length: n }, (_, i) => i).filter((i) => Math.abs(flying.pos[i * 3] - rest.pos[i * 3]) > 20);
    expect(arrow.length).toBeGreaterThan(10);
    expect(arrow.length).toBeLessThan(n / 3);
    for (const i of arrow) {
      expect(drawn.pos[i * 3]).toBeLessThan(rest.pos[i * 3]); // pulled back
      expect(flying.pos[i * 3]).toBeGreaterThan(rest.pos[i * 3] + 20); // loosed
      expect(flying.col[i * 3] + flying.col[i * 3 + 1]).toBeGreaterThan(0.3); // lit in flight
      expect(returning.col[i * 3] + returning.col[i * 3 + 1] + returning.col[i * 3 + 2]).toBe(0); // dark on the way back
    }
    // The string bends back at the nock while drawn.
    const moved = Array.from({ length: n }, (_, i) => i).filter((i) => !arrow.includes(i) && drawn.pos[i * 3] < rest.pos[i * 3] - 2);
    expect(moved.length).toBeGreaterThan(2);
  });

  test("the diya has a lit flame above its wick", () => {
    const f = CULTURAL.find((x) => x.id === "diya")!;
    const n = 500;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    f.pose(f.build(n), 1, pos, col);
    // The flame is the last 10% of the list, standing on the wick (the
    // highest lamp drone near the vertical axis) and rising above the lamp.
    const flame = Array.from({ length: 50 }, (_, k) => n - 50 + k);
    const body = Array.from({ length: n - 50 }, (_, i) => i);
    const maxBody = Math.max(...body.map((i) => pos[i * 3 + 1]));
    expect(Math.max(...flame.map((i) => pos[i * 3 + 1]))).toBeGreaterThan(maxBody + 10);
    for (const i of flame) expect(Math.hypot(pos[i * 3], pos[i * 3 + 2])).toBeLessThan(30);
    for (const i of flame) expect(col[i * 3] + col[i * 3 + 1]).toBeGreaterThan(0.3);
  });
});

describe("Tiranga", () => {
  test("needs 200 drones", () => {
    expect(tiranga.minDrones).toBe(200);
    expect(formationsFor(100).some((f) => f.id === "tiranga")).toBe(false);
  });

  for (const n of [200, 500, 1500, 5000]) {
    test(`${n} drones: the chakra has 24 spokes, each a straight line of 2+ drones`, () => {
      const rig = tiranga.build(n);
      expect(rig.u.length).toBe(n);
      // Spoke drones: chakra drones strictly inside the rim, away from the hub.
      const R = 52 / 6;
      const byAngle = new Map<number, number>();
      for (let i = 0; i < n; i++) {
        if (rig.kind[i] !== 1) continue;
        const r = rig.v[i];
        if (r <= R * 0.2 || r >= R * 0.99) continue;
        const a = Math.round((rig.u[i] / TAU) * 24) % 24;
        expect(Math.abs((rig.u[i] / TAU) * 24 - Math.round((rig.u[i] / TAU) * 24))).toBeLessThan(1e-6);
        byAngle.set(a, (byAngle.get(a) ?? 0) + 1);
      }
      expect(byAngle.size).toBe(24);
      for (const c of byAngle.values()) expect(c).toBeGreaterThanOrEqual(2);
    });
  }

  test("bands are saffron over white over green, chakra navy", () => {
    const n = 800;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const rig = tiranga.build(n);
    tiranga.pose(rig, 0, pos, col);
    for (let i = 0; i < n; i++) {
      const [r, g, b] = [col[i * 3], col[i * 3 + 1], col[i * 3 + 2]];
      if (rig.kind[i] === 1) expect(b).toBeGreaterThan(r);
      else if (rig.v[i] > 52 / 6) expect(r).toBeGreaterThan(b * 2); // saffron
      else if (rig.v[i] < -52 / 6) expect(g).toBeGreaterThan(r); // green
    }
  });
});
