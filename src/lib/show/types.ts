// Core types for the show configurator.
//
// Everything in `src/lib/show/` is pure and framework-free: no React, no
// three.js. The renderer consumes these types but nothing here knows the
// renderer exists. That boundary is what keeps the geometry testable.

/** A point in the show volume, in METRES. See constants.ts for the frame. */
export type Vec3 = { x: number; y: number; z: number };

/**
 * Drone counts offered to the visitor.
 *
 * Airimation's Year-1 fleet is 100 drones, so 100 is the default and the
 * honest centre of the range. 200 is offered for larger events and is
 * labelled as arranged in advance — see `COUNT_NOTES` in constants.ts.
 * Deliberately a fixed set, not free numeric entry: the point is comparison
 * between meaningfully different scales, not fine-tuning.
 */
export const DRONE_COUNTS = [50, 100, 200] as const;
export type DroneCount = (typeof DRONE_COUNTS)[number];

export type FormationCategory = "geometric" | "cultural" | "personal";

/**
 * The durable artefact. Everything else is derived from it.
 *
 * Keys are single letters because this object is JSON-encoded into a URL
 * query parameter — see recipe.ts. Do not rename them without bumping the
 * encoding and handling old links.
 */
export type Recipe = {
  /** Formation library version. The determinism pin — see formations/index.ts. */
  v: number;
  /** Drone count. */
  d: DroneCount;
  /** Ordered formation ids. */
  s: string[];
  /** Text for a personalising formation, if the sequence includes one. */
  t?: string;
};

/** Context handed to a formation's build function. */
export type BuildContext = {
  /** Characteristic size of the show volume in metres. */
  scale: number;
  /** Visitor-supplied text, for personalising formations. */
  text?: string;
  /** Seeded PRNG. Never use Math.random() in a generator — determinism. */
  rand: () => number;
};

export type FormationDef = {
  id: string;
  label: string;
  category: FormationCategory;
  /**
   * Below this count the formation stops reading clearly. The UI shows an
   * advisory rather than hiding it, so the visitor learns *why* drone count
   * matters — which is the whole purpose of the tool.
   */
  minRecommended: DroneCount;
  /** True if this formation consumes `ctx.text`. */
  personalises?: boolean;
  /**
   * Returns a DENSE canonical point set (CANONICAL_POINTS long), ordered by
   * visual priority: defining silhouette first, interior fill last. Taking
   * the first `n` points must yield a recognisable formation at any n.
   * See formations/sampling.ts for the ordering helpers.
   */
  build(ctx: BuildContext): Vec3[];
};

/** One formation within a planned show. */
export type Stage = {
  id: string;
  label: string;
  /** n × 3 positions in metres, flattened. */
  targets: Float32Array;
  /** Milliseconds spent travelling into this formation from the previous one. */
  assembleMs: number;
  /** Milliseconds held once assembled. */
  holdMs: number;
  /** Absolute ms from show start at which assembly begins. */
  startMs: number;
};

/** The derived, in-memory show. Never persisted. */
export type ShowPlan = {
  recipe: Recipe;
  droneCount: number;
  stages: Stage[];
  totalDurationMs: number;
};
