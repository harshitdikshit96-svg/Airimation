/**
 * Height of the Design a Show sky: the first screen less the header (64 px)
 * and the control dock under it (3 rows of 44 px, 12 px apart, 16 px
 * padding = 188 px), so every control is visible without scrolling.
 * Shared with the loading placeholder so nothing jumps when the 3D loads.
 */
export const SKY_HEIGHT = "h-[calc(100svh-64px-188px)] min-h-[400px]";
