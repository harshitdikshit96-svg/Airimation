/**
 * Phones: viewport narrower than Tailwind's `md` (48rem = 768 px), in any
 * orientation. Phones get the full site (since 25 Nov 2026); the home scene
 * runs at the low quality tier there (HomeSwarmLoader).
 */
export const PHONE_QUERY = "(width < 48rem)";

export function isPhone(): boolean {
  return typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;
}
