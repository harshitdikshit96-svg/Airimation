// Playful 3D formations.
//
// Everything here is built from LINE STRUCTURES — edges, rings, curves —
// rather than surfaces or filled masses. That is the lesson of everything
// that has worked so far: at 50–500 points of light, a wireframe reads and
// a solid does not. The cube, torus, helix and starburst all succeed for
// this reason; the figurative silhouettes failed for the opposite one.
//
// They are also genuinely volumetric, so orbiting the camera reveals
// structure instead of flattening them.

import type { BuildContext, FormationDef, Vec3 } from "../types";
import { SHOW_CENTRE_ALTITUDE } from "../constants";
import { prioritise, sampleCurve } from "./sampling";
import { fibonacciDirections, rotateX, rotateY, translate } from "./shapes3d";

const lift = (p: Vec3): Vec3 => translate(p, 0, SHOW_CENTRE_ALTITUDE, 0);

/** A wireframe globe — meridians and parallels. Unmistakably a sphere. */
export const globe: FormationDef = {
  id: "globe",
  label: "Globe",
  category: "geometric",
  minRecommended: 100,
  build({ scale, droneCount }: BuildContext): Vec3[] {
    const r = scale * 0.8;
    const meridians = droneCount >= 200 ? 8 : 6;
    const parallels = droneCount >= 200 ? 5 : 3;

    const lines: Vec3[] = [];
    for (let m = 0; m < meridians; m++) {
      const lon = (m / meridians) * Math.PI;
      lines.push(
        ...sampleCurve(40, (t) => {
          const a = t * Math.PI * 2;
          return rotateY({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: 0 }, lon);
        })
      );
    }
    for (let p = 1; p <= parallels; p++) {
      const lat = (p / (parallels + 1)) * Math.PI - Math.PI / 2;
      const ringRadius = Math.cos(lat) * r;
      lines.push(
        ...sampleCurve(36, (t) => {
          const a = t * Math.PI * 2;
          return { x: Math.cos(a) * ringRadius, y: Math.sin(lat) * r, z: Math.sin(a) * ringRadius };
        })
      );
    }
    return prioritise(lines.map(lift));
  },
};

/** A brilliant-cut diamond: crown, girdle and pavilion, as edges. */
export const diamond: FormationDef = {
  id: "diamond",
  label: "Diamond",
  category: "geometric",
  minRecommended: 100,
  build({ scale }: BuildContext): Vec3[] {
    const facets = 8;
    const girdleR = scale * 0.7;
    const girdleY = scale * 0.18;
    const tableR = scale * 0.34;
    const tableY = scale * 0.55;
    const tipY = -scale * 0.85;

    const at = (radius: number, y: number, i: number): Vec3 => {
      const a = (i / facets) * Math.PI * 2;
      return { x: Math.cos(a) * radius, y, z: Math.sin(a) * radius };
    };
    const segment = (from: Vec3, to: Vec3, n: number) =>
      sampleCurve(n, (t) => ({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        z: from.z + (to.z - from.z) * t,
      }));

    const lines: Vec3[] = [];
    // Girdle and table rings.
    for (let i = 0; i < facets; i++) {
      lines.push(...segment(at(girdleR, girdleY, i), at(girdleR, girdleY, i + 1), 12));
      lines.push(...segment(at(tableR, tableY, i), at(tableR, tableY, i + 1), 8));
      // Crown facets and pavilion facets.
      lines.push(...segment(at(girdleR, girdleY, i), at(tableR, tableY, i), 8));
      lines.push(...segment(at(girdleR, girdleY, i), { x: 0, y: tipY, z: 0 }, 16));
    }
    return prioritise(lines.map(lift));
  },
};

/** A torus knot — hypnotic, obviously three-dimensional, and cheap. */
export const knot: FormationDef = {
  id: "knot",
  label: "Torus Knot",
  category: "geometric",
  minRecommended: 100,
  build({ scale }: BuildContext): Vec3[] {
    const p = 2;
    const q = 3;
    const r = scale * 0.52;
    const pts = sampleCurve(420, (t) => {
      const a = t * Math.PI * 2;
      const radius = r * (2 + Math.cos(q * a));
      return {
        x: (radius * Math.cos(p * a)) / 2,
        y: (r * Math.sin(q * a) * 1.25),
        z: (radius * Math.sin(p * a)) / 2,
      };
    });
    return prioritise(pts.map(lift));
  },
};

