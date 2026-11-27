// Formation pages (docs/seo/PLAN.md §2): the library joined to its page copy,
// as small serialisable records. Server side only (route files, sitemap):
// it imports the whole library. Client components get these records as
// props, never the library itself.

import { CULTURAL, THEMES } from "./index";
import { FORMATION_PAGES, type FormationPage } from "./pages";

export type FormationFacts = FormationPage & {
  id: string;
  label: string;
  /** Short line from the library (the overlay on the sky). */
  blurb: string;
  themeId: string;
  themeLabel: string;
  minDrones: number;
};

export const FORMATION_PATH = "/design-your-show";
export const formationPath = (id: string) => `${FORMATION_PATH}/${id}`;

let cache: FormationFacts[] | null = null;

/** Every Design a Show formation that has a page, in showcase order. */
export function allFormationFacts(): FormationFacts[] {
  if (cache) return cache;
  cache = CULTURAL.filter((f) => FORMATION_PAGES[f.id]).map((f) => {
    const theme = THEMES.find((t) => t.id === f.theme);
    return {
      ...FORMATION_PAGES[f.id],
      id: f.id,
      label: f.label,
      blurb: f.blurb,
      themeId: f.theme ?? "other",
      themeLabel: theme?.label ?? "Other",
      minDrones: f.minDrones,
    };
  });
  return cache;
}

export function formationFacts(id: string): FormationFacts | undefined {
  return allFormationFacts().find((f) => f.id === id);
}

/** Up to `n` others from the same theme, then from the rest — for internal links. */
export function relatedFormations(id: string, n = 6): FormationFacts[] {
  const all = allFormationFacts();
  const self = all.find((f) => f.id === id);
  if (!self) return [];
  const same = all.filter((f) => f.id !== id && f.themeId === self.themeId);
  const rest = all.filter((f) => f.id !== id && f.themeId !== self.themeId);
  return [...same, ...rest].slice(0, n);
}

/** Share image for a formation page (scripts/compress-formation-pages.mjs). */
export const formationOgImage = (id: string) => `/renders/og/${id}.jpg`;
/** Still shown on the page (same script). */
export const formationStill = (id: string) => `/renders/f/${id}.webp`;
