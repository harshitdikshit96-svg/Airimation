// Personalising formations — the ones a client sees themselves in.

import type { BuildContext, FormationDef, Vec3 } from "../types";
import { SHOW_CENTRE_ALTITUDE } from "../constants";
import { prioritise } from "./sampling";
import { fibonacciDirections, implicitShell, translate } from "./shapes3d";
import { glyphPoints } from "./glyph";

/**
 * Heart — the 3D Taubin heart surface, sampled as a shell.
 *
 * The flat parametric heart curve looked right from the front and vanished
 * from the side. This is a genuine solid: rounded lobes, a real point at the
 * bottom, and volume you can orbit around.
 */
export const heart: FormationDef = {
  id: "heart",
  label: "Heart",
  category: "personal",
  minRecommended: 50,
  build({ scale }: BuildContext): Vec3[] {
    // Taubin's heart: (x^2 + (9/4)z^2 + y^2 - 1)^3 - x^2 y^3 - (9/80) z^2 y^3 = 0
    // with y as the vertical axis (the original uses z up).
    const F = (x: number, y: number, z: number) => {
      const a = x * x + (9 / 4) * z * z + y * y - 1;
      return a * a * a - x * x * y * y * y - (9 / 80) * z * z * y * y * y;
    };

    // Two shells of differing density: the outer surface reads as the shape,
    // a slightly inset one gives it body at higher drone counts.
    const outer = implicitShell(fibonacciDirections(300), F);
    const inner = implicitShell(fibonacciDirections(170), F).map((p) => ({
      x: p.x * 0.72,
      y: p.y * 0.72,
      z: p.z * 0.72,
    }));

    const place = (p: Vec3) =>
      translate({ x: p.x * scale * 0.82, y: p.y * scale * 0.82, z: p.z * scale * 0.82 }, 0, SHOW_CENTRE_ALTITUDE, 0);

    return prioritise(outer.map(place), inner.map(place));
  },
};

/**
 * Text in the sky — a name, initials, a date.
 *
 * Commercially the most valuable formation: "see your own name up there" is
 * the moment that closes. Deliberately FLAT and facing the audience, because
 * a rotating letterform is unreadable through most of its rotation.
 *
 * Sized WIDE — a name spans nearly the whole show volume in a real show.
 *
 * Rendered as a SINGLE STROKE per letter rather than a filled outline. The
 * filled version drew both sides of every stroke, so each letter appeared
 * as two nested copies of itself and no drone budget was left to complete
 * either. See glyph.ts.
 */
export const text: FormationDef = {
  id: "text",
  label: "Your Name",
  category: "personal",
  minRecommended: 100,
  personalises: true,
  build({ scale, text: value, droneCount }: BuildContext): Vec3[] {
    const content = (value ?? "").trim();
    if (!content) return [];
    return glyphPoints(content, scale, "'IBM Plex Sans', 'Noto Sans Devanagari', sans-serif", {
      widthFactor: 4.6,
      heightFactor: 1.3,
      minPoints: droneCount,
    });
  },
};
