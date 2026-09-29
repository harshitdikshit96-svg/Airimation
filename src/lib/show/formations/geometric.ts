// Geometric formations — pure parametric geometry, no external assets.
//
// All coordinates in metres. Most formations sit in the x/y plane facing the
// audience (z = 0); `wave` and `cube` deliberately use depth so the visitor
// can see the swarm is a volume rather than a flat billboard.

import type { BuildContext, FormationDef, Vec3 } from "../types";
import { SHOW_CENTRE_ALTITUDE } from "../constants";
import { prioritise, sampleCurve } from "./sampling";

const centre = (scale: number) => ({ x: 0, y: SHOW_CENTRE_ALTITUDE, z: 0, s: scale });

/** Concentric rings. Outer ring is the silhouette, inner rings are structure. */
export const ring: FormationDef = {
  id: "ring",
  label: "Concentric Rings",
  category: "geometric",
  minRecommended: 50,
  build({ scale }: BuildContext): Vec3[] {
    const c = centre(scale);
    const atRadius = (r: number, count: number) =>
      sampleCurve(count, (t) => {
        const a = t * Math.PI * 2;
        return { x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r, z: 0 };
      });

    return prioritise(
      atRadius(scale, 260),        // outer — defines the shape
      atRadius(scale * 0.66, 190), // middle
      atRadius(scale * 0.33, 120)  // inner
    );
  },
};

/** An expanding spiral. Reads as motion even when held. */
export const spiral: FormationDef = {
  id: "spiral",
  label: "Spiral",
  category: "geometric",
  minRecommended: 50,
  build({ scale }: BuildContext): Vec3[] {
    const c = centre(scale);
    const turns = 3.25;
    const arm = (offset: number, count: number) =>
      sampleCurve(count, (t) => {
        const a = t * Math.PI * 2 * turns + offset;
        const r = scale * (0.12 + 0.88 * t);
        return { x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r, z: 0 };
      });

    return prioritise(arm(0, 300), arm(Math.PI, 300));
  },
};

/** A rippling sheet with real depth — shows the swarm is volumetric. */
export const wave: FormationDef = {
  id: "wave",
  label: "Wave",
  category: "geometric",
  minRecommended: 50,
  build({ scale }: BuildContext): Vec3[] {
    const c = centre(scale);
    const cols = 30;
    const rows = 20;
    const width = scale * 2.1;
    const depth = scale * 1.1;
    const amp = scale * 0.32;

    const pts: Vec3[] = [];
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const u = i / (cols - 1) - 0.5;
        const v = j / (rows - 1) - 0.5;
        pts.push({
          x: c.x + u * width,
          y: c.y + Math.sin(u * Math.PI * 2.2) * amp + Math.cos(v * Math.PI * 1.4) * amp * 0.35,
          z: v * depth,
        });
      }
    }
    return prioritise(pts);
  },
};

/** Wireframe cube. The edges are the whole shape, so there is no fill tier. */
export const cube: FormationDef = {
  id: "cube",
  label: "Cube",
  category: "geometric",
  minRecommended: 100,
  build({ scale }: BuildContext): Vec3[] {
    const c = centre(scale);
    const h = scale * 0.78;
    const corners: Vec3[] = [];
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        for (const sz of [-1, 1]) {
          corners.push({ x: c.x + sx * h, y: c.y + sy * h, z: sz * h });
        }
      }
    }
    // The 12 edges: pairs of corners differing in exactly one axis.
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

    const perEdge = 50;
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
    return prioritise(pts);
  },
};

/** Radial burst. Rays first, then a bright core. */
export const starburst: FormationDef = {
  id: "starburst",
  label: "Starburst",
  category: "geometric",
  minRecommended: 50,
  build({ scale }: BuildContext): Vec3[] {
    const c = centre(scale);
    const rays = 12;
    const perRay = 40;
    const rayPts: Vec3[] = [];
    for (let r = 0; r < rays; r++) {
      const a = (r / rays) * Math.PI * 2;
      for (let i = 0; i < perRay; i++) {
        const t = 0.16 + (i / perRay) * 0.84;
        rayPts.push({ x: c.x + Math.cos(a) * scale * t, y: c.y + Math.sin(a) * scale * t, z: 0 });
      }
    }
    const corePts = sampleCurve(60, (t) => {
      const a = t * Math.PI * 2;
      return { x: c.x + Math.cos(a) * scale * 0.1, y: c.y + Math.sin(a) * scale * 0.1, z: 0 };
    });
    return prioritise(rayPts, corePts);
  },
};
