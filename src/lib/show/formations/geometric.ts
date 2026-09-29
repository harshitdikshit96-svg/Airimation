// Geometric formations — all volumetric.
//
// Coordinates in metres. Every formation here occupies real depth, so
// orbiting the camera reveals structure rather than flattening the shape
// into a line. The glyph formations (Om, text) are the deliberate
// exception: written symbols face the audience, as they do in real shows.

import type { BuildContext, FormationDef, Vec3 } from "../types";
import { SHOW_CENTRE_ALTITUDE } from "../constants";
import { prioritise, sampleCurve } from "./sampling";
import { fibonacciDirections, revolve, rotateY, translate } from "./shapes3d";

const lift = (p: Vec3): Vec3 => translate(p, 0, SHOW_CENTRE_ALTITUDE, 0);

/**
 * Ring — a torus, not a circle.
 *
 * The tube's cross-sections (ribs) are what sell the third dimension: from
 * the front it is a ring, from above it is still a ring, and in between you
 * can see it has thickness.
 */
export const ring: FormationDef = {
  id: "ring",
  label: "Ring",
  category: "geometric",
  minRecommended: 50,
  build({ scale }: BuildContext): Vec3[] {
    const major = scale * 0.82;
    const minor = scale * 0.17;

    const torus = revolve(
      (t) => {
        const a = t * Math.PI * 2;
        return { r: major + Math.cos(a) * minor, y: Math.sin(a) * minor };
      },
      { rings: 8, segments: 34, ribs: 14 }
    );

    // The outer equator is the silhouette from almost any viewpoint.
    const equator = sampleCurve(64, (t) => {
      const a = t * Math.PI * 2;
      return { x: Math.cos(a) * (major + minor), y: 0, z: Math.sin(a) * (major + minor) };
    });

    return prioritise([...equator, ...torus.ribs].map(lift), torus.rings.map(lift));
  },
};

/**
 * Spiral — a rising helix. Two arms, climbing and widening, so it has real
 * vertical extent instead of being a flat pinwheel.
 */
export const spiral: FormationDef = {
  id: "spiral",
  label: "Rising Spiral",
  category: "geometric",
  minRecommended: 50,
  build({ scale }: BuildContext): Vec3[] {
    const turns = 2.75;
    const arm = (offset: number, count: number) =>
      sampleCurve(count, (t) => {
        const a = t * Math.PI * 2 * turns + offset;
        const r = scale * (0.2 + 0.72 * t);
        return {
          x: Math.cos(a) * r,
          y: -scale * 0.6 + t * scale * 1.2,
          z: Math.sin(a) * r,
        };
      });

    return prioritise([...arm(0, 230), ...arm(Math.PI, 230)].map(lift));
  },
};

/** A rippling sheet with real depth. */
export const wave: FormationDef = {
  id: "wave",
  label: "Wave",
  category: "geometric",
  minRecommended: 50,
  build({ scale }: BuildContext): Vec3[] {
    const cols = 30;
    const rows = 20;
    const width = scale * 2.1;
    const depth = scale * 1.5;
    const amp = scale * 0.34;

    const pts: Vec3[] = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const u = i / (cols - 1) - 0.5;
        const v = j / (rows - 1) - 0.5;
        pts.push({
          x: u * width,
          y: Math.sin(u * Math.PI * 2.2 + v * Math.PI * 0.8) * amp,
          z: v * depth,
        });
      }
    }
    return prioritise(pts.map(lift));
  },
};

/** Wireframe cube, turned so two faces are visible by default. */
export const cube: FormationDef = {
  id: "cube",
  label: "Cube",
  category: "geometric",
  minRecommended: 100,
  build({ scale }: BuildContext): Vec3[] {
    const h = scale * 0.7;
    const corners: Vec3[] = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          corners.push({ x: sx * h, y: sy * h, z: sz * h });
        }
      }
    }

    const edges: [number, number][] = [];
    for (let a = 0; a < corners.length; a++) {
      for (let b = a + 1; b < corners.length; b++) {
        const diff =
          (corners[a].x !== corners[b].x ? 1 : 0) +
          (corners[a].y !== corners[b].y ? 1 : 0) +
          (corners[a].z !== corners[b].z ? 1 : 0);
        if (diff === 1) edges.push([a, b]);
      }
    }

    const perEdge = 42;
    const pts: Vec3[] = [];
    for (const [a, b] of edges) {
      for (let i = 0; i < perEdge; i++) {
        const t = i / perEdge;
        pts.push({
          x: corners[a].x + (corners[b].x - corners[a].x) * t,
          y: corners[a].y + (corners[b].y - corners[a].y) * t,
          z: corners[a].z + (corners[b].z - corners[a].z) * t,
        });
      }
    }

    // A slight turn so the default view shows depth rather than a square.
    return prioritise(pts.map((p) => lift(rotateY(p, Math.PI / 7))));
  },
};

/**
 * Starburst — rays in every direction, not a flat asterisk. Reads as a burst
 * from any camera position, which a planar version does not.
 */
export const starburst: FormationDef = {
  id: "starburst",
  label: "Starburst",
  category: "geometric",
  minRecommended: 50,
  build({ scale }: BuildContext): Vec3[] {
    const rays = fibonacciDirections(20);
    const perRay = 20;
    const rayPts: Vec3[] = [];
    for (const dir of rays) {
      for (let i = 0; i < perRay; i++) {
        const t = 0.22 + (i / perRay) * 0.78;
        rayPts.push({ x: dir.x * scale * t, y: dir.y * scale * t, z: dir.z * scale * t });
      }
    }

    const core = fibonacciDirections(30).map((d) => ({
      x: d.x * scale * 0.12,
      y: d.y * scale * 0.12,
      z: d.z * scale * 0.12,
    }));

    return prioritise(rayPts.map(lift), core.map(lift));
  },
};
