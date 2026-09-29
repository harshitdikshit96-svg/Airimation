// The recipe: encode, decode, validate.
//
// The recipe is the ONLY durable artefact in this feature. Trajectories are
// never stored — they are regenerated in the browser, deterministically,
// from the recipe plus its pinned library version.
//
// Sharing works by base64url-encoding the recipe into a query parameter, so
// a shared link is entirely self-contained: no database row, no id to
// resolve, nothing that can 404, and it opens as fast as the page loads.
// Short links can be added later as a pure addition that resolves to the
// same encoded string, with ?s= remaining the fallback.

import { DRONE_COUNTS, type DroneCount, type Recipe } from "./types";
import { MAX_SEQUENCE, MAX_TEXT_LENGTH, MIN_SEQUENCE } from "./constants";
import { DEFAULT_SEQUENCE, LIBRARY_VERSION, formationIds } from "./formations";

export const DEFAULT_DRONE_COUNT: DroneCount = 100;

export function defaultRecipe(): Recipe {
  return { v: LIBRARY_VERSION, d: DEFAULT_DRONE_COUNT, s: [...DEFAULT_SEQUENCE] };
}

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const b64 =
    typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(input, "utf-8").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  if (typeof atob === "function") {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(padded, "base64").toString("utf-8");
}

export function encodeRecipe(recipe: Recipe): string {
  return toBase64Url(JSON.stringify(recipe));
}

/**
 * Parse an encoded recipe. Returns null on anything malformed — a bad link
 * must fall back to the default show, never throw at a visitor.
 */
export function decodeRecipe(encoded: string | null | undefined): Recipe | null {
  if (!encoded) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(encoded));
    return validateRecipe(parsed);
  } catch {
    return null;
  }
}

/** Structural validation. Returns a sanitised recipe, or null if unusable. */
export function validateRecipe(input: unknown): Recipe | null {
  if (typeof input !== "object" || input === null) return null;
  const raw = input as Partial<Recipe>;

  const version = typeof raw.v === "number" && raw.v > 0 ? raw.v : LIBRARY_VERSION;

  const count = DRONE_COUNTS.find((c) => c === raw.d);
  if (!count) return null;

  if (!Array.isArray(raw.s)) return null;
  const known = new Set(formationIds(version));
  const sequence = raw.s.filter((id): id is string => typeof id === "string" && known.has(id));
  if (sequence.length < MIN_SEQUENCE) return null;

  const recipe: Recipe = {
    v: version,
    d: count,
    s: sequence.slice(0, MAX_SEQUENCE),
  };

  if (typeof raw.t === "string" && raw.t.trim()) {
    recipe.t = raw.t.trim().slice(0, MAX_TEXT_LENGTH);
  }

  return recipe;
}
