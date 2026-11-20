// Colour palettes a visitor can choose for their show.
//
// Pure data, no three.js: the id travels in the share link (recipe `p`),
// and the OG image and the renderer both read colours from here.
//
// "auto" keeps each formation's own colour scheme (lotus pinks, diya
// flame), which is what every link made before palettes existed shows.

/**
 * How a theme lays its colours on a figure (Design a Show, `applyHues`):
 * a top-to-bottom gradient, hard horizontal bands, rings from the centre,
 * a left-to-right sweep, or confetti (each drone one colour at random).
 */
export type HueMode = "height" | "bands" | "radial" | "sweep" | "scatter";

export type PaletteDef = {
  id: string;
  label: string;
  /** Hex colours, brightest/most dominant first. Empty = per-formation. */
  colors: string[];
  /** Default "height". */
  mode?: HueMode;
};

/**
 * LED themes. Rules (tested, `palettes.test.ts`): every colour vivid — no
 * near-white LEDs (only the Tiranga's white band, by the flag spec) — and
 * no two themes alike: each differs in colours or in how they are laid on.
 * Ids travel in share links: never rename or remove one.
 */
export const PALETTES: PaletteDef[] = [
  { id: "auto", label: "Per formation", colors: [] },
  { id: "holi", label: "Holi", colors: ["#ff2d95", "#ffd400", "#00d26a", "#2d7bff", "#a83dff", "#ff6a00"], mode: "scatter" },
  { id: "rainbow", label: "Rainbow", colors: ["#ff2a2a", "#ff9a00", "#ffe600", "#2bd94a", "#1fa2ff", "#7a3dff"], mode: "bands" },
  { id: "gold", label: "Diwali gold", colors: ["#ffd23a", "#ffa21a", "#ff6a00"] },
  { id: "sunset", label: "Sunset", colors: ["#ffcf3a", "#ff5a2a", "#ff2d7a", "#7a2dff"] },
  { id: "peacock", label: "Peacock", colors: ["#ffd23a", "#00d2a0", "#1f6bff", "#7a2dff"], mode: "radial" },
  { id: "royal", label: "Royal", colors: ["#9b5cff", "#ffc233", "#3d5cff"], mode: "bands" },
  { id: "ice", label: "Moonlight", colors: ["#5fd4ff", "#3d7bff", "#8a6bff"] },
  { id: "aurora", label: "Aurora", colors: ["#2bffa0", "#1fc8ff", "#b43dff"], mode: "sweep" },
  { id: "ocean", label: "Ocean", colors: ["#00e5ff", "#0066ff", "#00ff9c"], mode: "radial" },
  { id: "neon", label: "Neon", colors: ["#ff2bd6", "#2bf0ff", "#c6ff2b"], mode: "bands" },
  { id: "mehendi", label: "Mehendi", colors: ["#3ddc5a", "#b8e62a", "#ff8a1a"], mode: "sweep" },
  { id: "rose", label: "Wedding rose", colors: ["#ff4f9a", "#ff2d6f", "#ffb347"] },
  { id: "candy", label: "Candy", colors: ["#ff5ccf", "#5cc8ff", "#ffe45c"], mode: "scatter" },
  { id: "tricolour", label: "Tiranga", colors: ["#ff9933", "#ffffff", "#2fbf5a"] },
];

export const DEFAULT_PALETTE = "auto";

export function getPalette(id: string | undefined): PaletteDef {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}