/** A DNA double helix with rungs — reads instantly, and it rotates well. */
export const helix: FormationDef = {
  id: "helix",
  label: "Double Helix",
  category: "geometric",
  minRecommended: 100,
  build({ scale, droneCount }: BuildContext): Vec3[] {
    // Wider and shorter than the first attempt, which was so narrow it read
    // as a single coiled spring rather than two strands winding around
    // each other.
    const turns = 2.4;
    const r = scale * 0.58;
    const height = scale * 1.5;
    const strand = (offset: number, n: number) =>
      sampleCurve(n, (t) => {
        const a = t * Math.PI * 2 * turns + offset;
        return { x: Math.cos(a) * r, y: -height / 2 + t * height, z: Math.sin(a) * r };
      });

    const strands = [...strand(0, 150), ...strand(Math.PI, 150)];

    // Rungs between the strands — the detail that makes it read as DNA
    // rather than two unrelated spirals. Fewer of them at low counts.
    const rungCount = droneCount >= 200 ? 12 : 7;
    const rungs: Vec3[] = [];
    for (let i = 0; i < rungCount; i++) {
      const t = (i + 0.5) / rungCount;
      const a = t * Math.PI * 2 * turns;
      const y = -height / 2 + t * height;
      for (let k = 0; k < 6; k++) {
        const f = k / 5;
        rungs.push({
          x: Math.cos(a) * r * (1 - 2 * f),
          y,
          z: Math.sin(a) * r * (1 - 2 * f),
        });
      }
    }
    return prioritise(strands.map(lift), rungs.map(lift));
  },
};

/** An atom: three tilted orbital rings around a nucleus. */
export const atom: FormationDef = {
  id: "atom",
  label: "Atom",
  category: "geometric",
  minRecommended: 100,
  build({ scale }: BuildContext): Vec3[] {
    const r = scale * 0.78;
    const rings: Vec3[] = [];
    const tilts: [number, number][] = [
      [0, 0],
      [Math.PI / 3, Math.PI / 3],
      [-Math.PI / 3, (2 * Math.PI) / 3],
    ];
    for (const [tiltX, spinY] of tilts) {
      rings.push(
        ...sampleCurve(90, (t) => {
          const a = t * Math.PI * 2;
          const base: Vec3 = { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.42, z: Math.sin(a) * r };
          return rotateY(rotateX(base, tiltX), spinY);
        })
      );
    }
    const nucleus = fibonacciDirections(24).map((d) => ({
      x: d.x * scale * 0.11,
      y: d.y * scale * 0.11,
      z: d.z * scale * 0.11,
    }));
    return prioritise(rings.map(lift), nucleus.map(lift));
  },
};

/** A square pyramid — simple, monumental, and reads from any angle. */
export const pyramid: FormationDef = {
  id: "pyramid",
  label: "Pyramid",
  category: "geometric",
  minRecommended: 50,
  build({ scale }: BuildContext): Vec3[] {
    const half = scale * 0.8;
    const baseY = -scale * 0.6;
    const apex: Vec3 = { x: 0, y: scale * 0.85, z: 0 };
    const corners: Vec3[] = [
      { x: -half, y: baseY, z: -half },
      { x: half, y: baseY, z: -half },
      { x: half, y: baseY, z: half },
      { x: -half, y: baseY, z: half },
    ];
    const segment = (from: Vec3, to: Vec3, n: number) =>
      sampleCurve(n, (t) => ({
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        z: from.z + (to.z - from.z) * t,
      }));

    const lines: Vec3[] = [];
    for (let i = 0; i < 4; i++) {
      lines.push(...segment(corners[i], corners[(i + 1) % 4], 26));
      lines.push(...segment(corners[i], apex, 30));
    }
    return prioritise(lines.map(lift));
  },
};
