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

export const LIBRARY_VERSION = 1;

const V1: FormationDef[] = [
  ring,
  spiral,
  wave,
  cube,
  starburst,
  lotus,
  diya,
  om,
  heart,
  text,
];

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
export const DEFAULT_SEQUENCE = ["ring", "lotus", "spiral", "heart"];
