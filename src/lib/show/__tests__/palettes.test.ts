import { describe, expect, test } from "vitest";
import { PALETTES } from "../palettes";
import { applyHues } from "@/components/gallery/showcaseMath";

// LED themes (DECISIONS.md §2): vivid, never white (bar the flag's own white
// band), and every theme different from every other.

const linear = (h: string) =>
  [0, 2, 4].map((k) => {
    const s = parseInt(h.slice(1 + k, 3 + k), 16) / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
const sat = (c: number[]) => 1 - Math.min(...c) / (Math.max(...c) || 1);

describe("LED themes", () => {
  test("ids are unique and the old share-link ids still exist", () => {
    const ids = PALETTES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ["auto", "gold", "royal", "ice", "tricolour", "rose"]) expect(ids).toContain(id);
  });

  test("a wide choice: at least 12 themes, using all five ways of laying colour", () => {
    expect(PALETTES.length).toBeGreaterThanOrEqual(12);
    const modes = new Set(PALETTES.filter((p) => p.colors.length).map((p) => p.mode ?? "height"));
    expect(modes.size).toBe(5);
  });

  test("every colour is vivid (only the Tiranga keeps its white band)", () => {
    for (const p of PALETTES) {
      for (const c of p.colors) {
        if (p.id === "tricolour" && c === "#ffffff") continue;
        expect(sat(linear(c)), `${p.label} ${c}`).toBeGreaterThanOrEqual(0.6);
      }
    }
  });

  test("no two themes alike", () => {
    const seen = new Set<string>();
    for (const p of PALETTES) {
      const key = `${p.mode ?? "height"}:${[...p.colors].sort().join()}`;
      expect(seen.has(key), p.label).toBe(false);
      seen.add(key);
    }
  });

  test("on a figure, every theme stays coloured: no drone near white", () => {
    const n = 400;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = Math.cos(i) * 40;
      pos[i * 3 + 1] = (i / n) * 80;
      pos[i * 3 + 2] = Math.sin(i * 1.7) * 20;
    }
    for (const p of PALETTES) {
      if (!p.colors.length || p.id === "tricolour") continue;
      const col = new Float32Array(n * 3).fill(0.8);
      applyHues(pos, col, n, p.colors, p.mode);
      for (let i = 0; i < n; i++) {
        expect(sat([col[i * 3], col[i * 3 + 1], col[i * 3 + 2]]), `${p.label} drone ${i}`).toBeGreaterThanOrEqual(0.5);
      }
    }
  });
});
