// The animated cultural formations, in showcase order.
//
// Each is an AnimatedFormation (see kit.ts): `build(n)` once per drone
// count, `pose(rig, t, pos, col)` every frame. Used by the gallery's live
// showcase and by scripts/export-formations.ts.

import type { AnimatedFormation } from "./kit";
import { ganesha } from "./ganesha";
import { shiva } from "./shiva";
import { damru } from "./damru";
import { bowArrow } from "./bow";
import { dragon } from "./dragon";
import { diya, heartbeat, lotusBloom, om, tiranga } from "./small";

export type { AnimatedFormation } from "./kit";
export { SHOW_ALT } from "./kit";

/** Showcase order: small-fleet formations first, the detailed ones after. */
export const CULTURAL: AnimatedFormation<unknown>[] = [
  tiranga, diya, lotusBloom, heartbeat, om, damru, bowArrow, ganesha, shiva, dragon,
] as AnimatedFormation<unknown>[];

/** Formations that read at a given fleet size. */
export function formationsFor(drones: number): AnimatedFormation<unknown>[] {
  return CULTURAL.filter((f) => f.minDrones <= drones);
}

export function culturalById(id: string): AnimatedFormation<unknown> | undefined {
  return CULTURAL.find((f) => f.id === id);
}
