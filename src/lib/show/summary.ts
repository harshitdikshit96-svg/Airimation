// Human-readable description of a recipe: one source for the share page
// title, the WhatsApp/OG preview and the prefilled quote request.

import type { Recipe } from "./types";
import { getFormation } from "./formations";
import { getPalette } from "./palettes";

export type RecipeSummary = {
  droneCount: number;
  formations: string[];
  text?: string;
  palette: string;
  /** "200 drones · Ring → Lotus → Heart" */
  line: string;
};

export function describeRecipe(recipe: Recipe): RecipeSummary {
  const formations = recipe.s.map((id) =>
    id === "text" && recipe.t ? `“${recipe.t}”` : (getFormation(id, recipe.v)?.label ?? id)
  );
  const palette = getPalette(recipe.p).label;
  return {
    droneCount: recipe.d,
    formations,
    text: recipe.t,
    palette,
    line: `${recipe.d} drones · ${formations.join(" → ")}`,
  };
}

export function sharePath(code: string): string {
  return `/design-your-show/s/${code}`;
}
