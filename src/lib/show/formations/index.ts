// The formation registry.
//
// LIBRARY VERSIONING — the determinism pin.
//
// A shared link carries the library version it was built against. Bump
// LIBRARY_VERSION only when an EXISTING formation's geometry changes;
// adding a new formation does not require a bump, because no existing
// recipe can reference it.
//
// When it is bumped, the previous generator set must be retained under its
// version key in VERSIONS below, so links already in circulation keep
// rendering what their recipient was shown. This plumbing is deliberately
// in place from v1, when there is nothing yet to retain — retrofitting it
// after links are in the wild is impossible.

import type { FormationDef } from "../types";
import { ring, spiral, wave, cube, starburst } from "./geometric";
import { lotus, diya, om } from "./cultural";

import { heart, text } from "./personal";
import { atom, diamond, globe, helix, knot, pyramid } from "./playful";

export const LIBRARY_VERSION = 1;

const V1: FormationDef[] = [
  ring,
  spiral,
  wave,
  cube,
  starburst,
  globe,
  diamond,
  knot,
  helix,
  atom,
  pyramid,
  lotus,
  diya,
  om,
  heart,
  text,
];

// The SVG-sampled formations (iconic.ts) are all unregistered.
//
// `temple` and `bloom` were tried and removed: the temple read as a flat
// stepped diagram and the lotus as a wobbly outline — both fine as pictures,
// both weak as light shows next to a wireframe that has real depth.
//
// `ganesha` never read at all: six arms, a trident, a crown and jewellery
// competing for the same handful of drones. It needs a far larger fleet or a
// radically simpler silhouette (head, trunk and ears only).
//
// The sampling pipeline itself works and is kept for when better artwork
// arrives — see SHOW_CONFIGURATOR.md.
//
// `ganesha` in ./iconic is working code, but the figure is too complex to
// read at 100–200 points of light: six arms, a trident, a crown and
// jewellery all compete for the same handful of drones. It needs either a
// far larger fleet or a much simpler silhouette (head, trunk and ears only).
//
// `omIcon` is likewise unregistered: the supplied path is a hand-drawn
// approximation, while the font-sampled `om` is the real Unicode glyph and
// is simply more accurate.

const VERSIONS: Record<number, FormationDef[]> = {
  1: V1,
};

/** Formations for a given library version, falling back to the current one. */
export function getLibrary(version: number = LIBRARY_VERSION): FormationDef[] {
  return VERSIONS[version] ?? VERSIONS[LIBRARY_VERSION];
}

export function getFormation(id: string, version: number = LIBRARY_VERSION): FormationDef | undefined {
  return getLibrary(version).find((f) => f.id === id);
}

export function formationIds(version: number = LIBRARY_VERSION): string[] {
  return getLibrary(version).map((f) => f.id);
}

/** What a first-time visitor sees before touching anything. */
export const DEFAULT_SEQUENCE = ["ring", "globe", "spiral", "diamond", "heart"];
