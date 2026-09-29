// Culturally specific formations.
//
// These are the ones that matter commercially — a generic ring is a ring
// anywhere, but a diya above a wedding or an Om above a ghat is the reason a
// client picks a drone show over fireworks.

import type { BuildContext, FormationDef, Vec3 } from "../types";
import { SHOW_CENTRE_ALTITUDE, SHOW_SCALE } from "../constants";
import { prioritise, sampleArea, sampleCurve } from "./sampling";
import { glyphPoints } from "./glyph";

/** Lotus — an eight-petal rose curve. Outline first, then petal fill. */
export const lotus: FormationDef = {
  id: "lotus",
  label: "Lotus",
  category: "cultural",
  minRecommended: 50,
  build({ scale, rand }: BuildContext): Vec3[] {
    const petals = 8;
    const radiusAt = (a: number) => scale * (0.34 + 0.66 * Math.abs(Math.cos((petals * a) / 2)));

    const outline = sampleCurve(340, (t) => {
      const a = t * Math.PI * 2;
      const r = radiusAt(a);
      return { x: Math.cos(a) * r, y: SHOW_CENTRE_ALTITUDE + Math.sin(a) * r, z: 0 };
    });

    const fill = sampleArea(
      260,
      rand,
      (u, v) => {
        const r = Math.hypot(u, v);
        if (r < 0.001) return false;
        const a = Math.atan2(v, u);
        return r * scale < radiusAt(a) * 0.92;
      },
      (u, v) => ({ x: u * scale, y: SHOW_CENTRE_ALTITUDE + v * scale, z: 0 })
    );

    return prioritise(outline, fill);
  },
};

/** Diya — an oil lamp with its flame. */
export const diya: FormationDef = {
  id: "diya",
  label: "Diya",
  category: "cultural",
  minRecommended: 100,
  build({ scale }: BuildContext): Vec3[] {
    const baseY = SHOW_CENTRE_ALTITUDE - scale * 0.32;

    // Bowl: a shallow half-ellipse with a lipped rim.
    const bowl = sampleCurve(220, (t) => {
      const a = Math.PI + t * Math.PI; // lower half only
      return { x: Math.cos(a) * scale * 0.82, y: baseY + Math.sin(a) * scale * 0.42, z: 0 };
    });

    const rim = sampleCurve(90, (t) => ({
      x: (t * 2 - 1) * scale * 0.82,
      y: baseY,
      z: 0,
    }));

    // Flame: a teardrop. Width peaks low and tapers to a point, which the
    // earlier sin()-based attempt did not do — it collapsed to a sliver.
    const flame = sampleCurve(170, (t) => {
      const u = t < 0.5 ? t * 2 : (1 - t) * 2; // 0 -> 1 -> 0 up both sides
      const side = t < 0.5 ? 1 : -1;
      const height = u; // 0 at base, 1 at tip
      const width = Math.pow(Math.sin(Math.PI * height), 1.6) * (1 - height * 0.45);
      return {
        x: side * width * scale * 0.26,
        y: baseY + scale * 0.02 + height * scale * 0.72,
        z: 0,
      };
    });

    // Bowl AND flame are both load-bearing for reading this as a diya,
    // so they share tier 1; the rim is detail and can drop out first.
    return prioritise([...bowl, ...flame], rim);
  },
};

/**
 * Om. Built by glyph sampling rather than parametric geometry — the
 * character is standard Unicode and the browser's font engine draws it
 * correctly, which is both more accurate and far less work than digitising
 * the curve by hand.
 */
export const om: FormationDef = {
  id: "om",
  label: "Om",
  category: "cultural",
  minRecommended: 100,
  build({ scale }: BuildContext): Vec3[] {
    const pts = glyphPoints("ॐ", scale * 0.75, "'Noto Sans Devanagari', 'IBM Plex Sans', sans-serif");
    return pts.length > 0 ? pts : fallbackRing(scale);
  },
};

/** If glyph rasterisation is unavailable, degrade to a ring rather than throw. */
function fallbackRing(scale: number): Vec3[] {
  return prioritise(
    sampleCurve(300, (t) => {
      const a = t * Math.PI * 2;
      return { x: Math.cos(a) * scale, y: SHOW_CENTRE_ALTITUDE + Math.sin(a) * scale, z: 0 };
    })
  );
}

export const CULTURAL_SCALE_HINT = SHOW_SCALE;
