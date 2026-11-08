// Physical and temporal constants for the show configurator.
//
// COORDINATE FRAME — a deliberate break from the 2D swarm code in
// `swarmShapes.ts`, which works in normalised 0..1
// space and needs an `aspect` correction to stop circles rendering as
// ellipses. Here everything is in METRES:
//
//   x — lateral, positive right, origin at show centre
//   y — altitude, positive up, 0 = ground
//   z — depth, positive towards the audience
//
// A circle in metres is a circle from every camera angle, so the whole class
// of aspect-ratio distortion bugs (the "ring looked like an eclipse" one)
// cannot occur. It also makes scale truthful, which is the point of the tool:
// if it says 100 drones, the formation is the size 100 drones would make.
//
// These figures are estimates pending a check against a real Biscope show
// plan. They are all in one place so that check is a single edit.

/** Characteristic radius of a formation, in metres. */
export const SHOW_SCALE = 45;

/** Altitude of the centre of the show volume, in metres. */
export const SHOW_CENTRE_ALTITUDE = 85;

/** Hard altitude floor for any drone, in metres. Nothing is drawn below it. */
export const MIN_ALTITUDE = 25;

/** Camera defaults — an audience member's eye, not a god view. */
export const CAMERA = {
  /** Metres back from the show volume, along +z. */
  distance: 200,
  /** Eye height in metres. */
  eyeHeight: 6,
  fov: 50,
  minDistance: 110,
  maxDistance: 380,
  /**
   * The orbit target sits well below the formation, at roughly the height a
   * spectator's gaze rests, so the swarm occupies the upper part of the
   * frame the way a real show does rather than being centred like a logo.
   */
  targetAltitude: 50,
  /**
   * Polar angle is measured from +Y. Anything past 90 degrees puts the
   * camera BELOW the target — which is the normal case here, because the
   * audience stands on the ground and looks up. An earlier 88-degree cap
   * silently clamped the camera above the target and wrecked the framing.
   */
  minPolarAngleDeg: 6,
  /** Hard floor so orbiting can never put the eye underground. */
  minEyeHeight: 2.5,
};

/** Timing, in milliseconds. */
export const TIMING = {
  assembleMs: 4200,
  holdMs: 3400,
  /** Fraction of the assemble window over which per-drone starts are staggered. */
  staggerFraction: 0.15,
  /** Peak extra altitude on the transition arc, in metres. */
  arcHeight: 14,
};

/** Sequence length bounds. */
export const MIN_SEQUENCE = 3;
export const MAX_SEQUENCE = 6;

/** Maximum characters accepted by a personalising formation. */
export const MAX_TEXT_LENGTH = 16;

/**
 * Size of the dense canonical point set every formation generates. Rendering
 * at n drones takes the first n. Must exceed the largest supported count with
 * room to spare, so the priority ordering has something to discard.
 */
export const CANONICAL_POINTS = 600;

/** Advisory copy shown next to each drone count. */
export const COUNT_NOTES: Record<number, string> = {
  50: "Intimate events and smaller venues",
  100: "Our standard fleet — most events",
  200: "Large public events, arranged in advance",
  300: "Flagship scale — full detail, arranged well in advance",
};
