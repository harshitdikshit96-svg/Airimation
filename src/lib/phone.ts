/**
 * Phones: viewport narrower than Tailwind's `md` (48rem = 768 px), in any
 * orientation. Below it the site shows only the phone gate — the dusk scene
 * with a note to open the site on a bigger screen (DECISIONS.md §2). The
 * CSS side of the same rule is `@media (width < 48rem)` in globals.css.
 */
export const PHONE_QUERY = "(width < 48rem)";

export function isPhone(): boolean {
  return typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;
}
