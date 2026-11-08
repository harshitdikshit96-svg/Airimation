// Colour palettes a visitor can choose for their show.
//
// Pure data, no three.js: the id travels in the share link (recipe `p`),
// and the OG image and the renderer both read colours from here.
//
// "auto" keeps each formation's own colour scheme (lotus pinks, diya
// flame), which is what every link made before palettes existed shows.

export type PaletteDef = {
  id: string;
  label: string;
  /** Hex colours, brightest/most dominant first. Empty = per-formation. */
  colors: string[];
};

export const PALETTES: PaletteDef[] = [
  { id: "auto", label: "Per formation", colors: [] },
  { id: "gold", label: "Diwali gold", colors: ["#ffd27a", "#ffb347", "#fff1d0"] },
  { id: "royal", label: "Royal", colors: ["#b48cff", "#ffcf6e", "#6f8cff"] },
  { id: "ice", label: "Moonlight", colors: ["#e8f4ff", "#8fd3ff", "#ffffff"] },
  { id: "tricolour", label: "Tiranga", colors: ["#ff9933", "#ffffff", "#2fbf5a"] },
  { id: "rose", label: "Wedding rose", colors: ["#ff8fb8", "#ffd6e5", "#ffcf6e"] },
];

export const DEFAULT_PALETTE = "auto";

export function getPalette(id: string | undefined): PaletteDef {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}
