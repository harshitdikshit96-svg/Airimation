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

export type { AnimatedFormation } from "./kit";
export { SHOW_ALT } from "./kit";

export const CULTURAL: AnimatedFormation<unknown>[] = [ganesha, shiva, damru, bowArrow, dragon] as AnimatedFormation<unknown>[];

export function culturalById(id: string): AnimatedFormation<unknown> | undefined {
  return CULTURAL.find((f) => f.id === id);
}
