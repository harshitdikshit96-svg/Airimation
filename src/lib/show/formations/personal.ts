// Personalising formations — the ones a client sees themselves in.

import type { BuildContext, FormationDef, Vec3 } from "../types";
import { SHOW_CENTRE_ALTITUDE } from "../constants";
import { prioritise, sampleArea, sampleCurve } from "./sampling";
import { glyphPoints } from "./glyph";

/** Heart — the standard parametric curve, outline then fill. */
export const heart: FormationDef = {
  id: "heart",
  label: "Heart",
  category: "personal",
  minRecommended: 50,
  build({ scale, rand }: BuildContext): Vec3[] {
    // Classic heart curve, normalised so the widest extent is ~1.
    const curve = (t: number) => {
      const a = t * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(a), 3);
      const y =
        13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
      return { x: x / 17, y: y / 17 };
    };

    const outline = sampleCurve(340, (t) => {
      const p = curve(t);
      return { x: p.x * scale, y: SHOW_CENTRE_ALTITUDE + p.y * scale, z: 0 };
    });

    // Fill by rejection sampling against the implicit heart inequality.
    const fill = sampleArea(
      260,
      rand,
      (u, v) => {
        const x = u * 1.25;
        const y = v * 1.25;
        const q = x * x + y * y - 1;
        return q * q * q - x * x * y * y * y < 0;
      },
      (u, v) => ({ x: u * 1.25 * scale, y: SHOW_CENTRE_ALTITUDE + v * 1.25 * scale, z: 0 })
    );

    return prioritise(outline, fill);
  },
};

/**
 * Text in the sky — a name, initials, a date.
 *
 * Commercially the most valuable formation in the library: "see your own
 * name up there" is the moment that closes. Needs drones, though — below
 * 200 the strokes thin out badly, hence the minRecommended.
 */
export const text: FormationDef = {
  id: "text",
  label: "Your Name",
  category: "personal",
  minRecommended: 200,
  personalises: true,
  build({ scale, text: value }: BuildContext): Vec3[] {
    const content = (value ?? "").trim();
    if (!content) return [];
    return glyphPoints(
      content,
      scale * 0.62,
      "'IBM Plex Sans', 'Noto Sans Devanagari', sans-serif"
    );
  },
};
