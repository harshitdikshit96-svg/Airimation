// Iconic formations sampled from supplied silhouettes.
//
// NOTHING HERE IS REGISTERED. The pipeline works — see svgShape.ts — but
// every figurative silhouette tried so far has lost to a wireframe with real
// depth. Kept so that good artwork can be dropped in without rebuilding the
// machinery. The orphaned pointData/lotusBloomPoints.ts can be deleted.
//
// These are deliberately FLAT and facing the audience. Figurative
// iconography works the way written symbols do: a Ganesha rotating edge-on
// is unreadable for most of its rotation, and real shows present such
// formations square to the crowd. svgShape gives them a slight forward bow
// so they still catch depth rather than reading as a decal.

import type { BuildContext, FormationDef, Vec3 } from "../types";
import { GANESHA, SACRED_OM } from "./svgLibrary";
import { svgPoints, type SvgExtent } from "./svgShape";

function fromSvg(
  shape: Parameters<typeof svgPoints>[0],
  extent: SvgExtent
): (ctx: BuildContext) => Vec3[] {
  return ({ scale }: BuildContext) => svgPoints(shape, scale, extent);
}

export const omIcon: FormationDef = {
  id: "om",
  label: "Om",
  category: "cultural",
  minRecommended: 100,
  build: fromSvg(SACRED_OM, { widthFactor: 1.8, heightFactor: 1.8, bow: 6 }),
};

export const ganesha: FormationDef = {
  id: "ganesha",
  label: "Ganesha",
  category: "cultural",
  // The most detailed silhouette in the library — it needs the drones.
  minRecommended: 200,
  build: fromSvg(GANESHA, { widthFactor: 1.7, heightFactor: 2.0, bow: 6 }),
};

