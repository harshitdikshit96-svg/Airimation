// The formations in Design a Show, in showcase order.
//
// Rule: every formation is made from a real 3D model — a museum scan or an
// openly licensed model (scans/), a model we make ourselves in Blender
// (symbols, Ram, the Ram Mandir, the 3D shapes: scans/shapes.ts), or the
// national flag drawn to its official specification (tiranga.ts). No
// hand-drawn figures: if no usable 3D model exists, the formation is out.
//
// Each is an AnimatedFormation (see kit.ts): `build(n)` once per drone
// count, `pose(rig, t, pos, col)` every frame. Used by the showcase and by
// scripts/export-formations.ts.

import type { AnimatedFormation } from "./kit";
import { tiranga } from "./tiranga";
import { SCANS } from "./scans";
import { SKETCHFAB } from "./scans/sketchfab";
import { SHAPE_FORMATIONS } from "./scans/shapes";

export type { AnimatedFormation } from "./kit";
export { SHOW_ALT, THEMES, type Theme } from "./kit";

export const CULTURAL: AnimatedFormation<unknown>[] = [
  tiranga,
  ...SCANS,
  ...SKETCHFAB,
  ...SHAPE_FORMATIONS,
] as AnimatedFormation<unknown>[];

/** Formations that read at a given fleet size (optionally one theme). */
export function formationsFor(drones: number, theme?: string): AnimatedFormation<unknown>[] {
  return CULTURAL.filter((f) => f.minDrones <= drones && (!theme || theme === "all" || f.theme === theme));
}

export function culturalById(id: string): AnimatedFormation<unknown> | undefined {
  return CULTURAL.find((f) => f.id === id);
}

/** True when `build` can run now (its model data is downloaded). */
export function isReady(f: AnimatedFormation<unknown>): boolean {
  return f.isLoaded ? f.isLoaded() : true;
}

/** Fetch a formation's model data, if it has any to fetch. */
export function loadFormation(f: AnimatedFormation<unknown>): Promise<void> {
  return f.load ? f.load() : Promise.resolve();
}

/** Everything (tests, export scripts). */
export function loadAll(): Promise<void> {
  return Promise.all(CULTURAL.map(loadFormation)).then(() => undefined);
}
