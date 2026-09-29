// Culturally specific formations, built as real 3D forms.
//
// These are the ones that matter commercially — a ring is a ring anywhere,
// but a lotus above a wedding or an Om above a ghat is the reason a client
// chooses a drone show over fireworks. They are also the ones that most
// need to be volumetric: a flat rose curve reads as a flower head-on and as
// a line from the side, which is not what a swarm looks like.

import type { BuildContext, FormationDef, Vec3 } from "../types";
import { SHOW_CENTRE_ALTITUDE } from "../constants";
import { prioritise, sampleCurve } from "./sampling";
import {
  fibonacciDirections,
  petal,
  petalOutline,
  revolve,
  rotateX,
  translate,
  type PetalSpec,
} from "./shapes3d";
import { glyphPoints } from "./glyph";

/**
 * Lotus — three layers of curved petals around a seed head.
 *
 * Outer petals droop and splay, middle petals sit at an angle, inner petals
 * stand almost upright and cup inward. That layering is what makes it read
 * as a lotus rather than a daisy, and because every petal is a curved sheet
 * in 3D, it still reads as a flower when the camera orbits.
 */
export const lotus: FormationDef = {
  id: "lotus",
  label: "Lotus",
  category: "cultural",
  minRecommended: 50,
  build({ scale, droneCount }: BuildContext): Vec3[] {
    // Budget the fleet before choosing the geometry. Petals are drawn as
    // closed outlines and need roughly a dozen drones each to read; the
    // flower therefore gets SIMPLER as the count drops rather than getting
    // thinner everywhere, which is what turned the first version into a
    // scatter.
    const seedCount = Math.max(6, Math.round(droneCount * 0.09));
    const petalBudget = Math.max(12, droneCount - seedCount);

    const twoLayers = droneCount >= 100;
    // FEW, LARGE petals. Organic forms need roughly 20+ drones per element
    // before an outline reads; eight petals at 200 drones gave fourteen
    // each and looked like dotted rays rather than a bloom.
    const outerCount = droneCount <= 50 ? 4 : 6;
    const innerCount = twoLayers ? 4 : 0;

    const outerShare = twoLayers ? 0.7 : 1;
    const perOuter = Math.max(8, Math.floor((petalBudget * outerShare) / outerCount));
    const perInner = innerCount
      ? Math.max(6, Math.floor((petalBudget * (1 - outerShare)) / innerCount))
      : 0;

    const outerSpec: PetalSpec = {
      innerRadius: scale * 0.13,
      length: scale * 0.76,
      halfWidth: scale * 0.42,
      rise: -scale * 0.06,
      curl: scale * 0.2,
      cup: scale * 0.08,
      baseHeight: 0,
    };

    const innerSpec: PetalSpec = {
      innerRadius: scale * 0.09,
      length: scale * 0.42,
      halfWidth: scale * 0.3,
      rise: scale * 0.26,
      curl: scale * 0.1,
      cup: scale * 0.05,
      baseHeight: scale * 0.16,
    };

    const outline: Vec3[] = [];
    for (let i = 0; i < outerCount; i++) {
      outline.push(...petalOutline(outerSpec, (i / outerCount) * Math.PI * 2, perOuter));
    }
    for (let i = 0; i < innerCount; i++) {
      const angle = (i / innerCount) * Math.PI * 2 + Math.PI / innerCount;
      outline.push(...petalOutline(innerSpec, angle, perInner));
    }

    // Seed head — small, but it is what stops the flower reading as a
    // hollow star.
    const seed = fibonacciDirections(seedCount).map((d) => ({
      x: d.x * scale * 0.1,
      y: scale * 0.2 + d.y * scale * 0.06,
      z: d.z * scale * 0.1,
    }));

    // Detail tier: centre ribs, used only when there are drones to spare.
    const ribs: Vec3[] = [];
    for (let i = 0; i < outerCount; i++) {
      const parts = petal(outerSpec, (i / outerCount) * Math.PI * 2, {
        edge: 0,
        rib: 9,
        fill: 12,
      });
      ribs.push(...parts.rib, ...parts.fill);
    }

    // Tilt: a THREE-QUARTER view.
    //
    // 0 = the flower lies flat, opening at the sky. That is botanically
    // right and useless here, because the audience is underneath and sees
    // only the underside. Pi/2 stands it fully upright facing the crowd,
    // which reads as a rosette pinned to a wall rather than a bloom.
    // Roughly 54 degrees is how a lotus is actually photographed and drawn:
    // you see into the cup and still read its depth.
    const TILT = Math.PI * 0.3;
    const place = (p: Vec3) =>
      translate(rotateX(p, TILT), 0, SHOW_CENTRE_ALTITUDE - scale * 0.12, 0);

    return prioritise([...outline, ...seed].map(place), ribs.map(place));
  },
};

/**
 * Diya — a clay lamp turned on a lathe, with a flame above it.
 *
 * Both parts are surfaces of revolution, so the lamp is round from every
 * angle instead of being a crescent that only works head-on.
 */
export const diya: FormationDef = {
  id: "diya",
  label: "Diya",
  category: "cultural",
  minRecommended: 100,
  build({ scale }: BuildContext): Vec3[] {
    const rimY = 0;

    // Bowl: wide rim narrowing to a small flat foot.
    const bowl = revolve(
      (t) => ({
        r: scale * (0.78 - 0.55 * Math.pow(t, 1.5)),
        y: rimY - scale * 0.36 * Math.pow(t, 0.8),
      }),
      { rings: 4, segments: 30, ribs: 10 }
    );

    // Flame: a teardrop of revolution rising from the wick.
    const flame = revolve(
      (t) => ({
        r: scale * 0.19 * Math.pow(Math.sin(Math.PI * Math.min(t + 0.04, 1)), 1.5) * (1 - t * 0.55),
        y: rimY + scale * 0.04 + t * scale * 0.72,
      }),
      { rings: 5, segments: 16, ribs: 6 }
    );

    // The rim circle is the single most identifying line of the object.
    const rim = sampleCurve(46, (t) => {
      const a = t * Math.PI * 2;
      return { x: Math.cos(a) * scale * 0.78, y: rimY, z: Math.sin(a) * scale * 0.78 };
    });

    const TILT = Math.PI * 0.16;
    const lift = (p: Vec3) =>
      translate(rotateX(p, TILT), 0, SHOW_CENTRE_ALTITUDE - scale * 0.1, 0);

    // Rim, bowl ribs and the whole flame share tier 1: drop any one of them
    // and the object stops being a diya. (An earlier version put the flame
    // in tier 3 and it never rendered at 200 drones.)
    return prioritise(
      [...rim, ...bowl.ribs, ...flame.ribs, ...flame.rings].map(lift),
      bowl.rings.map(lift)
    );
  },
};

/**
 * Om. Glyph-sampled and deliberately FLAT, facing the audience — which is
 * also how real shows present written symbols, since a rotating letterform
 * is unreadable for most of its rotation.
 */
export const om: FormationDef = {
  id: "om",
  label: "Om",
  category: "cultural",
  minRecommended: 100,
  build({ scale }: BuildContext): Vec3[] {
    const pts = glyphPoints("ॐ", scale * 0.85, "'Noto Sans Devanagari', 'IBM Plex Sans', sans-serif");
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
